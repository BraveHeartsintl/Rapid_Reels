import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../../../core/theme/provider_app_colors.dart';
import '../../../../core/constants/app_routes.dart';
import '../../../../shared/widgets/custom_button.dart';

class ProviderDocumentUploadScreen extends StatefulWidget {
  const ProviderDocumentUploadScreen({super.key});

  @override
  State<ProviderDocumentUploadScreen> createState() => _ProviderDocumentUploadScreenState();
}

class _ProviderDocumentUploadScreenState extends State<ProviderDocumentUploadScreen> {
  final _auth = FirebaseAuth.instance;

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
          'Verification Moved',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Complete ID verification from Home',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'The old upload screen is deprecated. Start Veriff verification from your Provider Home card.',
              style: TextStyle(fontSize: 14, color: Colors.grey[600]),
            ),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: ProviderAppColors.info.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: ProviderAppColors.info.withValues(alpha: 0.3)),
              ),
              child: Text(
                'You only need one supported document to verify (passport, ID card, or driving licence). The final decision is received from Veriff webhook.',
                style: TextStyle(fontSize: 12, color: Colors.grey[300]),
              ),
            ),
            const SizedBox(height: 32),
            CustomButton(
              text: 'Go to Provider Home',
              onPressed: _goToProviderHome,
            ),
          ],
        ),
      ),
    );
  }

  void _goToProviderHome() {
    final uid = _auth.currentUser?.uid;
    if (uid == null || uid.isEmpty) {
      context.go(AppRoutes.providerLogin);
      return;
    }
    context.go('${AppRoutes.providerPortal}/$uid/home');
  }
}

