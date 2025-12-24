// ============================================
// Exam Entry Page - Candidate Registration
// ============================================

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    GraduationCap,
    Clock,
    FileQuestion,
    AlertCircle,
    ArrowRight,
    Lock,
    User,
    IdCard,
    Mail,
    Shield
} from 'lucide-react';
import { useTestStore, useAttemptStore, useUIStore } from '../../stores';
import { Candidate } from '../../types';

const ExamEntryPage: React.FC = () => {
    // 1. Get query params
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();

    // 2. Global Stores
    const { tests, setCurrentTest, getQuestionsForTest } = useTestStore();
    const { startAttempt, getAttemptsForTest, setCurrentAttempt } = useAttemptStore();
    const { showToast } = useUIStore();

    // 3. Derived State (Reactive to store changes)
    const test = useMemo(() => {
        if (!testId) return null;
        return tests.find(t => t.id === testId || t.urlAlias === testId);
    }, [tests, testId]);

    const questions = useMemo(() => {
        if (!test) return [];
        return getQuestionsForTest(test.id);
    }, [test, getQuestionsForTest]);

    // 4. Local State
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        studentId: '',
        passcode: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // 5. Side Effects
    // Set current test when identified
    useEffect(() => {
        if (test) {
            setCurrentTest(test);
        }
    }, [test, setCurrentTest]);

    // 6. Loading / Error States
    if (!test) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
                <div className="glass-card p-8 max-w-md text-center animate-fade-in">
                    <AlertCircle className="w-16 h-16 text-danger-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Test Not Found</h2>
                    <p className="text-slate-400 mb-6">
                        We couldn't find the test you're looking for. It may have been removed or the link is incorrect.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="gradient-button px-6"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    if (test.status === 'closed' || test.status === 'draft') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
                <div className="glass-card p-8 max-w-md text-center animate-fade-in">
                    <Lock className="w-16 h-16 text-warning-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Test Unavailable</h2>
                    <p className="text-slate-400 mb-6">
                        This test is currently <strong>{test.status}</strong> and not accepting new attempts.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="gradient-button px-6"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    const settings = test.settings;

    // 7. Handlers
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (settings.accessControl.requireName && !formData.name.trim()) {
            newErrors.name = 'Full name is required';
        }

        if (settings.accessControl.requireStudentId && !formData.studentId.trim()) {
            newErrors.studentId = 'Student/Employee ID is required';
        }

        if (settings.accessControl.accessType === 'passcode') {
            if (!formData.passcode.trim()) {
                newErrors.passcode = 'Passcode is required';
            } else if (formData.passcode !== settings.accessControl.passcode) {
                newErrors.passcode = 'Incorrect passcode';
            }
        }

        if (settings.accessControl.accessType === 'email') {
            if (!formData.email.trim()) {
                newErrors.email = 'Email is required';
            } else if (!settings.accessControl.allowedEmails?.includes(formData.email.toLowerCase())) {
                newErrors.email = 'This email is not authorized for this exam';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleStartExam = async () => {
        if (!validateForm()) return;

        // Check attempt limit
        if (settings.accessControl.attemptLimit) {
            const existingAttempts = getAttemptsForTest(test.id);
            const userAttempts = existingAttempts.filter(
                a =>
                    (formData.email && a.candidate.email === formData.email) ||
                    (formData.name && a.candidate.name === formData.name) ||
                    (formData.studentId && a.candidate.studentId === formData.studentId)
            );

            if (userAttempts.length >= settings.accessControl.attemptLimit) {
                showToast('error', `You have reached the maximum attempt limit (${settings.accessControl.attemptLimit})`);
                return;
            }
        }

        setIsLoading(true);

        try {
            // Create candidate profile
            const candidate: Candidate = {
                id: `candidate-${Date.now()}`,
                name: formData.name || undefined,
                email: formData.email || undefined,
                studentId: formData.studentId || undefined,
            };

            // Initialize attempt
            const attempt = startAttempt(test.id, candidate, questions);
            setCurrentAttempt(attempt);

            showToast('success', 'Exam started successfully. Good luck!');
            // Redirect to exam interface
            navigate('/exam/take');
        } catch (error) {
            console.error('Failed to start exam:', error);
            showToast('error', 'Failed to start exam. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 pt-20 bg-slate-900">
            <div className="w-full max-w-xl animate-slide-up">

                {/* Header Card */}
                <div className="glass-card p-8 mb-6 relative overflow-hidden">
                    {/* Background accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl -mr-16 -mt-16" />

                    <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-900/20">
                            <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">{test.name}</h1>
                            <p className="text-slate-400 text-sm">Online Examination Portal</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                        <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs uppercase tracking-wider font-semibold">
                                <FileQuestion className="w-4 h-4" />
                                <span>Questions</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{questions.length}</p>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs uppercase tracking-wider font-semibold">
                                <Clock className="w-4 h-4" />
                                <span>Duration</span>
                            </div>
                            <p className="text-2xl font-bold text-white">
                                {settings.accessControl.timeLimitMinutes
                                    ? `${settings.accessControl.timeLimitMinutes} min`
                                    : 'Unlimited'}
                            </p>
                        </div>
                    </div>

                    {settings.antiCheating.showTechnicalDisclosure && (
                        <div className="p-4 bg-warning-500/10 border border-warning-500/20 rounded-xl relative z-10">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-warning-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-warning-400 font-bold text-sm mb-1">Proctored Session</p>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        This exam is monitored. Tab switches and clipboard actions will be tracked.
                                        Right-click and printing are disabled.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Entry Form */}
                <div className="glass-card p-8">
                    <h2 className="text-lg font-bold text-white mb-6">Enter Your Details</h2>

                    <form onSubmit={(e) => { e.preventDefault(); handleStartExam(); }} className="space-y-5">
                        {settings.accessControl.requireName && (
                            <div className="form-group">
                                <label className="input-label flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Full Name <span className="text-danger-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`input-field ${errors.name ? 'border-danger-500 focus:border-danger-500' : ''}`}
                                    placeholder="Jane Doe"
                                    autoFocus
                                />
                                {errors.name && <p className="text-xs text-danger-400 mt-1 ml-1">{errors.name}</p>}
                            </div>
                        )}

                        {settings.accessControl.requireStudentId && (
                            <div className="form-group">
                                <label className="input-label flex items-center gap-2">
                                    <IdCard className="w-4 h-4" />
                                    Student / Employee ID <span className="text-danger-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.studentId}
                                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                    className={`input-field ${errors.studentId ? 'border-danger-500 focus:border-danger-500' : ''}`}
                                    placeholder="Enter your ID"
                                />
                                {errors.studentId && <p className="text-xs text-danger-400 mt-1 ml-1">{errors.studentId}</p>}
                            </div>
                        )}

                        {settings.accessControl.accessType === 'email' && (
                            <div className="form-group">
                                <label className="input-label flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email Address <span className="text-danger-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                                    className={`input-field ${errors.email ? 'border-danger-500 focus:border-danger-500' : ''}`}
                                    placeholder="applicant@example.com"
                                />
                                {errors.email && <p className="text-xs text-danger-400 mt-1 ml-1">{errors.email}</p>}
                            </div>
                        )}

                        {settings.accessControl.accessType === 'passcode' && (
                            <div className="form-group">
                                <label className="input-label flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    Exam Passcode <span className="text-danger-400">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={formData.passcode}
                                    onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                                    className={`input-field ${errors.passcode ? 'border-danger-500 focus:border-danger-500' : ''}`}
                                    placeholder="••••••••"
                                />
                                {errors.passcode && <p className="text-xs text-danger-400 mt-1 ml-1">{errors.passcode}</p>}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full gradient-button flex items-center justify-center gap-2 py-3 mt-4 text-base font-semibold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all ${isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:scale-[1.02]'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Preparing Exam...</span>
                                </>
                            ) : (
                                <>
                                    <span>Start Exam</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {settings.accessControl.attemptLimit && (
                        <p className="text-center text-xs text-slate-500 mt-6">
                            Maximum {settings.accessControl.attemptLimit} attempt(s) allowed per candidate
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExamEntryPage;
