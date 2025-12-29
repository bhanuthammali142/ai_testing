// ============================================
// Student Dashboard Page
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Clock,
    BookOpen,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Play,
    LogOut,
    FileText,
    Award,
    Calendar,
    RefreshCw
} from 'lucide-react';
import { useUserAuthStore, useExamAssignmentStore, useUIStore } from '../../stores';
import { ExamWithStatus } from '../../types/auth';
import { testService, TestRecord } from '../../services/firebaseService';

const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, signOutUser } = useUserAuthStore();
    const { loadAssignments, hasUserAttemptedExam, getAssignmentsForUser } = useExamAssignmentStore();
    const { showToast } = useUIStore();

    const [exams, setExams] = useState<ExamWithStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Function to load exams directly from Firebase
    const loadExamsFromFirebase = useCallback(async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        try {
            console.log('📥 Fetching tests directly from Firebase...');

            // Directly call Firebase service - no middleware
            const firebaseTests = await testService.getAllTests();
            console.log('📊 Tests from Firebase:', firebaseTests.length, firebaseTests);

            // Filter for open tests only
            const openTests = firebaseTests.filter((t: TestRecord) => t.status === 'open');
            console.log('📋 Open tests:', openTests.length, openTests.map((t: TestRecord) => t.name));

            // Load exam assignments
            await loadAssignments();
            const userAssignments = getAssignmentsForUser(user.id);

            // Convert to ExamWithStatus format
            const examsWithStatus: ExamWithStatus[] = openTests.map((test: TestRecord) => {
                const assignment = userAssignments.find(a => a.examId === test.id);
                const attempted = assignment?.attempted || false;

                let status: 'available' | 'attempted' | 'expired' = 'available';

                if (attempted) {
                    status = 'attempted';
                } else if (test.scheduledEnd && new Date(test.scheduledEnd) < new Date()) {
                    status = 'expired';
                }

                return {
                    id: test.id,
                    title: test.name,
                    duration: test.settings?.accessControl?.timeLimitMinutes || 60,
                    status,
                    scheduledStart: test.scheduledStart,
                    scheduledEnd: test.scheduledEnd,
                    attemptedAt: assignment?.attemptedAt,
                    score: assignment?.score,
                } as ExamWithStatus;
            });

            console.log('✅ Exams ready to display:', examsWithStatus.length);
            setExams(examsWithStatus);
            setLoadError(null);
        } catch (error) {
            console.error('❌ Failed to load tests from Firebase:', error);
            setLoadError('Failed to load exams. Please check your internet connection.');
        }
    }, [user, loadAssignments, getAssignmentsForUser]);

    // Load on mount
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await loadExamsFromFirebase();
            setIsLoading(false);
        };
        loadData();
    }, [loadExamsFromFirebase]);

    // Manual refresh function
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadExamsFromFirebase();
        setIsRefreshing(false);
        showToast('success', 'Exams refreshed!');
    };

    const handleLogout = async () => {
        await signOutUser();
        navigate('/');
    };

    const handleStartExam = (examId: string) => {
        if (!user) return;

        // Check if already attempted
        if (hasUserAttemptedExam(examId, user.id)) {
            showToast('error', 'You have already attempted this exam');
            return;
        }

        // Navigate to exam
        navigate(`/test/${examId}`);
    };

    const getStatusBadge = (status: ExamWithStatus['status']) => {
        switch (status) {
            case 'available':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-success-500/20 text-success-400 border border-success-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Available
                    </span>
                );
            case 'attempted':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-400 border border-primary-500/30">
                        <Award className="w-3.5 h-3.5" />
                        Completed
                    </span>
                );
            case 'expired':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-danger-500/20 text-danger-400 border border-danger-500/30">
                        <XCircle className="w-3.5 h-3.5" />
                        Expired
                    </span>
                );
        }
    };

    if (!user) {
        navigate('/');
        return null;
    }

    // Redirect admin to admin dashboard
    if (user.role === 'admin') {
        navigate('/admin');
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">TestExam</h1>
                                <p className="text-xs text-slate-400">Student Portal</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
                                {user.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                                        <User className="w-4 h-4 text-primary-400" />
                                    </div>
                                )}
                                <span className="text-white font-medium">{user.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <section className="mb-8">
                    <div className="glass-card p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            {user.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt={user.name}
                                    className="w-20 h-20 rounded-2xl border-2 border-primary-500/30"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center border border-primary-500/30">
                                    <User className="w-10 h-10 text-primary-400" />
                                </div>
                            )}
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                    Welcome back, {user.name.split(' ')[0]}! 👋
                                </h2>
                                <div className="flex flex-wrap items-center gap-4 text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        <span>{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Instructions Section */}
                <section className="mb-8">
                    <div className="glass-card p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-warning-500/20 flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-warning-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">
                                    Exam Instructions - Read Carefully
                                </h3>
                                <ul className="space-y-2 text-slate-400">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-400 mt-0.5">•</span>
                                        Ensure you have a stable internet connection before starting any exam.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-400 mt-0.5">•</span>
                                        Each exam can only be attempted <strong className="text-white">once</strong>. Make sure you're ready before starting.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-400 mt-0.5">•</span>
                                        Do not refresh the page or navigate away during the exam.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-400 mt-0.5">•</span>
                                        Anti-cheating measures are in place. Tab switches and copy-paste may be monitored.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-400 mt-0.5">•</span>
                                        Your exam will auto-submit when the time limit is reached.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Available Exams Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary-400" />
                            Your Exams
                        </h3>
                        <span className="text-sm text-slate-400">
                            {exams.filter(e => e.status === 'available').length} available
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="glass-card p-12 text-center">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                            <p className="text-slate-400">Loading your exams...</p>
                        </div>
                    ) : loadError ? (
                        <div className="glass-card p-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-danger-500/20 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-danger-400" />
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-2">Failed to Load Exams</h4>
                            <p className="text-slate-400 mb-4">{loadError}</p>
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="gradient-button flex items-center gap-2 mx-auto"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                {isRefreshing ? 'Refreshing...' : 'Try Again'}
                            </button>
                        </div>
                    ) : exams.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-slate-600" />
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-2">No Exams Available</h4>
                            <p className="text-slate-400 mb-4">
                                You don't have any exams assigned yet. Check back later or contact your instructor.
                            </p>
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="glass-button text-sm flex items-center gap-2 mx-auto"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                {isRefreshing ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {exams.map((exam) => (
                                <div
                                    key={exam.id}
                                    className="glass-card-hover p-6 flex flex-col"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <h4 className="text-lg font-semibold text-white line-clamp-2">
                                            {exam.title}
                                        </h4>
                                        {getStatusBadge(exam.status)}
                                    </div>

                                    <div className="space-y-3 mb-6 flex-1">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock className="w-4 h-4" />
                                            <span>{exam.duration} minutes</span>
                                        </div>
                                        {exam.scheduledEnd && (
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Calendar className="w-4 h-4" />
                                                <span>Expires: {new Date(exam.scheduledEnd).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        {exam.status === 'attempted' && exam.score !== undefined && (
                                            <div className="flex items-center gap-2 text-primary-400">
                                                <Award className="w-4 h-4" />
                                                <span>Score: {exam.score}%</span>
                                            </div>
                                        )}
                                    </div>

                                    {exam.status === 'available' ? (
                                        <button
                                            onClick={() => handleStartExam(exam.id)}
                                            className="w-full gradient-button flex items-center justify-center gap-2"
                                        >
                                            <Play className="w-4 h-4" />
                                            Start Exam
                                        </button>
                                    ) : exam.status === 'attempted' ? (
                                        <button
                                            disabled
                                            className="w-full px-4 py-3 bg-slate-800 text-slate-500 rounded-xl cursor-not-allowed"
                                        >
                                            Already Completed
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full px-4 py-3 bg-slate-800 text-slate-500 rounded-xl cursor-not-allowed"
                                        >
                                            Exam Expired
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-6 mt-12">
                <p className="text-center text-slate-500 text-sm">
                    © 2024 TestExam. Good luck with your exams! 🎓
                </p>
            </footer>
        </div>
    );
};

export default StudentDashboard;
