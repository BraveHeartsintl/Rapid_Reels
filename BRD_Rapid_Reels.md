# Business Requirement Document (BRD)

## Document Information

| Field            | Value                                                       |
| ---------------- | ------------------------------------------------------------ |
| Project Name     | Rapid Reels                                                   |
| Requirement ID   | REQ-RR-001                                                     |
| Requirement Name | Rapid Reels Mobile Application - Core Platform                |
| Business Owner   | \[Business Owner Name\]                                       |
| Business Analyst | \[Business Analyst Name\]                                     |
| Version          | 1.0                                                            |
| Date             | 08/07/2026                                                     |

# 1\. Business Objective

## Background

Traditional event videography (weddings, birthdays, engagements, corporate events) suffers from slow turnaround: customers typically wait weeks or months to receive edited footage, by which time the "social media moment" has passed. There is also no standardized, transparent way for customers to discover, compare, and book videographers/photographers ("Providers"), and Providers themselves lack digital tools to manage bookings, capture footage, edit, and get paid efficiently.

Rapid Reels is a two-sided mobile marketplace (Flutter app, Firebase-backed) that connects End Users who want professionally shot and edited short-form video "reels" of their events with independent Service Providers (videographers/editors/studios) who capture and deliver those reels — with a strong emphasis on **fast turnaround** and **instant social sharing**, alongside a TikTok-style Discover feed for content and provider discovery.

## Objective

The purpose of this requirement is to enable users to:

- Discover, compare, and book verified event Providers by event type (wedding, birthday, engagement, corporate, brand collaboration), package tier, city/venue, and availability.
- Authenticate quickly and securely via phone/OTP, Google, or Apple sign-in, and manage a personal profile, saved venues, wallet, and referral rewards.
- Browse, upload, like, comment on, and share short-form event "reels" through a dedicated feed and Discover experience, and receive delivered reels tied to their bookings.
- Pay for bookings through an integrated, secure in-app payment flow and track booking/payment status end to end.
- (For Providers) Manage a business profile and catalogue of bookable event offerings, accept/manage bookings, run "live event mode" coverage, edit and deliver reels, and track earnings/payouts.
- (For Admins) Moderate content and reviews, verify Providers, manage users, bookings, offers, and support tickets, and monitor platform-wide analytics.

## Success Criteria

- Reduced time-to-delivery for event reels (target: initial reels delivered within 15–30 minutes of key moments during live coverage).
- Increased booking conversion through transparent package pricing, provider portfolios/catalogues, and verified reviews.
- Higher user engagement and retention driven by the Discover feed, referral program, and wallet incentives.
- Reliable, auditable payment processing with a full transaction history for every booking.
- Complete audit trail across bookings, payments, and content moderation actions.
- High platform availability and acceptable in-app video playback/upload performance on typical mobile networks.

# 2\. Scope

## In Scope

- User registration and authentication: phone number + OTP (Firebase Auth), Google Sign-In, Apple Sign-In, and email/password sign-in.
- User profile management: profile setup/editing, profile photo upload, saved venues/addresses, settings, support tickets, legal/policy pages.
- Event booking flow: event type selection, package selection, event details form, venue selection (Google Maps), Provider selection/portfolio browsing, Provider catalogue/offering selection, package customization, booking summary, and payment.
- Provider-side app: Provider registration/login, business profile setup, identity/document verification (Veriff), portfolio & service-area setup, availability calendar, catalogue management (create/edit bookable "events"/offerings with galleries), booking management (accept/decline, timeline, customer contact, venue navigation, pre-event checklist), live event mode, reel editor/upload, and earnings/payout tracking.
- Reels & Discover: reel playback (full-screen player), reel gallery ("My Reels"), like/comment/share engagement (persisted to Firestore), Discover feed with search and event-type/tag filtering, trending reels, and reel sharing to external platforms (WhatsApp, Instagram, etc. via native share sheet).
- My Events: real-time list of a user's bookings with status filters (upcoming/ongoing/completed/cancelled), live event tracking, and event detail views.
- Payments: in-app payment flow (Stripe-based) for booking checkout, payment success/failure handling, and transaction history.
- Referral & Wallet: referral code generation/sharing, referral dashboard, wallet balance, wallet transaction history, and redemption.
- Notifications: in-app notification center (bookings, updates) backed by Firestore, with push notifications via Firebase Cloud Messaging.
- Reviews & Offers: customer reviews on Providers (with admin moderation) and promotional offers/banners (admin-managed) surfaced on the home screen.
- Admin capabilities: user management, booking management, Provider verification, content moderation (reels/reviews/reports), offers management, payment management, Provider earnings oversight, and platform analytics.
- Cross-cutting: role-based access (End User, Provider, Admin), legal/policy documents (Terms, Privacy, Refund/Cancellation), and basic platform analytics/crash reporting.

## Out of Scope

- Facebook Sign-In (present in the UI as a placeholder; not implemented — explicitly out of scope for this phase).
- Full production payment gateway settlement/reconciliation logic beyond the current Stripe-based simulated/sandbox checkout flow (production PCI-DSS certified rollout is a follow-on effort).
- AI-assisted video editing suggestions, music library licensing, and drone footage add-ons (documented as future/advanced roadmap items, not part of the current build).
- International expansion / multi-currency, multi-language support beyond the current single-market (India-focused) configuration.
- Web application / desktop clients (the platform is scoped to iOS and Android mobile apps only).
- Advanced admin analytics/BI dashboards beyond the basic counts and summaries currently implemented.

# 3\. Stakeholders

| Role                     | Responsibility                                                        |
| ------------------------ | ---------------------------------------------------------------------- |
| Business Owner           | Defines business needs and product direction                          |
| End User (Customer)      | Discovers Providers/content, books events, receives and shares reels  |
| Service Provider         | Registers, manages catalogue/availability, fulfills bookings, delivers reels, tracks earnings |
| Content Moderator / Admin| Moderates reels, reviews, and content reports; manages offers          |
| Platform Administrator   | Manages users, bookings, Provider verification, payments, analytics    |
| Solution Architect       | Designs the Flutter + Firebase technical solution                     |
| Development Team         | Implements client (Flutter) and backend (Firebase/Cloud Functions) solution |
| QA Team                  | Verifies functionality across customer, Provider, and admin surfaces   |
| Payments Partner (Stripe)| Provides payment processing infrastructure                            |

# 4\. Functional Requirements

## FR-01: User Authentication & Onboarding

**Description**

The system shall allow a person to create an account and sign in using phone number + OTP (primary flow), Google Sign-In, Apple Sign-In (iOS/macOS), or email/password, then complete a one-time profile setup and role/city selection before reaching the home experience.

**Inputs**

- Phone number (with country code) or Google/Apple/email credentials
- OTP code (6-digit) for phone sign-in
- Profile details: full name, email, gender, profile photo, city

**Output**

- Authenticated session (Firebase Auth) and a corresponding user document created/updated in Firestore
- User routed to Home (returning, profile complete) or Profile Setup / City Selection (first-time users)

### Fields

| Field          | Mandatory | Validation                                  |
| -------------- | --------- | -------------------------------------------- |
| Phone Number   | Yes (for phone flow) | Valid international format (e.g. +91XXXXXXXXXX) |
| OTP Code       | Yes (for phone flow) | 6 digits, must match sent verification code |
| Full Name      | Yes       | Non-empty, max length enforced               |
| Email Address  | Yes       | Valid email format                           |
| City           | Yes       | Must be selected from supported cities list  |
| Profile Photo  | No        | Valid image file, uploaded to Firebase Storage |

## FR-02: Event Booking Flow

**Description**

The system shall guide a User through selecting an event type, package, event details, venue, and a Provider, then confirm and pay for the booking.

**Inputs**

- Event type (Wedding, Birthday, Engagement, Corporate Event, Brand Collaboration)
- Package tier (Bronze / Silver / Gold / Platinum) or a Provider-specific catalogue offering
- Event details: event name, date, time, guest count, special notes
- Venue: address selected/searched via Google Maps, or a saved venue
- Selected Provider and any package customizations/add-ons

**Output**

- A booking record created in Firestore with status tracking (pending, confirmed, upcoming, ongoing, completed, cancelled)
- Booking summary displayed prior to payment

### Fields

| Field          | Mandatory | Validation                              |
| -------------- | --------- | ---------------------------------------- |
| Event Type     | Yes       | Must be one of the supported event types |
| Event Date     | Yes       | Must be a valid future date              |
| Guest Count    | No        | Numeric, greater than 0 if provided      |
| Venue          | Yes       | Must resolve to a valid address/location |
| Provider       | Yes       | Must be an active, verified Provider     |
| Package/Offering | Yes     | Must exist and be published/active       |

## FR-03: Provider Discovery & Catalogue

**Description**

The system shall allow Users to browse and filter Providers by city, event type, rating, and availability, view Provider portfolios (bio, cover images, portfolio reels, reviews), and view a Provider's published catalogue of bookable event offerings (each with its own gallery, description, highlights, and linked packages).

**Inputs**

- Filter criteria: city, event type, rating, price range
- Selected Provider ID / catalogue event ID

**Output**

- Filtered/sorted list of Providers
- Provider detail/portfolio view with reviews and catalogue offerings

## FR-04: Payment & Checkout

**Description**

The system shall allow Users to pay for a confirmed booking through an integrated, Stripe-based in-app payment flow, and shall record the resulting transaction.

**Inputs**

- Booking reference, total amount, selected payment method

**Output**

- Payment success or failure result routed to a dedicated confirmation/failure screen
- A payment transaction record persisted (`payment_transactions` collection) and booking status updated accordingly

### Calculation Values

- Package Base Price
- Add-on/Customization Charges
- Platform Commission (Provider-side)
- Taxes (if applicable)
- Total Amount

### Formula

1 Total Amount =

2 Package Base Price + Add-on Charges + Taxes

## FR-05: Reels Upload, Playback & Engagement

**Description**

The system shall allow Providers to upload event footage and deliver edited reels to Users, and shall allow Users to browse, play, like, comment on, and share reels. Reel engagement (likes, comments, shares, views) shall be persisted in Firestore and reflected in each reel's analytics.

**Inputs**

- Video file (uploaded by Provider via Upload Footage / Reel Editor screens)
- Like/unlike action, comment text, share action (from Users, via the reel player, gallery, Discover feed, or home screen)

**Output**

- Reel record created/updated in Firestore (`reels` collection) with analytics (views, likes, shares, comments)
- Comment documents stored in a `comments` subcollection per reel
- Updated like/share/comment counters visible in near real time across the app

## FR-06: Discover Feed & Search

**Description**

The system shall provide a vertically-scrollable, TikTok-style Discover feed of public reels, allowing Users to filter by event type/tag, search by keyword, and follow/unfollow content creators, and to navigate directly to booking a featured Provider.

**Inputs**

- Search keyword, event type/tag filter selection

**Output**

- Filtered, paginated list of public reels rendered in the feed

## FR-07: My Events (Booking Management for Users)

**Description**

The system shall provide Users with a real-time list of their bookings, filterable by status (All, Upcoming, Ongoing, Completed, Cancelled), with search, summary statistics, and the ability to view booking/event details and live event tracking during an active event.

**Inputs**

- Filter/search selection

**Output**

- Real-time (Firestore stream-backed) list of the User's bookings and associated status/details

## FR-08: Provider Booking & Live Event Management

**Description**

The system shall allow Providers to view and respond to incoming bookings (accept/decline), see booking timelines, contact customers, navigate to the venue, complete a pre-event checklist, start "Live Event Mode" to upload footage during the event, and edit/deliver reels through a mobile Reel Editor.

**Inputs**

- Booking accept/decline decision, uploaded footage files, edit actions (trim, filters, transitions, music), delivery confirmation

**Output**

- Updated booking status, uploaded footage stored in Firebase Storage, delivered reel record created and linked to the booking, and a notification sent to the User

## FR-09: Provider Earnings & Payouts

**Description**

The system shall provide Providers with an earnings dashboard showing payment history, pending payments, commission breakdown, and the ability to view/request payouts.

**Output**

- Earnings summary and transaction history rendered from `payment_transactions` and booking records associated with the Provider

## FR-10: Referral & Wallet

**Description**

The system shall allow Users to share a personal referral code, track referral history, and accumulate/redeem wallet balance (e.g. from referral rewards or promotions).

**Inputs**

- Referral code shared/entered, redemption request

**Output**

- Referral record created, wallet balance updated, wallet transaction logged (`wallet_transactions` collection)

## FR-11: Notifications

**Description**

The system shall notify Users and Providers of relevant events (booking confirmations, reel delivery, status updates) via an in-app notification center backed by Firestore, and via push notifications (Firebase Cloud Messaging).

**Output**

- Notification documents created per recipient; read/unread state tracked and updatable ("mark as read" / "mark all read")

## FR-12: Reviews & Offers

**Description**

The system shall allow Users to leave ratings/reviews for Providers after a completed booking, subject to Admin moderation (approve/reject, public visibility toggle) before being shown publicly, and shall allow Admins to manage promotional offers/banners displayed on the home screen.

**Inputs**

- Rating, review text (User); offer content, active/public flags, applicable event types (Admin)

**Output**

- Review document created with `pending` status pending moderation; approved+public reviews surfaced on Provider profiles and home screen carousels; active/public offers surfaced on the home banner

## FR-13: Support & Help

**Description**

The system shall allow Users to submit support tickets (with category, subject, and message) and view their own ticket history/thread.

**Inputs**

- Ticket category, subject, message text

**Output**

- Support ticket document created (`support_tickets` collection) with an initial message and `open` status; subsequent messages appended to the thread

## FR-14: Provider Verification (Identity/KYC)

**Description**

The system shall require Providers to complete an identity verification step (via the Veriff SDK) and submit business/bank details and documents, subject to Admin review/approval, before being able to accept bookings publicly.

**Inputs**

- Government ID / selfie capture (via Veriff), business documents, bank account details

**Output**

- Verification session result recorded; Provider status updated (pending/verified/rejected) reviewable by Admins

## FR-15: Admin Management Console

**Description**

The system shall provide Admin users with dashboards and tools to manage users, bookings, Provider verification, content moderation (reels, reviews, reports), offers, payments, Provider earnings, and platform analytics.

**Output**

- Administrative actions (approve/reject/suspend/delete) applied to the corresponding Firestore records, with resulting state changes visible to Users/Providers

# 5\. Business Rules

| Rule ID | Business Rule                                                               |
| ------- | ---------------------------------------------------------------------------- |
| BR-01   | A booking must have a valid event type, date, venue, and an active verified Provider |
| BR-02   | A User must be authenticated before creating a booking, posting a review, or engaging with a reel (like/comment/share) |
| BR-03   | Payment must succeed before a booking is marked confirmed for Provider fulfillment |
| BR-04   | Only the Provider assigned to a booking (or an Admin) may update that booking's fulfillment status |
| BR-05   | A review is only visible to other Users once its status is `approved` and it is marked `isPublic` by an Admin |
| BR-06   | A Provider must complete identity verification before being surfaced in public Provider search/selection |
| BR-07   | Reel engagement actions (like/comment/share) must be idempotent per user action (e.g. a share increments the counter only once per share action, not on every share-sheet open) |
| BR-08   | Only the owning User may view or manage their own saved venues, wallet, notifications, and support tickets |
| BR-09   | An Offer is only shown to Users when both `isActive` and `isPublic` are true |
| BR-10   | Every booking, payment, and moderation action must be timestamped and attributable to a user/admin identity for audit purposes |

# 6\. Non-Functional Requirements

## Performance

- App launch time shall be under 2 seconds on supported devices.
- Individual screen loads shall complete within 1–3 seconds under normal network conditions.
- Backend API/Firestore read operations shall target a p95 response time under 500ms.
- Reel/video uploads shall support files up to 100MB with progress indication and retry on failure.
- Video playback shall be smooth at up to 1080p on supported devices.

## Security

- All Users and Providers must authenticate before accessing personalized or write-capable features.
- Firestore security rules shall restrict reads/writes so that users can only access their own personal data (profile, notifications, wallet, tickets, saved venues), while Providers can only manage their own bookings/catalogue, and Admins have elevated access via role checks.
- Payment data shall be handled through the Stripe SDK/tokenization; sensitive payment details shall not be stored directly within the application's own database.
- Provider identity verification shall be performed via a third-party KYC provider (Veriff) rather than storing raw identity documents insecurely.
- Sensitive credentials and API keys shall not be committed to source control (enforced via `.gitignore`).

## Audit

The system shall record, at minimum:

- Created By / Created Date for bookings, reviews, reels, and support tickets
- Updated By / Updated Date for status-changing actions (booking status, moderation decisions)
- Payment transaction timestamps and status transitions
- Admin moderation actions (approve/reject) on reviews, reels, and content reports

## Availability

- The mobile application shall target high availability, relying on Firebase's managed backend infrastructure (Firestore, Auth, Storage, Cloud Functions) for uptime and automatic scaling.
- Critical user flows (login, booking, payment) shall degrade gracefully with clear error states and retry options during backend outages or connectivity loss.

# 7\. User Story

1 As an End User planning a wedding

2

3 I want to browse verified videographers, book a package for my event, and receive a professionally edited reel of the ceremony within minutes so I can share it with friends and family while the event is still happening

4

5 So that I don't have to wait weeks for my event memories and can capture the excitement of the moment on social media immediately.

# 8\. Acceptance Criteria

### Scenario: Successful Event Booking and Payment

**Given** an authenticated User has selected an event type, package, venue, and an active verified Provider, and has entered all mandatory event details

**When** the User reviews the booking summary and completes payment

**Then**

- A booking record is created in Firestore with status "confirmed"
- A corresponding payment transaction record is created and linked to the booking
- The User is shown a booking/payment confirmation screen
- The assigned Provider receives a notification of the new booking
- The booking appears in the User's "My Events" list under the appropriate status filter

### Scenario: Provider Delivers a Reel

**Given** a Provider has an accepted booking and has started Live Event Mode

**When** the Provider uploads footage and completes editing/delivery of a reel for that event

**Then**

- The reel is saved to Firestore and linked to the booking and Provider
- The User receives a notification that a new reel is available
- The reel appears in the User's reel gallery and can be played, liked, commented on, and shared

# 9\. Assumptions

- Users have a smartphone (iOS or Android) with a working camera, internet connectivity, and an active phone number capable of receiving SMS OTPs.
- Providers possess their own video capture equipment and have agreed to platform terms, commission structure, and identity verification requirements.
- Firebase project configuration (Firestore, Auth, Storage, Cloud Functions, FCM) is provisioned and maintained for each environment (dev/staging/production).
- The current payment integration (Stripe) is in a sandbox/simulated state for this phase; production-grade settlement, refunds, and compliance sign-off are assumed to be completed before public launch.
- Planned-but-not-yet-built enhancements noted in prior product research (e.g. AI-assisted editing suggestions, admin dashboard analytics beyond basic counts, expanded search/tagging on Discover) are treated as future roadmap items, not current requirements.
- Supported geography for launch is India-focused (Tier 1 cities first), with pricing shown in INR.

# 10\. Dependencies

- Firebase platform: Authentication, Cloud Firestore, Cloud Storage, Cloud Functions, Cloud Messaging (FCM), Analytics, Crashlytics, App Check.
- Google Sign-In and Sign in with Apple (including associated Apple Developer / Services ID configuration).
- Stripe payment processing SDK (`flutter_stripe`).
- Veriff identity verification SDK/service for Provider KYC.
- Google Maps Platform (maps, geocoding, geolocation) for venue selection and location services.
- Apple App Store and Google Play Store distribution/release processes.
- Native device permissions: camera, microphone, location, photo library/storage.

# 11\. Risks

| Risk                                             | Impact | Mitigation                                                                 |
| ------------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| Low Provider adoption / supply shortage in a city  | High   | Provider recruitment incentives, competitive commission rates, phased city rollout |
| Delayed or failed reel uploads during live events  | High   | Robust upload retry/queueing, offline buffering, monitoring and alerting    |
| Payment failures or disputes                       | Medium | Clear failure states, retry flow, transaction audit trail, refund/cancellation policy |
| Inappropriate or low-quality content in reels/reviews | Medium | Admin content moderation workflow, content reporting, review approval gating |
| Provider identity fraud                            | High   | Mandatory Veriff-based KYC verification before public listing              |
| Backend/service outage (Firebase)                  | High   | Graceful degradation, retry mechanisms, monitoring via Crashlytics/Analytics |
| OTP delivery failures (SMS/Play Integrity issues)  | Medium | Fallback error messaging, alternate sign-in methods (Google/Apple/email)   |

# 12\. Approval

| Name              | Role               | Status  | Date |
| ----------------- | ------------------ | ------- | ---- |
| \[Approver Name\] | Business Owner     | Pending |      |
| \[Approver Name\] | Product Owner      | Pending |      |
| \[Approver Name\] | Solution Architect | Pending |      |
