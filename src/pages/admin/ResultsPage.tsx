import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Users,
    Clock,
    Target,
    Download,
    FileText,
    Printer,
    ChevronDown,
    ChevronUp,
    Check,
    X,
    AlertTriangle,
    TrendingUp,
    Cloud,
    CloudOff,
    RefreshCw,
    Loader2
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { useTestStore, useAttemptStore, useUIStore } from '../../stores';
import { EmptyState } from '../../components/common';
import { attemptService } from '../../services/firebaseService';

const ResultsPage: React.FC = () => {
    const { currentTest, getQuestionsForTest } = useTestStore();
    const {
        getAttemptsForTest,
        getAnalyticsForTest,
        exportResults,
        syncWithFirebase,
        loadFromFirebase,
        isSyncing,
        isLoading,
        lastSyncError
    } = useAttemptStore();
    const { showToast } = useUIStore();

    const [expandedAttempts, setExpandedAttempts] = useState<Set<string>>(new Set());
    const [isRealtime, setIsRealtime] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    // Load data from Firebase on mount and set up real-time listener
    useEffect(() => {
        if (!currentTest?.id) return;

        // Initial load - Intelligent merge in store prevents data loss
        loadFromFirebase(currentTest.id).then(() => {
            setLastUpdate(new Date());
        }).catch(err => {
            console.error('Initial firebase load failed:', err);
            // Non-fatal, local results might still be available
        });

        // Set up real-time subscription
        const unsubscribe = attemptService.subscribeToAttempts(currentTest.id, (firebaseAttempts) => {
            // Instead of reloading EVERYTHING again, we can just log success 
            // the onSnapshot logic in attemptService already does its thing
            // if we wanted to be more reactive we'd move this into the store
            setLastUpdate(new Date());
            setIsRealtime(true);
        });

        return () => {
            unsubscribe();
            setIsRealtime(false);
        };
    }, [currentTest?.id, loadFromFirebase]);

    if (!currentTest) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-400">No test selected.</p>
            </div>
        );
    }

    const attempts = getAttemptsForTest(currentTest.id);
    const questions = getQuestionsForTest(currentTest.id);
    const analytics = getAnalyticsForTest(currentTest.id, questions);

    const handleExport = (format: 'csv' | 'json') => {
        const data = exportResults(currentTest.id, format);
        const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentTest.name}-results.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('success', `Results exported as ${format.toUpperCase()}`);
    };

    const handleSyncToCloud = async () => {
        try {
            await syncWithFirebase();
            showToast('success', 'Results synced to Firebase cloud!');
        } catch (error) {
            showToast('error', 'Failed to sync to cloud');
        }
    };

    const handleRefreshFromCloud = async () => {
        try {
            await loadFromFirebase(currentTest.id);
            showToast('success', 'Results refreshed from cloud!');
        } catch (error) {
            showToast('error', 'Failed to load from cloud');
        }
    };

    const handlePrint = () => {
        window.print();
        showToast('info', 'Print dialog opened');
    };

    const toggleAttemptExpand = (attemptId: string) => {
        const newExpanded = new Set(expandedAttempts);
        if (newExpanded.has(attemptId)) {
            newExpanded.delete(attemptId);
        } else {
            newExpanded.add(attemptId);
        }
        setExpandedAttempts(newExpanded);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    if (attempts.length === 0) {
        return (
            <div className="max-w-5xl mx-auto animate-fade-in">
                <EmptyState
                    type="results"
                    title="No Results Yet"
                    message="Results will appear here once candidates start taking the test. Share the test link to get started."
                />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            {/* Real-time Status Banner */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                    {isRealtime ? (
                        <>
                            <span className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
                            <span className="text-sm text-success-400">Live - Real-time updates enabled</span>
                        </>
                    ) : (
                        <>
                            <span className="w-2 h-2 bg-slate-500 rounded-full" />
                            <span className="text-sm text-slate-400">Connecting to Firebase...</span>
                        </>
                    )}
                </div>
                {lastUpdate && (
                    <span className="text-xs text-slate-500">
                        Last updated: {lastUpdate.toLocaleTimeString()}
                    </span>
                )}
            </div>

            {/* Loading indicator */}
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="glass-card p-6 flex items-center gap-4">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
                        <span className="text-white">Loading results from cloud...</span>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                            <p className="stat-label">Total Attempts</p>
                            <p className="stat-value">{analytics.totalAttempts}</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center">
                            <Target className="w-6 h-6 text-accent-400" />
                        </div>
                        <div>
                            <p className="stat-label">Average Score</p>
                            <p className="stat-value">{analytics.averageScore}%</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-warning-500/20 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-warning-400" />
                        </div>
                        <div>
                            <p className="stat-label">Avg. Time</p>
                            <p className="stat-value">{analytics.averageTimeMinutes}m</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-success-500/20 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-success-400" />
                        </div>
                        <div>
                            <p className="stat-label">Pass Rate</p>
                            <p className="stat-value">{analytics.passRate}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score Distribution */}
                <div className="glass-card p-6">
                    <h3 className="card-title mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary-400" />
                        Score Distribution
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.scoreDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="range"
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#e2e8f0'
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="url(#colorGradient)"
                                    radius={[4, 4, 0, 0]}
                                />
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#0ea5e9" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Per-Question Correctness */}
                <div className="glass-card p-6">
                    <h3 className="card-title mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary-400" />
                        Question Performance
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {analytics.questionStats.length > 0 ? (
                            analytics.questionStats.map((stat, index) => {
                                const total = stat.correctCount + stat.incorrectCount + stat.skipCount;
                                const correctPercent = total > 0 ? Math.round((stat.correctCount / total) * 100) : 0;
                                return (
                                    <div key={stat.questionId} className="p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-white">Q{index + 1}</span>
                                            <span className="text-sm text-slate-400">{correctPercent}% correct</span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-success-500 to-success-400 rounded-full transition-all"
                                                style={{ width: `${correctPercent}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-1 text-xs text-slate-500">
                                            <span>✓ {stat.correctCount}</span>
                                            <span>✗ {stat.incorrectCount}</span>
                                            <span>⊘ {stat.skipCount}</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-slate-400 text-center py-8">No question data available</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Cloud Sync Status */}
            {lastSyncError && (
                <div className="p-4 bg-danger-500/10 border border-danger-500/30 rounded-xl flex items-center gap-3">
                    <CloudOff className="w-5 h-5 text-danger-400" />
                    <span className="text-danger-300">{lastSyncError}</span>
                </div>
            )}

            {/* Export & Sync Buttons */}
            <div className="flex flex-wrap gap-3 no-print">
                <button
                    onClick={() => handleExport('csv')}
                    className="glass-button flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
                <button
                    onClick={() => handleExport('json')}
                    className="glass-button flex items-center gap-2"
                >
                    <FileText className="w-4 h-4" />
                    Export JSON
                </button>
                <button
                    onClick={handlePrint}
                    className="glass-button flex items-center gap-2"
                >
                    <Printer className="w-4 h-4" />
                    Print
                </button>

                <div className="flex-1" />

                {/* Cloud Sync Buttons */}
                <button
                    onClick={handleRefreshFromCloud}
                    disabled={isSyncing}
                    className="glass-button flex items-center gap-2 text-primary-400"
                >
                    {isSyncing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <RefreshCw className="w-4 h-4" />
                    )}
                    Refresh from Cloud
                </button>
                <button
                    onClick={handleSyncToCloud}
                    disabled={isSyncing}
                    className="gradient-button flex items-center gap-2"
                >
                    {isSyncing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Cloud className="w-4 h-4" />
                    )}
                    Sync to Firebase
                </button>
            </div>

            {/* Attempts Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/10">
                    <h3 className="card-title">All Attempts</h3>
                </div>

                {/* Table Header */}
                <div className="hidden md:grid grid-cols-7 gap-4 p-4 bg-white/5 text-sm font-medium text-slate-400">
                    <div>Candidate</div>
                    <div>Score</div>
                    <div>Percentage</div>
                    <div>Status</div>
                    <div>Time Spent</div>
                    <div>Tab Switches</div>
                    <div>Date</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-white/5">
                    {attempts.map((attempt) => (
                        <div key={attempt.id}>
                            {/* Main Row */}
                            <div
                                className="p-4 hover:bg-white/5 cursor-pointer transition-colors"
                                onClick={() => toggleAttemptExpand(attempt.id)}
                            >
                                <div className="md:grid md:grid-cols-7 md:gap-4 md:items-center space-y-2 md:space-y-0">
                                    {/* Candidate */}
                                    <div>
                                        <p className="text-white font-medium">{attempt.candidate.name || 'Anonymous'}</p>
                                        <p className="text-xs text-slate-500 md:hidden">
                                            {attempt.candidate.email || attempt.candidate.studentId || '—'}
                                        </p>
                                    </div>

                                    {/* Score */}
                                    <div className="flex items-center gap-2">
                                        <span className="md:hidden text-slate-400 text-sm">Score:</span>
                                        <span className="text-white">{attempt.score}/{attempt.maxScore}</span>
                                    </div>

                                    {/* Percentage */}
                                    <div>
                                        <span className="md:hidden text-slate-400 text-sm mr-2">Percentage:</span>
                                        <span className={`font-semibold ${attempt.passed ? 'text-success-400' : 'text-danger-400'
                                            }`}>
                                            {attempt.percentage}%
                                        </span>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <span className={`badge text-xs ${attempt.status === 'completed' ? 'badge-success' :
                                            attempt.status === 'timed-out' ? 'badge-warning' :
                                                attempt.status === 'in-progress' ? 'badge-primary' : 'badge-danger'
                                            }`}>
                                            {attempt.status}
                                        </span>
                                    </div>

                                    {/* Time Spent */}
                                    <div className="flex items-center gap-2">
                                        <span className="md:hidden text-slate-400 text-sm">Time:</span>
                                        <span className="text-slate-300">{formatDuration(attempt.timeSpentSeconds)}</span>
                                    </div>

                                    {/* Tab Switches */}
                                    <div className="flex items-center gap-2">
                                        <span className="md:hidden text-slate-400 text-sm">Tab Switches:</span>
                                        <span className={`${attempt.tabSwitchCount > 0 ? 'text-warning-400' : 'text-slate-500'}`}>
                                            {attempt.tabSwitchCount > 0 && <AlertTriangle className="w-4 h-4 inline mr-1" />}
                                            {attempt.tabSwitchCount}
                                        </span>
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 text-sm">
                                            {new Date(attempt.startedAt).toLocaleDateString()}
                                        </span>
                                        {expandedAttempts.has(attempt.id) ? (
                                            <ChevronUp className="w-5 h-5 text-slate-500" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-slate-500" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Detail */}
                            {expandedAttempts.has(attempt.id) && (
                                <div className="px-4 pb-4 bg-white/5 animate-slide-down">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-900/50 rounded-xl">
                                        {/* Candidate Info */}
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-400 mb-3">Candidate Details</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Name</span>
                                                    <span className="text-white">{attempt.candidate.name || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Email</span>
                                                    <span className="text-white">{attempt.candidate.email || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Student ID</span>
                                                    <span className="text-white">{attempt.candidate.studentId || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Started</span>
                                                    <span className="text-white">
                                                        {new Date(attempt.startedAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                {attempt.completedAt && (
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Completed</span>
                                                        <span className="text-white">
                                                            {new Date(attempt.completedAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Responses */}
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-400 mb-3">Response Summary</h4>
                                            <div className="space-y-2">
                                                {attempt.responses.map((response, idx) => {
                                                    const question = questions.find(q => q.id === response.questionId);
                                                    return (
                                                        <div
                                                            key={response.questionId}
                                                            className="flex items-center gap-3 text-sm"
                                                        >
                                                            <span className={`w-6 h-6 rounded flex items-center justify-center ${response.isCorrect
                                                                ? 'bg-success-500/20 text-success-400'
                                                                : 'bg-danger-500/20 text-danger-400'
                                                                }`}>
                                                                {response.isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                            </span>
                                                            <span className="text-slate-400">Q{idx + 1}</span>
                                                            <span className="text-white truncate flex-1">
                                                                {question?.text.substring(0, 40)}...
                                                            </span>
                                                            <span className="text-slate-500">{response.timeTaken}s</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ResultsPage;
