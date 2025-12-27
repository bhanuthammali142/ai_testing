// ============================================
// Rule-Based Generator - Intelligence Core
// Generates questions without repetition
// ============================================

import { questionTemplates, QuestionTemplate } from './questionTemplates';
import { questionTracker } from './questionTracker';

// Input type for generation request
export interface GenerationInput {
    subject: string;
    topics: string[];
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
    count: number;
    testId?: string;
}

// Output question format
export interface GeneratedQuestion {
    id: string;
    type: 'mcq';
    question: string;
    options: string[];
    correctAnswer: string;
    topic: string;
    difficulty: string;
    explanation: string;
    subject: string;
}

// Generation result
export interface GenerationResult {
    questions: GeneratedQuestion[];
    warning?: string;
    stats: {
        requested: number;
        generated: number;
        availableRemaining: number;
    };
}

/**
 * Fisher-Yates shuffle algorithm
 * Randomizes array in-place
 */
const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

/**
 * Get questions from template by subject, topic, and difficulty
 */
const getQuestionsFromTemplate = (
    subject: string,
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard'
): QuestionTemplate[] => {
    return questionTemplates[subject]?.[topic]?.[difficulty] || [];
};

/**
 * Get all questions for a topic (all difficulties)
 */
const getAllQuestionsForTopic = (
    subject: string,
    topic: string
): { question: QuestionTemplate; difficulty: string }[] => {
    const result: { question: QuestionTemplate; difficulty: string }[] = [];
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];

    difficulties.forEach(diff => {
        const questions = getQuestionsFromTemplate(subject, topic, diff);
        questions.forEach(q => result.push({ question: q, difficulty: diff }));
    });

    return result;
};

/**
 * Main generation function
 * Handles all logic for generating unique questions
 */
export const generateQuestionsFromRules = (input: GenerationInput): GenerationResult => {
    const { subject, topics, difficulty, count, testId } = input;

    // Collect all candidate questions
    const candidatePool: { question: QuestionTemplate; difficulty: string; topic: string }[] = [];

    topics.forEach(topic => {
        if (difficulty === 'mixed') {
            // Get all difficulties
            const allQuestions = getAllQuestionsForTopic(subject, topic);
            allQuestions.forEach(({ question, difficulty: diff }) => {
                candidatePool.push({ question, difficulty: diff, topic });
            });
        } else {
            // Get specific difficulty
            const questions = getQuestionsFromTemplate(subject, topic, difficulty);
            questions.forEach(q => {
                candidatePool.push({ question: q, difficulty, topic });
            });
        }
    });

    // Filter out already-used questions
    const unusedPool = candidatePool.filter(
        item => !questionTracker.isUsed(item.question.id, testId)
    );

    // Shuffle for randomness
    const shuffledPool = shuffleArray(unusedPool);

    // Select required count
    const selectedQuestions = shuffledPool.slice(0, count);

    // Mark selected as used
    const selectedIds = selectedQuestions.map(item => item.question.id);
    questionTracker.markManyUsed(selectedIds, testId);

    // Transform to output format
    const generatedQuestions: GeneratedQuestion[] = selectedQuestions.map(item => ({
        id: item.question.id,
        type: 'mcq' as const,
        question: item.question.question,
        options: item.question.options.map(opt => opt.text),
        correctAnswer: item.question.correctAnswer,
        topic: item.topic,
        difficulty: item.difficulty,
        explanation: item.question.explanation,
        subject: subject
    }));

    // Calculate remaining
    const remaining = unusedPool.length - selectedQuestions.length;

    // Prepare result
    const result: GenerationResult = {
        questions: generatedQuestions,
        stats: {
            requested: count,
            generated: generatedQuestions.length,
            availableRemaining: remaining
        }
    };

    // Add warning if not enough questions
    if (generatedQuestions.length < count) {
        if (generatedQuestions.length === 0) {
            result.warning = `No more unique questions available for selected topic(s). Try resetting or selecting different topics.`;
        } else {
            result.warning = `Only ${generatedQuestions.length} unique questions available. ${count - generatedQuestions.length} more were requested but pool is exhausted.`;
        }
    }

    return result;
};

/**
 * Get available question count before generation
 * Useful for UI to show availability
 */
export const getAvailableCount = (
    subject: string,
    topics: string[],
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed',
    testId?: string
): number => {
    let totalAvailable = 0;

    topics.forEach(topic => {
        if (difficulty === 'mixed') {
            const allQuestions = getAllQuestionsForTopic(subject, topic);
            const unused = allQuestions.filter(
                ({ question }) => !questionTracker.isUsed(question.id, testId)
            );
            totalAvailable += unused.length;
        } else {
            const questions = getQuestionsFromTemplate(subject, topic, difficulty);
            const unusedIds = questionTracker.filterUnused(
                questions.map(q => q.id),
                testId
            );
            totalAvailable += unusedIds.length;
        }
    });

    return totalAvailable;
};

export default generateQuestionsFromRules;
