import { initializeApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, indexedDBLocalPersistence } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistent local cache for offline access and force long polling for better connectivity in some environments
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  experimentalForceLongPolling: true
}, firebaseConfig.firestoreDatabaseId);

// Use robust persistence for Auth to survive WebView reloads and handle network issues better
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence]
});

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connected successfully");
  } catch (error) {
    // If we're offline, this is expected if persistence is working
    console.log("Connection test finished (offline or online)");
  }
}
testConnection();
