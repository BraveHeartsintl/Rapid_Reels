import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_routes.dart';
import '../../../../core/theme/text_styles.dart';
import '../../../../shared/widgets/custom_button.dart';
import '../../../../shared/widgets/guest_sign_in_prompt.dart';
import '../providers/my_events_provider.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

/// Dynamic My Events Screen - Fully integrated with Firebase
/// Real-time bookings list with filtering and search
class DynamicMyEventsScreen extends ConsumerStatefulWidget {
  const DynamicMyEventsScreen({super.key});

  @override
  ConsumerState<DynamicMyEventsScreen> createState() => _DynamicMyEventsScreenState();
}

class _DynamicMyEventsScreenState extends ConsumerState<DynamicMyEventsScreen> {
  String _selectedFilter = 'all';
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  final List<String> _filters = ['all', 'upcoming', 'ongoing', 'completed', 'cancelled'];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currentUser = ref.watch(currentUserProvider);
    final userId = currentUser?.uid ?? '';

    if (userId.isEmpty) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          backgroundColor: AppColors.background,
          elevation: 0,
          title: Text('My Events', style: AppTypography.headlineSmall),
        ),
        body: const GuestSignInPrompt(
          title: 'My events',
          message: 'Sign in to view and manage your booked events.',
          icon: Icons.event_note_outlined,
        ),
      );
    }

    final filteredEvents = ref.watch(
      filteredEventsProvider((userId: userId, status: _selectedFilter == 'all' ? null : _selectedFilter)),
    );

    final searchResults = _searchQuery.isEmpty
        ? filteredEvents
        : ref.watch(searchEventsProvider((userId: userId, query: _searchQuery)));

    final stats = ref.watch(eventStatsProvider(userId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        title: Text(
          'My Events',
          style: AppTypography.headlineSmall,
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(myEventsProvider(userId));
        },
        child: CustomScrollView(
          slivers: [
            // Inline search bar (instead of search dialog)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: AppColors.cardBackground.withValues(alpha: 0.3),
                      width: 1,
                    ),
                  ),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (value) {
                      setState(() {
                        _searchQuery = value;
                      });
                    },
                    style: AppTypography.bodyMedium,
                    decoration: InputDecoration(
                      hintText: 'Search events...',
                      hintStyle: AppTypography.bodyMedium.copyWith(
                        color: AppColors.textTertiary,
                      ),
                      prefixIcon: const Icon(Icons.search, size: 18),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear),
                              onPressed: () {
                                _searchController.clear();
                                setState(() {
                                  _searchQuery = '';
                                });
                              },
                            )
                          : null,
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                  ),
                ),
              ),
            ),
            // Statistics Bar
            _buildStatsBar(stats),
            
            // Filter Tabs
            _buildFilterTabs(),
            
            // Events List
            if (searchResults.isEmpty)
              _buildEmptyState()
            else
              _buildEventsList(searchResults),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsBar(Map<String, int> stats) {
    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.all(20),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.06),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildStatChip('Total', stats['total'] ?? 0),
            _buildStatChip('Upcoming', stats['upcoming'] ?? 0, AppColors.info),
            _buildStatChip('Ongoing', stats['ongoing'] ?? 0, AppColors.warning),
            _buildStatChip('Completed', stats['completed'] ?? 0, AppColors.success),
          ],
        ),
      ),
    );
  }

  Widget _buildStatChip(String label, int value, [Color? color]) {
    return Column(
      children: [
        Text(
          value.toString(),
          style: AppTypography.headlineSmall.copyWith(
            color: color ?? AppColors.primary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: AppTypography.bodySmall.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildFilterTabs() {
    return SliverToBoxAdapter(
      child: SizedBox(
        height: 50,
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 20),
          itemCount: _filters.length,
          itemBuilder: (context, index) {
            final filter = _filters[index];
            final isSelected = _selectedFilter == filter;
            
            return Padding(
              padding: const EdgeInsets.only(right: 12),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () {
                    setState(() {
                      _selectedFilter = filter;
                    });
                  },
                  borderRadius: BorderRadius.circular(24),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    curve: Curves.easeOut,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      gradient: isSelected ? AppColors.primaryGradient : null,
                      color: isSelected ? null : AppColors.surface,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: isSelected
                            ? Colors.transparent
                            : AppColors.secondary.withValues(alpha: 0.8),
                        width: 1.4,
                      ),
                    ),
                    child: Text(
                      filter.toUpperCase(),
                      style: AppTypography.bodyMedium.copyWith(
                        color: isSelected ? AppColors.textPrimary : AppColors.textSecondary,
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                      ),
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildEventsList(List events) {
    return SliverPadding(
      padding: const EdgeInsets.all(20),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) {
            final booking = events[index];
            return _buildEventCard(booking);
          },
          childCount: events.length,
        ),
      ),
    );
  }

  Widget _buildEventCard(booking) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.06),
          width: 1,
        ),
      ),
      child: InkWell(
        onTap: () {
          context.push('${AppRoutes.eventDetails2}/${booking.bookingId}');
        },
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Row
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Event Type Icon
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: _getEventTypeColor(booking.eventType).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      _getEventTypeIcon(booking.eventType),
                      color: _getEventTypeColor(booking.eventType),
                    ),
                  ),
                  const SizedBox(width: 12),
                  
                  // Event Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          booking.eventName,
                          style: AppTypography.titleMedium,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          softWrap: true,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          booking.eventType.toUpperCase(),
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  
                  // Status Badge
                  const SizedBox(width: 8),
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 130),
                    child: _buildStatusBadge(booking.status),
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              
              // Event Details
              _buildDetailRow(
                Icons.calendar_today,
                _formatDate(booking.eventDate),
              ),
              const SizedBox(height: 8),
              _buildDetailRow(
                Icons.access_time,
                booking.eventTime,
              ),
              const SizedBox(height: 8),
              _buildDetailRow(
                Icons.location_on,
                '${booking.venue.name}, ${booking.venue.city}',
              ),
              
              const SizedBox(height: 16),
              
              // Package Info
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.cardBackground,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Package',
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            booking.package.name,
                            style: AppTypography.bodyMedium,
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '£${booking.payment.totalAmount.toStringAsFixed(2)}',
                          style: AppTypography.titleMedium.copyWith(
                            color: AppColors.primary,
                          ),
                        ),
                        Text(
                          booking.payment.paymentStatus.toUpperCase(),
                          style: AppTypography.bodySmall.copyWith(
                            color: _getPaymentStatusColor(booking.payment.paymentStatus),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              
              // Action Buttons
              if (booking.status == 'confirmed' || booking.status == 'ongoing' || booking.status == 'completed')
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Row(
                    children: [
                      Expanded(
                        child: CustomButton(
                          text: 'View Details',
                          onPressed: () {
                            context.push('${AppRoutes.eventDetails2}/${booking.bookingId}');
                          },
                          borderRadius: 16,
                          height: 54,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            final userId = ref.read(currentUserProvider)?.uid ?? '';
                            context.push(
                              '${AppRoutes.bookingDrive}/${booking.bookingId}',
                              extra: {'actorId': userId},
                            );
                          },
                          icon: const Icon(Icons.folder_open),
                          label: const Text('Booking Drive'),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.textSecondary),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: AppTypography.bodyMedium,
          ),
        ),
      ],
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    IconData icon;
    String label;
    
    switch (status) {
      case 'pending':
        color = AppColors.warning;
        icon = Icons.pending;
        label = 'Pending';
        break;
      case 'confirmed':
        color = AppColors.success;
        icon = Icons.check_circle;
        label = 'Provider Accepted';
        break;
      case 'ongoing':
        color = AppColors.info;
        icon = Icons.play_circle;
        label = 'Arrived';
        break;
      case 'completed':
        color = AppColors.success;
        icon = Icons.done_all;
        label = 'Done';
        break;
      case 'cancelled':
        color = AppColors.error;
        icon = Icons.cancel;
        label = 'Cancelled';
        break;
      default:
        color = AppColors.textSecondary;
        icon = Icons.help;
        label = status;
    }
    
    return FittedBox(
      fit: BoxFit.scaleDown,
      alignment: Alignment.centerRight,
      child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 4),
          Text(
            label.toUpperCase(),
            style: AppTypography.bodySmall.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    ),
    );
  }

  Widget _buildEmptyState() {
    return SliverFillRemaining(
      hasScrollBody: false,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.event_busy,
              size: 80,
              color: AppColors.textTertiary,
            ),
            const SizedBox(height: 24),
            Text(
              'No Events Found',
              style: AppTypography.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              _selectedFilter == 'all'
                  ? 'Start booking your first event!'
                  : 'No ${_selectedFilter} events',
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 24),
            CustomButton(
              text: 'Book Event',
              onPressed: () {
                context.push(AppRoutes.eventTypeSelection);
              },
            ),
          ],
        ),
      ),
    );
  }

  Color _getEventTypeColor(String eventType) {
    switch (eventType.toLowerCase()) {
      case 'wedding':
        return AppColors.wedding;
      case 'birthday':
        return AppColors.birthday;
      case 'engagement':
        return AppColors.engagement;
      case 'corporate':
        return AppColors.corporate;
      case 'brand':
        return AppColors.brand;
      default:
        return AppColors.primary;
    }
  }

  IconData _getEventTypeIcon(String eventType) {
    switch (eventType.toLowerCase()) {
      case 'wedding':
        return Icons.favorite;
      case 'birthday':
        return Icons.cake;
      case 'engagement':
        return Icons.diamond;
      case 'corporate':
        return Icons.business;
      case 'brand':
        return Icons.store;
      default:
        return Icons.event;
    }
  }

  Color _getPaymentStatusColor(String status) {
    switch (status) {
      case 'fully_paid':
        return AppColors.success;
      case 'advance_paid':
        return AppColors.warning;
      case 'pending':
        return AppColors.error;
      default:
        return AppColors.textSecondary;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}

