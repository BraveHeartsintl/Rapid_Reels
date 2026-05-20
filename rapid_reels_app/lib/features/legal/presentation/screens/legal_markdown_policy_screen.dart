import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/legal/legal_policy_catalog.dart';

/// Renders a bundled markdown policy from [assets/legal/](rapid_reels_app/assets/legal/).
class LegalMarkdownPolicyScreen extends StatefulWidget {
  const LegalMarkdownPolicyScreen({super.key, required this.policyId});

  final String policyId;

  @override
  State<LegalMarkdownPolicyScreen> createState() =>
      _LegalMarkdownPolicyScreenState();
}

class _LegalMarkdownPolicyScreenState extends State<LegalMarkdownPolicyScreen> {
  late final Future<String> _markdownFuture;

  @override
  void initState() {
    super.initState();
    final id = widget.policyId;
    if (!LegalPolicyIds.isValid(id)) {
      _markdownFuture = Future.value(
        '# Unavailable\n\nThis legal document could not be found.',
      );
    } else {
      _markdownFuture =
          rootBundle.loadString(LegalPolicyIds.assetPath(id));
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = LegalPolicyIds.title(widget.policyId);
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => context.pop(),
        ),
        title: Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: FutureBuilder<String>(
        future: _markdownFuture,
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  'Could not load this document.\n${snapshot.error}',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppColors.textSecondary),
                ),
              ),
            );
          }
          if (!snapshot.hasData) {
            return const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            );
          }
          final sheet = MarkdownStyleSheet.fromTheme(Theme.of(context)).copyWith(
              h1: const TextStyle(
                color: AppColors.textPrimary,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
              h2: const TextStyle(
                color: AppColors.textPrimary,
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
              h3: const TextStyle(
                color: AppColors.textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
              p: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 14,
                height: 1.5,
              ),
              listBullet: const TextStyle(color: AppColors.textSecondary),
              strong: const TextStyle(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w700,
              ),
              horizontalRuleDecoration: BoxDecoration(
                border: Border(
                  top: BorderSide(
                    color: AppColors.textTertiary.withValues(alpha: 0.35),
                  ),
                ),
              ),
            );
          return SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
            child: MarkdownBody(
              data: snapshot.data!,
              selectable: true,
              styleSheet: sheet,
            ),
          );
        },
      ),
    );
  }
}
