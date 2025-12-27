// ============================================
// Coding Results View Component
// ============================================
// Displays coding question results after exam completion.
// Shows passed/failed test cases without revealing hidden test case inputs.

import React from 'react';
import {
    CheckCircle,
    XCircle,
    Clock,
    Code,
    Terminal,
    EyeOff,
    Trophy,
    TrendingUp,
} from 'lucide-react';
import { CodeEvaluationResult } from '../../types/coding';

interface CodingResultsViewProps {
    result: CodeEvaluationResult;
    showCode?: boolean;
    showFullDetails?: boolean; // For admin view
}

const CodingResultsView: React.FC<CodingResultsViewProps> = ({
    result,
    showCode = false,
    showFullDetails = false,
}) => {
    const isPerfect = result.passedCount === result.totalCount;
    const passRate = Math.round((result.passedCount / result.totalCount) * 100);

    return (
        <div className="space-y-4">
            {/* Score Summary Card */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isPerfect
                        ? 'bg-gradient-to-br from-success-500 to-emerald-500'
                        : passRate >= 50
                            ? 'bg-gradient-to-br from-warning-500 to-orange-500'
                            : 'bg-gradient-to-br from-danger-500 to-red-500'
                        }`}>
                        {isPerfect ? (
                            <Trophy className="w-8 h-8 text-white" />
                        ) : (
                            <Code className="w-8 h-8 text-white" />
                        )}
                    </div>
                    <div>
                        <h3 className={`text-2xl font-bold ${isPerfect ? 'text-success-400' : passRate >= 50 ? 'text-warning-400' : 'text-danger-400'
                            }`}>
                            {isPerfect ? 'Perfect Score!' : passRate >= 50 ? 'Good Effort!' : 'Needs Improvement'}
                        </h3>
                        <p className="text-slate-400">
                            {result.passedCount} of {result.totalCount} test cases passed
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                        <div className={`text-3xl font-bold ${isPerfect ? 'text-success-400' : 'text-primary-400'
                            }`}>
                            {result.finalScore}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Points Earned</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-slate-300">
                            {result.maxPossibleScore}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Max Points</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-success-400">
                            {result.passedCount}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Tests Passed</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-danger-400">
                            {result.failedCount}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Tests Failed</div>
                    </div>
                </div>

                {/* Execution Time */}
                <div className="mt-4 flex items-center gap-6 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Total: {Math.round(result.totalExecutionTime)}ms</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Max: {Math.round(result.maxExecutionTime)}ms</span>
                    </div>
                </div>
            </div>

            {/* Test Case Results */}
            <div className="glass-card p-6">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-primary-400" />
                    Test Case Results
                </h4>

                <div className="space-y-3">
                    {result.testCaseResults.map((tcResult, index) => {
                        const isHidden = tcResult.testCaseId !== 'sample';

                        return (
                            <div
                                key={tcResult.testCaseId}
                                className={`rounded-xl border transition-all ${tcResult.passed
                                    ? 'bg-success-500/5 border-success-500/20'
                                    : 'bg-danger-500/5 border-danger-500/20'
                                    }`}
                            >
                                {/* Test Case Header */}
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {tcResult.passed ? (
                                            <div className="w-8 h-8 rounded-lg bg-success-500/20 flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5 text-success-400" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-lg bg-danger-500/20 flex items-center justify-center">
                                                <XCircle className="w-5 h-5 text-danger-400" />
                                            </div>
                                        )}
                                        <div>
                                            <span className={tcResult.passed ? 'text-success-300' : 'text-danger-300'}>
                                                {isHidden ? `Hidden Test ${index}` : 'Sample Test'}
                                            </span>
                                            {isHidden && (
                                                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                                    <EyeOff className="w-3 h-3" />
                                                    Input/output hidden
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {Math.round(tcResult.executionTime)}ms
                                        </span>
                                        <span className={`badge text-xs ${tcResult.passed ? 'badge-success' : 'badge-danger'
                                            }`}>
                                            {tcResult.passed ? 'PASSED' : 'FAILED'}
                                        </span>
                                    </div>
                                </div>

                                {/* Show details for visible tests or in admin view */}
                                {(!isHidden || showFullDetails) && (tcResult.actualOutput || tcResult.error) && (
                                    <div className="px-4 pb-4 border-t border-white/5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                            {tcResult.expectedOutput && (
                                                <div>
                                                    <p className="text-xs text-slate-400 mb-2">Expected Output:</p>
                                                    <pre className="bg-slate-800 rounded-lg p-3 text-xs text-slate-300 font-mono overflow-x-auto">
                                                        {tcResult.expectedOutput}
                                                    </pre>
                                                </div>
                                            )}
                                            {tcResult.actualOutput && (
                                                <div>
                                                    <p className="text-xs text-slate-400 mb-2">Your Output:</p>
                                                    <pre className={`rounded-lg p-3 text-xs font-mono overflow-x-auto ${tcResult.passed
                                                        ? 'bg-success-500/10 text-success-300'
                                                        : 'bg-danger-500/10 text-danger-300'
                                                        }`}>
                                                        {tcResult.actualOutput}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                        {tcResult.error && (
                                            <div className="mt-3">
                                                <p className="text-xs text-danger-400 mb-2">Error:</p>
                                                <pre className="bg-danger-500/10 border border-danger-500/30 rounded-lg p-3 text-xs text-danger-300 font-mono overflow-x-auto">
                                                    {tcResult.error}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Submitted Code (optional) */}
            {showCode && result.code && (
                <div className="glass-card p-6">
                    <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                        <Code className="w-5 h-5 text-primary-400" />
                        Submitted Code
                        <span className="badge badge-primary text-xs ml-2">{result.language}</span>
                    </h4>
                    <pre className="bg-slate-800 rounded-xl p-4 text-sm text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap">
                        {result.code}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default CodingResultsView;
