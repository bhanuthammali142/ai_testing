// ============================================
// REAL Code Compiler with Control Flow Support
// ============================================
// This interpreter properly handles if/else blocks
// and other Python control structures.

import {
    SupportedLanguage,
    CodeExecutionResult,
    SandboxConfig,
    DEFAULT_SANDBOX_CONFIG,
} from '../../types/coding';

// ============================================
// SECURITY: Blocked patterns for sandbox
// ============================================
const BLOCKED_PATTERNS = [
    'import os',
    'import sys',
    'import subprocess',
    'import socket',
    'import requests',
    'import urllib',
    '__import__',
    'exec(',
    'eval(',
    'compile(',
    'open(',
    'file(',
    // Note: input() is allowed - our interpreter simulates it via STDIN
    'raw_input',
    'os.system',
    'os.popen',
    'subprocess.',
    'socket.',
    '__builtins__',
    '__class__',
    '__mro__',
    '__subclasses__',
    '__bases__',
    '__code__',
    '__globals__',
];

/**
 * Validates code for security AND emptiness.
 */
export function validateCode(
    code: string,
    config: SandboxConfig = DEFAULT_SANDBOX_CONFIG
): { isValid: boolean; error?: string } {
    console.log('🔒 [SECURITY] Validating code...');

    if (!code || code.trim().length === 0) {
        console.log('❌ [SECURITY] FAILED - Empty code submission');
        return {
            isValid: false,
            error: 'Empty code submission. Please write your solution.'
        };
    }

    const nonCommentLines = code.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith('#');
    });

    if (nonCommentLines.length === 0) {
        console.log('❌ [SECURITY] FAILED - Code contains only comments');
        return {
            isValid: false,
            error: 'Code contains only comments. Please write actual code.'
        };
    }

    const lowerCode = code.toLowerCase();

    for (const pattern of BLOCKED_PATTERNS) {
        if (lowerCode.includes(pattern.toLowerCase())) {
            console.log(`❌ [SECURITY] BLOCKED: "${pattern}"`);
            return {
                isValid: false,
                error: `Security Error: "${pattern}" is not allowed.`
            };
        }
    }

    for (const pattern of config.blockedPatterns) {
        if (lowerCode.includes(pattern.toLowerCase())) {
            console.log(`❌ [SECURITY] BLOCKED: "${pattern}"`);
            return {
                isValid: false,
                error: `Security Error: "${pattern}" is not allowed.`
            };
        }
    }

    console.log('✅ [SECURITY] Code validation passed');
    return { isValid: true };
}

/**
 * Python Interpreter with PROPER if/else handling
 * 
 * This interpreter parses Python code into blocks and
 * properly evaluates conditional statements.
 */
class PythonInterpreter {
    private output: string[] = [];
    private variables: Map<string, unknown> = new Map();
    private inputLines: string[];
    private inputIndex: number = 0;

    constructor(stdinInput: string = '') {
        this.inputLines = stdinInput.split('\n');
        console.log('📥 [INTERPRETER] STDIN lines:', this.inputLines);
    }

    private readInput(): string {
        if (this.inputIndex < this.inputLines.length) {
            const value = this.inputLines[this.inputIndex++];
            console.log(`📥 [INTERPRETER] Reading input[${this.inputIndex - 1}]: "${value}"`);
            return value;
        }
        throw new Error('EOFError: No more input available');
    }

    private print(...args: unknown[]): void {
        const line = args.map(arg => arg === undefined || arg === null ? '' : String(arg)).join(' ');
        console.log(`📤 [INTERPRETER] print(): "${line}"`);
        this.output.push(line);
    }

    execute(code: string): { stdout: string; stderr: string; exitCode: number } {
        console.log('═══════════════════════════════════════════');
        console.log('🔧 [INTERPRETER] Starting execution');
        console.log('═══════════════════════════════════════════');

        this.output = [];
        this.variables.clear();
        this.inputIndex = 0;

        try {
            const lines = code.split('\n');
            this.executeBlock(lines, 0, lines.length);

            const stdout = this.output.join('\n');
            console.log('✅ [INTERPRETER] Execution completed');
            console.log(`📤 [INTERPRETER] Final output: "${stdout}"`);

            return { stdout, stderr: '', exitCode: 0 };
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            console.log(`❌ [INTERPRETER] Error: ${errorMsg}`);
            return { stdout: this.output.join('\n'), stderr: errorMsg, exitCode: 1 };
        }
    }

    /**
     * Execute a block of code from startLine to endLine
     */
    private executeBlock(lines: string[], startLine: number, endLine: number): void {
        let i = startLine;

        while (i < endLine) {
            const line = lines[i];
            const trimmedLine = line.trim();
            const indent = line.length - line.trimStart().length;

            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                i++;
                continue;
            }

            console.log(`⚙️ [INTERPRETER] Line ${i + 1}: ${trimmedLine}`);

            // Handle if/elif/else blocks
            if (trimmedLine.startsWith('if ') && trimmedLine.endsWith(':')) {
                i = this.handleIfBlock(lines, i, indent);
                continue;
            }

            // Execute single line
            this.executeLine(trimmedLine);
            i++;
        }
    }

    /**
     * Handle if/elif/else block
     * Returns the next line index after the entire if block
     */
    private handleIfBlock(lines: string[], startLine: number, baseIndent: number): number {
        let i = startLine;
        let conditionMet = false;

        while (i < lines.length) {
            const line = lines[i];
            const trimmedLine = line.trim();
            const currentIndent = line.length - line.trimStart().length;

            // Check if we've exited the if/elif/else block
            // IMPORTANT: Skip this check on the first iteration (i === startLine)
            if (i !== startLine && trimmedLine && !trimmedLine.startsWith('#') && currentIndent <= baseIndent) {
                // Not an elif or else at the same indent level - we've exited the block
                if (!trimmedLine.startsWith('elif ') && !trimmedLine.startsWith('else:')) {
                    break;
                }
            }

            // Handle 'if' condition
            if (trimmedLine.startsWith('if ') && trimmedLine.endsWith(':')) {
                const condition = trimmedLine.slice(3, -1).trim();
                console.log(`🔀 [INTERPRETER] if ${condition}`);

                const result = this.evaluateCondition(condition);
                console.log(`🔀 [INTERPRETER] Condition result: ${result}`);

                if (result) {
                    conditionMet = true;
                    // Find and execute the if block
                    const blockEnd = this.findBlockEnd(lines, i, baseIndent);
                    console.log(`🔀 [INTERPRETER] Executing if block (lines ${i + 2} to ${blockEnd})`);
                    this.executeBlock(lines, i + 1, blockEnd);
                    i = blockEnd;
                } else {
                    // Skip the if block
                    i = this.findBlockEnd(lines, i, baseIndent);
                }
                continue;
            }

            // Handle 'elif' condition
            if (trimmedLine.startsWith('elif ') && trimmedLine.endsWith(':')) {
                if (conditionMet) {
                    // Skip this elif block
                    i = this.findBlockEnd(lines, i, baseIndent);
                    continue;
                }

                const condition = trimmedLine.slice(5, -1).trim();
                console.log(`🔀 [INTERPRETER] elif ${condition}`);

                const result = this.evaluateCondition(condition);
                console.log(`🔀 [INTERPRETER] Condition result: ${result}`);

                if (result) {
                    conditionMet = true;
                    const blockEnd = this.findBlockEnd(lines, i, baseIndent);
                    this.executeBlock(lines, i + 1, blockEnd);
                    i = blockEnd;
                } else {
                    i = this.findBlockEnd(lines, i, baseIndent);
                }
                continue;
            }

            // Handle 'else'
            if (trimmedLine === 'else:') {
                if (conditionMet) {
                    // Skip else block
                    i = this.findBlockEnd(lines, i, baseIndent);
                    continue;
                }

                console.log(`🔀 [INTERPRETER] else (executing because no previous condition was true)`);
                const blockEnd = this.findBlockEnd(lines, i, baseIndent);
                this.executeBlock(lines, i + 1, blockEnd);
                i = blockEnd;
                conditionMet = true;
                continue;
            }

            i++;
        }

        return i;
    }

    /**
     * Find the end of a block (where indentation returns to or below base level)
     */
    private findBlockEnd(lines: string[], startLine: number, baseIndent: number): number {

        for (let i = startLine + 1; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('#')) continue;

            const currentIndent = line.length - line.trimStart().length;

            // If we find a line at or below the base indent, block ends
            if (currentIndent <= baseIndent) {
                return i;
            }
        }

        return lines.length;
    }

    private executeLine(line: string): void {
        // Handle print statements
        if (line.startsWith('print(')) {
            this.handlePrint(line);
            return;
        }

        // Handle map(int, input().split())
        if (line.includes('= map(int, input().split())')) {
            this.handleMapIntInputSplit(line);
            return;
        }

        // Handle int(input())
        if (line.match(/=\s*int\(input\(/)) {
            this.handleIntInput(line);
            return;
        }

        // Handle input()
        if (line.match(/=\s*input\(/)) {
            this.handleStringInput(line);
            return;
        }

        // Handle variable assignments
        if (line.includes('=') && !line.includes('==') && !line.includes('!=')) {
            this.handleAssignment(line);
            return;
        }
    }

    private handlePrint(line: string): void {
        const match = line.match(/print\((.+)\)$/);
        if (match) {
            const content = match[1].trim();
            if (!content) {
                this.print('');
                return;
            }
            const result = this.evaluateExpression(content);
            this.print(result);
        } else if (line === 'print()') {
            this.print('');
        }
    }

    private handleMapIntInputSplit(line: string): void {
        const match = line.match(/^([\w\s,]+)\s*=\s*map\(int,\s*input\(\)\.split\(\)\)/);
        if (match) {
            const varNames = match[1].split(',').map(v => v.trim());
            const inputLine = this.readInput();
            const values = inputLine.trim().split(/\s+/).map(v => parseInt(v, 10));
            varNames.forEach((name, i) => {
                this.variables.set(name, values[i] !== undefined ? values[i] : 0);
            });
        }
    }

    private handleIntInput(line: string): void {
        const match = line.match(/(\w+)\s*=\s*int\(input\([^)]*\)\)/);
        if (match) {
            const varName = match[1];
            const inputValue = this.readInput();
            const intValue = parseInt(inputValue.trim(), 10);
            if (isNaN(intValue)) {
                throw new Error(`ValueError: invalid literal for int(): '${inputValue}'`);
            }
            this.variables.set(varName, intValue);
            console.log(`📊 [INTERPRETER] ${varName} = ${intValue}`);
        }
    }

    private handleStringInput(line: string): void {
        const match = line.match(/(\w+)\s*=\s*input\(/);
        if (match) {
            const varName = match[1];
            const inputValue = this.readInput();
            this.variables.set(varName, inputValue);
            console.log(`📊 [INTERPRETER] ${varName} = "${inputValue}"`);
        }
    }

    private handleAssignment(line: string): void {
        // Handle compound assignments
        const compoundMatch = line.match(/(\w+)\s*([+\-*/%])=\s*(.+)/);
        if (compoundMatch) {
            const varName = compoundMatch[1];
            const operator = compoundMatch[2];
            const expr = compoundMatch[3];
            const currentValue = Number(this.variables.get(varName)) || 0;
            const exprValue = Number(this.evaluateExpression(expr));
            let result: number;
            switch (operator) {
                case '+': result = currentValue + exprValue; break;
                case '-': result = currentValue - exprValue; break;
                case '*': result = currentValue * exprValue; break;
                case '/': result = currentValue / exprValue; break;
                case '%': result = currentValue % exprValue; break;
                default: result = currentValue;
            }
            this.variables.set(varName, result);
            return;
        }

        const match = line.match(/(\w+)\s*=\s*(.+)/);
        if (match) {
            const varName = match[1];
            const expr = match[2];
            const value = this.evaluateExpression(expr);
            this.variables.set(varName, value);
            console.log(`📊 [INTERPRETER] ${varName} = ${JSON.stringify(value)}`);
        }
    }

    private evaluateExpression(expr: string): unknown {
        expr = expr.trim();

        // String literals
        if ((expr.startsWith('"') && expr.endsWith('"')) ||
            (expr.startsWith("'") && expr.endsWith("'"))) {
            return expr.slice(1, -1);
        }

        // f-strings
        if (expr.startsWith('f"') || expr.startsWith("f'")) {
            let result = expr.slice(2, -1);
            const varPattern = /\{(\w+)\}/g;
            let match;
            while ((match = varPattern.exec(expr.slice(2, -1))) !== null) {
                const varName = match[1];
                const value = this.variables.get(varName);
                result = result.replace(`{${varName}}`, String(value ?? ''));
            }
            return result;
        }

        // String slicing [::-1] for reversal
        const sliceMatch = expr.match(/^(\w+)\[::-1\]$/);
        if (sliceMatch) {
            const varName = sliceMatch[1];
            const value = String(this.variables.get(varName) || '');
            return value.split('').reverse().join('');
        }

        // .lower() method
        if (expr.endsWith('.lower()')) {
            const varName = expr.replace('.lower()', '').trim();
            const value = String(this.variables.get(varName) || '');
            return value.toLowerCase();
        }

        // .upper() method
        if (expr.endsWith('.upper()')) {
            const varName = expr.replace('.upper()', '').trim();
            const value = String(this.variables.get(varName) || '');
            return value.toUpperCase();
        }

        // str() function
        if (expr.startsWith('str(') && expr.endsWith(')')) {
            const inner = expr.slice(4, -1);
            return String(this.evaluateExpression(inner));
        }

        // int() function
        if (expr.startsWith('int(') && expr.endsWith(')')) {
            const inner = expr.slice(4, -1);
            return parseInt(String(this.evaluateExpression(inner)), 10);
        }

        // len() function
        if (expr.startsWith('len(') && expr.endsWith(')')) {
            const inner = expr.slice(4, -1).trim();
            const value = this.evaluateExpression(inner);
            if (typeof value === 'string') return value.length;
            if (Array.isArray(value)) return value.length;
            return 0;
        }

        // Numeric literals
        if (/^-?\d+$/.test(expr)) return parseInt(expr, 10);
        if (/^-?\d+\.\d+$/.test(expr)) return parseFloat(expr);

        // Boolean literals
        if (expr === 'True') return true;
        if (expr === 'False') return false;

        // Simple variable
        if (/^\w+$/.test(expr)) {
            return this.variables.get(expr);
        }

        // Arithmetic expressions
        if (/^[\d\w\s+\-*/%()]+$/.test(expr)) {
            try {
                let evalExpr = expr;
                this.variables.forEach((value, name) => {
                    evalExpr = evalExpr.replace(new RegExp(`\\b${name}\\b`, 'g'), JSON.stringify(value));
                });
                return new Function(`return (${evalExpr})`)();
            } catch {
                return expr;
            }
        }

        return expr;
    }

    /**
     * Evaluate a condition (for if/elif statements)
     */
    private evaluateCondition(condition: string): boolean {
        console.log(`🔀 [INTERPRETER] Evaluating condition: ${condition}`);

        // Handle == comparison (e.g., s == s[::-1])
        if (condition.includes('==')) {
            const parts = condition.split('==').map(p => p.trim());
            if (parts.length === 2) {
                const left = this.evaluateExpression(parts[0]);
                const right = this.evaluateExpression(parts[1]);
                console.log(`🔀 [INTERPRETER] ${JSON.stringify(left)} == ${JSON.stringify(right)} -> ${left === right}`);
                return left === right;
            }
        }

        // Handle != comparison
        if (condition.includes('!=')) {
            const parts = condition.split('!=').map(p => p.trim());
            if (parts.length === 2) {
                const left = this.evaluateExpression(parts[0]);
                const right = this.evaluateExpression(parts[1]);
                console.log(`🔀 [INTERPRETER] ${JSON.stringify(left)} != ${JSON.stringify(right)} -> ${left !== right}`);
                return left !== right;
            }
        }

        // Handle > comparison
        if (condition.includes('>') && !condition.includes('>=')) {
            const parts = condition.split('>').map(p => p.trim());
            if (parts.length === 2) {
                const left = Number(this.evaluateExpression(parts[0]));
                const right = Number(this.evaluateExpression(parts[1]));
                return left > right;
            }
        }

        // Handle < comparison
        if (condition.includes('<') && !condition.includes('<=')) {
            const parts = condition.split('<').map(p => p.trim());
            if (parts.length === 2) {
                const left = Number(this.evaluateExpression(parts[0]));
                const right = Number(this.evaluateExpression(parts[1]));
                return left < right;
            }
        }

        // Handle >= comparison
        if (condition.includes('>=')) {
            const parts = condition.split('>=').map(p => p.trim());
            if (parts.length === 2) {
                const left = Number(this.evaluateExpression(parts[0]));
                const right = Number(this.evaluateExpression(parts[1]));
                return left >= right;
            }
        }

        // Handle <= comparison
        if (condition.includes('<=')) {
            const parts = condition.split('<=').map(p => p.trim());
            if (parts.length === 2) {
                const left = Number(this.evaluateExpression(parts[0]));
                const right = Number(this.evaluateExpression(parts[1]));
                return left <= right;
            }
        }

        // Default: evaluate as truthy
        const result = this.evaluateExpression(condition);
        return Boolean(result);
    }
}

/**
 * Execute code with timeout protection
 */
export async function executeCode(
    code: string,
    language: SupportedLanguage,
    stdin: string = '',
    config: SandboxConfig = DEFAULT_SANDBOX_CONFIG
): Promise<CodeExecutionResult> {
    const startTime = performance.now();

    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 [EXECUTOR] Code Execution Started');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📥 [EXECUTOR] STDIN:', JSON.stringify(stdin));
    console.log('⏱️ [EXECUTOR] Timeout:', config.timeoutMs, 'ms');

    const validation = validateCode(code, config);
    if (!validation.isValid) {
        console.log('❌ [EXECUTOR] Validation FAILED');
        return {
            success: false,
            output: '',
            error: validation.error || 'Code validation failed',
            executionTime: 0,
            status: 'error'
        };
    }

    if (language !== 'python') {
        return {
            success: false,
            output: '',
            error: `Language "${language}" is not supported.`,
            executionTime: 0,
            status: 'error'
        };
    }

    try {
        const executionPromise = new Promise<{ stdout: string; stderr: string; exitCode: number }>((resolve) => {
            const interpreter = new PythonInterpreter(stdin);
            const result = interpreter.execute(code);
            resolve(result);
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('TIMEOUT')), config.timeoutMs);
        });

        const result = await Promise.race([executionPromise, timeoutPromise]);
        const executionTime = performance.now() - startTime;

        console.log(`⏱️ [EXECUTOR] Time: ${executionTime.toFixed(2)}ms`);
        console.log(`📤 [EXECUTOR] STDOUT: "${result.stdout}"`);

        if (result.exitCode !== 0 || result.stderr) {
            return {
                success: false,
                output: result.stdout,
                error: result.stderr || 'Runtime error',
                executionTime,
                status: 'error'
            };
        }

        let output = result.stdout;
        if (output.length > config.maxOutputLength) {
            output = output.substring(0, config.maxOutputLength) + '\n... (truncated)';
        }

        console.log('✅ [EXECUTOR] Success');
        return { success: true, output, error: '', executionTime, status: 'completed' };

    } catch (error) {
        const executionTime = performance.now() - startTime;
        if (error instanceof Error && error.message === 'TIMEOUT') {
            return {
                success: false,
                output: '',
                error: `Timeout after ${config.timeoutMs / 1000}s`,
                executionTime,
                status: 'timeout'
            };
        }
        return {
            success: false,
            output: '',
            error: error instanceof Error ? error.message : 'Unknown error',
            executionTime,
            status: 'error'
        };
    }
}

/**
 * STRICT output comparison
 */
export function compareOutput(expected: string, actual: string): boolean {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔍 [COMPARE] Output Comparison');
    console.log('🔍 [COMPARE] Expected:', JSON.stringify(expected));
    console.log('🔍 [COMPARE] Actual:', JSON.stringify(actual));

    const normalize = (str: string): string => {
        if (!str) return '';
        return str.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
            .split('\n').map(line => line.trim()).join('\n');
    };

    const normalizedExpected = normalize(expected);
    const normalizedActual = normalize(actual);

    const isMatch = normalizedExpected === normalizedActual;
    console.log(`🔍 [COMPARE] Result: ${isMatch ? '✅ MATCH' : '❌ MISMATCH'}`);
    console.log('═══════════════════════════════════════════════════════');

    return isMatch;
}
