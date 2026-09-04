import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCx3ZPbpuw073a3HYdHq-lBv0Pc6B2wTzI",
  authDomain: "naz-a-i.firebaseapp.com",
  projectId: "naz-a-i",
  storageBucket: "naz-a-i.firebasestorage.app",
  messagingSenderId: "853721313971",
  appId: "1:853721313971:web:7cfab38ce6d72df6b136c6",
  measurementId: "G-QZW290G8BL"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();
    return {
      idToken,
      user: {
        id: user.uid,
        username: user.displayName || user.email?.split('@')[0] || 'user',
        email: user.email,
        picture: user.photoURL,
      },
    };
  } catch (error: any) {
    console.error('❌ خطأ في Google Login:', error);
    throw error;
  }
}

export { auth };
