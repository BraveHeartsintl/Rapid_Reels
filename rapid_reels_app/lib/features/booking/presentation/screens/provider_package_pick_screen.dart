import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:carousel_slider/carousel_slider.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_routes.dart';
import '../../../../core/config/stripe_test_package.dart';
import '../../../../shared/widgets/custom_button.dart';
import '../../../../shared/widgets/custom_app_bar.dart';
import '../../data/models/service_provider_model.dart';
import '../utils/booking_flow_maps.dart';

/// When a provider has no catalogue (or user skips), pick one of their [ServiceProvider.packages].
class ProviderPackagePickScreen extends StatefulWidget {
  final ServiceProvider provider;
  final Map<String, dynamic> bookingData;

  const ProviderPackagePickScreen({
    super.key,
    required this.provider,
    required this.bookingData,
  });

  @override
  State<ProviderPackagePickScreen> createState() => _ProviderPackagePickScreenState();
}

class _ProviderPackagePickScreenState extends State<ProviderPackagePickScreen> {
  int _currentIndex = 0;

  void _continueWithPackage(PackageOffering selected) {
    final m = Map<String, dynamic>.from(widget.bookingData);
    m['package'] = packageOfferingToMap(selected);
    m['packageId'] = selected.packageId;
    context.push(AppRoutes.packageCustomization, extra: m);
  }

  @override
  Widget build(BuildContext context) {
    final packages = packagesWithStripeTest(widget.provider.packages);
    final safeIndex = _currentIndex.clamp(0, packages.isEmpty ? 0 : packages.length - 1);
    final selected = packages.isNotEmpty ? packages[safeIndex] : null;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const CustomAppBar(title: 'Choose a package'),
      body: packages.isEmpty
          ? const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text(
                  'This provider has not added packages yet.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.textSecondary),
                ),
              ),
            )
          : Column(
              children: [
                const SizedBox(height: 12),
                Expanded(
                  child: CarouselSlider.builder(
                    itemCount: packages.length,
                    itemBuilder: (context, index, realIndex) {
                      final p = packages[index];
                      final isSelected = index == safeIndex;
                      return Container(
                        margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected
                                ? AppColors.primary
                                : AppColors.cardBackground.withValues(alpha: 0.5),
                            width: isSelected ? 2 : 1,
                          ),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(18),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                p.name,
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                StripeTestPackage.formatListedPrice(p),
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primary,
                                ),
                              ),
                              const SizedBox(height: 14),
                              Text(
                                '${p.duration ~/ 60}h coverage • ${p.reelsCount} reels',
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                              const SizedBox(height: 16),
                              if (p.features.isNotEmpty)
                                Expanded(
                                  child: ListView.builder(
                                    itemCount: p.features.length,
                                    itemBuilder: (context, featureIndex) {
                                      return Padding(
                                        padding: const EdgeInsets.only(bottom: 8),
                                        child: Row(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const Padding(
                                              padding: EdgeInsets.only(top: 2),
                                              child: Icon(
                                                Icons.check_circle,
                                                size: 16,
                                                color: AppColors.primary,
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            Expanded(
                                              child: Text(
                                                p.features[featureIndex],
                                                style: const TextStyle(
                                                  color: AppColors.textSecondary,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      );
                                    },
                                  ),
                                ),
                            ],
                          ),
                        ),
                      );
                    },
                    options: CarouselOptions(
                      height: double.infinity,
                      viewportFraction: 0.88,
                      enableInfiniteScroll: false,
                      enlargeCenterPage: true,
                      initialPage: safeIndex,
                      onPageChanged: (index, reason) {
                        setState(() => _currentIndex = index);
                      },
                    ),
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: packages.asMap().entries.map((entry) {
                    final isActive = entry.key == safeIndex;
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: isActive ? 22 : 8,
                      height: 8,
                      margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 10),
                      decoration: BoxDecoration(
                        color: isActive ? AppColors.primary : AppColors.textTertiary,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    );
                  }).toList(),
                ),
                Container(
                  padding: const EdgeInsets.fromLTRB(20, 10, 20, 20),
                  child: SafeArea(
                    top: false,
                    child: CustomButton(
                      text: selected == null
                          ? 'Continue'
                          : 'Continue with ${selected.name}',
                      onPressed: selected == null
                          ? null
                          : () => _continueWithPackage(selected),
                      icon: Icons.arrow_forward,
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
