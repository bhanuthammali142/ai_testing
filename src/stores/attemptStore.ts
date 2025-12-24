// ============================================
// Attempt Store - With Firebase Integration
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Attempt, QuestionResponse, Candidate, TestAnalytics, Question } from '../types';
import { mockAttempts } from '../data/mockData';
import { attemptService, studentService } from '../services/firebaseService';

interface AttemptState {
    attempts: Attempt[];
    currentAttempt: Attempt | null;
    isLoading: boolean;
    isSyncing: boolean;
    lastSyncError: string | null;

    // Attempt Actions
    startAttempt: (testId: string, candidate: Candidate, questions: Question[]) => Attempt;
    submitResponse: (questionId: string, selectedOptions: string[], codeAnswer?: string) => void;
    completeAttempt: (testName?: string) => Promise<void>;
    abandonAttempt: () => void;
    getCurrentAttempt: () => Attempt | null;
    setCurrentAttempt: (attempt: Attempt | null) => void;
    updateTimeSpent: (seconds: number) => void;
    incrementTabSwitch: () => void;

    // Query Actions
    getAttempt: (id: string) => Attempt | undefined;
    getAttemptsForTest: (testId: string) => Attempt[];
    getAttemptsForCandidate: (candidateId: string) => Attempt[];
    getCandidateAttemptCount: (testId: string, candidateId: string) => number;

    // Analytics Actions
    getAnalyticsForTest: (testId: string, questions: Question[]) => TestAnalytics;
    exportResults: (testId: string, format: 'csv' | 'json') => string;
    clearResultsForTest: (testId: string) => Promise<void>;

    // Firebase Sync Actions
    syncWithFirebase: () => Promise<void>;
    loadFromFirebase: (testId: string) => Promise<void>;
}

export const useAttemptStore = create<AttemptState>()(
    persist(
        (set, get) => ({
            attempts: [],
            currentAttempt: null,
            isLoading: false,
            isSyncing: false,
            lastSyncError: null,

            // Start a new attempt
            startAttempt: (testId: string, candidate: Candidate, questions: Question[]) => {
                const maxScore = questions.reduce((sum, q) => sum + q.points, 0);

                const newAttempt: Attempt = {
                    id: uuidv4(),
                    testId,
                    candidate: {
                        ...candidate,
                        id: candidate.id || uuidv4(),
                    },
                    responses: [],
                    status: 'in-progress',
                    score: 0,
                    maxScore,
                    percentage: 0,
                    passed: false,
                    startedAt: new Date(),
                    timeSpentSeconds: 0,
                    tabSwitchCount: 0,
                };

                set({
                    currentAttempt: newAttempt,
                    attempts: [...get().attempts, newAttempt],
                });

                // Sync student to Firebase in background
                studentService.upsertStudent(newAttempt.candidate).catch(err => {
                    console.warn('Failed to sync student to Firebase:', err);
                });

                return newAttempt;
            },

            // Submit a response for a question
            submitResponse: (questionId: string, selectedOptions: string[], codeAnswer?: string) => {
                const { currentAttempt, attempts } = get();
                if (!currentAttempt) return;

                const existingIndex = currentAttempt.responses.findIndex(r => r.questionId === questionId);
                const response: QuestionResponse = {
                    questionId,
                    selectedOptions,
                    codeAnswer,
                    isCorrect: false, // Will be calculated on completion
                    pointsEarned: 0,
                    timeTaken: 0,
                };

                let newResponses: QuestionResponse[];
                if (existingIndex >= 0) {
                    newResponses = [...currentAttempt.responses];
                    newResponses[existingIndex] = response;
                } else {
                    newResponses = [...currentAttempt.responses, response];
                }

                const updatedAttempt = { ...currentAttempt, responses: newResponses };

                set({
                    currentAttempt: updatedAttempt,
                    attempts: attempts.map(a => a.id === currentAttempt.id ? updatedAttempt : a),
                });
            },

            // Complete the attempt and calculate results
            completeAttempt: async (testName?: string) => {
                const { currentAttempt, attempts } = get();
                if (!currentAttempt) return;

                set({ isSyncing: true, lastSyncError: null });

                // Import testStore to get questions for scoring
                const { useTestStore } = await import('./testStore');
                const questions = useTestStore.getState().getQuestionsForTest(currentAttempt.testId);

                // Calculate scores
                let totalScore = 0;
                const scoredResponses = currentAttempt.responses.map(response => {
                    const question = questions.find(q => q.id === response.questionId);
                    if (!question) return { ...response, isCorrect: false, pointsEarned: 0 };

                    let isCorrect = false;
                    let pointsEarned = 0;

                    if (question.type === 'coding') {
                        // For coding questions, partial credit could be implemented
                        isCorrect = response.codeAnswer?.trim() !== '';
                        pointsEarned = isCorrect ? question.points : 0;
                    } else {
                        // For MCQ and True/False
                        const correctOptions = question.options.filter(o => o.isCorrect).map(o => o.id);
                        const selectedSet = new Set(response.selectedOptions);
                        const correctSet = new Set(correctOptions);

                        if (selectedSet.size === correctSet.size &&
                            [...selectedSet].every(id => correctSet.has(id))) {
                            isCorrect = true;
                            pointsEarned = question.points;
                        } else if (response.selectedOptions.length > 0 && question.negativeMarking > 0) {
                            pointsEarned = -question.negativeMarking;
                        }
                    }

                    totalScore += pointsEarned;
                    return { ...response, isCorrect, pointsEarned };
                });

                const maxScore = currentAttempt.maxScore;
                const percentage = maxScore > 0 ? Math.round((Math.max(0, totalScore) / maxScore) * 100) : 0;

                // Get passing score from test settings
                const test = useTestStore.getState().getTest(currentAttempt.testId);
                const passingScore = test?.settings.review.passingScore || 60;
                const passed = percentage >= passingScore;

                const completedAttempt: Attempt = {
                    ...currentAttempt,
                    responses: scoredResponses,
                    status: 'completed',
                    score: Math.max(0, totalScore),
                    percentage,
                    passed,
                    completedAt: new Date(),
                };

                set({
                    currentAttempt: completedAttempt,
                    attempts: attempts.map(a => a.id === currentAttempt.id ? completedAttempt : a),
                });

                // Save to Firebase
                try {
                    await attemptService.saveAttempt(completedAttempt, testName || test?.name);
                    console.log('✅ Attempt synced to Firebase successfully');
                    set({ isSyncing: false });
                } catch (error) {
                    console.error('Failed to sync attempt to Firebase:', error);
                    set({
                        isSyncing: false,
                        lastSyncError: 'Failed to sync results to cloud. Data saved locally.'
                    });
                }
            },

            // Abandon attempt (timeout or voluntary)
            abandonAttempt: () => {
                const { currentAttempt, attempts } = get();
                if (!currentAttempt) return;

                const abandonedAttempt: Attempt = {
                    ...currentAttempt,
                    status: 'abandoned',
                    completedAt: new Date(),
                };

                set({
                    currentAttempt: null,
                    attempts: attempts.map(a => a.id === currentAttempt.id ? abandonedAttempt : a),
                });
            },

            getCurrentAttempt: () => get().currentAttempt,

            setCurrentAttempt: (attempt: Attempt | null) => set({ currentAttempt: attempt }),

            updateTimeSpent: (seconds: number) => {
                const { currentAttempt, attempts } = get();
                if (!currentAttempt) return;

                const updated = { ...currentAttempt, timeSpentSeconds: seconds };
                set({
                    currentAttempt: updated,
                    attempts: attempts.map(a => a.id === currentAttempt.id ? updated : a),
                });
            },

            incrementTabSwitch: () => {
                const { currentAttempt, attempts } = get();
                if (!currentAttempt) return;

                const updated = {
                    ...currentAttempt,
                    tabSwitchCount: currentAttempt.tabSwitchCount + 1
                };
                set({
                    currentAttempt: updated,
                    attempts: attempts.map(a => a.id === currentAttempt.id ? updated : a),
                });
            },

            // Query Actions
            getAttempt: (id: string) => get().attempts.find(a => a.id === id),

            getAttemptsForTest: (testId: string) => {
                return get().attempts.filter(a => a.testId === testId);
            },

            getAttemptsForCandidate: (candidateId: string) => {
                return get().attempts.filter(a => a.candidate.id === candidateId);
            },

            getCandidateAttemptCount: (testId: string, candidateId: string) => {
                return get().attempts.filter(
                    a => a.testId === testId && a.candidate.id === candidateId
                ).length;
            },

            // Analytics
            getAnalyticsForTest: (testId: string, questions: Question[]): TestAnalytics => {
                const attempts = get().getAttemptsForTest(testId);
                const completed = attempts.filter(a => a.status === 'completed' || a.status === 'timed-out');

                if (completed.length === 0) {
                    return {
                        testId,
                        totalAttempts: 0,
                        completedAttempts: 0,
                        averageScore: 0,
                        averageTimeMinutes: 0,
                        passRate: 0,
                        questionStats: [],
                        scoreDistribution: [
                            { range: '0-20', count: 0 },
                            { range: '21-40', count: 0 },
                            { range: '41-60', count: 0 },
                            { range: '61-80', count: 0 },
                            { range: '81-100', count: 0 },
                        ],
                    };
                }

                const totalScore = completed.reduce((sum, a) => sum + a.percentage, 0);
                const totalTime = completed.reduce((sum, a) => sum + a.timeSpentSeconds, 0);
                const passed = completed.filter(a => a.passed).length;

                // Question stats
                const questionStats = questions.map(q => {
                    const responses = completed.flatMap(a => a.responses.filter(r => r.questionId === q.id));
                    const correct = responses.filter(r => r.isCorrect).length;
                    const incorrect = responses.filter(r => !r.isCorrect && r.selectedOptions.length > 0).length;
                    const skipped = completed.length - responses.length;
                    const avgTime = responses.length > 0
                        ? responses.reduce((sum, r) => sum + r.timeTaken, 0) / responses.length
                        : 0;

                    return {
                        questionId: q.id,
                        questionText: q.text.substring(0, 50) + (q.text.length > 50 ? '...' : ''),
                        correctCount: correct,
                        incorrectCount: incorrect,
                        skipCount: skipped,
                        averageTime: Math.round(avgTime),
                    };
                });

                // Score distribution
                const scoreRanges = [
                    { range: '0-20', min: 0, max: 20, count: 0 },
                    { range: '21-40', min: 21, max: 40, count: 0 },
                    { range: '41-60', min: 41, max: 60, count: 0 },
                    { range: '61-80', min: 61, max: 80, count: 0 },
                    { range: '81-100', min: 81, max: 100, count: 0 },
                ];

                completed.forEach(a => {
                    const range = scoreRanges.find(r => a.percentage >= r.min && a.percentage <= r.max);
                    if (range) range.count++;
                });

                return {
                    testId,
                    totalAttempts: attempts.length,
                    completedAttempts: completed.length,
                    averageScore: Math.round(totalScore / completed.length),
                    averageTimeMinutes: Math.round(totalTime / completed.length / 60),
                    passRate: Math.round((passed / completed.length) * 100),
                    questionStats,
                    scoreDistribution: scoreRanges.map(r => ({ range: r.range, count: r.count })),
                };
            },

            // Export results
            exportResults: (testId: string, format: 'csv' | 'json') => {
                const attempts = get().getAttemptsForTest(testId);
                const data = attempts.map(a => ({
                    id: a.id,
                    candidateName: a.candidate.name || 'N/A',
                    candidateEmail: a.candidate.email || 'N/A',
                    studentId: a.candidate.studentId || 'N/A',
                    status: a.status,
                    score: a.score,
                    maxScore: a.maxScore,
                    percentage: a.percentage,
                    passed: a.passed ? 'Yes' : 'No',
                    timeSpent: Math.round(a.timeSpentSeconds / 60) + ' min',
                    tabSwitches: a.tabSwitchCount,
                    startedAt: new Date(a.startedAt).toLocaleString(),
                    completedAt: a.completedAt ? new Date(a.completedAt).toLocaleString() : 'N/A',
                }));

                if (format === 'json') {
                    return JSON.stringify(data, null, 2);
                }

                // CSV format
                const headers = Object.keys(data[0] || {});
                const rows = data.map(row => headers.map(h => `"${(row as Record<string, unknown>)[h]}"`).join(','));
                return [headers.join(','), ...rows].join('\n');
            },

            // Clear results for a test
            clearResultsForTest: async (testId: string) => {
                set({ isSyncing: true });

                try {
                    // Clear from Firebase
                    await attemptService.clearAttemptsForTest(testId);

                    // Clear locally
                    set(state => ({
                        attempts: state.attempts.filter(a => a.testId !== testId),
                        isSyncing: false,
                    }));
                } catch (error) {
                    console.error('Error clearing results:', error);
                    // Still clear locally even if Firebase fails
                    set(state => ({
                        attempts: state.attempts.filter(a => a.testId !== testId),
                        isSyncing: false,
                        lastSyncError: 'Failed to clear from cloud. Cleared locally.',
                    }));
                }
            },

            // Sync local data with Firebase
            syncWithFirebase: async () => {
                const { attempts } = get();
                set({ isSyncing: true, lastSyncError: null });

                try {
                    // Sync completed attempts that might not be in Firebase
                    const completedAttempts = attempts.filter(
                        a => a.status === 'completed' || a.status === 'timed-out'
                    );

                    for (const attempt of completedAttempts) {
                        await attemptService.saveAttempt(attempt);
                    }

                    console.log('✅ All attempts synced to Firebase');
                    set({ isSyncing: false });
                } catch (error) {
                    console.error('Failed to sync with Firebase:', error);
                    set({
                        isSyncing: false,
                        lastSyncError: 'Failed to sync data with cloud.'
                    });
                }
            },

            // Load attempts from Firebase for a specific test
            loadFromFirebase: async (testId: string) => {
                set({ isLoading: true, lastSyncError: null });

                try {
                    const firebaseAttempts = await attemptService.getAttemptsForTest(testId);

                    // Map Firebase records to Attempt format
                    const mappedFirebaseAttempts: Attempt[] = firebaseAttempts.map(fa => ({
                        id: fa.id,
                        testId: fa.testId,
                        candidate: {
                            id: fa.studentId,
                            name: fa.candidateName || 'Anonymous',
                            email: fa.candidateEmail || undefined,
                            studentId: fa.candidateStudentId || undefined,
                        },
                        responses: fa.responses,
                        status: fa.status as Attempt['status'],
                        score: fa.score,
                        maxScore: fa.maxScore,
                        percentage: fa.percentage,
                        passed: fa.passed,
                        startedAt: fa.startedAt,
                        completedAt: fa.completedAt || undefined,
                        timeSpentSeconds: fa.timeSpentSeconds,
                        tabSwitchCount: fa.tabSwitchCount,
                    }));

                    // Intelligent merging: Keep local attempts that aren't in Firebase yet
                    // or are newer than Firebase versions
                    set(state => {
                        const otherTestAttempts = state.attempts.filter(a => a.testId !== testId);
                        const currentTestLocalAttempts = state.attempts.filter(a => a.testId === testId);

                        // Create a map of IDs for easy lookup
                        const firebaseIds = new Set(mappedFirebaseAttempts.map(a => a.id));

                        // Filter local attempts that are NOT in Firebase + All Firebase attempts
                        const combinedAttemptsForTest = [
                            ...mappedFirebaseAttempts,
                            ...currentTestLocalAttempts.filter(a => !firebaseIds.has(a.id))
                        ];

                        return {
                            attempts: [...otherTestAttempts, ...combinedAttemptsForTest],
                            isLoading: false,
                        };
                    });
                } catch (error) {
                    console.error('Failed to load from Firebase:', error);
                    set({
                        isLoading: false,
                        lastSyncError: 'Failed to load data from cloud. Showing local results only.'
                    });
                }
            },
        }),
        {
            name: 'testexam-attempts',
        }
    )
);
