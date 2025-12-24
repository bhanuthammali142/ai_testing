// ============================================
// Authentication Store - Admin Authentication
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    isAuthenticated: boolean;
    currentTestId: string | null;
    adminPassword: string | null;

    // Actions
    login: (testId: string, password: string) => boolean;
    logout: () => void;
    changePassword: (oldPassword: string, newPassword: string) => boolean;
}

// Mock admin passwords for each test
const testPasswords: Record<string, string> = {
    'test-001': 'admin123',
    'test-002': 'admin456',
    'test-003': 'admin789',
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            currentTestId: null,
            adminPassword: null,

            login: (testId: string, password: string) => {
                // Check if password matches
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
                set({
                    isAuthenticated: false,
                    currentTestId: null,
                    adminPassword: null,
                });
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
            name: 'testexam-auth',
        }
    )
);
