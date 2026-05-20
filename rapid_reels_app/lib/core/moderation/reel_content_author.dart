import '../firebase/models/firebase_reel_model.dart';

/// Resolves the user id shown as creator for moderation (report / block).
String reelContentAuthorId(FirebaseReelModel reel) {
  final providerId = reel.providerId.trim();
  if (providerId.isNotEmpty) return providerId;
  return reel.customerId.trim();
}

bool reelInvolvesBlockedUser(FirebaseReelModel reel, Set<String> blockedIds) {
  if (blockedIds.isEmpty) return false;
  return blockedIds.contains(reel.providerId) ||
      blockedIds.contains(reel.customerId);
}
