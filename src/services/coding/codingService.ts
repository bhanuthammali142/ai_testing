// ============================================
// REAL Test Case Validation Engine
// ============================================
// This engine runs EVERY test case and validates EXACTLY.
//
// STRICT RULES:
// 1. Run ALL test cases
// 2. If ANY fails → result = INCORRECT
// 3. ONLY if ALL pass → result = CORRECT
// 4. Empty output → FAIL
// 5. Runtime error → FAIL
// 6. Timeout → FAIL
//
// Response format:
// {
//   "passed": false,
//   "failedTestCase": 1,
//   "expected": "Palindrome",
//   "received": "",
//   "error": "No output produced"
// }

import { v4 as uuidv4 } from 'uuid';
import {
    SupportedLanguage,
    TestCase,
    TestCaseResult,
    CodeExecutionResult,
    CodeEvaluationResult,
    CodeSubmission,
    CodingAPIResponse,
    SandboxConfig,
    DEFAULT_SANDBOX_CONFIG,
} from '../../types/coding';
import { executeCode, compareOutput, validateCode } from './codeExecutor';

// Storage for submissions
const submissions: Map<string, CodeSubmission> = new Map();

/**
 * Test Case Validation Response
 * Matches the exact structure requested
 */
interface TestCaseValidationResult {
    passed: boolean;
    failedTestCase: number | null;
    expected: string;
    received: string;
    error: string | null;
    totalTests: number;
    passedCount: number;
    failedCount: number;
}

/**
 * Run code against a SINGLE test case (sample test)
 * 
 * Used for "Run Code" button - quick validation
 */
export async function runCode(
    code: string,
    language: SupportedLanguage,
    sampleInput: string,
    sampleOutput: string,
    timeLimit: number = 5
): Promise<CodingAPIResponse<{ result: CodeExecutionResult; passed: boolean; validation: TestCaseValidationResult }>> {
    console.log('══════════════════════════════════════════════════════════');
    console.log('🚀 [ENGINE] runCode() - Single Test Case Validation');
    console.log('══════════════════════════════════════════════════════════');
    console.log('📥 [ENGINE] Input:', JSON.stringify(sampleInput));
    console.log('📤 [ENGINE] Expected:', JSON.stringify(sampleOutput));

    const config: SandboxConfig = {
        ...DEFAULT_SANDBOX_CONFIG,
        timeoutMs: timeLimit * 1000,
    };

    // STEP 1: Validate code (catches empty code)
    const validation = validateCode(code, config);
    if (!validation.isValid) {
        console.log('❌ [ENGINE] Code validation FAILED');
        const failResult: TestCaseValidationResult = {
            passed: false,
            failedTestCase: 1,
            expected: sampleOutput.trim(),
            received: '',
            error: validation.error || 'Invalid code',
            totalTests: 1,
            passedCount: 0,
            failedCount: 1,
        };
        return {
            success: true,
            data: {
                result: {
                    success: false,
                    output: '',
                    error: validation.error || 'Invalid code',
                    executionTime: 0,
                    status: 'error',
                },
                passed: false,
                validation: failResult,
            },
            message: validation.error || 'Code validation failed',
        };
    }

    // STEP 2: Execute code
    const result = await executeCode(code, language, sampleInput, config);

    console.log('📊 [ENGINE] Execution result:');
    console.log('   Success:', result.success);
    console.log('   Output:', JSON.stringify(result.output));
    console.log('   Error:', result.error || 'none');

    // STEP 3: Validate the result
    let passed = false;
    let error: string | null = null;

    if (!result.success) {
        // Execution failed
        passed = false;
        error = result.error || 'Execution failed';
        console.log('❌ [ENGINE] FAILED - Execution error:', error);
    } else if (result.status === 'timeout') {
        // Timeout
        passed = false;
        error = 'Execution timed out';
        console.log('❌ [ENGINE] FAILED - Timeout');
    } else if (!result.output && !result.output.trim() && sampleOutput.trim()) {
        // Empty output when expected non-empty
        passed = false;
        error = 'No output produced';
        console.log('❌ [ENGINE] FAILED - Empty output');
    } else {
        // Compare output STRICTLY
        passed = compareOutput(sampleOutput, result.output);
        if (!passed) {
            error = 'Output mismatch';
            console.log('❌ [ENGINE] FAILED - Output mismatch');
        } else {
            console.log('✅ [ENGINE] PASSED - Output matches!');
        }
    }

    const validationResult: TestCaseValidationResult = {
        passed,
        failedTestCase: passed ? null : 1,
        expected: sampleOutput.trim(),
        received: result.output.trim(),
        error,
        totalTests: 1,
        passedCount: passed ? 1 : 0,
        failedCount: passed ? 0 : 1,
    };

    console.log('══════════════════════════════════════════════════════════');
    console.log('📊 [ENGINE] FINAL RESULT:', passed ? 'PASSED ✅' : 'FAILED ❌');
    console.log('══════════════════════════════════════════════════════════');

    return {
        success: true,
        data: {
            result,
            passed,
            validation: validationResult,
        },
        message: passed
            ? 'Test passed! Output matches expected.'
            : `Test failed: ${error}. Expected "${sampleOutput.trim()}" but got "${result.output.trim()}"`,
    };
}

/**
 * Submit code for FULL evaluation against ALL test cases
 * 
 * This is the REAL test case validation engine.
 * Runs EVERY test case and reports first failure.
 */
export async function submitCode(
    attemptId: string,
    questionId: string,
    code: string,
    language: SupportedLanguage,
    testCases: TestCase[],
    timeLimit: number = 5,
    maxPoints: number = 10
): Promise<CodingAPIResponse<CodeEvaluationResult & { validation: TestCaseValidationResult }>> {
    console.log('══════════════════════════════════════════════════════════════════');
    console.log('📝 [ENGINE] submitCode() - FULL TEST CASE VALIDATION');
    console.log('══════════════════════════════════════════════════════════════════');
    console.log('📊 [ENGINE] Total test cases:', testCases.length);
    console.log('⏱️ [ENGINE] Time limit per test:', timeLimit, 's');
    console.log('🏆 [ENGINE] Max points:', maxPoints);

    const submittedAt = new Date();
    const config: SandboxConfig = {
        ...DEFAULT_SANDBOX_CONFIG,
        timeoutMs: timeLimit * 1000,
    };

    // STEP 1: Validate code FIRST (catches empty code)
    const codeValidation = validateCode(code, config);
    if (!codeValidation.isValid) {
        console.log('❌ [ENGINE] Code validation FAILED - Empty or invalid code');

        const failResult: TestCaseValidationResult = {
            passed: false,
            failedTestCase: 1,
            expected: testCases[0]?.expectedOutput?.trim() || '',
            received: '',
            error: codeValidation.error || 'Empty or invalid code',
            totalTests: testCases.length,
            passedCount: 0,
            failedCount: testCases.length,
        };

        const errorResult: CodeEvaluationResult = {
            questionId,
            attemptId,
            code,
            language,
            testCaseResults: [],
            passedCount: 0,
            failedCount: testCases.length,
            totalCount: testCases.length,
            totalExecutionTime: 0,
            maxExecutionTime: 0,
            finalScore: 0,
            maxPossibleScore: maxPoints,
            submittedAt,
            evaluatedAt: new Date(),
        };

        return {
            success: true,
            data: { ...errorResult, validation: failResult },
            message: codeValidation.error || 'Empty or invalid code submission',
        };
    }

    // STEP 2: Run EVERY test case
    const testCaseResults: TestCaseResult[] = [];
    let passedCount = 0;
    let failedCount = 0;
    let totalExecutionTime = 0;
    let maxExecutionTime = 0;

    // Track FIRST failure for response
    let firstFailedTestCase: number | null = null;
    let firstFailedExpected: string = '';
    let firstFailedReceived: string = '';
    let firstFailedError: string | null = null;

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const testNum = i + 1;

        console.log('────────────────────────────────────────────────────────');
        console.log(`⚡ [ENGINE] Test Case ${testNum}/${testCases.length}`);
        console.log(`   ID: ${testCase.id}`);
        console.log(`   Input: ${JSON.stringify(testCase.input)}`);
        console.log(`   Expected: ${JSON.stringify(testCase.expectedOutput)}`);
        console.log(`   Hidden: ${testCase.isHidden}`);

        // Execute code for this test case
        const result = await executeCode(code, language, testCase.input, config);

        totalExecutionTime += result.executionTime;
        maxExecutionTime = Math.max(maxExecutionTime, result.executionTime);

        // STRICT validation
        let passed = false;
        let error: string | undefined = undefined;

        if (!result.success) {
            passed = false;
            error = result.error || 'Execution failed';
            console.log(`❌ [ENGINE] Test ${testNum}: FAILED - ${error}`);
        } else if (result.status === 'timeout') {
            passed = false;
            error = 'Timeout';
            console.log(`❌ [ENGINE] Test ${testNum}: FAILED - Timeout`);
        } else if (!result.output.trim() && testCase.expectedOutput.trim()) {
            passed = false;
            error = 'No output produced';
            console.log(`❌ [ENGINE] Test ${testNum}: FAILED - Empty output`);
        } else {
            // STRICT comparison
            passed = compareOutput(testCase.expectedOutput, result.output);
            if (!passed) {
                error = 'Output mismatch';
                console.log(`❌ [ENGINE] Test ${testNum}: FAILED - Output mismatch`);
            } else {
                console.log(`✅ [ENGINE] Test ${testNum}: PASSED`);
            }
        }

        if (passed) {
            passedCount++;
        } else {
            failedCount++;

            // Track FIRST failure
            if (firstFailedTestCase === null) {
                firstFailedTestCase = testNum;
                firstFailedExpected = testCase.expectedOutput.trim();
                firstFailedReceived = result.output.trim();
                firstFailedError = error || null;
            }
        }

        testCaseResults.push({
            testCaseId: testCase.id,
            passed,
            actualOutput: result.output,
            expectedOutput: testCase.isHidden ? '' : testCase.expectedOutput,
            executionTime: result.executionTime,
            status: result.status,
            error,
        });
    }

    // STEP 3: Calculate final result
    const allPassed = passedCount === testCases.length;
    const scorePerTest = maxPoints / testCases.length;
    const finalScore = Math.round(passedCount * scorePerTest * 100) / 100;

    // Build validation result (exact structure requested)
    const validationResult: TestCaseValidationResult = {
        passed: allPassed,
        failedTestCase: firstFailedTestCase,
        expected: firstFailedExpected,
        received: firstFailedReceived,
        error: firstFailedError,
        totalTests: testCases.length,
        passedCount,
        failedCount,
    };

    console.log('══════════════════════════════════════════════════════════════════');
    console.log('📊 [ENGINE] FINAL EVALUATION RESULT:');
    console.log('══════════════════════════════════════════════════════════════════');
    console.log(`   Tests: ${passedCount}/${testCases.length} passed`);
    console.log(`   Score: ${finalScore}/${maxPoints}`);
    console.log(`   Result: ${allPassed ? 'ALL PASSED ✅' : 'FAILED ❌'}`);

    if (!allPassed && firstFailedTestCase !== null) {
        console.log(`   First failure: Test #${firstFailedTestCase}`);
        console.log(`   Expected: "${firstFailedExpected}"`);
        console.log(`   Received: "${firstFailedReceived}"`);
        console.log(`   Error: ${firstFailedError}`);
    }
    console.log('══════════════════════════════════════════════════════════════════');

    const evaluationResult: CodeEvaluationResult = {
        questionId,
        attemptId,
        code,
        language,
        testCaseResults,
        passedCount,
        failedCount,
        totalCount: testCases.length,
        totalExecutionTime,
        maxExecutionTime,
        finalScore,
        maxPossibleScore: maxPoints,
        submittedAt,
        evaluatedAt: new Date(),
    };

    // Store submission
    const submission: CodeSubmission = {
        id: uuidv4(),
        attemptId,
        questionId,
        code,
        language,
        result: evaluationResult,
        submittedAt,
    };

    submissions.set(submission.id, submission);
    submissions.set(`${attemptId}:${questionId}`, submission);

    // Generate message
    let message: string;
    if (allPassed) {
        message = '🎉 All test cases passed! Perfect score!';
    } else {
        message = `Test case #${firstFailedTestCase} failed. Expected "${firstFailedExpected}" but got "${firstFailedReceived}"`;
    }

    return {
        success: true,
        data: { ...evaluationResult, validation: validationResult },
        message,
    };
}

/**
 * Get submission for a question
 */
export function getSubmission(attemptId: string, questionId: string): CodeSubmission | undefined {
    return submissions.get(`${attemptId}:${questionId}`);
}

/**
 * Get all submissions for an attempt
 */
export function getSubmissionsForAttempt(attemptId: string): CodeSubmission[] {
    const result: CodeSubmission[] = [];
    submissions.forEach(submission => {
        if (submission.attemptId === attemptId) {
            result.push(submission);
        }
    });
    return result;
}

/**
 * Clear submissions (testing)
 */
export function clearSubmissions(): void {
    submissions.clear();
}

/**
 * Format results for display (hides hidden test case details)
 */
export function formatResultsForDisplay(
    results: TestCaseResult[],
    testCases: TestCase[]
): Array<{
    id: string;
    passed: boolean;
    isHidden: boolean;
    executionTime: number;
    error?: string;
    input?: string;
    expectedOutput?: string;
    actualOutput?: string;
}> {
    return results.map((result, index) => {
        const testCase = testCases[index];
        const isHidden = testCase?.isHidden ?? true;

        return {
            id: result.testCaseId,
            passed: result.passed,
            isHidden,
            executionTime: result.executionTime,
            error: result.error,
            ...(isHidden ? {} : {
                input: testCase.input,
                expectedOutput: result.expectedOutput,
                actualOutput: result.actualOutput,
            }),
        };
    });
}
