/** Brand tokens aligned with Flutter AppColors */
export const colors = {
  background: "#141A1D",
  primary: "#6A00FF",
  secondary: "#00D4FF",
  primaryDark: "#4B00C8",
  primaryMid: "#5240FF",
  primarySpecular: "#62E3FF",
  surface: "#1D2529",
  card: "#232D31",
  surfaceElevated: "#2A353A",
  textPrimary: "#FFFFFF",
  textSecondary: "#D2D2D1",
  textTertiary: "#8D8E91",
  success: "#4ADE80",
  warning: "#F2B544",
  error: "#E57373",
  outline: "#3D484C",
  wedding: "#6A00FF",
  birthday: "#3A8AA4",
  engagement: "#4B00C8",
  corporate: "#F3C759",
  brand: "#DDBA63",
} as const;

export const packages = [
  {
    id: "basic",
    name: "Basic Reel",
    price: "₹4,999",
    duration: "2–3 hrs coverage",
    features: ["1 highlight reel", "48h delivery", "Basic color grade"],
  },
  {
    id: "standard",
    name: "Standard Event",
    price: "₹9,999",
    duration: "Half-day coverage",
    features: ["3 reels", "Same-day first cut", "Music licensed", "1 revision"],
  },
  {
    id: "premium",
    name: "Premium Live",
    price: "₹19,999",
    duration: "Full-day + live mode",
    features: [
      "Unlimited key-moment reels",
      "15–30 min live turnaround",
      "Dedicated editor",
      "Priority support",
    ],
  },
] as const;
