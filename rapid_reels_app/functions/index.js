const {onRequest, onCall, HttpsError} = require("firebase-functions/v2/https");
const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {defineSecret} = require("firebase-functions/params");
require("dotenv").config();
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const crypto = require("crypto");
const archiver = require("archiver");

admin.initializeApp();

let StripeCtor = null;
let invoiceEmailModule = null;

function getStripeCtor() {
  if (!StripeCtor) {
    StripeCtor = require("stripe");
  }
  return StripeCtor;
}

function getInvoiceEmailModule() {
  if (!invoiceEmailModule) {
    invoiceEmailModule = require("./invoice_email");
  }
  return invoiceEmailModule;
}

/**
 * Rebuild Firestore Timestamp values from Flutter callable JSON
 * ({ seconds, nanoseconds }).
 * @param {*} value
 * @return {*}
 */
function reviveFirestoreTimestamps(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === "object" && !Array.isArray(value) &&
      typeof value.seconds === "number") {
    const ns = typeof value.nanoseconds === "number" ? value.nanoseconds : 0;
    return new admin.firestore.Timestamp(value.seconds, ns);
  }
  if (Array.isArray(value)) {
    return value.map(reviveFirestoreTimestamps);
  }
  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = reviveFirestoreTimestamps(v);
    }
    return out;
  }
  return value;
}

const BLOCKING_BOOKING_STATUSES = ["pending", "confirmed", "ongoing"];
const BOOKING_DRIVE_ORIGINAL_FOLDER = "original_photos_videos";
const BOOKING_DRIVE_EDITED_FOLDER = "edited_deliverables";
const SHARE_TOKEN_BYTES = 24;
const SHARE_LINK_ROUTE_PREFIX = "/share";
const MAX_SHARE_UPLOAD_BYTES = 500 * 1024 * 1024;
const ALLOWED_SHARE_UPLOAD_ROLES = new Set(["provider", "editor"]);
const ALLOWED_MIME_PREFIXES = ["image/", "video/"];

function normalizeHost(rawHost) {
  if (!rawHost || typeof rawHost !== "string") {
    return "";
  }
  return rawHost.replace(/\/+$/, "");
}

function bookingShareDocRef(db, bookingId) {
  return db.collection("bookingShares").doc(String(bookingId));
}

function bookingShareTokenRef(db, token) {
  return db.collection("bookingShareTokens").doc(String(token));
}

function buildShareLink(token) {
  const configuredBase = normalizeHost(process.env.SHARE_WEB_BASE_URL || "");
  if (configuredBase) {
    return `${configuredBase}${SHARE_LINK_ROUTE_PREFIX}/${token}`;
  }
  const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
  if (projectId) {
    return `https://${projectId}.web.app${SHARE_LINK_ROUTE_PREFIX}/${token}`;
  }
  return `${SHARE_LINK_ROUTE_PREFIX}/${token}`;
}

function createShareToken() {
  return crypto.randomBytes(SHARE_TOKEN_BYTES).toString("hex");
}

function parseBearerToken(authHeader) {
  if (!authHeader || typeof authHeader !== "string") {
    return "";
  }
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return "";
  }
  return authHeader.substring(7).trim();
}

function resolveShareToken(request) {
  const fromQuery = request.query && request.query.token ?
    String(request.query.token).trim() :
    "";
  if (fromQuery) {
    return fromQuery;
  }
  const fromBody = request.body && request.body.token ?
    String(request.body.token).trim() :
    "";
  if (fromBody) {
    return fromBody;
  }
  return parseBearerToken(request.headers.authorization);
}

function setShareApiCors(response) {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
  );
}

function normalizeRole(rawRole) {
  return String(rawRole || "").trim().toLowerCase();
}

function assertShareUploadRole(rawRole) {
  const role = normalizeRole(rawRole);
  if (!ALLOWED_SHARE_UPLOAD_ROLES.has(role)) {
    throw new HttpsError(
        "permission-denied",
        "Upload is allowed only for provider or editor role.",
    );
  }
  return role;
}

function folderTypeForRole(role) {
  return role === "provider" ? "original" : "edited";
}

function storageFolderForFolderType(folderType) {
  return folderType === "original" ?
    BOOKING_DRIVE_ORIGINAL_FOLDER :
    BOOKING_DRIVE_EDITED_FOLDER;
}

function toIsoDate(value) {
  if (!value) return null;
  if (value.toDate && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  try {
    return new Date(value).toISOString();
  } catch (_) {
    return null;
  }
}

function sanitizeUploadFileName(rawName) {
  const fallback = "upload_file";
  const name = String(rawName || "").trim();
  if (!name) return fallback;
  return name.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, "_");
}

function ensureMimeAllowed(mimeType) {
  const mime = String(mimeType || "").trim().toLowerCase();
  if (!mime || !ALLOWED_MIME_PREFIXES.some((prefix) => mime.startsWith(prefix))) {
    throw new HttpsError(
        "invalid-argument",
        "Only image and video uploads are supported.",
    );
  }
  return mime;
}

async function getBookingShareContextOrThrow(token) {
  const cleanedToken = String(token || "").trim();
  if (!cleanedToken) {
    throw new HttpsError("invalid-argument", "Missing share token.");
  }
  const db = admin.firestore();
  const tokenSnap = await bookingShareTokenRef(db, cleanedToken).get();
  let bookingId = "";
  if (tokenSnap.exists) {
    const tokenData = tokenSnap.data() || {};
    bookingId = String(tokenData.bookingId || "");
  }

  // Backward compatibility for links generated before token mapping existed.
  if (!bookingId) {
    const legacySnap = await db.collection("bookingShares")
        .where("token", "==", cleanedToken)
        .limit(1)
        .get();
    if (!legacySnap.empty) {
      bookingId = String(legacySnap.docs[0].id || "");
      if (bookingId) {
        await bookingShareTokenRef(db, cleanedToken).set({
          token: cleanedToken,
          bookingId,
          isActive: true,
          migratedFromLegacyLookup: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }, {merge: true});
      }
    }
  }

  if (!bookingId) {
    throw new HttpsError("not-found", "Share link is invalid.");
  }
  const shareDoc = await bookingShareDocRef(db, bookingId).get();
  if (!shareDoc.exists) {
    throw new HttpsError("not-found", "Share link is invalid.");
  }
  const shareData = shareDoc.data() || {};
  if (shareData.isActive === false) {
    throw new HttpsError("permission-denied", "Share link is disabled.");
  }
  const shareBookingId = String(shareData.bookingId || bookingId);
  if (!shareBookingId) {
    throw new HttpsError("failed-precondition", "Share link is malformed.");
  }
  if (String(shareData.token || "") !== cleanedToken) {
    throw new HttpsError("permission-denied", "Share link is no longer active.");
  }
  return {db, shareDoc, shareData, bookingId: shareBookingId};
}

function pickPreviewUrl(file) {
  if (file.thumbnailUrl && typeof file.thumbnailUrl === "string") {
    return file.thumbnailUrl;
  }
  if (file.downloadUrl && typeof file.downloadUrl === "string") {
    return file.downloadUrl;
  }
  return "";
}

async function getShareFiles(bookingId, shareData) {
  const includeOriginal = shareData.includeOriginal !== false;
  const includeEdited = shareData.includeEdited !== false;
  const filesSnap = await admin.firestore()
      .collection("bookings")
      .doc(bookingId)
      .collection("driveFiles")
      .get();
  const files = filesSnap.docs
      .map((doc) => {
        const data = doc.data() || {};
        return {
          fileId: doc.id,
          fileName: String(data.fileName || "file"),
          mimeType: String(data.mimeType || "application/octet-stream"),
          sizeBytes: Number(data.sizeBytes || 0),
          storagePath: String(data.storagePath || ""),
          downloadUrl: String(data.downloadUrl || ""),
          previewUrl: pickPreviewUrl(data),
          folderType: String(data.folderType || ""),
          uploadedByRole: String(data.uploadedByRole || "unknown"),
          uploadedById: String(data.uploadedById || ""),
          uploadedAt: toIsoDate(data.uploadedAt || data.createdAt),
          isDeleted: data.isDeleted === true,
        };
      })
      .filter((file) => {
        if (file.isDeleted || !file.storagePath) {
          return false;
        }
        if (file.folderType === "original") {
          return includeOriginal;
        }
        if (file.folderType === "edited") {
          return includeEdited;
        }
        return true;
      })
      .sort((a, b) => {
        const aTime = a.uploadedAt ? Date.parse(a.uploadedAt) : 0;
        const bTime = b.uploadedAt ? Date.parse(b.uploadedAt) : 0;
        if (a.folderType === b.folderType) {
          return bTime - aTime;
        }
        if (a.folderType === "original") return -1;
        if (b.folderType === "original") return 1;
        return bTime - aTime;
      });
  return files;
}

/** One active booking per provider per calendar day (eventDateKey). */
exports.createBookingIfAvailable = onCall(async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }
  const raw = request.data && request.data.booking;
  if (!raw || typeof raw !== "object") {
    throw new HttpsError("invalid-argument", "booking payload required.");
  }
  const booking = reviveFirestoreTimestamps(raw);
  if (booking.customerId !== request.auth.uid) {
    throw new HttpsError("permission-denied", "customerId must match the signed-in user.");
  }
  const providerId = booking.providerId;
  const eventDateKey = booking.eventDateKey;
  if (!providerId || !eventDateKey) {
    throw new HttpsError("invalid-argument", "providerId and eventDateKey are required.");
  }

  const db = admin.firestore();
  const bookingRef = db.collection("bookings").doc();
  const newBookingId = bookingRef.id;
  const lockRef = db.collection("providers").doc(String(providerId))
      .collection("schedule").doc(String(eventDateKey));

  let slotUnavailable = false;
  try {
    await db.runTransaction(async (t) => {
      const q = db.collection("bookings")
          .where("providerId", "==", providerId)
          .where("eventDateKey", "==", eventDateKey)
          .where("status", "in", BLOCKING_BOOKING_STATUSES);
      const conflictSnap = await t.get(q);
      if (!conflictSnap.empty) {
        slotUnavailable = true;
        return;
      }
      const lockSnap = await t.get(lockRef);
      if (lockSnap.exists) {
        slotUnavailable = true;
        return;
      }

      const payload = Object.assign({}, booking);
      delete payload.bookingId;
      payload.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      payload.createdAt = admin.firestore.FieldValue.serverTimestamp();

      t.set(lockRef, {
        bookingId: newBookingId,
        customerId: request.auth.uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      t.set(bookingRef, payload);
    });
  } catch (e) {
    logger.error("createBookingIfAvailable failed", e);
    throw new HttpsError("internal", "Could not create booking.");
  }

  if (slotUnavailable) {
    throw new HttpsError("already-exists", "This date is no longer available.");
  }

  return {bookingId: newBookingId};
});

/** Free schedule lock when a booking leaves a blocking status. */
exports.onBookingReleaseScheduleSlot = onDocumentUpdated("bookings/{bookingId}", async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();
  if (!before || !after) return null;
  const blocking = new Set(BLOCKING_BOOKING_STATUSES);
  const wasBlocking = blocking.has(before.status);
  const nowBlocking = blocking.has(after.status);
  if (!(wasBlocking && !nowBlocking)) return null;
  const pid = after.providerId;
  const key = after.eventDateKey;
  const bid = event.params.bookingId;
  if (!pid || !key) return null;
  const ref = admin.firestore().collection("providers").doc(String(pid))
      .collection("schedule").doc(String(key));
  const snap = await ref.get();
  if (snap.exists && snap.data().bookingId === bid) {
    await ref.delete();
  }
  return null;
});

async function createBookingDriveFolderMarkers(bookingId) {
  const bucket = admin.storage().bucket();
  const basePath = `bookings/${bookingId}`;
  const markerPaths = [
    `${basePath}/${BOOKING_DRIVE_ORIGINAL_FOLDER}/.keep`,
    `${basePath}/${BOOKING_DRIVE_EDITED_FOLDER}/.keep`,
  ];

  await Promise.all(markerPaths.map(async (markerPath) => {
    const file = bucket.file(markerPath);
    const [exists] = await file.exists();
    if (!exists) {
      await file.save("booking-drive-marker", {
        resumable: false,
        metadata: {
          contentType: "text/plain",
          cacheControl: "no-cache",
        },
      });
    }
  }));
}

exports.onBookingProviderAcceptedInitializeDrive = onDocumentUpdated(
    "bookings/{bookingId}",
    async (event) => {
      const before = event.data.before.data() || {};
      const after = event.data.after.data() || {};
      const bookingId = String(event.params.bookingId || "");
      if (!bookingId) return null;

      const hadProviderAccepted = !!before.eventStatus?.providerAccepted;
      const hasProviderAccepted = !!after.eventStatus?.providerAccepted;
      const statusChangedToConfirmed = before.status !== "confirmed" && after.status === "confirmed";
      const shouldInitialize = !hadProviderAccepted && hasProviderAccepted || statusChangedToConfirmed;

      if (!shouldInitialize) {
        return null;
      }

      const db = admin.firestore();
      const rootPath = `bookings/${bookingId}`;
      const metaRef = db.collection("bookings")
          .doc(bookingId)
          .collection("drive")
          .doc("meta");

      try {
        await db.runTransaction(async (tx) => {
          const metaSnap = await tx.get(metaRef);
          if (!metaSnap.exists) {
            tx.set(metaRef, {
              bookingId,
              rootPath,
              originalFolderPath: `${rootPath}/${BOOKING_DRIVE_ORIGINAL_FOLDER}`,
              editedFolderPath: `${rootPath}/${BOOKING_DRIVE_EDITED_FOLDER}`,
              isSharedWithCustomer: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return;
          }
          tx.set(metaRef, {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, {merge: true});
        });

        await createBookingDriveFolderMarkers(bookingId);
      } catch (error) {
        logger.error("Failed to initialize booking drive folders", {
          bookingId,
          error: String(error && error.message ? error.message : error),
        });
      }

      return null;
    },
);

exports.createOrGetBookingShareLink = onCall(async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }
  const bookingId = String(request.data && request.data.bookingId || "").trim();
  if (!bookingId) {
    throw new HttpsError("invalid-argument", "bookingId is required.");
  }

  const db = admin.firestore();
  const bookingRef = db.collection("bookings").doc(bookingId);
  const bookingSnap = await bookingRef.get();
  if (!bookingSnap.exists) {
    throw new HttpsError("not-found", "Booking not found.");
  }
  const bookingData = bookingSnap.data() || {};

  const callerUid = request.auth.uid;
  const callerSnap = await db.collection("users").doc(callerUid).get();
  const callerType = String(callerSnap.data() && callerSnap.data().userType || "");
  const isAdmin = callerType === "admin" || callerType === "superadmin";
  const isBookingProvider = String(bookingData.providerId || "") === callerUid;
  if (!isAdmin && !isBookingProvider) {
    throw new HttpsError(
        "permission-denied",
        "Only admin or assigned provider can create share links.",
    );
  }

  const filesSnap = await bookingRef.collection("driveFiles").limit(1).get();
  if (filesSnap.empty) {
    throw new HttpsError("failed-precondition", "No booking files available to share.");
  }

  const shareRef = bookingShareDocRef(db, bookingId);
  let token = "";
  await db.runTransaction(async (tx) => {
    const shareSnap = await tx.get(shareRef);
    const existingToken = shareSnap.exists ?
      String((shareSnap.data() || {}).token || "") :
      "";

    if (existingToken) {
      const existingTokenRef = bookingShareTokenRef(db, existingToken);
      const existingTokenSnap = await tx.get(existingTokenRef);
      const mappedBookingId = existingTokenSnap.exists ?
        String((existingTokenSnap.data() || {}).bookingId || "") :
        "";
      if (!mappedBookingId || mappedBookingId === bookingId) {
        token = existingToken;
        tx.set(existingTokenRef, {
          token,
          bookingId,
          isActive: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }, {merge: true});
        tx.set(shareRef, {
          token,
          bookingId,
          isActive: true,
          includeOriginal: true,
          includeEdited: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastGeneratedBy: callerUid,
        }, {merge: true});
        return;
      }
      // Token was mapped to a different booking; rotate token for safety.
    }

    const maxAttempts = 12;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const candidate = createShareToken();
      const candidateRef = bookingShareTokenRef(db, candidate);
      const candidateSnap = await tx.get(candidateRef);
      if (candidateSnap.exists) continue;
      token = candidate;
      tx.set(candidateRef, {
        token,
        bookingId,
        isActive: true,
        createdBy: callerUid,
        lastGeneratedBy: callerUid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, {merge: true});
      break;
    }

    if (!token) {
      throw new HttpsError("internal", "Could not generate a unique share token.");
    }

    if (existingToken && existingToken !== token) {
      const oldTokenRef = bookingShareTokenRef(db, existingToken);
      const oldTokenSnap = await tx.get(oldTokenRef);
      const oldMappedBookingId = oldTokenSnap.exists ?
        String((oldTokenSnap.data() || {}).bookingId || "") :
        "";
      if (oldMappedBookingId === bookingId) {
        tx.delete(oldTokenRef);
      }
    }

    const existingData = shareSnap.exists ? (shareSnap.data() || {}) : {};
    const createdBy = String(existingData.createdBy || callerUid);
    const createdAt = existingData.createdAt || admin.firestore.FieldValue.serverTimestamp();

    tx.set(shareRef, {
      bookingId,
      token,
      isActive: true,
      includeOriginal: true,
      includeEdited: true,
      createdBy,
      lastGeneratedBy: callerUid,
      createdAt,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastAccessedAt: existingData.lastAccessedAt || null,
      downloadCount: Number(existingData.downloadCount || 0),
      version: Number(existingData.version || 0) + 1,
    }, {merge: true});
  });

  if (!token) {
    throw new HttpsError("internal", "Could not generate share token.");
  }
  return {
    bookingId,
    token,
    url: buildShareLink(token),
  };
});

exports.getBookingShareManifest = onRequest(async (request, response) => {
  setShareApiCors(response);
  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }
  if (request.method !== "GET") {
    response.status(405).json({error: "Method not allowed"});
    return;
  }

  try {
    const token = resolveShareToken(request);
    const {shareDoc, shareData, bookingId} = await getBookingShareContextOrThrow(token);
    const files = await getShareFiles(bookingId, shareData);

    await shareDoc.ref.set({
      lastAccessedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true});

    response.status(200).json({
      bookingId,
      token,
      canDownloadZip: true,
      roles: ["provider", "editor", "user"],
      uploadRoles: ["provider", "editor"],
      files,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("getBookingShareManifest failed", error);
    const code = error instanceof HttpsError ? error.code : "internal";
    const status = code === "not-found" ? 404 :
      code === "permission-denied" ? 403 :
      code === "invalid-argument" ? 400 : 500;
    response.status(status).json({
      error: "Unable to fetch share manifest",
      code,
      message: error.message || "Unknown error",
    });
  }
});

exports.createBookingShareUploadTarget = onRequest(async (request, response) => {
  setShareApiCors(response);
  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }
  if (request.method !== "POST") {
    response.status(405).json({error: "Method not allowed"});
    return;
  }

  try {
    const token = resolveShareToken(request);
    const {bookingId} = await getBookingShareContextOrThrow(token);
    const role = assertShareUploadRole(request.body && request.body.role);
    const folderType = folderTypeForRole(role);
    const folderPath = storageFolderForFolderType(folderType);
    const mimeType = ensureMimeAllowed(request.body && request.body.mimeType);
    const fileName = sanitizeUploadFileName(request.body && request.body.fileName);
    const sizeBytes = Number(request.body && request.body.sizeBytes || 0);
    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_SHARE_UPLOAD_BYTES) {
      throw new HttpsError(
          "invalid-argument",
          `File size must be between 1 byte and ${MAX_SHARE_UPLOAD_BYTES} bytes.`,
      );
    }

    const objectName = `${Date.now()}_${crypto.randomBytes(4).toString("hex")}_${fileName}`;
    const storagePath = `bookings/${bookingId}/${folderPath}/${objectName}`;
    const bucket = admin.storage().bucket();
    const file = bucket.file(storagePath);
    const signedUrlParts = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      contentType: mimeType,
    });
    response.status(200).json({
      bookingId,
      token,
      role,
      folderType,
      storagePath,
      uploadUrl: signedUrlParts[0],
      requiredHeaders: {
        "Content-Type": mimeType,
      },
      expiresInSeconds: 900,
    });
  } catch (error) {
    logger.error("createBookingShareUploadTarget failed", error);
    const code = error instanceof HttpsError ? error.code : "internal";
    const status = code === "not-found" ? 404 :
      code === "permission-denied" ? 403 :
      code === "invalid-argument" ? 400 : 500;
    response.status(status).json({
      error: "Unable to create upload target",
      code,
      message: error.message || "Unknown error",
    });
  }
});

exports.finalizeBookingShareUpload = onRequest(async (request, response) => {
  setShareApiCors(response);
  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }
  if (request.method !== "POST") {
    response.status(405).json({error: "Method not allowed"});
    return;
  }

  try {
    const token = resolveShareToken(request);
    const {bookingId} = await getBookingShareContextOrThrow(token);
    const role = assertShareUploadRole(request.body && request.body.role);
    const expectedFolderType = folderTypeForRole(role);
    const storagePath = String(request.body && request.body.storagePath || "").trim();
    if (!storagePath) {
      throw new HttpsError("invalid-argument", "storagePath is required.");
    }
    const expectedSegment = storageFolderForFolderType(expectedFolderType);
    if (!storagePath.startsWith(`bookings/${bookingId}/${expectedSegment}/`)) {
      throw new HttpsError(
          "permission-denied",
          "Role is not allowed to finalize file in this folder.",
      );
    }

    const bucket = admin.storage().bucket();
    const file = bucket.file(storagePath);
    const [exists] = await file.exists();
    if (!exists) {
      throw new HttpsError("not-found", "Uploaded file was not found in storage.");
    }

    const metadataResult = await file.getMetadata();
    const metadata = metadataResult[0] || {};
    const sizeBytes = Number(metadata.size || request.body && request.body.sizeBytes || 0);
    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_SHARE_UPLOAD_BYTES) {
      throw new HttpsError("invalid-argument", "Invalid uploaded file size.");
    }
    const mimeType = ensureMimeAllowed(
        metadata.contentType || request.body && request.body.mimeType || "",
    );
    const originalName = String(
        request.body && request.body.fileName || metadata.metadata &&
        metadata.metadata.originalFileName || file.name.split("/").pop() || "upload_file",
    );
    const fileName = sanitizeUploadFileName(originalName);
    const uploaderId = String(request.body && request.body.uploaderId || "").trim();

    const signedReadUrlParts = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    const downloadUrl = signedReadUrlParts[0];

    const fileDocRef = admin.firestore()
        .collection("bookings")
        .doc(bookingId)
        .collection("driveFiles")
        .doc();
    const now = admin.firestore.Timestamp.now();
    await fileDocRef.set({
      bookingId,
      folderType: expectedFolderType,
      storagePath,
      downloadUrl,
      thumbnailUrl: "",
      fileName,
      mimeType,
      sizeBytes,
      uploadedByRole: role,
      uploadedById: uploaderId,
      uploadedAt: now,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    }, {merge: true});

    response.status(200).json({
      success: true,
      bookingId,
      fileId: fileDocRef.id,
      folderType: expectedFolderType,
      uploadedAt: now.toDate().toISOString(),
      uploadedByRole: role,
      uploadedById: uploaderId,
      downloadUrl,
    });
  } catch (error) {
    logger.error("finalizeBookingShareUpload failed", error);
    const code = error instanceof HttpsError ? error.code : "internal";
    const status = code === "not-found" ? 404 :
      code === "permission-denied" ? 403 :
      code === "invalid-argument" ? 400 : 500;
    response.status(status).json({
      error: "Unable to finalize upload",
      code,
      message: error.message || "Unknown error",
    });
  }
});

exports.downloadBookingShareZip = onRequest(async (request, response) => {
  setShareApiCors(response);
  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }
  if (request.method !== "GET") {
    response.status(405).json({error: "Method not allowed"});
    return;
  }

  try {
    const token = resolveShareToken(request);
    const {shareDoc, shareData, bookingId} = await getBookingShareContextOrThrow(token);
    const files = await getShareFiles(bookingId, shareData);
    if (!files.length) {
      response.status(404).json({error: "No files found for this share link"});
      return;
    }

    await shareDoc.ref.set({
      lastAccessedAt: admin.firestore.FieldValue.serverTimestamp(),
      downloadCount: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true});

    response.setHeader("Content-Type", "application/zip");
    response.setHeader(
        "Content-Disposition",
        `attachment; filename="booking_${bookingId}_media.zip"`,
    );
    response.setHeader("Cache-Control", "private, max-age=0, no-store");

    const archive = archiver("zip", {zlib: {level: 9}});
    archive.pipe(response);

    const bucket = admin.storage().bucket();
    for (const file of files) {
      const storageFile = bucket.file(file.storagePath);
      const [exists] = await storageFile.exists();
      if (!exists) {
        continue;
      }
      const safeFileName = file.fileName.replace(/[\\/:*?"<>|]/g, "_");
      const zipPath = `${file.folderType || "files"}/${safeFileName}`;
      archive.append(storageFile.createReadStream(), {name: zipPath});
    }
    await new Promise((resolve, reject) => {
      archive.on("error", reject);
      archive.on("end", resolve);
      archive.finalize().catch(reject);
    });
  } catch (error) {
    logger.error("downloadBookingShareZip failed", error);
    if (!response.headersSent) {
      const code = error instanceof HttpsError ? error.code : "internal";
      const status = code === "not-found" ? 404 :
        code === "permission-denied" ? 403 :
        code === "invalid-argument" ? 400 : 500;
      response.status(status).json({
        error: "Unable to download zip",
        code,
        message: error.message || "Unknown error",
      });
    }
  }
});

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");
const smtpUser = defineSecret("SMTP_USER");
const smtpPass = defineSecret("SMTP_PASS");
const veriffApiKey = defineSecret("VERIFF_API_KEY");
const veriffApiSecret = defineSecret("VERIFF_API_SECRET");
const veriffWebhookClientId = defineSecret("VERIFF_WEBHOOK_CLIENT_ID");
const veriffWebhookSharedSecret = defineSecret("VERIFF_WEBHOOK_SHARED_SECRET");

// Emulator: use `functions/.env`. Deployed: secrets bound via `secrets` on each function.
function resolveStripeApiKey() {
  if (process.env.STRIPE_SECRET_KEY) {
    return process.env.STRIPE_SECRET_KEY;
  }
  return stripeSecretKey.value();
}

function resolveWebhookSecret() {
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    return process.env.STRIPE_WEBHOOK_SECRET;
  }
  return stripeWebhookSecret.value();
}

function resolveVeriffApiKey() {
  return process.env.VERIFF_API_KEY || veriffApiKey.value();
}

function resolveVeriffApiSecret() {
  return process.env.VERIFF_API_SECRET || veriffApiSecret.value();
}

function resolveVeriffWebhookClientId() {
  return process.env.VERIFF_WEBHOOK_CLIENT_ID || veriffWebhookClientId.value();
}

function resolveVeriffWebhookSharedSecret() {
  return process.env.VERIFF_WEBHOOK_SHARED_SECRET || veriffWebhookSharedSecret.value();
}

function signWithHmacSha256(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function timingSafeHexEqual(a, b) {
  const left = Buffer.from(String(a || ""), "utf8");
  const right = Buffer.from(String(b || ""), "utf8");
  if (left.length !== right.length || left.length === 0) {
    return false;
  }
  return crypto.timingSafeEqual(left, right);
}

function mapVeriffStatus(rawStatus) {
  const status = String(rawStatus || "").toLowerCase();
  if (status === "approved") return {veriffStatus: "approved", providerStatus: "approved"};
  if (status === "declined") return {veriffStatus: "declined", providerStatus: "rejected"};
  if (status === "resubmission_requested") {
    return {veriffStatus: "resubmission_requested", providerStatus: "pending"};
  }
  if (status === "expired") return {veriffStatus: "expired", providerStatus: "pending"};
  if (status === "abandoned") return {veriffStatus: "abandoned", providerStatus: "pending"};
  return {veriffStatus: status || "error", providerStatus: "pending"};
}

exports.createVeriffSession = onCall(
    {
      region: "us-central1",
      secrets: [veriffApiKey, veriffApiSecret],
    },
    async (request) => {
      if (!request.auth || !request.auth.uid) {
        throw new HttpsError("unauthenticated", "Sign in required.");
      }
      const providerId = request.auth.uid;
      const db = admin.firestore();
      const providerRef = db.collection("providers").doc(providerId);
      const providerSnap = await providerRef.get();
      if (!providerSnap.exists) {
        throw new HttpsError("failed-precondition", "Provider profile not found.");
      }

      const apiKey = resolveVeriffApiKey();
      const apiSecret = resolveVeriffApiSecret();
      if (!apiKey || !apiSecret) {
        throw new HttpsError("failed-precondition", "Veriff keys are not configured.");
      }

      const provider = providerSnap.data() || {};
      const person = {};
      if (provider.ownerName) {
        const parts = String(provider.ownerName).trim().split(/\s+/);
        if (parts.length > 0) {
          person.firstName = parts[0];
          person.lastName = parts.length > 1 ? parts.slice(1).join(" ") : parts[0];
        }
      }

      const callbackUrl = process.env.VERIFF_DECISION_WEBHOOK_URL ||
        `https://us-central1-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/veriffDecisionWebhook`;
      const payload = {
        verification: {
          callback: callbackUrl,
          vendorData: providerId,
          timestamp: new Date().toISOString(),
          person,
        },
      };

      const payloadText = JSON.stringify(payload);
      const signature = signWithHmacSha256(payloadText, apiSecret);
      const veriffResponse = await fetch("https://stationapi.veriff.com/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-AUTH-CLIENT": apiKey,
          "X-HMAC-SIGNATURE": signature,
        },
        body: payloadText,
      });

      if (!veriffResponse.ok) {
        const bodyText = await veriffResponse.text();
        logger.error("createVeriffSession failed", {
          status: veriffResponse.status,
          body: bodyText,
        });
        throw new HttpsError("internal", "Unable to create Veriff session.");
      }

      const body = await veriffResponse.json();
      const verification = body.verification || {};
      const sessionUrl = String(verification.url || "");
      const sessionId = String(verification.id || "");
      if (!sessionUrl) {
        throw new HttpsError("internal", "Veriff did not return a session URL.");
      }

      await providerRef.set({
        metadata: {
          veriff: {
            status: "session_created",
            sessionId,
            sessionUrlCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
            vendorData: providerId,
            audit: {
              updatedBy: "provider_app",
            },
          },
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, {merge: true});

      return {sessionUrl};
    },
);

exports.veriffDecisionWebhook = onRequest(
    {
      region: "us-central1",
      secrets: [veriffWebhookClientId, veriffWebhookSharedSecret],
    },
    async (request, response) => {
      if (request.method !== "POST") {
        response.status(405).send("Method not allowed");
        return;
      }

      const expectedClientId = resolveVeriffWebhookClientId();
      const sharedSecret = resolveVeriffWebhookSharedSecret();
      if (!expectedClientId || !sharedSecret) {
        logger.error("Veriff webhook secret/client id not configured");
        response.status(500).send("Webhook not configured");
        return;
      }

      const authClient = String(request.headers["x-auth-client"] || "");
      const incomingSignature = String(request.headers["x-hmac-signature"] || "");
      if (!authClient || !incomingSignature || authClient !== expectedClientId) {
        response.status(401).send("Invalid webhook headers");
        return;
      }

      const rawBody = request.rawBody ? request.rawBody.toString("utf8") : JSON.stringify(request.body || {});
      const expectedSignature = signWithHmacSha256(rawBody, sharedSecret);
      if (!timingSafeHexEqual(incomingSignature, expectedSignature)) {
        response.status(401).send("Invalid signature");
        return;
      }

      const payload = request.body || {};
      const verification = payload.verification || {};
      const sessionId = String(verification.id || "");
      const vendorData = String(verification.vendorData || "");
      const decisionStatus = String(verification.status || "").toLowerCase();
      if (!sessionId || !vendorData) {
        response.status(400).send("Missing session ID or vendor data");
        return;
      }

      const db = admin.firestore();
      const dedupeRef = db.collection("veriffWebhookEvents")
          .doc(`${sessionId}_${decisionStatus || "unknown"}`);
      const alreadyProcessed = await db.runTransaction(async (tx) => {
        const doc = await tx.get(dedupeRef);
        if (doc.exists) return true;
        tx.set(dedupeRef, {
          sessionId,
          decisionStatus,
          providerId: vendorData,
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return false;
      });

      if (alreadyProcessed) {
        response.status(200).send("ok");
        return;
      }

      const mapped = mapVeriffStatus(decisionStatus);
      const providerRef = db.collection("providers").doc(vendorData);
      await providerRef.set({
        verificationStatus: mapped.providerStatus,
        isVerified: mapped.providerStatus === "approved",
        metadata: {
          veriff: {
            status: mapped.veriffStatus,
            sessionId,
            vendorData,
            decisionCode: String(verification.code || ""),
            decidedAt: admin.firestore.FieldValue.serverTimestamp(),
            document: {
              type: String(verification.document && verification.document.type || ""),
              country: String(verification.document && verification.document.country || ""),
            },
            rawStatus: decisionStatus,
            audit: {
              updatedBy: "system_webhook",
            },
          },
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, {merge: true});

      response.status(200).send("ok");
    },
);

function stripeClient() {
  const key = resolveStripeApiKey();
  return key ? new (getStripeCtor())(key) : null;
}

function setCorsHeaders(response) {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.set("Access-Control-Allow-Headers", "Content-Type, stripe-signature");
}

function paymentStatusFromEventType(eventType) {
  switch (eventType) {
    case "payment_intent.succeeded":
      return "succeeded";
    case "payment_intent.payment_failed":
      return "failed";
    case "payment_intent.canceled":
      return "canceled";
    case "payment_intent.processing":
      return "processing";
    default:
      return "processing";
  }
}

function bookingPaymentStatusFromStripeStatus(status) {
  switch (status) {
    case "succeeded":
      return "fully_paid";
    case "failed":
      return "failed";
    case "canceled":
      return "failed";
    case "processing":
      return "pending";
    default:
      return "pending";
  }
}

async function createPaymentNotification({
  userId,
  bookingId,
  paymentIntentId,
  amountMajor,
  status,
  role,
}) {
  if (!userId) return;
  const success = status === "succeeded";
  const title = success ? "Payment received" : "Payment update";
  const body = success ?
    `Payment completed for booking ${bookingId}.` :
    `Payment ${status} for booking ${bookingId}.`;

  await admin.firestore().collection("notifications").add({
    userId: String(userId),
    type: success ? "payment_success" : "payment_failed",
    title,
    body,
    data: {
      bookingId: String(bookingId),
      paymentId: String(paymentIntentId),
      customData: {
        role: String(role),
        amount: amountMajor,
        status,
      },
    },
    isRead: false,
    isDelivered: false,
    priority: success ? "normal" : "high",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    metadata: {
      source: "stripe_webhook",
      role,
      status,
    },
  });
}

async function createAdminPaymentNotifications({
  bookingId,
  paymentIntentId,
  amountMajor,
  status,
}) {
  const adminUsersSnap = await admin.firestore()
      .collection("users")
      .where("userType", "in", ["admin", "superadmin"])
      .get();
  if (adminUsersSnap.empty) return;

  await Promise.all(adminUsersSnap.docs.map((doc) => createPaymentNotification({
    userId: doc.id,
    bookingId,
    paymentIntentId,
    amountMajor,
    status,
    role: "admin",
  })));
}

// Send notification when booking is created
exports.onBookingCreated = onDocumentCreated(
    "events/{eventId}",
    async (event) => {
      const booking = event.data.data();
      const eventId = event.params.eventId;

      logger.info("New booking created:", eventId);

      try {
        // Get customer's FCM token
        const userDoc = await admin.firestore()
            .collection("users")
            .doc(booking.customerId)
            .get();

        const fcmToken = userDoc.data()?.fcmToken;

        if (fcmToken) {
          // Send notification to customer
          const message = {
            notification: {
              title: "Booking Confirmed! 🎉",
              body: `Your booking for ${booking.eventName} is confirmed!`,
            },
            data: {
              eventId: eventId,
              type: "booking_confirmed",
              screen: "event_details",
            },
            token: fcmToken,
          };

          await admin.messaging().send(message);
          logger.info("Booking confirmation sent to customer");
        }

        // Get provider's FCM token
        const providerDoc = await admin.firestore()
            .collection("providers")
            .doc(booking.providerId)
            .get();

        const providerToken = providerDoc.data()?.fcmToken;

        if (providerToken) {
          // Send notification to provider
          const providerMessage = {
            notification: {
              title: "New Booking Request! 📅",
              body: `New booking for ${booking.eventType} event`,
            },
            data: {
              eventId: eventId,
              type: "booking_request",
              screen: "booking_details",
            },
            token: providerToken,
          };

          await admin.messaging().send(providerMessage);
          logger.info("Booking notification sent to provider");
        }

        // Create notification documents
        await admin.firestore().collection("notifications").add({
          userId: booking.customerId,
          userType: "customer",
          title: "Booking Confirmed! 🎉",
          body: `Your booking for ${booking.eventName} is confirmed!`,
          type: "booking_confirmed",
          data: {eventId: eventId},
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await admin.firestore().collection("notifications").add({
          userId: booking.providerId,
          userType: "provider",
          title: "New Booking Request! 📅",
          body: `New booking for ${booking.eventType} event`,
          type: "booking_request",
          data: {eventId: eventId},
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return null;
      } catch (error) {
        logger.error("Error in onBookingCreated:", error);
        return null;
      }
    }
);

// Process referral when user signs up
exports.processReferral = onDocumentCreated(
    "users/{userId}",
    async (event) => {
      const user = event.data.data();
      const userId = event.params.userId;

      logger.info("New user created:", userId);

      if (!user.referredBy) {
        return null;
      }

      try {
        const referralCode = user.referredBy;

        // Find referrer
        const referrerQuery = await admin.firestore()
            .collection("users")
            .where("referralCode", "==", referralCode)
            .limit(1)
            .get();

        if (referrerQuery.empty) {
          logger.warn("Referrer not found for code:", referralCode);
          return null;
        }

        const referrerId = referrerQuery.docs[0].id;
        const rewardAmount = 2; // £2 reward

        // Create referral record
        await admin.firestore().collection("referrals").add({
          referrerId: referrerId,
          referredUserId: userId,
          referralCode: referralCode,
          status: "pending", // Will be completed after first booking
          rewardAmount: rewardAmount,
          rewardType: "wallet_credit",
          rewardCredited: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        logger.info("Referral record created");

        // Send notification to referrer
        const referrerDoc = referrerQuery.docs[0];
        const fcmToken = referrerDoc.data().fcmToken;

        if (fcmToken) {
          await admin.messaging().send({
            notification: {
              title: "New Referral! 🎁",
              body: `Someone signed up using your code! Complete booking to earn £${rewardAmount}`,
            },
            token: fcmToken,
          });
        }

        return null;
      } catch (error) {
        logger.error("Error in processReferral:", error);
        return null;
      }
    }
);

// Legacy Razorpay endpoint disabled for UK-only Stripe rollout.
exports.createRazorpayOrder = onRequest(async (request, response) => {
  response.status(410).send({
    error: "Deprecated",
    message: "Razorpay is disabled. Use Stripe GBP checkout.",
  });
});

// Legacy Razorpay endpoint disabled for UK-only Stripe rollout.
exports.verifyRazorpayPayment = onRequest(async (request, response) => {
  response.status(410).send({
    error: "Deprecated",
    message: "Razorpay verification is disabled. Use Stripe GBP webhook flow.",
  });
});

// Create Stripe PaymentIntent (callable — Flutter SDK resolves correct URL/region)
exports.createStripePaymentIntent = onCall(
    {
      // Must match Flutter `FirebaseFunctions.instanceFor(region: ...)` (default us-central1).
      region: "us-central1",
      secrets: [stripeSecretKey],
    },
    async (request) => {
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "Sign in required");
      }
      const uid = request.auth.uid;

      const stripe = stripeClient();
      if (!stripe) {
        logger.error("Stripe is not configured. STRIPE_SECRET_KEY is missing.");
        throw new HttpsError(
            "failed-precondition",
            "Stripe is not configured on the server",
        );
      }

      const {bookingId} = request.data || {};
      if (!bookingId) {
        throw new HttpsError("invalid-argument", "Missing bookingId");
      }

      try {
        const bookingRef = admin.firestore()
            .collection("bookings")
            .doc(String(bookingId));
        const bookingSnap = await bookingRef.get();
        if (!bookingSnap.exists) {
          throw new HttpsError("not-found", "Booking not found");
        }
        const booking = bookingSnap.data() || {};
        if (String(booking.customerId || "") !== uid) {
          throw new HttpsError(
              "permission-denied",
              "Booking does not belong to caller",
          );
        }

        const payment = booking.payment || {};
        const advanceAmount = Number(payment.advanceAmount || 0);
        const currency = String(payment.currency || "gbp").toLowerCase();
        if (currency !== "gbp") {
          throw new HttpsError(
              "failed-precondition",
              "Only GBP payments are supported",
          );
        }
        const amountInSmallestUnit = Math.round(advanceAmount * 100);
        if (!Number.isFinite(amountInSmallestUnit) || amountInSmallestUnit <= 0) {
          throw new HttpsError("failed-precondition", "Invalid booking amount");
        }
        if (currency === "gbp" && amountInSmallestUnit < 30) {
          throw new HttpsError(
              "failed-precondition",
              "GBP amount must be at least £0.30",
          );
        }
        const idempotencyKey = `booking_${String(bookingId)}_${currency}_advance_${amountInSmallestUnit}`;

        // Always create a fresh PaymentIntent for each pay attempt.
        // Reusing stale intents can skip payment sheet or fail immediately.
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInSmallestUnit,
          currency,
          automatic_payment_methods: {enabled: true},
          metadata: {
            bookingId: String(bookingId),
            customerUserId: String(uid),
            providerUserId: String(booking.providerId || ""),
            advanceAmount: String(advanceAmount.toFixed(2)),
          },
        }, {idempotencyKey});

        await bookingRef.update({
          "payment.stripePaymentIntentId": paymentIntent.id,
          "payment.paymentStatus": "pending",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
          success: true,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        };
      } catch (error) {
        if (error instanceof HttpsError) {
          throw error;
        }
        logger.error("Error creating Stripe PaymentIntent:", error);
        throw new HttpsError(
            "internal",
            error.message || "Failed to create payment intent",
        );
      }
    },
);

// Stripe webhook for authoritative payment status updates
exports.stripeWebhook = onRequest(
    {
      secrets: [
        stripeSecretKey,
        stripeWebhookSecret,
        smtpUser,
        smtpPass,
      ],
    },
    async (request, response) => {
  if (request.method !== "POST") {
    response.status(405).send("Method not allowed");
    return;
  }

  const stripe = stripeClient();
  const webhookSecret = resolveWebhookSecret();
  if (!stripe || !webhookSecret) {
    logger.error("Stripe webhook not configured");
    response.status(500).send("Stripe webhook not configured");
    return;
  }

  const signature = request.headers["stripe-signature"];
  if (!signature) {
    response.status(400).send("Missing stripe-signature header");
    return;
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
        request.rawBody,
        signature,
        webhookSecret
    );
  } catch (err) {
    logger.error("Stripe webhook signature verification failed:", err.message);
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    const eventRef = admin.firestore()
        .collection("stripe_webhook_events")
        .doc(String(event.id));
    const alreadyProcessed = await admin.firestore().runTransaction(
        async (tx) => {
          const processedSnap = await tx.get(eventRef);
          if (processedSnap.exists) {
            return true;
          }
          tx.set(eventRef, {
            type: event.type,
            processedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          return false;
        },
    );
    if (alreadyProcessed) {
      response.status(200).send({received: true, duplicate: true});
      return;
    }

    if (event.type === "payment_intent.succeeded" ||
        event.type === "payment_intent.payment_failed" ||
        event.type === "payment_intent.canceled" ||
        event.type === "payment_intent.processing") {
      const paymentIntent = event.data.object;
      const bookingId = String(paymentIntent.metadata?.bookingId || "");
      const transactionId = String(paymentIntent.id || "");
      if (!bookingId || !transactionId) {
        logger.warn("Skipping payment webhook due to missing bookingId/transactionId", {
          eventType: event.type,
          eventId: event.id,
        });
      } else {
        const bookingRef = admin.firestore().collection("bookings").doc(bookingId);
        const bookingSnap = await bookingRef.get();
        if (!bookingSnap.exists) {
          logger.warn("Booking not found for payment event", {bookingId, transactionId});
        } else {
          const booking = bookingSnap.data() || {};
          const status = paymentStatusFromEventType(event.type);
          const amountMajor = (paymentIntent.amount_received || paymentIntent.amount || 0) / 100;
          const failureCode = paymentIntent.last_payment_error?.code || null;
          const failureMessage = paymentIntent.last_payment_error?.message ||
            (status === "failed" ? "Payment failed" : null);
          const paymentMethodType = paymentIntent.payment_method_types &&
            paymentIntent.payment_method_types.length > 0 ?
            String(paymentIntent.payment_method_types[0]) :
            "stripe";

          const canonicalDocRef = admin.firestore()
              .collection("payment_transactions")
              .doc(transactionId);

          await canonicalDocRef.set({
            transactionId,
            bookingId,
            customerUserId: String(
                paymentIntent.metadata?.customerUserId ||
                booking.customerId ||
                ""
            ),
            providerUserId: String(
                paymentIntent.metadata?.providerUserId ||
                booking.providerId ||
                ""
            ),
            stripeEventId: String(event.id),
            amount: amountMajor,
            currency: String(paymentIntent.currency || "gbp").toLowerCase(),
            status,
            failureCode,
            failureMessage,
            paymentMethodType,
            isLiveMode: paymentIntent.livemode === true,
            processedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: {
              stripePaymentIntentStatus: String(paymentIntent.status || ""),
            },
          }, {merge: true});

          const bookingUpdate = {
            "payment.paymentStatus": bookingPaymentStatusFromStripeStatus(status),
            "payment.stripePaymentIntentId": transactionId,
            "payment.lastTransactionRef": transactionId,
            "payment.transactions": admin.firestore.FieldValue.arrayUnion({
              paymentId: transactionId,
              amount: amountMajor,
              method: "stripe",
              transactionId: transactionId,
              status: status === "succeeded" ? "success" : status,
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
            }),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          if (status === "succeeded") {
            bookingUpdate.status = "confirmed";
            bookingUpdate["eventStatus.bookingConfirmed"] = admin.firestore.FieldValue.serverTimestamp();
          } else if (failureMessage) {
            bookingUpdate["payment.failureReason"] = failureMessage;
          }
          await bookingRef.update(bookingUpdate);

          if (status === "succeeded") {
            try {
              let smtpUserVal = process.env.SMTP_USER || "";
              let smtpPassVal = process.env.SMTP_PASS || "";
              if (!smtpUserVal || !smtpPassVal) {
                try {
                  if (!smtpUserVal) smtpUserVal = smtpUser.value();
                  if (!smtpPassVal) smtpPassVal = smtpPass.value();
                } catch (secErr) {
                  logger.info("SMTP secrets unavailable (emulator?)", {
                    message: String(secErr && secErr.message ? secErr.message : secErr),
                  });
                }
              }
              const smtpFrom = process.env.SMTP_FROM || smtpUserVal || "";
              await getInvoiceEmailModule().maybeSendInvoiceEmail({
                db: admin.firestore(),
                bookingRef,
                bookingId,
                bookingSnapshotData: booking,
                paymentIntent,
                logger,
                smtp: {
                  user: smtpUserVal,
                  pass: smtpPassVal,
                  from: smtpFrom,
                  host: process.env.SMTP_HOST || "smtp.gmail.com",
                  port: parseInt(process.env.SMTP_PORT || "465", 10),
                },
              });
            } catch (invErr) {
              logger.error("Invoice email error (non-fatal)", {
                bookingId,
                message: invErr && invErr.message,
              });
              try {
                await bookingRef.update({
                  "metadata.invoiceEmailError": String(invErr.message || invErr),
                  "metadata.invoiceEmailErrorAt":
                      admin.firestore.FieldValue.serverTimestamp(),
                });
              } catch (metaErr) {
                logger.warn("Could not persist invoiceEmailError", metaErr);
              }
            }
          }

          await createPaymentNotification({
            userId: String(booking.providerId || paymentIntent.metadata?.providerUserId || ""),
            bookingId,
            paymentIntentId: transactionId,
            amountMajor,
            status,
            role: "provider",
          });
          await createAdminPaymentNotifications({
            bookingId,
            paymentIntentId: transactionId,
            amountMajor,
            status,
          });
        }
      }
    }

    response.status(200).send({received: true});
  } catch (error) {
    logger.error("Error handling Stripe webhook event:", error);
    response.status(500).send("Webhook handler failed");
  }
});

// Send booking reminders (scheduled every hour)
exports.sendBookingReminders = onSchedule(
    "every 1 hours",
    async (event) => {
      logger.info("Running booking reminder check");

      try {
        const now = admin.firestore.Timestamp.now();
        const oneHourLater = admin.firestore.Timestamp.fromMillis(
            now.toMillis() + 60 * 60 * 1000
        );
        const oneDayLater = admin.firestore.Timestamp.fromMillis(
            now.toMillis() + 24 * 60 * 60 * 1000
        );

        // Get bookings in next hour
        const upcomingBookings = await admin.firestore()
            .collection("events")
            .where("eventDate", ">=", now)
            .where("eventDate", "<=", oneHourLater)
            .where("status", "==", "confirmed")
            .get();

        // Get bookings in next day
        const tomorrowBookings = await admin.firestore()
            .collection("events")
            .where("eventDate", ">=", oneHourLater)
            .where("eventDate", "<=", oneDayLater)
            .where("status", "==", "confirmed")
            .get();

        const promises = [];

        // Send reminders for bookings in next hour
        upcomingBookings.forEach((doc) => {
          const booking = doc.data();

          promises.push(
              admin.firestore()
                  .collection("users")
                  .doc(booking.customerId)
                  .get()
                  .then((userDoc) => {
                    const fcmToken = userDoc.data()?.fcmToken;
                    if (fcmToken) {
                      return admin.messaging().send({
                        notification: {
                          title: "Booking Reminder ⏰",
                          body: `Your ${booking.eventType} event is in 1 hour!`,
                        },
                        data: {
                          eventId: doc.id,
                          type: "booking_reminder",
                        },
                        token: fcmToken,
                      });
                    }
                  })
          );
        });

        // Send reminders for bookings tomorrow
        tomorrowBookings.forEach((doc) => {
          const booking = doc.data();

          promises.push(
              admin.firestore()
                  .collection("users")
                  .doc(booking.customerId)
                  .get()
                  .then((userDoc) => {
                    const fcmToken = userDoc.data()?.fcmToken;
                    if (fcmToken) {
                      return admin.messaging().send({
                        notification: {
                          title: "Upcoming Event Tomorrow 📅",
                          body: `Your ${booking.eventType} event is tomorrow!`,
                        },
                        data: {
                          eventId: doc.id,
                          type: "booking_reminder",
                        },
                        token: fcmToken,
                      });
                    }
                  })
          );
        });

        await Promise.all(promises);
        logger.info(`Sent ${promises.length} reminder notifications`);

        return null;
      } catch (error) {
        logger.error("Error sending reminders:", error);
        return null;
      }
    }
);

// Send notification when reel is delivered
exports.onReelDelivered = onDocumentCreated(
    "reels/{reelId}",
    async (event) => {
      const reel = event.data.data();
      const reelId = event.params.reelId;

      logger.info("New reel delivered:", reelId);

      try {
        // Get customer's FCM token
        const userDoc = await admin.firestore()
            .collection("users")
            .doc(reel.customerId)
            .get();

        const fcmToken = userDoc.data()?.fcmToken;

        if (fcmToken) {
          const message = {
            notification: {
              title: "Your reel is ready! 🎉",
              body: `${reel.title} is ready to view and share!`,
            },
            data: {
              reelId: reelId,
              eventId: reel.eventId,
              type: "reel_delivered",
              screen: "reel_player",
            },
            token: fcmToken,
          };

          await admin.messaging().send(message);
          logger.info("Reel delivery notification sent");

          // Update event with first reel delivered timestamp
          const eventDoc = await admin.firestore()
              .collection("events")
              .doc(reel.eventId)
              .get();

          if (eventDoc.exists && !eventDoc.data().eventStatus?.firstReelDelivered) {
            await admin.firestore()
                .collection("events")
                .doc(reel.eventId)
                .update({
                  "eventStatus.firstReelDelivered": admin.firestore.FieldValue.serverTimestamp(),
                });
          }
        }

        return null;
      } catch (error) {
        logger.error("Error in onReelDelivered:", error);
        return null;
      }
    }
);

