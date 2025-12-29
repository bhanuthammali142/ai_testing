// ============================================
// Enhanced Question Management Page
// ============================================

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Sparkles,
    FileQuestion,
    Edit,
    Trash2,
    Copy,
    ChevronDown,
    ChevronUp,
    Check,
    X,
    Wand2,
    RefreshCw,
    CheckCircle,
    XCircle,
    Zap,
    BookOpen,
    Search,
    Database,
    Code
} from 'lucide-react';
import {
    useTestStore,
    useAIQuestionStore,
    useUIStore
} from '../../stores';
import {
    Question,
    QuestionType,
    Difficulty
} from '../../types';
import { EmptyState, Spinner } from '../../components/common';
import { QuestionBankSelector } from '../../components/admin';
import { v4 as uuidv4 } from 'uuid';
import { subjectData, Subject, Topic } from '../../data/subjectData';
import { questionGenerator } from '../../ai';
import { useQuestionBankStore, useCodingStore } from '../../stores';
import { CodingQuestionEditor } from '../../components/coding';
import { CodingQuestion } from '../../types/coding';

// Question types configuration
const questionTypes: { type: QuestionType; label: string; description: string }[] = [
    { type: 'mcq-single', label: 'Single Choice', description: 'One correct answer' },
    { type: 'mcq-multiple', label: 'Multiple Choice', description: 'Multiple correct answers' },
    { type: 'true-false', label: 'True / False', description: 'Binary choice' },
    { type: 'coding', label: 'Coding', description: 'Code response' },
];

const difficultyLevels: { value: Difficulty; label: string; color: string }[] = [
    { value: 'easy', label: 'Easy', color: 'text-success-400 bg-success-500/20 border-success-500/30' },
    { value: 'medium', label: 'Medium', color: 'text-warning-400 bg-warning-500/20 border-warning-500/30' },
    { value: 'hard', label: 'Hard', color: 'text-danger-400 bg-danger-500/20 border-danger-500/30' },
];

const QuestionsPage: React.FC = () => {
    const { currentTest, tests, setCurrentTest, createTest, getQuestionsForTest, addQuestion, updateQuestion, deleteQuestion, duplicateQuestion } = useTestStore();
    const {
        aiQuestions,
        generateQuestions,
        approveQuestion,
        rejectQuestion,
        approveAll,
        rejectAll,
        clearGenerated,
        regenerateQuestion,
        isGenerating,
        generationProgress
    } = useAIQuestionStore();
    const { showToast, showModal } = useUIStore();

    // View mode
    const [mode, setMode] = useState<'manual' | 'ai'>('manual');

    // Question form state
    const [showForm, setShowForm] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [formData, setFormData] = useState({
        type: 'mcq-single' as QuestionType,
        text: '',
        options: [
            { id: uuidv4(), text: '', isCorrect: false },
            { id: uuidv4(), text: '', isCorrect: false },
            { id: uuidv4(), text: '', isCorrect: false },
            { id: uuidv4(), text: '', isCorrect: false },
        ],
        correctAnswer: '',
        explanation: '',
        difficulty: 'medium' as Difficulty,
        topic: '',
        points: 10,
        negativeMarking: 0,
    });

    // AI generation state
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
    const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>([]);
    const [aiDifficulty, setAiDifficulty] = useState<Difficulty>('medium');
    const [aiQuestionType, setAiQuestionType] = useState<QuestionType>('mcq-single');
    const [aiQuestionCount, setAiQuestionCount] = useState(5);
    const [subjectSearchQuery, setSubjectSearchQuery] = useState('');

    // Expanded question state
    const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

    // Question bank selector state
    const [showBankSelector, setShowBankSelector] = useState(false);

    // Coding question editor state
    const [showCodingEditor, setShowCodingEditor] = useState(false);
    const [editingCodingQuestion, setEditingCodingQuestion] = useState<CodingQuestion | null>(null);
    const { addCodingQuestion, updateCodingQuestion } = useCodingStore();

    // Get question bank stats
    const { questions: bankQuestions } = useQuestionBankStore();

    // Get intelligent generator subjects
    const intelligentSubjects = questionGenerator.getSubjects();

    // Auto-create or auto-select test if needed
    useEffect(() => {
        if (!currentTest) {
            if (tests.length > 0) {
                // Auto-select the first test
                setCurrentTest(tests[0]);
            } else {
                // Auto-create a new test
                const newTest = createTest('My First Test', 'admin123');
                setCurrentTest(newTest);
            }
        }
    }, [currentTest, tests, setCurrentTest, createTest]);

    if (!currentTest) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20 animate-fade-in">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                    <FileQuestion className="w-10 h-10 text-primary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Setting Up Your Test...</h2>
                <p className="text-slate-400 mb-8">
                    Please wait while we prepare your test environment.
                </p>
                <div className="w-8 h-8 mx-auto rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    const questions = getQuestionsForTest(currentTest.id);
    const pendingAIQuestions = aiQuestions.filter(q => q.status === 'pending');
    const approvedCount = aiQuestions.filter(q => q.status === 'approved').length;
    const rejectedCount = aiQuestions.filter(q => q.status === 'rejected').length;

    // Calculate available questions from intelligent generator
    const availableQuestionsCount = selectedSubject && selectedTopics.length > 0
        ? questionGenerator.getAvailableQuestionCount(
            selectedSubject.name,
            selectedTopics.map(t => t.name),
            aiDifficulty as 'easy' | 'medium' | 'hard' | 'mixed'
        )
        : 0;

    // Check if selected subject uses intelligent generator
    const isIntelligentSubject = selectedSubject && intelligentSubjects.some(
        s => s.toLowerCase() === selectedSubject.name.toLowerCase() ||
            s.toLowerCase().includes(selectedSubject.name.toLowerCase().split(' ')[0])
    );

    // Handle reset questions pool
    const handleResetQuestionPool = () => {
        questionGenerator.resetSession();
        showToast('success', 'Question pool reset! Fresh questions available.');
    };

    // Filter subjects based on search
    const filteredSubjects = subjectSearchQuery
        ? subjectData.filter(s =>
            s.name.toLowerCase().includes(subjectSearchQuery.toLowerCase()) ||
            s.topics.some(t => t.name.toLowerCase().includes(subjectSearchQuery.toLowerCase()))
        )
        : subjectData;

    // Form handlers
    const resetForm = () => {
        setFormData({
            type: 'mcq-single',
            text: '',
            options: [
                { id: uuidv4(), text: '', isCorrect: false },
                { id: uuidv4(), text: '', isCorrect: false },
                { id: uuidv4(), text: '', isCorrect: false },
                { id: uuidv4(), text: '', isCorrect: false },
            ],
            correctAnswer: '',
            explanation: '',
            difficulty: 'medium',
            topic: '',
            points: 10,
            negativeMarking: 0,
        });
        setEditingQuestion(null);
        setShowForm(false);
    };

    const handleEditQuestion = (question: Question) => {
        setEditingQuestion(question);
        setFormData({
            type: question.type,
            text: question.text,
            options: question.options.length > 0
                ? question.options
                : [
                    { id: uuidv4(), text: '', isCorrect: false },
                    { id: uuidv4(), text: '', isCorrect: false },
                ],
            correctAnswer: question.correctAnswer || '',
            explanation: question.explanation || '',
            difficulty: question.difficulty,
            topic: question.topic,
            points: question.points,
            negativeMarking: question.negativeMarking,
        });
        setShowForm(true);
    };

    const handleSubmitQuestion = () => {
        if (!formData.text.trim()) {
            showToast('error', 'Please enter a question');
            return;
        }

        if (formData.type !== 'coding') {
            const hasCorrectAnswer = formData.options.some(o => o.isCorrect);
            if (!hasCorrectAnswer) {
                showToast('error', 'Please select at least one correct answer');
                return;
            }
        }

        const questionData = {
            testId: currentTest.id,
            type: formData.type,
            text: formData.text,
            options: formData.type === 'coding' ? [] : formData.options.filter(o => o.text.trim()),
            correctAnswer: formData.type === 'coding' ? formData.correctAnswer : undefined,
            explanation: formData.explanation,
            difficulty: formData.difficulty,
            topic: formData.topic,
            points: formData.points,
            negativeMarking: formData.negativeMarking,
            order: questions.length + 1,
        };

        if (editingQuestion) {
            updateQuestion(editingQuestion.id, questionData);
            showToast('success', 'Question updated successfully');
        } else {
            addQuestion(questionData);
            showToast('success', 'Question added successfully');
        }

        resetForm();
    };

    const handleDeleteQuestion = (questionId: string) => {
        showModal({
            title: 'Delete Question?',
            message: 'This action cannot be undone.',
            type: 'warning',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            onConfirm: () => {
                deleteQuestion(questionId);
                showToast('success', 'Question deleted');
            },
        });
    };

    const handleTypeChange = (type: QuestionType) => {
        let options = formData.options;
        if (type === 'true-false') {
            options = [
                { id: uuidv4(), text: 'True', isCorrect: false },
                { id: uuidv4(), text: 'False', isCorrect: false },
            ];
        } else if (type === 'coding') {
            options = [];
        } else if (formData.type === 'true-false' || formData.type === 'coding') {
            options = [
                { id: uuidv4(), text: '', isCorrect: false },
                { id: uuidv4(), text: '', isCorrect: false },
                { id: uuidv4(), text: '', isCorrect: false },
                { id: uuidv4(), text: '', isCorrect: false },
            ];
        }
        setFormData({ ...formData, type, options });
    };

    const addOption = () => {
        setFormData({
            ...formData,
            options: [...formData.options, { id: uuidv4(), text: '', isCorrect: false }],
        });
    };

    const removeOption = (id: string) => {
        setFormData({
            ...formData,
            options: formData.options.filter(o => o.id !== id),
        });
    };

    const toggleCorrectAnswer = (optionId: string) => {
        if (formData.type === 'mcq-single' || formData.type === 'true-false') {
            setFormData({
                ...formData,
                options: formData.options.map(o => ({
                    ...o,
                    isCorrect: o.id === optionId,
                })),
            });
        } else {
            setFormData({
                ...formData,
                options: formData.options.map(o =>
                    o.id === optionId ? { ...o, isCorrect: !o.isCorrect } : o
                ),
            });
        }
    };

    // AI generation handlers
    const handleSelectSubject = (subject: Subject) => {
        setSelectedSubject(subject);
        setSelectedTopics([]);
        setSelectedSubtopics([]);
    };

    const handleToggleTopic = (topic: Topic) => {
        if (selectedTopics.find(t => t.id === topic.id)) {
            setSelectedTopics(selectedTopics.filter(t => t.id !== topic.id));
            // Remove subtopics from this topic
            const topicSubtopics = topic.subtopics || [];
            setSelectedSubtopics(selectedSubtopics.filter(st => !topicSubtopics.includes(st)));
        } else {
            setSelectedTopics([...selectedTopics, topic]);
        }
    };

    const handleToggleSubtopic = (subtopic: string) => {
        if (selectedSubtopics.includes(subtopic)) {
            setSelectedSubtopics(selectedSubtopics.filter(st => st !== subtopic));
        } else {
            setSelectedSubtopics([...selectedSubtopics, subtopic]);
        }
    };

    const handleGenerateQuestions = async () => {
        if (!selectedSubject) {
            showToast('error', 'Please select a subject');
            return;
        }

        if (selectedTopics.length === 0) {
            showToast('error', 'Please select at least one topic');
            return;
        }

        try {
            await generateQuestions({
                subject: selectedSubject.id,
                topics: selectedTopics.map(t => t.name),
                subtopics: selectedSubtopics,
                difficulty: aiDifficulty,
                questionCount: aiQuestionCount,
                questionType: aiQuestionType,
            });
            showToast('success', `Generated ${aiQuestionCount} questions!`);
        } catch (_error) {
            showToast('error', 'Failed to generate questions');
        }
    };

    const handleApproveAIQuestion = (aiQuestionId: string) => {
        const question = approveQuestion(aiQuestionId);
        if (question) {
            addQuestion({ ...question, testId: currentTest.id });
            showToast('success', 'Question approved and added');
        }
    };

    const handleApproveAll = () => {
        const approved = approveAll();
        approved.forEach(q => addQuestion({ ...q, testId: currentTest.id }));
        showToast('success', `${approved.length} questions added to test`);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            {/* Mode Toggle */}
            <div className="flex items-center gap-4">
                <div className="glass-card p-1 flex">
                    <button
                        onClick={() => setMode('manual')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${mode === 'manual'
                            ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <FileQuestion className="w-5 h-5" />
                        Manual Mode
                    </button>
                    <button
                        onClick={() => setMode('ai')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${mode === 'ai'
                            ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <Sparkles className="w-5 h-5" />
                        AI Generator
                        {pendingAIQuestions.length > 0 && (
                            <span className="ml-1 w-5 h-5 rounded-full bg-accent-500 text-white text-xs flex items-center justify-center">
                                {pendingAIQuestions.length}
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex-1" />

                <div className="text-sm text-slate-400">
                    {questions.length} question{questions.length !== 1 ? 's' : ''} in test
                </div>

                {mode === 'manual' && (
                    <>
                        <button
                            onClick={() => setShowBankSelector(true)}
                            className="glass-button flex items-center gap-2"
                            title={bankQuestions.length === 0 ? 'Upload questions to bank first' : 'Import from Question Bank'}
                        >
                            <Database className="w-5 h-5" />
                            Import from Bank
                            {bankQuestions.length > 0 && (
                                <span className="text-xs bg-primary-500/30 px-1.5 py-0.5 rounded">
                                    {bankQuestions.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setShowForm(true)}
                            className="gradient-button flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Question
                        </button>
                        <button
                            onClick={() => {
                                setEditingCodingQuestion(null);
                                setShowCodingEditor(true);
                            }}
                            className="gradient-button-secondary flex items-center gap-2 border border-primary-500/30"
                        >
                            <Code className="w-5 h-5" />
                            Add Coding Question
                        </button>
                    </>
                )}
            </div>

            {/* Manual Mode */}
            {mode === 'manual' && (
                <>
                    {/* Question Bank Selector Modal */}
                    {showBankSelector && (
                        <QuestionBankSelector
                            testId={currentTest.id}
                            onClose={() => setShowBankSelector(false)}
                            onQuestionsAdded={(count) => {
                                showToast('success', `Added ${count} questions from bank`);
                            }}
                        />
                    )}

                    {/* Coding Question Editor Modal */}
                    {showCodingEditor && (
                        <CodingQuestionEditor
                            testId={currentTest.id}
                            question={editingCodingQuestion}
                            onSave={(questionData) => {
                                if (editingCodingQuestion) {
                                    updateCodingQuestion(editingCodingQuestion.id, questionData);
                                    showToast('success', 'Coding question updated');
                                } else {
                                    // Add to coding store
                                    addCodingQuestion(questionData);
                                    // Also add a reference question to the regular questions
                                    addQuestion({
                                        testId: currentTest.id,
                                        type: 'coding',
                                        text: questionData.problemStatement,
                                        options: [],
                                        correctAnswer: '',
                                        explanation: '',
                                        difficulty: questionData.difficulty,
                                        topic: questionData.topic,
                                        points: questionData.points,
                                        negativeMarking: 0,
                                        order: questions.length + 1,
                                    });
                                    showToast('success', 'Coding question added');
                                }
                                setShowCodingEditor(false);
                                setEditingCodingQuestion(null);
                            }}
                            onCancel={() => {
                                setShowCodingEditor(false);
                                setEditingCodingQuestion(null);
                            }}
                        />
                    )}

                    {/* Question Form Modal */}
                    {showForm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
                            <div className="glass-card p-8 max-w-3xl w-full my-8 animate-scale-in">
                                <h3 className="text-xl font-bold text-white mb-6">
                                    {editingQuestion ? 'Edit Question' : 'Add New Question'}
                                </h3>

                                {/* Question Type */}
                                <div className="mb-6">
                                    <label className="input-label">Question Type</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {questionTypes.map((qt) => (
                                            <button
                                                key={qt.type}
                                                onClick={() => handleTypeChange(qt.type)}
                                                className={`p-4 rounded-xl border transition-all text-left ${formData.type === qt.type
                                                    ? 'bg-primary-500/20 border-primary-500/50 text-white'
                                                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                                                    }`}
                                            >
                                                <p className="font-medium text-sm">{qt.label}</p>
                                                <p className="text-xs mt-1 opacity-70">{qt.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Question Text */}
                                <div className="mb-6">
                                    <label className="input-label">Question Text</label>
                                    <textarea
                                        value={formData.text}
                                        onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                        className="input-field min-h-[100px] resize-y"
                                        placeholder="Enter your question here..."
                                    />
                                </div>

                                {/* Options (for MCQ and True/False) */}
                                {formData.type !== 'coding' && (
                                    <div className="mb-6">
                                        <label className="input-label">
                                            Options {formData.type === 'mcq-multiple' && '(Select all correct answers)'}
                                        </label>
                                        <div className="space-y-3">
                                            {formData.options.map((option, index) => (
                                                <div key={option.id} className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => toggleCorrectAnswer(option.id)}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${option.isCorrect
                                                            ? 'bg-success-500 text-white'
                                                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {option.isCorrect ? <Check className="w-4 h-4" /> : String.fromCharCode(65 + index)}
                                                    </button>
                                                    <input
                                                        type="text"
                                                        value={option.text}
                                                        onChange={(e) => {
                                                            const newOptions = [...formData.options];
                                                            newOptions[index].text = e.target.value;
                                                            setFormData({ ...formData, options: newOptions });
                                                        }}
                                                        className="input-field flex-1"
                                                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                                        disabled={formData.type === 'true-false'}
                                                    />
                                                    {formData.type !== 'true-false' && formData.options.length > 2 && (
                                                        <button
                                                            onClick={() => removeOption(option.id)}
                                                            className="text-slate-500 hover:text-danger-400 transition-colors"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {formData.type !== 'true-false' && (
                                            <button
                                                onClick={addOption}
                                                className="mt-3 text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Option
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Correct Answer (for coding) */}
                                {formData.type === 'coding' && (
                                    <div className="mb-6">
                                        <label className="input-label">Expected Answer / Solution</label>
                                        <textarea
                                            value={formData.correctAnswer}
                                            onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                                            className="input-field min-h-[100px] font-mono text-sm resize-y"
                                            placeholder="Enter the expected code solution..."
                                        />
                                    </div>
                                )}

                                {/* Difficulty & Topic Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="input-label">Difficulty</label>
                                        <div className="flex gap-2">
                                            {difficultyLevels.map((d) => (
                                                <button
                                                    key={d.value}
                                                    onClick={() => setFormData({ ...formData, difficulty: d.value })}
                                                    className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${formData.difficulty === d.value
                                                        ? d.color
                                                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                                                        }`}
                                                >
                                                    {d.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="input-label">Topic</label>
                                        <input
                                            type="text"
                                            value={formData.topic}
                                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                            className="input-field"
                                            placeholder="e.g., JavaScript Basics"
                                        />
                                    </div>
                                </div>

                                {/* Points & Negative Marking */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="input-label">Points</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.points}
                                            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">Negative Marking</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.negativeMarking}
                                            onChange={(e) => setFormData({ ...formData, negativeMarking: parseInt(e.target.value) || 0 })}
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                {/* Explanation */}
                                <div className="mb-6">
                                    <label className="input-label">Explanation (Optional)</label>
                                    <textarea
                                        value={formData.explanation}
                                        onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                                        className="input-field min-h-[80px] resize-y"
                                        placeholder="Explain why this answer is correct..."
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={resetForm}
                                        className="flex-1 gradient-button-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmitQuestion}
                                        className="flex-1 gradient-button"
                                    >
                                        {editingQuestion ? 'Update Question' : 'Add Question'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Questions List */}
                    {questions.length === 0 ? (
                        <EmptyState
                            type="questions"
                            actionLabel="Add Your First Question"
                            onAction={() => setShowForm(true)}
                        />
                    ) : (
                        <div className="space-y-4">
                            {questions.map((question, index) => (
                                <div key={question.id} className="glass-card overflow-hidden">
                                    {/* Question Header */}
                                    <div
                                        className="p-4 flex items-start gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                                        onClick={() => {
                                            const newExpanded = new Set(expandedQuestions);
                                            if (newExpanded.has(question.id)) {
                                                newExpanded.delete(question.id);
                                            } else {
                                                newExpanded.add(question.id);
                                            }
                                            setExpandedQuestions(newExpanded);
                                        }}
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium line-clamp-2">{question.text}</p>
                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                <span className={`badge text-xs ${question.difficulty === 'easy' ? 'badge-success' :
                                                    question.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'
                                                    }`}>
                                                    {question.difficulty}
                                                </span>
                                                <span className="badge badge-primary text-xs">{question.type}</span>
                                                {question.topic && (
                                                    <span className="badge badge-accent text-xs">{question.topic}</span>
                                                )}
                                                <span className="text-xs text-slate-500">{question.points} pts</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditQuestion(question);
                                                }}
                                                className="p-2 text-slate-400 hover:text-primary-400 hover:bg-white/5 rounded-lg transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    duplicateQuestion(question.id);
                                                    showToast('success', 'Question duplicated');
                                                }}
                                                className="p-2 text-slate-400 hover:text-accent-400 hover:bg-white/5 rounded-lg transition-colors"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteQuestion(question.id);
                                                }}
                                                className="p-2 text-slate-400 hover:text-danger-400 hover:bg-white/5 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            {expandedQuestions.has(question.id) ? (
                                                <ChevronUp className="w-5 h-5 text-slate-400" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-slate-400" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {expandedQuestions.has(question.id) && (
                                        <div className="px-4 pb-4 pt-2 border-t border-white/5 animate-slide-down">
                                            {question.type !== 'coding' && question.options.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-sm text-slate-400 mb-2">Options:</p>
                                                    <div className="space-y-2">
                                                        {question.options.map((opt, i) => (
                                                            <div
                                                                key={opt.id}
                                                                className={`p-3 rounded-lg flex items-center gap-3 ${opt.isCorrect
                                                                    ? 'bg-success-500/10 border border-success-500/30'
                                                                    : 'bg-white/5'
                                                                    }`}
                                                            >
                                                                <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${opt.isCorrect ? 'bg-success-500 text-white' : 'bg-white/10 text-slate-400'
                                                                    }`}>
                                                                    {opt.isCorrect ? <Check className="w-4 h-4" /> : String.fromCharCode(65 + i)}
                                                                </span>
                                                                <span className={opt.isCorrect ? 'text-success-300' : 'text-slate-300'}>
                                                                    {opt.text}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {question.type === 'coding' && question.correctAnswer && (
                                                <div className="mb-4">
                                                    <p className="text-sm text-slate-400 mb-2">Expected Solution:</p>
                                                    <pre className="p-4 bg-slate-800 rounded-lg text-sm text-slate-300 overflow-x-auto">
                                                        <code>{question.correctAnswer}</code>
                                                    </pre>
                                                </div>
                                            )}
                                            {question.explanation && (
                                                <div>
                                                    <p className="text-sm text-slate-400 mb-2">Explanation:</p>
                                                    <p className="text-slate-300 bg-white/5 p-3 rounded-lg">{question.explanation}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* AI Mode */}
            {mode === 'ai' && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Subject Selection */}
                    <div className="lg:col-span-2 glass-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Select Subject</h3>
                                <p className="text-xs text-slate-400">Choose a subject area</p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                value={subjectSearchQuery}
                                onChange={(e) => setSubjectSearchQuery(e.target.value)}
                                className="input-field pl-10"
                                placeholder="Search subjects & topics..."
                            />
                        </div>

                        {/* Subject Grid */}
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {filteredSubjects.map((subject) => (
                                <button
                                    key={subject.id}
                                    onClick={() => handleSelectSubject(subject)}
                                    className={`w-full p-3 rounded-xl transition-all text-left flex items-center gap-3 ${selectedSubject?.id === subject.id
                                        ? 'bg-gradient-to-r ' + subject.color + ' text-white'
                                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                                        }`}
                                >
                                    <span className="text-2xl">{subject.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{subject.name}</p>
                                        <p className="text-xs opacity-70">{subject.topics.length} topics</p>
                                    </div>
                                    {selectedSubject?.id === subject.id && (
                                        <CheckCircle className="w-5 h-5" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Topic & Subtopic Selection */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Topics */}
                        {selectedSubject && (
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="text-xl">{selectedSubject.icon}</span>
                                    Topics in {selectedSubject.name}
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                                    {selectedSubject.topics.map((topic) => {
                                        const isSelected = selectedTopics.find(t => t.id === topic.id);
                                        return (
                                            <button
                                                key={topic.id}
                                                onClick={() => handleToggleTopic(topic)}
                                                className={`p-3 rounded-lg text-sm font-medium transition-all ${isSelected
                                                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/50'
                                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                {topic.name}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Subtopics */}
                                {selectedTopics.length > 0 && (
                                    <div className="border-t border-white/10 pt-4">
                                        <p className="text-sm text-slate-400 mb-3">Subtopics (optional, for more specific questions):</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedTopics.flatMap(topic =>
                                                (topic.subtopics || []).map(subtopic => {
                                                    const isSelected = selectedSubtopics.includes(subtopic);
                                                    return (
                                                        <button
                                                            key={subtopic}
                                                            onClick={() => handleToggleSubtopic(subtopic)}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isSelected
                                                                ? 'bg-accent-500/20 text-accent-300 border border-accent-500/50'
                                                                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            {subtopic}
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Generation Options */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Wand2 className="w-5 h-5 text-accent-400" />
                                Generation Options
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {/* Difficulty */}
                                <div>
                                    <label className="input-label">Difficulty</label>
                                    <div className="flex gap-2">
                                        {difficultyLevels.map((d) => (
                                            <button
                                                key={d.value}
                                                onClick={() => setAiDifficulty(d.value)}
                                                className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${aiDifficulty === d.value
                                                    ? d.color
                                                    : 'bg-white/5 border-white/10 text-slate-400'
                                                    }`}
                                            >
                                                {d.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Question Type */}
                                <div>
                                    <label className="input-label">Question Type</label>
                                    <select
                                        value={aiQuestionType}
                                        onChange={(e) => setAiQuestionType(e.target.value as QuestionType)}
                                        className="input-field"
                                    >
                                        {questionTypes.map(qt => (
                                            <option key={qt.type} value={qt.type}>{qt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Count */}
                                <div>
                                    <label className="input-label">Number of Questions</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={aiQuestionCount}
                                        onChange={(e) => setAiQuestionCount(parseInt(e.target.value) || 5)}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {/* Availability Indicator */}
                            {isIntelligentSubject && selectedTopics.length > 0 && (
                                <div className={`p-3 rounded-lg border ${availableQuestionsCount > 0
                                    ? 'bg-success-500/10 border-success-500/30'
                                    : 'bg-warning-500/10 border-warning-500/30'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm font-medium ${availableQuestionsCount > 0 ? 'text-success-300' : 'text-warning-300'}`}>
                                            {availableQuestionsCount > 0
                                                ? `✓ ${availableQuestionsCount} unique questions available`
                                                : '⚠ No more unique questions available'
                                            }
                                        </span>
                                        {availableQuestionsCount === 0 && (
                                            <button
                                                onClick={handleResetQuestionPool}
                                                className="text-xs px-3 py-1 bg-primary-500/20 text-primary-300 rounded-lg hover:bg-primary-500/30 transition-colors"
                                            >
                                                Reset Pool
                                            </button>
                                        )}
                                    </div>
                                    {availableQuestionsCount === 0 && (
                                        <p className="text-xs text-slate-400 mt-1">
                                            All questions have been used. Reset to generate fresh questions.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Generate Button */}
                            <button
                                onClick={handleGenerateQuestions}
                                disabled={isGenerating || !selectedSubject || selectedTopics.length === 0}
                                className="w-full gradient-button flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <>
                                        <Spinner size="sm" />
                                        Generating... {generationProgress}%
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5" />
                                        Generate {aiQuestionCount} Questions
                                    </>
                                )}
                            </button>

                            {/* Reset Session Button */}
                            {questionGenerator.getStats().sessionUsed > 0 && (
                                <button
                                    onClick={handleResetQuestionPool}
                                    className="w-full text-sm text-slate-400 hover:text-primary-300 transition-colors py-2"
                                >
                                    🔄 Reset question pool ({questionGenerator.getStats().sessionUsed} questions used this session)
                                </button>
                            )}

                            {/* Progress Bar */}
                            {isGenerating && (
                                <div className="mt-4">
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
                                            style={{ width: `${generationProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Generated Questions */}
                        {aiQuestions.length > 0 && (
                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-accent-400" />
                                        Generated Questions
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-success-400">{approvedCount} approved</span>
                                        <span className="text-slate-500">•</span>
                                        <span className="text-warning-400">{pendingAIQuestions.length} pending</span>
                                        <span className="text-slate-500">•</span>
                                        <span className="text-danger-400">{rejectedCount} rejected</span>
                                    </div>
                                </div>

                                {/* Bulk Actions */}
                                {pendingAIQuestions.length > 0 && (
                                    <div className="flex gap-2 mb-4">
                                        <button
                                            onClick={handleApproveAll}
                                            className="flex-1 py-2 px-3 bg-success-500/20 text-success-400 rounded-lg text-sm font-medium hover:bg-success-500/30 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve All ({pendingAIQuestions.length})
                                        </button>
                                        <button
                                            onClick={rejectAll}
                                            className="flex-1 py-2 px-3 bg-danger-500/20 text-danger-400 rounded-lg text-sm font-medium hover:bg-danger-500/30 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject All
                                        </button>
                                        <button
                                            onClick={clearGenerated}
                                            className="py-2 px-3 bg-white/5 text-slate-400 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                )}

                                {/* Questions List */}
                                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {pendingAIQuestions.map((aiQ, index) => (
                                        <div key={aiQ.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                                            <div className="flex items-start gap-3 mb-3">
                                                <span className="w-7 h-7 rounded-lg bg-accent-500/20 text-accent-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                    {index + 1}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="text-white text-sm">{aiQ.question.text}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`badge text-xs ${aiQ.question.difficulty === 'easy' ? 'badge-success' :
                                                            aiQ.question.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'
                                                            }`}>
                                                            {aiQ.question.difficulty}
                                                        </span>
                                                        <span className="badge badge-primary text-xs">{aiQ.question.type}</span>
                                                        {aiQ.confidence && (
                                                            <span className="text-xs text-slate-500">
                                                                {Math.round(aiQ.confidence * 100)}% confidence
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Options Preview */}
                                            {aiQ.question.options.length > 0 && (
                                                <div className="ml-10 mb-3 space-y-1">
                                                    {aiQ.question.options.map((opt, i) => (
                                                        <div key={opt.id} className="flex items-center gap-2 text-xs">
                                                            <span className={opt.isCorrect ? 'text-success-400' : 'text-slate-500'}>
                                                                {String.fromCharCode(65 + i)}.
                                                            </span>
                                                            <span className={opt.isCorrect ? 'text-success-300' : 'text-slate-400'}>
                                                                {opt.text}
                                                                {opt.isCorrect && ' ✓'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApproveAIQuestion(aiQ.id)}
                                                    className="flex-1 py-2 px-3 bg-success-500/20 text-success-400 rounded-lg text-sm font-medium hover:bg-success-500/30 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => regenerateQuestion(aiQ.id)}
                                                    className="py-2 px-3 bg-white/5 text-slate-400 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => rejectQuestion(aiQ.id)}
                                                    className="flex-1 py-2 px-3 bg-danger-500/20 text-danger-400 rounded-lg text-sm font-medium hover:bg-danger-500/30 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {pendingAIQuestions.length === 0 && aiQuestions.length > 0 && (
                                        <div className="text-center py-8 text-slate-400">
                                            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-success-500/50" />
                                            <p>All questions have been reviewed!</p>
                                            <button
                                                onClick={clearGenerated}
                                                className="mt-2 text-primary-400 hover:text-primary-300 text-sm"
                                            >
                                                Generate more questions
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!selectedSubject && (
                            <div className="glass-card p-12 text-center">
                                <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">Select a Subject</h3>
                                <p className="text-slate-400">
                                    Choose a subject from the left panel to start generating questions
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionsPage;
