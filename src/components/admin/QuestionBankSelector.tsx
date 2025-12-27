// ============================================
// Question Bank Selector Component
// ============================================
// Enables selecting questions from the bank for an exam
// Supports filtering by subject, topic, difficulty

import React, { useState, useMemo } from 'react';
import {
    Database,
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    Check,
    X,
    AlertTriangle,
    Shuffle,
    Plus
} from 'lucide-react';
import { useQuestionBankStore, useTestStore, useUIStore } from '../../stores';
import { BankQuestion, Difficulty, Question } from '../../types';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// Props Interface
// ============================================

interface QuestionBankSelectorProps {
    testId: string;
    onClose: () => void;
    onQuestionsAdded: (count: number) => void;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Convert BankQuestion to Question format for the test
 * Handles both MCQ and Coding questions
 */
function convertToTestQuestion(
    bankQuestion: BankQuestion,
    testId: string,
    order: number
): Question {
    // For coding questions, return a coding type question
    if (bankQuestion.questionType === 'coding') {
        return {
            id: uuidv4(),
            testId,
            type: 'coding',
            text: bankQuestion.questionText,
            options: [],  // Coding questions don't have options
            explanation: bankQuestion.explanation || '',
            difficulty: bankQuestion.difficulty,
            topic: bankQuestion.topic,
            points: bankQuestion.difficulty === 'easy' ? 5 : bankQuestion.difficulty === 'medium' ? 10 : 15,
            negativeMarking: 0,
            order,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    // For MCQ/reasoning/fill questions, include options
    const options = bankQuestion.options || { A: '', B: '', C: '', D: '' };
    return {
        id: uuidv4(),
        testId,
        type: 'mcq-single',
        text: bankQuestion.questionText,
        options: [
            { id: uuidv4(), text: options.A, isCorrect: bankQuestion.correctAnswer === 'A' },
            { id: uuidv4(), text: options.B, isCorrect: bankQuestion.correctAnswer === 'B' },
            { id: uuidv4(), text: options.C, isCorrect: bankQuestion.correctAnswer === 'C' },
            { id: uuidv4(), text: options.D, isCorrect: bankQuestion.correctAnswer === 'D' },
        ],
        explanation: bankQuestion.explanation || '',
        difficulty: bankQuestion.difficulty,
        topic: bankQuestion.topic,
        points: bankQuestion.difficulty === 'easy' ? 1 : bankQuestion.difficulty === 'medium' ? 2 : 3,
        negativeMarking: 0,
        order,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

// ============================================
// Difficulty Badge Component
// ============================================

const DifficultyBadge: React.FC<{ difficulty: Difficulty }> = ({ difficulty }) => {
    const colors = {
        easy: 'bg-success-500/20 text-success-400 border-success-500/30',
        medium: 'bg-warning-500/20 text-warning-400 border-warning-500/30',
        hard: 'bg-danger-500/20 text-danger-400 border-danger-500/30'
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[difficulty]}`}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </span>
    );
};

// ============================================
// Main Component
// ============================================

const QuestionBankSelector: React.FC<QuestionBankSelectorProps> = ({
    testId,
    onClose,
    onQuestionsAdded
}) => {
    // Stores
    const {
        questions: bankQuestions,
        getSubjects,
        getTopicsForSubject,
        selectQuestionsForExam,
        markQuestionsUsed
    } = useQuestionBankStore();
    const { addQuestions } = useTestStore();
    const { showToast } = useUIStore();

    // Local State - Selection Mode
    const [selectionMode, setSelectionMode] = useState<'manual' | 'auto'>('auto');

    // Local State - Auto Selection
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'mixed'>('mixed');
    const [questionCount, setQuestionCount] = useState<number>(5);
    const [avoidRepetition, setAvoidRepetition] = useState<boolean>(true);

    // Local State - Manual Selection
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | ''>('');
    const [filterQuestionType, setFilterQuestionType] = useState<'all' | 'mcq' | 'coding'>('all');
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
    const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

    // Get metadata
    const subjects = getSubjects();
    const topics = selectedSubject ? getTopicsForSubject(selectedSubject) : [];

    // Question type stats
    const questionTypeStats = useMemo(() => ({
        mcq: bankQuestions.filter(q => q.questionType !== 'coding').length,
        coding: bankQuestions.filter(q => q.questionType === 'coding').length
    }), [bankQuestions]);

    // Available questions preview for auto mode
    const availablePreview = useMemo(() => {
        if (!selectedSubject) return { total: 0, byDifficulty: { easy: 0, medium: 0, hard: 0 } };

        let filtered = bankQuestions.filter(q =>
            q.subject.toLowerCase() === selectedSubject.toLowerCase()
        );

        if (selectedTopics.length > 0) {
            filtered = filtered.filter(q =>
                selectedTopics.some(t => t.toLowerCase() === q.topic.toLowerCase())
            );
        }

        return {
            total: filtered.length,
            byDifficulty: {
                easy: filtered.filter(q => q.difficulty === 'easy').length,
                medium: filtered.filter(q => q.difficulty === 'medium').length,
                hard: filtered.filter(q => q.difficulty === 'hard').length
            }
        };
    }, [bankQuestions, selectedSubject, selectedTopics]);

    // Filtered questions for manual mode
    const filteredQuestions = useMemo(() => {
        let filtered = [...bankQuestions];

        // Filter by question type
        if (filterQuestionType === 'coding') {
            filtered = filtered.filter(q => q.questionType === 'coding');
        } else if (filterQuestionType === 'mcq') {
            filtered = filtered.filter(q => q.questionType !== 'coding');
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(q =>
                q.questionText.toLowerCase().includes(query) ||
                q.subject.toLowerCase().includes(query) ||
                q.topic.toLowerCase().includes(query)
            );
        }

        if (filterDifficulty) {
            filtered = filtered.filter(q => q.difficulty === filterDifficulty);
        }

        return filtered;
    }, [bankQuestions, searchQuery, filterDifficulty, filterQuestionType]);

    // ========================================
    // Handlers
    // ========================================

    const handleToggleTopic = (topic: string) => {
        setSelectedTopics(prev =>
            prev.includes(topic)
                ? prev.filter(t => t !== topic)
                : [...prev, topic]
        );
    };

    const handleToggleQuestion = (questionId: string) => {
        setSelectedQuestionIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    const handleAutoSelect = () => {
        if (!selectedSubject) {
            showToast('error', 'Please select a subject');
            return;
        }

        if (questionCount <= 0) {
            showToast('error', 'Please enter a valid question count');
            return;
        }

        const result = selectQuestionsForExam({
            subject: selectedSubject,
            topics: selectedTopics,
            difficulty: selectedDifficulty,
            count: questionCount,
            examId: testId,
            avoidRepetition
        });

        if (result.questions.length === 0) {
            showToast('error', 'No questions available matching your criteria');
            return;
        }

        // Add questions to test
        // Convert to test questions (order is handled by addQuestions)
        const questionsToAdd = result.questions.map((bankQ) =>
            convertToTestQuestion(bankQ, testId, 0)
        );
        addQuestions(questionsToAdd);

        // Mark questions as used
        markQuestionsUsed(result.questions.map(q => q.id), testId);

        if (result.warning) {
            showToast('warning', result.warning);
        } else {
            showToast('success', `Added ${result.selectedCount} questions to the exam`);
        }

        onQuestionsAdded(result.selectedCount);
        onClose();
    };

    const handleManualAdd = () => {
        if (selectedQuestionIds.size === 0) {
            showToast('error', 'Please select at least one question');
            return;
        }

        const selectedQuestions = bankQuestions.filter(q =>
            selectedQuestionIds.has(q.id)
        );

        // Add questions to test
        const questionsToAdd = selectedQuestions.map((bankQ) =>
            convertToTestQuestion(bankQ, testId, 0)
        );
        addQuestions(questionsToAdd);

        // Mark questions as used
        markQuestionsUsed(selectedQuestions.map(q => q.id), testId);

        showToast('success', `Added ${selectedQuestions.length} questions to the exam`);
        onQuestionsAdded(selectedQuestions.length);
        onClose();
    };

    // ========================================
    // Render
    // ========================================

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary-500/20">
                            <Database size={24} className="text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Import from Question Bank</h2>
                            <p className="text-sm text-slate-400">
                                {bankQuestions.length} questions available
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Empty State */}
                {bankQuestions.length === 0 ? (
                    <div className="p-12 text-center">
                        <Database size={48} className="mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400 mb-4">
                            No questions in the bank. Upload a CSV file first.
                        </p>
                        <button
                            onClick={onClose}
                            className="glass-button px-4 py-2 rounded-lg"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Mode Tabs */}
                        <div className="px-6 pt-4 flex gap-2">
                            <button
                                onClick={() => setSelectionMode('auto')}
                                className={`
                                    px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                                    ${selectionMode === 'auto'
                                        ? 'bg-primary-500 text-white'
                                        : 'glass-button text-slate-300'
                                    }
                                `}
                            >
                                <Shuffle size={16} />
                                Auto Select
                            </button>
                            <button
                                onClick={() => setSelectionMode('manual')}
                                className={`
                                    px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                                    ${selectionMode === 'manual'
                                        ? 'bg-primary-500 text-white'
                                        : 'glass-button text-slate-300'
                                    }
                                `}
                            >
                                <Filter size={16} />
                                Manual Select
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Auto Selection Mode */}
                            {selectionMode === 'auto' && (
                                <div className="space-y-6">
                                    {/* Subject Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">
                                            Subject
                                        </label>
                                        <select
                                            value={selectedSubject}
                                            onChange={(e) => {
                                                setSelectedSubject(e.target.value);
                                                setSelectedTopics([]);
                                            }}
                                            className="w-full px-4 py-3 bg-slate-800 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-primary-500"
                                        >
                                            <option value="">Select a subject...</option>
                                            {subjects.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Topic Selection */}
                                    {selectedSubject && topics.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-white mb-2">
                                                Topics (optional - leave empty for all)
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {topics.map(topic => (
                                                    <button
                                                        key={topic}
                                                        onClick={() => handleToggleTopic(topic)}
                                                        className={`
                                                            px-3 py-1.5 rounded-lg text-sm transition-all
                                                            ${selectedTopics.includes(topic)
                                                                ? 'bg-primary-500 text-white'
                                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                                            }
                                                        `}
                                                    >
                                                        {topic}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Difficulty & Count */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white mb-2">
                                                Difficulty
                                            </label>
                                            <select
                                                value={selectedDifficulty}
                                                onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty | 'mixed')}
                                                className="w-full px-4 py-3 bg-slate-800 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-primary-500"
                                            >
                                                <option value="mixed">Mixed (30% Easy, 50% Medium, 20% Hard)</option>
                                                <option value="easy">Easy Only</option>
                                                <option value="medium">Medium Only</option>
                                                <option value="hard">Hard Only</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white mb-2">
                                                Number of Questions
                                            </label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={100}
                                                value={questionCount}
                                                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 0)}
                                                className="w-full px-4 py-3 bg-slate-800 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-primary-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Avoid Repetition Toggle */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setAvoidRepetition(!avoidRepetition)}
                                            className={`
                                                w-12 h-6 rounded-full transition-all relative
                                                ${avoidRepetition ? 'bg-primary-500' : 'bg-slate-700'}
                                            `}
                                        >
                                            <div className={`
                                                absolute top-1 w-4 h-4 bg-white rounded-full transition-all
                                                ${avoidRepetition ? 'left-7' : 'left-1'}
                                            `} />
                                        </button>
                                        <span className="text-sm text-slate-300">
                                            Avoid questions already used in this exam
                                        </span>
                                    </div>

                                    {/* Available Preview */}
                                    {selectedSubject && (
                                        <div className="p-4 bg-slate-800/50 rounded-lg">
                                            <p className="text-sm text-slate-400 mb-2">Available Questions:</p>
                                            <div className="flex items-center gap-4">
                                                <span className="text-2xl font-bold text-white">
                                                    {availablePreview.total}
                                                </span>
                                                <div className="flex gap-2 text-xs">
                                                    <span className="px-2 py-1 bg-success-500/20 text-success-400 rounded">
                                                        {availablePreview.byDifficulty.easy} Easy
                                                    </span>
                                                    <span className="px-2 py-1 bg-warning-500/20 text-warning-400 rounded">
                                                        {availablePreview.byDifficulty.medium} Medium
                                                    </span>
                                                    <span className="px-2 py-1 bg-danger-500/20 text-danger-400 rounded">
                                                        {availablePreview.byDifficulty.hard} Hard
                                                    </span>
                                                </div>
                                            </div>
                                            {questionCount > availablePreview.total && (
                                                <div className="mt-2 flex items-center gap-2 text-warning-400 text-sm">
                                                    <AlertTriangle size={14} />
                                                    <span>Only {availablePreview.total} questions available</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Manual Selection Mode */}
                            {selectionMode === 'manual' && (
                                <div className="space-y-4">
                                    {/* Question Type Tabs */}
                                    <div className="flex gap-2 p-1 bg-slate-800/50 rounded-lg">
                                        <button
                                            onClick={() => setFilterQuestionType('all')}
                                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterQuestionType === 'all'
                                                    ? 'bg-primary-500 text-white'
                                                    : 'text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            All ({questionTypeStats.mcq + questionTypeStats.coding})
                                        </button>
                                        <button
                                            onClick={() => setFilterQuestionType('mcq')}
                                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterQuestionType === 'mcq'
                                                    ? 'bg-primary-500 text-white'
                                                    : 'text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            MCQ ({questionTypeStats.mcq})
                                        </button>
                                        <button
                                            onClick={() => setFilterQuestionType('coding')}
                                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterQuestionType === 'coding'
                                                    ? 'bg-primary-500 text-white'
                                                    : 'text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            💻 Coding ({questionTypeStats.coding})
                                        </button>
                                    </div>

                                    {/* Search & Filter */}
                                    <div className="flex gap-3">
                                        <div className="flex-1 relative">
                                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search questions..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-slate-800 rounded-lg border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                                            />
                                        </div>
                                        <select
                                            value={filterDifficulty}
                                            onChange={(e) => setFilterDifficulty(e.target.value as Difficulty | '')}
                                            className="px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-primary-500"
                                        >
                                            <option value="">All Difficulties</option>
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>

                                    {/* Selection Info */}
                                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                                        <p className="text-sm text-slate-400">
                                            {selectedQuestionIds.size} questions selected
                                        </p>
                                        {selectedQuestionIds.size > 0 && (
                                            <button
                                                onClick={() => setSelectedQuestionIds(new Set())}
                                                className="text-sm text-primary-400 hover:text-primary-300"
                                            >
                                                Clear Selection
                                            </button>
                                        )}
                                    </div>

                                    {/* Questions List */}
                                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                                        {filteredQuestions.map((q) => (
                                            <div
                                                key={q.id}
                                                className={`
                                                    p-4 rounded-lg border transition-all cursor-pointer
                                                    ${selectedQuestionIds.has(q.id)
                                                        ? 'bg-primary-500/10 border-primary-500/30'
                                                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                                    }
                                                `}
                                                onClick={() => handleToggleQuestion(q.id)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`
                                                        flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center
                                                        ${selectedQuestionIds.has(q.id)
                                                            ? 'bg-primary-500 border-primary-500'
                                                            : 'border-slate-500'
                                                        }
                                                    `}>
                                                        {selectedQuestionIds.has(q.id) && (
                                                            <Check size={12} className="text-white" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded">
                                                                {q.subject}
                                                            </span>
                                                            <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded">
                                                                {q.topic}
                                                            </span>
                                                            <DifficultyBadge difficulty={q.difficulty} />
                                                        </div>
                                                        <p className="text-sm text-white line-clamp-2">
                                                            {q.questionText}
                                                        </p>

                                                        {expandedQuestionId === q.id && q.options && (
                                                            <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
                                                                {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                                                                    <div
                                                                        key={opt}
                                                                        className={`
                                                                            p-2 rounded text-xs
                                                                            ${q.correctAnswer === opt
                                                                                ? 'bg-success-500/20 text-success-400'
                                                                                : 'bg-slate-700/50 text-slate-300'
                                                                            }
                                                                        `}
                                                                    >
                                                                        <span className="font-medium">{opt}.</span> {q.options![opt]}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setExpandedQuestionId(
                                                                expandedQuestionId === q.id ? null : q.id
                                                            );
                                                        }}
                                                        className="p-1 text-slate-400 hover:text-white"
                                                    >
                                                        {expandedQuestionId === q.id ? (
                                                            <ChevronUp size={16} />
                                                        ) : (
                                                            <ChevronDown size={16} />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="glass-button px-4 py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={selectionMode === 'auto' ? handleAutoSelect : handleManualAdd}
                                className="gradient-button flex items-center gap-2"
                            >
                                <Plus size={18} />
                                {selectionMode === 'auto'
                                    ? `Add ${questionCount} Questions`
                                    : `Add ${selectedQuestionIds.size} Questions`
                                }
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default QuestionBankSelector;
