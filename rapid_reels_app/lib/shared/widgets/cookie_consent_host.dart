import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_routes.dart';
import '../../core/legal/cookie_consent_platform.dart';
import '../../core/legal/cookie_consent_prefs.dart';
import '../../core/legal/legal_policy_catalog.dart';

/// First-launch cookie banner with equal prominence for Accept, Reject, and Manage.
class CookieConsentHost extends StatefulWidget {
  const CookieConsentHost({super.key, required this.child});

  final Widget child;

  @override
  State<CookieConsentHost> createState() => _CookieConsentHostState();
}

class _CookieConsentHostState extends State<CookieConsentHost> {
  bool _checking = true;
  bool _showBanner = false;

  @override
  void initState() {
    super.initState();
    _refresh();
  }

  Future<void> _refresh() async {
    final done = await CookieConsentPrefs.isConsentCompleted();
    if (!mounted) return;
    setState(() {
      _checking = false;
      _showBanner = !done;
    });
  }

  Future<void> _acceptAll() async {
    await CookieConsentPrefs.acceptAll();
    if (!mounted) return;
    setState(() => _showBanner = false);
  }

  Future<void> _rejectAll() async {
    await CookieConsentPrefs.rejectAll();
    if (!mounted) return;
    setState(() => _showBanner = false);
  }

  void _openManage() {
    var analytics = false;
    var marketing = false;
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 16,
            bottom: 16 + MediaQuery.paddingOf(ctx).bottom,
          ),
          child: StatefulBuilder(
            builder: (context, setModal) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Cookie preferences',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Choose which optional categories we may use. '
                    'You can change this later in Settings.',
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary.withValues(alpha: 0.95),
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 12),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Analytics'),
                    subtitle: const Text('Usage and performance measurement'),
                    value: analytics,
                    activeThumbColor: AppColors.primary,
                    onChanged: (v) {
                      setModal(() => analytics = v);
                    },
                  ),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Marketing'),
                    subtitle: const Text('Offers and relevant reminders'),
                    value: marketing,
                    activeThumbColor: AppColors.primary,
                    onChanged: (v) {
                      setModal(() => marketing = v);
                    },
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      context.push(AppRoutes.legalPolicy(LegalPolicyIds.cookie));
                    },
                    child: const Text('Cookie Policy'),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: () async {
                        await CookieConsentPrefs.saveCustom(
                          analytics: analytics,
                          marketing: marketing,
                        );
                        if (context.mounted) Navigator.pop(ctx);
                        if (mounted) setState(() => _showBanner = false);
                      },
                      child: const Text('Save choices'),
                    ),
                  ),
                ],
              );
            },
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!kShowsCookieConsentUi) {
      return widget.child;
    }
    if (_checking) {
      return widget.child;
    }
    if (!_showBanner) {
      return widget.child;
    }
    return Stack(
      fit: StackFit.expand,
      children: [
        widget.child,
        ModalBarrier(
          color: Colors.black.withValues(alpha: 0.45),
          dismissible: false,
        ),
        Align(
          alignment: Alignment.bottomCenter,
          child: SafeArea(
            minimum: const EdgeInsets.all(12),
            child: Material(
              color: AppColors.surface,
              elevation: 12,
              borderRadius: BorderRadius.circular(16),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Cookies & privacy',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'We use optional cookies for analytics and marketing. '
                      'See our Cookie Policy for details.',
                      style: TextStyle(
                        fontSize: 13,
                        height: 1.4,
                        color: AppColors.textSecondary.withValues(alpha: 0.95),
                      ),
                    ),
                    TextButton(
                      style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      onPressed: () =>
                          context.push(AppRoutes.legalPolicy(LegalPolicyIds.cookie)),
                      child: const Text('Read the Cookie Policy'),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: _rejectAll,
                            child: const Text('Reject All'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: _openManage,
                            child: const Text('Manage'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: FilledButton(
                            onPressed: _acceptAll,
                            child: const Text('Accept All'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
