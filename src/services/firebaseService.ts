// ============================================
// Firebase Services - Student & Results Storage
// ============================================

import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    serverTimestamp,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Candidate, Attempt, QuestionResponse } from '../types';

// Collection names
const COLLECTIONS = {
    STUDENTS: 'students',
    ATTEMPTS: 'attempts',
    RESULTS: 'results',
    PERFORMANCE: 'performance',
    TESTS: 'tests',
};

// ============================================
// Student/Candidate Service
// ============================================

export interface StudentRecord {
    id: string;
    name?: string;
    email?: string;
    studentId?: string;
    createdAt: Date;
    updatedAt: Date;
    totalAttempts: number;
    averageScore: number;
    testsTaken: string[];
}

export const studentService = {
    // Create or update a student record
    async upsertStudent(candidate: Candidate): Promise<string> {
        try {
            // Check if student exists by email or studentId
            const studentRef = doc(db, COLLECTIONS.STUDENTS, candidate.id);
            const studentDoc = await getDoc(studentRef);

            const studentData = {
                name: candidate.name || null,
                email: candidate.email || null,
                studentId: candidate.studentId || null,
                updatedAt: serverTimestamp(),
            };

            if (studentDoc.exists()) {
                await updateDoc(studentRef, studentData);
            } else {
                await setDoc(studentRef, {
                    ...studentData,
                    createdAt: serverTimestamp(),
                    totalAttempts: 0,
                    averageScore: 0,
                    testsTaken: [],
                });
            }

            return candidate.id;
        } catch (error) {
            console.error('Error upserting student:', error);
            throw error;
        }
    },

    // Get student by ID
    async getStudent(studentId: string): Promise<StudentRecord | null> {
        try {
            const studentRef = doc(db, COLLECTIONS.STUDENTS, studentId);
            const studentDoc = await getDoc(studentRef);

            if (studentDoc.exists()) {
                const data = studentDoc.data();
                return {
                    id: studentDoc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as StudentRecord;
            }
            return null;
        } catch (error) {
            console.error('Error getting student:', error);
            throw error;
        }
    },

    // Get all students
    async getAllStudents(): Promise<StudentRecord[]> {
        try {
            const studentsRef = collection(db, COLLECTIONS.STUDENTS);
            const q = query(studentsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as StudentRecord;
            });
        } catch (error) {
            console.error('Error getting students:', error);
            throw error;
        }
    },

    // Get students by email
    async getStudentByEmail(email: string): Promise<StudentRecord | null> {
        try {
            const studentsRef = collection(db, COLLECTIONS.STUDENTS);
            const q = query(studentsRef, where('email', '==', email));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as StudentRecord;
            }
            return null;
        } catch (error) {
            console.error('Error getting student by email:', error);
            throw error;
        }
    },

    // Update student performance stats
    async updateStudentStats(studentId: string, testId: string, score: number): Promise<void> {
        try {
            const studentRef = doc(db, COLLECTIONS.STUDENTS, studentId);
            const studentDoc = await getDoc(studentRef);

            if (studentDoc.exists()) {
                const data = studentDoc.data();
                const totalAttempts = (data.totalAttempts || 0) + 1;
                const currentTotal = (data.averageScore || 0) * (data.totalAttempts || 0);
                const newAverage = (currentTotal + score) / totalAttempts;
                const testsTaken = data.testsTaken || [];

                await updateDoc(studentRef, {
                    totalAttempts,
                    averageScore: Math.round(newAverage * 100) / 100,
                    testsTaken: testsTaken.includes(testId) ? testsTaken : [...testsTaken, testId],
                    updatedAt: serverTimestamp(),
                });
            }
        } catch (error) {
            console.error('Error updating student stats:', error);
            throw error;
        }
    },
};

// ============================================
// Attempt/Results Service
// ============================================

export interface AttemptRecord {
    id: string;
    testId: string;
    testName?: string;
    studentId: string;
    candidateName?: string;
    candidateEmail?: string;
    candidateStudentId?: string;
    responses: QuestionResponse[];
    status: string;
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    startedAt: Date;
    completedAt?: Date;
    timeSpentSeconds: number;
    tabSwitchCount: number;
    createdAt: Date;
}

export const attemptService = {
    // Save a new attempt
    async saveAttempt(attempt: Attempt, testName?: string): Promise<string> {
        try {
            // First, upsert the student
            await studentService.upsertStudent(attempt.candidate);

            // Prepare attempt data for Firestore
            const attemptData = {
                testId: attempt.testId,
                testName: testName || null,
                studentId: attempt.candidate.id,
                candidateName: attempt.candidate.name || null,
                candidateEmail: attempt.candidate.email || null,
                candidateStudentId: attempt.candidate.studentId || null,
                responses: attempt.responses.map(r => ({
                    questionId: r.questionId,
                    selectedOptions: r.selectedOptions,
                    codeAnswer: r.codeAnswer || null,
                    isCorrect: r.isCorrect,
                    pointsEarned: r.pointsEarned,
                    timeTaken: r.timeTaken,
                })),
                status: attempt.status,
                score: attempt.score,
                maxScore: attempt.maxScore,
                percentage: attempt.percentage,
                passed: attempt.passed,
                startedAt: Timestamp.fromDate(new Date(attempt.startedAt)),
                completedAt: attempt.completedAt ? Timestamp.fromDate(new Date(attempt.completedAt)) : null,
                timeSpentSeconds: attempt.timeSpentSeconds,
                tabSwitchCount: attempt.tabSwitchCount,
                createdAt: serverTimestamp(),
            };

            // Save to Firestore
            const attemptRef = doc(db, COLLECTIONS.ATTEMPTS, attempt.id);
            await setDoc(attemptRef, attemptData);

            // Update student stats if completed
            if (attempt.status === 'completed' || attempt.status === 'timed-out') {
                await studentService.updateStudentStats(
                    attempt.candidate.id,
                    attempt.testId,
                    attempt.percentage
                );
            }

            console.log('✅ Attempt saved to Firebase:', attempt.id);
            return attempt.id;
        } catch (error) {
            console.error('Error saving attempt:', error);
            throw error;
        }
    },

    // Update an existing attempt
    async updateAttempt(attemptId: string, updates: Partial<AttemptRecord>): Promise<void> {
        try {
            const attemptRef = doc(db, COLLECTIONS.ATTEMPTS, attemptId);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updateData: Record<string, any> = {
                ...updates,
                updatedAt: serverTimestamp(),
            };

            // Convert dates to Timestamps
            if (updates.startedAt) {
                updateData.startedAt = Timestamp.fromDate(new Date(updates.startedAt));
            }
            if (updates.completedAt) {
                updateData.completedAt = Timestamp.fromDate(new Date(updates.completedAt));
            }

            await updateDoc(attemptRef, updateData);
            console.log('✅ Attempt updated in Firebase:', attemptId);
        } catch (error) {
            console.error('Error updating attempt:', error);
            throw error;
        }
    },

    // Get attempt by ID
    async getAttempt(attemptId: string): Promise<AttemptRecord | null> {
        try {
            const attemptRef = doc(db, COLLECTIONS.ATTEMPTS, attemptId);
            const attemptDoc = await getDoc(attemptRef);

            if (attemptDoc.exists()) {
                const data = attemptDoc.data();
                return {
                    id: attemptDoc.id,
                    ...data,
                    startedAt: data.startedAt?.toDate() || new Date(),
                    completedAt: data.completedAt?.toDate() || null,
                    createdAt: data.createdAt?.toDate() || new Date(),
                } as AttemptRecord;
            }
            return null;
        } catch (error) {
            console.error('Error getting attempt:', error);
            throw error;
        }
    },

    // Get attempts for a specific test
    async getAttemptsForTest(testId: string): Promise<AttemptRecord[]> {
        try {
            const attemptsRef = collection(db, COLLECTIONS.ATTEMPTS);
            const q = query(
                attemptsRef,
                where('testId', '==', testId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startedAt: data.startedAt?.toDate() || new Date(),
                    completedAt: data.completedAt?.toDate() || null,
                    createdAt: data.createdAt?.toDate() || new Date(),
                } as AttemptRecord;
            });
        } catch (error) {
            console.error('Error getting attempts for test:', error);
            throw error;
        }
    },

    // Get attempts for a specific student
    async getAttemptsForStudent(studentId: string): Promise<AttemptRecord[]> {
        try {
            const attemptsRef = collection(db, COLLECTIONS.ATTEMPTS);
            const q = query(
                attemptsRef,
                where('studentId', '==', studentId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startedAt: data.startedAt?.toDate() || new Date(),
                    completedAt: data.completedAt?.toDate() || null,
                    createdAt: data.createdAt?.toDate() || new Date(),
                } as AttemptRecord;
            });
        } catch (error) {
            console.error('Error getting attempts for student:', error);
            throw error;
        }
    },

    // Get all attempts
    async getAllAttempts(): Promise<AttemptRecord[]> {
        try {
            const attemptsRef = collection(db, COLLECTIONS.ATTEMPTS);
            const q = query(attemptsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startedAt: data.startedAt?.toDate() || new Date(),
                    completedAt: data.completedAt?.toDate() || null,
                    createdAt: data.createdAt?.toDate() || new Date(),
                } as AttemptRecord;
            });
        } catch (error) {
            console.error('Error getting all attempts:', error);
            throw error;
        }
    },

    // Subscribe to attempts for real-time updates
    subscribeToAttempts(testId: string, callback: (attempts: AttemptRecord[]) => void): () => void {
        const attemptsRef = collection(db, COLLECTIONS.ATTEMPTS);
        const q = query(
            attemptsRef,
            where('testId', '==', testId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const attempts = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startedAt: data.startedAt?.toDate() || new Date(),
                    completedAt: data.completedAt?.toDate() || null,
                    createdAt: data.createdAt?.toDate() || new Date(),
                } as AttemptRecord;
            });
            callback(attempts);
        });

        return unsubscribe;
    },

    // Delete attempt
    async deleteAttempt(attemptId: string): Promise<void> {
        try {
            const attemptRef = doc(db, COLLECTIONS.ATTEMPTS, attemptId);
            await deleteDoc(attemptRef);
            console.log('✅ Attempt deleted from Firebase:', attemptId);
        } catch (error) {
            console.error('Error deleting attempt:', error);
            throw error;
        }
    },

    // Clear all attempts for a test
    async clearAttemptsForTest(testId: string): Promise<void> {
        try {
            const attemptsRef = collection(db, COLLECTIONS.ATTEMPTS);
            const q = query(attemptsRef, where('testId', '==', testId));
            const snapshot = await getDocs(q);

            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            console.log('✅ All attempts cleared for test:', testId);
        } catch (error) {
            console.error('Error clearing attempts:', error);
            throw error;
        }
    },
};

// ============================================
// Performance Analytics Service
// ============================================

export interface PerformanceRecord {
    id: string;
    testId: string;
    date: Date;
    totalAttempts: number;
    averageScore: number;
    passRate: number;
    averageTime: number;
    topPerformers: Array<{
        studentId: string;
        name: string;
        score: number;
    }>;
}

export const performanceService = {
    // Calculate and save performance metrics for a test
    async calculateAndSavePerformance(testId: string): Promise<PerformanceRecord> {
        try {
            const attempts = await attemptService.getAttemptsForTest(testId);
            const completedAttempts = attempts.filter(
                a => a.status === 'completed' || a.status === 'timed-out'
            );

            if (completedAttempts.length === 0) {
                throw new Error('No completed attempts found');
            }

            const totalScore = completedAttempts.reduce((sum, a) => sum + a.percentage, 0);
            const totalTime = completedAttempts.reduce((sum, a) => sum + a.timeSpentSeconds, 0);
            const passedCount = completedAttempts.filter(a => a.passed).length;

            // Get top performers
            const sortedByScore = [...completedAttempts].sort((a, b) => b.percentage - a.percentage);
            const topPerformers = sortedByScore.slice(0, 5).map(a => ({
                studentId: a.studentId,
                name: a.candidateName || 'Anonymous',
                score: a.percentage,
            }));

            const performanceData: Omit<PerformanceRecord, 'id'> = {
                testId,
                date: new Date(),
                totalAttempts: completedAttempts.length,
                averageScore: Math.round(totalScore / completedAttempts.length),
                passRate: Math.round((passedCount / completedAttempts.length) * 100),
                averageTime: Math.round(totalTime / completedAttempts.length / 60), // in minutes
                topPerformers,
            };

            // Save to Firestore
            const performanceRef = collection(db, COLLECTIONS.PERFORMANCE);
            const docRef = await addDoc(performanceRef, {
                ...performanceData,
                date: serverTimestamp(),
            });

            return {
                id: docRef.id,
                ...performanceData,
            };
        } catch (error) {
            console.error('Error calculating performance:', error);
            throw error;
        }
    },

    // Get performance history for a test
    async getPerformanceHistory(testId: string): Promise<PerformanceRecord[]> {
        try {
            const performanceRef = collection(db, COLLECTIONS.PERFORMANCE);
            const q = query(
                performanceRef,
                where('testId', '==', testId),
                orderBy('date', 'desc')
            );
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: data.date?.toDate() || new Date(),
                } as PerformanceRecord;
            });
        } catch (error) {
            console.error('Error getting performance history:', error);
            throw error;
        }
    },

    // Get aggregate stats across all tests
    async getOverallStats(): Promise<{
        totalStudents: number;
        totalAttempts: number;
        overallAverageScore: number;
        overallPassRate: number;
    }> {
        try {
            const students = await studentService.getAllStudents();
            const attempts = await attemptService.getAllAttempts();
            const completedAttempts = attempts.filter(
                a => a.status === 'completed' || a.status === 'timed-out'
            );

            const totalScore = completedAttempts.reduce((sum, a) => sum + a.percentage, 0);
            const passedCount = completedAttempts.filter(a => a.passed).length;

            return {
                totalStudents: students.length,
                totalAttempts: completedAttempts.length,
                overallAverageScore: completedAttempts.length > 0
                    ? Math.round(totalScore / completedAttempts.length)
                    : 0,
                overallPassRate: completedAttempts.length > 0
                    ? Math.round((passedCount / completedAttempts.length) * 100)
                    : 0,
            };
        } catch (error) {
            console.error('Error getting overall stats:', error);
            throw error;
        }
    },
};

// Export all services
export const firebaseServices = {
    students: studentService,
    attempts: attemptService,
    performance: performanceService,
};

export default firebaseServices;
