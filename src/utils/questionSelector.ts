// ============================================
// Intelligent Question Selector
// ============================================
// Provides smart question selection based on subject, topic, difficulty
// Ensures no duplicate questions and tracks usage

import {
    BankQuestion,
    QuestionBankFilter,
    QuestionSelectionRequest,
    QuestionSelectionResult,
    Difficulty
} from '../types';

/**
 * Fisher-Yates shuffle algorithm for random selection
 * Deterministic and unbiased shuffling
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Filter questions based on criteria
 */
export function filterQuestions(
    questions: BankQuestion[],
    filter: QuestionBankFilter
): BankQuestion[] {
    return questions.filter(q => {
        // Filter by subjects
        if (filter.subjects && filter.subjects.length > 0) {
            if (!filter.subjects.some(s =>
                s.toLowerCase() === q.subject.toLowerCase()
            )) {
                return false;
            }
        }

        // Filter by topics
        if (filter.topics && filter.topics.length > 0) {
            if (!filter.topics.some(t =>
                t.toLowerCase() === q.topic.toLowerCase()
            )) {
                return false;
            }
        }

        // Filter by difficulties
        if (filter.difficulties && filter.difficulties.length > 0) {
            if (!filter.difficulties.includes(q.difficulty)) {
                return false;
            }
        }

        // Exclude questions used in specific exams
        if (filter.excludeUsedIn && filter.excludeUsedIn.length > 0) {
            if (filter.excludeUsedIn.some(examId =>
                q.usedInExams.includes(examId)
            )) {
                return false;
            }
        }

        // Exclude specific question IDs
        if (filter.excludeQuestionIds && filter.excludeQuestionIds.length > 0) {
            if (filter.excludeQuestionIds.includes(q.id)) {
                return false;
            }
        }

        return true;
    });
}

/**
 * Get difficulty distribution for mixed difficulty selection
 * Returns balanced distribution: 30% Easy, 50% Medium, 20% Hard
 */
function getMixedDifficultyDistribution(count: number): Record<Difficulty, number> {
    const easy = Math.round(count * 0.3);
    const hard = Math.round(count * 0.2);
    const medium = count - easy - hard;

    return {
        easy,
        medium,
        hard
    };
}

/**
 * Select questions from a pool based on difficulty
 */
function selectByDifficulty(
    pool: BankQuestion[],
    difficulty: Difficulty | 'mixed',
    count: number
): BankQuestion[] {
    if (difficulty === 'mixed') {
        const distribution = getMixedDifficultyDistribution(count);
        const selected: BankQuestion[] = [];

        // Group pool by difficulty
        const byDifficulty: Record<Difficulty, BankQuestion[]> = {
            easy: pool.filter(q => q.difficulty === 'easy'),
            medium: pool.filter(q => q.difficulty === 'medium'),
            hard: pool.filter(q => q.difficulty === 'hard')
        };

        // Select from each difficulty level
        for (const diff of ['easy', 'medium', 'hard'] as Difficulty[]) {
            const availableForDiff = shuffleArray(byDifficulty[diff]);
            const neededForDiff = distribution[diff];
            const selectedForDiff = availableForDiff.slice(0, neededForDiff);
            selected.push(...selectedForDiff);
        }

        // If we don't have enough, try to fill from any available
        if (selected.length < count) {
            const selectedIds = new Set(selected.map(q => q.id));
            const remaining = pool.filter(q => !selectedIds.has(q.id));
            const shuffledRemaining = shuffleArray(remaining);
            const needed = count - selected.length;
            selected.push(...shuffledRemaining.slice(0, needed));
        }

        return shuffleArray(selected);
    } else {
        // Single difficulty selection
        const matchingDifficulty = pool.filter(q => q.difficulty === difficulty);
        const shuffled = shuffleArray(matchingDifficulty);
        return shuffled.slice(0, count);
    }
}

/**
 * Main function: Select questions based on criteria
 * Implements intelligent selection with anti-repetition
 */
export function selectQuestions(
    allQuestions: BankQuestion[],
    request: QuestionSelectionRequest
): QuestionSelectionResult {
    // Build filter based on request
    const filter: QuestionBankFilter = {
        subjects: request.subject ? [request.subject] : undefined,
        topics: request.topics.length > 0 ? request.topics : undefined,
    };

    // If avoiding repetition, exclude questions already used in this exam
    if (request.avoidRepetition) {
        filter.excludeUsedIn = [request.examId];
    }

    // Filter questions
    let pool = filterQuestions(allQuestions, filter);
    const availablePool = pool.length;

    // Check if we have enough questions
    if (pool.length === 0) {
        return {
            success: false,
            questions: [],
            requestedCount: request.count,
            selectedCount: 0,
            warning: 'No questions found matching the criteria. Please adjust your filters or upload more questions.',
            availablePool: 0
        };
    }

    // Select questions based on difficulty
    const selected = selectByDifficulty(pool, request.difficulty, request.count);

    // Build result
    const result: QuestionSelectionResult = {
        success: selected.length === request.count,
        questions: selected,
        requestedCount: request.count,
        selectedCount: selected.length,
        availablePool
    };

    // Add warning if insufficient questions
    if (selected.length < request.count) {
        const shortage = request.count - selected.length;
        result.warning = `Only ${selected.length} questions available. ${shortage} fewer than requested. Consider adding more questions or adjusting filters.`;
    }

    return result;
}

/**
 * Get available topics for a subject
 */
export function getTopicsForSubject(
    questions: BankQuestion[],
    subject: string
): string[] {
    const topics = new Set<string>();
    questions
        .filter(q => q.subject.toLowerCase() === subject.toLowerCase())
        .forEach(q => topics.add(q.topic));
    return Array.from(topics).sort();
}

/**
 * Get all unique subjects from questions
 */
export function getAllSubjects(questions: BankQuestion[]): string[] {
    const subjects = new Set<string>();
    questions.forEach(q => subjects.add(q.subject));
    return Array.from(subjects).sort();
}

/**
 * Get question count by criteria
 */
export function getQuestionCount(
    questions: BankQuestion[],
    filter: QuestionBankFilter
): number {
    return filterQuestions(questions, filter).length;
}

/**
 * Preview available questions for selection
 * Returns count breakdown by difficulty
 */
export function previewAvailableQuestions(
    allQuestions: BankQuestion[],
    request: Omit<QuestionSelectionRequest, 'count' | 'examId' | 'avoidRepetition'>
): { total: number; byDifficulty: Record<Difficulty, number> } {
    const filter: QuestionBankFilter = {
        subjects: request.subject ? [request.subject] : undefined,
        topics: request.topics.length > 0 ? request.topics : undefined,
    };

    const filtered = filterQuestions(allQuestions, filter);

    return {
        total: filtered.length,
        byDifficulty: {
            easy: filtered.filter(q => q.difficulty === 'easy').length,
            medium: filtered.filter(q => q.difficulty === 'medium').length,
            hard: filtered.filter(q => q.difficulty === 'hard').length
        }
    };
}

/**
 * Sort questions by topic then difficulty
 */
export function sortQuestions(questions: BankQuestion[]): BankQuestion[] {
    return [...questions].sort((a, b) => {
        // First by topic
        const topicCompare = a.topic.localeCompare(b.topic);
        if (topicCompare !== 0) return topicCompare;

        // Then by difficulty
        const difficultyOrder: Record<Difficulty, number> = {
            easy: 1,
            medium: 2,
            hard: 3
        };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });
}
