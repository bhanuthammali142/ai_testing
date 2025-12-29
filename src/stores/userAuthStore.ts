// ============================================
// User Authentication Store - Google OAuth + Email/Password
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import { AuthUser, UserRole } from '../types/auth';

// Default admin emails - fallback if Firestore collection is empty
const DEFAULT_ADMIN_EMAILS = [
    'bhanuthammali26012@gmail.com',
    'admin@testexam.com'
];

// Cache for admin emails
let cachedAdminEmails: string[] | null = null;

interface UserAuthState {
    // State
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;

    // Legacy support for existing admin auth (will be removed)
    currentTestId: string | null;
    adminPassword: string | null;

    // Actions
    signInWithGoogle: () => Promise<boolean>;
    signOutUser: () => Promise<void>;
    initializeAuth: () => void;
    setUser: (user: AuthUser | null) => void;
    refreshUser: () => Promise<void>;
    clearError: () => void;
    loadAdminEmails: () => Promise<string[]>;
    isAdminEmail: (email: string) => Promise<boolean>;

    // Legacy actions (for backward compatibility)
    login: (testId: string, password: string) => boolean;
    logout: () => void;
    changePassword: (oldPassword: string, newPassword: string) => boolean;
}

// Mock admin passwords for legacy auth (for backward compatibility)
const testPasswords: Record<string, string> = {
    'test-001': 'admin123',
    'test-002': 'admin456',
    'test-003': 'admin789',
};

export const useUserAuthStore = create<UserAuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isLoading: true,
            isAuthenticated: false,
            error: null,
            currentTestId: null,
            adminPassword: null,

            // Load admin emails from Firestore
            loadAdminEmails: async () => {
                if (cachedAdminEmails) return cachedAdminEmails;

                try {
                    const adminEmailsRef = collection(db, 'admin_emails');
                    const snapshot = await getDocs(adminEmailsRef);

                    if (snapshot.empty) {
                        // Initialize with default emails if collection is empty
                        cachedAdminEmails = DEFAULT_ADMIN_EMAILS;
                        return cachedAdminEmails;
                    }

                    cachedAdminEmails = snapshot.docs.map(doc => doc.data().email?.toLowerCase() || '').filter(Boolean);
                    return cachedAdminEmails;
                } catch (error) {
                    console.error('Error loading admin emails:', error);
                    cachedAdminEmails = DEFAULT_ADMIN_EMAILS;
                    return cachedAdminEmails;
                }
            },

            // Check if email is admin
            isAdminEmail: async (email: string) => {
                const adminEmails = await get().loadAdminEmails();
                return adminEmails.includes(email.toLowerCase());
            },

            signInWithGoogle: async () => {
                set({ isLoading: true, error: null });
                try {
                    const result = await signInWithPopup(auth, googleProvider);
                    const firebaseUser = result.user;

                    if (!firebaseUser.email) {
                        throw new Error('Email is required');
                    }

                    // Check if user exists in Firestore
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    let authUser: AuthUser;

                    if (userDoc.exists()) {
                        // Existing user - get their role from Firestore
                        const userData = userDoc.data();
                        authUser = {
                            id: firebaseUser.uid,
                            name: userData.name || firebaseUser.displayName || 'User',
                            email: userData.email || firebaseUser.email,
                            role: userData.role as UserRole,
                            photoURL: userData.photoURL || firebaseUser.photoURL || undefined,
                            createdAt: userData.createdAt?.toDate() || new Date(),
                        };

                        // Update photoURL if it changed (for Google users)
                        if (firebaseUser.photoURL && userData.photoURL !== firebaseUser.photoURL) {
                            await setDoc(userDocRef, { photoURL: firebaseUser.photoURL }, { merge: true });
                            authUser.photoURL = firebaseUser.photoURL;
                        }
                    } else {
                        // New user - auto-register, check if admin
                        const isAdmin = await get().isAdminEmail(firebaseUser.email);
                        authUser = {
                            id: firebaseUser.uid,
                            name: firebaseUser.displayName || 'User',
                            email: firebaseUser.email,
                            role: isAdmin ? 'admin' : 'user',
                            photoURL: firebaseUser.photoURL || undefined,
                            createdAt: new Date(),
                        };

                        // Save to Firestore
                        await setDoc(userDocRef, {
                            name: authUser.name,
                            email: authUser.email,
                            role: authUser.role,
                            photoURL: authUser.photoURL,
                            emailVerified: true, // Google users are verified
                            createdAt: serverTimestamp(),
                        });
                    }

                    set({
                        user: authUser,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });

                    return true;
                } catch (error) {
                    const err = error as any;
                    console.error('Google sign-in error:', err);
                    set({
                        error: err.message || 'Failed to sign in with Google',
                        isLoading: false,
                        isAuthenticated: false,
                    });
                    return false;
                }
            },

            signOutUser: async () => {
                try {
                    await signOut(auth);
                    set({
                        user: null,
                        isAuthenticated: false,
                        currentTestId: null,
                        adminPassword: null,
                    });
                } catch (error) {
                    const err = error as any;
                    console.error('Sign out error:', err);
                    set({ error: err.message || 'Failed to sign out' });
                }
            },

            initializeAuth: () => {
                // Load admin emails cache
                get().loadAdminEmails();

                onAuthStateChanged(auth, async (firebaseUser: User | null) => {
                    if (firebaseUser && firebaseUser.email) {
                        try {
                            const userDocRef = doc(db, 'users', firebaseUser.uid);
                            const userDoc = await getDoc(userDocRef);

                            if (userDoc.exists()) {
                                const userData = userDoc.data();
                                const authUser: AuthUser = {
                                    id: firebaseUser.uid,
                                    name: userData.name || firebaseUser.displayName || 'User',
                                    email: userData.email || firebaseUser.email,
                                    role: userData.role as UserRole,
                                    photoURL: userData.photoURL || firebaseUser.photoURL || undefined,
                                    createdAt: userData.createdAt?.toDate() || new Date(),
                                };
                                set({
                                    user: authUser,
                                    isAuthenticated: true,
                                    isLoading: false,
                                });
                            } else {
                                // User exists in Firebase Auth but not in Firestore
                                // Auto-create user document
                                const isAdmin = await get().isAdminEmail(firebaseUser.email);
                                const authUser: AuthUser = {
                                    id: firebaseUser.uid,
                                    name: firebaseUser.displayName || 'User',
                                    email: firebaseUser.email,
                                    role: isAdmin ? 'admin' : 'user',
                                    photoURL: firebaseUser.photoURL || undefined,
                                    createdAt: new Date(),
                                };

                                await setDoc(userDocRef, {
                                    name: authUser.name,
                                    email: authUser.email,
                                    role: authUser.role,
                                    photoURL: authUser.photoURL,
                                    createdAt: serverTimestamp(),
                                });

                                set({
                                    user: authUser,
                                    isAuthenticated: true,
                                    isLoading: false,
                                });
                            }
                        } catch (_error) {
                            console.error('Auth state change error:', _error);
                            set({ isLoading: false, isAuthenticated: false });
                        }
                    } else {
                        set({ user: null, isAuthenticated: false, isLoading: false });
                    }
                });
            },

            setUser: (user: AuthUser | null) => {
                set({ user, isAuthenticated: !!user });
            },

            refreshUser: async () => {
                const { user } = get();
                if (!user) return;

                try {
                    const userDocRef = doc(db, 'users', user.id);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const updatedUser: AuthUser = {
                            id: user.id,
                            name: userData.name || user.name,
                            email: userData.email || user.email,
                            role: userData.role as UserRole,
                            photoURL: userData.photoURL || user.photoURL,
                            createdAt: userData.createdAt?.toDate() || user.createdAt,
                        };
                        set({ user: updatedUser });
                    }
                } catch (error) {
                    console.error('Failed to refresh user:', error);
                }
            },

            clearError: () => set({ error: null }),

            // Legacy support for existing admin auth
            login: (testId: string, password: string) => {
                const storedPassword = testPasswords[testId] || password;
                if (password === storedPassword || password === testPasswords[testId]) {
                    set({
                        isAuthenticated: true,
                        currentTestId: testId,
                        adminPassword: password,
                    });
                    return true;
                }
                return false;
            },

            logout: () => {
                get().signOutUser();
            },

            changePassword: (oldPassword: string, newPassword: string) => {
                const { currentTestId, adminPassword } = get();
                if (currentTestId && (oldPassword === adminPassword || oldPassword === testPasswords[currentTestId])) {
                    testPasswords[currentTestId] = newPassword;
                    set({ adminPassword: newPassword });
                    return true;
                }
                return false;
            },
        }),
        {
            name: 'testexam-user-auth',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                currentTestId: state.currentTestId,
                adminPassword: state.adminPassword,
            }),
        }
    )
);
