import 'package:flutter/material.dart';

import 'provider_gradient_button.dart';

/// Same glossy metallic treatment as [ProviderGradientButton], pill radius 20.
class ProviderPrimaryButton extends StatelessWidget {
  const ProviderPrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.expanded = true,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool expanded;

  @override
  Widget build(BuildContext context) {
    final child = ProviderGradientButton(
      onPressed: onPressed,
      label: label,
      icon: icon != null ? Icon(icon) : null,
      fullWidth: expanded,
      borderRadius: 20,
    );
    if (expanded) {
      return SizedBox(width: double.infinity, child: child);
    }
    return child;
  }
}
