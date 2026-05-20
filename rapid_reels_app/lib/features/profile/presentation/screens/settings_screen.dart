import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_routes.dart';
import '../../../../core/legal/cookie_consent_platform.dart';

/// App settings entry: legal hub and cookie preferences (UK legal pack).
class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        elevation: 0,
        title: const Text(
          'Settings',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: ListView(
        children: [
          Container(
            margin: const EdgeInsets.only(top: 16),
            color: AppColors.surface,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Text(
                    'LEGAL & PRIVACY',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textTertiary,
                      letterSpacing: 1,
                    ),
                  ),
                ),
                ListTile(
                  leading: const Icon(Icons.library_books_outlined),
                  title: const Text('Legal documents'),
                  subtitle: const Text(
                    'Terms, privacy, refunds, cookies, and more',
                  ),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push(AppRoutes.legalDocuments),
                ),
                if (kShowsCookieConsentUi) ...[
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.cookie_outlined),
                    title: const Text('Cookie preferences'),
                    subtitle: const Text('Analytics and marketing choices'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => context.push(AppRoutes.cookiePreferences),
                  ),
                ],
                const Divider(height: 1),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
