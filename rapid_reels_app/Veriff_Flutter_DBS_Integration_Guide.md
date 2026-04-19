|**Veriff IDV + DBS Certificate Verification**  |  Flutter Integration Guide|April 2026|
| :- | -: |

**Veriff + DBS**

Identity Verification & DBS Certificate Check

*Flutter SDK — Step-by-Step Integration Guide*

Self-Serve Plan  |  April 2026  |  v2.0

**PART 1 — VERIFF IDENTITY VERIFICATION (IDV)**
# **Step 1: Sign Up & Get API Keys**
Start your 15-day free trial (no credit card required for under 1,000 IDV sessions/month) and create an integration to get your credentials.

1. Go to veriff.com/plans/self-serve and start your free trial.
1. Log into Veriff Station (the customer portal).
1. Create an Integration to generate your API Key and API Secret.
1. Configure a Webhook URL (your backend endpoint) to receive decisions.

|**Note:** Keep your API Secret only on your backend server. Never embed it in Flutter/client-side code.|
| :- |

# **Step 2: Add the Flutter Plugin**
Add the official Veriff package to your Flutter project's dependencies.

### **pubspec.yaml**

|<p>dependencies:</p><p>`  `flutter:</p><p>`    `sdk: flutter</p><p>`  `veriff\_flutter: ^latest\_version   # check pub.dev/packages/veriff\_flutter</p>|
| :- |

|flutter pub get|
| :- |

# **Step 3: Platform-Specific Setup**
## **Android**
Set the minimum Android SDK version in android/app/build.gradle:

|<p>android {</p><p>`  `defaultConfig {</p><p>`    `minSdkVersion 26    // Android 8.0 minimum required</p><p>`    `targetSdkVersion 34</p><p>`  `}</p><p>}</p>|
| :- |

|**Google Play:** Declare FOREGROUND\_SERVICE\_DATA\_SYNC under Policy > App Content > Foreground Service Permissions with description: 'The Veriff SDK uses the foreground service to upload end-user data to Veriff servers for verification purposes.'|
| :- |

## **iOS**
Add usage descriptions to ios/Runner/Info.plist — the app will crash at runtime without them:

|<p><key>NSCameraUsageDescription</key></p><p><string>Camera is required for identity verification</string></p><p><key>NSMicrophoneUsageDescription</key></p><p><string>Microphone is required for identity verification</string></p><p><key>NSPhotoLibraryUsageDescription</key></p><p><string>Photo library is required for identity verification</string></p>|
| :- |

Set minimum iOS version in ios/Podfile:

|platform :ios, '13.0'|
| :- |

Also confirm: Xcode > Project > Target > Info > Deployment Target = iOS 13.0.

# **Step 4: Create a Verification Session (Backend)**
Session creation must happen server-side to protect your API Secret. Your Flutter app calls your backend; your backend calls Veriff and returns the sessionUrl.

### **Backend API Call**

|<p>// POST https://stationapi.veriff.com/v1/sessions</p><p>// Headers:</p><p>//   Content-Type: application/json</p><p>//   X-AUTH-CLIENT: YOUR\_API\_KEY</p><p>//   X-HMAC-SIGNATURE: HMAC-SHA256(body, API\_SECRET)</p><p></p><p>const body = {</p><p>`  `verification: {</p><p>`    `callback: 'https://yourdomain.com/webhook',</p><p>`    `person: { firstName: 'John', lastName: 'Doe' },</p><p>`    `vendorData: 'your-internal-user-id',</p><p>`    `timestamp: new Date().toISOString()</p><p>`  `}</p><p>}</p><p></p><p>// Response: verification.url  <-- pass this to Flutter</p>|
| :- |

# **Step 5: Launch Veriff SDK in Flutter**

|<p>import 'package:veriff\_flutter/veriff\_flutter.dart';</p><p>import 'package:flutter/services.dart';</p><p></p><p>Future<void> startVerification(String sessionUrl) async {</p><p>`  `final config = Configuration(sessionUrl);</p><p>`  `final veriff = Veriff();</p><p>`  `try {</p><p>`    `final result = await veriff.start(config);</p><p>`    `switch (result.status) {</p><p>`      `case Status.done:</p><p>`        `// Flow complete — await webhook for real decision</p><p>`        `break;</p><p>`      `case Status.canceled:</p><p>`        `print('User canceled.');</p><p>`        `break;</p><p>`      `case Status.error:</p><p>`        `\_handleError(result.error);</p><p>`        `break;</p><p>`    `}</p><p>`  `} on PlatformException catch (e) {</p><p>`    `print('Platform error: ${e.message}');</p><p>`  `}</p><p>}</p><p></p><p>void \_handleError(Error? error) {</p><p>`  `switch (error) {</p><p>`    `case Error.cameraUnavailable:    print('Camera permission denied.'); break;</p><p>`    `case Error.microphoneUnavailable: print('Microphone denied.'); break;</p><p>`    `case Error.networkError:          print('Network error.'); break;</p><p>`    `case Error.sessionError:          print('Session error.'); break;</p><p>`    `case Error.deprecatedSDKVersion:  print('Update the Veriff SDK.'); break;</p><p>`    `default:                          print('Unknown error.');</p><p>`  `}</p><p>}</p>|
| :- |

|**Important:** Status.done only means the user completed the UI flow. The actual approve/decline decision arrives via webhook.|
| :- |

# **Step 6: Handle the Verification Webhook (Backend)**
Veriff POSTs the decision to your webhook URL after AI analysis is complete.

### **Example Webhook Payload**

|<p>{</p><p>`  `"status": "success",</p><p>`  `"verification": {</p><p>`    `"id": "session-uuid",</p><p>`    `"status": "approved",</p><p>`    `"person": {</p><p>`      `"firstName": "John", "lastName": "Doe",</p><p>`      `"dateOfBirth": "1990-01-01"</p><p>`    `},</p><p>`    `"document": { "type": "PASSPORT", "country": "GB" }</p><p>`  `}</p><p>}</p>|
| :- |

Possible status values: approved, declined, resubmission\_requested, expired, abandoned.

# **Step 7: Branding Customization (Optional)**

|<p>final branding = Branding(</p><p>`  `logo: AssetImage('assets/your\_logo.png'),</p><p>`  `background: '#FFFFFF',</p><p>`  `primary: '#00C2A8',</p><p>`  `onPrimary: '#FFFFFF',</p><p>`  `error: '#FF0000',</p><p>`  `success: '#00C853',</p><p>`  `buttonRadius: 8,</p><p>);</p><p>final config = Configuration(sessionUrl, branding: branding, languageLocale: 'en');</p>|
| :- |

# **Step 8: NFC Passport Scanning (Optional — iOS)**
Add to Podfile:

|pod 'VeriffNFCSDK'|
| :- |

Add to Info.plist:

|<p><key>NFCReaderUsageDescription</key></p><p><string>NFC is used to scan passport chips</string></p><p><key>com.apple.developer.nfc.readersession.iso7816.select-identifiers</key></p><p><array></p><p>`  `<string>A0000002471001</string></p><p>`  `<string>A0000002472001</string></p><p></array></p>|
| :- |



**PART 2 — DBS CERTIFICATE VERIFICATION**
# **What is a DBS Certificate Check?**
The Disclosure and Barring Service (DBS) is a UK Home Office agency that enables organisations to make safer recruitment decisions by checking applicants' criminal records. A DBS Certificate (formerly CRB check) is legally required for many roles working with children or vulnerable adults in England and Wales.

## **Four Levels of DBS Check**

|**Check Level**|**What It Reveals / Use Case**|
| :- | :- |
|**Basic**|Unspent convictions & conditional cautions only. Available to any employer.|
|**Standard**|Spent & unspent convictions, cautions. For roles such as security guards.|
|**Enhanced**|Standard + local police intelligence. For roles with children/vulnerable adults.|
|**Enhanced + Barred List**|Enhanced + check against Children's or Adults' Barred Lists. For regulated activity.|

# **How Veriff Enables DBS Digital Identity Verification**
The UK government's DBS digital identity guidance (updated November 2025) allows Registered Bodies (RBs) and Responsible Organisations (ROs) to use a certified Digital Verification Service (DVS) — such as Veriff — to fulfil the identity checking requirement for DBS applications. This eliminates the need for in-person document checks.

|**Gov.uk Guidance:** A digital identity provided by a DVS certified against the UK trust framework and the DBS supplementary code is fully equivalent to a traditional in-person identity check. Source: gov.uk DBS digital identity verification guidance, November 2025.|
| :- |

## **Confidence Levels Required**
- Basic DBS check: minimum Medium level of confidence (GPG45 profile)
- Standard, Enhanced, Enhanced + Barred List: minimum High level of confidence

Veriff's IDV flow with biometrics and document verification satisfies both medium and high confidence levels when configured appropriately.

# **DBS + Veriff Architecture in Flutter**

|<p>User opens Flutter app to apply for DBS check</p><p>`   `|</p><p>`   `|-- Step 1: Collect applicant info in Flutter UI</p><p>`   `|      (name, DOB, 5-year address history, employment sector)</p><p>`   `|</p><p>`   `|-- Step 2: Flutter calls your backend --> Veriff creates session</p><p>`   `|      (Veriff = your certified DVS for identity verification)</p><p>`   `|</p><p>`   `|-- Step 3: Flutter launches Veriff SDK</p><p>`   `|      (user captures face + government ID document)</p><p>`   `|</p><p>`   `|-- Step 4: Veriff webhook --> your backend</p><p>`   `|      (identity approved/declined + extracted data)</p><p>`   `|</p><p>`   `|-- Step 5: Your backend submits DBS application to DBS portal/API</p><p>`   `|      (using verified identity data from Veriff DVS report)</p><p>`   `|</p><p>`   `|-- Step 6: DBS processes the check</p><p>`   `|</p><p>`   `└── Step 7: DBS certificate issued to applicant (digital or paper)</p>|
| :- |

# **Step 9: Collect DBS Application Data in Flutter**
Before launching Veriff, collect all required DBS application fields. The DBS requires specific data — your Flutter form must capture all of it.

## **Required Fields for DBS Application**

|**Field**|**Requirement**|
| :- | :- |
|**Full legal name (forename, surname)**|Mandatory — must match official documents|
|**Middle names**|Mandatory if applicable|
|**Date of birth**|Mandatory|
|**Current address**|Mandatory — verified by Veriff DVS or within 90 days|
|**5-year address history**|Mandatory — delays occur if incomplete|
|**All previous name changes**|Mandatory — delays occur if undeclared|
|**Employment sector**|Mandatory (e.g. EDUCATION, HEALTHCARE, RETAIL)|
|**Role / position title**|Mandatory|
|**National Insurance number**|Required for Standard/Enhanced checks|

### **Flutter Form Example**

|<p>class DbsApplicationForm extends StatefulWidget {</p><p>`  `@override</p><p>`  `\_DbsApplicationFormState createState() => \_DbsApplicationFormState();</p><p>}</p><p></p><p>class \_DbsApplicationFormState extends State<DbsApplicationForm> {</p><p>`  `final \_formKey = GlobalKey<FormState>();</p><p>`  `final \_firstName     = TextEditingController();</p><p>`  `final \_lastName      = TextEditingController();</p><p>`  `final \_dob           = TextEditingController();</p><p>`  `final \_address       = TextEditingController();</p><p>`  `final \_niNumber      = TextEditingController();</p><p>`  `final \_roleTitle     = TextEditingController();</p><p>`  `String \_sector       = 'HEALTHCARE';</p><p>`  `List<Map<String,String>> \_addressHistory = [];</p><p></p><p>`  `void \_submitAndStartVeriff() async {</p><p>`    `if (\_formKey.currentState!.validate()) {</p><p>`      `// 1. Save data to your backend</p><p>`      `final sessionUrl = await \_createVeriffSession();</p><p>`      `// 2. Launch Veriff IDV</p><p>`      `await startVerification(sessionUrl);</p><p>`    `}</p><p>`  `}</p><p></p><p>`  `Future<String> \_createVeriffSession() async {</p><p>`    `final res = await http.post(</p><p>`      `Uri.parse('https://yourapi.com/dbs/create-session'),</p><p>`      `body: jsonEncode({</p><p>`        `'firstName':     \_firstName.text,</p><p>`        `'lastName':      \_lastName.text,</p><p>`        `'dateOfBirth':   \_dob.text,</p><p>`        `'address':       \_address.text,</p><p>`        `'niNumber':      \_niNumber.text,</p><p>`        `'employmentSector': \_sector,</p><p>`        `'roleTitle':     \_roleTitle.text,</p><p>`        `'addressHistory': \_addressHistory,</p><p>`      `}),</p><p>`      `headers: {'Content-Type': 'application/json'},</p><p>`    `);</p><p>`    `return jsonDecode(res.body)['sessionUrl'];</p><p>`  `}</p><p>}</p>|
| :- |

# **Step 10: Create Veriff Session with DBS Data (Backend)**
When creating the Veriff session for a DBS check, pass the applicant's personal details as initData so Veriff can cross-reference document data:

|<p>// POST https://stationapi.veriff.com/v1/sessions</p><p>{</p><p>`  `"verification": {</p><p>`    `"callback": "https://yourapi.com/webhooks/veriff",</p><p>`    `"vendorData": "dbs-application-ref-123",</p><p>`    `"person": {</p><p>`      `"firstName": "John",</p><p>`      `"lastName":  "Doe",</p><p>`      `"dateOfBirth": "1990-01-15",</p><p>`      `"idNumber": "AB123456C"   // National Insurance number</p><p>`    `},</p><p>`    `"address": {</p><p>`      `"fullAddress": "10 Downing Street, London, SW1A 2AA"</p><p>`    `},</p><p>`    `"timestamp": "2026-04-14T10:00:00.000Z"</p><p>`  `}</p><p>}</p>|
| :- |

# **Step 11: Receive Veriff DVS Report & Extract DBS Data**
Once Veriff approves the identity, your webhook receives the session decision. You must extract specific fields required by DBS and retain them for at least 2 years per DBS data retention rules.

### **Fields to Extract from Veriff Webhook for DBS Submission**

|**DBS Required Field**|**Veriff Webhook Source**|
| :- | :- |
|**Forename**|verification.person.firstName|
|**Surname**|verification.person.lastName|
|**Date of Birth**|verification.person.dateOfBirth|
|**Identity Verified (Y/N)**|verification.status == 'approved'|
|**Evidence Checked By**|DVS name on trust framework certificate|
|**Passport Details**|verification.document (if type=PASSPORT)|
|**Driving Licence Details**|verification.document (if type=DRIVERS\_LICENSE)|
|**GPG45 Profile**|Configured in your Veriff integration settings|
|**Subject ID**|verification.id (Veriff session UUID)|

### **Backend Webhook Handler Example**

|<p>app.post('/webhooks/veriff', async (req, res) => {</p><p>`  `const { verification } = req.body;</p><p></p><p>`  `if (verification.status === 'approved') {</p><p>`    `const dvsReport = {</p><p>`      `forename:          verification.person.firstName,</p><p>`      `surname:           verification.person.lastName,</p><p>`      `dateOfBirth:       verification.person.dateOfBirth,</p><p>`      `identityVerified:  true,</p><p>`      `evidenceCheckedBy: 'Veriff',  // DVS name on trust framework cert</p><p>`      `documentType:      verification.document.type,</p><p>`      `documentCountry:   verification.document.country,</p><p>`      `documentNumber:    verification.document.number,</p><p>`      `subjectId:         verification.id,</p><p>`    `};</p><p></p><p>`    `// Store DVS report (retain >= 2 years per DBS rules)</p><p>`    `await saveDvsReport(verification.vendorData, dvsReport);</p><p></p><p>`    `// Now submit DBS application with verified data</p><p>`    `await submitDbsApplication(dvsReport);</p><p>`  `}</p><p></p><p>`  `res.sendStatus(200);</p><p>});</p>|
| :- |

# **Step 12: Submit DBS Application**
After identity is verified via Veriff, submit the DBS application using either:

- **Option A —** DBS e-Bulk API (for Registered Bodies submitting Standard/Enhanced checks via XML)
- **Option B —** DBS Web Service / portal (for Responsible Organisations submitting Basic checks)
- **Option C —** Third-party umbrella body APIs such as Disclosure Services, Certn, or APCS (recommended for most Flutter apps)

|**Recommendation:** Most Flutter app developers should use a third-party umbrella body such as Certn or Disclosure Services, as the raw DBS e-Bulk API requires registration as an official Registered Body, which is a significant compliance process.|
| :- |

### **Option C: Certn API (Recommended Third-Party)**

|<p>// POST https://api.certn.co/api/v1/applications/invite/</p><p>// Headers: Authorization: Token YOUR\_CERTN\_API\_KEY</p><p></p><p>{</p><p>`  `"request\_uk\_basic\_dbs\_check": true,</p><p>`  `"request\_enhanced\_identity\_verification": true,</p><p>`  `"email": "applicant@example.com",</p><p>`  `"employment\_sector": "HEALTHCARE",</p><p>`  `"role\_or\_position\_title": "Care Worker",</p><p>`  `"first\_name": "John",</p><p>`  `"last\_name": "Doe",</p><p>`  `"date\_of\_birth": "1990-01-15"</p><p>}</p>|
| :- |

# **Step 13: Track DBS Status in Flutter**
Poll your backend or use push notifications to update the Flutter UI as the DBS application progresses.

|<p>enum DbsStatus {</p><p>`  `notStarted,</p><p>`  `identityVerified,       // Veriff approved</p><p>`  `dbsSubmitted,           // Application sent to DBS</p><p>`  `dbsProcessing,          // DBS is running the check</p><p>`  `certificateIssued,      // Certificate ready</p><p>`  `awaitCertificate,       // Returned with comments — manual review</p><p>`  `declined,               // Identity or DBS failed</p><p>}</p><p></p><p>class DbsStatusWidget extends StatelessWidget {</p><p>`  `final DbsStatus status;</p><p>`  `const DbsStatusWidget({required this.status});</p><p></p><p>`  `@override</p><p>`  `Widget build(BuildContext context) {</p><p>`    `return ListTile(</p><p>`      `leading: \_icon(status),</p><p>`      `title: Text(\_label(status)),</p><p>`      `subtitle: Text(\_description(status)),</p><p>`    `);</p><p>`  `}</p><p></p><p>`  `String \_label(DbsStatus s) {</p><p>`    `switch (s) {</p><p>`      `case DbsStatus.identityVerified:  return 'Identity Verified';</p><p>`      `case DbsStatus.dbsSubmitted:      return 'DBS Application Submitted';</p><p>`      `case DbsStatus.certificateIssued: return 'DBS Certificate Issued';</p><p>`      `case DbsStatus.awaitCertificate:  return 'Manual Review Required';</p><p>`      `default:                          return 'In Progress';</p><p>`    `}</p><p>`  `}</p><p>}</p>|
| :- |

# **Step 14: Data Retention & Compliance**
You are legally obligated to retain specific records per DBS and UK GDPR rules.

|**Obligation**|**Requirement**|
| :- | :- |
|**DVS output report retention**|Minimum 2 years, available to DBS on request|
|**Audit trail of each application**|Must be maintained by RB or RO|
|**Address verification record**|Retain document type, date, and verifier name|
|**Right to work check**|Separate check — DBS certificate does not cover this|
|**GDPR / data minimisation**|Only collect and store fields required by DBS|
|**Veriff data retention**|Veriff retains end-user data for up to 3 years by default|

|**Legal Note:** A DBS check does not provide evidence of the applicant's right to work in the UK. You must conduct a separate right-to-work check. Certain DVS providers (including Veriff in some configurations) can also support right-to-work checks.|
| :- |



**COMBINED REQUIREMENTS SUMMARY**

|**Requirement**|**Detail**|
| :- | :- |
|**Android minimum**|API 26 (Android 8.0)|
|**iOS minimum**|iOS 13.0|
|**Veriff free trial**|15 days, up to 1,000 IDV sessions/month|
|**Veriff SDK update cycle**|Every 2 weeks — keep updated|
|**Session creation**|Must be server-side (API secret never in Flutter)|
|**Veriff webhook**|Required for IDV decisions|
|**DVS certification**|Veriff is certified against UK trust framework + DBS supplementary code|
|**Basic DBS confidence**|Medium (GPG45) — Veriff satisfies this|
|**Standard/Enhanced confidence**|High (GPG45) — Veriff satisfies this with biometrics|
|**DBS record retention**|Minimum 2 years per DBS rules|
|**GDPR compliance**|Your responsibility as data controller|
|**Right-to-work check**|Separate from DBS — conduct independently|
|**Flutter package**|veriff\_flutter (pub.dev)|
|**DBS submission option**|Certn, Disclosure Services, or APCS (umbrella bodies)|

Veriff Flutter docs: devdocs.veriff.com/v1/docs/flutter-plugin  |  DBS digital identity guidance: gov.uk  |  Package: pub.dev/packages/veriff\_flutter
