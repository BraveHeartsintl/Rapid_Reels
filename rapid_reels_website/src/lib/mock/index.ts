export type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export const cities = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
] as const;

export const eventTypes = [
  { id: "wedding", label: "Wedding", color: "#6A00FF" },
  { id: "birthday", label: "Birthday", color: "#3A8AA4" },
  { id: "engagement", label: "Engagement", color: "#4B00C8" },
  { id: "corporate", label: "Corporate", color: "#F3C759" },
  { id: "brand", label: "Brand collab", color: "#DDBA63" },
] as const;

export const mockUser = {
  id: "u1",
  name: "Aisha Khan",
  email: "aisha@example.com",
  phone: "+91 98765 43210",
  city: "Mumbai",
  walletBalance: 1250,
  referralCode: "AISHA250",
};

export const mockProviders = [
  {
    id: "p1",
    name: "Lens & Light Studio",
    city: "Mumbai",
    rating: 4.9,
    reviews: 214,
    specialties: ["Wedding", "Engagement"],
    priceFrom: "₹8,999",
    verified: true,
  },
  {
    id: "p2",
    name: "Rapid Frame Co.",
    city: "Mumbai",
    rating: 4.7,
    reviews: 156,
    specialties: ["Birthday", "Brand"],
    priceFrom: "₹5,499",
    verified: true,
  },
  {
    id: "p3",
    name: "StoryCut Films",
    city: "Pune",
    rating: 4.8,
    reviews: 98,
    specialties: ["Corporate", "Wedding"],
    priceFrom: "₹12,000",
    verified: false,
  },
];

export const mockBookings = [
  {
    id: "b1",
    title: "Priya & Arjun Wedding",
    type: "Wedding",
    date: "2026-11-18",
    venue: "Taj Lands End, Mumbai",
    provider: "Lens & Light Studio",
    status: "upcoming" as EventStatus,
    amount: "₹19,999",
  },
  {
    id: "b2",
    title: "Noah's 5th Birthday",
    type: "Birthday",
    date: "2026-10-02",
    venue: "Home, Bandra",
    provider: "Rapid Frame Co.",
    status: "completed" as EventStatus,
    amount: "₹5,499",
  },
  {
    id: "b3",
    title: "Product Launch Reel",
    type: "Corporate",
    date: "2026-11-03",
    venue: "WeWork BKC",
    provider: "StoryCut Films",
    status: "ongoing" as EventStatus,
    amount: "₹12,000",
  },
];

export const mockReels = [
  {
    id: "r1",
    title: "First look — Bandra",
    author: "Lens & Light Studio",
    eventType: "Wedding",
    likes: 1284,
    comments: 42,
  },
  {
    id: "r2",
    title: "Cake smash highlights",
    author: "Rapid Frame Co.",
    eventType: "Birthday",
    likes: 890,
    comments: 31,
  },
  {
    id: "r3",
    title: "CEO keynote cut",
    author: "StoryCut Films",
    eventType: "Corporate",
    likes: 456,
    comments: 18,
  },
  {
    id: "r4",
    title: "Ring ceremony reel",
    author: "Lens & Light Studio",
    eventType: "Engagement",
    likes: 2103,
    comments: 67,
  },
];

export const mockOffers = [
  {
    id: "o1",
    title: "First booking 15% off",
    code: "RAPID15",
    expires: "2026-12-31",
  },
  {
    id: "o2",
    title: "Refer a friend — ₹250 wallet",
    code: "REFER250",
    expires: "Ongoing",
  },
];

export const mockTransactions = [
  { id: "t1", label: "Wedding booking", amount: -19999, date: "2026-10-20" },
  { id: "t2", label: "Referral credit", amount: 250, date: "2026-10-12" },
  { id: "t3", label: "Birthday booking", amount: -5499, date: "2026-09-28" },
];

export const mockAdminStats = {
  users: 12840,
  providers: 642,
  bookings: 3189,
  reels: 9450,
  revenue: "₹2.4Cr",
  pendingVerifications: 18,
  flaggedContent: 7,
};

export const mockUsersAdmin = [
  { id: "u1", name: "Aisha Khan", role: "customer", city: "Mumbai", status: "active" },
  { id: "u2", name: "Rohit Mehta", role: "provider", city: "Pune", status: "active" },
  { id: "u3", name: "Admin Ops", role: "admin", city: "Delhi", status: "active" },
  { id: "u4", name: "Neha Shah", role: "customer", city: "Ahmedabad", status: "suspended" },
];

export const mockVenues = [
  "Taj Lands End, Mumbai",
  "JW Marriott, Juhu",
  "Home — Bandra West",
  "WeWork BKC",
  "The Leela Palace, Bengaluru",
];

export const mockTimeline = [
  { time: "09:00", label: "Arrive at venue", done: true },
  { time: "10:30", label: "Ceremony coverage", done: true },
  { time: "13:00", label: "Lunch + candid", done: false },
  { time: "16:00", label: "First reel delivery", done: false },
  { time: "20:00", label: "Reception wrap", done: false },
];

export const mockEarnings = [
  { month: "Aug", amount: 42000 },
  { month: "Sep", amount: 58500 },
  { month: "Oct", amount: 71200 },
  { month: "Nov", amount: 23800 },
];
