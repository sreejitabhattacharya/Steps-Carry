import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';

// Firebase config — .env theke newa (VITE_ prefix lagbe)
// Jodi .env e set na thake, default values use hobe (existing project er jonno)
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || "AIzaSyA8apwCgS2f3ZnqB5AvA5gI1qgF6nxY0PQ",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || "stepsandcarry.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || "stepsandcarry",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || "stepsandcarry.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| "294226720513",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || "1:294226720513:web:891c194ba67a6ac72a8d00",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = async () => {
  try {
    // Try popup first
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    // If popup blocked, use redirect (page will reload — caller must handle via getRedirectResult)
    if (err.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, googleProvider);
      return null; // Page will redirect, so this won't be reached
    }
    // User closed popup — treat as cancelled (don't throw)
    if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
      return null;
    }
    throw err;
  }
};

export const signOutUser = () => signOut(auth);
