import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/constants/app_strings.dart';
import 'core/router/app_router.dart';
import 'shared/widgets/cookie_consent_host.dart';

class RapidReelsApp extends StatelessWidget {
  const RapidReelsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: AppStrings.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      routerConfig: AppRouter.router,
      builder: (context, child) {
        return CookieConsentHost(
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
  }
}

