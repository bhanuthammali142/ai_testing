// ============================================
// Coding Question Types
// ============================================
// This file contains all type definitions for the Coding Exam System.
// These types are designed to be extensible for future language support.

/**
 * Supported programming languages for code execution.
 * Currently only Python is supported, but the structure allows for easy expansion.
 * To add a new language:
 * 1. Add it to this type
 * 2. Add execution logic in the executor service
 * 3. Add language-specific syntax highlighting if needed
 */
export type SupportedLanguage = 'python' | 'javascript' | 'java' | 'cpp';

/**
 * Represents a single test case for code evaluation.
 * Hidden test cases are used for final evaluation and their inputs are never shown to students.
 */
export interface TestCase {
    id: string;
    input: string;      // Input to be passed to stdin
    expectedOutput: string;  // Expected stdout output
    isHidden: boolean;  // Hidden test cases are not shown to students
    weight?: number;    // Optional weight for partial scoring (default: 1)
}

/**
 * Coding question structure that extends the base Question type.
 * Stores all metadata needed for code execution and evaluation.
 */
export interface CodingQuestion {
    id: string;
    testId: string;
    type: 'coding';
    problemStatement: string;       // The problem description
    sampleInput: string;            // Sample input shown to students
    sampleOutput: string;           // Expected output for sample input
    hiddenTestCases: TestCase[];    // Array of hidden test cases for evaluation
    timeLimit: number;              // Execution timeout in seconds (typically 1-10s)
    memoryLimit?: number;           // Optional memory limit in MB
    supportedLanguages: SupportedLanguage[];  // Languages allowed for this question
    starterCode?: Record<SupportedLanguage, string>;  // Optional starter code per language
    hints?: string[];               // Optional hints for students
    difficulty: 'easy' | 'medium' | 'hard';
    topic: string;
    points: number;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Execution status for tracking code execution state.
 */
export type ExecutionStatus =
    | 'pending'      // Waiting to execute
    | 'running'      // Currently executing
    | 'completed'    // Finished successfully
    | 'timeout'      // Exceeded time limit
    | 'error'        // Runtime/compilation error
    | 'memory_limit' // Exceeded memory limit
    | 'killed';      // Killed by security measures

/**
 * Result of executing code against a single test case.
 */
export interface TestCaseResult {
    testCaseId: string;
    passed: boolean;
    actualOutput: string;
    expectedOutput: string;  // Only shown for sample tests, not hidden
    executionTime: number;   // Time taken in milliseconds
    status: ExecutionStatus;
    error?: string;          // Error message if any
}

/**
 * Request payload for running code (sample test).
 */
export interface CodeRunRequest {
    code: string;
    language: SupportedLanguage;
    input: string;
    timeLimit: number;
}

/**
 * Request payload for submitting code (full evaluation).
 */
export interface CodeSubmitRequest {
    attemptId: string;
    questionId: string;
    code: string;
    language: SupportedLanguage;
}

/**
 * Response from code execution.
 */
export interface CodeExecutionResult {
    success: boolean;
    output: string;
    error: string;
    executionTime: number;
    status: ExecutionStatus;
}

/**
 * Result of evaluating code against all test cases.
 */
export interface CodeEvaluationResult {
    questionId: string;
    attemptId: string;
    userId?: string;
    code: string;
    language: SupportedLanguage;
    testCaseResults: TestCaseResult[];
    passedCount: number;
    failedCount: number;
    totalCount: number;
    totalExecutionTime: number;    // Total time across all test cases
    maxExecutionTime: number;      // Slowest test case
    finalScore: number;            // Points earned based on passed tests
    maxPossibleScore: number;      // Maximum points for this question
    submittedAt: Date;
    evaluatedAt: Date;
}

/**
 * Stored code submission record.
 * Links submission to attempt and user for tracking.
 */
export interface CodeSubmission {
    id: string;
    attemptId: string;
    questionId: string;
    userId?: string;
    code: string;
    language: SupportedLanguage;
    result: CodeEvaluationResult;
    submittedAt: Date;
}

/**
 * API response structure for coding endpoints.
 */
export interface CodingAPIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/**
 * Configuration for the code execution sandbox.
 * Security settings for safe code execution.
 */
export interface SandboxConfig {
    timeoutMs: number;          // Maximum execution time
    memoryLimitMB: number;      // Maximum memory usage
    maxOutputLength: number;    // Maximum stdout length to prevent DoS
    allowedModules: string[];   // Python modules allowed to import
    blockedPatterns: string[];  // Patterns to block (imports, system calls)
}

/**
 * Default sandbox configuration.
 * These limits are designed to prevent abuse while allowing normal coding exercises.
 */
export const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
    timeoutMs: 5000,           // 5 seconds max execution
    memoryLimitMB: 128,        // 128MB memory limit
    maxOutputLength: 10000,    // 10KB max output
    allowedModules: [          // Safe Python modules
        'math', 'string', 'random', 'datetime', 'collections',
        'itertools', 'functools', 'operator', 'bisect', 'heapq',
        're', 'json', 'typing'
    ],
    blockedPatterns: [         // Dangerous patterns to block
        'import os', 'import sys', 'import subprocess',
        'import socket', 'import requests', 'import urllib',
        'open(', 'exec(', 'eval(', '__import__',
        'compile(', 'globals(', 'locals()', 'dir(',
        'getattr(', 'setattr(', 'delattr(',
        'import shutil', 'import pickle', 'import ctypes',
        'import importlib', 'from os', 'from sys',
        'from subprocess', 'from socket'
    ]
};
