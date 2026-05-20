import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_routes.dart';
import '../../core/session/guest_session_prefs.dart';
import '../../core/theme/text_styles.dart';
import 'custom_button.dart';

/// Shown when a signed-out guest hits an account-only tab or screen.
class GuestSignInPrompt extends StatelessWidget {
  final String title;
  final String message;
  final IconData icon;

  const GuestSignInPrompt({
    super.key,
    this.title = 'Sign in to continue',
    this.message =
        'Create a free account to book events, save your reels, and manage bookings.',
    this.icon = Icons.person_outline_rounded,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 64, color: AppColors.primary.withValues(alpha: 0.8)),
            const SizedBox(height: 20),
            Text(
              title,
              style: AppTypography.headlineSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              message,
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 28),
            CustomButton(
              text: 'Sign in',
              onPressed: () async {
                await GuestSessionPrefs.clear();
                if (context.mounted) context.push(AppRoutes.login);
              },
              borderRadius: 12,
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => context.go(AppRoutes.home),
              child: const Text('Keep browsing'),
            ),
          ],
        ),
      ),
    );
  }
}

/// Inline banner for guest users on profile tab.
class GuestProfileBody extends StatelessWidget {
  const GuestProfileBody({super.key});

  @override
  Widget build(BuildContext context) {
    return GuestSignInPrompt(
      title: 'Your profile',
      message:
          'Sign in to view bookings, wallet, settings, and your personal details.',
      icon: Icons.account_circle_outlined,
    );
  }
}
