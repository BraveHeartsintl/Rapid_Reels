/// Bundled legal documents under [assets/legal/](rapid_reels_app/assets/legal/).
abstract final class LegalPolicyIds {
  static const terms = 'terms';
  static const privacy = 'privacy';
  static const cookie = 'cookie';
  static const refund = 'refund';
  static const acceptableUse = 'acceptable_use';
  static const imageRights = 'image_rights';
  static const complaints = 'complaints';

  static const List<String> all = [
    terms,
    privacy,
    cookie,
    refund,
    acceptableUse,
    imageRights,
    complaints,
  ];

  static bool isValid(String id) => all.contains(id);

  static String title(String id) {
    switch (id) {
      case terms:
        return 'Terms and Conditions';
      case privacy:
        return 'Privacy Policy';
      case cookie:
        return 'Cookie Policy';
      case refund:
        return 'Refund and Cancellation Policy';
      case acceptableUse:
        return 'Acceptable Use Policy';
      case imageRights:
        return 'Image Rights and Subject Consent';
      case complaints:
        return 'Complaints Policy';
      default:
        return 'Legal document';
    }
  }

  static String assetPath(String id) => 'assets/legal/$id.md';
}
