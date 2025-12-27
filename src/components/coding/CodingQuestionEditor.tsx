// ============================================
// Coding Question Editor Component
// ============================================
// This component allows admins to create and edit coding questions
// with problem statements, test cases, and execution settings.

import React, { useState } from 'react';
import {
    Code,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    Save,
    X,
    Clock,
    Terminal,
    FileText,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { CodingQuestion, TestCase, SupportedLanguage } from '../../types/coding';

interface CodingQuestionEditorProps {
    testId: string;
    question?: CodingQuestion | null;
    onSave: (question: Omit<CodingQuestion, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
}

const CodingQuestionEditor: React.FC<CodingQuestionEditorProps> = ({
    testId,
    question,
    onSave,
    onCancel,
}) => {
    // Form state
    const [problemStatement, setProblemStatement] = useState(question?.problemStatement || '');
    const [sampleInput, setSampleInput] = useState(question?.sampleInput || '');
    const [sampleOutput, setSampleOutput] = useState(question?.sampleOutput || '');
    const [hiddenTestCases, setHiddenTestCases] = useState<TestCase[]>(
        question?.hiddenTestCases || []
    );
    const [timeLimit, setTimeLimit] = useState(question?.timeLimit || 5);
    const [points, setPoints] = useState(question?.points || 10);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(
        question?.difficulty || 'medium'
    );
    const [topic, setTopic] = useState(question?.topic || '');
    const [hints, setHints] = useState<string[]>(question?.hints || []);
    const [starterCode, setStarterCode] = useState(
        question?.starterCode?.python || '# Write your Python code here\n'
    );

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Add a new hidden test case
    const addTestCase = () => {
        const newTestCase: TestCase = {
            id: uuidv4(),
            input: '',
            expectedOutput: '',
            isHidden: true,
            weight: 1,
        };
        setHiddenTestCases([...hiddenTestCases, newTestCase]);
    };

    // Update a test case
    const updateTestCase = (id: string, updates: Partial<TestCase>) => {
        setHiddenTestCases(
            hiddenTestCases.map(tc =>
                tc.id === id ? { ...tc, ...updates } : tc
            )
        );
    };

    // Remove a test case
    const removeTestCase = (id: string) => {
        setHiddenTestCases(hiddenTestCases.filter(tc => tc.id !== id));
    };

    // Add a hint
    const addHint = () => {
        setHints([...hints, '']);
    };

    // Update a hint
    const updateHint = (index: number, value: string) => {
        const newHints = [...hints];
        newHints[index] = value;
        setHints(newHints);
    };

    // Remove a hint
    const removeHint = (index: number) => {
        setHints(hints.filter((_, i) => i !== index));
    };

    // Validate form
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!problemStatement.trim()) {
            newErrors.problemStatement = 'Problem statement is required';
        }

        if (!sampleInput.trim() && !sampleOutput.trim()) {
            // Allow empty sample for simple problems
        }

        if (hiddenTestCases.length === 0) {
            newErrors.testCases = 'At least one hidden test case is required for evaluation';
        }

        for (let i = 0; i < hiddenTestCases.length; i++) {
            const tc = hiddenTestCases[i];
            if (!tc.expectedOutput.trim()) {
                newErrors[`testCase_${tc.id}`] = `Test case ${i + 1} needs an expected output`;
            }
        }

        if (timeLimit < 1 || timeLimit > 30) {
            newErrors.timeLimit = 'Time limit must be between 1 and 30 seconds';
        }

        if (points < 1) {
            newErrors.points = 'Points must be at least 1';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle save
    const handleSave = () => {
        if (!validate()) return;

        const questionData: Omit<CodingQuestion, 'id' | 'createdAt' | 'updatedAt'> = {
            testId,
            type: 'coding',
            problemStatement,
            sampleInput,
            sampleOutput,
            hiddenTestCases,
            timeLimit,
            supportedLanguages: ['python'],
            starterCode: { python: starterCode } as Record<SupportedLanguage, string>,
            hints: hints.filter(h => h.trim()),
            difficulty,
            topic,
            points,
            order: question?.order || 1,
        };

        onSave(questionData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 overflow-y-auto">
            <div className="glass-card p-8 max-w-4xl w-full my-8 animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <Code className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {question ? 'Edit Coding Question' : 'Create Coding Question'}
                            </h2>
                            <p className="text-sm text-slate-400">
                                Design a coding problem with test cases
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 text-slate-400 hover:text-white rounded-lg"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="space-y-6">
                    {/* Problem Statement */}
                    <div>
                        <label className="input-label flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Problem Statement *
                        </label>
                        <textarea
                            value={problemStatement}
                            onChange={e => setProblemStatement(e.target.value)}
                            className={`input-field min-h-[150px] resize-y ${errors.problemStatement ? 'border-danger-500' : ''
                                }`}
                            placeholder="Write a clear problem description. Include:
- What the program should do
- Input format
- Output format
- Constraints (if any)
- Examples"
                        />
                        {errors.problemStatement && (
                            <p className="text-danger-400 text-xs mt-1">{errors.problemStatement}</p>
                        )}
                    </div>

                    {/* Sample Input/Output */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="input-label flex items-center gap-2">
                                <Terminal className="w-4 h-4" />
                                Sample Input
                            </label>
                            <textarea
                                value={sampleInput}
                                onChange={e => setSampleInput(e.target.value)}
                                className="input-field min-h-[100px] font-mono text-sm resize-y"
                                placeholder="5
1 2 3 4 5"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Shown to students as example input
                            </p>
                        </div>
                        <div>
                            <label className="input-label flex items-center gap-2">
                                <Terminal className="w-4 h-4" />
                                Sample Output
                            </label>
                            <textarea
                                value={sampleOutput}
                                onChange={e => setSampleOutput(e.target.value)}
                                className="input-field min-h-[100px] font-mono text-sm resize-y"
                                placeholder="15"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Expected output for sample input
                            </p>
                        </div>
                    </div>

                    {/* Hidden Test Cases */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="input-label flex items-center gap-2 mb-0">
                                <EyeOff className="w-4 h-4" />
                                Hidden Test Cases *
                            </label>
                            <button
                                onClick={addTestCase}
                                className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                Add Test Case
                            </button>
                        </div>

                        {errors.testCases && (
                            <p className="text-danger-400 text-xs mb-2">{errors.testCases}</p>
                        )}

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            {hiddenTestCases.map((tc, index) => (
                                <div
                                    key={tc.id}
                                    className="bg-slate-800/50 rounded-xl p-4 border border-white/5"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-white">
                                            Test Case {index + 1}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateTestCase(tc.id, { isHidden: !tc.isHidden })}
                                                className={`p-1.5 rounded-lg ${tc.isHidden
                                                    ? 'bg-warning-500/20 text-warning-400'
                                                    : 'bg-success-500/20 text-success-400'
                                                    }`}
                                                title={tc.isHidden ? 'Hidden from students' : 'Visible to students'}
                                            >
                                                {tc.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => removeTestCase(tc.id)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-danger-400 hover:bg-danger-500/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">Input</label>
                                            <textarea
                                                value={tc.input}
                                                onChange={e => updateTestCase(tc.id, { input: e.target.value })}
                                                className="input-field font-mono text-sm min-h-[60px] resize-y"
                                                placeholder="Test input..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">Expected Output</label>
                                            <textarea
                                                value={tc.expectedOutput}
                                                onChange={e => updateTestCase(tc.id, { expectedOutput: e.target.value })}
                                                className={`input-field font-mono text-sm min-h-[60px] resize-y ${errors[`testCase_${tc.id}`] ? 'border-danger-500' : ''
                                                    }`}
                                                placeholder="Expected output..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {hiddenTestCases.length === 0 && (
                                <div className="text-center py-8 text-slate-500">
                                    <EyeOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No test cases yet. Add at least one for evaluation.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Settings Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="input-label flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Time Limit (sec)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={timeLimit}
                                onChange={e => setTimeLimit(parseInt(e.target.value) || 5)}
                                className={`input-field ${errors.timeLimit ? 'border-danger-500' : ''}`}
                            />
                            {errors.timeLimit && (
                                <p className="text-danger-400 text-xs mt-1">{errors.timeLimit}</p>
                            )}
                        </div>
                        <div>
                            <label className="input-label">Points</label>
                            <input
                                type="number"
                                min="1"
                                value={points}
                                onChange={e => setPoints(parseInt(e.target.value) || 10)}
                                className={`input-field ${errors.points ? 'border-danger-500' : ''}`}
                            />
                        </div>
                        <div>
                            <label className="input-label">Difficulty</label>
                            <select
                                value={difficulty}
                                onChange={e => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                                className="input-field"
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Topic</label>
                            <input
                                type="text"
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                className="input-field"
                                placeholder="e.g., Arrays"
                            />
                        </div>
                    </div>

                    {/* Starter Code */}
                    <div>
                        <label className="input-label flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            Starter Code (Optional)
                        </label>
                        <textarea
                            value={starterCode}
                            onChange={e => setStarterCode(e.target.value)}
                            className="input-field min-h-[100px] font-mono text-sm resize-y"
                            placeholder="# Optional starter code for students"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            This code will be pre-filled in the editor for students
                        </p>
                    </div>

                    {/* Hints */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="input-label mb-0">Hints (Optional)</label>
                            <button
                                onClick={addHint}
                                className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                Add Hint
                            </button>
                        </div>
                        <div className="space-y-2">
                            {hints.map((hint, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 w-4">{index + 1}.</span>
                                    <input
                                        type="text"
                                        value={hint}
                                        onChange={e => updateHint(index, e.target.value)}
                                        className="input-field flex-1"
                                        placeholder="Hint for students..."
                                    />
                                    <button
                                        onClick={() => removeHint(index)}
                                        className="text-slate-400 hover:text-danger-400"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-8 pt-6 border-t border-white/5">
                    <button onClick={onCancel} className="flex-1 gradient-button-secondary">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="flex-1 gradient-button flex items-center justify-center gap-2">
                        <Save className="w-5 h-5" />
                        {question ? 'Update Question' : 'Create Question'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CodingQuestionEditor;
