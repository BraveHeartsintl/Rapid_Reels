import 'package:shared_preferences/shared_preferences.dart';

/// Tracks acceptance of community / UGC terms before viewing public reels (App Store 1.2).
abstract final class UgcCommunityPrefs {
  static const _key = 'ugc_community_terms_accepted_v1';

  static Future<bool> hasAccepted() async {
    final p = await SharedPreferences.getInstance();
    return p.getBool(_key) ?? false;
  }

  static Future<void> accept() async {
    final p = await SharedPreferences.getInstance();
    await p.setBool(_key, true);
  }

  static Future<void> clear() async {
    final p = await SharedPreferences.getInstance();
    await p.remove(_key);
  }
}
