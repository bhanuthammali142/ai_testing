// ============================================
// Coding Question Store
// ============================================
// This store manages coding questions and their submissions.
// Integrates with the main test/question stores.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
    CodingQuestion,
    TestCase,
    CodeSubmission,
    CodeEvaluationResult,
    SupportedLanguage,
} from '../types/coding';
import {
    runCode as runCodeService,
    submitCode as submitCodeService,
} from '../services/coding';

interface CodingState {
    // Coding questions stored separately for detailed data
    codingQuestions: CodingQuestion[];

    // Active execution state
    isRunning: boolean;
    isSubmitting: boolean;
    currentOutput: string;
    currentError: string;
    lastRunPassed: boolean | null;

    // Results
    submissions: CodeSubmission[];

    // Question Management
    addCodingQuestion: (question: Omit<CodingQuestion, 'id' | 'createdAt' | 'updatedAt'>) => CodingQuestion;
    updateCodingQuestion: (id: string, updates: Partial<CodingQuestion>) => void;
    deleteCodingQuestion: (id: string) => void;
    getCodingQuestion: (id: string) => CodingQuestion | undefined;
    getCodingQuestionsForTest: (testId: string) => CodingQuestion[];

    // Code Execution
    runCode: (
        code: string,
        language: SupportedLanguage,
        sampleInput: string,
        sampleOutput: string,
        timeLimit: number
    ) => Promise<{ passed: boolean; output: string; error: string }>;

    submitCode: (
        attemptId: string,
        questionId: string,
        code: string,
        language: SupportedLanguage,
        testCases: TestCase[],
        timeLimit: number,
        maxPoints: number
    ) => Promise<CodeEvaluationResult | null>;

    // Results
    getSubmissionForQuestion: (attemptId: string, questionId: string) => CodeSubmission | undefined;
    getSubmissionsForAttempt: (attemptId: string) => CodeSubmission[];

    // State Management
    clearExecutionState: () => void;
}

export const useCodingStore = create<CodingState>()(
    persist(
        (set, get) => ({
            codingQuestions: [],
            isRunning: false,
            isSubmitting: false,
            currentOutput: '',
            currentError: '',
            lastRunPassed: null,
            submissions: [],

            // Add a new coding question
            addCodingQuestion: (questionData) => {
                const existingQuestions = get().codingQuestions.filter(
                    q => q.testId === questionData.testId
                );

                const newQuestion: CodingQuestion = {
                    ...questionData,
                    id: uuidv4(),
                    order: existingQuestions.length + 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                set(state => ({
                    codingQuestions: [...state.codingQuestions, newQuestion],
                }));

                return newQuestion;
            },

            // Update a coding question
            updateCodingQuestion: (id, updates) => {
                set(state => ({
                    codingQuestions: state.codingQuestions.map(q =>
                        q.id === id
                            ? { ...q, ...updates, updatedAt: new Date() }
                            : q
                    ),
                }));
            },

            // Delete a coding question
            deleteCodingQuestion: (id) => {
                set(state => ({
                    codingQuestions: state.codingQuestions.filter(q => q.id !== id),
                }));
            },

            // Get a specific coding question
            getCodingQuestion: (id) => {
                return get().codingQuestions.find(q => q.id === id);
            },

            // Get all coding questions for a test
            getCodingQuestionsForTest: (testId) => {
                return get().codingQuestions
                    .filter(q => q.testId === testId)
                    .sort((a, b) => a.order - b.order);
            },

            // Run code against sample test
            runCode: async (code, language, sampleInput, sampleOutput, timeLimit) => {
                set({ isRunning: true, currentOutput: '', currentError: '', lastRunPassed: null });

                try {
                    const response = await runCodeService(
                        code,
                        language,
                        sampleInput,
                        sampleOutput,
                        timeLimit
                    );

                    if (response.success && response.data) {
                        set({
                            isRunning: false,
                            currentOutput: response.data.result.output,
                            currentError: response.data.result.error,
                            lastRunPassed: response.data.passed,
                        });

                        return {
                            passed: response.data.passed,
                            output: response.data.result.output,
                            error: response.data.result.error,
                        };
                    } else {
                        set({
                            isRunning: false,
                            currentError: response.error || 'Unknown error',
                            lastRunPassed: false,
                        });

                        return {
                            passed: false,
                            output: '',
                            error: response.error || 'Unknown error',
                        };
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Execution failed';
                    set({
                        isRunning: false,
                        currentError: errorMessage,
                        lastRunPassed: false,
                    });

                    return {
                        passed: false,
                        output: '',
                        error: errorMessage,
                    };
                }
            },

            // Submit code for full evaluation
            submitCode: async (
                attemptId,
                questionId,
                code,
                language,
                testCases,
                timeLimit,
                maxPoints
            ) => {
                set({ isSubmitting: true, currentOutput: '', currentError: '' });

                try {
                    const response = await submitCodeService(
                        attemptId,
                        questionId,
                        code,
                        language,
                        testCases,
                        timeLimit,
                        maxPoints
                    );

                    if (response.success && response.data) {
                        // Store the submission locally
                        const submission: CodeSubmission = {
                            id: uuidv4(),
                            attemptId,
                            questionId,
                            code,
                            language,
                            result: response.data,
                            submittedAt: new Date(),
                        };

                        set(state => ({
                            isSubmitting: false,
                            submissions: [...state.submissions, submission],
                        }));

                        return response.data;
                    } else {
                        set({
                            isSubmitting: false,
                            currentError: response.error || 'Submission failed',
                        });

                        return null;
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Submission failed';
                    set({
                        isSubmitting: false,
                        currentError: errorMessage,
                    });

                    return null;
                }
            },

            // Get submission for a specific question
            getSubmissionForQuestion: (attemptId, questionId) => {
                return get().submissions.find(
                    s => s.attemptId === attemptId && s.questionId === questionId
                );
            },

            // Get all submissions for an attempt
            getSubmissionsForAttempt: (attemptId) => {
                return get().submissions.filter(s => s.attemptId === attemptId);
            },

            // Clear execution state
            clearExecutionState: () => {
                set({
                    isRunning: false,
                    isSubmitting: false,
                    currentOutput: '',
                    currentError: '',
                    lastRunPassed: null,
                });
            },
        }),
        {
            name: 'testexam-coding',
        }
    )
);
