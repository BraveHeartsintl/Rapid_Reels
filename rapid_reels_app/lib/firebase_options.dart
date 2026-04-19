// GENERATED MANUALLY based on your Firebase project configuration.
// If you later run `flutterfire configure`, it may overwrite this file.

import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

// DefaultFirebaseOptions is used by Firebase.initializeApp to provide
// per-platform configuration.

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        return windows;
      case TargetPlatform.linux:
        return linux;
      default:
        return web;
    }
  }

  // Web configuration (from your new Firebase project)
  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyCWx_eHXp8YQanxbU0oz1BUZeCLiWzd7Vs',
    appId: '1:583858856130:web:c3a3b4addc2a797e1e5b5b',
    messagingSenderId: '583858856130',
    projectId: 'rapidreelnew-de86a',
    authDomain: 'rapidreelnew-de86a.firebaseapp.com',
    storageBucket: 'rapidreelnew-de86a.firebasestorage.app',
    measurementId: 'G-BKPJHC4F2E',
  );

  // Android configuration (from google-services.json - NEW PROJECT rapidreelnew-de86a)
  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAAuzYnTH6DhyFewO57ITLXa2CJB7B1IX4',
    appId: '1:583858856130:android:e97b44940bea547f1e5b5b',
    messagingSenderId: '583858856130',
    projectId: 'rapidreelnew-de86a',
    storageBucket: 'rapidreelnew-de86a.firebasestorage.app',
  );

  // iOS configuration — fill in values from your GoogleService-Info.plist
  // after registering the iOS app in Firebase Console (project: rapidreelnew-de86a)
  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'REPLACE_WITH_API_KEY',             // API_KEY from GoogleService-Info.plist
    appId: 'REPLACE_WITH_APP_ID',               // GOOGLE_APP_ID from GoogleService-Info.plist
    messagingSenderId: '583858856130',
    projectId: 'rapidreelnew-de86a',
    storageBucket: 'rapidreelnew-de86a.firebasestorage.app',
    iosClientId: 'REPLACE_WITH_CLIENT_ID',      // CLIENT_ID from GoogleService-Info.plist
    iosBundleId: 'REPLACE_WITH_BUNDLE_ID',      // BUNDLE_ID from GoogleService-Info.plist
  );

  // For now, desktop platforms reuse the web config.
  static const FirebaseOptions macos = web;
  static const FirebaseOptions windows = web;
  static const FirebaseOptions linux = web;
}


