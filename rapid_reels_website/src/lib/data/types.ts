import type { DocumentData, DocumentSnapshot, Timestamp } from "firebase/firestore";

/** Shapes mirror rapid_reels_app/lib/core/firebase/models/*.dart */

export type WithId<T> = T & { id: string };

export type UserType = "customer" | "provider" | "admin" | "superadmin";

export interface UserDoc {
  phoneNumber?: string;
  email?: string;
  fullName?: string;
  profileImage?: string | null;
  userType?: UserType;
  currentLocation?: { city?: string; state?: string; country?: string };
  referralCode?: string;
  referredBy?: string;
  walletBalance?: number;
  totalEventsBooked?: number;
  totalReelsReceived?: number;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  metadata?: Record<string, unknown>;
}

export interface PackageOffering {
  packageId: string;
  name: string;
  price: number;
  duration: number;
  reelsCount: number;
  editingStyle: string;
  deliveryTime: number;
  highlightVideo?: boolean;
  liveReelStation?: boolean;
  features: string[];
}

export interface ProviderDoc {
  businessName?: string;
  ownerName?: string;
  email?: string;
  phoneNumber?: string;
  profileImage?: string;
  coverImages?: string[];
  bio?: string;
  eventTypes?: string[];
  packages?: PackageOffering[];
  portfolio?: Array<{
    reelId: string;
    eventType: string;
    thumbnailUrl: string;
    videoUrl: string;
    duration: number;
    views: number;
    likes: number;
  }>;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    coordinates?: { latitude?: number; longitude?: number };
  };
  serviceAreas?: string[];
  serviceRadius?: number;
  teamSize?: number;
  equipment?: string[];
  rating?: number;
  totalReviews?: number;
  totalEventsCompleted?: number;
  totalReelsDelivered?: number;
  averageDeliveryTime?: number;
  availability?: Record<
    string,
    { isOpen: boolean; slots: Array<{ startTime: string; endTime: string; slotDuration: number }> }
  >;
  blockedDates?: Array<{ date: Timestamp | string; reason?: string; bookingId?: string | null }>;
  bankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
    upiId?: string;
    bankName?: string;
    countryCode?: string;
  };
  commissionRate?: number;
  isVerified?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  verificationStatus?: "pending" | "approved" | "rejected" | string;
  rejectionReason?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  metadata?: Record<string, unknown>;
}

export interface CatalogueEventDoc {
  title?: string;
  shortDescription?: string;
  eventType?: string;
  heroImageUrl?: string;
  galleryImageUrls?: string[];
  longDescription?: string;
  highlights?: string[];
  tags?: string[];
  packageIds?: string[];
  isPublished?: boolean;
  sortOrder?: number;
  startingPrice?: number;
  durationLabel?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type BookingStatus = "pending" | "confirmed" | "ongoing" | "completed" | "cancelled";

export interface BookingDoc {
  customerId: string;
  providerId: string;
  eventType?: string;
  eventName?: string;
  eventDate?: Timestamp;
  eventDateKey?: string;
  eventTime?: string;
  duration?: number;
  guestCount?: number;
  venue?: {
    name?: string;
    address?: string;
    city?: string;
    pincode?: string;
    coordinates?: { latitude?: number; longitude?: number };
  };
  package?: Partial<PackageOffering>;
  customizations?: {
    editingStyle?: string;
    musicPreference?: string;
    colorGrading?: string;
    includeDrone?: boolean;
    additionalReels?: number;
    additionalCost?: number;
  } | null;
  specialRequirements?: string | null;
  keyMoments?: string[] | null;
  status?: BookingStatus | string;
  eventStatus?: Record<string, Timestamp | null>;
  payment?: {
    totalAmount?: number;
    advanceAmount?: number;
    remainingAmount?: number;
    currency?: string;
    paymentStatus?: string;
  };
  contactPerson?: string;
  contactNumber?: string;
  alternateContact?: string | null;
  expectedReelsCount?: number;
  deliveryTimeline?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  cancelledAt?: Timestamp | null;
  cancellationReason?: string | null;
  completedAt?: Timestamp | null;
  metadata?: Record<string, unknown> | null;
  catalogueEventId?: string | null;
  catalogueTitle?: string | null;
  catalogueHeroUrl?: string | null;
}

export interface ReelDoc {
  bookingId?: string;
  customerId?: string;
  providerId?: string;
  eventType?: string;
  eventName?: string;
  title?: string;
  description?: string | null;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  status?: string;
  metadata?: { editingStyle?: string; quality?: string; fileSize?: number; format?: string };
  analytics?: {
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
    downloads?: number;
  };
  tags?: string[] | null;
  hashtags?: string[] | null;
  isPublic?: boolean;
  moderationStatus?: "pending_review" | "approved" | "rejected" | string;
  isFeatured?: boolean;
  likedBy?: string[];
  createdAt?: Timestamp;
  deliveredAt?: Timestamp | null;
  publishedAt?: Timestamp | null;
}

export interface OfferDoc {
  code?: string;
  title?: string;
  description?: string | null;
  type?: string;
  discount?: { percentage?: number | null; amount?: number | null; maxDiscount?: number | null };
  validity?: { startDate?: Timestamp | null; endDate?: Timestamp | null };
  maxUses?: number;
  usedCount?: number;
  isActive?: boolean;
  isPublic?: boolean;
  imageUrl?: string | null;
  expiresAt?: Timestamp | null;
  createdAt?: Timestamp;
}

export interface WalletTransactionDoc {
  userId?: string;
  type?: string;
  amount?: number;
  currency?: string;
  status?: string;
  description?: string | null;
  createdAt?: Timestamp;
}

export interface PaymentTransactionDoc {
  bookingId?: string;
  customerUserId?: string;
  providerUserId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  paymentMethodType?: string;
  createdAt?: Timestamp;
  processedAt?: Timestamp | null;
}

export interface ReviewDoc {
  customerId?: string;
  providerId?: string;
  bookingId?: string;
  rating?: number;
  comment?: string;
  status?: string;
  isPublic?: boolean;
  response?: string | null;
  createdAt?: Timestamp;
}

export interface LiveEventDoc {
  bookingId?: string;
  providerId?: string;
  customerId?: string;
  status?: string;
  startedAt?: Timestamp | null;
  completedAt?: Timestamp | null;
  elapsedTime?: number;
  progress?: {
    coveragePercentage?: number;
    keyMomentsCaptured?: number;
    totalKeyMoments?: number;
    reelsDelivered?: number;
    expectedReels?: number;
    currentPhase?: string | null;
  };
  milestones?: Array<{
    milestoneId: string;
    name: string;
    description?: string | null;
    capturedAt?: Timestamp | null;
    isCaptured?: boolean;
  }>;
  reelDeliveries?: Array<{ reelId: string; title: string; deliveredAt?: Timestamp }>;
}

export interface ContentReportDoc {
  reporterId?: string;
  reportType?: string;
  reelId?: string;
  reportedUserId?: string;
  reason?: string;
  details?: string | null;
  status?: string;
  adminNote?: string | null;
  createdAt?: Timestamp;
}

export interface SupportTicketDoc {
  userId?: string;
  subject?: string;
  description?: string;
  type?: string;
  bookingId?: string | null;
  priority?: string;
  status?: string;
  createdAt?: Timestamp;
}

export function withId<T extends DocumentData>(snap: DocumentSnapshot): WithId<T> {
  return { id: snap.id, ...(snap.data() as T) };
}

export function toDate(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === "object" && v !== null && "toDate" in v && typeof (v as Timestamp).toDate === "function") {
    return (v as Timestamp).toDate();
  }
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}
