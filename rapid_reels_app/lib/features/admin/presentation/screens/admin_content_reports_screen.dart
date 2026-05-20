import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/firebase/services/firestore_service.dart';

/// Admin queue for UGC reports and user blocks (24h review SLA).
class AdminContentReportsScreen extends StatefulWidget {
  const AdminContentReportsScreen({super.key});

  @override
  State<AdminContentReportsScreen> createState() =>
      _AdminContentReportsScreenState();
}

class _AdminContentReportsScreenState extends State<AdminContentReportsScreen> {
  final _firestore = FirestoreService();
  bool _loading = true;
  List<Map<String, dynamic>> _reports = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final reports = await _firestore.getPendingContentReports();
      if (!mounted) return;
      setState(() {
        _reports = reports;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unable to load reports: $e')),
      );
    }
  }

  Future<void> _resolveWithAction(
    Map<String, dynamic> report, {
    required String status,
    bool unpublishReel = false,
    bool suspendUser = false,
  }) async {
    final id = report['id'] as String?;
    if (id == null) return;
    final reportedUser = report['reportedUserId'] as String? ?? '';
    try {
      await _firestore.resolveContentReportWithAction(
        reportId: id,
        status: status,
        unpublishReel: unpublishReel,
        suspendReportedUser: suspendUser,
        reportedUserId: reportedUser,
        adminNote: suspendUser
            ? 'Content removed; user suspended (24h UGC review)'
            : unpublishReel
                ? 'Content removed from public feed'
                : null,
      );
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            suspendUser
                ? 'Report resolved — reel removed and user suspended'
                : 'Report marked $status',
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Action failed: $e')),
      );
    }
  }

  Future<void> _confirmSuspend(Map<String, dynamic> report) async {
    final reelId = report['reelId'] as String? ?? '';
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Remove content & suspend user?'),
        content: const Text(
          'This unpublishes the reported reel (if any) and suspends the '
          'reported user account. Use for serious violations per our zero-tolerance policy.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Suspend user'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    await _resolveWithAction(
      report,
      status: 'resolved',
      unpublishReel: reelId.isNotEmpty,
      suspendUser: true,
    );
  }

  String _formatTime(dynamic ts) {
    if (ts is Timestamp) {
      final dt = ts.toDate();
      return '${dt.day}/${dt.month}/${dt.year} ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
    }
    return '';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        title: const Text(
          'Content reports',
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
          : _reports.isEmpty
              ? const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: Text(
                      'No pending reports. Review user flags and blocks within 24 hours when they appear.',
                      textAlign: TextAlign.center,
                    ),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _reports.length,
                  itemBuilder: (context, index) {
                    final r = _reports[index];
                    final type = r['reportType'] as String? ?? 'reel';
                    final reason = r['reason'] as String? ?? '';
                    final details = r['details'] as String? ?? '';
                    final reelId = r['reelId'] as String? ?? '';
                    final reportedUser = r['reportedUserId'] as String? ?? '';
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              type == 'user_block'
                                  ? 'User blocked'
                                  : 'Content report',
                              style: const TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text('Reason: $reason'),
                            if (details.isNotEmpty) Text('Details: $details'),
                            if (reelId.isNotEmpty)
                              Text('Reel: $reelId', style: const TextStyle(fontSize: 12)),
                            Text('User: $reportedUser', style: const TextStyle(fontSize: 12)),
                            Text(
                              _formatTime(r['createdAt']),
                              style: TextStyle(
                                fontSize: 12,
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: [
                                if (reelId.isNotEmpty)
                                  OutlinedButton(
                                    onPressed: () => _resolveWithAction(
                                      r,
                                      status: 'resolved',
                                      unpublishReel: true,
                                    ),
                                    child: const Text('Remove reel'),
                                  ),
                                if (reportedUser.isNotEmpty)
                                  FilledButton(
                                    style: FilledButton.styleFrom(
                                      backgroundColor: AppColors.error,
                                    ),
                                    onPressed: () => _confirmSuspend(r),
                                    child: const Text('Remove & suspend user'),
                                  ),
                                FilledButton(
                                  onPressed: () =>
                                      _resolveWithAction(r, status: 'resolved'),
                                  child: const Text('Resolve'),
                                ),
                                TextButton(
                                  onPressed: () =>
                                      _resolveWithAction(r, status: 'dismissed'),
                                  child: const Text('Dismiss'),
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
