import 'package:flutter/material.dart';

class AppColors {
  // Wheel-tuned blue: body-forward (#2C849F) with softer shadow and glossy highlight.
  static const Color background = Color(0xFF141A1D);
  static const Color primary = Color(0xFF2C849F);
  static const Color secondary = Color(0xFFF3C759);
  static const Color accent = Color(0xFF8D8E91);
  static const Color primaryDark = Color(0xFF1A5E79);
  /// Mid-tone for brushed-metal body between [primaryDark] and highlights.
  static const Color primaryMid = Color(0xFF2F8FA8);
  /// Specular strip in metallic gradients (wheel rim highlight).
  static const Color primarySpecular = Color(0xFF4CAAC0);

  // Surfaces
  static const Color surface = Color(0xFF1D2529);
  static const Color cardBackground = Color(0xFF232D31);
  static const Color surfaceElevated = Color(0xFF2A353A);
  
  // Text colors
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFD2D2D1);
  static const Color textTertiary = Color(0xFF8D8E91);
  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color onSecondary = Color(0xFFFFFFFF);
  
  // Status colors
  static const Color success = Color(0xFF4ADE80);
  static const Color warning = Color(0xFFF2B544);
  static const Color error = Color(0xFFE57373);
  static const Color info = primary;
  
  // Event type colors
  static const Color wedding = primary;
  static const Color birthday = Color(0xFF3A8AA4);
  static const Color engagement = primaryDark;
  static const Color corporate = Color(0xFFF3C759);
  static const Color brand = Color(0xFFDDBA63);
  static const Color other = Color(0xFF8D8E91);
  
  /// Top sheen for metallic blue surfaces.
  static const LinearGradient primaryGlossOverlay = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      Color(0x96FFFFFF),
      Color(0x66D6EEF6),
      Color(0x2AA8D3E1),
      Color(0x00FFFFFF),
    ],
    stops: [0.0, 0.1, 0.32, 0.62],
  );

  /// Curved reflection bloom to make surfaces read as glossy lacquer.
  static const RadialGradient primaryGlossBloomOverlay = RadialGradient(
    center: Alignment(0.0, -0.88),
    radius: 1.1,
    colors: [
      Color(0x66FFFFFF),
      Color(0x3DDCF1F8),
      Color(0x129FCEDF),
      Color(0x00000000),
    ],
    stops: [0.0, 0.28, 0.54, 1.0],
  );

  /// Thin top-edge sparkle to finish glossy surfaces.
  static const LinearGradient primaryTopEdgeGlossOverlay = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      Color(0xCCFFFFFF),
      Color(0x59E6F5FA),
      Color(0x00FFFFFF),
    ],
    stops: [0.0, 0.08, 0.2],
  );

  /// Narrow vertical strip that mimics a brushed-metal specular streak.
  static const LinearGradient primaryMetallicStreakOverlay = LinearGradient(
    begin: Alignment(-0.18, -1.0),
    end: Alignment(0.22, 1.0),
    colors: [
      Color(0x00FFFFFF),
      Color(0x1AD0E9F2),
      Color(0x36E7F7FE),
      Color(0x16B8DFEB),
      Color(0x00FFFFFF),
    ],
    stops: [0.0, 0.4, 0.52, 0.66, 1.0],
  );

  // Multi-stop diagonal with alternating dark/light bands for metallic depth.
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment(-0.92, -0.96),
    end: Alignment(0.92, 0.96),
    colors: [
      Color(0xFF123F54),
      Color(0xFF1A5870),
      Color(0xFF66BFD4),
      Color(0xFF2A7F9C),
      Color(0xFF206A83),
      primaryDark,
      Color(0xFF247895),
      primary,
      primaryMid,
      Color(0xFF3698B1),
      primarySpecular,
      Color(0xFF61B7CB),
      Color(0xFF4DA2B9),
      Color(0xFF3A8AA4),
      Color(0xFF2A6E8A),
    ],
    stops: [0.0, 0.06, 0.13, 0.2, 0.28, 0.38, 0.48, 0.58, 0.67, 0.74, 0.82, 0.89, 0.95, 0.98, 1.0],
  );

  /// Softer metallic for chips / cards (less specular than [primaryGradient]).
  static const LinearGradient primarySoftGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xFF1E6079),
      primary,
      Color(0xFF56AFC5),
    ],
  );
  
  static const LinearGradient cardGradient = LinearGradient(
    colors: [Color(0xFF1D2529), Color(0xFF2A353A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient accentGradient = primarySoftGradient;

  // Home premium layer tokens
  static const Color homeGlowCyan = primary;
  static const Color homeGlowMagenta = Color(0xFFF3C759);
  static const Color homeGlowLime = Color(0xFF8D8E91);
  static const Color homePatternLine = Color(0x22FFFFFF);
  static const Color homeVignette = Color(0xCC000000);

  static const Color homeGlassBorder = Color(0x3DFFFFFF);
  static const Color homeGlassFillTop = Color(0xB3232D31);
  static const Color homeGlassFillBottom = Color(0x8C2A353A);
  static const Color homeGlassShadow = Color(0x33000000);

  static const LinearGradient homeGlassGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [homeGlassFillTop, homeGlassFillBottom],
  );
}

