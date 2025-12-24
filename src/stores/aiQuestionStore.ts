// ============================================
// AI Question Store - Enhanced Generation
// Integrated with Intelligent Question Generation System
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Question, QuestionType, Difficulty, AIGeneratedQuestion, AIGenerationRequest, QuestionOption } from '../types';
import { subjectData, aiQuestionBank } from '../data/subjectData';
import { questionGenerator } from '../ai';

interface AIQuestionState {
    aiQuestions: AIGeneratedQuestion[];
    isGenerating: boolean;
    generationProgress: number;
    lastGenerationRequest: AIGenerationRequest | null;

    // Actions
    generateQuestions: (request: AIGenerationRequest) => Promise<void>;
    approveQuestion: (id: string) => Question | null;
    rejectQuestion: (id: string) => void;
    editQuestion: (id: string, updates: Partial<Question>) => void;
    approveAll: () => Question[];
    rejectAll: () => void;
    clearGenerated: () => void;
    regenerateQuestion: (id: string) => void;
}

// Enhanced question generation with realistic content
const generateMockQuestion = (
    subject: string,
    topics: string[],
    subtopics: string[],
    difficulty: Difficulty,
    type: QuestionType,
    index: number
): Question => {
    // Try to get a real question from the question bank
    const topicId = topics[0]?.toLowerCase().replace(/\s+/g, '-');
    const subjectQuestions = aiQuestionBank[topicId];

    if (subjectQuestions) {
        // Find questions matching the subtopic or randomly pick
        const availableSubtopics = Object.keys(subjectQuestions);
        const matchingSubtopic = subtopics.find(st => availableSubtopics.includes(st)) || availableSubtopics[0];
        const questionsForSubtopic = subjectQuestions[matchingSubtopic];

        if (questionsForSubtopic && questionsForSubtopic.length > 0) {
            const q = questionsForSubtopic[index % questionsForSubtopic.length];

            return {
                id: uuidv4(),
                testId: '', // Will be set when approved
                type: type,
                text: q.text,
                options: q.options?.map(opt => ({
                    id: uuidv4(),
                    text: opt.text,
                    isCorrect: opt.isCorrect,
                })) || [],
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                difficulty: q.difficulty || difficulty,
                topic: topics[0] || subject,
                points: difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15,
                negativeMarking: difficulty === 'hard' ? 2 : difficulty === 'medium' ? 1 : 0,
                order: index + 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        }
    }

    // Fallback: Generate dynamic questions based on type and topic
    const subjectInfo = subjectData.find(s => s.id === subject || s.name === subject);
    const topicInfo = subjectInfo?.topics.find(t => topics.includes(t.name) || topics.includes(t.id));
    const topicName = topicInfo?.name || topics[0] || subject;
    const subtopicName = subtopics[0] || topicInfo?.subtopics?.[0] || topicName;

    let questionText = '';
    let options: QuestionOption[] = [];
    let correctAnswer = '';
    let explanation = '';

    if (type === 'mcq-single') {
        const templates = [
            `What is the primary purpose of ${subtopicName} in ${topicName}?`,
            `Which of the following best describes ${subtopicName}?`,
            `In the context of ${topicName}, what is ${subtopicName} used for?`,
            `What is a key characteristic of ${subtopicName}?`,
            `Which statement about ${subtopicName} is correct?`,
        ];
        questionText = templates[index % templates.length];

        options = [
            { id: uuidv4(), text: `It provides core functionality for ${topicName} operations`, isCorrect: true },
            { id: uuidv4(), text: `It is only used in legacy systems`, isCorrect: false },
            { id: uuidv4(), text: `It has been deprecated in modern versions`, isCorrect: false },
            { id: uuidv4(), text: `It is unrelated to ${topicName}`, isCorrect: false },
        ];
        explanation = `${subtopicName} is a fundamental concept in ${topicName} that provides essential functionality for various operations and use cases.`;
    } else if (type === 'mcq-multiple') {
        questionText = `Select ALL features that apply to ${subtopicName} in ${topicName}:`;
        options = [
            { id: uuidv4(), text: `Supports ${difficulty === 'easy' ? 'basic' : 'advanced'} operations`, isCorrect: true },
            { id: uuidv4(), text: `Integrates with other ${topicName} components`, isCorrect: true },
            { id: uuidv4(), text: `Only works in specific environments`, isCorrect: false },
            { id: uuidv4(), text: `Provides extensible architecture`, isCorrect: true },
            { id: uuidv4(), text: `Requires manual configuration for every use`, isCorrect: false },
        ];
        explanation = `${subtopicName} offers multiple features including support for various operations, integration capabilities, and extensibility.`;
    } else if (type === 'true-false') {
        const trueStatements = [
            `${subtopicName} is an important concept in ${topicName}.`,
            `Understanding ${subtopicName} is essential for mastering ${topicName}.`,
            `${subtopicName} can improve performance when used correctly.`,
        ];
        const falseStatements = [
            `${subtopicName} is no longer used in modern ${topicName}.`,
            `${subtopicName} should always be avoided in production.`,
            `${subtopicName} has no practical applications.`,
        ];

        const isTrue = index % 2 === 0;
        questionText = isTrue ? trueStatements[index % trueStatements.length] : falseStatements[index % falseStatements.length];
        options = [
            { id: uuidv4(), text: 'True', isCorrect: isTrue },
            { id: uuidv4(), text: 'False', isCorrect: !isTrue },
        ];
        explanation = isTrue
            ? `This statement is TRUE. ${subtopicName} is indeed an important part of ${topicName}.`
            : `This statement is FALSE. ${subtopicName} remains relevant and widely used in ${topicName}.`;
    } else if (type === 'coding') {
        const codingTasks = [
            `Write a function that demonstrates the use of ${subtopicName}.`,
            `Implement a simple example showcasing ${subtopicName} in ${topicName}.`,
            `Create a code snippet that correctly applies ${subtopicName}.`,
        ];
        questionText = codingTasks[index % codingTasks.length];
        correctAnswer = `// Example implementation for ${subtopicName}\nfunction example${subtopicName.replace(/\s+/g, '')}() {\n  // Your implementation here\n  console.log("Demonstrating ${subtopicName}");\n}`;
        explanation = `A proper implementation should demonstrate understanding of ${subtopicName} concepts and follow best practices in ${topicName}.`;
    }

    return {
        id: uuidv4(),
        testId: '',
        type,
        text: questionText,
        options,
        correctAnswer: type === 'coding' ? correctAnswer : undefined,
        explanation,
        difficulty,
        topic: topicName,
        points: difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15,
        negativeMarking: difficulty === 'hard' ? 2 : difficulty === 'medium' ? 1 : 0,
        order: index + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
};

export const useAIQuestionStore = create<AIQuestionState>()(
    persist(
        (set, get) => ({
            aiQuestions: [],
            isGenerating: false,
            generationProgress: 0,
            lastGenerationRequest: null,

            generateQuestions: async (request: AIGenerationRequest) => {
                set({ isGenerating: true, generationProgress: 0, lastGenerationRequest: request });

                const { subject, topics, subtopics, difficulty, questionCount, questionType } = request;

                // Check available questions from intelligent generator
                const availableCount = questionGenerator.getAvailableQuestionCount(
                    subject,
                    topics,
                    difficulty as 'easy' | 'medium' | 'hard' | 'mixed'
                );

                set({ generationProgress: 10 });

                // Use intelligent generator for matching subjects
                const intelligentSubjects = questionGenerator.getSubjects();
                const matchingSubject = intelligentSubjects.find(
                    s => s.toLowerCase() === subject.toLowerCase() ||
                        s.toLowerCase().includes(subject.toLowerCase())
                );

                if (matchingSubject && availableCount > 0) {
                    // Use intelligent rule-based generator
                    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
                    set({ generationProgress: 30 });

                    const result = questionGenerator.generateQuestions({
                        subject: matchingSubject,
                        topics: topics,
                        difficulty: difficulty as 'easy' | 'medium' | 'hard' | 'mixed',
                        count: questionCount
                    });

                    set({ generationProgress: 70 });

                    // Convert to AIGeneratedQuestion format
                    const generatedQuestions: AIGeneratedQuestion[] = result.questions.map((q, index) => ({
                        id: uuidv4(),
                        question: {
                            id: q.id,
                            testId: '',
                            type: questionType,
                            text: q.question,
                            options: q.options.map((opt) => ({
                                id: uuidv4(),
                                text: opt,
                                isCorrect: opt === q.correctAnswer
                            })),
                            correctAnswer: q.correctAnswer,
                            explanation: q.explanation,
                            difficulty: q.difficulty as Difficulty,
                            topic: q.topic,
                            points: q.difficulty === 'easy' ? 5 : q.difficulty === 'medium' ? 10 : 15,
                            negativeMarking: q.difficulty === 'hard' ? 2 : q.difficulty === 'medium' ? 1 : 0,
                            order: index + 1,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                        status: 'pending',
                        generatedAt: new Date(),
                        confidence: 0.85 + Math.random() * 0.1, // High confidence for rule-based
                        source: `Intelligent Generator - ${q.subject}/${q.topic}`,
                    }));

                    set({
                        aiQuestions: [...get().aiQuestions, ...generatedQuestions],
                        generationProgress: 100,
                        isGenerating: false
                    });

                    // Show warning if not enough questions
                    if (result.warning) {
                        console.warn(result.warning);
                    }

                    return;
                }

                // Fallback to legacy mock generation
                const generatedQuestions: AIGeneratedQuestion[] = [];
                const usedQuestionTexts = new Set<string>();

                for (let i = 0; i < questionCount; i++) {
                    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));

                    let question: Question;
                    let attempts = 0;
                    const maxAttempts = 10;

                    do {
                        question = generateMockQuestion(
                            subject,
                            topics,
                            subtopics || [],
                            difficulty,
                            questionType,
                            i + attempts * questionCount
                        );
                        attempts++;
                    } while (usedQuestionTexts.has(question.text) && attempts < maxAttempts);

                    usedQuestionTexts.add(question.text);

                    const aiQuestion: AIGeneratedQuestion = {
                        id: uuidv4(),
                        question,
                        status: 'pending',
                        generatedAt: new Date(),
                        confidence: 0.75 + Math.random() * 0.2,
                        source: `AI Generated - ${subject}/${topics.join(', ')}`,
                    };

                    generatedQuestions.push(aiQuestion);

                    set({
                        aiQuestions: [...get().aiQuestions, aiQuestion],
                        generationProgress: Math.round(((i + 1) / questionCount) * 100),
                    });
                }

                set({ isGenerating: false, generationProgress: 100 });
            },

            approveQuestion: (id: string) => {
                const aiQuestion = get().aiQuestions.find(q => q.id === id);
                if (!aiQuestion) return null;

                set({
                    aiQuestions: get().aiQuestions.map(q =>
                        q.id === id ? { ...q, status: 'approved' as const } : q
                    ),
                });

                return aiQuestion.question;
            },

            rejectQuestion: (id: string) => {
                set({
                    aiQuestions: get().aiQuestions.map(q =>
                        q.id === id ? { ...q, status: 'rejected' as const } : q
                    ),
                });
            },

            editQuestion: (id: string, updates: Partial<Question>) => {
                set({
                    aiQuestions: get().aiQuestions.map(q =>
                        q.id === id
                            ? { ...q, question: { ...q.question, ...updates, updatedAt: new Date() } }
                            : q
                    ),
                });
            },

            approveAll: () => {
                const pending = get().aiQuestions.filter(q => q.status === 'pending');
                const approved: Question[] = [];

                set({
                    aiQuestions: get().aiQuestions.map(q =>
                        q.status === 'pending' ? { ...q, status: 'approved' as const } : q
                    ),
                });

                pending.forEach(q => approved.push(q.question));
                return approved;
            },

            rejectAll: () => {
                set({
                    aiQuestions: get().aiQuestions.map(q =>
                        q.status === 'pending' ? { ...q, status: 'rejected' as const } : q
                    ),
                });
            },

            clearGenerated: () => {
                set({ aiQuestions: [], generationProgress: 0 });
            },

            regenerateQuestion: (id: string) => {
                const aiQuestion = get().aiQuestions.find(q => q.id === id);
                if (!aiQuestion || !get().lastGenerationRequest) return;

                const request = get().lastGenerationRequest!;
                const newQuestion = generateMockQuestion(
                    request.subject,
                    request.topics,
                    request.subtopics || [],
                    request.difficulty,
                    request.questionType,
                    Math.floor(Math.random() * 100)
                );

                set({
                    aiQuestions: get().aiQuestions.map(q =>
                        q.id === id
                            ? {
                                ...q,
                                question: newQuestion,
                                status: 'pending' as const,
                                generatedAt: new Date(),
                                confidence: 0.75 + Math.random() * 0.2,
                            }
                            : q
                    ),
                });
            },
        }),
        {
            name: 'testexam-ai-questions',
        }
    )
);
