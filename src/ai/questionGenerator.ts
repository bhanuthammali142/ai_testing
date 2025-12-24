// ============================================
// Question Generator - Public System Interface
// Single entry point for the intelligent generation system
// ============================================

import { questionTracker } from './questionTracker';
import {
    generateQuestionsFromRules,
    getAvailableCount,
    GenerationInput,
    GenerationResult,
    GeneratedQuestion
} from './ruleBasedGenerator';
import { getSubjects, getTopics, getQuestionCount } from './questionTemplates';

// Re-export types for external use
export type { GenerationInput, GenerationResult, GeneratedQuestion };

/**
 * Question Generator API
 * Main interface for the intelligent question generation system
 */
export const questionGenerator = {
    /**
     * Generate questions based on input parameters
     * Guarantees no repetition within session/test
     * 
     * @param input - Generation parameters
     * @returns Generated questions with stats
     */
    generateQuestions: (input: GenerationInput): GenerationResult => {
        return generateQuestionsFromRules(input);
    },

    /**
     * Reset used questions for a specific test
     * Allows fresh pool for new test attempts
     * 
     * @param testId - Test ID to reset
     */
    resetUsedQuestions: (testId: string): void => {
        questionTracker.resetForTest(testId);
    },

    /**
     * Reset current session tracking
     * Call when user wants fresh questions
     */
    resetSession: (): void => {
        questionTracker.resetSession();
    },

    /**
     * Full reset - clears all tracking
     * Use when clearing all data
     */
    resetAll: (): void => {
        questionTracker.resetAll();
    },

    /**
     * Get available question count for given criteria
     * Useful for UI to show availability
     */
    getAvailableQuestionCount: (
        subject: string,
        topics: string[],
        difficulty: 'easy' | 'medium' | 'hard' | 'mixed',
        testId?: string
    ): number => {
        return getAvailableCount(subject, topics, difficulty, testId);
    },

    /**
     * Get all available subjects
     */
    getSubjects: (): string[] => {
        return getSubjects();
    },

    /**
     * Get topics for a subject
     */
    getTopics: (subject: string): string[] => {
        return getTopics(subject);
    },

    /**
     * Get total question count for subject/topic/difficulty
     * (Before filtering used ones)
     */
    getTotalQuestionCount: (
        subject: string,
        topic: string,
        difficulty: 'easy' | 'medium' | 'hard'
    ): number => {
        return getQuestionCount(subject, topic, difficulty);
    },

    /**
     * Get tracker statistics
     */
    getStats: () => {
        return questionTracker.getStats();
    },

    /**
     * Check if a specific question was used
     */
    isQuestionUsed: (questionId: string, testId?: string): boolean => {
        return questionTracker.isUsed(questionId, testId);
    },

    /**
     * Mark questions as used (for approved questions)
     */
    markQuestionsUsed: (questionIds: string[], testId?: string): void => {
        questionTracker.markManyUsed(questionIds, testId);
    }
};

// Default export
export default questionGenerator;

// Named exports for direct imports
export { questionTracker } from './questionTracker';
export { questionTemplates, getSubjects, getTopics } from './questionTemplates';
