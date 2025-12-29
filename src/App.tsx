// ============================================
// Main App Component with Routing
// ============================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { AdminLayout, ExamLayout } from './components/layout';

// Common Components
import { Toast, Modal } from './components/common';

// Pages
import HomePage from './pages/HomePage';
import {
    LoginPage,
    RegisterPage,
    VerifyEmailPage,
    CapturePhotoPage
} from './pages/auth';
import { StudentDashboard } from './pages/dashboard';
import {
    AdminDashboardPage,
    QuestionsPage,
    QuestionBankPage,
    SettingsPage,
    PublishPage,
    ResultsPage,
    AdminSettingsPage
} from './pages/admin';
import {
    ExamEntryPage,
    ExamTakePage,
    ExamSubmittedPage
} from './pages/exam';

// Stores
import { useUserAuthStore, useExamAssignmentStore } from './stores';

// Initialize Auth on App Load
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { initializeAuth } = useUserAuthStore();
    const { loadAssignments: loadExamAssignments } = useExamAssignmentStore();

    useEffect(() => {
        initializeAuth();
        loadExamAssignments();
    }, [initializeAuth, loadExamAssignments]);

    return <>{children}</>;
};

// Protected Route for Authenticated Users only
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading, user } = useUserAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                    <p className="text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

// Admin Only Route
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading, user } = useUserAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                    <p className="text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

// User Only Route (Student)
const UserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading, user } = useUserAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                    <p className="text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'user') {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
};

// Auth Redirect Component - Redirects authenticated users to their dashboard
const AuthRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading, user } = useUserAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                    <p className="text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated && user) {
        if (user.role === 'admin') {
            return <Navigate to="/admin" replace />;
        } else {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <>{children}</>;
};

// App Component
const App: React.FC = () => {
    // Prevent default browser behaviors globally for exam security
    useEffect(() => {
        // Disable drag and drop
        const handleDragDrop = (e: DragEvent) => {
            e.preventDefault();
        };

        document.addEventListener('dragover', handleDragDrop);
        document.addEventListener('drop', handleDragDrop);

        return () => {
            document.removeEventListener('dragover', handleDragDrop);
            document.removeEventListener('drop', handleDragDrop);
        };
    }, []);

    return (
        <Router>
            <AuthInitializer>
                {/* Global Components */}
                <Toast />
                <Modal />

                <Routes>
                    {/* Public Routes */}
                    <Route
                        path="/"
                        element={
                            <AuthRedirect>
                                <HomePage />
                            </AuthRedirect>
                        }
                    />

                    {/* Auth Routes */}
                    <Route
                        path="/login"
                        element={
                            <AuthRedirect>
                                <LoginPage />
                            </AuthRedirect>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <AuthRedirect>
                                <RegisterPage />
                            </AuthRedirect>
                        }
                    />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/capture-photo" element={<CapturePhotoPage />} />

                    {/* Student Dashboard - User Role Only */}
                    <Route
                        path="/dashboard"
                        element={
                            <UserRoute>
                                <StudentDashboard />
                            </UserRoute>
                        }
                    />

                    {/* Admin Routes - Admin Role Only */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminLayout />
                            </AdminRoute>
                        }
                    >
                        <Route index element={<AdminDashboardPage />} />
                        <Route path="dashboard" element={<AdminDashboardPage />} />
                        <Route path="questions" element={<QuestionsPage />} />
                        <Route path="question-bank" element={<QuestionBankPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="admin-settings" element={<AdminSettingsPage />} />
                        <Route path="publish" element={<PublishPage />} />
                        <Route path="results" element={<ResultsPage />} />
                    </Route>

                    {/* Exam Routes - Protected but accessible to both roles */}
                    <Route
                        path="/test/:testId"
                        element={
                            <ProtectedRoute>
                                <ExamEntryPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/exam"
                        element={
                            <ProtectedRoute>
                                <ExamLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="take" element={<ExamTakePage />} />
                        <Route path="submitted" element={<ExamSubmittedPage />} />
                    </Route>

                    {/* 404 Fallback */}
                    <Route
                        path="*"
                        element={
                            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                                <div className="text-center">
                                    <h1 className="text-6xl font-bold text-gradient mb-4">404</h1>
                                    <p className="text-slate-400 mb-6">Page not found</p>
                                    <a href="/" className="gradient-button">
                                        Go Home
                                    </a>
                                </div>
                            </div>
                        }
                    />
                </Routes>
            </AuthInitializer>
        </Router>
    );
};

export default App;
