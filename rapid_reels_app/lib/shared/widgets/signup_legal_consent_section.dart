import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_routes.dart';
import '../../core/legal/legal_policy_catalog.dart';

/// UK GDPR–style signup consent: legal bundle (unchecked) + separate marketing opt-in.
class SignupLegalConsentSection extends StatelessWidget {
  const SignupLegalConsentSection({
    super.key,
    required this.agreeLegal,
    required this.onAgreeLegal,
    required this.marketingOptIn,
    required this.onMarketingOptIn,
    this.checkboxActiveColor,
    this.linkColor,
    this.showMarketingOptIn = true,
  });

  final bool agreeLegal;
  final ValueChanged<bool> onAgreeLegal;
  final bool marketingOptIn;
  final ValueChanged<bool> onMarketingOptIn;
  final Color? checkboxActiveColor;
  final Color? linkColor;
  final bool showMarketingOptIn;

  @override
  Widget build(BuildContext context) {
    final active = checkboxActiveColor ?? AppColors.primary;
    final link = linkColor ?? AppColors.secondary;

    TextButton linkButton(String label, String policyId) {
      return TextButton(
        style: TextButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 0),
          minimumSize: Size.zero,
          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          foregroundColor: link,
        ),
        onPressed: () => context.push(AppRoutes.legalPolicy(policyId)),
        child: Text(
          label,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            decoration: TextDecoration.underline,
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Checkbox(
              value: agreeLegal,
              onChanged: (v) => onAgreeLegal(v ?? false),
              activeColor: active,
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(top: 10),
                child: Wrap(
                  crossAxisAlignment: WrapCrossAlignment.center,
                  spacing: 2,
                  runSpacing: 2,
                  children: [
                    Text(
                      'I have read and agree to the',
                      style: TextStyle(
                        fontSize: 13,
                        height: 1.35,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    linkButton('Terms', LegalPolicyIds.terms),
                    const Text('·', style: TextStyle(fontSize: 13)),
                    linkButton('Privacy', LegalPolicyIds.privacy),
                    const Text('·', style: TextStyle(fontSize: 13)),
                    linkButton('Acceptable Use', LegalPolicyIds.acceptableUse),
                    Text(
                      '.',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        if (showMarketingOptIn) ...[
          const SizedBox(height: 4),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Checkbox(
                value: marketingOptIn,
                onChanged: (v) => onMarketingOptIn(v ?? false),
                activeColor: active,
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: Text(
                    'I would like to receive marketing communications from Rapid Reels '
                    '(optional — you can change your mind anytime).',
                    style: TextStyle(
                      fontSize: 13,
                      height: 1.35,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }
}
