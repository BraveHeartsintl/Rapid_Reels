import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_routes.dart';
import '../../../../core/legal/cookie_consent_platform.dart';
import '../../../../core/legal/cookie_consent_prefs.dart';
import '../../../../core/legal/legal_policy_catalog.dart';

class CookiePreferencesScreen extends StatefulWidget {
  const CookiePreferencesScreen({super.key});

  @override
  State<CookiePreferencesScreen> createState() =>
      _CookiePreferencesScreenState();
}

class _CookiePreferencesScreenState extends State<CookiePreferencesScreen> {
  bool _analytics = false;
  bool _marketing = false;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final a = await CookieConsentPrefs.analyticsEnabled();
    final m = await CookieConsentPrefs.marketingEnabled();
    if (!mounted) return;
    setState(() {
      _analytics = a;
      _marketing = m;
      _loading = false;
    });
  }

  Future<void> _save() async {
    await CookieConsentPrefs.saveCustom(
      analytics: _analytics,
      marketing: _marketing,
    );
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Preferences saved.')),
    );
    context.pop();
  }

  @override
  Widget build(BuildContext context) {
    if (!kShowsCookieConsentUi) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          backgroundColor: AppColors.background,
          title: const Text('Privacy'),
        ),
        body: Padding(
          padding: const EdgeInsets.all(20),
          child: Text(
            'The Rapid Reels app on Apple devices does not use cookies or '
            'identifiers for advertising tracking. Optional analytics and '
            'marketing cookies are not collected on this platform.\n\n'
            'See the Cookie Policy for how cookies may be used on our website.',
            style: TextStyle(
              fontSize: 14,
              height: 1.45,
              color: AppColors.textSecondary.withValues(alpha: 0.95),
            ),
          ),
        ),
      );
    }
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        title: const Text('Cookie preferences'),
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            )
          : ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Text(
                  'Manage optional cookies and similar technologies. '
                  'Strictly necessary functions of the app are not controlled here.',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary.withValues(alpha: 0.95),
                    height: 1.45,
                  ),
                ),
                const SizedBox(height: 20),
                SwitchListTile(
                  title: const Text('Analytics'),
                  subtitle: const Text(
                    'Helps us understand app usage and improve stability.',
                  ),
                  value: _analytics,
                  activeThumbColor: AppColors.primary,
                  onChanged: (v) => setState(() => _analytics = v),
                ),
                SwitchListTile(
                  title: const Text('Marketing'),
                  subtitle: const Text(
                    'Personalised offers and reminders where we support them.',
                  ),
                  value: _marketing,
                  activeThumbColor: AppColors.primary,
                  onChanged: (v) => setState(() => _marketing = v),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () =>
                      context.push(AppRoutes.legalPolicy(LegalPolicyIds.cookie)),
                  child: const Text('Read the Cookie Policy'),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: _save,
                    child: const Text('Save preferences'),
                  ),
                ),
              ],
            ),
    );
  }
}
