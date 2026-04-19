import 'package:cloud_firestore/cloud_firestore.dart';

enum BookingDriveFolderType { original, edited }

enum BookingDriveActorRole { provider, admin, customer }

BookingDriveFolderType bookingDriveFolderTypeFromString(String raw) {
  switch (raw) {
    case 'edited':
      return BookingDriveFolderType.edited;
    case 'original':
    default:
      return BookingDriveFolderType.original;
  }
}

String bookingDriveFolderTypeToString(BookingDriveFolderType folderType) {
  return folderType == BookingDriveFolderType.edited ? 'edited' : 'original';
}

BookingDriveActorRole bookingDriveActorRoleFromString(String raw) {
  switch (raw) {
    case 'admin':
      return BookingDriveActorRole.admin;
    case 'customer':
      return BookingDriveActorRole.customer;
    case 'provider':
    default:
      return BookingDriveActorRole.provider;
  }
}

String bookingDriveActorRoleToString(BookingDriveActorRole role) {
  switch (role) {
    case BookingDriveActorRole.admin:
      return 'admin';
    case BookingDriveActorRole.customer:
      return 'customer';
    case BookingDriveActorRole.provider:
      return 'provider';
  }
}

class FirebaseBookingDriveMetaModel {
  final String bookingId;
  final String rootPath;
  final String originalFolderPath;
  final String editedFolderPath;
  final bool isSharedWithCustomer;
  final DateTime? approvedByAdminAt;
  final String? approvedByAdminId;
  final DateTime createdAt;
  final DateTime updatedAt;

  const FirebaseBookingDriveMetaModel({
    required this.bookingId,
    required this.rootPath,
    required this.originalFolderPath,
    required this.editedFolderPath,
    required this.isSharedWithCustomer,
    required this.createdAt,
    required this.updatedAt,
    this.approvedByAdminAt,
    this.approvedByAdminId,
  });

  factory FirebaseBookingDriveMetaModel.defaultForBooking(String bookingId) {
    final now = DateTime.now();
    final rootPath = 'bookings/$bookingId';
    return FirebaseBookingDriveMetaModel(
      bookingId: bookingId,
      rootPath: rootPath,
      originalFolderPath: '$rootPath/original_photos_videos',
      editedFolderPath: '$rootPath/edited_deliverables',
      isSharedWithCustomer: false,
      createdAt: now,
      updatedAt: now,
    );
  }

  factory FirebaseBookingDriveMetaModel.fromFirestore(
    String bookingId,
    Map<String, dynamic> data,
  ) {
    final rootPath = (data['rootPath'] as String?) ?? 'bookings/$bookingId';
    return FirebaseBookingDriveMetaModel(
      bookingId: bookingId,
      rootPath: rootPath,
      originalFolderPath:
          (data['originalFolderPath'] as String?) ?? '$rootPath/original_photos_videos',
      editedFolderPath:
          (data['editedFolderPath'] as String?) ?? '$rootPath/edited_deliverables',
      isSharedWithCustomer: data['isSharedWithCustomer'] == true,
      approvedByAdminAt: (data['approvedByAdminAt'] as Timestamp?)?.toDate(),
      approvedByAdminId: data['approvedByAdminId'] as String?,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'bookingId': bookingId,
      'rootPath': rootPath,
      'originalFolderPath': originalFolderPath,
      'editedFolderPath': editedFolderPath,
      'isSharedWithCustomer': isSharedWithCustomer,
      'approvedByAdminAt': approvedByAdminAt != null
          ? Timestamp.fromDate(approvedByAdminAt!)
          : null,
      'approvedByAdminId': approvedByAdminId,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
    };
  }
}

class FirebaseBookingDriveFileModel {
  final String fileId;
  final String bookingId;
  final BookingDriveFolderType folderType;
  final String storagePath;
  final String downloadUrl;
  final String fileName;
  final String mimeType;
  final int sizeBytes;
  final BookingDriveActorRole uploadedByRole;
  final String uploadedById;
  final DateTime uploadedAt;
  final bool isDeleted;
  final String? thumbnailUrl;

  const FirebaseBookingDriveFileModel({
    required this.fileId,
    required this.bookingId,
    required this.folderType,
    required this.storagePath,
    required this.downloadUrl,
    required this.fileName,
    required this.mimeType,
    required this.sizeBytes,
    required this.uploadedByRole,
    required this.uploadedById,
    required this.uploadedAt,
    required this.isDeleted,
    this.thumbnailUrl,
  });

  factory FirebaseBookingDriveFileModel.fromFirestore(
    String fileId,
    Map<String, dynamic> data,
  ) {
    return FirebaseBookingDriveFileModel(
      fileId: fileId,
      bookingId: (data['bookingId'] as String?) ?? '',
      folderType: bookingDriveFolderTypeFromString(
        (data['folderType'] as String?) ?? 'original',
      ),
      storagePath: (data['storagePath'] as String?) ?? '',
      downloadUrl: (data['downloadUrl'] as String?) ?? '',
      fileName: (data['fileName'] as String?) ?? '',
      mimeType: (data['mimeType'] as String?) ?? 'application/octet-stream',
      sizeBytes: ((data['sizeBytes'] ?? 0) as num).toInt(),
      uploadedByRole: bookingDriveActorRoleFromString(
        (data['uploadedByRole'] as String?) ?? 'provider',
      ),
      uploadedById: (data['uploadedById'] as String?) ?? '',
      uploadedAt: (data['uploadedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      isDeleted: data['isDeleted'] == true,
      thumbnailUrl: data['thumbnailUrl'] as String?,
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'fileId': fileId,
      'bookingId': bookingId,
      'folderType': bookingDriveFolderTypeToString(folderType),
      'storagePath': storagePath,
      'downloadUrl': downloadUrl,
      'fileName': fileName,
      'mimeType': mimeType,
      'sizeBytes': sizeBytes,
      'uploadedByRole': bookingDriveActorRoleToString(uploadedByRole),
      'uploadedById': uploadedById,
      'uploadedAt': Timestamp.fromDate(uploadedAt),
      'isDeleted': isDeleted,
      'thumbnailUrl': thumbnailUrl,
    };
  }

  FirebaseBookingDriveFileModel copyWith({
    String? fileId,
    String? bookingId,
    BookingDriveFolderType? folderType,
    String? storagePath,
    String? downloadUrl,
    String? fileName,
    String? mimeType,
    int? sizeBytes,
    BookingDriveActorRole? uploadedByRole,
    String? uploadedById,
    DateTime? uploadedAt,
    bool? isDeleted,
    String? thumbnailUrl,
  }) {
    return FirebaseBookingDriveFileModel(
      fileId: fileId ?? this.fileId,
      bookingId: bookingId ?? this.bookingId,
      folderType: folderType ?? this.folderType,
      storagePath: storagePath ?? this.storagePath,
      downloadUrl: downloadUrl ?? this.downloadUrl,
      fileName: fileName ?? this.fileName,
      mimeType: mimeType ?? this.mimeType,
      sizeBytes: sizeBytes ?? this.sizeBytes,
      uploadedByRole: uploadedByRole ?? this.uploadedByRole,
      uploadedById: uploadedById ?? this.uploadedById,
      uploadedAt: uploadedAt ?? this.uploadedAt,
      isDeleted: isDeleted ?? this.isDeleted,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
    );
  }
}
