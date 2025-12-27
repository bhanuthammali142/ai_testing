// ============================================
// Test Store - Test & Question Management
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
    Test,
    Question,
    TestSettings,
    TestStatus
} from '../types';
import { defaultTestSettings } from '../data/mockData';

interface TestState {
    tests: Test[];
    questions: Question[];
    currentTest: Test | null;

    // Test Actions
    createTest: (name: string, adminPassword: string) => Test;
    getTest: (id: string) => Test | undefined;
    updateTest: (id: string, updates: Partial<Test>) => void;
    deleteTest: (id: string) => void;
    cloneTest: (id: string, newName: string) => Test | null;
    setCurrentTest: (test: Test | null) => void;
    updateTestSettings: (testId: string, settings: TestSettings) => void;
    updateTestStatus: (testId: string, status: TestStatus) => void;
    updateTestAlias: (testId: string, alias: string) => void;

    // Question Actions
    getQuestionsForTest: (testId: string) => Question[];
    addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => Question;
    addQuestions: (questions: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>[]) => Question[];
    updateQuestion: (id: string, updates: Partial<Question>) => void;
    deleteQuestion: (id: string) => void;
    reorderQuestions: (testId: string, questionIds: string[]) => void;
    duplicateQuestion: (id: string) => Question | null;
}

export const useTestStore = create<TestState>()(
    persist(
        (set, get) => ({
            tests: [],
            questions: [],
            currentTest: null,

            // Test Actions
            createTest: (name: string, adminPassword: string) => {
                const newTest: Test = {
                    id: uuidv4(),
                    name,
                    adminPassword,
                    settings: { ...defaultTestSettings },
                    status: 'draft',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                set((state) => ({ tests: [...state.tests, newTest] }));
                return newTest;
            },

            getTest: (id: string) => {
                return get().tests.find((t) => t.id === id);
            },

            updateTest: (id: string, updates: Partial<Test>) => {
                set((state) => ({
                    tests: state.tests.map((t) =>
                        t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
                    ),
                    currentTest: state.currentTest?.id === id
                        ? { ...state.currentTest, ...updates, updatedAt: new Date() }
                        : state.currentTest,
                }));
            },

            deleteTest: (id: string) => {
                set((state) => ({
                    tests: state.tests.filter((t) => t.id !== id),
                    questions: state.questions.filter((q) => q.testId !== id),
                    currentTest: state.currentTest?.id === id ? null : state.currentTest,
                }));
            },

            cloneTest: (id: string, newName: string) => {
                const original = get().tests.find((t) => t.id === id);
                if (!original) return null;

                const newTestId = uuidv4();
                const newTest: Test = {
                    ...original,
                    id: newTestId,
                    name: newName,
                    status: 'draft',
                    urlAlias: undefined,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                // Clone questions
                const originalQuestions = get().questions.filter((q) => q.testId === id);
                const clonedQuestions = originalQuestions.map((q) => ({
                    ...q,
                    id: uuidv4(),
                    testId: newTestId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }));

                set((state) => ({
                    tests: [...state.tests, newTest],
                    questions: [...state.questions, ...clonedQuestions],
                }));

                return newTest;
            },

            setCurrentTest: (test: Test | null) => {
                set({ currentTest: test });
            },

            updateTestSettings: (testId: string, settings: TestSettings) => {
                set((state) => ({
                    tests: state.tests.map((t) =>
                        t.id === testId ? { ...t, settings, updatedAt: new Date() } : t
                    ),
                    currentTest: state.currentTest?.id === testId
                        ? { ...state.currentTest, settings, updatedAt: new Date() }
                        : state.currentTest,
                }));
            },

            updateTestStatus: (testId: string, status: TestStatus) => {
                set((state) => ({
                    tests: state.tests.map((t) =>
                        t.id === testId ? { ...t, status, updatedAt: new Date() } : t
                    ),
                    currentTest: state.currentTest?.id === testId
                        ? { ...state.currentTest, status, updatedAt: new Date() }
                        : state.currentTest,
                }));
            },

            updateTestAlias: (testId: string, alias: string) => {
                set((state) => ({
                    tests: state.tests.map((t) =>
                        t.id === testId ? { ...t, urlAlias: alias, updatedAt: new Date() } : t
                    ),
                    currentTest: state.currentTest?.id === testId
                        ? { ...state.currentTest, urlAlias: alias, updatedAt: new Date() }
                        : state.currentTest,
                }));
            },

            // Question Actions
            getQuestionsForTest: (testId: string) => {
                return get().questions
                    .filter((q) => q.testId === testId)
                    .sort((a, b) => a.order - b.order);
            },

            addQuestion: (question) => {
                const existingQuestions = get().questions.filter(q => q.testId === question.testId);
                const newQuestion: Question = {
                    ...question,
                    id: uuidv4(),
                    order: existingQuestions.length + 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                set((state) => ({ questions: [...state.questions, newQuestion] }));
                return newQuestion;
            },

            addQuestions: (questionsData) => {
                if (questionsData.length === 0) return [];
                const testId = questionsData[0].testId;
                const existingQuestions = get().questions.filter(q => q.testId === testId);
                let currentOrder = existingQuestions.length + 1;

                const newQuestions: Question[] = questionsData.map(q => ({
                    ...q,
                    id: uuidv4(),
                    order: currentOrder++,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }));

                set((state) => ({ questions: [...state.questions, ...newQuestions] }));
                return newQuestions;
            },

            updateQuestion: (id: string, updates: Partial<Question>) => {
                set((state) => ({
                    questions: state.questions.map((q) =>
                        q.id === id ? { ...q, ...updates, updatedAt: new Date() } : q
                    ),
                }));
            },

            deleteQuestion: (id: string) => {
                set((state) => ({
                    questions: state.questions.filter((q) => q.id !== id),
                }));
            },

            reorderQuestions: (testId: string, questionIds: string[]) => {
                set((state) => ({
                    questions: state.questions.map((q) => {
                        if (q.testId !== testId) return q;
                        const newOrder = questionIds.indexOf(q.id);
                        return newOrder !== -1 ? { ...q, order: newOrder + 1 } : q;
                    }),
                }));
            },

            duplicateQuestion: (id: string) => {
                const original = get().questions.find((q) => q.id === id);
                if (!original) return null;

                const testQuestions = get().questions.filter(q => q.testId === original.testId);
                const newQuestion: Question = {
                    ...original,
                    id: uuidv4(),
                    text: `${original.text} (Copy)`,
                    order: testQuestions.length + 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                set((state) => ({ questions: [...state.questions, newQuestion] }));
                return newQuestion;
            },
        }),
        {
            name: 'testexam-tests',
        }
    )
);
