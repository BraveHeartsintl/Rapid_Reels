import 'package:shared_preferences/shared_preferences.dart';

/// Persists guest browse mode so users can explore without signing in (App Store 5.1.1).
class GuestSessionPrefs {
  GuestSessionPrefs._();

  static const _key = 'guest_browse_enabled';

  static Future<bool> isGuestBrowsing() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_key) ?? false;
  }

  static Future<void> enableGuestBrowsing() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_key, true);
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key);
  }
}
