// ============================================
// Exam Taking Interface - Fixed Version
// ============================================

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Flag,
    Check,
    AlertTriangle,
    Send
} from 'lucide-react';
import { useTestStore, useAttemptStore, useUIStore } from '../../stores';
import { Question } from '../../types';

const ExamTakePage: React.FC = () => {
    const navigate = useNavigate();
    const { currentTest } = useTestStore();
    // Subscribe to questions state directly to ensure updates are reflected
    const allQuestions = useTestStore(state => state.questions);

    const { currentAttempt, submitResponse, completeAttempt } = useAttemptStore();
    const { showToast } = useUIStore();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<string, string[]>>(new Map());
    const [codeAnswers, setCodeAnswers] = useState<Map<string, string>>(new Map());
    const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Use ref to prevent multiple redirects
    const hasRedirected = useRef(false);
    const lastTestIdRef = useRef<string | null>(null);
    const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);

    // Get questions - reactive to store changes
    const questions = useMemo(() => {
        if (!currentTest) return [];
        // Force a fresh read from the allQuestions array to ensure we have the latest data
        const testQuestions = allQuestions.filter(q => q.testId === currentTest.id);

        // Safety check: if we have questions but they aren't loading, log it
        if (testQuestions.length === 0) {
            console.warn(`No questions found for test ${currentTest.id}`);
        }

        return testQuestions.sort((a, b) => a.order - b.order);
    }, [currentTest?.id, allQuestions]);

    // Shuffle questions once when test changes or questions load
    useEffect(() => {
        if (questions.length === 0 || !currentTest) return;

        // Only shuffle if questions changed or test changed
        const questionsSignature = questions.map(q => q.id).join(',');
        if (lastTestIdRef.current !== currentTest.id || lastTestIdRef.current !== questionsSignature) {
            lastTestIdRef.current = currentTest.id; // simple check, ideally check signature too

            if (currentTest.settings.questionBehavior.randomizeOrder) {
                const shuffled = [...questions];
                // Fisher-Yates shuffle
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                setShuffledQuestions(shuffled);
            } else {
                setShuffledQuestions([...questions]);
            }
        }
    }, [questions, currentTest?.id, currentTest?.settings.questionBehavior.randomizeOrder]);

    const currentQuestion = shuffledQuestions[currentIndex];
    const totalQuestions = shuffledQuestions.length;
    const showAllOnOnePage = currentTest?.settings.questionBehavior.showAllOnOnePage;

    // Check if exam should redirect - only once
    useEffect(() => {
        if (hasRedirected.current) return;

        if (!currentAttempt || !currentTest) {
            hasRedirected.current = true;
            navigate('/');
        }
    }, [currentAttempt, currentTest, navigate]);

    // Handle option selection
    const handleOptionSelect = useCallback((questionId: string, optionId: string) => {
        const question = shuffledQuestions.find(q => q.id === questionId);
        if (!question) return;

        setAnswers(prev => {
            const currentAnswers = prev.get(questionId) || [];
            let newAnswers: string[];

            if (question.type === 'mcq-single' || question.type === 'true-false') {
                newAnswers = [optionId];
            } else {
                // Multiple choice
                if (currentAnswers.includes(optionId)) {
                    newAnswers = currentAnswers.filter(id => id !== optionId);
                } else {
                    newAnswers = [...currentAnswers, optionId];
                }
            }

            const newMap = new Map(prev);
            newMap.set(questionId, newAnswers);

            // Save to store
            submitResponse(questionId, newAnswers);

            return newMap;
        });
    }, [shuffledQuestions, submitResponse]);

    // Handle code answer
    const handleCodeChange = useCallback((questionId: string, code: string) => {
        setCodeAnswers(prev => {
            const newMap = new Map(prev);
            newMap.set(questionId, code);
            return newMap;
        });

        // Debounce save for code
        submitResponse(questionId, [], code);
    }, [submitResponse]);

    // Navigation
    const goToNext = useCallback(() => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    }, [currentIndex, totalQuestions]);

    const goToPrevious = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    const goToQuestion = useCallback((index: number) => {
        setCurrentIndex(index);
    }, []);

    // Toggle flag
    const toggleFlag = useCallback((questionId: string) => {
        setFlaggedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    }, []);

    // Check if question is answered
    const isAnswered = useCallback((questionId: string) => {
        const selectedAnswers = answers.get(questionId) || [];
        const codeAnswer = codeAnswers.get(questionId) || '';
        return selectedAnswers.length > 0 || codeAnswer.length > 0;
    }, [answers, codeAnswers]);

    // Submit exam
    const handleSubmit = useCallback(() => {
        const unansweredCount = shuffledQuestions.filter(q => !isAnswered(q.id)).length;

        if (unansweredCount > 0 && !currentTest?.settings.questionBehavior.allowBlankAnswers) {
            showToast('warning', `Please answer all questions. ${unansweredCount} unanswered.`);
            return;
        }

        setShowSubmitConfirm(true);
    }, [shuffledQuestions, isAnswered, currentTest, showToast]);

    const confirmSubmit = useCallback(async () => {
        if (!currentAttempt || !currentTest || isSubmitting) return;

        setIsSubmitting(true);

        try {
            await completeAttempt(currentTest.name);
            navigate('/exam/submitted');
        } catch (error) {
            console.error('Error submitting exam:', error);
            showToast('error', 'Failed to submit exam. Please try again.');
            setIsSubmitting(false);
        }
    }, [currentAttempt, currentTest, isSubmitting, completeAttempt, navigate, showToast]);

    // Loading state
    if (!currentTest || !currentAttempt || shuffledQuestions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass-card p-8 text-center">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white">Loading exam...</p>
                </div>
            </div>
        );
    }

    // Render single question
    const renderQuestion = (question: Question, index: number) => {
        const selectedAnswers = answers.get(question.id) || [];
        const codeAnswer = codeAnswers.get(question.id) || '';

        return (
            <div
                key={question.id}
                className={`glass-card p-6 ${showAllOnOnePage ? 'mb-4' : ''}`}
            >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                            {index + 1}
                        </span>
                        <div>
                            <span className={`badge text-xs ${question.difficulty === 'easy' ? 'badge-success' :
                                question.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'
                                }`}>
                                {question.difficulty}
                            </span>
                            <span className="text-xs text-slate-500 ml-2">{question.points} pts</span>
                        </div>
                    </div>
                    <button
                        onClick={() => toggleFlag(question.id)}
                        className={`p-2 rounded-lg transition-colors ${flaggedQuestions.has(question.id)
                            ? 'bg-warning-500/20 text-warning-400'
                            : 'bg-white/5 text-slate-500 hover:text-warning-400'
                            }`}
                    >
                        <Flag className="w-5 h-5" />
                    </button>
                </div>

                {/* Question Text */}
                <p className="text-lg text-white mb-6">{question.text}</p>

                {/* Options / Code Input */}
                {question.type === 'coding' ? (
                    <div>
                        <label className="text-sm text-slate-400 mb-2 block">Your Solution:</label>
                        <textarea
                            value={codeAnswer}
                            onChange={(e) => handleCodeChange(question.id, e.target.value)}
                            className="w-full min-h-[200px] p-4 bg-slate-800 border border-white/10 rounded-xl text-white font-mono text-sm resize-y focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            placeholder="Write your code here..."
                            autoComplete={currentTest?.settings.antiCheating.disableAutocomplete ? 'off' : 'on'}
                            spellCheck={!currentTest?.settings.antiCheating.disableSpellcheck}
                        />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {question.options.map((option, optIndex) => {
                            const isSelected = selectedAnswers.includes(option.id);
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleOptionSelect(question.id, option.id)}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${isSelected
                                        ? 'bg-primary-500/20 border-primary-500/50 text-white'
                                        : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                                        }`}
                                >
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-white/10 text-slate-400'
                                        }`}>
                                        {isSelected ? <Check className="w-4 h-4" /> : String.fromCharCode(65 + optIndex)}
                                    </span>
                                    <span>{option.text}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Question Type Hint */}
                <p className="text-xs text-slate-500 mt-4">
                    {question.type === 'mcq-single' && 'Select one answer'}
                    {question.type === 'mcq-multiple' && 'Select all that apply'}
                    {question.type === 'true-false' && 'Select True or False'}
                    {question.type === 'coding' && 'Write your code solution'}
                </p>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Submit Confirmation Modal */}
            {showSubmitConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
                    <div className="glass-card p-8 max-w-md text-center animate-scale-in">
                        <AlertTriangle className="w-16 h-16 text-warning-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Submit Exam?</h3>
                        <p className="text-slate-300 mb-4">
                            Are you sure you want to submit your exam? This action cannot be undone.
                        </p>
                        <div className="flex gap-4 justify-center mb-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-success-400">
                                    {shuffledQuestions.filter(q => isAnswered(q.id)).length}
                                </p>
                                <p className="text-xs text-slate-500">Answered</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-warning-400">
                                    {flaggedQuestions.size}
                                </p>
                                <p className="text-xs text-slate-500">Flagged</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-slate-400">
                                    {shuffledQuestions.filter(q => !isAnswered(q.id)).length}
                                </p>
                                <p className="text-xs text-slate-500">Unanswered</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowSubmitConfirm(false)}
                                disabled={isSubmitting}
                                className="flex-1 gradient-button-secondary"
                            >
                                Review Answers
                            </button>
                            <button
                                onClick={confirmSubmit}
                                disabled={isSubmitting}
                                className="flex-1 gradient-button flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    'Submit'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {showAllOnOnePage ? (
                        // Show all questions
                        <div className="space-y-4">
                            {shuffledQuestions.map((q, i) => renderQuestion(q, i))}

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                className="w-full gradient-button flex items-center justify-center gap-2 py-4"
                            >
                                <Send className="w-5 h-5" />
                                Submit Exam
                            </button>
                        </div>
                    ) : (
                        // Show one question at a time
                        <>
                            {currentQuestion && renderQuestion(currentQuestion, currentIndex)}

                            {/* Navigation */}
                            <div className="flex items-center justify-between mt-6">
                                <button
                                    onClick={goToPrevious}
                                    disabled={currentIndex === 0}
                                    className={`glass-button flex items-center gap-2 ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Previous
                                </button>

                                <span className="text-slate-400">
                                    {currentIndex + 1} of {totalQuestions}
                                </span>

                                {currentIndex === totalQuestions - 1 ? (
                                    <button
                                        onClick={handleSubmit}
                                        className="gradient-button flex items-center gap-2"
                                    >
                                        <Send className="w-5 h-5" />
                                        Submit
                                    </button>
                                ) : (
                                    <button
                                        onClick={goToNext}
                                        className="gradient-button flex items-center gap-2"
                                    >
                                        Next
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Question Navigator (Desktop) */}
                {!showAllOnOnePage && (
                    <div className="lg:w-64 order-first lg:order-last flex-shrink-0">
                        <div className="glass-card p-4 lg:sticky lg:top-24">
                            <h3 className="text-sm font-medium text-slate-400 mb-4">Question Navigator</h3>
                            <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                                {shuffledQuestions.map((q, i) => {
                                    const answered = isAnswered(q.id);
                                    const flagged = flaggedQuestions.has(q.id);
                                    const isCurrent = i === currentIndex;

                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => goToQuestion(i)}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all relative ${isCurrent
                                                ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white'
                                                : answered
                                                    ? 'bg-success-500/20 text-success-400 border border-success-500/30'
                                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {i + 1}
                                            {flagged && (
                                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-warning-500 rounded-full" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div className="mt-6 space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded bg-success-500/20 border border-success-500/30" />
                                    <span className="text-slate-400">Answered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded bg-white/5" />
                                    <span className="text-slate-400">Unanswered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded bg-gradient-to-br from-primary-500 to-accent-500" />
                                    <span className="text-slate-400">Current</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="relative w-4 h-4">
                                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-warning-500 rounded-full" />
                                        <span className="w-4 h-4 rounded bg-white/5 block" />
                                    </span>
                                    <span className="text-slate-400">Flagged</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamTakePage;
