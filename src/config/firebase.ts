// ============================================
// Firebase Configuration
// ============================================

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDqekx0Ujt7R0X1kCGb1FS-X7gI5g9DFN4",
    authDomain: "test-exam-a0db0.firebaseapp.com",
    projectId: "test-exam-a0db0",
    storageBucket: "test-exam-a0db0.firebasestorage.app",
    messagingSenderId: "253032575652",
    appId: "1:253032575652:web:195518d1f1a1d8205d2c31",
    measurementId: "G-08WNNMCN07"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Initialize Analytics (only in browser)
export const initAnalytics = async () => {
    if (await isSupported()) {
        return getAnalytics(app);
    }
    return null;
};

export default app;
