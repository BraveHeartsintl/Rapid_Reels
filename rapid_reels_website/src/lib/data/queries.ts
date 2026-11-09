import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getAggregateFromServer,
  getCountFromServer,
  getDoc,
  getDocs,
  increment,
  limit as qLimit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  sum,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getDb, getFunctionsInstance } from "@/lib/firebase";
import {
  toDate,
  withId,
  type BookingDoc,
  type CatalogueEventDoc,
  type ContentReportDoc,
  type LiveEventDoc,
  type OfferDoc,
  type PaymentTransactionDoc,
  type ProviderDoc,
  type ReelDoc,
  type ReviewDoc,
  type SupportTicketDoc,
  type UserDoc,
  type WalletTransactionDoc,
  type WithId,
} from "@/lib/data/types";

/* -------------------------------------------------------------------------- */
/* helpers                                                                    */
/* -------------------------------------------------------------------------- */

async function list<T extends DocumentData>(
  path: string,
  ...constraints: QueryConstraint[]
): Promise<WithId<T>[]> {
  const snap = await getDocs(query(collection(getDb(), path), ...constraints));
  return snap.docs.map((d) => withId<T>(d));
}

async function one<T extends DocumentData>(path: string, id: string): Promise<WithId<T> | null> {
  const snap = await getDoc(doc(getDb(), path, id));
  return snap.exists() ? withId<T>(snap) : null;
}

function byCreatedDesc<T extends { createdAt?: unknown }>(a: T, b: T): number {
  return (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0);
}

/* -------------------------------------------------------------------------- */
/* users                                                                      */
/* -------------------------------------------------------------------------- */

export const getUser = (uid: string) => one<UserDoc>("users", uid);

export async function listUsers(max = 300): Promise<WithId<UserDoc>[]> {
  const users = await list<UserDoc>("users", qLimit(max));
  return users.sort(byCreatedDesc);
}

export async function createUserProfile(uid: string, data: UserDoc): Promise<void> {
  await setDoc(doc(getDb(), "users", uid), {
    isActive: true,
    isVerified: false,
    walletBalance: 0,
    totalEventsBooked: 0,
    totalReelsReceived: 0,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserProfile(uid: string, patch: Record<string, unknown>): Promise<void> {
  await updateDoc(doc(getDb(), "users", uid), { ...patch, updatedAt: serverTimestamp() });
}

/* -------------------------------------------------------------------------- */
/* providers & catalogue                                                      */
/* -------------------------------------------------------------------------- */

export const getProvider = (id: string) => one<ProviderDoc>("providers", id);

/** Active providers (public read). Sorted verified first, then rating. */
export async function listProviders(): Promise<WithId<ProviderDoc>[]> {
  const all = await list<ProviderDoc>("providers", where("isActive", "==", true), qLimit(200));
  return all.sort((a, b) => {
    const v = Number(Boolean(b.isVerified)) - Number(Boolean(a.isVerified));
    return v !== 0 ? v : (b.rating ?? 0) - (a.rating ?? 0);
  });
}

/** Admin: every provider. */
export async function listAllProviders(): Promise<WithId<ProviderDoc>[]> {
  const all = await list<ProviderDoc>("providers", qLimit(500));
  return all.sort(byCreatedDesc);
}

export async function createProviderProfile(uid: string, data: ProviderDoc): Promise<void> {
  await setDoc(doc(getDb(), "providers", uid), {
    profileImage: "",
    coverImages: [],
    bio: "",
    eventTypes: [],
    packages: [],
    portfolio: [],
    serviceAreas: [],
    serviceRadius: 50,
    teamSize: 1,
    equipment: [],
    rating: 0,
    totalReviews: 0,
    totalEventsCompleted: 0,
    totalReelsDelivered: 0,
    averageDeliveryTime: 0,
    availability: {},
    blockedDates: [],
    commissionRate: 15,
    isFeatured: false,
    isActive: true,
    ...data,
    isVerified: false,
    verificationStatus: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateProvider(id: string, patch: Record<string, unknown>): Promise<void> {
  await updateDoc(doc(getDb(), "providers", id), { ...patch, updatedAt: serverTimestamp() });
}

export async function listCatalogue(
  providerId: string,
  opts: { publishedOnly: boolean } = { publishedOnly: true },
): Promise<WithId<CatalogueEventDoc>[]> {
  const path = `providers/${providerId}/catalogue_events`;
  const items = opts.publishedOnly
    ? await list<CatalogueEventDoc>(path, where("isPublished", "==", true))
    : await list<CatalogueEventDoc>(path);
  return items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export const getCatalogueEvent = (providerId: string, id: string) =>
  one<CatalogueEventDoc>(`providers/${providerId}/catalogue_events`, id);

export async function saveCatalogueEvent(
  providerId: string,
  id: string | null,
  data: CatalogueEventDoc,
): Promise<string> {
  const col = collection(getDb(), `providers/${providerId}/catalogue_events`);
  if (id) {
    await updateDoc(doc(col, id), { ...data, updatedAt: serverTimestamp() });
    return id;
  }
  const ref = await addDoc(col, {
    sortOrder: 0,
    isPublished: false,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteCatalogueEvent(providerId: string, id: string): Promise<void> {
  await deleteDoc(doc(getDb(), `providers/${providerId}/catalogue_events`, id));
}

export async function listProviderReviews(providerId: string): Promise<WithId<ReviewDoc>[]> {
  const rows = await list<ReviewDoc>(
    "reviews",
    where("providerId", "==", providerId),
    where("status", "==", "approved"),
    where("isPublic", "==", true),
    qLimit(50),
  );
  return rows.sort(byCreatedDesc);
}

export async function listAllReviews(): Promise<WithId<ReviewDoc>[]> {
  return (await list<ReviewDoc>("reviews", qLimit(300))).sort(byCreatedDesc);
}

export async function updateReview(id: string, patch: Record<string, unknown>): Promise<void> {
  await updateDoc(doc(getDb(), "reviews", id), patch);
}

/* -------------------------------------------------------------------------- */
/* offers                                                                     */
/* -------------------------------------------------------------------------- */

export async function listPublicOffers(): Promise<WithId<OfferDoc>[]> {
  return list<OfferDoc>("offers", where("isActive", "==", true), where("isPublic", "==", true));
}

export async function listAllOffers(): Promise<WithId<OfferDoc>[]> {
  return (await list<OfferDoc>("offers", qLimit(300))).sort(byCreatedDesc);
}

export async function saveOffer(id: string | null, data: OfferDoc): Promise<string> {
  if (id) {
    await updateDoc(doc(getDb(), "offers", id), data as DocumentData);
    return id;
  }
  const ref = await addDoc(collection(getDb(), "offers"), {
    usedCount: 0,
    maxUses: 0,
    isActive: true,
    isPublic: true,
    type: "percentage",
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteOffer(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), "offers", id));
}

/* -------------------------------------------------------------------------- */
/* bookings                                                                   */
/* -------------------------------------------------------------------------- */

export const getBooking = (id: string) => one<BookingDoc>("bookings", id);

export async function listCustomerBookings(uid: string): Promise<WithId<BookingDoc>[]> {
  const rows = await list<BookingDoc>("bookings", where("customerId", "==", uid));
  return rows.sort((a, b) => (toDate(b.eventDate)?.getTime() ?? 0) - (toDate(a.eventDate)?.getTime() ?? 0));
}

export async function listProviderBookings(uid: string): Promise<WithId<BookingDoc>[]> {
  const rows = await list<BookingDoc>("bookings", where("providerId", "==", uid));
  return rows.sort((a, b) => (toDate(b.eventDate)?.getTime() ?? 0) - (toDate(a.eventDate)?.getTime() ?? 0));
}

export async function listAllBookings(max = 500): Promise<WithId<BookingDoc>[]> {
  const rows = await list<BookingDoc>("bookings", qLimit(max));
  return rows.sort(byCreatedDesc);
}

export async function updateBooking(id: string, patch: Record<string, unknown>): Promise<void> {
  await updateDoc(doc(getDb(), "bookings", id), { ...patch, updatedAt: serverTimestamp() });
}

function encodeForCallable(v: unknown): unknown {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) {
    const ms = v.getTime();
    return { seconds: Math.floor(ms / 1000), nanoseconds: (ms % 1000) * 1_000_000 };
  }
  if (Array.isArray(v)) return v.map(encodeForCallable);
  if (typeof v === "object") {
    return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, val]) => [k, encodeForCallable(val)]));
  }
  return v;
}

/** Creates a booking through the `createBookingIfAvailable` Cloud Function (one booking per provider per day). */
export async function createBooking(booking: Record<string, unknown>): Promise<string> {
  const call = httpsCallable<{ booking: unknown }, { bookingId: string }>(
    getFunctionsInstance(),
    "createBookingIfAvailable",
  );
  const res = await call({ booking: encodeForCallable(booking) });
  return res.data.bookingId;
}

export async function createStripePaymentIntent(bookingId: string): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const call = httpsCallable<{ bookingId: string }, { clientSecret: string; paymentIntentId: string }>(
    getFunctionsInstance(),
    "createStripePaymentIntent",
  );
  return (await call({ bookingId })).data;
}

export async function createBookingShareLink(bookingId: string): Promise<Record<string, unknown>> {
  const call = httpsCallable<{ bookingId: string }, Record<string, unknown>>(
    getFunctionsInstance(),
    "createOrGetBookingShareLink",
  );
  return (await call({ bookingId })).data;
}

/** Starts a Veriff identity verification session for the signed-in provider. */
export async function createVeriffSession(): Promise<string> {
  const call = httpsCallable<Record<string, never>, { sessionUrl: string }>(getFunctionsInstance(), "createVeriffSession");
  return (await call({})).data.sessionUrl;
}

/** Days already booked for a provider (own bookings only, for the calendar view). */
export async function listBookedDateKeys(providerId: string): Promise<string[]> {
  const rows = await listProviderBookings(providerId);
  return rows
    .filter((b) => b.status !== "cancelled")
    .map((b) => b.eventDateKey)
    .filter((k): k is string => Boolean(k));
}

/* -------------------------------------------------------------------------- */
/* reels                                                                      */
/* -------------------------------------------------------------------------- */

export const getReel = (id: string) => one<ReelDoc>("reels", id);

function trending(a: ReelDoc, b: ReelDoc): number {
  const likes = (b.analytics?.likes ?? 0) - (a.analytics?.likes ?? 0);
  if (likes !== 0) return likes;
  return (b.analytics?.views ?? 0) - (a.analytics?.views ?? 0);
}

function isDiscoverApproved(r: ReelDoc): boolean {
  const ms = r.moderationStatus;
  return Boolean(r.isPublic) && (r.status === "delivered" || r.status === "published") && (!ms || ms === "approved");
}

export async function listDiscoverReels(max = 40, eventType?: string): Promise<WithId<ReelDoc>[]> {
  const rows = await list<ReelDoc>(
    "reels",
    where("isPublic", "==", true),
    where("status", "in", ["delivered", "published"]),
    qLimit(200),
  );
  return rows
    .filter(isDiscoverApproved)
    .filter((r) => !eventType || r.eventType === eventType)
    .sort(trending)
    .slice(0, max);
}

export async function listCustomerReels(uid: string): Promise<WithId<ReelDoc>[]> {
  return (await list<ReelDoc>("reels", where("customerId", "==", uid))).sort(byCreatedDesc);
}

export async function listProviderReels(uid: string): Promise<WithId<ReelDoc>[]> {
  return (await list<ReelDoc>("reels", where("providerId", "==", uid))).sort(byCreatedDesc);
}

/** Approved public reels for one provider's portfolio. */
export async function listProviderPublicReels(providerId: string): Promise<WithId<ReelDoc>[]> {
  const rows = await list<ReelDoc>(
    "reels",
    where("providerId", "==", providerId),
    where("isPublic", "==", true),
    where("status", "in", ["delivered", "published"]),
  );
  return rows.filter(isDiscoverApproved).sort(trending);
}

export async function listAllReels(max = 300): Promise<WithId<ReelDoc>[]> {
  return (await list<ReelDoc>("reels", qLimit(max))).sort(byCreatedDesc);
}

export async function setReelLike(reelId: string, uid: string, like: boolean): Promise<void> {
  await updateDoc(doc(getDb(), "reels", reelId), {
    likedBy: like ? arrayUnion(uid) : arrayRemove(uid),
    "analytics.likes": increment(like ? 1 : -1),
  });
}

export async function listReelComments(reelId: string): Promise<WithId<{ userId?: string; text?: string; createdAt?: Timestamp }>[]> {
  const rows = await list<{ userId?: string; text?: string; createdAt?: Timestamp }>(`reels/${reelId}/comments`);
  return rows.sort(byCreatedDesc);
}

export async function addReelComment(reelId: string, uid: string, text: string): Promise<void> {
  const ref = doc(collection(getDb(), `reels/${reelId}/comments`));
  await setDoc(ref, { commentId: ref.id, reelId, userId: uid, text, createdAt: serverTimestamp() });
  await updateDoc(doc(getDb(), "reels", reelId), { "analytics.comments": increment(1) }).catch(() => undefined);
}

export async function moderateReel(reelId: string, action: "approve" | "reject"): Promise<void> {
  const ref = doc(getDb(), "reels", reelId);
  if (action === "approve") {
    await updateDoc(ref, {
      moderationStatus: "approved",
      isPublic: true,
      status: "published",
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(ref, {
      moderationStatus: "rejected",
      isPublic: false,
      status: "archived",
      updatedAt: serverTimestamp(),
    });
  }
}

export async function updateReel(reelId: string, patch: Record<string, unknown>): Promise<void> {
  await updateDoc(doc(getDb(), "reels", reelId), { ...patch, updatedAt: serverTimestamp() });
}

export async function createReel(data: ReelDoc): Promise<string> {
  const ref = await addDoc(collection(getDb(), "reels"), {
    status: "processing",
    isPublic: false,
    moderationStatus: "pending_review",
    isFeatured: false,
    likedBy: [],
    analytics: { views: 0, likes: 0, shares: 0, comments: 0, downloads: 0 },
    metadata: { editingStyle: "standard", quality: "1080p", fileSize: 0 },
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/* -------------------------------------------------------------------------- */
/* wallet & payments                                                          */
/* -------------------------------------------------------------------------- */

export async function listWalletTransactions(uid: string): Promise<WithId<WalletTransactionDoc>[]> {
  return (await list<WalletTransactionDoc>("wallet_transactions", where("userId", "==", uid))).sort(byCreatedDesc);
}

export async function listCustomerPayments(uid: string): Promise<WithId<PaymentTransactionDoc>[]> {
  return (await list<PaymentTransactionDoc>("payment_transactions", where("customerUserId", "==", uid))).sort(byCreatedDesc);
}

export async function listProviderPayments(uid: string): Promise<WithId<PaymentTransactionDoc>[]> {
  return (await list<PaymentTransactionDoc>("payment_transactions", where("providerUserId", "==", uid))).sort(byCreatedDesc);
}

export async function listAllPayments(max = 500): Promise<WithId<PaymentTransactionDoc>[]> {
  return (await list<PaymentTransactionDoc>("payment_transactions", qLimit(max))).sort(byCreatedDesc);
}

/* -------------------------------------------------------------------------- */
/* live events                                                                */
/* -------------------------------------------------------------------------- */

export function subscribeLiveEvent(
  bookingId: string,
  cb: (event: WithId<LiveEventDoc> | null) => void,
  onError?: (e: Error) => void,
): () => void {
  return onSnapshot(
    doc(getDb(), "live_events", bookingId),
    (snap) => cb(snap.exists() ? withId<LiveEventDoc>(snap) : null),
    (e) => onError?.(e),
  );
}

export async function saveLiveEvent(bookingId: string, patch: Record<string, unknown>): Promise<void> {
  await setDoc(doc(getDb(), "live_events", bookingId), { bookingId, ...patch }, { merge: true });
}

/* -------------------------------------------------------------------------- */
/* reports, tickets, referrals                                                */
/* -------------------------------------------------------------------------- */

export async function submitContentReport(input: {
  reporterId: string;
  reelId: string;
  reportedUserId: string;
  reason: string;
  details?: string;
  reportType?: string;
}): Promise<void> {
  await addDoc(collection(getDb(), "content_reports"), {
    reportType: "reel",
    details: null,
    ...input,
    status: "pending",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

export async function listContentReports(): Promise<WithId<ContentReportDoc>[]> {
  return (await list<ContentReportDoc>("content_reports", qLimit(300))).sort(byCreatedDesc);
}

export async function resolveContentReport(id: string, status: string, adminNote?: string): Promise<void> {
  await updateDoc(doc(getDb(), "content_reports", id), {
    status,
    adminNote: adminNote ?? null,
    resolvedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

export async function listUserTickets(uid: string): Promise<WithId<SupportTicketDoc>[]> {
  return (await list<SupportTicketDoc>("support_tickets", where("userId", "==", uid))).sort(byCreatedDesc);
}

export async function createSupportTicket(uid: string, data: { subject: string; description: string; category?: string; bookingId?: string }): Promise<string> {
  const ref = await addDoc(collection(getDb(), "support_tickets"), {
    type: data.category ?? "general",
    priority: "medium",
    subject: data.subject,
    description: data.description,
    bookingId: data.bookingId ?? null,
    messages: [],
    userId: uid,
    status: "open",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTicketStatus(id: string, status: string): Promise<void> {
  await updateDoc(doc(getDb(), "support_tickets", id), {
    status,
    ...(status === "resolved" ? { resolvedAt: serverTimestamp() } : {}),
    ...(status === "closed" ? { closedAt: serverTimestamp() } : {}),
  });
}

/* -------------------------------------------------------------------------- */
/* booking drive                                                              */
/* -------------------------------------------------------------------------- */

export interface DriveMeta {
  isSharedWithCustomer?: boolean;
  approvedByAdminAt?: Timestamp | null;
  originalFolderPath?: string;
  editedFolderPath?: string;
}

export interface DriveFile {
  bookingId?: string;
  folderType?: "original" | "edited" | string;
  storagePath?: string;
  downloadUrl?: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedByRole?: string;
  uploadedById?: string;
  uploadedAt?: Timestamp;
  isDeleted?: boolean;
  thumbnailUrl?: string | null;
}

export async function getDriveMeta(bookingId: string): Promise<DriveMeta | null> {
  const snap = await getDoc(doc(getDb(), `bookings/${bookingId}/drive`, "meta"));
  return snap.exists() ? (snap.data() as DriveMeta) : null;
}

export async function listDriveFiles(bookingId: string): Promise<WithId<DriveFile>[]> {
  const rows = await list<DriveFile>(`bookings/${bookingId}/driveFiles`);
  return rows
    .filter((f) => !f.isDeleted)
    .sort((a, b) => (toDate(b.uploadedAt)?.getTime() ?? 0) - (toDate(a.uploadedAt)?.getTime() ?? 0));
}

export async function addDriveFile(bookingId: string, file: DriveFile, uploaderId: string): Promise<void> {
  const ref = doc(collection(getDb(), `bookings/${bookingId}/driveFiles`));
  await setDoc(ref, {
    ...file,
    bookingId,
    folderType: "original",
    uploadedByRole: "provider",
    uploadedById: uploaderId,
    isDeleted: false,
    uploadedAt: serverTimestamp(),
  });
  await setDoc(doc(getDb(), `bookings/${bookingId}/drive`, "meta"), { updatedAt: serverTimestamp() }, { merge: true });
}

export async function setDriveShared(bookingId: string, shared: boolean, adminId: string): Promise<void> {
  await setDoc(
    doc(getDb(), `bookings/${bookingId}/drive`, "meta"),
    {
      isSharedWithCustomer: shared,
      approvedByAdminAt: shared ? serverTimestamp() : null,
      approvedByAdminId: shared ? adminId : null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function listAllTickets(): Promise<WithId<SupportTicketDoc>[]> {
  return (await list<SupportTicketDoc>("support_tickets", qLimit(300))).sort(byCreatedDesc);
}

export interface ReferralDoc {
  referrerId?: string;
  referredId?: string;
  referralCode?: string;
  status?: string;
  reward?: { referrerReward?: number; currency?: string; isCredited?: boolean };
  createdAt?: Timestamp;
}

export async function listReferrals(uid: string): Promise<WithId<ReferralDoc>[]> {
  const rows = await list<ReferralDoc>("referrals", where("referrerId", "==", uid));
  return rows.sort(byCreatedDesc);
}

export async function listBlockedUsers(uid: string): Promise<string[]> {
  const snap = await getDocs(collection(getDb(), `users/${uid}/blocked_users`));
  return snap.docs.map((d) => d.id);
}

/* -------------------------------------------------------------------------- */
/* admin metrics                                                              */
/* -------------------------------------------------------------------------- */

export interface AdminStats {
  users: number;
  providers: number;
  bookings: number;
  reels: number;
  revenue: number;
  pendingVerifications: number;
  pendingReels: number;
  openReports: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const db = getDb();
  const countOf = async (path: string, ...c: QueryConstraint[]) =>
    (await getCountFromServer(query(collection(db, path), ...c))).data().count;

  const [users, providers, bookings, reels, pendingVerifications, pendingReels, openReports] = await Promise.all([
    countOf("users"),
    countOf("providers"),
    countOf("bookings"),
    countOf("reels"),
    countOf("providers", where("verificationStatus", "==", "pending")),
    countOf("reels", where("moderationStatus", "==", "pending_review")),
    countOf("content_reports", where("status", "==", "pending")),
  ]);

  let revenue = 0;
  try {
    const agg = await getAggregateFromServer(
      query(collection(db, "payment_transactions"), where("status", "==", "succeeded")),
      { total: sum("amount") },
    );
    revenue = agg.data().total ?? 0;
  } catch {
    revenue = 0;
  }
  return { users, providers, bookings, reels, revenue, pendingVerifications, pendingReels, openReports };
}
