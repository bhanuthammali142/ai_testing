// ============================================
// Core Types for the TestExam Application
// ============================================

// User & Authentication Types
export interface Admin {
    id: string;
    email?: string;
    createdAt: Date;
}

export interface TestAccess {
    type: 'public' | 'passcode' | 'email';
    passcode?: string;
    allowedEmails?: string[];
}

// Question Types
export type QuestionType = 'mcq-single' | 'mcq-multiple' | 'true-false' | 'coding';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface Question {
    id: string;
    testId: string;
    type: QuestionType;
    text: string;
    options: QuestionOption[];
    correctAnswer?: string; // For coding questions
    explanation?: string;
    difficulty: Difficulty;
    topic: string;
    points: number;
    negativeMarking: number;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

// AI Question Generation Types
export interface AIGenerationRequest {
    subject: string;
    topics: string[];
    subtopics?: string[];
    difficulty: Difficulty;
    questionCount: number;
    questionType: QuestionType;
}

// Legacy alias for backward compatibility
export type AIQuestionRequest = AIGenerationRequest;

export interface AIGeneratedQuestion {
    id: string;
    question: Question;
    status: 'pending' | 'approved' | 'rejected';
    generatedAt: Date;
    confidence?: number; // AI confidence score 0-1
    source?: string; // Generation source info
}

// Test Settings Types
export interface QuestionBehaviorSettings {
    showAllOnOnePage: boolean;
    randomizeOrder: boolean;
    allowBlankAnswers: boolean;
    enableNegativeMarking: boolean;
}

export interface ReviewSettings {
    passingScore: number;
    conclusionText: string;
    passMessage: string;
    failMessage: string;
    showScore: boolean;
    showCorrectAnswers: boolean;
    showExplanations: boolean;
    showQuestionOutline: boolean;
}

export interface AccessControlSettings {
    accessType: 'public' | 'passcode' | 'email';
    passcode?: string;
    allowedEmails?: string[];
    requireName: boolean;
    requireStudentId: boolean;
    timeLimitMinutes: number | null;
    attemptLimit: number | null;
    autoSubmitOnTimeout: boolean;
}

export interface AntiCheatingSettings {
    disableRightClick: boolean;
    disableCopyPaste: boolean;
    disableTranslate: boolean;
    disableAutocomplete: boolean;
    disableSpellcheck: boolean;
    disablePrinting: boolean;
    showTechnicalDisclosure: boolean;
}

export interface TestSettings {
    questionBehavior: QuestionBehaviorSettings;
    review: ReviewSettings;
    accessControl: AccessControlSettings;
    antiCheating: AntiCheatingSettings;
}

// Test Types
export type TestStatus = 'draft' | 'open' | 'closed' | 'scheduled';

export interface Test {
    id: string;
    name: string;
    adminPassword: string;
    settings: TestSettings;
    status: TestStatus;
    scheduledStart?: Date;
    scheduledEnd?: Date;
    urlAlias?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Candidate Types
export interface Candidate {
    id: string;
    name?: string;
    studentId?: string;
    email?: string;
}

// Attempt Types
export type AttemptStatus = 'in-progress' | 'completed' | 'timed-out' | 'abandoned';

export interface QuestionResponse {
    questionId: string;
    selectedOptions: string[];
    codeAnswer?: string;
    isCorrect: boolean;
    pointsEarned: number;
    timeTaken: number; // in seconds
}

export interface Attempt {
    id: string;
    testId: string;
    candidate: Candidate;
    responses: QuestionResponse[];
    status: AttemptStatus;
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    startedAt: Date;
    completedAt?: Date;
    timeSpentSeconds: number;
    tabSwitchCount: number;
}

// Analytics Types
export interface TestAnalytics {
    testId: string;
    totalAttempts: number;
    completedAttempts: number;
    averageScore: number;
    averageTimeMinutes: number;
    passRate: number;
    questionStats: QuestionStats[];
    scoreDistribution: ScoreDistribution[];
}

export interface QuestionStats {
    questionId: string;
    questionText: string;
    correctCount: number;
    incorrectCount: number;
    skipCount: number;
    averageTime: number;
}

export interface ScoreDistribution {
    range: string;
    count: number;
}

// Navigation Types
export interface DashboardStep {
    id: number;
    title: string;
    description: string;
    icon: string;
    path: string;
    completed: boolean;
}

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

// Modal Types
export interface ModalConfig {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    type?: 'confirm' | 'alert' | 'warning';
}

// ============================================
// CSV Question Bank Types
// ============================================

// CSV Row format (extended for all question types)
export type CSVQuestionType = 'mcq' | 'reasoning' | 'fill' | 'coding';

export interface CSVQuestionRow {
    id: string;
    subject: string;
    topic: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    question_type: CSVQuestionType;
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: 'A' | 'B' | 'C' | 'D' | '';
    explanation: string;
    // Coding question fields
    sample_input?: string;
    sample_output?: string;
    hidden_test_cases?: string;  // JSON string
    time_limit?: number;
}

// Bank Question (stored in question bank - supports MCQ and Coding)
export interface BankQuestion {
    id: string;
    subject: string;
    topic: string;
    difficulty: Difficulty;
    questionType: CSVQuestionType;  // 'mcq' | 'reasoning' | 'fill' | 'coding'
    questionText: string;

    // MCQ fields (optional for coding)
    options?: {
        A: string;
        B: string;
        C: string;
        D: string;
    };
    correctAnswer?: 'A' | 'B' | 'C' | 'D';
    explanation?: string;

    // Coding question fields (optional for MCQ)
    sampleInput?: string;
    sampleOutput?: string;
    hiddenTestCases?: Array<{
        id: string;
        input: string;
        expectedOutput: string;
        isHidden: boolean;
    }>;
    timeLimit?: number;

    // Common tracking fields
    createdAt: Date;
    usedInExams: string[];
    usageCount: number;
}

// CSV Validation Result
export interface CSVValidationError {
    row: number;
    field: string;
    message: string;
    value?: string;
}

// Coding Bank Question (stored in coding question bank)
export interface CodingBankQuestion {
    id: string;
    subject: string;
    topic: string;
    difficulty: Difficulty;
    problemStatement: string;
    sampleInput: string;
    sampleOutput: string;
    hiddenTestCases: Array<{
        id: string;
        input: string;
        expectedOutput: string;
        isHidden: boolean;
    }>;
    timeLimit: number;
    createdAt: Date;
    usedInExams: string[];
    usageCount: number;
}

export interface CSVParseResult {
    success: boolean;
    questions: BankQuestion[];
    codingQuestions: CodingBankQuestion[];  // Separate list for coding questions
    errors: CSVValidationError[];
    totalRows: number;
    validRows: number;
    invalidRows: number;
}

// Question Bank Filter Options
export interface QuestionBankFilter {
    subjects?: string[];
    topics?: string[];
    difficulties?: Difficulty[];
    excludeUsedIn?: string[]; // Exclude questions used in these exam IDs
    excludeQuestionIds?: string[]; // Specific question IDs to exclude
}

// Question Selection Request
export interface QuestionSelectionRequest {
    subject: string;
    topics: string[];
    difficulty: Difficulty | 'mixed';
    count: number;
    examId: string; // To mark questions as used
    avoidRepetition: boolean;
}

// Question Selection Result
export interface QuestionSelectionResult {
    success: boolean;
    questions: BankQuestion[];
    requestedCount: number;
    selectedCount: number;
    warning?: string;
    availablePool: number;
}

// Question Bank Stats
export interface QuestionBankStats {
    totalQuestions: number;
    bySubject: Record<string, number>;
    byTopic: Record<string, number>;
    byDifficulty: Record<Difficulty, number>;
    uniqueSubjects: string[];
    uniqueTopics: string[];
    usedQuestions: number;
    unusedQuestions: number;
}

// ============================================
// Coding Types Export
// ============================================
export * from './coding';
