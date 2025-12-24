// ============================================
// Question Tracker - Anti-Repetition Engine
// Ensures no duplicate questions within sessions/tests
// ============================================

// Storage key for localStorage
const STORAGE_KEY = 'question_tracker';

interface TrackerData {
    globalUsed: string[];           // All-time used question IDs
    testUsed: Record<string, string[]>;  // Used IDs per test
    sessionUsed: string[];          // Current session used IDs
    lastReset: string;              // Last reset timestamp
}

// Initialize tracker data
const getDefaultData = (): TrackerData => ({
    globalUsed: [],
    testUsed: {},
    sessionUsed: [],
    lastReset: new Date().toISOString()
});

// Load tracker from localStorage
const loadTracker = (): TrackerData => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.warn('Failed to load question tracker:', error);
    }
    return getDefaultData();
};

// Save tracker to localStorage
const saveTracker = (data: TrackerData): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.warn('Failed to save question tracker:', error);
    }
};

// In-memory cache for fast access
let trackerCache: TrackerData = loadTracker();

/**
 * Question Tracker API
 * Exposes methods for tracking and managing used questions
 */
export const questionTracker = {
    /**
     * Mark a question as used
     * @param questionId - Unique question ID
     * @param testId - Optional test ID for test-specific tracking
     */
    markUsed: (questionId: string, testId?: string): void => {
        // Add to session
        if (!trackerCache.sessionUsed.includes(questionId)) {
            trackerCache.sessionUsed.push(questionId);
        }

        // Add to global
        if (!trackerCache.globalUsed.includes(questionId)) {
            trackerCache.globalUsed.push(questionId);
        }

        // Add to test-specific
        if (testId) {
            if (!trackerCache.testUsed[testId]) {
                trackerCache.testUsed[testId] = [];
            }
            if (!trackerCache.testUsed[testId].includes(questionId)) {
                trackerCache.testUsed[testId].push(questionId);
            }
        }

        saveTracker(trackerCache);
    },

    /**
     * Mark multiple questions as used
     * @param questionIds - Array of question IDs
     * @param testId - Optional test ID
     */
    markManyUsed: (questionIds: string[], testId?: string): void => {
        questionIds.forEach(id => questionTracker.markUsed(id, testId));
    },

    /**
     * Check if a question has been used
     * @param questionId - Question ID to check
     * @param testId - Optional test ID for test-specific check
     * @returns true if question was used
     */
    isUsed: (questionId: string, testId?: string): boolean => {
        // Check session first (most restrictive)
        if (trackerCache.sessionUsed.includes(questionId)) {
            return true;
        }

        // Check test-specific if provided
        if (testId && trackerCache.testUsed[testId]?.includes(questionId)) {
            return true;
        }

        return false;
    },

    /**
     * Check if question is globally used (all-time)
     * @param questionId - Question ID
     */
    isGloballyUsed: (questionId: string): boolean => {
        return trackerCache.globalUsed.includes(questionId);
    },

    /**
     * Get all used question IDs for a test
     * @param testId - Test ID
     */
    getUsedForTest: (testId: string): string[] => {
        return trackerCache.testUsed[testId] || [];
    },

    /**
     * Get session used question IDs
     */
    getSessionUsed: (): string[] => {
        return [...trackerCache.sessionUsed];
    },

    /**
     * Reset tracker for a specific test
     * Allows fresh questions for new attempts
     * @param testId - Test ID to reset
     */
    resetForTest: (testId: string): void => {
        if (trackerCache.testUsed[testId]) {
            delete trackerCache.testUsed[testId];
            saveTracker(trackerCache);
        }
    },

    /**
     * Reset session tracking
     * Call when starting a new generation session
     */
    resetSession: (): void => {
        trackerCache.sessionUsed = [];
        saveTracker(trackerCache);
    },

    /**
     * Full reset - clears all tracking data
     * Use with caution!
     */
    resetAll: (): void => {
        trackerCache = getDefaultData();
        saveTracker(trackerCache);
    },

    /**
     * Get statistics about tracked questions
     */
    getStats: (): {
        totalUsed: number;
        sessionUsed: number;
        testsTracked: number;
    } => {
        return {
            totalUsed: trackerCache.globalUsed.length,
            sessionUsed: trackerCache.sessionUsed.length,
            testsTracked: Object.keys(trackerCache.testUsed).length
        };
    },

    /**
     * Get unused question IDs from a pool
     * Filters out already-used questions
     * @param questionIds - Pool of question IDs
     * @param testId - Optional test ID for test-specific filtering
     */
    filterUnused: (questionIds: string[], testId?: string): string[] => {
        return questionIds.filter(id => !questionTracker.isUsed(id, testId));
    }
};

export default questionTracker;
