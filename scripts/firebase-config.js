// ═══════════════════════════════════════════════════════════════════════════════
// Nexus Helper — Firebase Configuration
// Shared with the Nexus Docs platform (postman-docs-viewer)
// ═══════════════════════════════════════════════════════════════════════════════

const NEXUS_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyD2c2IX8q3KtZiqVz-VmFZ0ejVyVUzGCXk',
  projectId: 'rabies-10776',
  authDomain: 'rabies-10776.firebaseapp.com',
  // Google OAuth Client ID — find it in Firebase Console:
  // Authentication → Sign-in method → Google → Web SDK configuration → Web client ID
  googleClientId: '447734176000-t8q3bpgbba3o3tpfjrr0hc55fu6s6v34.apps.googleusercontent.com',
};

// Firestore collection name (must match your postman-docs-viewer project)
const NEXUS_FIRESTORE_COLLECTION = 'published_docs';
const NEXUS_FIRESTORE_CHUNKS = 'chunks';
