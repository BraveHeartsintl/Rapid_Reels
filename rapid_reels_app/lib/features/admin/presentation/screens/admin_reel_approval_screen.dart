import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/firebase/models/firebase_reel_model.dart';
import '../../../../core/firebase/services/firestore_service.dart';

/// Admin queue: approve provider reels before they appear in discover (Guideline 1.2).
class AdminReelApprovalScreen extends StatefulWidget {
  const AdminReelApprovalScreen({super.key});

  @override
  State<AdminReelApprovalScreen> createState() => _AdminReelApprovalScreenState();
}

class _AdminReelApprovalScreenState extends State<AdminReelApprovalScreen> {
  final _firestore = FirestoreService();
  bool _loading = true;
  List<FirebaseReelModel> _pending = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final list = await _firestore.getReelsPendingModeration();
      if (!mounted) return;
      setState(() {
        _pending = list;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unable to load queue: $e')),
      );
    }
  }

  Future<void> _approve(FirebaseReelModel reel) async {
    try {
      await _firestore.approveReelForModeration(reel.reelId);
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Reel approved for public discover.')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Approve failed: $e')),
      );
    }
  }

  Future<void> _reject(FirebaseReelModel reel) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Reject reel?'),
        content: const Text(
          'This reel will not appear in discover and will be archived.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Reject'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await _firestore.unpublishReelForModeration(reel.reelId);
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Reel rejected.')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Reject failed: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        title: const Text(
          'Reel approval queue',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            onPressed: _loading ? null : _load,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _pending.isEmpty
              ? const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: Text(
                      'No reels awaiting approval.\n'
                      'New provider uploads appear here for review before discover.',
                      textAlign: TextAlign.center,
                    ),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _pending.length,
                  itemBuilder: (context, index) {
                    final reel = _pending[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              reel.title,
                              style: const TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${reel.eventType} · Provider ${reel.providerId}',
                              style: const TextStyle(fontSize: 12),
                            ),
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 8,
                              children: [
                                FilledButton(
                                  onPressed: () => _approve(reel),
                                  child: const Text('Approve for discover'),
                                ),
                                OutlinedButton(
                                  onPressed: () => _reject(reel),
                                  child: const Text('Reject'),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
