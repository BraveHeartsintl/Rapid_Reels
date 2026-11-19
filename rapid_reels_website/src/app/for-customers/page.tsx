import { AudiencePage } from "@/components/home/AudiencePage";

export const metadata = { title: "For customers" };

export default function ForCustomersPage() {
  return (
    <AudiencePage
      c={{
        eyebrow: "For customers",
        title: "Your event, captured and",
        accent: "shared in minutes.",
        intro:
          "Discover verified creators, compare transparent packages, pay securely in-app, and get reels ready for Instagram and WhatsApp while the event is still buzzing.",
        primary: { href: "/login", label: "Start booking" },
        secondary: { href: "/packages", label: "View packages" },
        heroImage: "/hero-event.jpg",
        heroAlt: "A couple dancing under confetti while a creator films the moment",
        stats: [
          { value: "Minutes", label: "To your first reel" },
          { value: "Verified", label: "Creators you can trust" },
          { value: "Live", label: "Event tracking" },
          { value: "Secure", label: "In-app payments" },
        ],
        benefitsTitle: "Everything you need for a great event reel",
        benefits: [
          { icon: "✓", title: "Verified creators", text: "Every provider is checked before they can accept bookings. Read reviews and watch portfolios before you choose." },
          { icon: "☰", title: "Transparent packages", text: "See coverage hours, number of reels, editing style and delivery time up front. No surprises at checkout." },
          { icon: "◉", title: "Live event tracking", text: "Follow progress as your creator covers the day, from arrival to the first clips being captured." },
          { icon: "⚡", title: "Same-day highlight reels", text: "Get social-ready reels fast so you can post while friends and family are still talking about the event." },
          { icon: "◈", title: "Wallet rewards & referrals", text: "Earn rewards, use offer codes, and invite friends to get credit towards your next booking." },
          { icon: "▶", title: "Discover feed", text: "Browse public reels by event type — wedding, birthday, engagement, corporate and more — for inspiration." },
        ],
        stepsTitle: "How booking works",
        steps: [
          { title: "Pick your event", text: "Choose the type of event, your city and the date." },
          { title: "Choose a creator", text: "Compare verified providers, portfolios, reviews and packages." },
          { title: "Pay securely", text: "Confirm your booking with in-app payment and apply any offer code." },
          { title: "Get your reel", text: "Track the event live and receive your reel ready to share." },
        ],
        faqs: [
          { q: "How do I book a creator?", a: "Choose your event type and city, pick a verified provider and package, then pay securely to confirm." },
          { q: "Can I follow my event live?", a: "Yes. Live event tracking shows progress while your creator covers the day." },
          { q: "How fast will I get my reel?", a: "Delivery time depends on the package you pick, and it's shown clearly before you book. Many packages deliver the same day." },
          { q: "What if I need to cancel?", a: "Cancellation and refund rules are listed on the refund policy page and shown before you pay." },
          { q: "Can my reels be public?", a: "Only if you choose to. Approved public reels can appear in the Discover feed." },
        ],
      }}
    />
  );
}
