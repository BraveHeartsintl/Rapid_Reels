import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_routes.dart';
import '../../core/legal/legal_policy_catalog.dart';
import '../../core/legal/ugc_community_prefs.dart';
import 'signup_legal_consent_section.dart';

/// Blocks public UGC feeds until the user accepts Terms / AUP (guests and signed-in users).
class UgcCommunityGate extends StatefulWidget {
  const UgcCommunityGate({super.key, required this.child});

  final Widget child;

  @override
  State<UgcCommunityGate> createState() => _UgcCommunityGateState();
}

class _UgcCommunityGateState extends State<UgcCommunityGate> {
  bool _checking = true;
  bool _accepted = false;
  bool _agreeLegal = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final ok = await UgcCommunityPrefs.hasAccepted();
    if (!mounted) return;
    setState(() {
      _checking = false;
      _accepted = ok;
    });
  }

  Future<void> _continue() async {
    if (!_agreeLegal) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Please confirm you agree to the Terms, Privacy Policy, and Acceptable Use Policy.',
          ),
        ),
      );
      return;
    }
    await UgcCommunityPrefs.accept();
    if (!mounted) return;
    setState(() => _accepted = true);
  }

  @override
  Widget build(BuildContext context) {
    if (_checking) {
      return const Scaffold(
        backgroundColor: AppColors.background,
        body: Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }
    if (_accepted) {
      return widget.child;
    }
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        title: const Text('Community guidelines'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Before you view reels',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Rapid Reels includes user-generated portfolio reels. '
                'We have zero tolerance for objectionable content or abusive users. '
                'You can report content and block users at any time from the reel menu (⋯).',
                style: TextStyle(
                  fontSize: 14,
                  height: 1.45,
                  color: AppColors.textSecondary.withValues(alpha: 0.95),
                ),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () =>
                    context.push(AppRoutes.legalPolicy(LegalPolicyIds.acceptableUse)),
                child: const Text('Read Acceptable Use Policy'),
              ),
              const SizedBox(height: 16),
              SignupLegalConsentSection(
                agreeLegal: _agreeLegal,
                onAgreeLegal: (v) => setState(() => _agreeLegal = v),
                marketingOptIn: false,
                onMarketingOptIn: (_) {},
                showMarketingOptIn: false,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _continue,
                  child: const Text('I agree — show reels'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
