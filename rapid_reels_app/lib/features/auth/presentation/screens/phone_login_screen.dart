import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/constants/app_routes.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../shared/widgets/custom_button.dart';
import '../../../../core/legal/ugc_community_prefs.dart';
import '../../../../shared/widgets/signup_legal_consent_section.dart';
import '../providers/auth_provider.dart';

class PhoneLoginScreen extends ConsumerStatefulWidget {
  const PhoneLoginScreen({super.key});

  @override
  ConsumerState<PhoneLoginScreen> createState() => _PhoneLoginScreenState();
}

class _PhoneLoginScreenState extends ConsumerState<PhoneLoginScreen> {
  static const _pendingMarketingKey = 'pending_signup_marketing';

  final TextEditingController _phoneController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  String _selectedCountryCode = '+44';
  int _rateLimitSeconds = 0;
  Timer? _rateLimitTimer;
  bool _agreeLegal = false;
  bool _marketingOptIn = false;

  // Common country codes
  final List<Map<String, String>> _countryCodes = [
    {'code': '+91', 'name': 'India', 'flag': '🇮🇳'},
    {'code': '+44', 'name': 'UK', 'flag': '🇬🇧'},
    {'code': '+1', 'name': 'USA', 'flag': '🇺🇸'},
    {'code': '+61', 'name': 'Australia', 'flag': '🇦🇺'},
    {'code': '+971', 'name': 'UAE', 'flag': '🇦🇪'},
    {'code': '+65', 'name': 'Singapore', 'flag': '🇸🇬'},
  ];

  @override
  void dispose() {
    _rateLimitTimer?.cancel();
    _phoneController.dispose();
    super.dispose();
  }

  void _startRateLimitTimer() {
    // Set cooldown period to 3 minutes (180 seconds)
    _rateLimitSeconds = 180;
    _rateLimitTimer?.cancel();
    _rateLimitTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_rateLimitSeconds > 0) {
        setState(() {
          _rateLimitSeconds--;
        });
      } else {
        timer.cancel();
        setState(() {
          _rateLimitSeconds = 0;
        });
      }
    });
  }

  String _formatTime(int seconds) {
    final minutes = seconds ~/ 60;
    final secs = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  String _friendlyGoogleError(Object error) {
    String message = error.toString();
    if (message.startsWith('Exception: ')) {
      message = message.substring(11);
    }
    if (message.startsWith('FirebaseAuthException: ')) {
      message = message.substring('FirebaseAuthException: '.length);
    }
    if (message.contains('sign_in_canceled')) {
      return 'Google sign-in was canceled.';
    }
    if (message.contains('ApiException: 10')) {
      return 'Google Sign-In is not configured correctly for this build. Please check SHA and OAuth client setup.';
    }
    if (message.contains('network') || message.contains('Network')) {
      return 'Network issue while signing in with Google. Please try again.';
    }
    return message;
  }

  Future<void> _sendOTP() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (!_agreeLegal) {
      Helpers.showSnackBar(
        context,
        'Please confirm you agree to the Terms, Privacy Policy, and Acceptable Use Policy.',
        isError: true,
      );
      return;
    }
    await UgcCommunityPrefs.accept();

    // Check if rate limited
    if (_rateLimitSeconds > 0) {
      Helpers.showSnackBar(
        context,
        'Please wait ${_formatTime(_rateLimitSeconds)} before trying again.',
        isError: true,
      );
      return;
    }

    setState(() => _isLoading = true);

    String phoneNumber = '$_selectedCountryCode${_phoneController.text}';

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_pendingMarketingKey, _marketingOptIn);

      final verificationId = await ref
          .read(authNotifierProvider.notifier)
          .verifyPhone(phoneNumber);

      setState(() => _isLoading = false);

      if (verificationId != null && mounted) {
        // Navigate to OTP verification screen
        context.push(
          AppRoutes.otpVerification,
          extra: {
            'verificationId': verificationId,
            'phoneNumber': phoneNumber,
          },
        );
      } else {
        if (mounted) {
          Helpers.showSnackBar(
            context,
            'Failed to send OTP. Please try again.',
            isError: true,
          );
        }
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        // Extract user-friendly error message
        String errorMessage = e.toString();
        
        // Remove "Exception: " prefix if present
        if (errorMessage.startsWith('Exception: ')) {
          errorMessage = errorMessage.substring(11);
        }
        
        // Check for rate limiting error
        if (errorMessage.contains('Too many attempts') || 
            errorMessage.contains('too-many-requests') ||
            errorMessage.contains('wait a few minutes')) {
          _startRateLimitTimer();
          errorMessage = 'Too many attempts. Please wait ${_formatTime(_rateLimitSeconds)} before trying again.';
        }
        
        // Show specific message for billing errors
        if (errorMessage.contains('BILLING_NOT_ENABLED') || 
            errorMessage.contains('billing') ||
            errorMessage.contains('billing-not-enabled')) {
          errorMessage = 'Phone authentication requires billing to be enabled in Firebase Console. Please enable billing to use this feature.';
        }
        
        Helpers.showSnackBar(
          context,
          errorMessage,
          isError: true,
        );
      }
    }
  }

  Future<void> _signInWithGoogle() async {
    if (!_agreeLegal) {
      Helpers.showSnackBar(
        context,
        'Please confirm you agree to the Terms, Privacy Policy, and Acceptable Use Policy.',
        isError: true,
      );
      return;
    }
    await UgcCommunityPrefs.accept();

    setState(() => _isLoading = true);

    try {
      final success = await ref
          .read(authNotifierProvider.notifier)
          .signInWithGoogle();

      if (success && mounted) {
        // Check if user profile exists
        final user = ref.read(currentUserProvider);
        if (user != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setBool(_pendingMarketingKey, _marketingOptIn);

          final profileExists = await ref
              .read(authNotifierProvider.notifier)
              .userProfileExists(user.uid);

          if (!mounted) return;

          if (profileExists) {
            context.go(AppRoutes.home);
          } else {
            context.go(AppRoutes.profileSetup);
          }
        }
      } else {
        if (mounted) {
          final authState = ref.read(authNotifierProvider);
          String errorMessage = 'Google Sign-In failed';
          authState.whenOrNull(
            error: (error, _) {
              errorMessage = _friendlyGoogleError(error);
            },
          );
          Helpers.showSnackBar(
            context,
            errorMessage,
            isError: true,
          );
        }
      }
    } catch (e) {
      if (mounted) {
        Helpers.showSnackBar(
          context,
          _friendlyGoogleError(e),
          isError: true,
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 40),

                // Logo
                Center(
                  child: Image.asset(
                    'assets/images/logo.png',
                    width: 130,
                    height: 130,
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) => Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        gradient: AppColors.primaryGradient,
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: const Icon(
                        Icons.play_circle_filled,
                        size: 60,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // Title
                const Text(
                  AppStrings.welcomeTitle,
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),

                // Subtitle
                const Text(
                  AppStrings.welcomeSubtitle,
                  style: TextStyle(
                    fontSize: 16,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 48),

                // Phone number input with country code selector
                Row(
                  children: [
                    // Country code dropdown
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: AppColors.cardBackground.withValues(alpha: 0.5),
                        ),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _selectedCountryCode,
                          icon: const Icon(Icons.arrow_drop_down, color: AppColors.textPrimary),
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 16,
                          ),
                          items: _countryCodes.map((country) {
                            return DropdownMenuItem<String>(
                              value: country['code'],
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 8.0),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      country['flag']!,
                                      style: const TextStyle(fontSize: 20),
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      country['code']!,
                                      style: const TextStyle(fontSize: 16),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }).toList(),
                          onChanged: (String? newValue) {
                            if (newValue != null) {
                              setState(() {
                                _selectedCountryCode = newValue;
                              });
                            }
                          },
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Phone number input
                    Expanded(
                      child: TextFormField(
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        maxLength: 15,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                        ],
                        decoration: InputDecoration(
                          labelText: AppStrings.phoneNumberLabel,
                          prefixIcon: const Icon(Icons.phone_outlined),
                          counterText: '',
                          filled: true,
                          fillColor: AppColors.surface,
                        ),
                        validator: Validators.validatePhone,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                SignupLegalConsentSection(
                  agreeLegal: _agreeLegal,
                  onAgreeLegal: (v) => setState(() => _agreeLegal = v),
                  marketingOptIn: _marketingOptIn,
                  onMarketingOptIn: (v) => setState(() => _marketingOptIn = v),
                ),
                const SizedBox(height: 24),

                // Send OTP Button
                CustomButton(
                  text: _rateLimitSeconds > 0
                      ? 'Wait ${_formatTime(_rateLimitSeconds)}'
                      : AppStrings.sendOTP,
                  onPressed: (_isLoading || _rateLimitSeconds > 0) ? null : _sendOTP,
                  isLoading: _isLoading,
                  borderRadius: 12,
                ),
                // Rate limit message
                if (_rateLimitSeconds > 0)
                  Padding(
                    padding: const EdgeInsets.only(top: 8.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.timer_outlined,
                          size: 16,
                          color: AppColors.textSecondary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Too many attempts. Please wait ${_formatTime(_rateLimitSeconds)}',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 24),

                // Divider with OR
                Row(
                  children: [
                    const Expanded(child: Divider()),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text(
                        'OR',
                        style: TextStyle(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                    const Expanded(child: Divider()),
                  ],
                ),
                const SizedBox(height: 24),

                // Google Sign In Button
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: _isLoading ? null : _signInWithGoogle,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.secondary,
                      side: const BorderSide(color: AppColors.secondary),
                    ),
                    icon: const Icon(Icons.g_mobiledata, size: 32),
                    label: const Text('Continue with Google'),
                  ),
                ),
                const SizedBox(height: 24),
                TextButton(
                  onPressed: () => context.go(AppRoutes.roleSelection),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.secondary,
                  ),
                  child: const Text(
                    'Choose account type',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

