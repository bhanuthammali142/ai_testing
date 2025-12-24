// ============================================
// Admin Dashboard - Checklist Style UI
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Settings,
    FileQuestion,
    Share2,
    BarChart3,
    CheckCircle,
    Circle,
    Copy,
    Key,
    Trash2,
    ArrowRight,
    Sparkles,
    Clock,
    Users,
    Database
} from 'lucide-react';
import { useTestStore, useAttemptStore, useAuthStore, useUIStore } from '../../stores';

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentTest, cloneTest, getQuestionsForTest } = useTestStore();
    const { getAttemptsForTest, clearResultsForTest } = useAttemptStore();
    const authStore = useAuthStore();
    const { showToast, showModal } = useUIStore();

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showCloneModal, setShowCloneModal] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [cloneName, setCloneName] = useState('');

    if (!currentTest) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-400">No test selected. Please create or access a test first.</p>
            </div>
        );
    }

    const questions = getQuestionsForTest(currentTest.id);
    const attempts = getAttemptsForTest(currentTest.id);

    // Determine step completion
    const steps = [
        {
            id: 1,
            title: 'Adjust Settings',
            description: 'Configure test behavior, access control, and anti-cheating measures',
            icon: Settings,
            path: '/admin/settings',
            completed: currentTest.settings.accessControl.timeLimitMinutes !== null ||
                currentTest.settings.accessControl.accessType !== 'public',
        },
        {
            id: 2,
            title: 'Edit Questions',
            description: `Add questions manually or generate with AI (${questions.length} questions added)`,
            icon: FileQuestion,
            path: '/admin/questions',
            completed: questions.length > 0,
        },
        {
            id: 3,
            title: 'Publish & Distribute',
            description: 'Set test status and share the URL with candidates',
            icon: Share2,
            path: '/admin/publish',
            completed: currentTest.status === 'open' || currentTest.status === 'scheduled',
        },
        {
            id: 4,
            title: 'View Results',
            description: `Analyze responses and export data (${attempts.length} attempts)`,
            icon: BarChart3,
            path: '/admin/results',
            completed: attempts.length > 0,
        },
    ];

    const handleCloneTest = () => {
        if (!cloneName.trim()) {
            showToast('error', 'Please enter a name for the cloned test');
            return;
        }
        const cloned = cloneTest(currentTest.id, cloneName);
        if (cloned) {
            showToast('success', 'Test cloned successfully!');
            setShowCloneModal(false);
            setCloneName('');
        }
    };

    const handleChangePassword = () => {
        if (!oldPassword || !newPassword) {
            showToast('error', 'Please fill in both password fields');
            return;
        }
        if (authStore.changePassword(oldPassword, newPassword)) {
            showToast('success', 'Password changed successfully!');
            setShowPasswordModal(false);
            setOldPassword('');
            setNewPassword('');
        } else {
            showToast('error', 'Current password is incorrect');
        }
    };

    const handleClearResults = () => {
        showModal({
            title: 'Clear All Results?',
            message: 'This will permanently delete all attempt data for this test. This action cannot be undone.',
            type: 'warning',
            confirmText: 'Clear Results',
            cancelText: 'Cancel',
            onConfirm: () => {
                clearResultsForTest(currentTest.id);
                showToast('success', 'All results have been cleared');
            },
        });
    };

    const copyTestLink = () => {
        const link = `${window.location.origin}/test/${currentTest.urlAlias || currentTest.id}`;
        navigator.clipboard.writeText(link);
        showToast('success', 'Test link copied to clipboard!');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            {/* Welcome Section */}
            <div className="glass-card p-8 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-full blur-3xl" />

                <div className="relative">
                    <h1 className="text-3xl font-bold font-display text-white mb-2">
                        Welcome to {currentTest.name}
                    </h1>
                    <p className="text-slate-400">
                        Follow the steps below to set up and launch your test
                    </p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <FileQuestion className="w-4 h-4" />
                                <span className="text-sm">Questions</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{questions.length}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <Users className="w-4 h-4" />
                                <span className="text-sm">Attempts</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{attempts.length}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">Time Limit</span>
                            </div>
                            <p className="text-2xl font-bold text-white">
                                {currentTest.settings.accessControl.timeLimitMinutes || '∞'}
                                <span className="text-sm text-slate-400 ml-1">min</span>
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm">Status</span>
                            </div>
                            <span className={`
                badge capitalize
                ${currentTest.status === 'open' ? 'badge-success' :
                                    currentTest.status === 'closed' ? 'badge-danger' :
                                        currentTest.status === 'scheduled' ? 'badge-warning' : 'badge-primary'}
              `}>
                                {currentTest.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Steps Checklist */}
            <div className="space-y-4">
                <h2 className="section-title">Setup Checklist</h2>

                <div className="space-y-3">
                    {steps.map((step) => (
                        <button
                            key={step.id}
                            onClick={() => navigate(step.path)}
                            className="w-full step-card flex items-center gap-4 text-left"
                        >
                            {/* Completion indicator */}
                            <div className={`
                  flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
                  ${step.completed
                                    ? 'bg-success-500/20 border border-success-500/30'
                                    : 'bg-white/5 border border-white/10'
                                }
                `}>
                                {step.completed ? (
                                    <CheckCircle className="w-6 h-6 text-success-400" />
                                ) : (
                                    <Circle className="w-6 h-6 text-slate-500" />
                                )}
                            </div>

                            {/* Step info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-primary-400 font-medium">Step {step.id}</span>
                                    {step.completed && (
                                        <span className="badge-success text-xs">Completed</span>
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-white mt-1">{step.title}</h3>
                                <p className="text-sm text-slate-400 truncate">{step.description}</p>
                            </div>

                            {/* Arrow */}
                            <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Utilities Panel */}
            <div className="glass-card p-6">
                <h2 className="card-title mb-4">Utilities</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Clone Test */}
                    <button
                        onClick={() => setShowCloneModal(true)}
                        className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left"
                    >
                        <Copy className="w-5 h-5 text-primary-400 mb-2" />
                        <p className="text-white font-medium">Clone Test</p>
                        <p className="text-xs text-slate-400">Create a copy</p>
                    </button>

                    {/* Share Test */}
                    <button
                        onClick={copyTestLink}
                        className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left"
                    >
                        <Share2 className="w-5 h-5 text-accent-400 mb-2" />
                        <p className="text-white font-medium">Share Test</p>
                        <p className="text-xs text-slate-400">Copy link</p>
                    </button>

                    {/* Clear Results */}
                    <button
                        onClick={handleClearResults}
                        className="p-4 bg-white/5 hover:bg-danger-500/10 rounded-xl transition-colors text-left group"
                    >
                        <Trash2 className="w-5 h-5 text-danger-400 mb-2" />
                        <p className="text-white font-medium">Clear Results</p>
                        <p className="text-xs text-slate-400">Delete all attempts</p>
                    </button>

                    {/* Change Password */}
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left"
                    >
                        <Key className="w-5 h-5 text-warning-400 mb-2" />
                        <p className="text-white font-medium">Change Password</p>
                        <p className="text-xs text-slate-400">Update admin access</p>
                    </button>

                    {/* Question Bank */}
                    <button
                        onClick={() => navigate('/admin/question-bank')}
                        className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left"
                    >
                        <Database className="w-5 h-5 text-emerald-400 mb-2" />
                        <p className="text-white font-medium">Question Bank</p>
                        <p className="text-xs text-slate-400">Upload CSV questions</p>
                    </button>
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                    <div className="glass-card p-8 max-w-md w-full animate-scale-in">
                        <h3 className="text-xl font-bold text-white mb-6">Change Admin Password</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="input-label">Current Password</label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="input-field"
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div>
                                <label className="input-label">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="input-field"
                                    placeholder="Enter new password"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="flex-1 gradient-button-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                className="flex-1 gradient-button"
                            >
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Clone Test Modal */}
            {showCloneModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                    <div className="glass-card p-8 max-w-md w-full animate-scale-in">
                        <h3 className="text-xl font-bold text-white mb-6">Clone Test</h3>

                        <div>
                            <label className="input-label">New Test Name</label>
                            <input
                                type="text"
                                value={cloneName}
                                onChange={(e) => setCloneName(e.target.value)}
                                className="input-field"
                                placeholder={`${currentTest.name} (Copy)`}
                            />
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => setShowCloneModal(false)}
                                className="flex-1 gradient-button-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCloneTest}
                                className="flex-1 gradient-button"
                            >
                                Clone Test
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
