import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';

// Firebase config — .env theke newa (VITE_ prefix lagbe)
// Jodi .env e set na thake, default values use hobe (existing project er jonno)
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || "AIzaSyCfDRb68_kf7O56lFVtE5sWt4SFsMytFtg",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || "steps-and-carry.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || "steps-and-carry",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || "steps-and-carry.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| "355034826527",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || "1:355034826527:web:232ef939641f5843fdd22a",
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
