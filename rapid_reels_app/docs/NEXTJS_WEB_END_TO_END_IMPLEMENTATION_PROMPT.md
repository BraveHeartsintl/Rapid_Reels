# Rapid Reels Next.js Web Application - Step-by-Step Implementation Document

## Executive Summary (For Leadership Review)

This document is a complete implementation guide to build the Rapid Reels web app in Next.js with the same features, roles, design language, and Firebase backend used by the current Flutter app.

Business outcome:
- One unified product experience across mobile and web.
- Same backend data and user accounts (no migration split).
- Same role capabilities: customer, provider, admin/superadmin.
- A phased delivery plan with clear acceptance criteria and testing gates.

Delivery principles:
- Keep feature parity with current app flows.
- Do not break existing Firebase data contracts.
- Ship in milestones with measurable completion checks.

---

## Step-by-Step Plan at a Glance

1. **Step 1 - Foundation and Setup**
   - Create Next.js TypeScript app, base architecture, and environment setup.
   - Connect Firebase (Auth, Firestore, Storage, Functions).
   - Implement shared design tokens and layout scaffolding.

2. **Step 2 - Authentication and Role Access**
   - Build onboarding/login/OTP/profile setup/city selection.
   - Implement role guards and unauthorized handling.
   - Verify customer/provider/admin route protection.

3. **Step 3 - Customer Experience**
   - Build customer shell (Home, Discover/Reels, My Events, Profile).
   - Deliver full booking flow and payment result states.
   - Add referral, wallet, support, and settings flows.

4. **Step 4 - Provider Experience**
   - Build provider onboarding workflow.
   - Deliver provider portal tabs and operational tools.
   - Add media uploads, catalogue, booking operations, and earnings views.

5. **Step 5 - Admin Experience**
   - Build admin dashboard and all management modules.
   - Deliver moderation, verification, analytics, and operations screens.

6. **Step 6 - Data Validation and QA**
   - Validate model mapping with Firestore rules.
   - Run unit/integration/e2e and role-wise UAT.
   - Fix parity gaps and edge-case behavior.

7. **Step 7 - Production Readiness**
   - Performance hardening, observability, and security checks.
   - Final sign-off against acceptance criteria.

---

## 1) Objective and Non-Negotiable Parity Rules

Build a production-grade Next.js web application that reproduces the existing Rapid Reels Flutter app behavior, content, role access, theme language, and Firebase-backed data workflows.

Hard constraints:
- Match existing mobile features and flows as closely as possible.
- Keep the same Firebase project and collections.
- Preserve role-based behavior for `customer`, `provider`, `admin`, and `superadmin`.
- Keep visual identity aligned with existing dark theme and component style.
- Keep route semantics aligned with the current app route structure.

Primary source-of-truth files:
- `rapid_reels_app/lib/core/router/app_router.dart`
- `rapid_reels_app/lib/core/constants/app_routes.dart`
- `rapid_reels_app/docs/APP_UI_THEME_AND_FUNCTIONALITY_REFERENCE.md`
- `rapid_reels_app/docs/MODULES_AND_FEATURES.md`
- `rapid_reels_app/lib/core/firebase/models/*`
- `rapid_reels_app/firestore.rules`
- `rapid_reels_app/storage.rules`
- `rapid_reels_app/android/app/google-services.json`
- `rapid_reels_app/lib/firebase_options.dart`

---

## 2) Target Web Stack and Architecture

Use:
- Next.js (App Router, TypeScript)
- Firebase JS SDK (Auth, Firestore, Storage, Analytics optional)
- Optional: Firebase Admin SDK in server routes for privileged actions
- Tailwind CSS or CSS Modules (either is acceptable, but token parity is mandatory)
- React Query or SWR for data fetching/caching
- Zod for runtime validation of model payloads

Architecture:

```mermaid
flowchart LR
  subgraph clientWeb [NextJsWebApp]
    webRoutes[RouteSegments]
    roleGuards[RoleAndAuthGuards]
    ui[RoleBasedUI]
    dataHooks[FirestoreAndFunctionsHooks]
    webRoutes --> roleGuards
    roleGuards --> ui
    dataHooks --> ui
  end

  subgraph firebaseBackend [FirebaseBackend]
    auth[FirebaseAuth]
    firestore[CloudFirestore]
    storage[CloudStorage]
    functions[CloudFunctions]
    messaging[FCM]
  end

  clientWeb --> auth
  clientWeb --> firestore
  clientWeb --> storage
  clientWeb --> functions
  functions --> firestore
  functions --> messaging
```

---

## 3) Role Matrix and Access Rules

### 3.1 Customer (`userType = customer`)
- Access public/auth/customer sections.
- Main navigation: Home, Discover/Reels, My Events, Profile.
- Can complete booking flow, payments, referrals, wallet, profile/settings/support.

### 3.2 Provider (`userType = provider`)
- Provider login/onboarding flow.
- Provider portal with tabs: Home, Schedule, Bookings, Earnings, Account.
- Manages bookings, status updates, portfolio/catalog, uploads, bank details.

### 3.3 Admin/Superadmin (`userType in ['admin','superadmin']`)
- Access all `/admin-*` management views.
- Can manage users/providers/bookings/payments/offers/reviews/content analytics.

### 3.4 Route Guarding Requirements
- Enforce auth guard and role guard in middleware/layout-level checks.
- Mirror Firestore-role validation behavior from app (role read from `users/{uid}.userType`).
- Non-authorized access must redirect to an Unauthorized page.

---

## 4) Route and Navigation Blueprint (Web)

Implement these route groups in Next.js:

- Public/Auth:
  - `/`
  - `/onboarding`
  - `/role-selection`
  - `/login`
  - `/provider-login`
  - `/otp-verification`
  - `/profile-setup`
  - `/city-selection`
  - `/unauthorized`

- Customer app:
  - `/home`
  - `/discover`
  - `/discover/trending`
  - `/reels`
  - `/reel-player`
  - `/profile`
  - `/settings`
  - `/support`
  - `/my-events`
  - `/event-details-view/[eventId]`
  - `/event-tracking/[eventId]`
  - Booking flow routes (section 5.3)
  - Referral/wallet routes

- Provider app:
  - `/provider-portal/[providerId]/home`
  - `/provider-portal/[providerId]/schedule`
  - `/provider-portal/[providerId]/bookings`
  - `/provider-portal/[providerId]/earnings`
  - `/provider-portal/[providerId]/account`
  - Provider operational subroutes (section 5.4)

- Admin:
  - `/admin-dashboard`
  - `/admin-user-management`
  - `/admin-booking-management`
  - `/admin-provider-verification`
  - `/admin-content-moderation`
  - `/admin-analytics`
  - `/admin-payment-management`
  - `/admin-provider-earnings`
  - `/admin-offers-management`
  - `/admin-reviews-moderation`

---

## 5) Screen-by-Screen Functional and Layout Specification

For each screen: keep desktop-first responsive layout, with tablet and mobile breakpoints.

### 5.1 Auth and Entry Screens

#### Splash (`/`)
- Content: brand splash image/background, loading indicator.
- Behavior: session restore then role-aware redirect.
- Layout: full-screen visual, minimal controls.

#### Onboarding (`/onboarding`)
- Content: three hero slides, copy blocks, CTA buttons.
- Behavior: next/skip, proceed to role selection.
- Layout: carousel-like center panel on desktop; full-screen swipe on mobile.

#### Role Selection (`/role-selection`)
- Content: two role cards (Customer / Provider), feature bullet hints.
- Behavior: route to customer login or provider login.
- Layout: side-by-side cards on desktop, stacked cards on mobile.

#### Customer Login (`/login`) + OTP (`/otp-verification`)
- Content: phone field, OTP input, resend timer, optional Google sign-in.
- Behavior: authenticate with Firebase Auth.
- Layout: centered auth card with side illustration on large screens.

#### Profile Setup (`/profile-setup`) and City Selection (`/city-selection`)
- Content: profile form fields, location/city options.
- Behavior: create/update `users/{uid}` and continue to home.
- Layout: card form layout, progress indicator.

### 5.2 Customer Main Shell

Use a persistent shell:
- Desktop: left sidebar nav + top utility bar.
- Tablet/mobile: bottom nav equivalent to Flutter tabs.

Tabs:
- Home
- Discover (or Reels)
- My Events
- Profile

### 5.3 Customer Feature Screens

#### Home (`/home`)
- Required blocks:
  - top app bar (city, notifications, profile quick access)
  - hero banners/offers carousel
  - nearby providers section
  - featured providers section
  - trending reels preview rail
  - shortcuts to booking/referrals
- States: loading skeletons, empty states, retry on errors.

#### Discover and Reels (`/discover`, `/discover/trending`, `/reels`, `/reel-player`)
- Required blocks:
  - vertical reel player/feed
  - category tabs (For You/Weddings/Birthdays/Corporate/Engagements)
  - reel interactions (like, share, metadata)
  - provider quick profile access
- Behavior: smooth video transitions and lazy loading.

#### Booking Flow (must be sequential and recoverable)
- `/event-type-selection`
- `/package-selection`
- `/event-details` and `/event-details-form`
- `/venue-selection`
- `/provider-selection`
- `/provider-portfolio`
- `/provider-details/[providerId]`
- `/catalogue-selection`
- `/provider-package-pick`
- `/package-customization`
- `/booking-summary`
- `/payment`
- `/payment-success`
- `/payment-failure`
- `/my-transactions`

Each booking screen must define:
- Header + progress stepper
- Main form/content area
- Summary sidebar (desktop) / sticky summary card (mobile)
- Back/next controls with validation
- Persisted draft state in client store

#### My Events (`/my-events`, `/event-details-view/[eventId]`, `/event-tracking/[eventId]`)
- Content:
  - status-filter tabs
  - event cards/list
  - detail timeline and booking metadata
  - live tracking status panel (if active)

#### Profile and Support
- `/profile`: account summary, stats, quick actions.
- `/edit-profile`: editable fields + image upload.
- `/saved-venues`: saved location cards.
- `/payment-methods`: cards/accounts listing.
- `/settings`: preferences/toggles.
- `/support`: ticket list/create ticket.
- `/my-tickets`: support ticket history.
- `/refund-cancellation-policy`: legal copy page.

#### Referral & Wallet
- `/referral-dashboard`
- `/wallet`
- `/referral-history`
- `/redemption`

Include earnings summary, transaction log, referral code block, redemption workflow.

### 5.4 Provider Screens

#### Provider Auth + Onboarding
- `/provider-login`
- `/provider-registration`
- `/provider-business-profile`
- `/provider-portfolio-upload`
- `/provider-service-areas`
- `/provider-document-upload`
- `/provider-availability-calendar`
- `/provider-verification`

Layout: stepper wizard, document upload panels, verification status blocks.

#### Provider Portal Shell
- `/provider-portal/[providerId]/home`
- `/provider-portal/[providerId]/schedule`
- `/provider-portal/[providerId]/bookings`
- `/provider-portal/[providerId]/earnings`
- `/provider-portal/[providerId]/account`

Required provider shell elements:
- provider tab nav
- status pills for pending/confirmed/completed
- availability/calendar management
- earnings metrics and payout info

#### Provider Operational Tools
- `/provider-booking-calendar/[providerId]`
- `/provider-booking-timeline/[providerId]/[bookingId]`
- `/provider-customer-contact/[providerId]/[bookingId]`
- `/provider-venue-navigation/[providerId]/[bookingId]`
- `/provider-pre-event-checklist/[providerId]/[bookingId]`
- `/provider-booking-status/[providerId]/[bookingId]`
- `/provider-my-reels/[providerId]`
- `/upload-footage`
- `/reel-editor`
- `/live-event-mode`
- `/provider-catalogue/[providerId]`
- `/provider-catalogue-edit/[providerId]/[catalogueEventId]`
- `/provider-bank-details`

### 5.5 Admin Screens

- `/admin-dashboard`
- `/admin-user-management`
- `/admin-booking-management`
- `/admin-provider-verification`
- `/admin-content-moderation`
- `/admin-analytics`
- `/admin-payment-management`
- `/admin-provider-earnings`
- `/admin-offers-management`
- `/admin-reviews-moderation`

Admin layout:
- Desktop-first admin shell with side nav, top metrics row, filters table views.
- Must support search/filter/sort/actions and status transitions.

---

## 6) UI Theme and Design Token Parity

Use these core tokens:
- `background`: `#141A1D`
- `surface`: `#1D2529`
- `cardBackground`: `#232D31`
- `surfaceElevated`: `#2A353A`
- `primary`: `#2A84A0` (use with related teal shades from app docs)
- `secondary`: `#989694`
- `textPrimary`: `#FFFFFF`
- `textSecondary`: `#D2D2D1`
- `textTertiary`: `#989694`
- `success`: `#4ADE80`
- `warning`: `#F2B544`
- `error`: `#E57373`

Typography:
- Font: `Poppins`
- Preserve hierarchy similar to Flutter (`display/headline/title/body/label` scales).

Shape and spacing:
- Card/input radius: `16px`
- Button radius: `14px`
- Chip radius: `24px`
- Dialog radius: `20px`
- Snackbar/toast radius: `14px`

Core web components to implement:
- `AppShell`, `ProviderShell`, `AdminShell`
- `BottomNav` (mobile), `SidebarNav` (desktop)
- `PrimaryButton`, `OutlineButton`, `TextButton`
- `InputField`, `SelectField`, `PhoneOtpInput`
- `GlassCard` for premium home surfaces
- `ReelPlayer` and `ReelFeed`

---

## 7) Firebase Connection and Exact Current Project Config

Use same Firebase project:
- `projectId`: `rapidreelnew-de86a`
- `messagingSenderId`: `583858856130`
- `apiKey`: `AIzaSyAAuzYnTH6DhyFewO57ITLXa2CJB7B1IX4`
- `authDomain`: `rapidreelnew-de86a.firebaseapp.com`
- `storageBucket`: `rapidreelnew-de86a.firebasestorage.app`

Note:
- Current Flutter web `appId` is placeholder: `1:583858856130:web:YOUR_WEB_APP_ID`
- Replace with real Firebase Web App ID from Firebase Console before production.

### 7.1 Include Current JSON Used by Existing Project

`android/app/google-services.json`:

```json
{
  "project_info": {
    "project_number": "583858856130",
    "project_id": "rapidreelnew-de86a",
    "storage_bucket": "rapidreelnew-de86a.firebasestorage.app"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:583858856130:android:e97b44940bea547f1e5b5b",
        "android_client_info": {
          "package_name": "com.rapidreel.app"
        }
      },
      "oauth_client": [
        {
          "client_id": "583858856130-iocq0lgthe9kkdm1du692sl0moc8ki5b.apps.googleusercontent.com",
          "client_type": 1,
          "android_info": {
            "package_name": "com.rapidreel.app",
            "certificate_hash": "1f7e5ccc968a4b44ef01311adda8e2009580a424"
          }
        },
        {
          "client_id": "583858856130-po97lmlu5b9skscg0j5gti31kb0amb54.apps.googleusercontent.com",
          "client_type": 3
        }
      ],
      "api_key": [
        {
          "current_key": "AIzaSyAAuzYnTH6DhyFewO57ITLXa2CJB7B1IX4"
        }
      ],
      "services": {
        "appinvite_service": {
          "other_platform_oauth_client": [
            {
              "client_id": "583858856130-po97lmlu5b9skscg0j5gti31kb0amb54.apps.googleusercontent.com",
              "client_type": 3
            }
          ]
        }
      },
      "certificate_hash": [
        "1F7E5CCC968A4B44EF01311ADDA8E2009580A424",
        "8547C4310CF4F5BB355A44020AC5690A6169330AF0B3923FB0AEC91491C5C791"
      ]
    }
  ],
  "configuration_version": "1"
}
```

### 7.2 Next.js `.env.local` Contract

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAAuzYnTH6DhyFewO57ITLXa2CJB7B1IX4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rapidreelnew-de86a.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rapidreelnew-de86a
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rapidreelnew-de86a.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=583858856130
NEXT_PUBLIC_FIREBASE_APP_ID=1:583858856130:web:REPLACE_WITH_REAL_WEB_APP_ID
```

### 7.3 Next.js Firebase Init Snippet (Required)

```ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

---

## 8) Firestore Database Schema, Relationships, and Web Models

## 8.1 Collections

- `users`
- `providers`
- `bookings`
- `reels`
- `reviews`
- `referrals`
- `wallet_transactions`
- `payment_transactions`
- `notifications`
- `offers`
- `live_events`
- `admin_analytics`
- `support_tickets`
- `users/{uid}/wallet`
- `users/{uid}/offer_usage`
- `providers/{providerId}/catalogue_events`
- `providers/{providerId}/schedule`
- `reels/{reelId}/comments`

### 8.2 Relationships

```mermaid
flowchart TD
  users[users]
  providers[providers]
  bookings[bookings]
  reels[reels]
  reviews[reviews]
  liveEvents[live_events]
  referrals[referrals]
  walletTx[wallet_transactions]
  notifications[notifications]

  users -->|oneToOneByUid| providers
  users -->|customerId oneToMany| bookings
  providers -->|providerId oneToMany| bookings
  bookings -->|bookingId oneToMany| reels
  bookings -->|bookingId oneToOne| liveEvents
  bookings -->|bookingId optionalOneToOne| reviews
  users -->|oneToManyAsReferrerOrReferred| referrals
  users -->|oneToMany| walletTx
  users -->|oneToMany| notifications
```

### 8.3 TypeScript Model Contracts (must implement)

Implement strongly typed models aligned to Flutter Firebase models:
- `UserModel`
- `ProviderModel`
- `BookingModel`
- `ReelModel`
- `ReviewModel`
- `ReferralModel`
- `WalletTransactionModel`
- `PaymentTransactionModel`
- `NotificationModel`
- `OfferModel`
- `LiveEventModel`
- `AdminAnalyticsModel`
- `SupportTicketModel`
- `CatalogueEventModel`

Minimum field coverage rules:
- Include all fields referenced in `firestore.rules` and current UI usage.
- Include timestamps (`createdAt`, `updatedAt`, and entity-specific status timestamps).
- Keep IDs explicit (`userId`, `providerId`, `bookingId`, etc.) even when document ID duplicates.

### 8.4 Security Rules Alignment

Must mirror these key behaviors:
- User can read/write own profile and subcollections.
- Public read allowed for active providers and public delivered/published reels.
- Booking access split by `customerId` and `providerId`.
- Provider booking updates limited to operational fields (per immutable field logic).
- `payment_transactions` are read-only for clients; writes backend-only.
- Admin full access based on `userType in ['admin', 'superadmin']`.

### 8.5 Storage Rules Alignment

Honor path contracts:
- `user_profile_pics/{userId}/{file}`
- `providers/{providerId}/...`
- `admin_banners/{userId}/{file}`
- `public/...` read-only public assets

---

## 9) Cloud Functions and Behavior Parity

Integrate with existing Functions behaviors:
- booking create side effects
- referral processing
- Stripe payment intent and webhook flow
- reminder notifications
- reel delivery notifications

Important known parity caveat:
- Existing backend has legacy trigger path mismatch in places (`events/{eventId}` vs `bookings` usage in app). Web app implementation must be compatible with actual active collection (`bookings`) and coordinate with backend fixes where needed.

---

## 10) Exact Implementation Plan for Coding Agent

Build milestones:

1. **Foundation**
   - Create Next.js TypeScript app.
   - Set up Firebase client and env.
   - Configure shared theme tokens, typography, and layout primitives.

2. **Auth + Role Guards**
   - Implement auth provider/session management.
   - Implement route guards and role-based redirects.
   - Complete splash/onboarding/role-selection/login/otp/profile-setup/city-selection.

3. **Customer Shell + Core Flows**
   - Build customer shell (home/discover/my-events/profile).
   - Implement booking flow end-to-end.
   - Implement reels and event tracking.
   - Add wallet/referral/profile/settings/support screens.

4. **Provider Portal**
   - Build provider onboarding sequence.
   - Build provider shell and all tabs.
   - Build provider operational tools and uploads/catalog.

5. **Admin Console**
   - Build all admin screens.
   - Implement data tables, filters, moderation/verification actions.

6. **Data Integrity + QA**
   - Validate model typing for all collections.
   - Add robust loading/error/empty states.
   - Perform role-wise acceptance testing.

7. **Production Hardening**
   - Performance optimization (code split, image/video optimization, caching).
   - Error logging and analytics wiring.
   - Security review (rules alignment + server-only operations).

---

## 11) Suggested Next.js Folder Structure

```text
src/
  app/
    (public)/
    (auth)/
    (customer)/
    (provider)/
    (admin)/
  components/
    ui/
    layouts/
    customer/
    provider/
    admin/
  lib/
    firebase/
    auth/
    guards/
    models/
    repositories/
    validators/
    constants/
  hooks/
  services/
  styles/
```

---

## 12) Acceptance Criteria (Must Pass)

- Functional parity with mobile for all listed routes and role flows.
- Firebase data writes/reads map to existing collections and field names.
- Route guards correctly prevent unauthorized access.
- Booking flow fully operational from event selection to payment result state.
- Provider lifecycle and portal features available.
- Admin management screens operational with role checks.
- Dark theme parity maintained across all major UI components.
- Responsive behavior works on desktop/tablet/mobile web.

---

## 13) Test Plan and UAT Checklist

### 13.1 Automated
- Unit tests for:
  - model mappers
  - route guards
  - critical hooks/services
- Integration tests for:
  - auth + role redirects
  - booking flow state persistence
  - Firestore repository methods
- E2E tests for:
  - customer booking happy path
  - provider booking management path
  - admin verification/moderation path

### 13.2 Manual UAT by Role
- Customer:
  - login, profile, booking, payment status, reels, referrals, wallet, support
- Provider:
  - onboarding, schedule, bookings lifecycle, uploads, earnings, account/bank
- Admin:
  - user/provider/booking/payment/offers/reviews/content operations

### 13.3 Data and Security Checks
- Validate role permissions against Firestore rules.
- Confirm no client writes to `payment_transactions`.
- Confirm provider and public media access behavior follows storage rules.

---

## 14) Final Instruction to Implementing Agent

Treat this document as strict implementation requirements.  
When a conflict appears between existing docs and runtime behavior, prioritize:
1) `firestore.rules` / `storage.rules`,  
2) active route and model code,  
3) this spec.

Do not remove features for simplification.  
Keep UX and content parity with the current mobile app while implementing web-appropriate responsive layout and accessibility improvements.

