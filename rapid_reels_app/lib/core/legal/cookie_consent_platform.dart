import 'package:flutter/foundation.dart';

/// Whether the app should show EU-style cookie consent UI (banner, marketing toggles).
///
/// On iOS we do not collect cookies or device identifiers for cross-app advertising
/// tracking, so App Store Guideline 5.1.2(i) is satisfied by omitting cookie prompts.
bool get kShowsCookieConsentUi =>
    !kIsWeb && defaultTargetPlatform != TargetPlatform.iOS;
