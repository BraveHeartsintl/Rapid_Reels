import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_routes.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  bool _hasNavigated = false;

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    // Wait for minimum display time (2.5 seconds)
    await Future.delayed(const Duration(milliseconds: 2500));
    
    if (!mounted || _hasNavigated) return;
    
    _navigateToNext();
  }

  void _navigateToNext() {
    if (_hasNavigated) return;
    _hasNavigated = true;

    _routeBasedOnAuth();
  }

  Future<void> _routeBasedOnAuth() async {
    final auth = FirebaseAuth.instance;
    User? user = auth.currentUser;

    // On cold starts currentUser may briefly be null before auth restores.
    if (user == null) {
      try {
        user = await auth.authStateChanges().first.timeout(
          const Duration(seconds: 2),
          onTimeout: () => null,
        );
      } catch (_) {
        user = null;
      }
    }

    if (!mounted) return;
    context.go(user != null ? AppRoutes.home : AppRoutes.onboarding);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF0A0A0F),
              Color(0xFF12101A),
              Color(0xFF0A0A0F),
            ],
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Spacer(),
            Image.asset(
              'assets/images/logo.png',
              width: 220,
              height: 220,
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) {
                return const Icon(
                  Icons.play_circle_filled_rounded,
                  size: 100,
                  color: Color(0xFF6C63FF),
                );
              },
            ),
            const Spacer(),
            const Padding(
              padding: EdgeInsets.only(bottom: 48),
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF6C63FF)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
