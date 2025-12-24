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
    DashboardPage,
    QuestionsPage,
    QuestionBankPage,
    SettingsPage,
    PublishPage,
    ResultsPage
} from './pages/admin';
import {
    ExamEntryPage,
    ExamTakePage,
    ExamSubmittedPage
} from './pages/exam';

// Stores
import { useAuthStore, useTestStore } from './stores';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, currentTestId } = useAuthStore();
    const { tests, setCurrentTest } = useTestStore();

    useEffect(() => {
        if (isAuthenticated && currentTestId) {
            const test = tests.find(t => t.id === currentTestId);
            if (test) {
                setCurrentTest(test);
            }
        }
    }, [isAuthenticated, currentTestId, tests, setCurrentTest]);

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
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
            {/* Global Components */}
            <Toast />
            <Modal />

            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />

                {/* Admin Routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="questions" element={<QuestionsPage />} />
                    <Route path="question-bank" element={<QuestionBankPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="publish" element={<PublishPage />} />
                    <Route path="results" element={<ResultsPage />} />
                </Route>

                {/* Exam Routes */}
                <Route path="/test/:testId" element={<ExamEntryPage />} />
                <Route path="/exam" element={<ExamLayout />}>
                    <Route path="take" element={<ExamTakePage />} />
                    <Route path="submitted" element={<ExamSubmittedPage />} />
                </Route>

                {/* 404 Fallback */}
                <Route
                    path="*"
                    element={
                        <div className="min-h-screen flex items-center justify-center">
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
        </Router>
    );
};

export default App;
