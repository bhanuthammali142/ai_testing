// ============================================
// Question Bank Store - CSV Question Management
// ============================================
// Zustand store for managing question bank with CSV upload support
// Handles storage, filtering, selection, and usage tracking

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    BankQuestion,
    QuestionBankFilter,
    QuestionSelectionRequest,
    QuestionSelectionResult,
    QuestionBankStats,
    Difficulty
} from '../types';
import {
    filterQuestions,
    selectQuestions,
    getAllSubjects,
    getTopicsForSubject
} from '../utils/questionSelector';

// ============================================
// Store Interface
// ============================================

interface QuestionBankState {
    // State
    questions: BankQuestion[];
    lastUpdated: Date | null;
    uploadHistory: Array<{
        id: string;
        filename: string;
        uploadedAt: Date;
        questionCount: number;
    }>;

    // Actions - Question Management
    addQuestions: (questions: BankQuestion[], filename: string) => void;
    removeQuestion: (id: string) => void;
    removeQuestionsByIds: (ids: string[]) => void;
    clearAllQuestions: () => void;
    replaceAllQuestions: (questions: BankQuestion[], filename: string) => void;

    // Actions - Usage Tracking
    markQuestionsUsed: (questionIds: string[], examId: string) => void;
    unmarkQuestionsUsed: (examId: string) => void;
    resetAllUsage: () => void;

    // Selectors - Filtering & Selection
    getFilteredQuestions: (filter: QuestionBankFilter) => BankQuestion[];
    selectQuestionsForExam: (request: QuestionSelectionRequest) => QuestionSelectionResult;

    // Selectors - Metadata
    getStats: () => QuestionBankStats;
    getSubjects: () => string[];
    getTopicsForSubject: (subject: string) => string[];
    getQuestionById: (id: string) => BankQuestion | undefined;

    // Selectors - Search
    searchQuestions: (query: string) => BankQuestion[];
}

// ============================================
// Store Implementation
// ============================================

export const useQuestionBankStore = create<QuestionBankState>()(
    persist(
        (set, get) => ({
            // Initial State
            questions: [],
            lastUpdated: null,
            uploadHistory: [],

            // ========================================
            // Question Management Actions
            // ========================================

            addQuestions: (newQuestions: BankQuestion[], filename: string) => {
                set(state => {
                    // Merge with existing, avoiding duplicates by ID
                    const existingIds = new Set(state.questions.map(q => q.id));
                    const uniqueNew = newQuestions.filter(q => !existingIds.has(q.id));

                    // Track upload
                    const uploadRecord = {
                        id: `upload-${Date.now()}`,
                        filename,
                        uploadedAt: new Date(),
                        questionCount: uniqueNew.length
                    };

                    return {
                        questions: [...state.questions, ...uniqueNew],
                        lastUpdated: new Date(),
                        uploadHistory: [...state.uploadHistory, uploadRecord]
                    };
                });
            },

            removeQuestion: (id: string) => {
                set(state => ({
                    questions: state.questions.filter(q => q.id !== id),
                    lastUpdated: new Date()
                }));
            },

            removeQuestionsByIds: (ids: string[]) => {
                const idsSet = new Set(ids);
                set(state => ({
                    questions: state.questions.filter(q => !idsSet.has(q.id)),
                    lastUpdated: new Date()
                }));
            },

            clearAllQuestions: () => {
                set({
                    questions: [],
                    lastUpdated: new Date(),
                    uploadHistory: []
                });
            },

            replaceAllQuestions: (questions: BankQuestion[], filename: string) => {
                set({
                    questions,
                    lastUpdated: new Date(),
                    uploadHistory: [{
                        id: `upload-${Date.now()}`,
                        filename,
                        uploadedAt: new Date(),
                        questionCount: questions.length
                    }]
                });
            },

            // ========================================
            // Usage Tracking Actions
            // ========================================

            markQuestionsUsed: (questionIds: string[], examId: string) => {
                set(state => ({
                    questions: state.questions.map(q => {
                        if (questionIds.includes(q.id)) {
                            return {
                                ...q,
                                usedInExams: q.usedInExams.includes(examId)
                                    ? q.usedInExams
                                    : [...q.usedInExams, examId],
                                usageCount: q.usageCount + 1
                            };
                        }
                        return q;
                    }),
                    lastUpdated: new Date()
                }));
            },

            unmarkQuestionsUsed: (examId: string) => {
                set(state => ({
                    questions: state.questions.map(q => ({
                        ...q,
                        usedInExams: q.usedInExams.filter(id => id !== examId),
                        usageCount: Math.max(0, q.usageCount - 1)
                    })),
                    lastUpdated: new Date()
                }));
            },

            resetAllUsage: () => {
                set(state => ({
                    questions: state.questions.map(q => ({
                        ...q,
                        usedInExams: [],
                        usageCount: 0
                    })),
                    lastUpdated: new Date()
                }));
            },

            // ========================================
            // Filtering & Selection Selectors
            // ========================================

            getFilteredQuestions: (filter: QuestionBankFilter) => {
                return filterQuestions(get().questions, filter);
            },

            selectQuestionsForExam: (request: QuestionSelectionRequest) => {
                return selectQuestions(get().questions, request);
            },

            // ========================================
            // Metadata Selectors
            // ========================================

            getStats: (): QuestionBankStats => {
                const questions = get().questions;

                // Initialize difficulty counts
                const byDifficulty: Record<Difficulty, number> = {
                    easy: 0,
                    medium: 0,
                    hard: 0
                };

                const bySubject: Record<string, number> = {};
                const byTopic: Record<string, number> = {};
                let usedQuestions = 0;

                for (const q of questions) {
                    // Count by difficulty
                    byDifficulty[q.difficulty]++;

                    // Count by subject
                    bySubject[q.subject] = (bySubject[q.subject] || 0) + 1;

                    // Count by topic
                    byTopic[q.topic] = (byTopic[q.topic] || 0) + 1;

                    // Count used questions
                    if (q.usedInExams.length > 0) {
                        usedQuestions++;
                    }
                }

                return {
                    totalQuestions: questions.length,
                    bySubject,
                    byTopic,
                    byDifficulty,
                    uniqueSubjects: Object.keys(bySubject).sort(),
                    uniqueTopics: Object.keys(byTopic).sort(),
                    usedQuestions,
                    unusedQuestions: questions.length - usedQuestions
                };
            },

            getSubjects: () => {
                return getAllSubjects(get().questions);
            },

            getTopicsForSubject: (subject: string) => {
                return getTopicsForSubject(get().questions, subject);
            },

            getQuestionById: (id: string) => {
                return get().questions.find(q => q.id === id);
            },

            // ========================================
            // Search Selector
            // ========================================

            searchQuestions: (query: string) => {
                const lowerQuery = query.toLowerCase().trim();
                if (!lowerQuery) return get().questions;

                return get().questions.filter(q =>
                    q.questionText.toLowerCase().includes(lowerQuery) ||
                    q.subject.toLowerCase().includes(lowerQuery) ||
                    q.topic.toLowerCase().includes(lowerQuery) ||
                    q.id.toLowerCase().includes(lowerQuery)
                );
            }
        }),
        {
            name: 'testexam-question-bank'
        }
    )
);

export default useQuestionBankStore;
