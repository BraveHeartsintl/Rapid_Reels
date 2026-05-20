import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_routes.dart';
import '../../../../core/firebase/models/firebase_catalogue_event_model.dart';
import '../../../../core/firebase/services/firestore_service.dart';
import '../../../../shared/widgets/catalogue_event_card.dart';
import '../../../../shared/widgets/custom_app_bar.dart';
import '../../../../shared/widgets/custom_button.dart';
import '../../data/models/service_provider_model.dart';
import 'catalogue_event_detail_screen.dart';

/// After choosing a provider: pick a published catalogue entry for the current [eventType], or fall back to package-only flow.
class CatalogueSelectionScreen extends StatelessWidget {
  final ServiceProvider provider;
  final Map<String, dynamic> bookingData;

  const CatalogueSelectionScreen({
    super.key,
    required this.provider,
    required this.bookingData,
  });

  List<FirebaseCatalogueEventModel> _filterForFlow(
    List<FirebaseCatalogueEventModel> all,
    String? eventType,
  ) {
    final t = eventType ?? '';
    return all
        .where((e) => e.isPublished && (t.isEmpty || e.eventType == t))
        .toList()
      ..sort((a, b) => a.sortOrder.compareTo(b.sortOrder));
  }

  bool _shouldFallbackToNoOfferState(Object? error) {
    if (error == null) return false;
    final text = error.toString().toLowerCase();
    return text.contains('permission-denied') ||
        text.contains('insufficient permissions') ||
        text.contains('cloud_firestore/permission-denied');
  }

  Widget _buildNoOfferState(BuildContext context, String message) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.inventory_2_outlined, size: 56, color: AppColors.textSecondary),
          const SizedBox(height: 16),
          Text(
            message,
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppColors.textSecondary, height: 1.4),
          ),
          const SizedBox(height: 24),
          CustomButton(
            text: 'Continue with selected package',
            onPressed: () => _skipToPackageFlow(context),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final eventType = bookingData['eventType'] as String?;
    final firestore = FirestoreService();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const CustomAppBar(title: 'Choose an offering'),
      body: StreamBuilder<List<FirebaseCatalogueEventModel>>(
        stream: firestore.streamCatalogueEvents(provider.providerId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: AppColors.primary));
          }
          if (snapshot.hasError) {
            if (_shouldFallbackToNoOfferState(snapshot.error)) {
              return _buildNoOfferState(
                context,
                'No offer package available right now. You can continue with your selected package.',
              );
            }
            return _buildNoOfferState(
              context,
              'No offer package available right now. Please continue with your selected package.',
            );
          }
          final filtered = _filterForFlow(snapshot.data ?? [], eventType);

          if (filtered.isEmpty) {
            return _buildNoOfferState(
              context,
              'No offer package available for this provider yet. You can continue with your selected package.',
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: filtered.length + 1,
            itemBuilder: (context, index) {
              if (index == 0) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Text(
                    'Select how you want this ${eventType ?? 'event'} covered — or skip to packages.',
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                      height: 1.4,
                    ),
                  ),
                );
              }
              final item = filtered[index - 1];
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: CatalogueEventCard(
                  event: item,
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute<void>(
                        builder: (ctx) => CatalogueEventDetailScreen(
                          provider: provider,
                          bookingData: bookingData,
                          catalogueEvent: item,
                        ),
                      ),
                    );
                  },
                ),
              );
            },
          );
        },
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.surface,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 10,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: TextButton(
            onPressed: () => _skipToPackageFlow(context),
            child: const Text(
              'Skip offering and continue',
              style: TextStyle(
                color: AppColors.secondary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _skipToPackageFlow(BuildContext context) {
    final hasSelectedPackage =
        bookingData['package'] is Map<String, dynamic> &&
        (bookingData['packageId']?.toString().trim().isNotEmpty ?? false);

    if (hasSelectedPackage) {
      // Keep the user's already selected package instead of forcing provider standard package.
      context.push(AppRoutes.packageCustomization, extra: bookingData);
      return;
    }

    // Fallback if there is genuinely no selected package in flow.
    context.push(
      AppRoutes.providerPackagePick,
      extra: {'provider': provider, 'bookingData': bookingData},
    );
  }
}
