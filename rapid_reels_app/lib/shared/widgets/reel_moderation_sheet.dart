import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/firebase/models/firebase_reel_model.dart';
import '../../core/firebase/services/firestore_service.dart';
import '../../core/moderation/reel_content_author.dart';

/// Report and block flows for public reels (App Store guideline 1.2).
class ReelModerationSheet {
  ReelModerationSheet._();

  static const _reportReasons = [
    'Spam or misleading',
    'Harassment or hate',
    'Violence or dangerous acts',
    'Nudity or sexual content',
    'Intellectual property violation',
    'Other',
  ];

  static Future<void> show({
    required BuildContext context,
    required FirebaseReelModel reel,
    required VoidCallback onBlockedLocally,
    bool allowDeleteOwn = false,
    VoidCallback? onDeleteOwn,
  }) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    final authorId = reelContentAuthorId(reel);
    final isOwnReel = uid != null &&
        uid.isNotEmpty &&
        (uid == reel.customerId || uid == reel.providerId);

    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.flag_outlined, color: AppColors.error),
              title: const Text('Report content'),
              onTap: () {
                Navigator.pop(ctx);
                _reportContent(context, reel: reel, authorId: authorId);
              },
            ),
            if (authorId.isNotEmpty && authorId != uid)
              ListTile(
                leading: const Icon(Icons.block, color: AppColors.error),
                title: const Text('Block user'),
                subtitle: const Text(
                  'Hide their content from your feed and notify our team',
                ),
                onTap: () {
                  Navigator.pop(ctx);
                  _blockUser(
                    context,
                    reel: reel,
                    blockedUserId: authorId,
                    onBlockedLocally: onBlockedLocally,
                  );
                },
              ),
            if (allowDeleteOwn && isOwnReel && onDeleteOwn != null)
              ListTile(
                leading: const Icon(Icons.delete_outline),
                title: const Text('Delete from gallery'),
                onTap: () {
                  Navigator.pop(ctx);
                  onDeleteOwn();
                },
              ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  static Future<void> _reportContent(
    BuildContext context, {
    required FirebaseReelModel reel,
    required String authorId,
  }) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null || uid.isEmpty) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Sign in to report content.')),
        );
      }
      return;
    }

    String? selectedReason = _reportReasons.first;
    final detailsController = TextEditingController();

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setState) => AlertDialog(
          title: const Text('Report content'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Tell us what is wrong. We review reports within 24 hours.',
                  style: TextStyle(fontSize: 13),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: selectedReason,
                  decoration: const InputDecoration(
                    labelText: 'Reason',
                    border: OutlineInputBorder(),
                  ),
                  items: _reportReasons
                      .map(
                        (r) => DropdownMenuItem(value: r, child: Text(r)),
                      )
                      .toList(),
                  onChanged: (v) => setState(() => selectedReason = v),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: detailsController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Additional details (optional)',
                    border: OutlineInputBorder(),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Submit report'),
            ),
          ],
        ),
      ),
    );

    final details = detailsController.text.trim();
    detailsController.dispose();
    if (confirmed != true || selectedReason == null) return;
    if (!context.mounted) return;

    try {
      await FirestoreService().submitContentReport(
        reporterId: uid,
        reportType: 'reel',
        reelId: reel.reelId,
        reportedUserId: authorId,
        reason: selectedReason!,
        details: details.isEmpty ? null : details,
      );
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Report submitted. Our team will review it within 24 hours.',
            ),
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not submit report: $e')),
        );
      }
    }
  }

  static Future<void> _blockUser(
    BuildContext context, {
    required FirebaseReelModel reel,
    required String blockedUserId,
    required VoidCallback onBlockedLocally,
  }) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null || uid.isEmpty) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Sign in to block users.')),
        );
      }
      return;
    }

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Block this user?'),
        content: const Text(
          'Their reels will be removed from your feed immediately. '
          'We will be notified to review reported content within 24 hours.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Block'),
          ),
        ],
      ),
    );

    if (confirmed != true || !context.mounted) return;

    try {
      await FirestoreService().blockUser(
        blockerId: uid,
        blockedUserId: blockedUserId,
        reelId: reel.reelId,
        reason: 'Blocked from reel feed',
      );
      onBlockedLocally();
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('User blocked. Content hidden from your feed.')),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not block user: $e')),
        );
      }
    }
  }
}
