// ============================================
// User Management Store - For Admin
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthUser, UserRole } from '../types/auth';

interface UserManagementState {
    users: AuthUser[];
    isLoading: boolean;
    error: string | null;

    // Actions
    loadUsers: () => Promise<void>;
    updateUserRole: (userId: string, role: UserRole) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    getUsersByRole: (role: UserRole) => AuthUser[];
    getAllStudents: () => AuthUser[];
    getUserById: (userId: string) => AuthUser | undefined;
}

export const useUserManagementStore = create<UserManagementState>()(
    persist(
        (set, get) => ({
            users: [],
            isLoading: false,
            error: null,

            loadUsers: async () => {
                set({ isLoading: true, error: null });
                try {
                    const querySnapshot = await getDocs(collection(db, 'users'));
                    const loadedUsers: AuthUser[] = [];

                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        loadedUsers.push({
                            id: doc.id,
                            name: data.name || 'Unknown',
                            email: data.email || '',
                            role: data.role as UserRole || 'user',
                            photoURL: data.photoURL,
                            createdAt: data.createdAt instanceof Timestamp
                                ? data.createdAt.toDate()
                                : new Date(data.createdAt),
                        });
                    });

                    set({ users: loadedUsers, isLoading: false });
                } catch (error: any) {
                    console.error('Failed to load users:', error);
                    set({ error: error.message, isLoading: false });
                }
            },

            updateUserRole: async (userId: string, role: UserRole) => {
                try {
                    const docRef = doc(db, 'users', userId);
                    await updateDoc(docRef, { role });

                    const { users } = get();
                    set({
                        users: users.map(u =>
                            u.id === userId ? { ...u, role } : u
                        ),
                    });
                } catch (error: any) {
                    console.error('Failed to update user role:', error);
                    set({ error: error.message });
                }
            },

            deleteUser: async (userId: string) => {
                try {
                    const docRef = doc(db, 'users', userId);
                    await deleteDoc(docRef);

                    const { users } = get();
                    set({ users: users.filter(u => u.id !== userId) });
                } catch (error: any) {
                    console.error('Failed to delete user:', error);
                    set({ error: error.message });
                }
            },

            getUsersByRole: (role: UserRole) => {
                return get().users.filter(u => u.role === role);
            },

            getAllStudents: () => {
                return get().users.filter(u => u.role === 'user');
            },

            getUserById: (userId: string) => {
                return get().users.find(u => u.id === userId);
            },
        }),
        {
            name: 'testexam-user-management',
        }
    )
);
