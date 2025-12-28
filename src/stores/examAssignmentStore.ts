// ============================================
// Exam Assignment Store - Exam-User Mappings
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
    collection,
    doc,
    getDocs,
    setDoc,
    updateDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ExamAssignment, ExamWithStatus } from '../types/auth';
import { Test } from '../types';

interface ExamAssignmentState {
    assignments: ExamAssignment[];
    isLoading: boolean;
    error: string | null;

    // Actions
    assignExamToUser: (examId: string, userId: string) => Promise<void>;
    assignExamToAllUsers: (examId: string, userIds: string[]) => Promise<void>;
    getAssignmentsForUser: (userId: string) => ExamAssignment[];
    getAssignmentsForExam: (examId: string) => ExamAssignment[];
    markExamAttempted: (examId: string, userId: string, score?: number) => Promise<void>;
    hasUserAttemptedExam: (examId: string, userId: string) => boolean;
    isExamAssignedToUser: (examId: string, userId: string) => boolean;
    getExamsWithStatusForUser: (userId: string, allExams: Test[]) => ExamWithStatus[];
    loadAssignments: () => Promise<void>;
    syncToFirestore: () => Promise<void>;
}

export const useExamAssignmentStore = create<ExamAssignmentState>()(
    persist(
        (set, get) => ({
            assignments: [],
            isLoading: false,
            error: null,

            assignExamToUser: async (examId: string, userId: string) => {
                const { assignments } = get();

                // Check if already assigned
                const existing = assignments.find(
                    a => a.examId === examId && a.userId === userId
                );
                if (existing) return;

                const newAssignment: ExamAssignment = {
                    id: uuidv4(),
                    examId,
                    userId,
                    assignedAt: new Date(),
                    attempted: false,
                };

                set({ assignments: [...assignments, newAssignment] });

                // Sync to Firestore
                try {
                    const docRef = doc(db, 'exam_assignments', newAssignment.id);
                    await setDoc(docRef, {
                        examId,
                        userId,
                        assignedAt: serverTimestamp(),
                        attempted: false,
                    });
                } catch (error) {
                    console.error('Failed to sync assignment to Firestore:', error);
                }
            },

            assignExamToAllUsers: async (examId: string, userIds: string[]) => {
                const { assignments } = get();
                const newAssignments: ExamAssignment[] = [];

                for (const userId of userIds) {
                    // Check if already assigned
                    const existing = assignments.find(
                        a => a.examId === examId && a.userId === userId
                    );
                    if (!existing) {
                        const newAssignment: ExamAssignment = {
                            id: uuidv4(),
                            examId,
                            userId,
                            assignedAt: new Date(),
                            attempted: false,
                        };
                        newAssignments.push(newAssignment);

                        // Sync to Firestore
                        try {
                            const docRef = doc(db, 'exam_assignments', newAssignment.id);
                            await setDoc(docRef, {
                                examId,
                                userId,
                                assignedAt: serverTimestamp(),
                                attempted: false,
                            });
                        } catch (error) {
                            console.error('Failed to sync assignment to Firestore:', error);
                        }
                    }
                }

                if (newAssignments.length > 0) {
                    set({ assignments: [...assignments, ...newAssignments] });
                }
            },

            getAssignmentsForUser: (userId: string) => {
                return get().assignments.filter(a => a.userId === userId);
            },

            getAssignmentsForExam: (examId: string) => {
                return get().assignments.filter(a => a.examId === examId);
            },

            markExamAttempted: async (examId: string, userId: string, score?: number) => {
                const { assignments } = get();
                const assignment = assignments.find(
                    a => a.examId === examId && a.userId === userId
                );

                if (!assignment) return;

                const updatedAssignments = assignments.map(a => {
                    if (a.examId === examId && a.userId === userId) {
                        return {
                            ...a,
                            attempted: true,
                            attemptedAt: new Date(),
                            score,
                        };
                    }
                    return a;
                });

                set({ assignments: updatedAssignments });

                // Sync to Firestore
                try {
                    const docRef = doc(db, 'exam_assignments', assignment.id);
                    await updateDoc(docRef, {
                        attempted: true,
                        attemptedAt: serverTimestamp(),
                        score: score || null,
                    });
                } catch (error) {
                    console.error('Failed to update assignment in Firestore:', error);
                }
            },

            hasUserAttemptedExam: (examId: string, userId: string) => {
                const assignment = get().assignments.find(
                    a => a.examId === examId && a.userId === userId
                );
                return assignment?.attempted || false;
            },

            isExamAssignedToUser: (examId: string, userId: string) => {
                return get().assignments.some(
                    a => a.examId === examId && a.userId === userId
                );
            },

            getExamsWithStatusForUser: (userId: string, allExams: Test[]) => {
                const { assignments } = get();
                const userAssignments = assignments.filter(a => a.userId === userId);

                return userAssignments.map(assignment => {
                    const exam = allExams.find(e => e.id === assignment.examId);
                    if (!exam) return null;

                    // Determine status
                    let status: 'available' | 'attempted' | 'expired' = 'available';

                    if (assignment.attempted) {
                        status = 'attempted';
                    } else if (exam.scheduledEnd && new Date(exam.scheduledEnd) < new Date()) {
                        status = 'expired';
                    } else if (exam.status === 'closed') {
                        status = 'expired';
                    }

                    return {
                        id: exam.id,
                        title: exam.name,
                        duration: exam.settings?.accessControl?.timeLimitMinutes || 60,
                        status,
                        scheduledStart: exam.scheduledStart,
                        scheduledEnd: exam.scheduledEnd,
                        attemptedAt: assignment.attemptedAt,
                        score: assignment.score,
                    } as ExamWithStatus;
                }).filter(Boolean) as ExamWithStatus[];
            },

            loadAssignments: async () => {
                set({ isLoading: true, error: null });
                try {
                    const querySnapshot = await getDocs(collection(db, 'exam_assignments'));
                    const loadedAssignments: ExamAssignment[] = [];

                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        loadedAssignments.push({
                            id: doc.id,
                            examId: data.examId,
                            userId: data.userId,
                            assignedAt: data.assignedAt instanceof Timestamp
                                ? data.assignedAt.toDate()
                                : new Date(data.assignedAt),
                            attempted: data.attempted || false,
                            attemptedAt: data.attemptedAt instanceof Timestamp
                                ? data.attemptedAt.toDate()
                                : data.attemptedAt ? new Date(data.attemptedAt) : undefined,
                            score: data.score,
                        });
                    });

                    // Merge with local assignments (local takes precedence for newer items)
                    const { assignments: localAssignments } = get();
                    const mergedMap = new Map<string, ExamAssignment>();

                    // Add Firestore assignments
                    loadedAssignments.forEach(a => mergedMap.set(a.id, a));

                    // Override with local assignments if they don't exist in Firestore
                    localAssignments.forEach(a => {
                        if (!mergedMap.has(a.id)) {
                            mergedMap.set(a.id, a);
                        }
                    });

                    set({ assignments: Array.from(mergedMap.values()), isLoading: false });
                } catch (error: any) {
                    console.error('Failed to load assignments:', error);
                    set({ error: error.message, isLoading: false });
                }
            },

            syncToFirestore: async () => {
                const { assignments } = get();
                for (const assignment of assignments) {
                    try {
                        const docRef = doc(db, 'exam_assignments', assignment.id);
                        await setDoc(docRef, {
                            examId: assignment.examId,
                            userId: assignment.userId,
                            assignedAt: assignment.assignedAt,
                            attempted: assignment.attempted,
                            attemptedAt: assignment.attemptedAt || null,
                            score: assignment.score || null,
                        }, { merge: true });
                    } catch (error) {
                        console.error('Failed to sync assignment:', assignment.id, error);
                    }
                }
            },
        }),
        {
            name: 'testexam-exam-assignments',
        }
    )
);
