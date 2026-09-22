import { createContext, useContext, useState } from 'react';

const TRANSLATIONS = {
  en: {
    tagline: 'From Hive to Home, Verified at Every Step.',
    subtitle: 'An intelligent traceability and smart beekeeping platform connecting rural beekeepers, trusted honey, and transparent supply chains.',
    verifyHoney: 'Verify Honey',
    beekeeperLogin: 'Beekeeper Login',
    getStarted: 'Get Started',
    goToDashboard: 'Go to Dashboard',
    journey: ['Hive', 'Harvest', 'Processing', 'Packaging', 'Consumer'],
    benefits: [
      { icon: '🔗', title: 'Blockchain Traceability', desc: 'Tamper-evident records of every step in the honey journey.' },
      { icon: '📱', title: 'QR Verification', desc: 'Consumers scan a QR code to see the full verified history.' },
      { icon: '🐝', title: 'AI Hive Monitoring', desc: 'AI-estimated disease risk and yield predictions from hive data.' },
      { icon: '📊', title: 'Smart Beekeeping', desc: 'Simulated IoT sensors track temperature, weight, and activity.' },
      { icon: '🌾', title: 'Transparent Supply Chain', desc: 'From apiary to package, every event is recorded and visible.' },
    ],
    verified: 'TRACEABILITY VERIFIED',
    beekeeper: 'Beekeeper', apiary: 'Apiary', harvestDate: 'Harvest Date', quantity: 'Quantity', honeyType: 'Honey Type', hive: 'Hive',
    timeline: 'Traceability Timeline',
    healthSummary: 'Hive Health Summary (AI-estimated)',
    blockchainStatus: 'Blockchain Status',
    recordFound: 'Record Found', hashVerified: 'Hash Verified', traceabilityIntact: 'Traceability Intact',
    verifyBlockchain: 'Verify Blockchain Record', hideBlockchain: 'Hide Blockchain Record',
    verifying: 'Verifying batch…', verificationFailed: 'Verification Failed',
    nav: { dashboard: 'Dashboard', apiaries: 'Apiaries', hives: 'Hives', batches: 'Honey Batches', alerts: 'Alerts', kvicDashboard: 'KVIC Dashboard', logout: 'Logout' },
    dash: {
      welcome: 'Welcome back', addHive: '+ Add Hive', createBatch: '+ Create Batch',
      totalHives: 'Total Hives', healthy: 'Healthy', atRisk: 'At Risk', honeyProducedKg: 'Honey Produced (kg)',
      hiveHealthBreakdown: 'Hive Health Breakdown', recentProduction: 'Recent Batch Production (kg)',
      yourHives: 'Your Hives', noHives: 'No hives registered yet.', noBatches: 'No batches yet.',
    },
    admin: {
      title: 'KVIC Monitoring Dashboard', subtitle: 'National overview of registered beekeepers, hives, and honey production.',
      totalBeekeepers: 'Total Beekeepers', totalApiaries: 'Total Apiaries', activeHives: 'Active Hives',
      atRiskHives: 'At-Risk Hives', honeyProducedKg: 'Honey Produced (kg)', verifiedBatches: 'Verified Batches', totalBatches: 'Total Batches',
      apiaryMap: 'Apiary Map (Gujarat)', flaggedHives: 'Flagged Hives', clusterProduction: 'Cluster Production (kg)',
      hiveHealthNational: 'Hive Health (National)', clusterBreakdown: 'Cluster-Level Breakdown', exportCsv: 'Export CSV',
    },
    common: {
      search: 'Search', edit: 'Edit', delete: 'Delete', save: 'Save', cancel: 'Cancel', loading: 'Loading…',
      allStatuses: 'All statuses', healthy: 'Healthy', mediumRisk: 'Medium Risk', highRisk: 'High Risk',
    },
    clusters: { Ahmedabad: 'Ahmedabad', Rajkot: 'Rajkot', Junagadh: 'Junagadh', Banaskantha: 'Banaskantha' },
    apiariesPage: {
      title: 'Apiaries', registerNew: 'Register New Apiary', name: 'Name', location: 'Location', cluster: 'Cluster',
      locationPlaceholder: 'e.g. Village, District', addApiary: 'Add Apiary', saving: 'Saving…',
      noApiaries: 'No apiaries yet — register your first one.', hivesCount: 'hives',
    },
    hivesPage: {
      title: 'Hive Management', registerNew: 'Register New Hive', hiveNumber: 'Hive Number', apiary: 'Apiary',
      installationDate: 'Installation Date', addHive: 'Add Hive', registerApiaryFirst: 'Register an apiary first.',
      searchPlaceholder: 'Search hive number or apiary…', noHives: 'No hives registered yet.',
    },
    batchesPage: {
      title: 'Honey Batches', createBatch: '+ Create Batch', searchPlaceholder: 'Search batch ID or hive…',
      noBatches: 'No batches yet. Record your first harvest.', traceability: 'Traceability', qrCode: 'QR Code',
      harvested: 'Harvested', extracted: 'Extracted', processed: 'Processed', packaged: 'Packaged', distributed: 'Distributed',
    },
    createBatchPage: {
      title: 'Record Harvest / Create Honey Batch', hive: 'Hive', harvestDate: 'Harvest Date', quantity: 'Quantity (kg)',
      honeyType: 'Honey Type', clusterLabel: 'Cluster', harvestLocation: 'Harvest Location',
      submit: 'Create Batch & Record on Blockchain', creating: 'Creating batch…', registerHiveFirst: 'Register a hive before creating a batch.',
      batchCreated: 'Batch Created', addEvents: 'Add Traceability Events', generateQr: 'Generate QR Code',
    },
    alertsPage: {
      title: 'Alerts', unresolved: 'Unresolved', all: 'All', noUnresolved: 'No unresolved alerts — all hives look good.',
      noAlerts: 'No alerts recorded yet.', markResolved: 'Mark Resolved', resolved: 'Resolved',
      simulatedNote: 'Email/WhatsApp notifications shown here are simulated for this prototype — no real messages are sent.',
    },
    loginPage: {
      welcome: 'Welcome back', subtitle: 'Login to manage your hives and honey batches.',
      email: 'Email', password: 'Password', login: 'Login', loggingIn: 'Logging in…',
      noAccount: "Don't have an account?", register: 'Register',
    },
    registerPage: {
      title: 'Beekeeper Registration', subtitle: 'Create an account to start managing your apiaries and hives.',
      fullName: 'Full name', email: 'Email', password: 'Password',
      create: 'Create account', creating: 'Creating account…', haveAccount: 'Already have an account?', login: 'Login',
    },
    hiveDetailPage: {
      backToHives: '← Back to hives', simulatedSensors: 'Simulated IoT Sensors',
      simulateDesc: 'Generate a new reading (real sensors can plug into this same API later).',
      simulateNormal: 'Simulate Normal Reading', simulateAnomaly: '🚨 Simulate Anomaly (Demo)',
      aiRisk: 'AI Disease Risk', predictedYield: 'Predicted Yield', latestWeight: 'Latest Weight', healthStatus: 'Health Status',
      recommendation: 'Recommendation', aiNote: 'AI-estimated indicator based on environmental/behavioral data — not a scientific or veterinary diagnosis.',
      sensorTrends: 'Sensor Trends (simulated)', noReadings: 'No sensor readings yet.',
      batchHistoryTitle: 'Batch History from this Hive', noBatchHistory: 'No honey batches recorded from this hive yet.',
      batchId: 'Batch ID', harvestDate: 'Harvest Date', quantity: 'Quantity', status: 'Status', blockchain: 'Blockchain',
      onChain: '✓ On-chain', dbOnly: '— DB only',
    },
    traceabilityPage: {
      timeline: 'Traceability Timeline', notRecorded: 'Not yet recorded', recordNextStep: 'Record next step:',
      location: 'Location', notes: 'Notes (optional)', recordBtn: 'Record', recordingBtn: 'Recording…', onBlockchain: 'on Blockchain',
      fullHistory: '✅ Full traceability history recorded — batch has reached consumer distribution.',
    },
    qrPage: {
      title: 'QR Code', backToBatches: '← Back to batches', noQr: 'No QR code stored for this batch.',
      download: 'Download QR', print: 'Print QR', attachNote: 'Attach this QR code to the honey package. Consumers scan it to view the verified journey.',
    },
  },
  hi: {
    tagline: 'छत्ते से घर तक, हर कदम पर सत्यापित।',
    subtitle: 'एक बुद्धिमान ट्रेसेबिलिटी और स्मार्ट मधुमक्खी पालन मंच जो ग्रामीण मधुमक्खी पालकों, विश्वसनीय शहद और पारदर्शी आपूर्ति श्रृंखलाओं को जोड़ता है।',
    verifyHoney: 'शहद सत्यापित करें',
    beekeeperLogin: 'मधुमक्खी पालक लॉगिन',
    getStarted: 'शुरू करें',
    goToDashboard: 'डैशबोर्ड पर जाएं',
    journey: ['छत्ता', 'फसल', 'प्रसंस्करण', 'पैकेजिंग', 'उपभोक्ता'],
    benefits: [
      { icon: '🔗', title: 'ब्लॉकचेन ट्रेसेबिलिटी', desc: 'शहद की यात्रा के हर कदम का छेड़छाड़-रहित रिकॉर्ड।' },
      { icon: '📱', title: 'क्यूआर सत्यापन', desc: 'उपभोक्ता क्यूआर कोड स्कैन करके पूरा इतिहास देखते हैं।' },
      { icon: '🐝', title: 'एआई छत्ता निगरानी', desc: 'छत्ते के डेटा से एआई-अनुमानित रोग जोखिम और उपज पूर्वानुमान।' },
      { icon: '📊', title: 'स्मार्ट मधुमक्खी पालन', desc: 'सिम्युलेटेड आईओटी सेंसर तापमान, वजन और गतिविधि को ट्रैक करते हैं।' },
      { icon: '🌾', title: 'पारदर्शी आपूर्ति श्रृंखला', desc: 'एपियरी से पैकेज तक, हर घटना दर्ज और दृश्यमान है।' },
    ],
    verified: 'ट्रेसेबिलिटी सत्यापित',
    beekeeper: 'मधुमक्खी पालक', apiary: 'एपियरी', harvestDate: 'फसल की तारीख', quantity: 'मात्रा', honeyType: 'शहद का प्रकार', hive: 'छत्ता',
    timeline: 'ट्रेसेबिलिटी समयरेखा',
    healthSummary: 'छत्ता स्वास्थ्य सारांश (एआई-अनुमानित)',
    blockchainStatus: 'ब्लॉकचेन स्थिति',
    recordFound: 'रिकॉर्ड मिला', hashVerified: 'हैश सत्यापित', traceabilityIntact: 'ट्रेसेबिलिटी बरकरार',
    verifyBlockchain: 'ब्लॉकचेन रिकॉर्ड सत्यापित करें', hideBlockchain: 'ब्लॉकचेन रिकॉर्ड छिपाएं',
    verifying: 'बैच सत्यापित हो रहा है…', verificationFailed: 'सत्यापन विफल',
    nav: { dashboard: 'डैशबोर्ड', apiaries: 'एपियरी', hives: 'छत्ते', batches: 'शहद बैच', alerts: 'अलर्ट', kvicDashboard: 'केवीआईसी डैशबोर्ड', logout: 'लॉगआउट' },
    dash: {
      welcome: 'वापसी पर स्वागत है', addHive: '+ छत्ता जोड़ें', createBatch: '+ बैच बनाएं',
      totalHives: 'कुल छत्ते', healthy: 'स्वस्थ', atRisk: 'जोखिम में', honeyProducedKg: 'शहद उत्पादन (किग्रा)',
      hiveHealthBreakdown: 'छत्ता स्वास्थ्य विवरण', recentProduction: 'हाल का बैच उत्पादन (किग्रा)',
      yourHives: 'आपके छत्ते', noHives: 'अभी तक कोई छत्ता पंजीकृत नहीं है।', noBatches: 'अभी तक कोई बैच नहीं है।',
    },
    admin: {
      title: 'केवीआईसी निगरानी डैशबोर्ड', subtitle: 'पंजीकृत मधुमक्खी पालकों, छत्तों और शहद उत्पादन का राष्ट्रीय अवलोकन।',
      totalBeekeepers: 'कुल मधुमक्खी पालक', totalApiaries: 'कुल एपियरी', activeHives: 'सक्रिय छत्ते',
      atRiskHives: 'जोखिम वाले छत्ते', honeyProducedKg: 'शहद उत्पादन (किग्रा)', verifiedBatches: 'सत्यापित बैच', totalBatches: 'कुल बैच',
      apiaryMap: 'एपियरी मानचित्र (गुजरात)', flaggedHives: 'चिह्नित छत्ते', clusterProduction: 'क्लस्टर उत्पादन (किग्रा)',
      hiveHealthNational: 'छत्ता स्वास्थ्य (राष्ट्रीय)', clusterBreakdown: 'क्लस्टर-स्तरीय विवरण', exportCsv: 'सीएसवी निर्यात करें',
    },
    common: {
      search: 'खोजें', edit: 'संपादित करें', delete: 'हटाएं', save: 'सहेजें', cancel: 'रद्द करें', loading: 'लोड हो रहा है…',
      allStatuses: 'सभी स्थितियां', healthy: 'स्वस्थ', mediumRisk: 'मध्यम जोखिम', highRisk: 'उच्च जोखिम',
    },
    clusters: { Ahmedabad: 'अहमदाबाद', Rajkot: 'राजकोट', Junagadh: 'जूनागढ़', Banaskantha: 'बनासकांठा' },
    apiariesPage: {
      title: 'एपियरी', registerNew: 'नई एपियरी पंजीकृत करें', name: 'नाम', location: 'स्थान', cluster: 'क्लस्टर',
      locationPlaceholder: 'जैसे गांव, जिला', addApiary: 'एपियरी जोड़ें', saving: 'सहेजा जा रहा है…',
      noApiaries: 'अभी तक कोई एपियरी नहीं है — अपनी पहली एपियरी पंजीकृत करें।', hivesCount: 'छत्ते',
    },
    hivesPage: {
      title: 'छत्ता प्रबंधन', registerNew: 'नया छत्ता पंजीकृत करें', hiveNumber: 'छत्ता संख्या', apiary: 'एपियरी',
      installationDate: 'स्थापना तिथि', addHive: 'छत्ता जोड़ें', registerApiaryFirst: 'पहले एक एपियरी पंजीकृत करें।',
      searchPlaceholder: 'छत्ता संख्या या एपियरी खोजें…', noHives: 'अभी तक कोई छत्ता पंजीकृत नहीं है।',
    },
    batchesPage: {
      title: 'शहद बैच', createBatch: '+ बैच बनाएं', searchPlaceholder: 'बैच आईडी या छत्ता खोजें…',
      noBatches: 'अभी तक कोई बैच नहीं है। अपनी पहली फसल दर्ज करें।', traceability: 'ट्रेसेबिलिटी', qrCode: 'क्यूआर कोड',
      harvested: 'काटा गया', extracted: 'निकाला गया', processed: 'प्रसंस्कृत', packaged: 'पैक किया गया', distributed: 'वितरित',
    },
    createBatchPage: {
      title: 'फसल दर्ज करें / शहद बैच बनाएं', hive: 'छत्ता', harvestDate: 'फसल की तारीख', quantity: 'मात्रा (किग्रा)',
      honeyType: 'शहद का प्रकार', clusterLabel: 'क्लस्टर', harvestLocation: 'फसल स्थान',
      submit: 'बैच बनाएं और ब्लॉकचेन पर दर्ज करें', creating: 'बैच बनाया जा रहा है…', registerHiveFirst: 'बैच बनाने से पहले एक छत्ता पंजीकृत करें।',
      batchCreated: 'बैच बनाया गया', addEvents: 'ट्रेसेबिलिटी इवेंट जोड़ें', generateQr: 'क्यूआर कोड बनाएं',
    },
    alertsPage: {
      title: 'अलर्ट', unresolved: 'अनसुलझे', all: 'सभी', noUnresolved: 'कोई अनसुलझा अलर्ट नहीं — सभी छत्ते ठीक हैं।',
      noAlerts: 'अभी तक कोई अलर्ट दर्ज नहीं है।', markResolved: 'सुलझा हुआ चिह्नित करें', resolved: 'सुलझाया गया',
      simulatedNote: 'यहां दिखाई गई ईमेल/व्हाट्सएप सूचनाएं इस प्रोटोटाइप के लिए सिम्युलेटेड हैं — कोई वास्तविक संदेश नहीं भेजा जाता है।',
    },
    loginPage: {
      welcome: 'वापसी पर स्वागत है', subtitle: 'अपने छत्तों और शहद बैचों को प्रबंधित करने के लिए लॉगिन करें।',
      email: 'ईमेल', password: 'पासवर्ड', login: 'लॉगिन', loggingIn: 'लॉगिन हो रहा है…',
      noAccount: 'खाता नहीं है?', register: 'पंजीकरण करें',
    },
    registerPage: {
      title: 'मधुमक्खी पालक पंजीकरण', subtitle: 'अपनी एपियरी और छत्तों को प्रबंधित करने के लिए खाता बनाएं।',
      fullName: 'पूरा नाम', email: 'ईमेल', password: 'पासवर्ड',
      create: 'खाता बनाएं', creating: 'खाता बनाया जा रहा है…', haveAccount: 'पहले से खाता है?', login: 'लॉगिन',
    },
    hiveDetailPage: {
      backToHives: '← छत्तों पर वापस जाएं', simulatedSensors: 'सिम्युलेटेड आईओटी सेंसर',
      simulateDesc: 'एक नई रीडिंग बनाएं (असली सेंसर बाद में इसी एपीआई से जुड़ सकते हैं)।',
      simulateNormal: 'सामान्य रीडिंग सिम्युलेट करें', simulateAnomaly: '🚨 विसंगति सिम्युलेट करें (डेमो)',
      aiRisk: 'एआई रोग जोखिम', predictedYield: 'अनुमानित उपज', latestWeight: 'नवीनतम वजन', healthStatus: 'स्वास्थ्य स्थिति',
      recommendation: 'सिफारिश', aiNote: 'एआई-अनुमानित संकेतक पर्यावरणीय/व्यवहार डेटा पर आधारित है — यह कोई वैज्ञानिक या पशु चिकित्सा निदान नहीं है।',
      sensorTrends: 'सेंसर रुझान (सिम्युलेटेड)', noReadings: 'अभी तक कोई सेंसर रीडिंग नहीं है।',
      batchHistoryTitle: 'इस छत्ते से बैच इतिहास', noBatchHistory: 'इस छत्ते से अभी तक कोई शहद बैच दर्ज नहीं है।',
      batchId: 'बैच आईडी', harvestDate: 'फसल की तारीख', quantity: 'मात्रा', status: 'स्थिति', blockchain: 'ब्लॉकचेन',
      onChain: '✓ ऑन-चेन', dbOnly: '— केवल डीबी',
    },
    traceabilityPage: {
      timeline: 'ट्रेसेबिलिटी समयरेखा', notRecorded: 'अभी तक दर्ज नहीं है', recordNextStep: 'अगला चरण दर्ज करें:',
      location: 'स्थान', notes: 'नोट्स (वैकल्पिक)', recordBtn: 'दर्ज करें', recordingBtn: 'दर्ज हो रहा है…', onBlockchain: 'ब्लॉकचेन पर',
      fullHistory: '✅ पूर्ण ट्रेसेबिलिटी इतिहास दर्ज किया गया — बैच उपभोक्ता वितरण तक पहुंच गया है।',
    },
    qrPage: {
      title: 'क्यूआर कोड', backToBatches: '← बैचों पर वापस जाएं', noQr: 'इस बैच के लिए कोई क्यूआर कोड संग्रहीत नहीं है।',
      download: 'क्यूआर डाउनलोड करें', print: 'क्यूआर प्रिंट करें', attachNote: 'इस क्यूआर कोड को शहद पैकेज पर लगाएं। उपभोक्ता सत्यापित यात्रा देखने के लिए इसे स्कैन करते हैं।',
    },
  },
  gu: {
    tagline: 'મધપૂડાથી ઘર સુધી, દરેક પગલે ચકાસાયેલ.',
    subtitle: 'એક બુદ્ધિશાળી ટ્રેસેબિલિટી અને સ્માર્ટ મધમાખી ઉછેર પ્લેટફોર્મ જે ગ્રામીણ મધમાખી ઉછેરનારાઓ, વિશ્વસનીય મધ અને પારદર્શક પુરવઠા શૃંખલાઓને જોડે છે.',
    verifyHoney: 'મધ ચકાસો',
    beekeeperLogin: 'મધમાખી ઉછેરનાર લોગિન',
    getStarted: 'શરૂ કરો',
    goToDashboard: 'ડેશબોર્ડ પર જાઓ',
    journey: ['મધપૂડો', 'લણણી', 'પ્રક્રિયા', 'પેકેજિંગ', 'ગ્રાહક'],
    benefits: [
      { icon: '🔗', title: 'બ્લોકચેન ટ્રેસેબિલિટી', desc: 'મધની યાત્રાના દરેક પગલાનો ચેડાં-પ્રૂફ રેકોર્ડ.' },
      { icon: '📱', title: 'ક્યુઆર ચકાસણી', desc: 'ગ્રાહકો ક્યુઆર કોડ સ્કેન કરીને સંપૂર્ણ ઇતિહાસ જુએ છે.' },
      { icon: '🐝', title: 'એઆઈ મધપૂડો મોનિટરિંગ', desc: 'મધપૂડાના ડેટા પરથી એઆઈ-અંદાજિત રોગ જોખમ અને ઉપજ આગાહી.' },
      { icon: '📊', title: 'સ્માર્ટ મધમાખી ઉછેર', desc: 'સિમ્યુલેટેડ આઈઓટી સેન્સર તાપમાન, વજન અને પ્રવૃત્તિને ટ્રેક કરે છે.' },
      { icon: '🌾', title: 'પારદર્શક પુરવઠા શૃંખલા', desc: 'એપિયરીથી પેકેજ સુધી, દરેક ઘટના નોંધાયેલ અને દૃશ્યમાન છે.' },
    ],
    verified: 'ટ્રેસેબિલિટી ચકાસાયેલ',
    beekeeper: 'મધમાખી ઉછેરનાર', apiary: 'એપિયરી', harvestDate: 'લણણીની તારીખ', quantity: 'જથ્થો', honeyType: 'મધનો પ્રકાર', hive: 'મધપૂડો',
    timeline: 'ટ્રેસેબિલિટી ટાઈમલાઈન',
    healthSummary: 'મધપૂડા આરોગ્ય સારાંશ (એઆઈ-અંદાજિત)',
    blockchainStatus: 'બ્લોકચેન સ્થિતિ',
    recordFound: 'રેકોર્ડ મળ્યો', hashVerified: 'હેશ ચકાસાયેલ', traceabilityIntact: 'ટ્રેસેબિલિટી અકબંધ',
    verifyBlockchain: 'બ્લોકચેન રેકોર્ડ ચકાસો', hideBlockchain: 'બ્લોકચેન રેકોર્ડ છુપાવો',
    verifying: 'બેચ ચકાસાઈ રહ્યું છે…', verificationFailed: 'ચકાસણી નિષ્ફળ',
    nav: { dashboard: 'ડેશબોર્ડ', apiaries: 'એપિયરી', hives: 'મધપૂડા', batches: 'મધ બેચ', alerts: 'ચેતવણીઓ', kvicDashboard: 'કેવીઆઈસી ડેશબોર્ડ', logout: 'લોગઆઉટ' },
    dash: {
      welcome: 'પાછા સ્વાગત છે', addHive: '+ મધપૂડો ઉમેરો', createBatch: '+ બેચ બનાવો',
      totalHives: 'કુલ મધપૂડા', healthy: 'સ્વસ્થ', atRisk: 'જોખમમાં', honeyProducedKg: 'મધ ઉત્પાદન (કિગ્રા)',
      hiveHealthBreakdown: 'મધપૂડા આરોગ્ય વિગત', recentProduction: 'તાજેતરનું બેચ ઉત્પાદન (કિગ્રા)',
      yourHives: 'તમારા મધપૂડા', noHives: 'હજુ સુધી કોઈ મધપૂડો નોંધાયેલ નથી.', noBatches: 'હજુ સુધી કોઈ બેચ નથી.',
    },
    admin: {
      title: 'કેવીઆઈસી મોનિટરિંગ ડેશબોર્ડ', subtitle: 'નોંધાયેલા મધમાખી ઉછેરનારાઓ, મધપૂડા અને મધ ઉત્પાદનનું રાષ્ટ્રીય વિહંગાવલોકન.',
      totalBeekeepers: 'કુલ મધમાખી ઉછેરનારા', totalApiaries: 'કુલ એપિયરી', activeHives: 'સક્રિય મધપૂડા',
      atRiskHives: 'જોખમી મધપૂડા', honeyProducedKg: 'મધ ઉત્પાદન (કિગ્રા)', verifiedBatches: 'ચકાસાયેલ બેચ', totalBatches: 'કુલ બેચ',
      apiaryMap: 'એપિયરી નકશો (ગુજરાત)', flaggedHives: 'ચિહ્નિત મધપૂડા', clusterProduction: 'ક્લસ્ટર ઉત્પાદન (કિગ્રા)',
      hiveHealthNational: 'મધપૂડા આરોગ્ય (રાષ્ટ્રીય)', clusterBreakdown: 'ક્લસ્ટર-સ્તર વિગત', exportCsv: 'સીએસવી નિકાસ કરો',
    },
    common: {
      search: 'શોધો', edit: 'સંપાદિત કરો', delete: 'કાઢી નાખો', save: 'સાચવો', cancel: 'રદ કરો', loading: 'લોડ થઈ રહ્યું છે…',
      allStatuses: 'બધી સ્થિતિ', healthy: 'સ્વસ્થ', mediumRisk: 'મધ્યમ જોખમ', highRisk: 'ઉચ્ચ જોખમ',
    },
    clusters: { Ahmedabad: 'અમદાવાદ', Rajkot: 'રાજકોટ', Junagadh: 'જૂનાગઢ', Banaskantha: 'બનાસકાંઠા' },
    apiariesPage: {
      title: 'એપિયરી', registerNew: 'નવી એપિયરી નોંધો', name: 'નામ', location: 'સ્થાન', cluster: 'ક્લસ્ટર',
      locationPlaceholder: 'દા.ત. ગામ, જિલ્લો', addApiary: 'એપિયરી ઉમેરો', saving: 'સાચવી રહ્યા છીએ…',
      noApiaries: 'હજુ સુધી કોઈ એપિયરી નથી — તમારી પ્રથમ એપિયરી નોંધો.', hivesCount: 'મધપૂડા',
    },
    hivesPage: {
      title: 'મધપૂડા સંચાલન', registerNew: 'નવો મધપૂડો નોંધો', hiveNumber: 'મધપૂડા નંબર', apiary: 'એપિયરી',
      installationDate: 'સ્થાપન તારીખ', addHive: 'મધપૂડો ઉમેરો', registerApiaryFirst: 'પહેલા એક એપિયરી નોંધો.',
      searchPlaceholder: 'મધપૂડા નંબર અથવા એપિયરી શોધો…', noHives: 'હજુ સુધી કોઈ મધપૂડો નોંધાયેલ નથી.',
    },
    batchesPage: {
      title: 'મધ બેચ', createBatch: '+ બેચ બનાવો', searchPlaceholder: 'બેચ આઈડી અથવા મધપૂડો શોધો…',
      noBatches: 'હજુ સુધી કોઈ બેચ નથી. તમારી પ્રથમ લણણી નોંધો.', traceability: 'ટ્રેસેબિલિટી', qrCode: 'ક્યુઆર કોડ',
      harvested: 'લણેલું', extracted: 'કાઢેલું', processed: 'પ્રક્રિયા કરેલ', packaged: 'પેક કરેલ', distributed: 'વિતરિત',
    },
    createBatchPage: {
      title: 'લણણી નોંધો / મધ બેચ બનાવો', hive: 'મધપૂડો', harvestDate: 'લણણીની તારીખ', quantity: 'જથ્થો (કિગ્રા)',
      honeyType: 'મધનો પ્રકાર', clusterLabel: 'ક્લસ્ટર', harvestLocation: 'લણણી સ્થાન',
      submit: 'બેચ બનાવો અને બ્લોકચેન પર નોંધો', creating: 'બેચ બનાવી રહ્યા છીએ…', registerHiveFirst: 'બેચ બનાવતા પહેલા મધપૂડો નોંધો.',
      batchCreated: 'બેચ બનાવ્યો', addEvents: 'ટ્રેસેબિલિટી ઇવેન્ટ ઉમેરો', generateQr: 'ક્યુઆર કોડ બનાવો',
    },
    alertsPage: {
      title: 'ચેતવણીઓ', unresolved: 'ઉકેલાયેલ નથી', all: 'બધા', noUnresolved: 'કોઈ વણઉકેલાયેલ ચેતવણી નથી — બધા મધપૂડા સારા છે.',
      noAlerts: 'હજુ સુધી કોઈ ચેતવણી નોંધાયેલ નથી.', markResolved: 'ઉકેલાયેલ ચિહ્નિત કરો', resolved: 'ઉકેલાયું',
      simulatedNote: 'અહીં બતાવેલ ઈમેલ/વોટ્સએપ સૂચનાઓ આ પ્રોટોટાઇપ માટે સિમ્યુલેટેડ છે — કોઈ વાસ્તવિક સંદેશ મોકલાતો નથી.',
    },
    loginPage: {
      welcome: 'પાછા સ્વાગત છે', subtitle: 'તમારા મધપૂડા અને મધ બેચનું સંચાલન કરવા લોગિન કરો.',
      email: 'ઈમેલ', password: 'પાસવર્ડ', login: 'લોગિન', loggingIn: 'લોગિન થઈ રહ્યું છે…',
      noAccount: 'ખાતું નથી?', register: 'નોંધણી કરો',
    },
    registerPage: {
      title: 'મધમાખી ઉછેરનાર નોંધણી', subtitle: 'તમારી એપિયરી અને મધપૂડાનું સંચાલન કરવા ખાતું બનાવો.',
      fullName: 'પૂરું નામ', email: 'ઈમેલ', password: 'પાસવર્ડ',
      create: 'ખાતું બનાવો', creating: 'ખાતું બનાવી રહ્યા છીએ…', haveAccount: 'પહેલેથી ખાતું છે?', login: 'લોગિન',
    },
    hiveDetailPage: {
      backToHives: '← મધપૂડા પર પાછા જાઓ', simulatedSensors: 'સિમ્યુલેટેડ આઈઓટી સેન્સર',
      simulateDesc: 'નવું રીડિંગ બનાવો (વાસ્તવિક સેન્સર પછીથી આ જ એપીઆઈ સાથે જોડાઈ શકે છે).',
      simulateNormal: 'સામાન્ય રીડિંગ સિમ્યુલેટ કરો', simulateAnomaly: '🚨 વિસંગતતા સિમ્યુલેટ કરો (ડેમો)',
      aiRisk: 'એઆઈ રોગ જોખમ', predictedYield: 'અંદાજિત ઉપજ', latestWeight: 'નવીનતમ વજન', healthStatus: 'આરોગ્ય સ્થિતિ',
      recommendation: 'ભલામણ', aiNote: 'એઆઈ-અંદાજિત સૂચક પર્યાવરણીય/વર્તણૂક ડેટા પર આધારિત છે — તે વૈજ્ઞાનિક કે પશુચિકિત્સા નિદાન નથી.',
      sensorTrends: 'સેન્સર વલણો (સિમ્યુલેટેડ)', noReadings: 'હજુ સુધી કોઈ સેન્સર રીડિંગ નથી.',
      batchHistoryTitle: 'આ મધપૂડામાંથી બેચ ઇતિહાસ', noBatchHistory: 'આ મધપૂડામાંથી હજુ સુધી કોઈ મધ બેચ નોંધાયેલ નથી.',
      batchId: 'બેચ આઈડી', harvestDate: 'લણણીની તારીખ', quantity: 'જથ્થો', status: 'સ્થિતિ', blockchain: 'બ્લોકચેન',
      onChain: '✓ ઓન-ચેન', dbOnly: '— ફક્ત ડીબી',
    },
    traceabilityPage: {
      timeline: 'ટ્રેસેબિલિટી ટાઈમલાઈન', notRecorded: 'હજુ નોંધાયેલ નથી', recordNextStep: 'આગળનું પગલું નોંધો:',
      location: 'સ્થાન', notes: 'નોંધ (વૈકલ્પિક)', recordBtn: 'નોંધો', recordingBtn: 'નોંધી રહ્યા છીએ…', onBlockchain: 'બ્લોકચેન પર',
      fullHistory: '✅ સંપૂર્ણ ટ્રેસેબિલિટી ઇતિહાસ નોંધાયો — બેચ ગ્રાહક વિતરણ સુધી પહોંચ્યો છે.',
    },
    qrPage: {
      title: 'ક્યુઆર કોડ', backToBatches: '← બેચ પર પાછા જાઓ', noQr: 'આ બેચ માટે કોઈ ક્યુઆર કોડ સંગ્રહાયેલ નથી.',
      download: 'ક્યુઆર ડાઉનલોડ કરો', print: 'ક્યુઆર પ્રિન્ટ કરો', attachNote: 'આ ક્યુઆર કોડ મધના પેકેજ પર લગાવો. ગ્રાહકો ચકાસાયેલ યાત્રા જોવા માટે તેને સ્કેન કરે છે.',
    },
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('honeychain_lang') || 'en');

  function changeLang(newLang) {
    localStorage.setItem('honeychain_lang', newLang);
    setLang(newLang);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t: TRANSLATIONS[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
