// ============================================
// Exam Entry Page - Candidate Registration with Auth Check
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
    Shield,
    XCircle,
    Loader2
} from 'lucide-react';
import { useTestStore, useAttemptStore, useUIStore, useUserAuthStore, useExamAssignmentStore } from '../../stores';
import { Candidate, Test, Question } from '../../types';
import { testService, TestRecord } from '../../services/firebaseService';

const ExamEntryPage: React.FC = () => {
    // 1. Get query params
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();

    // 2. Global Stores
    const { setCurrentTest, setQuestionsForTest } = useTestStore();
    const { startAttempt, getAttemptsForTest, setCurrentAttempt } = useAttemptStore();
    const { showToast } = useUIStore();
    const { user, isAuthenticated } = useUserAuthStore();
    const {
        isExamAssignedToUser,
        hasUserAttemptedExam
    } = useExamAssignmentStore();

    // 3. Local State for Firebase-loaded test
    const [test, setTest] = useState<Test | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoadingTest, setIsLoadingTest] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        studentId: '',
        passcode: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // 4. Load test directly from Firebase
    useEffect(() => {
        const loadTestFromFirebase = async () => {
            if (!testId) {
                setLoadError('No test ID provided');
                setIsLoadingTest(false);
                return;
            }

            console.log('📥 Loading test from Firebase:', testId);
            setIsLoadingTest(true);
            setLoadError(null);

            try {
                // Fetch all tests from Firebase
                console.log('🔍 Calling testService.getAllTests()...');
                const firebaseTests = await testService.getAllTests();
                console.log('📊 Tests from Firebase:', firebaseTests.length, firebaseTests);

                if (firebaseTests.length === 0) {
                    console.log('⚠️ No tests found in Firebase');
                    setLoadError('No tests available. Please ask your instructor to publish the exam.');
                    setIsLoadingTest(false);
                    return;
                }

                // Find the test by ID or URL alias
                console.log('🔍 Looking for test with ID or alias:', testId);
                const foundTest = firebaseTests.find(
                    (t: TestRecord) => t.id === testId || t.urlAlias === testId
                );

                if (!foundTest) {
                    console.log('❌ Test not found. Available tests:', firebaseTests.map(t => ({ id: t.id, name: t.name, alias: t.urlAlias })));
                    setLoadError(`Test "${testId}" not found. Please check the link.`);
                    setIsLoadingTest(false);
                    return;
                }

                console.log('✅ Test found:', foundTest.name, foundTest);

                // Convert TestRecord to Test format
                const testData: Test = {
                    id: foundTest.id,
                    name: foundTest.name,
                    adminPassword: '',
                    status: foundTest.status as Test['status'],
                    settings: foundTest.settings,
                    urlAlias: foundTest.urlAlias,
                    scheduledStart: foundTest.scheduledStart,
                    scheduledEnd: foundTest.scheduledEnd,
                    createdAt: foundTest.createdAt,
                    updatedAt: foundTest.updatedAt,
                };

                setTest(testData);
                setCurrentTest(testData);

                // Load questions for this test
                console.log('📥 Loading questions for test:', foundTest.id);
                const testQuestions = await testService.getQuestionsForTest(foundTest.id);
                console.log('📋 Questions loaded:', testQuestions.length);

                const convertedQuestions: Question[] = testQuestions.map((q) => ({
                    id: q.id,
                    testId: q.testId,
                    type: q.type as Question['type'],
                    text: q.text,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    difficulty: q.difficulty as Question['difficulty'],
                    topic: q.topic,
                    points: q.points,
                    negativeMarking: q.negativeMarking,
                    order: q.order,
                    createdAt: q.createdAt,
                    updatedAt: q.updatedAt,
                }));

                // Store questions in local state for this component
                setQuestions(convertedQuestions);

                // Also sync to testStore so ExamTakePage can access them
                setQuestionsForTest(foundTest.id, convertedQuestions);

                setLoadError(null);
            } catch (error: any) {
                console.error('❌ Failed to load test:', error);
                const errorMessage = error?.message || error?.code || 'Unknown error';
                setLoadError(`Failed to load test: ${errorMessage}`);
            } finally {
                setIsLoadingTest(false);
            }
        };

        loadTestFromFirebase();
    }, [testId, setCurrentTest, setQuestionsForTest]);

    // Pre-fill form with user data
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
            }));
        }
    }, [user]);

    // Computed values
    const hasAccess = useMemo(() => {
        if (!user || !test) return false;
        if (user.role === 'admin') return true;
        // For open tests, all authenticated users have access
        if (test.status === 'open') return true;
        return isExamAssignedToUser(test.id, user.id);
    }, [user, test, isExamAssignedToUser]);

    const alreadyAttempted = useMemo(() => {
        if (!user || !test) return false;
        if (user.role === 'admin') return false;
        return hasUserAttemptedExam(test.id, user.id);
    }, [user, test, hasUserAttemptedExam]);

    // 6. Loading / Error States
    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
                <div className="glass-card p-8 max-w-md text-center animate-fade-in">
                    <Lock className="w-16 h-16 text-warning-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
                    <p className="text-slate-400 mb-6">
                        Please sign in with your Google account to access this exam.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="gradient-button px-6"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    // Show loading while fetching test from Firebase
    if (isLoadingTest) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
                <div className="glass-card p-8 max-w-md text-center animate-fade-in">
                    <Loader2 className="w-16 h-16 text-primary-400 mx-auto mb-4 animate-spin" />
                    <h2 className="text-2xl font-bold text-white mb-2">Loading Test...</h2>
                    <p className="text-slate-400">
                        Please wait while we load the exam details.
                    </p>
                </div>
            </div>
        );
    }

    // Show error if test not found
    if (loadError || !test) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
                <div className="glass-card p-8 max-w-md text-center animate-fade-in">
                    <AlertCircle className="w-16 h-16 text-danger-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Test Not Found</h2>
                    <p className="text-slate-400 mb-6 text-sm">
                        {loadError || "We couldn't find the test you're looking for."}
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="glass-button w-full"
                        >
                            Retry
                        </button>
                        <button
                            onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}
                            className="gradient-button w-full"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Check if user has already attempted this exam
    if (alreadyAttempted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
                <div className="glass-card p-8 max-w-md text-center animate-fade-in">
                    <XCircle className="w-16 h-16 text-danger-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Already Attempted</h2>
                    <p className="text-slate-400 mb-6">
                        You have already attempted this exam. Each exam can only be taken once.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="gradient-button px-6"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Check if exam is assigned to user (for students)
    if (user.role === 'user' && !hasAccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
                <div className="glass-card p-8 max-w-md text-center animate-fade-in">
                    <Lock className="w-16 h-16 text-warning-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-slate-400 mb-6">
                        This exam has not been assigned to you. Please contact your instructor if you believe this is an error.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="gradient-button px-6"
                    >
                        Go to Dashboard
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
                        onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}
                        className="gradient-button px-6"
                    >
                        Go to Dashboard
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
            // Create candidate profile using authenticated user data
            const candidate: Candidate = {
                id: user?.id || `candidate-${Date.now()}`,
                name: formData.name || user?.name || undefined,
                email: formData.email || user?.email || undefined,
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

                    {/* Logged in user info */}
                    <div className="mb-6 p-3 bg-slate-800/50 rounded-xl flex items-center gap-3 relative z-10">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt={user.name} className="w-10 h-10 rounded-full" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                                <User className="w-5 h-5 text-primary-400" />
                            </div>
                        )}
                        <div>
                            <p className="text-white font-medium text-sm">{user.name}</p>
                            <p className="text-slate-400 text-xs">{user.email}</p>
                        </div>
                        {user.role === 'admin' && (
                            <span className="ml-auto px-2 py-1 text-xs bg-accent-500/20 text-accent-400 rounded-lg">
                                Admin Preview
                            </span>
                        )}
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
                    <h2 className="text-lg font-bold text-white mb-6">Confirm Your Details</h2>

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
