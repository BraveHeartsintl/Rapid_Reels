import { AudiencePage } from "@/components/home/AudiencePage";

export const metadata = { title: "For providers" };

export default function ForProvidersPage() {
  return (
    <AudiencePage
      c={{
        eyebrow: "For providers",
        title: "Grow your studio with every",
        accent: "celebration.",
        intro:
          "Run your videography business on Rapid Reels — catalogue, calendar, live event mode, reel delivery and earnings, all in one portal.",
        primary: { href: "/provider/registration", label: "Join as provider" },
        secondary: { href: "/provider/login", label: "Provider login" },
        heroImage: "/hero-event.jpg",
        heroAlt: "A creator filming a couple dancing at an event",
        stats: [
          { value: "ID", label: "Verified via Veriff" },
          { value: "Bank", label: "Payouts to your account" },
          { value: "1 portal", label: "Bookings to earnings" },
          { value: "Live", label: "Reel delivery mode" },
        ],
        benefitsTitle: "Tools built for event creators",
        benefits: [
          { icon: "✓", title: "Verified profile", text: "Get a verified badge that builds trust and helps customers choose you over unverified studios." },
          { icon: "▦", title: "Bookings in one place", text: "Accept requests, manage timelines, check pre-event checklists and contact customers without switching apps." },
          { icon: "▣", title: "Calendar & availability", text: "Set working hours, block dates and avoid double bookings with a calendar that stays in sync." },
          { icon: "☰", title: "Catalogue & packages", text: "Create packages with your own pricing, coverage, reel count and editing style. Update them any time." },
          { icon: "⚡", title: "Live mode & fast delivery", text: "Upload footage during the event and deliver reels while the moment is still live to wow your clients." },
          { icon: "£", title: "Earnings & payouts", text: "Track every booking's payout, see your earnings over time and get paid straight to your bank account." },
        ],
        stepsTitle: "Start earning in four steps",
        steps: [
          { title: "Register", text: "Sign up with your phone number and set up your studio profile." },
          { title: "Get verified", text: "Verify your identity with Veriff and add your bank details." },
          { title: "Publish packages", text: "Add your catalogue, service areas and availability." },
          { title: "Accept bookings", text: "Deliver great reels, collect reviews and get paid." },
        ],
        faqs: [
          { q: "Who can join as a provider?", a: "Any videographer, photographer or creator studio that covers events and can deliver short-form reels." },
          { q: "What documents do I need?", a: "A valid passport or driving licence for identity verification (handled securely by our partner Veriff), plus your bank details for payouts." },
          { q: "How long does verification take?", a: "You'll see your verification status in the provider dashboard as soon as it's processed." },
          { q: "How do I get paid?", a: "Payouts for completed bookings are sent to the bank account you add during onboarding. Track them under Earnings." },
          { q: "Can I set my own prices?", a: "Yes. You create your own packages and pricing, and can edit your catalogue whenever you like." },
        ],
      }}
    />
  );
}
