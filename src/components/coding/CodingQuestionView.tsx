// ============================================
// Coding Question View Component (Exam Taking)
// ============================================
// This component allows students to write and run code during an exam.
// Features:
// - Code editor (textarea)
// - Run Code button (sample test)
// - Submit Code button (full evaluation)
// - Timer display
// - Output/error display

import React, { useState, useEffect } from 'react';
import {
    Play,
    Send,
    Clock,
    Terminal,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Code,
    Lightbulb,
    RotateCcw,
} from 'lucide-react';
import { CodingQuestion, TestCase, CodeEvaluationResult } from '../../types/coding';
import { useCodingStore } from '../../stores/codingStore';

interface CodingQuestionViewProps {
    question: CodingQuestion;
    attemptId: string;
    timeRemaining?: number; // Time remaining in seconds for this question
    isTimedOut?: boolean;
    onSubmit?: (result: CodeEvaluationResult) => void;
}

const CodingQuestionView: React.FC<CodingQuestionViewProps> = ({
    question,
    attemptId,
    timeRemaining,
    isTimedOut = false,
    onSubmit,
}) => {
    // Store
    const {
        runCode,
        submitCode,
        isRunning,
        isSubmitting,
        currentOutput,
        currentError,
        lastRunPassed,
        clearExecutionState,
        getSubmissionForQuestion,
    } = useCodingStore();

    // Local state
    const [code, setCode] = useState(
        question.starterCode?.python || '# Write your Python code here\n'
    );
    const [showHints, setShowHints] = useState(false);
    const [currentHintIndex, setCurrentHintIndex] = useState(0);
    const [showOutput, setShowOutput] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<CodeEvaluationResult | null>(null);

    // Check for existing submission
    useEffect(() => {
        const existing = getSubmissionForQuestion(attemptId, question.id);
        if (existing) {
            setHasSubmitted(true);
            setSubmissionResult(existing.result);
            setCode(existing.code);
        }
    }, [attemptId, question.id, getSubmissionForQuestion]);

    // Clear execution state on mount
    useEffect(() => {
        clearExecutionState();
    }, [clearExecutionState]);

    // Format time remaining
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle Run Code (sample test)
    const handleRunCode = async () => {
        if (isRunning || isTimedOut) return;

        setShowOutput(true);
        await runCode(
            code,
            'python',
            question.sampleInput,
            question.sampleOutput,
            question.timeLimit
        );
    };

    // Handle Submit Code (full evaluation)
    const handleSubmitCode = async () => {
        if (isSubmitting || isTimedOut || hasSubmitted) return;

        // Create all test cases (sample + hidden)
        const allTestCases: TestCase[] = [
            // Sample test case (visible)
            {
                id: 'sample',
                input: question.sampleInput,
                expectedOutput: question.sampleOutput,
                isHidden: false,
            },
            // Hidden test cases
            ...question.hiddenTestCases,
        ];

        const result = await submitCode(
            attemptId,
            question.id,
            code,
            'python',
            allTestCases,
            question.timeLimit,
            question.points
        );

        if (result) {
            setHasSubmitted(true);
            setSubmissionResult(result);
            setShowOutput(true);
            onSubmit?.(result);
        }
    };

    // Reset code to starter
    const handleResetCode = () => {
        if (hasSubmitted) return;
        setCode(question.starterCode?.python || '# Write your Python code here\n');
        clearExecutionState();
    };

    // Get next hint
    const showNextHint = () => {
        if (question.hints && currentHintIndex < question.hints.length - 1) {
            setCurrentHintIndex(currentHintIndex + 1);
        }
    };

    return (
        <div className="space-y-4">
            {/* Problem Statement */}
            <div className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                            <Code className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Coding Problem</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`badge text-xs ${question.difficulty === 'easy' ? 'badge-success' :
                                    question.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'
                                    }`}>
                                    {question.difficulty}
                                </span>
                                <span className="text-xs text-slate-500">{question.points} pts</span>
                                <span className="text-xs text-slate-500">•</span>
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {question.timeLimit}s limit
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Timer */}
                    {timeRemaining !== undefined && (
                        <div className={`px-4 py-2 rounded-xl font-mono font-bold ${timeRemaining < 60
                            ? 'bg-danger-500/20 text-danger-400 animate-pulse'
                            : timeRemaining < 300
                                ? 'bg-warning-500/20 text-warning-400'
                                : 'bg-white/5 text-slate-300'
                            }`}>
                            <Clock className="w-4 h-4 inline mr-2" />
                            {formatTime(timeRemaining)}
                        </div>
                    )}
                </div>

                {/* Problem Text */}
                <div className="prose prose-invert max-w-none">
                    <div className="text-slate-300 whitespace-pre-wrap">
                        {question.problemStatement}
                    </div>
                </div>

                {/* Sample Input/Output */}
                {(question.sampleInput || question.sampleOutput) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div>
                            <h4 className="text-sm font-medium text-slate-400 mb-2">Sample Input</h4>
                            <pre className="bg-slate-800 rounded-lg p-4 text-sm text-slate-300 font-mono overflow-x-auto">
                                {question.sampleInput || '(no input)'}
                            </pre>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-slate-400 mb-2">Sample Output</h4>
                            <pre className="bg-slate-800 rounded-lg p-4 text-sm text-slate-300 font-mono overflow-x-auto">
                                {question.sampleOutput || '(no output)'}
                            </pre>
                        </div>
                    </div>
                )}

                {/* Hints */}
                {question.hints && question.hints.length > 0 && (
                    <div className="mt-4">
                        <button
                            onClick={() => setShowHints(!showHints)}
                            className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300"
                        >
                            <Lightbulb className="w-4 h-4" />
                            {showHints ? 'Hide Hints' : `Show Hints (${question.hints.length} available)`}
                            {showHints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {showHints && (
                            <div className="mt-3 space-y-2">
                                {question.hints.slice(0, currentHintIndex + 1).map((hint, i) => (
                                    <div key={i} className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-3">
                                        <span className="text-xs text-primary-400 font-medium">Hint {i + 1}:</span>
                                        <p className="text-sm text-slate-300 mt-1">{hint}</p>
                                    </div>
                                ))}
                                {currentHintIndex < question.hints.length - 1 && (
                                    <button
                                        onClick={showNextHint}
                                        className="text-xs text-primary-400 hover:text-primary-300"
                                    >
                                        Show next hint ({question.hints.length - currentHintIndex - 1} remaining)
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Code Editor */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-5 h-5 text-primary-400" />
                        <h4 className="text-white font-medium">Code Editor</h4>
                        <span className="badge badge-primary text-xs">Python</span>
                    </div>
                    <button
                        onClick={handleResetCode}
                        disabled={hasSubmitted || isTimedOut}
                        className="text-sm text-slate-400 hover:text-white disabled:opacity-50 flex items-center gap-1"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </button>
                </div>

                <textarea
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    disabled={hasSubmitted || isTimedOut}
                    className="w-full min-h-[300px] bg-slate-800 border border-white/10 rounded-xl p-4 font-mono text-sm text-slate-300 resize-y focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="# Write your Python code here"
                    spellCheck={false}
                />

                {/* Action Buttons */}
                <div className="flex items-center gap-4 mt-4">
                    <button
                        onClick={handleRunCode}
                        disabled={isRunning || isSubmitting || isTimedOut || hasSubmitted}
                        className="gradient-button-secondary flex items-center gap-2 disabled:opacity-50"
                    >
                        {isRunning ? (
                            <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Play className="w-5 h-5" />
                        )}
                        {isRunning ? 'Running...' : 'Run Code'}
                    </button>

                    <button
                        onClick={handleSubmitCode}
                        disabled={isRunning || isSubmitting || isTimedOut || hasSubmitted}
                        className="gradient-button flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                        {isSubmitting ? 'Submitting...' : hasSubmitted ? 'Submitted' : 'Submit Code'}
                    </button>

                    {isTimedOut && (
                        <div className="flex items-center gap-2 text-danger-400">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="text-sm">Time expired - Submission disabled</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Output Panel */}
            {(showOutput || currentOutput || currentError || submissionResult) && (
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-primary-400" />
                            Output
                        </h4>
                        {lastRunPassed !== null && !submissionResult && (
                            <span className={`flex items-center gap-2 ${lastRunPassed ? 'text-success-400' : 'text-danger-400'
                                }`}>
                                {lastRunPassed ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Sample Test Passed
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-5 h-5" />
                                        Sample Test Failed
                                    </>
                                )}
                            </span>
                        )}
                    </div>

                    {/* Run Output */}
                    {!submissionResult && (currentOutput || currentError) && (
                        <div className="space-y-4">
                            {currentOutput && (
                                <div>
                                    <p className="text-xs text-slate-400 mb-2">Output:</p>
                                    <pre className="bg-slate-800 rounded-lg p-4 text-sm text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap">
                                        {currentOutput}
                                    </pre>
                                </div>
                            )}
                            {currentError && (
                                <div>
                                    <p className="text-xs text-danger-400 mb-2">Error:</p>
                                    <pre className="bg-danger-500/10 border border-danger-500/30 rounded-lg p-4 text-sm text-danger-300 font-mono overflow-x-auto whitespace-pre-wrap">
                                        {currentError}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Submission Results */}
                    {submissionResult && (
                        <div className="space-y-4">
                            {/* Score Summary */}
                            <div className="flex items-center gap-6 p-4 bg-slate-800/50 rounded-xl">
                                <div className="text-center">
                                    <p className={`text-3xl font-bold ${submissionResult.passedCount === submissionResult.totalCount
                                        ? 'text-success-400'
                                        : submissionResult.passedCount > 0
                                            ? 'text-warning-400'
                                            : 'text-danger-400'
                                        }`}>
                                        {submissionResult.passedCount}/{submissionResult.totalCount}
                                    </p>
                                    <p className="text-xs text-slate-400">Tests Passed</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-primary-400">
                                        {submissionResult.finalScore}
                                    </p>
                                    <p className="text-xs text-slate-400">Points Earned</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-slate-300">
                                        {Math.round(submissionResult.totalExecutionTime)}ms
                                    </p>
                                    <p className="text-xs text-slate-400">Execution Time</p>
                                </div>
                            </div>

                            {/* Test Case Results */}
                            <div>
                                <p className="text-sm text-slate-400 mb-3">Test Case Results:</p>
                                <div className="space-y-2">
                                    {submissionResult.testCaseResults.map((result, index) => {
                                        const isHidden = result.testCaseId !== 'sample';
                                        return (
                                            <div
                                                key={result.testCaseId}
                                                className={`p-3 rounded-lg flex items-center justify-between ${result.passed
                                                    ? 'bg-success-500/10 border border-success-500/30'
                                                    : 'bg-danger-500/10 border border-danger-500/30'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {result.passed ? (
                                                        <CheckCircle className="w-5 h-5 text-success-400" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-danger-400" />
                                                    )}
                                                    <span className={result.passed ? 'text-success-300' : 'text-danger-300'}>
                                                        {isHidden ? `Hidden Test ${index}` : 'Sample Test'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs text-slate-400">
                                                        {Math.round(result.executionTime)}ms
                                                    </span>
                                                    {isHidden && (
                                                        <span className="badge badge-warning text-xs">Hidden</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading state */}
                    {(isRunning || isSubmitting) && !currentOutput && !currentError && (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            <span className="ml-3 text-slate-400">
                                {isRunning ? 'Executing code...' : 'Evaluating submission...'}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CodingQuestionView;
