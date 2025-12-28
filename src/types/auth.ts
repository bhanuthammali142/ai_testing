// ============================================
// Authentication Types
// ============================================

export type UserRole = 'admin' | 'user';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    photoURL?: string;
    createdAt: Date;
}

export interface ExamAssignment {
    id: string;
    examId: string;
    userId: string;
    assignedAt: Date;
    attempted: boolean;
    attemptedAt?: Date;
    score?: number;
}

export interface ExamWithStatus {
    id: string;
    title: string;
    duration: number; // in minutes
    status: 'available' | 'attempted' | 'expired';
    scheduledStart?: Date;
    scheduledEnd?: Date;
    attemptedAt?: Date;
    score?: number;
}
