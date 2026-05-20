import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_routes.dart';
import '../../../../core/legal/cookie_consent_platform.dart';
import '../../../../core/legal/legal_policy_catalog.dart';

/// Settings entry: list all bundled legal documents.
class LegalDocumentsHubScreen extends StatelessWidget {
  const LegalDocumentsHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        title: const Text(
          'Legal documents',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: ListView(
        children: [
          for (final id in LegalPolicyIds.all)
            ListTile(
              title: Text(LegalPolicyIds.title(id)),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push(AppRoutes.legalPolicy(id)),
            ),
          if (kShowsCookieConsentUi) ...[
            const Divider(height: 32),
            ListTile(
              leading: const Icon(Icons.cookie_outlined),
              title: const Text('Cookie preferences'),
              subtitle: const Text('Change analytics and marketing choices'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push(AppRoutes.cookiePreferences),
            ),
          ],
        ],
      ),
    );
  }
}
