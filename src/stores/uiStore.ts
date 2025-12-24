// ============================================
// UI Store - Toast Notifications & Modals
// ============================================

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Toast, ToastType, ModalConfig } from '../types';

interface UIState {
    // Toast State
    toasts: Toast[];

    // Modal State
    modal: ModalConfig;

    // Loading State
    isLoading: boolean;
    loadingMessage: string;

    // Sidebar State
    isSidebarOpen: boolean;

    // Toast Actions
    showToast: (type: ToastType, message: string, duration?: number) => void;
    removeToast: (id: string) => void;
    clearAllToasts: () => void;

    // Modal Actions
    showModal: (config: Omit<ModalConfig, 'isOpen'>) => void;
    hideModal: () => void;

    // Loading Actions
    setLoading: (isLoading: boolean, message?: string) => void;

    // Sidebar Actions
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
    // Initial State
    toasts: [],
    modal: {
        isOpen: false,
        title: '',
        message: '',
    },
    isLoading: false,
    loadingMessage: '',
    isSidebarOpen: true,

    // Toast Actions
    showToast: (type: ToastType, message: string, duration = 5000) => {
        const id = uuidv4();
        const toast: Toast = { id, type, message, duration };

        set((state) => ({ toasts: [...state.toasts, toast] }));

        // Auto-remove toast after duration
        if (duration > 0) {
            setTimeout(() => {
                get().removeToast(id);
            }, duration);
        }
    },

    removeToast: (id: string) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },

    clearAllToasts: () => {
        set({ toasts: [] });
    },

    // Modal Actions
    showModal: (config: Omit<ModalConfig, 'isOpen'>) => {
        set({
            modal: { ...config, isOpen: true },
        });
    },

    hideModal: () => {
        set({
            modal: { ...get().modal, isOpen: false },
        });
    },

    // Loading Actions
    setLoading: (isLoading: boolean, message = 'Loading...') => {
        set({ isLoading, loadingMessage: message });
    },

    // Sidebar Actions
    toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
    },

    setSidebarOpen: (isOpen: boolean) => {
        set({ isSidebarOpen: isOpen });
    },
}));
