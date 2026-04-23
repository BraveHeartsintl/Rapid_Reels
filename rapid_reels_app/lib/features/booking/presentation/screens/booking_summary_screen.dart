import 'dart:math' as math;

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../../core/config/stripe_config.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_routes.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/firebase/booking_callable_payload.dart';
import '../../../../core/firebase/models/firebase_offer_model.dart';
import '../../../../core/firebase/models/firebase_provider_model.dart';
import '../../../../core/firebase/services/firestore_service.dart';
import '../../../../shared/widgets/custom_app_bar.dart';
import '../../../../shared/widgets/custom_button.dart';
import '../../data/adapters/booking_firebase_adapter.dart';
import '../../data/services/stripe_payment_service.dart';

class BookingSummaryScreen extends StatefulWidget {
  final Map<String, dynamic> bookingData;

  const BookingSummaryScreen({super.key, required this.bookingData});

  @override
  State<BookingSummaryScreen> createState() => _BookingSummaryScreenState();
}

class _BookingSummaryScreenState extends State<BookingSummaryScreen> {
  bool _acceptedTerms = false;
  bool _isProcessing = false;
  final _firestoreService = FirestoreService();
  final _stripePaymentService = StripePaymentService();
  final TextEditingController _couponController = TextEditingController();
  FirebaseOfferModel? _appliedOffer;
  double _discountAmount = 0;
  bool _couponApplying = false;
  String? _couponError;

  @override
  void dispose() {
    _couponController.dispose();
    super.dispose();
  }

  double _computeOfferDiscount(FirebaseOfferModel offer, double subtotal) {
    final d = offer.discount;
    if (d.minPurchaseAmount != null && subtotal < d.minPurchaseAmount!) {
      return 0;
    }
    final t = offer.type.toLowerCase();
    if (t.contains('percentage') ||
        (d.percentage != null && d.percentage! > 0)) {
      final pct = d.percentage ?? 0;
      var off = subtotal * (pct / 100);
      if (d.maxDiscount != null && off > d.maxDiscount!) {
        off = d.maxDiscount!;
      }
      return math.min(off, subtotal);
    }
    if (t.contains('amount') || (d.amount != null && d.amount! > 0)) {
      return math.min(d.amount ?? 0, subtotal);
    }
    return 0;
  }

  bool _offerMatchesBooking(FirebaseOfferModel offer) {
    final eventType = widget.bookingData['eventType']?.toString() ?? '';
    if (offer.applicableEventTypes != null &&
        offer.applicableEventTypes!.isNotEmpty) {
      if (!offer.applicableEventTypes!.contains(eventType)) return false;
    }
    final pkg = widget.bookingData['package'];
    String pkgId = '';
    if (pkg is Map<String, dynamic>) {
      pkgId = pkg['packageId']?.toString() ?? '';
    }
    if (pkgId.isEmpty) {
      pkgId = widget.bookingData['packageId']?.toString() ?? '';
    }
    if (offer.applicablePackages != null &&
        offer.applicablePackages!.isNotEmpty) {
      if (pkgId.isEmpty || !offer.applicablePackages!.contains(pkgId)) {
        return false;
      }
    }
    return true;
  }

  Future<void> _applyCoupon() async {
    final code = _couponController.text.trim();
    if (code.isEmpty) {
      setState(() => _couponError = 'Enter a coupon code');
      return;
    }
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Sign in to apply a coupon.'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    final totalAmountNum =
        (widget.bookingData['totalAmount'] is num)
            ? (widget.bookingData['totalAmount'] as num).toDouble()
            : 0.0;

    setState(() {
      _couponApplying = true;
      _couponError = null;
    });

    try {
      final offer = await _firestoreService.validateOfferCode(code, user.uid);
      if (offer == null) {
        if (!mounted) return;
        setState(() {
          _appliedOffer = null;
          _discountAmount = 0;
          _couponError = 'Invalid or expired code';
        });
        return;
      }
      if (!_offerMatchesBooking(offer)) {
        if (!mounted) return;
        setState(() {
          _appliedOffer = null;
          _discountAmount = 0;
          _couponError = 'This code does not apply to this booking';
        });
        return;
      }
      final discount = _computeOfferDiscount(offer, totalAmountNum);
      if (discount <= 0) {
        if (!mounted) return;
        setState(() {
          _appliedOffer = null;
          _discountAmount = 0;
          _couponError = 'This code does not apply to this amount';
        });
        return;
      }
      if (!mounted) return;
      setState(() {
        _appliedOffer = offer;
        _discountAmount = discount;
        _couponError = null;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _couponError = 'Could not validate code';
        _appliedOffer = null;
        _discountAmount = 0;
      });
    } finally {
      if (mounted) {
        setState(() => _couponApplying = false);
      }
    }
  }

  void _clearCoupon() {
    setState(() {
      _appliedOffer = null;
      _discountAmount = 0;
      _couponError = null;
      _couponController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    final pkg = widget.bookingData['package'] as Map<String, dynamic>?;
    final standardPackageSelected =
        widget.bookingData['standardPackageSelected'] != false;
    final customAmount =
        (widget.bookingData['customAmount'] as num?)?.toDouble() ?? 0.0;
    final packageName = pkg?['name']?.toString() ?? '';
    final packagePrice = (pkg?['price'] as num?)?.toDouble() ?? 0.0;
    final packageDurationMinutes = (pkg?['duration'] as num?)?.toInt() ?? 0;
    final packageReelsCount = (pkg?['reelsCount'] as num?)?.toInt() ?? 0;
    final additionalReels = (widget.bookingData['additionalReels'] as num?)?.toInt() ?? 0;
    final includeDrone = widget.bookingData['includeDrone'] == true;
    final additionalReelCost = additionalReels * 20.0;
    final droneCost = includeDrone ? 50.0 : 0.0;
    final providerId = widget.bookingData['providerId']?.toString() ?? '';
    final currency =
        (widget.bookingData['paymentCurrency']?.toString().trim().toLowerCase().isNotEmpty ??
                false)
            ? widget.bookingData['paymentCurrency'].toString().trim().toLowerCase()
            : 'gbp';
    const currencySymbol = '£';
    final totalAmountNum =
        (widget.bookingData['totalAmount'] is num)
            ? (widget.bookingData['totalAmount'] as num).toDouble()
            : 0.0;
    final configuredAdvance =
        (widget.bookingData['advanceAmount'] is num)
            ? (widget.bookingData['advanceAmount'] as num).toDouble()
            : 0.0;
    final effectiveTotal =
        math.max(0.0, totalAmountNum - _discountAmount);
    var advanceForPayment = configuredAdvance;
    if (totalAmountNum > 0 &&
        configuredAdvance > 0 &&
        _discountAmount > 0) {
      advanceForPayment =
          configuredAdvance * (effectiveTotal / totalAmountNum);
    }
    final payableAmount = _resolvePayableAmount(
      currency: currency,
      configuredAdvance: advanceForPayment,
      totalAmount: effectiveTotal,
    );

    return PopScope(
      canPop: !_isProcessing,
      child: Scaffold(
      backgroundColor: AppColors.background,
      appBar: const CustomAppBar(title: 'Review Booking'),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Success Icon
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.check_circle,
                        size: 60,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  const Center(
                    child: Text(
                      'Review Your Booking',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Center(
                    child: Text(
                      'Please review all details before confirming',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Event Details
                  _buildSection('Event Details', [
                    if (widget.bookingData['catalogueTitle'] != null &&
                        widget.bookingData['catalogueTitle']
                            .toString()
                            .isNotEmpty)
                      _buildDetailRow(
                        'Offering',
                        widget.bookingData['catalogueTitle'].toString(),
                      ),
                    _buildDetailRow(
                      'Event Name',
                      widget.bookingData['eventName'],
                    ),
                    _buildDetailRow(
                      'Event Type',
                      _formatEventType(widget.bookingData['eventType']),
                    ),
                    _buildDetailRow(
                      'Date',
                      DateFormat(
                        'dd MMM yyyy',
                      ).format(widget.bookingData['eventDate']),
                    ),
                    _buildDetailRow(
                      'Time',
                      widget.bookingData['eventTime'].format(context),
                    ),
                    _buildDetailRow(
                      'Duration',
                      '${widget.bookingData['duration']} hours',
                    ),
                    _buildDetailRow(
                      'Guest Count',
                      '${widget.bookingData['guestCount']} guests',
                    ),
                  ]),

                  // Venue Details
                  _buildSection('Venue', [
                    _buildDetailRow('Name', widget.bookingData['venueName']),
                    _buildDetailRow(
                      'Address',
                      widget.bookingData['venueAddress'],
                    ),
                    _buildDetailRow('City', widget.bookingData['venueCity']),
                  ]),

                  // Provider Details
                  if (providerId.isNotEmpty)
                    FutureBuilder<FirebaseProviderModel?>(
                      future: _firestoreService.getProvider(providerId),
                      builder: (context, snapshot) {
                        final provider = snapshot.data;
                        if (snapshot.connectionState ==
                            ConnectionState.waiting) {
                          return _buildSection('Service Provider', const [
                            Text('Loading provider...'),
                          ]);
                        }
                        if (provider == null) return const SizedBox.shrink();
                        return _buildSection('Service Provider', [
                          _buildDetailRow('Provider', provider.businessName),
                          _buildDetailRow('Rating', '${provider.rating} ⭐'),
                          _buildDetailRow(
                            'Updates',
                            AppStrings.providerContactViaApp,
                          ),
                        ]);
                      },
                    ),

                  // Package Details
                  _buildSection(
                    standardPackageSelected ? 'Package' : 'Custom Amount',
                    standardPackageSelected
                        ? [
                            _buildDetailRow('Package', packageName),
                            _buildDetailRow(
                              'Coverage',
                              '${packageDurationMinutes ~/ 60} hours',
                            ),
                            _buildDetailRow(
                              'Reels',
                              packageReelsCount == -1
                                  ? 'Unlimited'
                                  : '$packageReelsCount',
                            ),
                            _buildDetailRow(
                              'Editing',
                              widget.bookingData['editingStyle'],
                            ),
                            if (additionalReels > 0)
                              _buildDetailRow(
                                'Additional Reels',
                                '$additionalReels (+£${additionalReelCost.toStringAsFixed(2)})',
                              ),
                            if (includeDrone)
                              _buildDetailRow(
                                'Drone Footage',
                                'Included (+£${droneCost.toStringAsFixed(2)})',
                              ),
                          ]
                        : [
                            _buildDetailRow(
                              'Selected Amount',
                              _formatMoney(customAmount, currency),
                            ),
                          ],
                  ),

                  // Coupon
                  _buildSection(
                    'Coupon code',
                    [
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _couponController,
                              textCapitalization: TextCapitalization.characters,
                              inputFormatters: [
                                FilteringTextInputFormatter.allow(
                                  RegExp(r'[A-Za-z0-9_-]')),
                              ],
                              decoration: InputDecoration(
                                hintText: 'Enter code',
                                filled: true,
                                fillColor: AppColors.background,
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: BorderSide(
                                    color: AppColors.cardBackground
                                        .withValues(alpha: 0.6),
                                  ),
                                ),
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 14,
                                ),
                              ),
                              onSubmitted: (_) => _applyCoupon(),
                            ),
                          ),
                          const SizedBox(width: 10),
                          TextButton(
                            onPressed:
                                _couponApplying ? null : _applyCoupon,
                            child: _couponApplying
                                ? const SizedBox(
                                    width: 22,
                                    height: 22,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  )
                                : const Text('Apply'),
                          ),
                        ],
                      ),
                      if (_couponError != null) ...[
                        const SizedBox(height: 8),
                        Text(
                          _couponError!,
                          style: const TextStyle(
                            color: Colors.orange,
                            fontSize: 13,
                          ),
                        ),
                      ],
                      if (_appliedOffer != null && _discountAmount > 0) ...[
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                'Applied: ${_appliedOffer!.code}',
                                style: const TextStyle(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            TextButton(
                              onPressed: _clearCoupon,
                              child: const Text('Remove'),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),

                  // Payment Breakdown
                  _buildSection('Payment', [
                    _buildDetailRow(
                      standardPackageSelected ? 'Base Price' : 'Custom Amount',
                      _formatMoney(
                        standardPackageSelected ? packagePrice : customAmount,
                        currency,
                      ),
                    ),
                    const Divider(height: 24),
                    _buildDetailRow(
                      'Subtotal',
                      _formatMoney(totalAmountNum, currency),
                    ),
                    if (_discountAmount > 0) ...[
                      _buildDetailRow(
                        'Coupon discount',
                        '-${_formatMoney(_discountAmount, currency)}',
                      ),
                    ],
                    _buildDetailRow(
                      'Total',
                      _formatMoney(effectiveTotal, currency),
                      isTotal: true,
                    ),
                    _buildDetailRow(
                      'Total Payment',
                      _formatMoney(payableAmount, currency),
                      subtitle: 'Full amount due now',
                    ),
                  ]),

                  // Terms & Conditions
                  Container(
                    margin: const EdgeInsets.only(top: 24),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Checkbox(
                          value: _acceptedTerms,
                          onChanged: (value) =>
                              setState(() => _acceptedTerms = value ?? false),
                          activeColor: AppColors.primary,
                        ),
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.only(top: 12),
                            child: GestureDetector(
                              onTap: () => _showTermsDialog(),
                              child: RichText(
                                text: TextSpan(
                                  style: const TextStyle(
                                    fontSize: 14,
                                    color: AppColors.textSecondary,
                                    height: 1.4,
                                  ),
                                  children: [
                                    const TextSpan(text: 'I agree to the '),
                                    TextSpan(
                                      text: 'Terms & Conditions',
                                      style: TextStyle(
                                        color: AppColors.primary,
                                        fontWeight: FontWeight.w600,
                                        decoration: TextDecoration.underline,
                                      ),
                                    ),
                                    const TextSpan(
                                        text: ' and Cancellation Policy'),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Bottom Button
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.surface,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 10,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: SafeArea(
              top: false,
              child: CustomButton(
                text: 'Pay $currencySymbol${_formatAmount(payableAmount, currency)} & Confirm',
                onPressed: !_isProcessing ? _handleConfirmBooking : null,
                isLoading: _isProcessing,
                icon: Icons.payment,
              ),
            ),
          ),
        ],
      ),
    ),
    );
  }

  void _showTermsDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.gavel_rounded, color: AppColors.primary, size: 22),
            SizedBox(width: 8),
            Expanded(
              child: Text(
                'Terms & Conditions',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Rapid Reels — Booking Terms & Conditions (United Kingdom)',
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                  fontStyle: FontStyle.italic,
                ),
              ),
              const SizedBox(height: 14),
              _termItem(
                '1. Contract Formation',
                'A legally binding contract is formed between you and Rapid Reels when your booking is confirmed and payment is received. By proceeding, you agree to these terms in accordance with the Consumer Rights Act 2015.',
                AppColors.primary,
              ),
              _termItem(
                '2. Right to Cancel (Consumer Contracts Regulations 2013)',
                'As this is a service booked for a specific date and time, your statutory 14-day cooling-off right does not apply once the service has commenced or where you have expressly requested the service begin before the cooling-off period expires.',
                AppColors.primary,
              ),
              _termItem(
                '3. Cancellation by You',
                'If you wish to cancel your booking, you must notify us in writing via the app support. Cancellations made more than 72 hours before the event may be eligible for a partial refund at our discretion. Cancellations within 72 hours of the event are non-refundable.',
                AppColors.primary,
              ),
              _termItem(
                '4. Cancellation by Rapid Reels',
                'In the unlikely event that we are unable to fulfil your booking, you will receive a full refund within 14 days or we will offer a suitable replacement at no extra cost, in line with the Consumer Rights Act 2015.',
                AppColors.primary,
              ),
              _termItem(
                '5. Service Quality',
                'All services are provided with reasonable care and skill as required under the Consumer Rights Act 2015. If you believe the service was not delivered to a satisfactory standard, you must notify us within 48 hours of the event.',
                AppColors.primary,
              ),
              _termItem(
                '6. Payment & Pricing',
                'All prices are inclusive of VAT where applicable. Payment is processed securely. You authorise Rapid Reels to charge the agreed amount to your selected payment method upon booking confirmation.',
                AppColors.primary,
              ),
              _termItem(
                '7. Liability',
                'Rapid Reels\' liability is limited to the value of the booking. We are not liable for indirect or consequential losses. Nothing in these terms affects your statutory rights under UK consumer law.',
                AppColors.primary,
              ),
              _termItem(
                '8. Governing Law',
                'These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.',
                AppColors.primary,
              ),
            ],
          ),
        ),
        actions: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                setState(() => _acceptedTerms = true);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('I Agree & Accept'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _termItem(String title, String body, Color titleColor) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            body,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection(String title, List<Widget> children) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }

  Widget _buildDetailRow(
    String label,
    String value, {
    bool isTotal = false,
    String? subtitle,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: isTotal ? 16 : 14,
                  fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
                  color: AppColors.textSecondary,
                ),
              ),
              if (subtitle != null)
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textTertiary,
                  ),
                ),
            ],
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: isTotal ? 18 : 14,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.w600,
              color: isTotal ? AppColors.primary : AppColors.textPrimary,
            ),
            textAlign: TextAlign.right,
          ),
        ],
      ),
    );
  }

  String _formatEventType(String type) {
    return type[0].toUpperCase() + type.substring(1);
  }

  String _formatAmount(double amount, String currency) {
    return amount.toStringAsFixed(2);
  }

  String _formatMoney(double amount, String currency) {
    return '£${_formatAmount(amount, currency)}';
  }

  double _resolvePayableAmount({
    required String currency,
    required double configuredAdvance,
    required double totalAmount,
  }) {
    return totalAmount;
  }

  Future<void> _handleConfirmBooking() async {
    if (!_acceptedTerms) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Please accept the Terms & Conditions to continue.',
          ),
          backgroundColor: Colors.orange,
          duration: Duration(seconds: 4),
        ),
      );
      return;
    }

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please sign in to confirm your booking.'),
          backgroundColor: Colors.red,
          duration: Duration(seconds: 4),
        ),
      );
      return;
    }

    final supportsStripeMobile =
        !kIsWeb &&
        (defaultTargetPlatform == TargetPlatform.android ||
            defaultTargetPlatform == TargetPlatform.iOS);
    if (!supportsStripeMobile) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Stripe payment is available on Android/iOS app only.'),
          backgroundColor: Colors.red,
          duration: Duration(seconds: 4),
        ),
      );
      return;
    }

    const stripePublishableFromDefine = String.fromEnvironment(
      'STRIPE_PUBLISHABLE_KEY',
    );
    final hasPublishableKey = stripePublishableFromDefine.isNotEmpty ||
        StripeConfig.publishableKey.isNotEmpty ||
        Stripe.publishableKey.isNotEmpty;

    if (!hasPublishableKey) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Stripe publishable key missing. Add pk_live to '
            'lib/core/config/stripe_config.dart or build with '
            '--dart-define=STRIPE_PUBLISHABLE_KEY=pk_live_...',
          ),
          backgroundColor: Colors.red,
          duration: Duration(seconds: 8),
        ),
      );
      return;
    }

    final currency =
        (widget.bookingData['paymentCurrency']?.toString().trim().toLowerCase().isNotEmpty ??
                false)
            ? widget.bookingData['paymentCurrency'].toString().trim().toLowerCase()
            : 'gbp';
    final totalAmountNum =
        (widget.bookingData['totalAmount'] is num)
            ? (widget.bookingData['totalAmount'] as num).toDouble()
            : 0.0;
    final configuredAdvance =
        (widget.bookingData['advanceAmount'] is num)
            ? (widget.bookingData['advanceAmount'] as num).toDouble()
            : 0.0;
    final effectiveTotal =
        math.max(0.0, totalAmountNum - _discountAmount);
    var advanceForPayment = configuredAdvance;
    if (totalAmountNum > 0 &&
        configuredAdvance > 0 &&
        _discountAmount > 0) {
      advanceForPayment =
          configuredAdvance * (effectiveTotal / totalAmountNum);
    }
    final payableAmount = _resolvePayableAmount(
      currency: currency,
      configuredAdvance: advanceForPayment,
      totalAmount: effectiveTotal,
    );
    const minAdvance = 0.30;

    if (payableAmount < minAdvance) {
      if (!mounted) return;
      const minLabel = '£0.30';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Payment amount is too low for Stripe. Minimum is $minLabel. '
            'Please choose a higher-value package.',
          ),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 5),
        ),
      );
      return;
    }

    setState(() => _isProcessing = true);

    try {
      final bookingData = Map<String, dynamic>.from(widget.bookingData);
      final providerId = bookingData['providerId']?.toString() ?? '';
      final ev = bookingData['eventDate'];
      if (providerId.isEmpty || ev is! DateTime) {
        if (!mounted) return;
        setState(() => _isProcessing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Missing provider or event date. Go back and try again.'),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }

      bookingData['paymentCurrency'] = currency;
      bookingData['totalAmount'] = effectiveTotal;
      bookingData['advanceAmount'] = payableAmount;
      if (_appliedOffer != null && _discountAmount > 0) {
        bookingData['metadata'] = <String, dynamic>{
          'offerId': _appliedOffer!.offerId,
          'couponCode': _appliedOffer!.code,
          'discountAmount': _discountAmount,
          'subtotalAmount': totalAmountNum,
        };
      }
      final booking = BookingFirebaseAdapter.fromBookingData(
        bookingData,
        user.uid,
      );
      final bookingId = await _firestoreService.createBookingIfAvailable(booking);
      final paymentIntent = await _stripePaymentService.createPaymentIntent(
        bookingId: bookingId,
      );
      await _stripePaymentService.presentPaymentSheet(
        clientSecret: paymentIntent.clientSecret,
        merchantDisplayName: 'Rapid Reels',
      );

      if (!mounted) return;

      setState(() => _isProcessing = false);
      context.pushReplacement(
        AppRoutes.paymentSuccess,
        extra: {
          'bookingId': bookingId,
          'paymentId': paymentIntent.paymentIntentId,
          'amount': payableAmount,
          'chargedAmount': payableAmount,
        },
      );
    } on BookingDateTakenException catch (e) {
      if (!mounted) return;
      setState(() => _isProcessing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.message),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 6),
        ),
      );
    } on StripeException catch (e) {
      if (!mounted) return;
      setState(() => _isProcessing = false);
      final reason = e.error.localizedMessage ?? e.error.message;
      context.pushReplacement(
        AppRoutes.paymentFailure,
        extra: {
          'message': reason?.isNotEmpty == true
              ? 'Stripe error: $reason'
              : 'Payment was cancelled',
          'bookingData': widget.bookingData,
        },
      );
    } catch (e) {
      if (!mounted) return;

      setState(() => _isProcessing = false);
      context.pushReplacement(
        AppRoutes.paymentFailure,
        extra: {
          'message': _friendlyPaymentFailureMessage(e),
          'bookingData': widget.bookingData,
        },
      );
    }
  }

  String _friendlyPaymentFailureMessage(Object error) {
    final raw = error.toString();
    final lower = raw.toLowerCase();
    if (lower.contains('permission-denied') ||
        lower.contains('permission denied')) {
      return 'Payment could not be confirmed due to access restrictions. '
          'Please retry in a moment.';
    }
    return 'Failed to confirm payment: $raw';
  }
}
