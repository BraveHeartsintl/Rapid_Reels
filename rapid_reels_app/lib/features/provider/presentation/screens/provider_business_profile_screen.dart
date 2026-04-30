import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geocoding/geocoding.dart';
import '../../../../core/theme/provider_app_colors.dart';
import '../../../../core/constants/app_routes.dart';
import '../../../../core/firebase/services/firestore_service.dart';
import '../../../../shared/widgets/custom_button.dart';
import '../../../../shared/widgets/custom_text_field.dart';
import '../services/veriff_verification_service.dart';

class ProviderBusinessProfileScreen extends StatefulWidget {
  const ProviderBusinessProfileScreen({super.key});

  @override
  State<ProviderBusinessProfileScreen> createState() => _ProviderBusinessProfileScreenState();
}

class _ProviderBusinessProfileScreenState extends State<ProviderBusinessProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _bioController = TextEditingController();
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _pincodeController = TextEditingController();
  final _teamSizeController = TextEditingController();
  final _equipmentController = TextEditingController();
  
  String? _selectedProfileImage;
  List<String> _selectedCoverImages = [];
  List<String> _selectedEventTypes = [];
  List<String> _selectedEquipment = [];
  String _equipmentDescription = '';
  String _verificationStatus = 'not_started';
  String? _dbsCertificateUrl;
  bool _isSaving = false;
  bool _isStartingVerification = false;
  bool _isUploadingDbs = false;

  final _auth = FirebaseAuth.instance;
  final _firestoreService = FirestoreService();
  final _veriffService = VeriffVerificationService();
  final _picker = ImagePicker();
  
  final List<String> _availableEventTypes = [
    'Wedding',
    'Birthday',
    'Engagement',
    'Corporate',
    'Brand',
    'Other',
  ];
  final List<String> _availableEquipment = const [
    'Drone',
    'Camera',
    'iPhone',
    'Android',
  ];
  @override
  void initState() {
    super.initState();
    _loadVerificationData();
  }

  @override
  void dispose() {
    _bioController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _pincodeController.dispose();
    _teamSizeController.dispose();
    _equipmentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ProviderAppColors.background,
      appBar: AppBar(
        backgroundColor: ProviderAppColors.surface,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'Profile',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Complete Your Profile',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Help customers discover your services',
                style: TextStyle(fontSize: 14, color: Colors.grey[600]),
              ),
              const SizedBox(height: 32),
              
              // Profile Image
              Center(
                child: Column(
                  children: [
                    GestureDetector(
                      onTap: _selectProfileImage,
                      child: Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          color: ProviderAppColors.surface,
                          shape: BoxShape.circle,
                          border: Border.all(color: ProviderAppColors.primary, width: 2),
                        ),
                        child: _selectedProfileImage != null
                            ? ClipOval(
                                child: Image.network(
                                  _selectedProfileImage!,
                                  fit: BoxFit.cover,
                                ),
                              )
                            : Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.camera_alt, color: Colors.grey[600], size: 32),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Add Photo',
                                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                                  ),
                                ],
                              ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: _selectProfileImage,
                      child: const Text('Upload Profile Photo'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              
              // Cover Images
              const Text(
                'Cover Images (3-5 recommended)',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 100,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: _selectedCoverImages.length + 1,
                  itemBuilder: (context, index) {
                    if (index == _selectedCoverImages.length) {
                      return GestureDetector(
                        onTap: _selectCoverImages,
                        child: Container(
                          width: 100,
                          margin: const EdgeInsets.only(right: 12),
                          decoration: BoxDecoration(
                            color: ProviderAppColors.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.grey[700]!, width: 1),
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.add_photo_alternate, color: Colors.grey[600]),
                              const SizedBox(height: 4),
                              Text(
                                'Add',
                                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                              ),
                            ],
                          ),
                        ),
                      );
                    }
                    return Container(
                      width: 100,
                      margin: const EdgeInsets.only(right: 12),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        image: DecorationImage(
                          image: NetworkImage(_selectedCoverImages[index]),
                          fit: BoxFit.cover,
                        ),
                      ),
                      child: Stack(
                        children: [
                          Positioned(
                            top: 4,
                            right: 4,
                            child: GestureDetector(
                              onTap: () {
                                setState(() {
                                  _selectedCoverImages.removeAt(index);
                                });
                              },
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: const BoxDecoration(
                                  color: Colors.red,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.close, color: Colors.white, size: 16),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 32),
              
              // Bio
              CustomTextField(
                controller: _bioController,
                label: 'Your Bio',
                hint: 'Tell customers about your services and experience',
                prefixIcon: Icons.description,
                maxLines: 4,
              ),
              const SizedBox(height: 16),
              
              // Event Types
              const Text(
                'Event Types You Cover',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: _availableEventTypes.map((type) {
                  final isSelected = _selectedEventTypes.contains(type);
                  return FilterChip(
                    label: Text(type),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          _selectedEventTypes.add(type);
                        } else {
                          _selectedEventTypes.remove(type);
                        }
                      });
                    },
                    selectedColor: ProviderAppColors.primary.withValues(alpha: 0.2),
                    checkmarkColor: ProviderAppColors.primary,
                  );
                }).toList(),
              ),
              const SizedBox(height: 32),

              const Text(
                'Available Equipment',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _equipmentController,
                minLines: 2,
                maxLines: 4,
                onChanged: (value) => _equipmentDescription = value,
                decoration: InputDecoration(
                  hintText:
                      'Type your equipment details/model info (e.g. iPhone 15 Pro, Canon R6, DJI Mini 4)',
                  filled: true,
                  fillColor: ProviderAppColors.surface,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey[700]!, width: 1),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey[700]!, width: 1),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: ProviderAppColors.primary,
                      width: 1.5,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: _availableEquipment.map((item) {
                  final isSelected = _selectedEquipment.contains(item);
                  return FilterChip(
                    label: Text(item),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          _selectedEquipment.add(item);
                        } else {
                          _selectedEquipment.remove(item);
                        }
                      });
                    },
                    selectedColor: ProviderAppColors.primary.withValues(alpha: 0.2),
                    checkmarkColor: ProviderAppColors.primary,
                  );
                }).toList(),
              ),
              const SizedBox(height: 32),
              
              // Address
              CustomTextField(
                controller: _addressController,
                label: 'Address',
                hint: 'Enter your address',
                prefixIcon: Icons.location_on,
                maxLines: 2,
              ),
              const SizedBox(height: 16),
              
              Row(
                children: [
                  Expanded(
                    child: CustomTextField(
                      controller: _cityController,
                      label: 'City',
                      hint: 'City',
                      prefixIcon: Icons.location_city,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: CustomTextField(
                      controller: _stateController,
                      label: 'Region',
                      hint: 'Region',
                      prefixIcon: Icons.map,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              CustomTextField(
                controller: _pincodeController,
                label: 'Postcode',
                hint: 'Enter postcode',
                prefixIcon: Icons.pin,
                keyboardType: TextInputType.text,
                validator: (value) {
                  final trimmed = value?.trim() ?? '';
                  if (trimmed.isNotEmpty &&
                      !RegExp(r'^[a-zA-Z0-9]+$').hasMatch(trimmed)) {
                    return 'Postcode must be alphanumeric';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              
              CustomTextField(
                controller: _teamSizeController,
                label: 'Team Size',
                hint: 'Number of team members',
                prefixIcon: Icons.people,
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 24),
              const Text(
                'Identity Verification',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: ProviderAppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[700]!, width: 1),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Status: ${_statusLabel(_verificationStatus)}',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Upload one supported ID document in Veriff.',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[300],
                      ),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: _isStartingVerification
                            ? null
                            : _startIdentityVerification,
                        child: _isStartingVerification
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : Text(_canRetryVerification(_verificationStatus)
                                  ? 'Retry verification'
                                  : 'Start verification'),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Upload DBS Certification',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _isUploadingDbs ? null : _uploadDbsCertificate,
                      icon: _isUploadingDbs
                          ? const SizedBox(
                              width: 14,
                              height: 14,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.upload_file),
                      label: Text(
                        _dbsCertificateUrl == null
                            ? 'Upload DBS certification'
                            : 'Replace DBS certification',
                      ),
                    ),
                  ),
                ],
              ),
              if (_dbsCertificateUrl != null) ...[
                const SizedBox(height: 8),
                Text(
                  'DBS certification uploaded',
                  style: TextStyle(fontSize: 12, color: Colors.green[300]),
                ),
              ],
              const SizedBox(height: 32),
              
              CustomButton(
                text: 'Continue',
                isLoading: _isSaving,
                onPressed: _isSaving ? null : _handleContinue,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _selectProfileImage() async {
    final user = _auth.currentUser;
    if (user == null) return;

    final picked = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
    if (picked == null) return;

    setState(() => _isSaving = true);

    try {
      final ref = FirebaseStorage.instance
          .ref()
          .child('providers')
          .child(user.uid)
          .child('profile.jpg');

      await ref.putData(await picked.readAsBytes());
      final url = await ref.getDownloadURL();

      await _firestoreService.updateProvider(user.uid, {
        'profileImage': url,
      });

      setState(() {
        _selectedProfileImage = url;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to upload profile photo: $e')),
      );
    } finally {
      setState(() => _isSaving = false);
    }
  }

  Future<void> _selectCoverImages() async {
    final user = _auth.currentUser;
    if (user == null) return;

    final pickedList = await _picker.pickMultiImage(imageQuality: 80);
    if (pickedList.isEmpty) return;

    setState(() => _isSaving = true);

    final storage = FirebaseStorage.instance;
    final urls = <String>[];

    try {
      for (final file in pickedList) {
        final fileName = DateTime.now().millisecondsSinceEpoch.toString();
        final ref = storage
            .ref()
            .child('providers')
            .child(user.uid)
            .child('covers')
            .child('$fileName.jpg');

        await ref.putData(await file.readAsBytes());
        urls.add(await ref.getDownloadURL());
      }

      await _firestoreService.updateProvider(user.uid, {
        'coverImages': urls,
      });

      setState(() {
        _selectedCoverImages.addAll(urls);
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to upload cover images: $e')),
      );
    } finally {
      setState(() => _isSaving = false);
    }
  }

  Future<void> _handleContinue() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final user = _auth.currentUser;
    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('You must be logged in as provider')),
      );
      return;
    }

    setState(() => _isSaving = true);

    try {
      final bio = _safeTrimmedText(_bioController);
      final address = _safeTrimmedText(_addressController);
      final city = _safeTrimmedText(_cityController);
      final region = _safeTrimmedText(_stateController);
      final pincode = _safeTrimmedText(_pincodeController);
      final teamSizeText = _safeTrimmedText(_teamSizeController);
      final teamSize = int.tryParse(teamSizeText) ?? 1;
      final equipmentDescription = _safeTrim(_equipmentDescription);
      double latitude = 0.0;
      double longitude = 0.0;
      final fullAddress = '$address, $city, $region, $pincode';
      try {
        final locations = await locationFromAddress(fullAddress);
        if (locations.isNotEmpty) {
          latitude = locations.first.latitude;
          longitude = locations.first.longitude;
        }
      } catch (_) {
        // Keep default coordinates; provider search has city fallback.
      }

      final providerUpdates = <String, dynamic>{
        'bio': bio,
        'eventTypes': _selectedEventTypes.map((e) => e.toLowerCase()).toList(),
        'location': {
          'address': address,
          'city': city,
          'state': region,
          'pincode': pincode,
          'coordinates': {
            'latitude': latitude,
            'longitude': longitude,
          },
        },
        'teamSize': teamSize,
        'equipment': _selectedEquipment.map((e) => e.toLowerCase()).toList(),
        'equipmentDescription': equipmentDescription,
      };
      await _firestoreService.updateProvider(user.uid, providerUpdates);

      if (!mounted) return;
      context.push(AppRoutes.providerPortfolioUpload);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to save business profile: $e')),
      );
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  String _safeTrimmedText(TextEditingController? controller) {
    final value = controller?.text;
    return value is String ? value.trim() : '';
  }

  String _safeTrim(dynamic value) {
    return value is String ? value.trim() : '';
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'session_created':
        return 'Session created';
      case 'in_progress':
        return 'In progress';
      case 'submitted':
        return 'Submitted';
      case 'approved':
        return 'Approved';
      case 'declined':
        return 'Declined';
      case 'resubmission_requested':
        return 'Resubmission requested';
      case 'expired':
        return 'Expired';
      case 'abandoned':
        return 'Abandoned';
      case 'error':
        return 'Error';
      default:
        return 'Not started';
    }
  }

  bool _canRetryVerification(String status) {
    return status == 'declined' ||
        status == 'resubmission_requested' ||
        status == 'expired' ||
        status == 'abandoned' ||
        status == 'error';
  }

  Future<void> _loadVerificationData() async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) return;
    try {
      final provider = await _firestoreService.getProvider(uid);
      if (!mounted || provider == null) return;
      final metadata = provider.metadata;
      String? dbsUrl;
      if (metadata != null) {
        final docs = metadata['documents'];
        if (docs is Map<String, dynamic>) {
          dbsUrl = docs['dbsCertificateUrl'] as String?;
        } else if (docs is Map) {
          final value = docs['dbsCertificateUrl'];
          dbsUrl = value is String ? value : null;
        }
      }
      setState(() {
        _verificationStatus = provider.veriffStatus;
        _dbsCertificateUrl = dbsUrl;
      });
    } catch (_) {
      // Silent: screen is still usable without status preload.
    }
  }

  Future<void> _startIdentityVerification() async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) return;
    setState(() => _isStartingVerification = true);
    try {
      final result = await _veriffService.startProviderVerification(
        providerId: uid,
      );
      if (!mounted) return;
      setState(() {
        _verificationStatus = result.status.name;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result.userMessage)),
      );
      await _loadVerificationData();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Verification start failed: $e')),
      );
    } finally {
      if (mounted) {
        setState(() => _isStartingVerification = false);
      }
    }
  }

  Future<void> _uploadDbsCertificate() async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) return;
    final picked = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 90,
    );
    if (picked == null) return;

    setState(() => _isUploadingDbs = true);
    try {
      final ref = FirebaseStorage.instance
          .ref()
          .child('providers')
          .child(uid)
          .child('documents')
          .child('dbs_certificate.jpg');
      await ref.putData(await picked.readAsBytes());
      final url = await ref.getDownloadURL();
      await _firestoreService.updateProvider(uid, {
        'metadata.documents.dbsCertificateUrl': url,
        'metadata.documents.dbsCertificateUploadedAt':
            DateTime.now().toIso8601String(),
      });
      if (!mounted) return;
      setState(() => _dbsCertificateUrl = url);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('DBS certification uploaded successfully.')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to upload DBS certification: $e')),
      );
    } finally {
      if (mounted) {
        setState(() => _isUploadingDbs = false);
      }
    }
  }

}

