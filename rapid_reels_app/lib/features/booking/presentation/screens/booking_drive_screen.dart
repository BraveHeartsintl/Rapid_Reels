import 'dart:io';

import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:video_player/video_player.dart';

import '../../../../core/firebase/models/firebase_booking_model.dart';
import '../../../../core/firebase/models/firebase_booking_drive_model.dart';
import '../../../../core/firebase/models/firebase_reel_model.dart';
import '../../../../core/firebase/services/firestore_service.dart';
import '../../../../shared/widgets/firebase_storage_image.dart';

enum BookingDriveScreenRole { provider, admin, customer }

class BookingDriveScreen extends StatefulWidget {
  final String bookingId;
  final String actorId;
  final BookingDriveScreenRole role;

  const BookingDriveScreen({
    super.key,
    required this.bookingId,
    required this.actorId,
    required this.role,
  });

  @override
  State<BookingDriveScreen> createState() => _BookingDriveScreenState();
}

class _BookingDriveScreenState extends State<BookingDriveScreen> {
  final _firestore = FirestoreService();
  final _storage = FirebaseStorage.instance;
  final _picker = ImagePicker();
  static const Set<String> _imageExtensions = <String>{
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'bmp',
    'heic',
    'heif',
  };
  static const Set<String> _videoExtensions = <String>{
    'mp4',
    'mov',
    'm4v',
    'webm',
    'mkv',
    'avi',
    '3gp',
    'mpeg',
    'mpg',
  };
  BookingDriveFolderType _selectedFolder = BookingDriveFolderType.original;
  bool _gridView = true;
  bool _uploading = false;
  bool _creatingShareLink = false;
  bool _publishEditedVideosToReels = false;
  final Map<String, Future<String>> _urlCache = <String, Future<String>>{};
  FirebaseBookingModel? _bookingCache;

  @override
  void initState() {
    super.initState();
    if (widget.role == BookingDriveScreenRole.customer) {
      _selectedFolder = BookingDriveFolderType.edited;
    }
    _firestore.ensureBookingDriveMeta(widget.bookingId);
  }

  bool get _canShareLink =>
      widget.role == BookingDriveScreenRole.admin ||
      widget.role == BookingDriveScreenRole.provider;

  bool get _canToggleCustomerShare =>
      widget.role == BookingDriveScreenRole.admin;

  bool _canUploadTo(BookingDriveFolderType folderType) {
    if (widget.role == BookingDriveScreenRole.provider) {
      return folderType == BookingDriveFolderType.original;
    }
    if (widget.role == BookingDriveScreenRole.admin) {
      return folderType == BookingDriveFolderType.edited;
    }
    return false;
  }

  BookingDriveActorRole get _actorRole {
    switch (widget.role) {
      case BookingDriveScreenRole.admin:
        return BookingDriveActorRole.admin;
      case BookingDriveScreenRole.customer:
        return BookingDriveActorRole.customer;
      case BookingDriveScreenRole.provider:
        return BookingDriveActorRole.provider;
    }
  }

  String _folderStoragePrefix(BookingDriveFolderType folderType) {
    final folderName = folderType == BookingDriveFolderType.original
        ? 'original_photos_videos'
        : 'edited_deliverables';
    return 'bookings/${widget.bookingId}/$folderName';
  }

  Future<String> _resolveDownloadUrl(FirebaseBookingDriveFileModel file) {
    return _urlCache.putIfAbsent(file.fileId, () async {
      try {
        return await _storage.ref(file.storagePath).getDownloadURL();
      } catch (_) {
        return file.downloadUrl;
      }
    });
  }

  Future<void> _uploadFiles() async {
    if (!_canUploadTo(_selectedFolder) || _uploading) return;
    final picked = await _picker.pickMultipleMedia();
    if (picked.isEmpty) return;
    final shouldPublishUploadedVideos =
        widget.role == BookingDriveScreenRole.admin &&
        _selectedFolder == BookingDriveFolderType.edited &&
        _publishEditedVideosToReels;

    setState(() => _uploading = true);
    try {
      for (final file in picked) {
        final millis = DateTime.now().millisecondsSinceEpoch;
        final safeName = file.name.replaceAll(' ', '_');
        final storagePath =
            '${_folderStoragePrefix(_selectedFolder)}/${millis}_$safeName';
        final storageRef = _storage.ref(storagePath);
        final inferredContentType = _guessContentType(file.name);
        final metadata = SettableMetadata(contentType: inferredContentType);

        UploadTask uploadTask;
        if (kIsWeb) {
          final bytes = await file.readAsBytes();
          uploadTask = storageRef.putData(bytes, metadata);
        } else {
          uploadTask = storageRef.putFile(File(file.path), metadata);
        }
        final result = await uploadTask;
        final downloadUrl = await result.ref.getDownloadURL();
        final metadataContentType = result.metadata?.contentType;
        final contentType =
            (metadataContentType != null && metadataContentType.isNotEmpty)
            ? metadataContentType
            : inferredContentType;
        final size = result.metadata?.size ?? 0;
        final model = FirebaseBookingDriveFileModel(
          fileId: '',
          bookingId: widget.bookingId,
          folderType: _selectedFolder,
          storagePath: storagePath,
          downloadUrl: downloadUrl,
          fileName: file.name,
          mimeType: contentType,
          sizeBytes: size,
          uploadedByRole: _actorRole,
          uploadedById: widget.actorId,
          uploadedAt: DateTime.now(),
          isDeleted: false,
        );
        await _firestore.upsertBookingDriveFile(model);
        await _maybeCreateReelFromUploadedVideo(
          uploadedFile: model,
          fallbackContentType: inferredContentType,
          shouldPublishToReels: shouldPublishUploadedVideos,
        );
      }
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Files uploaded successfully')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Upload failed: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  Future<void> _toggleShare(
    FirebaseBookingDriveMetaModel meta,
    bool value,
  ) async {
    try {
      await _firestore.setBookingDriveShareStatus(
        bookingId: widget.bookingId,
        isSharedWithCustomer: value,
        adminUserId: widget.actorId,
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unable to update share status: $e')),
      );
    }
  }

  Future<void> _deleteFile(FirebaseBookingDriveFileModel file) async {
    try {
      await _firestore.softDeleteBookingDriveFile(
        bookingId: file.bookingId,
        fileId: file.fileId,
      );
      await _storage.ref(file.storagePath).delete();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Could not remove file: $e')));
    }
  }

  Future<void> _downloadFile(FirebaseBookingDriveFileModel file) async {
    try {
      final url = await _resolveDownloadUrl(file);
      final uri = Uri.parse(url);
      final launched = await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
      if (!launched && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Unable to open download link')),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Download failed: $e')));
    }
  }

  Future<String> _getBookingShareLink() async {
    if (!_canShareLink || _creatingShareLink) {
      throw StateError('Share unavailable');
    }
    setState(() => _creatingShareLink = true);
    try {
      final shareLink = await _firestore.createOrGetBookingShareLink(
        bookingId: widget.bookingId,
      );
      return shareLink;
    } catch (e) {
      if (!mounted) {
        throw Exception('Unable to generate share link');
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unable to generate share link: $e')),
      );
      rethrow;
    } finally {
      if (mounted) {
        setState(() => _creatingShareLink = false);
      }
    }
  }

  Future<void> _showShareOptions() async {
    if (!_canShareLink || _creatingShareLink) return;
    String link;
    try {
      link = await _getBookingShareLink();
    } catch (_) {
      return;
    }
    if (!mounted || link.isEmpty) return;

    await showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (sheetContext) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Share booking link',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 10),
                SelectableText(link, maxLines: 3),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () async {
                          final messenger = ScaffoldMessenger.of(context);
                          await Clipboard.setData(ClipboardData(text: link));
                          if (sheetContext.mounted) {
                            Navigator.pop(sheetContext);
                          }
                          messenger.showSnackBar(
                            const SnackBar(content: Text('Link copied')),
                          );
                        },
                        icon: const Icon(Icons.copy_outlined),
                        label: const Text('Copy link'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () async {
                          Navigator.pop(sheetContext);
                          await Share.share(
                            link,
                            subject: 'Booking ${widget.bookingId} media',
                          );
                        },
                        icon: const Icon(Icons.share_outlined),
                        label: const Text('Share'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Booking Drive ${widget.bookingId}'),
        actions: [
          IconButton(
            tooltip: _gridView ? 'List view' : 'Grid view',
            onPressed: () => setState(() => _gridView = !_gridView),
            icon: Icon(_gridView ? Icons.view_list : Icons.grid_view),
          ),
          if (_canUploadTo(_selectedFolder))
            IconButton(
              tooltip: 'Upload files',
              onPressed: _uploading ? null : _uploadFiles,
              icon: _uploading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.upload_file),
            ),
          if (_canShareLink)
            IconButton(
              tooltip: _creatingShareLink
                  ? 'Generating share link...'
                  : 'Share booking',
              onPressed: _creatingShareLink ? null : _showShareOptions,
              icon: _creatingShareLink
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.share_outlined),
            ),
        ],
      ),
      body: Column(
        children: [
          _buildFolderBar(),
          StreamBuilder<FirebaseBookingDriveMetaModel?>(
            stream: _firestore.streamBookingDriveMeta(widget.bookingId),
            builder: (context, snapshot) {
              final meta = snapshot.data;
              if (!_canToggleCustomerShare) {
                return const SizedBox.shrink();
              }
              return Column(
                children: [
                  if (meta != null)
                    SwitchListTile(
                      title: const Text('Share with customer'),
                      subtitle: Text(
                        meta.isSharedWithCustomer
                            ? 'Customer can view booking files'
                            : 'Customer access is blocked until approval',
                      ),
                      value: meta.isSharedWithCustomer,
                      onChanged: (value) => _toggleShare(meta, value),
                    ),
                  if (_selectedFolder == BookingDriveFolderType.edited)
                    SwitchListTile(
                      title: const Text('Publish edited uploads to Reels'),
                      subtitle: const Text(
                        'When enabled, uploaded edited videos will also appear in public Reels.',
                      ),
                      value: _publishEditedVideosToReels,
                      onChanged: (value) {
                        setState(() => _publishEditedVideosToReels = value);
                      },
                    ),
                ],
              );
            },
          ),
          Expanded(
            child: StreamBuilder<List<FirebaseBookingDriveFileModel>>(
              stream: _firestore.streamBookingDriveFiles(
                widget.bookingId,
                folderType: widget.role == BookingDriveScreenRole.customer
                    ? BookingDriveFolderType.edited
                    : _selectedFolder,
              ),
              builder: (context, snapshot) {
                if (snapshot.hasError) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Text(
                        'Could not load files: ${snapshot.error}',
                        textAlign: TextAlign.center,
                      ),
                    ),
                  );
                }
                final files =
                    snapshot.data ?? const <FirebaseBookingDriveFileModel>[];
                if (files.isEmpty) {
                  return const Center(
                    child: Text('No files in this folder yet.'),
                  );
                }
                if (_gridView) {
                  return GridView.builder(
                    padding: const EdgeInsets.all(12),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 1.25,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                        ),
                    itemCount: files.length,
                    itemBuilder: (context, index) =>
                        _buildFileTile(files[index]),
                  );
                }
                return ListView.separated(
                  padding: const EdgeInsets.all(12),
                  itemBuilder: (context, index) => _buildFileRow(files[index]),
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemCount: files.length,
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFolderBar() {
    if (widget.role == BookingDriveScreenRole.customer) {
      return const Padding(
        padding: EdgeInsets.fromLTRB(12, 12, 12, 4),
        child: Align(
          alignment: Alignment.centerLeft,
          child: Text('Booking > Drive > edited_deliverables'),
        ),
      );
    }
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Booking > Drive'),
          const SizedBox(height: 8),
          Row(
            children: [
              _folderChip(
                label: 'original_photos_videos',
                folderType: BookingDriveFolderType.original,
              ),
              const SizedBox(width: 8),
              _folderChip(
                label: 'edited_deliverables',
                folderType: BookingDriveFolderType.edited,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _folderChip({
    required String label,
    required BookingDriveFolderType folderType,
  }) {
    final selected = _selectedFolder == folderType;
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => setState(() => _selectedFolder = folderType),
    );
  }

  Widget _buildFileRow(FirebaseBookingDriveFileModel file) {
    final canDelete = _canUploadTo(file.folderType);
    return ListTile(
      leading: _buildMediaThumb(file, size: 44),
      title: Text(file.fileName, maxLines: 1, overflow: TextOverflow.ellipsis),
      subtitle: Text(
        '${(file.sizeBytes / (1024 * 1024)).toStringAsFixed(2)} MB · ${bookingDriveActorRoleToString(file.uploadedByRole)}',
      ),
      trailing: canDelete
          ? IconButton(
              onPressed: () => _deleteFile(file),
              icon: const Icon(Icons.delete_outline),
            )
          : IconButton(
              onPressed: () => _downloadFile(file),
              icon: const Icon(Icons.download_outlined),
            ),
      onTap: () => _showFilePreview(file),
    );
  }

  Widget _buildFileTile(FirebaseBookingDriveFileModel file) {
    final canDelete = _canUploadTo(file.folderType);
    return InkWell(
      onTap: () => _showFilePreview(file),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _buildMediaThumb(file, size: 34),
                  const Spacer(),
                  if (canDelete)
                    IconButton(
                      onPressed: () => _deleteFile(file),
                      icon: const Icon(Icons.delete_outline, size: 18),
                    )
                  else
                    IconButton(
                      onPressed: () => _downloadFile(file),
                      icon: const Icon(Icons.download_outlined, size: 18),
                    ),
                ],
              ),
              const Spacer(),
              Text(
                file.fileName,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 6),
              Text(
                '${(file.sizeBytes / (1024 * 1024)).toStringAsFixed(2)} MB',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _showFilePreview(FirebaseBookingDriveFileModel file) async {
    if (!mounted) return;
    await showDialog<void>(
      context: context,
      builder: (context) => Dialog(
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxWidth: 420,
            maxHeight: MediaQuery.of(context).size.height * 0.85,
          ),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  file.fileName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                Flexible(
                  child: SingleChildScrollView(
                    child: _buildPreviewContent(file),
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton.icon(
                      onPressed: () => _downloadFile(file),
                      icon: const Icon(Icons.download_outlined),
                      label: const Text('Download'),
                    ),
                    if (_canShareLink)
                      TextButton.icon(
                        onPressed: _creatingShareLink
                            ? null
                            : _showShareOptions,
                        icon: _creatingShareLink
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(Icons.share_outlined),
                        label: const Text('Share'),
                      ),
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Close'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  IconData _iconForMime(String mime) {
    if (mime.startsWith('image/')) return Icons.image;
    if (mime.startsWith('video/')) return Icons.videocam;
    return Icons.insert_drive_file;
  }

  Widget _buildMediaThumb(
    FirebaseBookingDriveFileModel file, {
    required double size,
  }) {
    if (_isImageFile(file)) {
      return FutureBuilder<String>(
        future: _resolveDownloadUrl(file),
        builder: (context, snapshot) {
          final url = snapshot.data;
          if (url == null || url.isEmpty) return _thumbFallback(file, size);
          return ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: FirebaseStorageImage(
              url: url,
              width: size,
              height: size,
              fit: BoxFit.cover,
              placeholder: SizedBox(
                width: size,
                height: size,
                child: const Center(
                  child: SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                ),
              ),
              errorWidget: _thumbFallback(file, size),
            ),
          );
        },
      );
    }
    return _thumbFallback(file, size);
  }

  Widget _thumbFallback(FirebaseBookingDriveFileModel file, double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Icon(_iconForFile(file), size: size * 0.55),
    );
  }

  Widget _buildPreviewContent(FirebaseBookingDriveFileModel file) {
    if (_isImageFile(file)) {
      return FutureBuilder<String>(
        future: _resolveDownloadUrl(file),
        builder: (context, snapshot) {
          final url = snapshot.data;
          if (url == null || url.isEmpty) {
            return const Center(child: Text('Unable to load image preview.'));
          }
          return AspectRatio(
            aspectRatio: 1,
            child: InteractiveViewer(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: FirebaseStorageImage(
                  url: url,
                  fit: BoxFit.contain,
                  placeholder: const Center(
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                  errorWidget: const Center(
                    child: Text('Unable to load image preview.'),
                  ),
                ),
              ),
            ),
          );
        },
      );
    }

    if (_isVideoFile(file)) {
      return FutureBuilder<String>(
        future: _resolveDownloadUrl(file),
        builder: (context, snapshot) {
          final url = snapshot.data;
          if (url == null || url.isEmpty) {
            return const Center(child: Text('Unable to load video preview.'));
          }
          return _VideoPreviewPlayer(videoUrl: url);
        },
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(_iconForFile(file)),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                file.fileName,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        FutureBuilder<String>(
          future: _resolveDownloadUrl(file),
          builder: (context, snapshot) {
            final url = snapshot.data ?? file.downloadUrl;
            return SelectableText(url);
          },
        ),
      ],
    );
  }

  String _guessContentType(String fileName) {
    final ext = _extractExtension(fileName);
    if (ext == null) return 'application/octet-stream';
    if (_imageExtensions.contains(ext)) {
      if (ext == 'jpg') return 'image/jpeg';
      return 'image/$ext';
    }
    if (_videoExtensions.contains(ext)) {
      if (ext == 'mpg' || ext == 'mpeg') return 'video/mpeg';
      if (ext == '3gp') return 'video/3gpp';
      return 'video/$ext';
    }
    return 'application/octet-stream';
  }

  Future<FirebaseBookingModel?> _loadBooking() async {
    _bookingCache ??= await _firestore.getBooking(widget.bookingId);
    return _bookingCache;
  }

  Future<void> _maybeCreateReelFromUploadedVideo({
    required FirebaseBookingDriveFileModel uploadedFile,
    required String fallbackContentType,
    required bool shouldPublishToReels,
  }) async {
    if (!shouldPublishToReels) return;
    final effectiveContentType = uploadedFile.mimeType.isNotEmpty
        ? uploadedFile.mimeType
        : fallbackContentType;
    final looksLikeVideo = effectiveContentType.toLowerCase().startsWith(
      'video/',
    );
    if (!looksLikeVideo) return;

    try {
      final booking = await _loadBooking();
      if (booking == null) return;
      final format = _bestKnownExtension(uploadedFile);
      final reel = FirebaseReelModel(
        reelId: '',
        bookingId: widget.bookingId,
        customerId: booking.customerId,
        providerId: booking.providerId,
        eventType: booking.eventType,
        eventName: booking.eventName,
        title: uploadedFile.fileName,
        description: 'Auto-created from edited deliverable upload',
        videoUrl: uploadedFile.downloadUrl,
        thumbnailUrl: uploadedFile.thumbnailUrl ?? '',
        duration: 0,
        status: 'delivered',
        metadata: ReelMetadata(
          editingStyle: 'standard',
          quality: '1080p',
          fileSize: uploadedFile.sizeBytes,
          format: format,
        ),
        analytics: ReelAnalytics(),
        isPublic: false,
        moderationStatus: 'pending_review',
        isFeatured: false,
        createdAt: DateTime.now(),
        deliveredAt: DateTime.now(),
        publishedAt: null,
      );
      await _firestore.createReel(reel);
      debugPrint(
        'BookingDrive: auto-created reel from upload ${uploadedFile.fileName}',
      );
    } catch (e) {
      // Reel creation is best-effort and should not block file uploads.
      debugPrint('BookingDrive: reel auto-create failed: $e');
    }
  }

  bool _isImageFile(FirebaseBookingDriveFileModel file) {
    if (file.mimeType.toLowerCase().startsWith('image/')) return true;
    final ext = _bestKnownExtension(file);
    return ext != null && _imageExtensions.contains(ext);
  }

  bool _isVideoFile(FirebaseBookingDriveFileModel file) {
    if (file.mimeType.toLowerCase().startsWith('video/')) return true;
    final ext = _bestKnownExtension(file);
    return ext != null && _videoExtensions.contains(ext);
  }

  String? _bestKnownExtension(FirebaseBookingDriveFileModel file) {
    return _extractExtension(file.fileName) ??
        _extractExtension(file.storagePath) ??
        _extractExtension(file.downloadUrl);
  }

  String? _extractExtension(String source) {
    if (source.isEmpty) return null;
    final withoutQuery = source.split('?').first;
    String decoded = withoutQuery;
    try {
      decoded = Uri.decodeFull(withoutQuery);
    } catch (_) {
      decoded = withoutQuery;
    }
    final dotIndex = decoded.lastIndexOf('.');
    if (dotIndex == -1 || dotIndex == decoded.length - 1) {
      return null;
    }
    return decoded.substring(dotIndex + 1).toLowerCase();
  }

  IconData _iconForFile(FirebaseBookingDriveFileModel file) {
    if (_isImageFile(file)) return Icons.image;
    if (_isVideoFile(file)) return Icons.videocam;
    return _iconForMime(file.mimeType);
  }
}

class _VideoPreviewPlayer extends StatefulWidget {
  final String videoUrl;

  const _VideoPreviewPlayer({required this.videoUrl});

  @override
  State<_VideoPreviewPlayer> createState() => _VideoPreviewPlayerState();
}

class _VideoPreviewPlayerState extends State<_VideoPreviewPlayer> {
  VideoPlayerController? _controller;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    try {
      final controller = VideoPlayerController.networkUrl(
        Uri.parse(widget.videoUrl),
      );
      await controller.initialize();
      if (!mounted) {
        await controller.dispose();
        return;
      }
      setState(() {
        _controller = controller;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = 'Unable to load video preview.';
      });
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const SizedBox(
        height: 320,
        child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
      );
    }
    if (_error != null ||
        _controller == null ||
        !_controller!.value.isInitialized) {
      return const SizedBox(
        height: 320,
        child: Center(child: Text('Unable to load video preview.')),
      );
    }
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          height: 320,
          child: Center(
            child: AspectRatio(
              aspectRatio: _controller!.value.aspectRatio <= 0
                  ? 16 / 9
                  : _controller!.value.aspectRatio,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: VideoPlayer(_controller!),
              ),
            ),
          ),
        ),
        const SizedBox(height: 10),
        IconButton(
          onPressed: () {
            final controller = _controller!;
            if (controller.value.isPlaying) {
              controller.pause();
            } else {
              controller.play();
            }
            setState(() {});
          },
          icon: Icon(
            _controller!.value.isPlaying
                ? Icons.pause_circle
                : Icons.play_circle,
            size: 34,
          ),
        ),
      ],
    );
  }
}
