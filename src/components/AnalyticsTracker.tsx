import React, { useEffect, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  doc, 
  setDoc, 
  serverTimestamp, 
  onSnapshot,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const AnalyticsTracker: React.FC = () => {
  const sessionId = useRef(uuidv4());
  const heartbeatInterval = useRef<any>(null);

  useEffect(() => {
    const trackSession = async () => {
      const sessionRef = doc(db, 'sessions', sessionId.current);
      
      try {
        await setDoc(sessionRef, {
          userId: auth.currentUser?.uid || 'anonymous',
          startTime: serverTimestamp(),
          lastActive: serverTimestamp(),
          deviceInfo: navigator.userAgent,
          isOnline: true
        });

        // Start heartbeat to keep session "alive"
        heartbeatInterval.current = setInterval(async () => {
          try {
            await setDoc(sessionRef, {
              lastActive: serverTimestamp(),
              userId: auth.currentUser?.uid || 'anonymous',
            }, { merge: true });
          } catch (e) {
            console.error("Session heartbeat failed:", e);
          }
        }, 60000); // Every 1 minute

      } catch (error) {
        console.error("Analytics session creation failed:", error);
      }
    };

    trackSession();

    // Set offline on unmount/tab close
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        const sessionRef = doc(db, 'sessions', sessionId.current);
        await setDoc(sessionRef, { isOnline: false }, { merge: true });
      } else {
        const sessionRef = doc(db, 'sessions', sessionId.current);
        await setDoc(sessionRef, { isOnline: true }, { merge: true });
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Cleanup: try to set offline immediately
      const sessionRef = doc(db, 'sessions', sessionId.current);
      setDoc(sessionRef, { isOnline: false, lastActive: serverTimestamp() }, { merge: true });
    };
  }, []);

  return null; // Invisible component
};

export default AnalyticsTracker;
