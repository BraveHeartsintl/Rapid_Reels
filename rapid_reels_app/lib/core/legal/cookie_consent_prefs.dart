import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'cookie_consent_platform.dart';

/// Persists cookie / non-essential processing choices and syncs Firebase Analytics.
abstract final class CookieConsentPrefs {
  static const _completedKey = 'cookie_consent_completed_v1';
  static const _analyticsKey = 'cookie_pref_analytics_v1';
  static const _marketingKey = 'cookie_pref_marketing_v1';

  static Future<bool> isConsentCompleted() async {
    if (!kShowsCookieConsentUi) return true;
    final p = await SharedPreferences.getInstance();
    return p.getBool(_completedKey) ?? false;
  }

  static Future<bool> analyticsEnabled() async {
    final p = await SharedPreferences.getInstance();
    return p.getBool(_analyticsKey) ?? false;
  }

  static Future<bool> marketingEnabled() async {
    final p = await SharedPreferences.getInstance();
    return p.getBool(_marketingKey) ?? false;
  }

  /// Until the user completes the banner, keep measurement off (strict opt-in).
  /// On iOS, analytics stays off — we do not use the app for cross-app ad tracking.
  static Future<void> syncFirebaseAnalyticsCollection() async {
    if (!kShowsCookieConsentUi) {
      await FirebaseAnalytics.instance.setAnalyticsCollectionEnabled(false);
      return;
    }
    final p = await SharedPreferences.getInstance();
    final completed = p.getBool(_completedKey) ?? false;
    final allow = completed && (p.getBool(_analyticsKey) ?? false);
    await FirebaseAnalytics.instance.setAnalyticsCollectionEnabled(allow);
  }

  static Future<void> acceptAll() async {
    final p = await SharedPreferences.getInstance();
    await p.setBool(_completedKey, true);
    await p.setBool(_analyticsKey, true);
    await p.setBool(_marketingKey, true);
    await FirebaseAnalytics.instance.setAnalyticsCollectionEnabled(true);
  }

  static Future<void> rejectAll() async {
    final p = await SharedPreferences.getInstance();
    await p.setBool(_completedKey, true);
    await p.setBool(_analyticsKey, false);
    await p.setBool(_marketingKey, false);
    await FirebaseAnalytics.instance.setAnalyticsCollectionEnabled(false);
  }

  static Future<void> saveCustom({
    required bool analytics,
    required bool marketing,
  }) async {
    final p = await SharedPreferences.getInstance();
    await p.setBool(_completedKey, true);
    await p.setBool(_analyticsKey, analytics);
    await p.setBool(_marketingKey, marketing);
    await FirebaseAnalytics.instance.setAnalyticsCollectionEnabled(analytics);
  }
}
