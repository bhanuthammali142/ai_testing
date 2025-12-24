// ============================================
// Question Bank Page - CSV Upload & Management
// ============================================
// Admin interface for managing question bank
// Supports CSV upload, preview, filtering, and stats

import React, { useState, useCallback, useRef } from 'react';
import {
    Upload,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Search,
    Trash2,
    RefreshCw,
    Download,
    Eye,
    ChevronDown,
    ChevronUp,
    Database,
    BookOpen,
    BarChart3,
    HelpCircle,
    X,
    FileText,
    Check
} from 'lucide-react';
import { useQuestionBankStore, useUIStore } from '../../stores';
import {
    parseAndValidateCSV,
    validateFileType,
    readFileAsText,
    generateSampleCSV
} from '../../utils/csvParser';
import { BankQuestion, CSVParseResult, Difficulty } from '../../types';

// ============================================
// Sub-Components
// ============================================

// Stats Card Component
const StatsCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtext?: string;
    color?: string;
}> = ({ icon, label, value, subtext, color = 'primary' }) => (
    <div className="glass-panel p-4 rounded-xl">
        <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg bg-${color}-500/20`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
                {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
            </div>
        </div>
    </div>
);

// Difficulty Badge Component
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

// Question Preview Card
const QuestionPreviewCard: React.FC<{
    question: BankQuestion;
    index: number;
    showDetails?: boolean;
}> = ({ question, index, showDetails = false }) => {
    const [expanded, setExpanded] = useState(showDetails);

    return (
        <div className="glass-panel p-4 rounded-lg hover:border-primary-500/30 transition-all">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-slate-500">#{index + 1}</span>
                        <span className="text-xs px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded">
                            {question.subject}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded">
                            {question.topic}
                        </span>
                        <DifficultyBadge difficulty={question.difficulty} />
                    </div>
                    <p className="text-white text-sm line-clamp-2">{question.questionText}</p>
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            {expanded && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                            <div
                                key={opt}
                                className={`p-2 rounded-lg text-sm ${question.correctAnswer === opt
                                    ? 'bg-success-500/20 border border-success-500/30 text-success-400'
                                    : 'bg-slate-800/50 text-slate-300'
                                    }`}
                            >
                                <span className="font-medium">{opt}.</span> {question.options[opt]}
                            </div>
                        ))}
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-xs text-slate-400 mb-1">Explanation:</p>
                        <p className="text-sm text-slate-300">{question.explanation}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// CSV Upload Zone Component
const CSVUploadZone: React.FC<{
    onFileSelect: (file: File) => void;
    isDragging: boolean;
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
}> = ({ onFileSelect, isDragging, onDragEnter, onDragLeave, onDragOver, onDrop }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div
            className={`
                border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                ${isDragging
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-slate-700 hover:border-slate-600 hover:bg-white/5'
                }
            `}
            onClick={() => inputRef.current?.click()}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onFileSelect(file);
                }}
            />
            <div className="flex flex-col items-center gap-4">
                <div className={`p-4 rounded-full ${isDragging ? 'bg-primary-500/20' : 'bg-slate-800'}`}>
                    <Upload size={32} className={isDragging ? 'text-primary-400' : 'text-slate-400'} />
                </div>
                <div>
                    <p className="text-lg font-medium text-white mb-1">
                        {isDragging ? 'Drop your CSV file here' : 'Upload Question CSV'}
                    </p>
                    <p className="text-sm text-slate-400">
                        Drag and drop or click to browse
                    </p>
                </div>
                <p className="text-xs text-slate-500">
                    Accepted format: .csv with required headers
                </p>
            </div>
        </div>
    );
};

// ============================================
// Main Component
// ============================================

const QuestionBankPage: React.FC = () => {
    // Stores
    const {
        questions,
        addQuestions,
        clearAllQuestions,
        resetAllUsage,
        getStats,
        getSubjects,
        getTopicsForSubject,
        searchQuestions,
        removeQuestion
    } = useQuestionBankStore();
    const { showToast, showModal } = useUIStore();

    // Local State
    const [isDragging, setIsDragging] = useState(false);
    const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState<'upload' | 'bank' | 'stats'>('upload');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSubject, setFilterSubject] = useState<string>('');
    const [filterTopic, setFilterTopic] = useState<string>('');
    const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | ''>('');
    const [showHelp, setShowHelp] = useState(false);

    // Get stats
    const stats = getStats();
    const subjects = getSubjects();
    const topics = filterSubject ? getTopicsForSubject(filterSubject) : [];

    // ========================================
    // File Handling
    // ========================================

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, []);

    const handleFileSelect = async (file: File) => {
        // Validate file type
        const validation = validateFileType(file);
        if (!validation.valid) {
            showToast('error', validation.error || 'Invalid file type');
            return;
        }

        setIsProcessing(true);

        try {
            // Read and parse file
            const content = await readFileAsText(file);
            const result = parseAndValidateCSV(content);
            setParseResult(result);

            if (result.success) {
                showToast('success', `Successfully parsed ${result.validRows} questions`);
            } else if (result.validRows > 0) {
                showToast('warning', `Parsed ${result.validRows} valid questions with ${result.errors.length} errors`);
            } else {
                showToast('error', 'No valid questions found in the CSV file');
            }
        } catch (error) {
            showToast('error', 'Failed to read file');
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    // ========================================
    // Actions
    // ========================================

    const handleImportQuestions = () => {
        if (!parseResult || parseResult.questions.length === 0) return;

        addQuestions(parseResult.questions, 'uploaded.csv');
        showToast('success', `Imported ${parseResult.questions.length} questions to the bank`);
        setParseResult(null);
        setActiveTab('bank');
    };

    const handleClearAll = () => {
        showModal({
            title: 'Clear All Questions',
            message: 'Are you sure you want to delete all questions from the bank? This action cannot be undone.',
            type: 'warning',
            confirmText: 'Delete All',
            cancelText: 'Cancel',
            onConfirm: () => {
                clearAllQuestions();
                showToast('success', 'Question bank cleared');
            }
        });
    };

    const handleResetUsage = () => {
        showModal({
            title: 'Reset Usage Tracking',
            message: 'This will reset all usage tracking for questions, allowing them to be selected for new exams. Continue?',
            type: 'confirm',
            confirmText: 'Reset',
            cancelText: 'Cancel',
            onConfirm: () => {
                resetAllUsage();
                showToast('success', 'Usage tracking reset');
            }
        });
    };

    const handleDownloadSample = () => {
        const sample = generateSampleCSV();
        const blob = new Blob([sample], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_questions.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDeleteQuestion = (id: string) => {
        showModal({
            title: 'Delete Question',
            message: 'Are you sure you want to delete this question?',
            type: 'confirm',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            onConfirm: () => {
                removeQuestion(id);
                showToast('success', 'Question deleted');
            }
        });
    };

    // ========================================
    // Filtered Questions
    // ========================================

    const getFilteredQuestions = (): BankQuestion[] => {
        let filtered = searchQuery ? searchQuestions(searchQuery) : questions;

        if (filterSubject) {
            filtered = filtered.filter(q =>
                q.subject.toLowerCase() === filterSubject.toLowerCase()
            );
        }

        if (filterTopic) {
            filtered = filtered.filter(q =>
                q.topic.toLowerCase() === filterTopic.toLowerCase()
            );
        }

        if (filterDifficulty) {
            filtered = filtered.filter(q => q.difficulty === filterDifficulty);
        }

        return filtered;
    };

    const filteredQuestions = getFilteredQuestions();

    // ========================================
    // Render
    // ========================================

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gradient">Question Bank</h1>
                        <p className="text-slate-400 mt-1">
                            Upload and manage questions from CSV files
                        </p>
                    </div>
                    <button
                        onClick={() => setShowHelp(true)}
                        className="p-2 glass-button rounded-lg"
                    >
                        <HelpCircle size={20} />
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatsCard
                        icon={<Database size={20} className="text-primary-400" />}
                        label="Total Questions"
                        value={stats.totalQuestions}
                    />
                    <StatsCard
                        icon={<BookOpen size={20} className="text-emerald-400" />}
                        label="Subjects"
                        value={stats.uniqueSubjects.length}
                    />
                    <StatsCard
                        icon={<FileText size={20} className="text-amber-400" />}
                        label="Topics"
                        value={stats.uniqueTopics.length}
                    />
                    <StatsCard
                        icon={<CheckCircle size={20} className="text-cyan-400" />}
                        label="Unused"
                        value={stats.unusedQuestions}
                        subtext={`${stats.usedQuestions} used`}
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['upload', 'bank', 'stats'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                px-4 py-2 rounded-lg font-medium transition-all
                                ${activeTab === tab
                                    ? 'bg-primary-500 text-white'
                                    : 'glass-button text-slate-300 hover:text-white'
                                }
                            `}
                        >
                            {tab === 'upload' && <Upload size={16} className="inline mr-2" />}
                            {tab === 'bank' && <Database size={16} className="inline mr-2" />}
                            {tab === 'stats' && <BarChart3 size={16} className="inline mr-2" />}
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="glass-panel rounded-xl p-6">
                    {/* Upload Tab */}
                    {activeTab === 'upload' && (
                        <div className="space-y-6">
                            {/* Upload Zone */}
                            <CSVUploadZone
                                onFileSelect={handleFileSelect}
                                isDragging={isDragging}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            />

                            {/* Processing Indicator */}
                            {isProcessing && (
                                <div className="flex items-center justify-center gap-3 p-4">
                                    <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-slate-300">Processing CSV...</span>
                                </div>
                            )}

                            {/* Parse Result */}
                            {parseResult && !isProcessing && (
                                <div className="space-y-4">
                                    {/* Result Summary */}
                                    <div className={`
                                        p-4 rounded-lg border flex items-center gap-3
                                        ${parseResult.success
                                            ? 'bg-success-500/10 border-success-500/30'
                                            : parseResult.validRows > 0
                                                ? 'bg-warning-500/10 border-warning-500/30'
                                                : 'bg-danger-500/10 border-danger-500/30'
                                        }
                                    `}>
                                        {parseResult.success ? (
                                            <CheckCircle className="text-success-400" size={24} />
                                        ) : parseResult.validRows > 0 ? (
                                            <AlertTriangle className="text-warning-400" size={24} />
                                        ) : (
                                            <XCircle className="text-danger-400" size={24} />
                                        )}
                                        <div>
                                            <p className="font-medium text-white">
                                                {parseResult.validRows} valid questions found
                                            </p>
                                            <p className="text-sm text-slate-400">
                                                Total rows: {parseResult.totalRows} |
                                                Invalid: {parseResult.invalidRows}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Errors */}
                                    {parseResult.errors.length > 0 && (
                                        <div className="p-4 bg-danger-500/10 border border-danger-500/30 rounded-lg">
                                            <p className="font-medium text-danger-400 mb-2">
                                                Validation Errors ({parseResult.errors.length})
                                            </p>
                                            <div className="max-h-40 overflow-y-auto space-y-1">
                                                {parseResult.errors.slice(0, 10).map((error, i) => (
                                                    <p key={i} className="text-sm text-slate-300">
                                                        <span className="text-slate-500">Row {error.row}:</span> {error.field} - {error.message}
                                                        {error.value && <span className="text-slate-500"> ({error.value})</span>}
                                                    </p>
                                                ))}
                                                {parseResult.errors.length > 10 && (
                                                    <p className="text-sm text-slate-500">
                                                        ... and {parseResult.errors.length - 10} more errors
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Preview Questions */}
                                    {parseResult.questions.length > 0 && (
                                        <div>
                                            <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                                                <Eye size={16} />
                                                Preview ({Math.min(5, parseResult.questions.length)} of {parseResult.questions.length})
                                            </h3>
                                            <div className="space-y-3">
                                                {parseResult.questions.slice(0, 5).map((q, i) => (
                                                    <QuestionPreviewCard key={q.id} question={q} index={i} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Import Actions */}
                                    <div className="flex gap-3 pt-4 border-t border-white/10">
                                        <button
                                            onClick={handleImportQuestions}
                                            disabled={parseResult.questions.length === 0}
                                            className="gradient-button flex items-center gap-2"
                                        >
                                            <Check size={18} />
                                            Import {parseResult.questions.length} Questions
                                        </button>
                                        <button
                                            onClick={() => setParseResult(null)}
                                            className="glass-button px-4 py-2 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Help Section */}
                            {!parseResult && !isProcessing && (
                                <div className="flex items-center justify-center gap-4 pt-4">
                                    <button
                                        onClick={handleDownloadSample}
                                        className="glass-button px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                                    >
                                        <Download size={16} />
                                        Download Sample CSV
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bank Tab */}
                    {activeTab === 'bank' && (
                        <div className="space-y-4">
                            {/* Search & Filters */}
                            <div className="flex flex-wrap gap-3">
                                <div className="flex-1 min-w-[200px] relative">
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
                                    value={filterSubject}
                                    onChange={(e) => {
                                        setFilterSubject(e.target.value);
                                        setFilterTopic('');
                                    }}
                                    className="px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-primary-500"
                                >
                                    <option value="">All Subjects</option>
                                    {subjects.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>

                                <select
                                    value={filterTopic}
                                    onChange={(e) => setFilterTopic(e.target.value)}
                                    disabled={!filterSubject}
                                    className="px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-primary-500 disabled:opacity-50"
                                >
                                    <option value="">All Topics</option>
                                    {topics.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>

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

                            {/* Actions Bar */}
                            <div className="flex items-center justify-between py-2 border-b border-white/10">
                                <p className="text-sm text-slate-400">
                                    Showing {filteredQuestions.length} of {questions.length} questions
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleResetUsage}
                                        className="glass-button px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5"
                                    >
                                        <RefreshCw size={14} />
                                        Reset Usage
                                    </button>
                                    <button
                                        onClick={handleClearAll}
                                        className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 bg-danger-500/20 text-danger-400 hover:bg-danger-500/30"
                                    >
                                        <Trash2 size={14} />
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            {/* Questions List */}
                            {filteredQuestions.length === 0 ? (
                                <div className="text-center py-12">
                                    <Database size={48} className="mx-auto text-slate-600 mb-4" />
                                    <p className="text-slate-400">
                                        {questions.length === 0
                                            ? 'No questions in the bank. Upload a CSV to get started.'
                                            : 'No questions match your filters.'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                    {filteredQuestions.map((q, i) => (
                                        <div key={q.id} className="group relative">
                                            <QuestionPreviewCard question={q} index={i} />
                                            <button
                                                onClick={() => handleDeleteQuestion(q.id)}
                                                className="absolute top-4 right-12 p-1.5 rounded-lg bg-danger-500/20 text-danger-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Stats Tab */}
                    {activeTab === 'stats' && (
                        <div className="space-y-6">
                            {/* Difficulty Distribution */}
                            <div>
                                <h3 className="font-medium text-white mb-3">Difficulty Distribution</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 rounded-lg bg-success-500/10 border border-success-500/30">
                                        <p className="text-3xl font-bold text-success-400">{stats.byDifficulty.easy}</p>
                                        <p className="text-sm text-slate-400">Easy</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-warning-500/10 border border-warning-500/30">
                                        <p className="text-3xl font-bold text-warning-400">{stats.byDifficulty.medium}</p>
                                        <p className="text-sm text-slate-400">Medium</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-danger-500/10 border border-danger-500/30">
                                        <p className="text-3xl font-bold text-danger-400">{stats.byDifficulty.hard}</p>
                                        <p className="text-sm text-slate-400">Hard</p>
                                    </div>
                                </div>
                            </div>

                            {/* By Subject */}
                            <div>
                                <h3 className="font-medium text-white mb-3">Questions by Subject</h3>
                                {Object.keys(stats.bySubject).length === 0 ? (
                                    <p className="text-slate-400 text-sm">No subjects found</p>
                                ) : (
                                    <div className="space-y-2">
                                        {Object.entries(stats.bySubject).map(([subject, count]) => (
                                            <div key={subject} className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm text-white">{subject}</span>
                                                        <span className="text-sm text-slate-400">{count}</span>
                                                    </div>
                                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                                                            style={{ width: `${(count / stats.totalQuestions) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* By Topic */}
                            <div>
                                <h3 className="font-medium text-white mb-3">Questions by Topic</h3>
                                {Object.keys(stats.byTopic).length === 0 ? (
                                    <p className="text-slate-400 text-sm">No topics found</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(stats.byTopic).map(([topic, count]) => (
                                            <span
                                                key={topic}
                                                className="px-3 py-1.5 bg-slate-800 rounded-lg text-sm text-slate-300"
                                            >
                                                {topic} <span className="text-primary-400">({count})</span>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Usage Stats */}
                            <div>
                                <h3 className="font-medium text-white mb-3">Usage Statistics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-slate-800/50">
                                        <p className="text-3xl font-bold text-primary-400">{stats.unusedQuestions}</p>
                                        <p className="text-sm text-slate-400">Available Questions</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-slate-800/50">
                                        <p className="text-3xl font-bold text-slate-400">{stats.usedQuestions}</p>
                                        <p className="text-sm text-slate-400">Used in Exams</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Help Modal */}
                {showHelp && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="glass-panel rounded-xl max-w-lg w-full p-6 relative">
                            <button
                                onClick={() => setShowHelp(false)}
                                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-xl font-bold text-white mb-4">CSV Format Guide</h2>

                            <div className="space-y-4 text-sm">
                                <p className="text-slate-300">
                                    Your CSV file must include the following headers in this exact order:
                                </p>

                                <div className="p-3 bg-slate-800 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto">
                                    id,subject,topic,difficulty,question,option_a,option_b,option_c,option_d,correct_answer,explanation
                                </div>

                                <div className="space-y-2">
                                    <p className="text-slate-300"><strong className="text-white">Rules:</strong></p>
                                    <ul className="list-disc list-inside text-slate-400 space-y-1">
                                        <li><code className="text-primary-400">difficulty</code> must be: Easy, Medium, or Hard</li>
                                        <li><code className="text-primary-400">correct_answer</code> must be: A, B, C, or D</li>
                                        <li>All fields are required (no empty values)</li>
                                        <li>IDs must be unique across all questions</li>
                                    </ul>
                                </div>

                                <button
                                    onClick={() => {
                                        handleDownloadSample();
                                        setShowHelp(false);
                                    }}
                                    className="w-full gradient-button flex items-center justify-center gap-2"
                                >
                                    <Download size={16} />
                                    Download Sample CSV
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionBankPage;
