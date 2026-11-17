/// Apple Sign In + Firebase Auth identifiers (not secrets).
class AppleAuthConfig {
  AppleAuthConfig._();

  static const String bundleId = 'com.rapidreel.app';
  static const String servicesId = 'com.rapidreel.app.service';
  static const String teamId = 'NF7GV8RW4L';

  /// Firebase OAuth redirect — must match Apple Services ID Return URL exactly.
  static const String firebaseAuthRedirectUri =
      'https://rapidreelnew-de86a.firebaseapp.com/__/auth/handler';
}
