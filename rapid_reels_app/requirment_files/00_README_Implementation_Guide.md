# Rapid Reels App Legal Pack — Implementation Guide

## Status

| Item | Status |
|---|---|
| App name | ✅ **Rapid Reels App** — applied across all 7 documents |
| Company name | ✅ **Brave Hearts International** — applied across all 7 documents |
| All other placeholders | ⚠️ Outstanding — see table below |

## What's in this pack

This pack contains the seven legal documents required to launch a photography booking app in the UK market, drafted to be UK GDPR, Consumer Rights Act 2015, PECR, and Online Safety Act 2023 compliant.

| # | Document | Where it goes in the app |
|---|---|---|
| 01 | Terms and Conditions | Linked at signup; "Legal" section in app settings |
| 02 | Privacy Policy | Linked at signup (consent tickbox); accessible everywhere |
| 03 | Cookie Policy | Linked from the cookie consent banner on first launch |
| 04 | Refund and Cancellation Policy | Linked at checkout/booking confirmation |
| 05 | Acceptable Use Policy | Linked at signup; "Legal" section |
| 06 | Image Rights and Subject Consent Policy | Linked at booking confirmation (User's warranty point) |
| 07 | Complaints Policy | "Help" or "Contact" section of the app |

---

## Placeholders still to fill in

Run a find-and-replace across all 7 files for the remaining placeholders.

### Company identity (other than name)
| Placeholder | Replace with |
|---|---|
| `[COMPANY_NUMBER]` | Companies House registration number for Brave Hearts International |
| `[REGISTERED_ADDRESS]` | Brave Hearts International's registered office address |

### Contact channels
| Placeholder | Replace with |
|---|---|
| `[SUPPORT_EMAIL]` | e.g. support@rapidreels.co.uk |
| `[PRIVACY_EMAIL]` | e.g. privacy@rapidreels.co.uk |
| `[COMPLAINTS_EMAIL]` | e.g. complaints@rapidreels.co.uk |
| `[PHONE_NUMBER]` | Your customer service phone number |
| `[SUPPORT_HOURS]` | e.g. "9am–6pm" |

### Dates
| Placeholder | Replace with |
|---|---|
| `[LAST_UPDATED]` | Date documents were last updated |
| `[EFFECTIVE_DATE]` | Date documents take effect (often the same) |

### Vendors and integrations
| Placeholder | Replace with |
|---|---|
| `[PAYMENT_PROCESSOR]` | e.g. "Stripe Payments Europe Ltd" |
| `[ANALYTICS_PROVIDER]` | e.g. "Google Analytics" |
| `[ICO_REGISTRATION_NUMBER]` | Your ICO registration number (see "Before launch" below) |

### Refund schedule percentages
| Placeholder | Suggested value | Note |
|---|---|---|
| `[SMALL_PERCENT]` | 5–10 | Admin fee deduction for early cancellation |
| `[MID_PERCENT]` | 50 | Refund 7–14 days before event |
| `[LOW_PERCENT]` | 25 | Refund 48hrs–7 days before event |
| `[RESCHEDULE_FEE]` | e.g. "£25" | Late reschedule admin fee |
| `[REFUND_PROCESSING_DAYS]` | e.g. "5–10" | How long refunds take |
| `[FORCE_MAJEURE_WINDOW]` | e.g. "90 days" | How long you'll try to reschedule before refunding |
| `[QUALITY_COMPLAINT_WINDOW]` | e.g. "14" | Days a customer has to raise photo-quality issues |
| `[ACK_DAYS]` | e.g. "3" | Working days to acknowledge a quality complaint |
| `[RESOLUTION_DAYS]` | e.g. "10" | Working days to resolve a quality complaint |

### Photograph retention periods
| Placeholder | Suggested value |
|---|---|
| `[DOWNLOAD_PERIOD]` | e.g. "30" (days the download link is live) |
| `[ARCHIVE_PERIOD]` | e.g. "6 months" |
| `[RAW_RETENTION_PERIOD]` | e.g. "30 days" |

### ADR provider (optional but recommended)
| Placeholder | Replace with |
|---|---|
| `[ADR_PROVIDER_NAME]` | e.g. "The Retail Ombudsman" or another approved ADR body |
| `[ADR_PROVIDER_WEBSITE]` | Provider website URL |
| `[ADR_PROVIDER_EMAIL]` | Provider contact email |

---

## Before launch — UK regulatory checklist

1. **Verify Brave Hearts International is registered at Companies House** (or register it if not).
2. **Register Brave Hearts International with the ICO as a data controller** — required for processing personal data. Annual fee usually £40–£60. Apply at https://ico.org.uk/registration/new.
3. **Verify VAT registration status** — required if Brave Hearts International's taxable turnover is over £90,000.
4. **Set up the payment processor** — Stripe, GoCardless, etc. — and confirm whether Rapid Reels App will hold customer funds (escrow) before paying photographers. This affects whether you need authorisation under the Payment Services Regulations 2017.
5. **Get professional indemnity and public liability insurance** — for the platform itself, and require photographers to carry their own.
6. **Photographer Agreements and Editor Data Processing Agreements** — these are contractor-side contracts (not user-facing) but are essential. Happy to draft these next.
7. **Apple App Store / Google Play compliance** — both require links to your Privacy Policy in the app metadata and on the store listing.
8. **DBS checks** — strongly recommended for photographers covering events with children.

---

## Notes on app implementation

- **At signup**: present an unchecked tickbox: "I have read and agree to the Terms and Conditions, Privacy Policy and Acceptable Use Policy." Do not pre-tick consent boxes — this breaches UK GDPR (Planet49 ruling).
- **Cookie consent banner** must offer "Accept All", "Reject All" and "Manage" with equal prominence. "Reject All" cannot be more buried than "Accept All".
- **Marketing consent** must be a separate, granular, opt-in tickbox — not bundled with Terms acceptance.
- **At booking confirmation**: present the Refund and Cancellation Policy *before* the customer pays, with a tickbox confirming they have read it. This satisfies the Consumer Contracts Regulations 2013 requirement to give pre-contract information.
- **Image consent**: at booking, ask the customer to confirm they have authority to authorise photography at the venue and consent on behalf of attendees. Display the Image Rights and Subject Consent Policy as a link.
- **Version control**: keep a changelog. When you update any policy, store the previous version with effective dates so you can prove which version applied to which user at which time.

---

## Important disclaimer

These documents are professionally drafted templates calibrated for Rapid Reels App as a UK photography booking platform operated by Brave Hearts International, reflecting current UK consumer and data protection law as at the date of drafting. They are not a substitute for advice from a qualified solicitor.

Before publishing, I would strongly recommend:

1. A solicitor's review (particularly of clauses 7 IP, 10 Liability, and 14 ADR in the T&Cs);
2. Verification of Brave Hearts International's ICO registration and DPO requirements;
3. Confirmation that the payment flow does not bring Brave Hearts International within the scope of Payment Services Regulations 2017 (which would require FCA authorisation or registration as an Agent or Small PI).
