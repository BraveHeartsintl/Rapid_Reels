import 'package:cloud_functions/cloud_functions.dart' as cf;
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:veriff_flutter/veriff_flutter.dart';

import '../../../../core/firebase/services/firestore_service.dart';

class VeriffStartResult {
  final String userMessage;

  const VeriffStartResult(this.userMessage);
}

class VeriffVerificationService {
  final cf.FirebaseFunctions _functions;
  final FirestoreService _firestoreService;

  VeriffVerificationService({
    cf.FirebaseFunctions? functions,
    FirestoreService? firestoreService,
  }) : _functions = functions ?? cf.FirebaseFunctions.instance,
       _firestoreService = firestoreService ?? FirestoreService();

  Future<VeriffStartResult> startProviderVerification({
    required String providerId,
  }) async {
    await _ensureLaunchPermissions();

    final callable = _functions.httpsCallable('createVeriffSession');
    final response = await callable.call(<String, dynamic>{});
    final data = Map<String, dynamic>.from(response.data as Map);
    final sessionUrl = data['sessionUrl'] as String?;
    if (sessionUrl == null || sessionUrl.isEmpty) {
      throw Exception('Missing session URL from backend.');
    }

    await _firestoreService.updateProvider(providerId, {
      'metadata.veriff.status': 'in_progress',
      'metadata.veriff.audit.updatedBy': 'provider_app',
    });

    final veriff = Veriff();
    late final Result result;
    try {
      result = await veriff.start(Configuration(sessionUrl));
    } on MissingPluginException {
      throw Exception(
        'Veriff SDK is not available in this app build. Reinstall the latest APK.',
      );
    } on PlatformException catch (e) {
      throw Exception(
        'Unable to launch Veriff SDK (${e.code}). ${e.message ?? 'Try again.'}',
      );
    }

    switch (result.status) {
      case Status.done:
        await _firestoreService.updateProvider(providerId, {
          'metadata.veriff.status': 'submitted',
          'metadata.veriff.audit.updatedBy': 'provider_app',
        });
        return const VeriffStartResult(
          'Verification submitted. Final decision will update shortly.',
        );
      case Status.canceled:
        await _firestoreService.updateProvider(providerId, {
          'metadata.veriff.status': 'abandoned',
          'metadata.veriff.audit.updatedBy': 'provider_app',
        });
        return const VeriffStartResult('Verification canceled.');
      case Status.error:
        await _firestoreService.updateProvider(providerId, {
          'metadata.veriff.status': 'error',
          'metadata.veriff.lastError': result.error?.name ?? 'unknown',
          'metadata.veriff.audit.updatedBy': 'provider_app',
        });
        return VeriffStartResult(
          'Verification failed: ${result.error?.name ?? 'unknown error'}.',
        );
    }
  }

  Future<void> _ensureLaunchPermissions() async {
    if (kIsWeb) return;

    final camera = await Permission.camera.request();
    final mic = await Permission.microphone.request();

    if (!camera.isGranted) {
      throw Exception('Camera permission is required for verification.');
    }
    if (!mic.isGranted) {
      throw Exception('Microphone permission is required for verification.');
    }
  }
}
