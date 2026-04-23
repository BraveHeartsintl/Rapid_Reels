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

  // iOS configuration (from GoogleService-Info.plist)
  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyAwXJoM2yPm6mVA6PGRqBk03T5sR2fFazc',
    appId: '1:583858856130:ios:457d5d8468faf7b31e5b5b',
    messagingSenderId: '583858856130',
    projectId: 'rapidreelnew-de86a',
    storageBucket: 'rapidreelnew-de86a.firebasestorage.app',
    iosClientId: '583858856130-10533mk9j8ol308a2vfrtsofjjihtqgt.apps.googleusercontent.com',
    iosBundleId: 'com.rapidreel.app',
  );

  // For now, desktop platforms reuse the web config.
  static const FirebaseOptions macos = web;
  static const FirebaseOptions windows = web;
  static const FirebaseOptions linux = web;
}


