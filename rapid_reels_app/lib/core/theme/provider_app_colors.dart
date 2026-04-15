import 'package:flutter/material.dart';

import '../constants/app_colors.dart';

/// Hamster-wheel blue (#1E90C0) + gold palette for the provider portal (aligned with customer app).
class ProviderAppColors {
  ProviderAppColors._();

  static const Color background = Color(0xFF141A1D);
  static const Color surface = Color(0xFF1D2529);
  static const Color card = Color(0xFF232D31);
  static const Color surfaceElevated = Color(0xFF2A353A);
  /// Search / pill inputs (e.g. dark grey search bar).
  static const Color searchBarFill = Color(0xFF2A353A);

  static const Color primary = AppColors.primary;
  static const Color onPrimary = AppColors.onPrimary;
  static const Color primaryDeep = AppColors.primaryDark;
  static const Color primaryMid = AppColors.primaryMid;

  static const Color textPrimary = Color(0xFFFFFFFF);
  /// Body / descriptions (off-white).
  static const Color textSecondary = Color(0xFFD2D2D1);
  static const Color textTertiary = Color(0xFF8D8E91);
  static const Color textMuted = Color(0xFF8D8E91);

  static const Color success = Color(0xFF4ADE80);
  static const Color warning = Color(0xFFF2B544);
  static const Color error = Color(0xFFE57373);
  /// Accent for info chips / stats (aligned with current [AppColors.info] usage).
  static const Color info = AppColors.info;
  static const Color outline = Color(0xFF3D484C);
  /// Slightly darker than [card] for image placeholders / borders.
  static const Color cardBackground = Color(0xFF1A2327);

  /// Primary CTA: glossy metallic teal (same as [AppColors.primaryGradient]).
  static const LinearGradient primaryGradient = AppColors.primaryGradient;

  static const LinearGradient primarySoftGradient = AppColors.primarySoftGradient;

  /// Glass nav / overlay tint (use with [BackdropFilter]).
  static Color glassSurface = const Color(0xFF1D2529).withValues(alpha: 0.72);
}
