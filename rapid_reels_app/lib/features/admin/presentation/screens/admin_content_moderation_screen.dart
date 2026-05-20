import 'dart:io';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/firebase/models/firebase_reel_model.dart';
import '../../../../core/firebase/services/firestore_service.dart';

class AdminContentModerationScreen extends StatefulWidget {
  const AdminContentModerationScreen({super.key});

  @override
  State<AdminContentModerationScreen> createState() =>
      _AdminContentModerationScreenState();
}

class _AdminContentModerationScreenState
    extends State<AdminContentModerationScreen> {
  static const int _maxFeaturedReels = 4;
  final _firestore = FirestoreService();
  final _storage = FirebaseStorage.instance;
  final _picker = ImagePicker();

  bool _loading = true;
  bool _saving = false;
  bool _uploading = false;
  String _selectedFilter = 'all';
  List<FirebaseReelModel> _allReels = const [];

  @override
  void initState() {
    super.initState();
    _loadReels();
  }

  int get _featuredCount => _allReels.where((r) => r.isFeatured).length;

  List<FirebaseReelModel> get _visibleReels {
    switch (_selectedFilter) {
      case 'featured':
        return _allReels.where((r) => r.isFeatured).toList();
      case 'eligible':
        return _allReels.where(_isReelEligibleForHomeFeature).toList();
      case 'all':
      default:
        return _allReels;
    }
  }

  Future<void> _loadReels() async {
    setState(() => _loading = true);
    try {
      final reels = await _firestore.getReelsForAdmin(limit: 300);
      if (!mounted) return;
      setState(() {
        _allReels = reels;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unable to load reels: $e')),
      );
    }
  }

  bool _isReelEligibleForHomeFeature(FirebaseReelModel reel) {
    return reel.isDiscoverApproved;
  }

  Future<void> _uploadTrendingReel() async {
    if (_uploading || _saving || _featuredCount >= _maxFeaturedReels) {
      if (_featuredCount >= _maxFeaturedReels && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Featured reel limit reached. Unfeature one reel first.',
            ),
          ),
        );
      }
      return;
    }

    final currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please login as admin again.')),
      );
      return;
    }

    final picked = await _picker.pickMedia();
    if (picked == null) return;

    final ext = _extractExtension(picked.name) ?? 'mp4';
    final inferredType = ext == 'mov' ? 'video/quicktime' : 'video/$ext';
    if (!inferredType.startsWith('video/')) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a video file only.')),
      );
      return;
    }

    setState(() => _uploading = true);
    try {
      final millis = DateTime.now().millisecondsSinceEpoch;
      final safeName = picked.name.replaceAll(' ', '_');
      final storagePath =
          'admin_banners/${currentUser.uid}/trending_reel_${millis}_$safeName';
      final storageRef = _storage.ref(storagePath);
      final metadata = SettableMetadata(contentType: inferredType);

      UploadTask uploadTask;
      if (kIsWeb) {
        final bytes = await picked.readAsBytes();
        uploadTask = storageRef.putData(bytes, metadata);
      } else {
        uploadTask = storageRef.putFile(File(picked.path), metadata);
      }

      final result = await uploadTask;
      final downloadUrl = await result.ref.getDownloadURL();
      final sizeBytes = result.metadata?.size ?? 0;
      final now = DateTime.now();
      final title = _titleFromFileName(picked.name);

      final reel = FirebaseReelModel(
        reelId: '',
        bookingId: 'admin_trending_$millis',
        customerId: currentUser.uid,
        providerId: currentUser.uid,
        eventType: 'trending',
        eventName: 'Admin Trending Reel',
        title: title,
        description: 'Uploaded by admin for home trending reels',
        videoUrl: downloadUrl,
        thumbnailUrl: '',
        duration: 0,
        status: 'published',
        metadata: ReelMetadata(
          editingStyle: 'standard',
          quality: '1080p',
          fileSize: sizeBytes,
          format: _extractExtension(picked.name),
        ),
        analytics: ReelAnalytics(),
        isPublic: true,
        moderationStatus: 'approved',
        isFeatured: true,
        createdAt: now,
        deliveredAt: now,
        publishedAt: now,
      );

      await _firestore.createReel(reel);
      await _loadReels();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Trending reel uploaded and added to home section.'),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Upload failed: $e')),
      );
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  Future<void> _toggleFeatured(FirebaseReelModel reel, bool value) async {
    if (_saving) return;
    if (value && !_isReelEligibleForHomeFeature(reel)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Only public delivered/published reels can be featured on home.',
          ),
        ),
      );
      return;
    }
    setState(() => _saving = true);
    try {
      await _firestore.setReelFeatured(
        reelId: reel.reelId,
        isFeatured: value,
        maxFeatured: _maxFeaturedReels,
      );
      await _loadReels();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            value
                ? 'Reel added to home featured section.'
                : 'Reel removed from home featured section.',
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unable to update featured reel: $e')),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        elevation: 0,
        title: const Text(
          'Featured Reels Curation',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        actions: [
          TextButton.icon(
            onPressed: (_uploading || _loading) ? null : _uploadTrendingReel,
            icon: _uploading
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.upload_file),
            label: const Text('Upload Reel'),
          ),
          IconButton(
            tooltip: 'Refresh',
            onPressed: _loading ? null : _loadReels,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 10),
            color: AppColors.surface,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Selected for home: $_featuredCount/$_maxFeaturedReels',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Pick up to 4 reels. Only these reels appear in Home trending reels.',
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  children: [
                    _buildFilterChip('All', 'all'),
                    _buildFilterChip('Featured', 'featured'),
                    _buildFilterChip('Eligible', 'eligible'),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _visibleReels.isEmpty
                ? const Center(child: Text('No reels found for this filter.'))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _visibleReels.length,
                    itemBuilder: (context, index) {
                      return _buildReelCard(_visibleReels[index]);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    return ChoiceChip(
      label: Text(label),
      selected: _selectedFilter == value,
      onSelected: (_) => setState(() => _selectedFilter = value),
    );
  }

  Widget _buildReelCard(FirebaseReelModel reel) {
    final eligible = _isReelEligibleForHomeFeature(reel);
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: reel.isFeatured
              ? AppColors.primary.withValues(alpha: 0.6)
              : Colors.grey.withValues(alpha: 0.2),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: SizedBox(
                width: 96,
                height: 96,
                child: reel.thumbnailUrl.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: reel.thumbnailUrl,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => _videoFallback(),
                      )
                    : _videoFallback(),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    reel.title.isEmpty ? 'Untitled reel' : reel.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${reel.eventType} • ${reel.status}',
                    style: TextStyle(color: Colors.grey[700], fontSize: 12),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Likes: ${reel.likes}  Views: ${reel.views}',
                    style: TextStyle(color: Colors.grey[700], fontSize: 12),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      _smallBadge(
                        reel.isPublic ? 'Public' : 'Private',
                        reel.isPublic ? Colors.green : Colors.orange,
                      ),
                      _smallBadge(
                        reel.isFeatured ? 'Featured' : 'Not Featured',
                        reel.isFeatured ? AppColors.primary : Colors.grey,
                      ),
                      if (!eligible)
                        _smallBadge(
                          'Not home-eligible',
                          Colors.redAccent,
                        ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Column(
              children: [
                const Text(
                  'Feature',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                ),
                Switch(
                  value: reel.isFeatured,
                  onChanged: _saving ? null : (v) => _toggleFeatured(reel, v),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _videoFallback() {
    return Container(
      color: Colors.black12,
      child: const Center(
        child: Icon(Icons.play_circle_outline, size: 34),
      ),
    );
  }

  Widget _smallBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  String? _extractExtension(String source) {
    final dot = source.lastIndexOf('.');
    if (dot == -1 || dot == source.length - 1) return null;
    return source.substring(dot + 1).toLowerCase();
  }

  String _titleFromFileName(String name) {
    final clean = name.trim();
    if (clean.isEmpty) return 'Trending Reel';
    final dot = clean.lastIndexOf('.');
    final base = dot > 0 ? clean.substring(0, dot) : clean;
    return base.replaceAll('_', ' ');
  }
}

