import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../constants/app_colors.dart';
import '../constants/app_routes.dart';
import '../session/guest_session_prefs.dart';

/// Prompts for sign-in when an account-only action is attempted while browsing as guest.
class AuthGuard {
  AuthGuard._();

  static bool get isSignedIn => FirebaseAuth.instance.currentUser != null;

  static Future<bool> requireAuth(
    BuildContext context, {
    String message = 'Sign in to continue.',
  }) async {
    if (isSignedIn) return true;
    if (!context.mounted) return false;

    final signIn = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sign in required'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Not now'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.primary,
            ),
            child: const Text('Sign in'),
          ),
        ],
      ),
    );

    if (signIn == true) {
      await GuestSessionPrefs.clear();
      if (context.mounted) {
        context.push(AppRoutes.login);
      }
    }
    return false;
  }
}
