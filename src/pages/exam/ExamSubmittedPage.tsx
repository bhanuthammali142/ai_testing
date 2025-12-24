// ============================================
// Exam Submitted / Results Page
// ============================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle,
    XCircle,
    Trophy,
    Clock,
    FileQuestion,
    Home,
    RotateCcw,
    Check,
    X
} from 'lucide-react';
import { useTestStore, useAttemptStore } from '../../stores';

const ExamSubmittedPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentTest, getQuestionsForTest } = useTestStore();
    const { attempts, currentAttempt } = useAttemptStore();

    // Find the most recent completed attempt
    const [attempt] = useState(() => {
        if (currentAttempt) return currentAttempt;
        if (!currentTest) return null;
        const testAttempts = attempts.filter(
            a => a.testId === currentTest.id && (a.status === 'completed' || a.status === 'timed-out')
        );
        return testAttempts[testAttempts.length - 1] || null;
    });

    const questions = getQuestionsForTest(currentTest?.id || '');
    const settings = currentTest?.settings.review;

    useEffect(() => {
        // Clear current attempt from store after showing results
        // This is handled by the completeAttempt function
    }, []);

    if (!attempt || !currentTest || !settings) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass-card p-8 max-w-md text-center">
                    <CheckCircle className="w-16 h-16 text-success-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Exam Submitted</h2>
                    <p className="text-slate-400 mb-6">Your exam has been submitted successfully.</p>
                    <button onClick={() => navigate('/')} className="gradient-button">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-20">
            <div className="w-full max-w-2xl space-y-6">
                {/* Result Header */}
                <div className="glass-card p-8 text-center relative overflow-hidden">
                    {/* Background decoration */}
                    <div className={`absolute inset-0 opacity-20 ${attempt.passed
                        ? 'bg-gradient-to-br from-success-500 via-transparent to-transparent'
                        : 'bg-gradient-to-br from-danger-500 via-transparent to-transparent'
                        }`} />

                    <div className="relative">
                        {/* Result Icon */}
                        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${attempt.passed
                            ? 'bg-success-500/20 border-2 border-success-500/50'
                            : 'bg-danger-500/20 border-2 border-danger-500/50'
                            }`}>
                            {attempt.passed ? (
                                <Trophy className="w-12 h-12 text-success-400" />
                            ) : (
                                <XCircle className="w-12 h-12 text-danger-400" />
                            )}
                        </div>

                        {/* Result Message */}
                        <h1 className={`text-3xl font-bold font-display mb-3 ${attempt.passed ? 'text-success-400' : 'text-danger-400'
                            }`}>
                            {attempt.passed ? 'Congratulations!' : 'Keep Trying!'}
                        </h1>

                        <p className="text-lg text-white mb-4">
                            {attempt.passed ? settings.passMessage : settings.failMessage}
                        </p>

                        {/* Score Display */}
                        {settings.showScore && (
                            <div className="inline-block px-8 py-4 bg-white/5 rounded-2xl">
                                <p className="text-4xl font-bold font-display text-white">
                                    {attempt.percentage}%
                                </p>
                                <p className="text-slate-400 text-sm">
                                    {attempt.score} / {attempt.maxScore} points
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="glass-card p-4 text-center">
                        <FileQuestion className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                        <p className="text-xl font-bold text-white">{questions.length}</p>
                        <p className="text-xs text-slate-400">Questions</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <Clock className="w-6 h-6 text-accent-400 mx-auto mb-2" />
                        <p className="text-xl font-bold text-white">{formatDuration(attempt.timeSpentSeconds)}</p>
                        <p className="text-xs text-slate-400">Time Spent</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <CheckCircle className="w-6 h-6 text-success-400 mx-auto mb-2" />
                        <p className="text-xl font-bold text-white">
                            {attempt.responses.filter(r => r.isCorrect).length}
                        </p>
                        <p className="text-xs text-slate-400">Correct</p>
                    </div>
                </div>

                {/* Conclusion Text */}
                {settings.conclusionText && (
                    <div className="glass-card p-6">
                        <p className="text-slate-300">{settings.conclusionText}</p>
                    </div>
                )}

                {/* Question Review */}
                {(settings.showCorrectAnswers || settings.showQuestionOutline) && (
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-bold text-white mb-4">
                            {settings.showCorrectAnswers ? 'Answer Review' : 'Question Outline'}
                        </h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {questions.map((question, index) => {
                                const response = attempt.responses.find(r => r.questionId === question.id);
                                const isCorrect = response?.isCorrect || false;
                                const selectedOptions = response?.selectedOptions || [];

                                return (
                                    <div key={question.id} className="p-4 bg-white/5 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isCorrect
                                                ? 'bg-success-500/20 text-success-400'
                                                : 'bg-danger-500/20 text-danger-400'
                                                }`}>
                                                {isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-400">Question {index + 1}</p>
                                                <p className="text-white mt-1">{question.text}</p>

                                                {settings.showCorrectAnswers && question.type !== 'coding' && (
                                                    <div className="mt-3 space-y-2">
                                                        {question.options.map((option) => {
                                                            const isSelected = selectedOptions.includes(option.id);
                                                            const isCorrectOption = option.isCorrect;

                                                            let bgClass = 'bg-white/5';
                                                            if (isCorrectOption) bgClass = 'bg-success-500/10 border border-success-500/30';
                                                            else if (isSelected && !isCorrectOption) bgClass = 'bg-danger-500/10 border border-danger-500/30';

                                                            return (
                                                                <div key={option.id} className={`p-2 rounded-lg text-sm ${bgClass}`}>
                                                                    <span className={isCorrectOption ? 'text-success-300' : isSelected ? 'text-danger-300' : 'text-slate-400'}>
                                                                        {isSelected && '→ '}
                                                                        {option.text}
                                                                        {isCorrectOption && ' ✓'}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {settings.showExplanations && question.explanation && (
                                                    <div className="mt-3 p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                                                        <p className="text-sm text-primary-300">
                                                            <strong>Explanation:</strong> {question.explanation}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 glass-button flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </button>
                    <button
                        onClick={() => navigate(`/test/${currentTest.urlAlias || currentTest.id}`)}
                        className="flex-1 gradient-button flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExamSubmittedPage;
