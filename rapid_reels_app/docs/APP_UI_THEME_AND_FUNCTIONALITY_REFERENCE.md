# Rapid Reels — UI, Theme & Functionality Reference

This document describes **how the app looks and feels** first, then maps **roles**, **feature modules**, and **screens/flows** to the current Flutter codebase (`rapid_reels_app/lib/`). It reflects the code as implemented; some flows are wired for future backend work (for example mock payment UI).

---

## Part A — UI, styling, typography, and theme (read this first)

### A.1 Design system overview

- **Framework:** Flutter **Material 3** (`useMaterial3: true`) with a **single global brightness: dark** for the main app shell.
- **Primary typeface:** **Poppins**, loaded via the `google_fonts` package (`GoogleFonts.poppins(...)` and `GoogleFonts.poppinsTextTheme(...)`).
- **Color language:** A unified **cool blue–grey** palette: deep charcoal backgrounds, teal/cyan **primary** accents, layered **surfaces** for depth, and semantic colors for status (success, warning, error, info).
- **Shape language:** **Rounded rectangles** dominate — cards, fields, and primary buttons use **16px** corner radius (cards/inputs) or **14px** (buttons); chips use **24px** pill shapes; dialogs **20px**; snack bars **14px** floating pills.
- **Elevation:** The global themes intentionally use **low or zero elevation** on cards and buttons (`elevation: 0`) for a flat, modern look; separation comes from **color contrast** and occasional **shadows** on custom chrome (for example bottom bars).

### A.2 Two coordinated themes (customer shell vs provider portal)

The app applies **`AppTheme.darkTheme`** at the root `MaterialApp.router` (`lib/app.dart`). A second theme, **`ProviderAppTheme.theme`**, is **wrapped only around provider-facing routes** so the provider experience can diverge slightly while staying visually aligned.

| Aspect | Customer / main app (`AppTheme`) | Provider portal (`ProviderAppTheme`) |
|--------|----------------------------------|--------------------------------------|
| **Source** | `lib/core/theme/app_theme.dart` | `lib/core/theme/provider_app_theme.dart` |
| **Colors** | `AppColors` (`lib/core/constants/app_colors.dart`) | `ProviderAppColors` (`lib/core/theme/provider_app_colors.dart`) |
| **Typography** | Full `AppTypography` mapped into `textTheme` | Poppins `textTheme` with explicit overrides for key roles |
| **Where applied** | Entire app by default | `ProviderAppTheme.wrap(...)` on portal shell, standalone provider screens, and some provider tools (see router) |

**Practical effect:** Most customer screens inherit **`Theme.of(context)`** from `AppTheme`. Provider tabs under `/provider-portal/:id/...` and several full-screen provider tools use **`ProviderAppTheme`** so chips, cards, dividers, and search-like fields match provider-specific tokens (for example `outline`, `searchBarFill`, `glassSurface`).

### A.3 Background colours and scaffold surfaces

**Customer palette (`AppColors`):**

| Token | Hex | Role |
|-------|-----|------|
| `background` | `#141A1D` | Main scaffold / app chrome base |
| `surface` | `#1D2529` | Default `ColorScheme.surface`, cards in main theme, input fill |
| `cardBackground` | `#232D31` | Deeper card tone (used in gradients and some compositions) |
| `surfaceElevated` | `#2A353A` | Elevated chips, snack bars, switch track (unselected) |

**Provider palette (`ProviderAppColors`):** Same **`background`**, **`surface`**, and **`surfaceElevated`** as customer; **`card`** is `#232D31`; additional tokens include **`searchBarFill`** (`#2A353A`), **`outline`** (`#3D484C`), **`textMuted`**, **`cardBackground`** for placeholders, and **`glassSurface`** (semi-transparent `#1D2529` for frosted overlays).

**System UI (status bar / navigation bar):** In `lib/main.dart`, the status bar is **transparent** with **light** icons; the system navigation bar uses **`AppColors.background`** with **light** icons — so the OS chrome matches the dark app frame.

**Splash screen:** `SplashScreen` uses a **full-bleed asset** (`assets/images/splash_screen.jpg`) on a **`Colors.black`** scaffold fallback if the image fails — not the `AppColors.background`, so first paint can read as pure black until the image loads.

### A.4 Brand, primary, and semantic colours

**Customer (`AppColors`):**

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#2A84A0` | Primary actions, selected nav, links, focus borders |
| `primaryDark` | `#236D84` | Gradient stops |
| `accent` | `#49A4C0` | Secondary accent highlights |
| `secondary` | `#989694` | Muted chrome, outline in main `ColorScheme` |
| `textPrimary` / `textSecondary` / `textTertiary` | `#FFFFFF` / `#D2D2D1` / `#989694` | Text hierarchy |
| `success` | `#4ADE80` | Success states |
| `warning` | `#F2B544` | Warnings |
| `error` | `#E57373` | Errors, destructive emphasis |
| `info` | `#6EAFC2` | Informational accents |

**Event-type accent colours** (customer): `wedding`, `birthday`, `engagement`, `corporate`, `brand`, `other` — used to tint or tag event categories in UI where those tokens are referenced.

**Gradients (`AppColors`):**

- **`primaryGradient`:** `#2A84A0` → `#3C97B3` → `#236D84` (horizontal).
- **`cardGradient`:** `#1D2529` → `#2A353A` (diagonal).
- **`accentGradient`:** `#49A4C0` → `#2A84A0` (diagonal).

**Provider (`ProviderAppColors`):** **`primaryGradient`** and **`primarySoftGradient`** mirror the brand; **`glassSurface`** supports **backdrop-blur** navigation.

### A.5 Typography (fonts and text styles)

**Font family:** **Poppins** everywhere in the design system.

**Customer — `AppTypography` (`lib/core/theme/text_styles.dart`):** A full scale is defined and wired into `AppTheme.darkTheme.textTheme` via `GoogleFonts.poppinsTextTheme(base.textTheme).copyWith(...)`.

Rough hierarchy (all Poppins; colours default to `AppColors` text tokens):

| Category | Styles | Sizes (px) / weights (high level) |
|----------|--------|-----------------------------------|
| **Display** | `displayLarge` … `displaySmall` | 36 / 32 / 28 — bold / extra-bold, tight letter-spacing |
| **Headline** | `headlineLarge` … `headlineSmall` | 24 / 22 / 20 — semibold/bold |
| **Title** | `titleLarge` … `titleSmall` | 18 / 16 / 14 — semibold |
| **Body** | `bodyLarge` … `bodySmall` | 16 / 14 / 13 — regular; secondary colour steps down |
| **Label** | `labelLarge` … `labelSmall` | 15 / 14 / 12 — semibold, slightly positive letter-spacing |
| **Caption** | `captionLarge` … `captionSmall` | 12 / 11 / 10 |
| **Buttons** | `buttonLarge` … `buttonSmall` | 16 / 14 / 12 — semibold, white foreground |
| **Special** | `overline`, `link`, `error`, `success` | Small caps / link underline / semantic colours |
| **Price** | `priceLarge` … `priceSmall` | 28 / 20 / 16 — primary-coloured |
| **Stats** | `statLarge` … `statSmall` | 24 / 20 / 16 |
| **Badge / tag** | `badge`, `tag` | 11 / 10 |

**Legacy alias:** `TextStyles` maps older names (`h1`…`h5`, `caption`, etc.) to `AppTypography` for backward compatibility.

**Provider — `ProviderAppTheme` text overrides:** After building a Poppins `textTheme`, the theme applies **`bodyColor: textSecondary`** and **`displayColor: textPrimary`**, then overrides:

- `headlineSmall` — 24px, w700, primary white  
- `titleLarge` — 20px, w600  
- `titleMedium` — 17px, w600  
- `bodyLarge` — 15px, w400, line height ~1.45  
- `bodyMedium` — 14px  
- `bodySmall` — 12px, tertiary colour  
- `labelLarge` — 14px, w600  

**App bar titles (both themes):** Poppins **18px**, **w600**, primary white text; icons match foreground.

### A.6 Component theming (cards, buttons, inputs, chips, bars)

**Cards (`CardTheme`):**

- **Customer:** fill `AppColors.surface`, **0** elevation, **16px** radius, **zero** default margin.
- **Provider:** fill `ProviderAppColors.card`, same radius and elevation pattern.

**Buttons:**

- **Elevated:** Primary fill, white label, **14px** radius, **horizontal 28 / vertical 16** padding, **0** elevation; label **15px w700** Poppins (provider matches).
- **Outlined:** Primary border **1.5px**, primary text, **14px** radius.
- **Text:** Primary foreground; customer uses `AppTypography.buttonMedium` for text style where configured.
- **Provider** also defines **FilledButton** theme parallel to Elevated.

**Text fields (`InputDecorationTheme`):**

- Filled, **16px** radius, **no** border when enabled; **2px** primary border on focus; error states use **error** colour; label/hint use secondary/tertiary text colours; **16px** horizontal and vertical content padding.

**Chips (`ChipTheme`):**

- **Customer:** elevated surface background, **1px** side border (`secondary`), **24px** pill shape, selected wash uses **primary at ~28% alpha**, label styles from `AppTypography.labelSmall` variants.
- **Provider:** uses **`ProviderAppColors.outline`** for side border, same pill geometry, selected colours aligned with primary alpha.

**Bottom navigation (custom widgets — not only `Theme`):**

- **Customer `RapidBottomNavBar`:** Bar container uses **`AppColors.surface` at ~92% opacity**, **1px** top border white **8%** alpha, **soft shadow** upward; icons **26px**; labels use **`AppTypography.labelSmall`** tweaked to **11px**, **w700** when selected / **w500** when not; selected colour **`primary`**, unselected **`textSecondary`**.
- **Provider `ProviderBottomNavBar`:** **ClipRRect** top **26px** radius, **`BackdropFilter` blur ~24**, fill **`ProviderAppColors.glassSurface`**, top border white **14%** alpha, heavier shadow; labels via **GoogleFonts.poppins** (compact nav typography).

**Dialogs:** Customer theme — background `AppColors.surface`, **20px** radius.

**Snack bars:** Floating, rounded **14px**, elevated surface background; content text uses theme-appropriate body/primary white.

**Switches (customer theme):** Thumb **primary** when selected else tertiary; track **primary ~35% alpha** when selected else `surfaceElevated`.

**Dividers:** Customer uses **`AppColors.surface`** as divider colour; provider uses **`ProviderAppColors.outline`**.

### A.7 Premium / glass / motion on Home

**`PremiumHomeBackground`** (`lib/shared/widgets/premium_home_background.dart`): Animated **custom painter** on top of **`AppColors.background`** — soft **aurora bands** and **neon glows** driven by tokens such as `homeGlowCyan`, `homeGlowMagenta`, `homeGlowLime`, plus subtle **pattern lines** and **vignette** (`homeVignette`). This is a **decorative layer** behind home content (ignored for hit-testing).

**`GlassSurfaceCard`:** **Backdrop blur** (default sigma **12**), gradient defaulting to **`AppColors.homeGlassGradient`** (`homeGlassFillTop` → `homeGlassFillBottom`), border **`homeGlassBorder`**, optional shadow **`homeGlassShadow`**, default **16px** corner radius — used for “frosted glass” panels on the home experience.

**`ReelVideoLayer`:** Shared video presentation for reels strips/feeds (used from Home and Discover); styling is largely composited over the dark theme.

### A.8 Page transitions (navigation feel)

`AppRouter` uses **`CustomTransitionPage`**:

- **Slide:** default for many pushes — **easeInOutCubic**, from right (`Offset(1,0)` → zero).
- **Fade:** used for splash-like or immersive routes (for example some reel and discover entry points).

---

## Part B — Roles and how access is enforced

### B.1 Role model (conceptual)

| Role | Typical `userType` (Firestore) | Primary experience |
|------|----------------------------------|-------------------|
| **Customer** | `customer` | Main bottom-nav app: home, discover, my events, profile; booking and payments; reels gallery; referrals/wallet |
| **Provider** | `provider` | Separate sign-in/onboarding path; **provider portal** shell (home, schedule, bookings, earnings, account) plus tools (calendar, live mode, uploads, catalogue, verification) |
| **Admin / Super admin** | `admin` / `superadmin` | **Admin dashboard** and management screens under `/admin-*`; router guard checks Firestore profile |

**Admin gate (code):** `AppRouter` redirects routes under `/admin-` (except login/unauthorized) through `_adminGuardRedirect`, which uses **`AdminRouteCache.isCurrentUserAdmin()`** and **`isFirestoreAdmin`** (`lib/core/admin/firebase_admin_role.dart`) — aligned with **`firestore.rules`** `isAdmin()` semantics.

**Role selection UI:** `RoleSelectionScreen` is the marketing gate between **customer OTP path** (`/login`) and **provider portal path** (`/provider-login`), with animated gradient **role cards**.

---

## Part C — Application shell and global navigation

### C.1 Customer main scaffold

**`MainScaffold`** (`lib/shared/widgets/main_scaffold.dart`): **Indexed stack** of four tabs — **Home**, **Discover** (`MainDiscoverScreen`), **My Events** (`DynamicMyEventsScreen`), **Profile** — with scaffold **`AppColors.background`** and **`RapidBottomNavBar`**.

**Deep link:** `/home` accepts optional `extra` as `int` **initial tab index**.

### C.2 Provider portal shell

**`ProviderPortalShell`** + **`StatefulShellRoute.indexedStack`** in `app_router.dart`:

- Branches: **`home`** → `ProviderDashboardScreen`, **`schedule`** → `ProviderScheduleScreen`, **`bookings`** → `ProviderBookingsScreen`, **`earnings`** → `ProviderEarningsScreen`, **`account`** → `ProviderAccountScreen`.
- Wrapped in **`ProviderAppTheme.wrap`** + **`ProviderBottomNavBar`**.

Legacy redirects map old `/provider-dashboard/:id` and `/provider-bookings/:id` URLs into the portal paths.

---

## Part D — Feature modules (folder-aligned) and what they do

Paths are under `lib/features/<module>/` unless noted.

### D.1 Auth (`features/auth/`)

| Screen / area | Purpose |
|---------------|---------|
| `SplashScreen` | Branded splash; then **onboarding vs home** based on `FirebaseAuth` |
| `OnboardingScreen` | First-run storytelling / entry to sign-in |
| `RoleSelectionScreen` | Choose **customer** vs **provider** entry |
| `PhoneLoginScreen` | Customer phone entry for OTP |
| `OTPVerificationScreen` | Verify SMS OTP |
| `ProfileSetupScreen` | Post-auth customer profile completion |
| `CitySelectionScreen` | City preference for discovery/booking context |
| `UnauthorizedScreen` | Shown when admin route access fails |

**Supporting:** `auth_provider.dart`, `auth_repository.dart` — Riverpod + repository for session-dependent UI.

### D.2 Home (`features/home/`)

**`HomeScreen`:** Premium **animated background**, **glass** surfaces, **carousel** banners fed from **active offers**, **promo modal** (cooldown via `SharedPreferences`), **city** detection/selection, **nearby** and **featured** providers from Firestore, **trending reels** strip with **tap-to-play** video, links into **notifications**, **provider details**, booking entry points, etc.

### D.3 Discover (`features/discover/`)

**`MainDiscoverScreen`:** **TikTok-style** vertical **PageView** with **category tabs** (For You, Weddings, Birthdays, Corporate, Engagements); loads **`getDiscoverReels`**, caches provider metadata, **like/follow** style interactions (`reel_engagement`).

**`DiscoverFeedScreen` / `TrendingReelsScreen`:** Additional discover routes (router exposes `/discover` and `/discover/trending`).

### D.4 Reels (`features/reels/`)

**`MyReelsGalleryScreen`**, **`ReelPlayerScreen`**, **`ReelShareScreen`:** Customer-facing **gallery**, **fullscreen player** (list + index), **share** flow per `reelId`.

### D.5 Booking (`features/booking/`)

Linear **go_router** flow (each step receives `bookingData` / models via `extra`):

1. **`EventTypeSelectionScreen`** — pick event type.  
2. **`PackageSelectionScreen`** — packages for chosen type.  
3. **`EventDetailsFormScreen`** — date, guest count, notes, etc.  
4. **`VenueSelectionScreen`** — venue choice.  
5. **`ProviderSelectionScreen`** — pick provider.  
6. **`ProviderPortfolioScreen`** / **`ProviderDetailsScreen`** (`features/providers/`) — portfolio and detail before commitment.  
7. **`CatalogueSelectionScreen`** / **`ProviderPackagePickScreen`** — provider catalogue or package pick.  
8. **`PackageCustomizationScreen`** — add-ons / adjustments.  
9. **`BookingSummaryScreen`** — review.  
10. **`PaymentScreen`** — **mock/simulated** payment in current code; success snackbar then navigates home.  
11. **`PaymentSuccessScreen` / `PaymentFailureScreen`** — outcomes when routed with extras.  
12. **`MyTransactionsScreen`** — transaction history UI route.

**Data:** `EventBooking` and related models under `features/booking/data/`.

### D.6 My Events (`features/my_events/`)

**`DynamicMyEventsScreen`:** List/filter customer bookings/events.  
**`EventDetailsScreen`:** Detail by `eventId`.  
**`LiveEventTrackingScreen`:** Tracking view for an active event.

### D.7 Profile & settings (`features/profile/`, `features/settings/`)

**Profile tab (`ProfileScreen`)** links to **edit profile**, **saved venues**, **payment methods**, **settings**, **support**, **my tickets**, **refund/cancellation policy**, referral/wallet entry points, etc. (see router).

**`EditProfileScreen`**, **`SavedVenuesScreen`**, **`PaymentMethodsScreen`**, **`SupportScreen`**, **`MyTicketsScreen`**, **`RefundCancellationPolicyScreen`**.

**`SettingsScreen`** exists under **`features/settings/`** — app settings route `/settings`.

### D.8 Referral & wallet (`features/referral/`)

**`ReferralDashboardScreen`**, **`WalletScreen`**, **`ReferralHistoryScreen`**, **`RedemptionScreen`** — referral credits, wallet balance, history, redemption UX.

### D.9 Provider (`features/provider/`)

**Onboarding / account setup (sequential routes):**

- `ProviderLoginScreen` — phone/email style portal login (themed).  
- `ProviderRegistrationScreen` → `ProviderBusinessProfileScreen` → `ProviderPortfolioUploadScreen` → `ProviderServiceAreasScreen` → `ProviderDocumentUploadScreen` → `ProviderAvailabilityCalendarScreen` → `ProviderVerificationScreen`.

**Portal tabs (see C.2):** dashboard, schedule, bookings list, earnings, account.

**Operational / per-booking tools:**

- `ProviderBookingCalendarScreen`, `ProviderBookingTimelineScreen`, `ProviderBookingDetailsScreen`, `ProviderBookingStatusScreen`.  
- `ProviderCustomerContactScreen`, `ProviderVenueNavigationScreen`, `ProviderPreEventChecklistScreen`.  
- `LiveEventModeScreen`, `UploadFootageScreen`, `ReelEditorScreen`, `ProviderMyReelsScreen`.  
- `ProviderCatalogueListScreen`, `ProviderCatalogueEditScreen`.  
- `ProviderBankDetailsScreen` — bank details UI (`AppRoutes.providerBankDetails` exists; typically opened from **Account** via in-screen navigation).  
- `ProviderAccountScreen` — account hub.

### D.10 Admin (`features/admin/`)

Screens (each mapped in `app_router.dart`):

- `AdminDashboardScreen` — metrics, **seed demo providers** action, notifications shortcut.  
- `AdminUserManagementScreen`, `AdminBookingManagementScreen`, `AdminProviderVerificationScreen`, `AdminContentModerationScreen`, `AdminAnalyticsScreen`, `AdminPaymentManagementScreen`, `AdminProviderEarningsScreen`, `AdminOffersManagementScreen`, `AdminReviewsModerationScreen`.

**Note:** `/admin-login` **redirects** to **`/provider-login`** in the current router configuration; admin still relies on **Firestore `userType`** for authorization to `/admin-*` routes.

### D.11 Notifications (`features/notifications/`)

**`NotificationsScreen`** — pushed from home/admin app bars and similar entry points.

### D.12 Support (`features/support/`)

**`HelpSupportScreen`** — help content (distinct from profile **Support** route wiring; check which path is linked from your UI).

### D.13 Offers (`features/offers/`)

**`OffersScreen`**, **`OffersCouponsScreen`** — promotional offers UI (may be linked from home/profile depending on navigation hooks).

---

## Part E — Cross-cutting infrastructure (brief)

- **Routing:** `lib/core/router/app_router.dart` + `app_routes.dart` — all major paths; **admin guard**; **provider theme wrap** helper `_providerThemed`.  
- **Firebase:** `FirebaseInitService` in `main.dart` — Auth, Firestore, Analytics, Crashlytics.  
- **Stripe:** `flutter_stripe` initialized on **Android/iOS** when publishable key is available (`--dart-define` or `StripeConfig`).  
- **State:** `flutter_riverpod` `ProviderScope` in `main.dart`.  
- **Shared UI:** `lib/shared/widgets/` — bottom bars, glass card, premium background, provider component library (`shared/widgets/provider/*`).

---

## Part F — Quick route index (customer / provider / admin)

Representative paths (see `AppRoutes` for the full list):

- **Auth:** `/`, `/onboarding`, `/role-selection`, `/login`, `/otp-verification`, `/profile-setup`, `/city-selection`, `/unauthorized`  
- **Main:** `/home`, `/discover`, `/discover/trending`, `/reels`, `/reel-player`, `/profile`, `/settings`, …  
- **Booking:** `/event-type-selection` → … → `/payment`, `/payment-success`, `/payment-failure`, `/my-transactions`  
- **Events:** `/my-events`, `/event-details-view/:eventId`, `/event-tracking/:eventId`  
- **Referrals:** `/referral-dashboard`, `/wallet`, `/referral-history`, `/redemption`  
- **Provider:** `/provider-login`, `/provider-registration`, … `/provider-portal/:providerId/(home|schedule|bookings|earnings|account)`, `/live-event-mode`, `/reel-editor`, `/upload-footage`, …  
- **Admin:** `/admin-dashboard`, `/admin-user-management`, …  

---

*Generated from codebase review. For stack diagrams and Firestore role tables, see `MODULES_AND_FEATURES.md`; for data shapes, see `lib/core/firebase/FIREBASE_DATA_MODEL.md`.*
