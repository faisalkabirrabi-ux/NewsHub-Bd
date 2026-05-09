import { initializeApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, indexedDBLocalPersistence } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDocFromServer } from 'firebase/firestore';
import localFirebaseConfig from '../../firebase-applet-config.json';

// Use environment variables if available (for Vercel), otherwise fall back to local config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || localFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || localFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || localFirebaseConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || localFirebaseConfig.measurementId
};

const databaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || localFirebaseConfig.firestoreDatabaseId;

const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistent local cache for offline access and forced long polling for reliability
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  experimentalForceLongPolling: true
}, databaseId);

// Use robust persistence for Auth to survive WebView reloads and handle network issues better
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence]
});

async function testConnection() {
  try {
    // Debug info for the user to help them diagnose config issues on Vercel
    console.log("Firestore target database:", databaseId || "(default)");
    console.log("Firebase Project ID:", firebaseConfig.projectId);
    
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connected successfully");
    if (typeof window !== 'undefined') (window as any).firebaseStatus = 'connected';
  } catch (error: any) {
    if (typeof window !== 'undefined') (window as any).firebaseStatus = 'error: ' + error.message;
    // If we're offline or blocked, provide a clearer hint
    if (error.code === 'failed-precondition') {
      console.warn("Firestore: Multiple tabs might be conflicting with persistence.");
    } else if (error.message?.includes('Cloud Firestore backend')) {
      console.error("Firestore connectivity issue detected. Trying auto-recovery...");
    }
    console.log("Connection test finished:", error.message || "Unknown state");
  }
}
testConnection();
