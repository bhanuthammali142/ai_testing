// ============================================
// CSV Parser & Validator for Question Bank
// ============================================
// Extended to support ALL question types:
// - MCQ (mcq)
// - Reasoning (reasoning)
// - Fill in the Blanks (fill)
// - Coding (coding)

import {
    BankQuestion,
    CodingBankQuestion,
    CSVQuestionRow,
    CSVQuestionType,
    CSVValidationError,
    CSVParseResult,
    Difficulty
} from '../types';

// Extended CSV headers supporting all question types
const REQUIRED_HEADERS = [
    'id',
    'subject',
    'topic',
    'difficulty',
    'question_type',  // NEW: mcq, reasoning, fill, coding
    'question',
    'option_a',
    'option_b',
    'option_c',
    'option_d',
    'correct_answer',
    'explanation',
    'sample_input',     // For coding
    'sample_output',    // For coding
    'hidden_test_cases', // For coding (JSON)
    'time_limit'        // For coding
] as const;

// Legacy headers for backward compatibility
const LEGACY_HEADERS = [
    'id',
    'subject',
    'topic',
    'difficulty',
    'question',
    'option_a',
    'option_b',
    'option_c',
    'option_d',
    'correct_answer',
    'explanation'
] as const;

const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
const VALID_ANSWERS = ['A', 'B', 'C', 'D'] as const;

/**
 * Parse CSV content from a file string
 */
export function parseCSVContent(csvContent: string): string[][] {
    const lines: string[][] = [];
    let currentLine: string[] = [];
    let currentField = '';
    let insideQuotes = false;

    for (let i = 0; i < csvContent.length; i++) {
        const char = csvContent[i];
        const nextChar = csvContent[i + 1];

        if (insideQuotes) {
            if (char === '"') {
                if (nextChar === '"') {
                    currentField += '"';
                    i++;
                } else {
                    insideQuotes = false;
                }
            } else {
                currentField += char;
            }
        } else {
            if (char === '"') {
                insideQuotes = true;
            } else if (char === ',') {
                currentLine.push(currentField.trim());
                currentField = '';
            } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
                currentLine.push(currentField.trim());
                if (currentLine.some(field => field !== '')) {
                    lines.push(currentLine);
                }
                currentLine = [];
                currentField = '';
                if (char === '\r') i++;
            } else if (char !== '\r') {
                currentField += char;
            }
        }
    }

    if (currentField || currentLine.length > 0) {
        currentLine.push(currentField.trim());
        if (currentLine.some(field => field !== '')) {
            lines.push(currentLine);
        }
    }

    return lines;
}

/**
 * Detect if CSV is using legacy format (without question_type column)
 */
function isLegacyFormat(headers: string[]): boolean {
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
    return !normalizedHeaders.includes('question_type');
}

/**
 * Validate CSV headers (supports both legacy and extended format)
 */
export function validateHeaders(headers: string[]): { errors: CSVValidationError[]; isLegacy: boolean } {
    const errors: CSVValidationError[] = [];
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
    const isLegacy = isLegacyFormat(headers);

    const requiredHeaders = isLegacy ? LEGACY_HEADERS : REQUIRED_HEADERS;

    for (const required of requiredHeaders) {
        if (!normalizedHeaders.includes(required)) {
            // For extended format, coding fields are optional for MCQ rows
            const optionalForMCQ = ['sample_input', 'sample_output', 'hidden_test_cases', 'time_limit'];
            if (!isLegacy && optionalForMCQ.includes(required)) continue;

            errors.push({
                row: 1,
                field: required,
                message: `Missing required header: "${required}"`
            });
        }
    }

    return { errors, isLegacy };
}

/**
 * Validate a single row for MCQ type questions
 */
function validateMCQRow(
    row: string[],
    rowNumber: number,
    headerMap: Map<string, number>,
    existingIds: Set<string>
): { valid: boolean; errors: CSVValidationError[]; question?: BankQuestion } {
    const errors: CSVValidationError[] = [];

    const getValue = (field: string): string => {
        const idx = headerMap.get(field);
        return idx !== undefined ? (row[idx] || '').trim() : '';
    };

    const id = getValue('id');
    const subject = getValue('subject');
    const topic = getValue('topic');
    const difficulty = getValue('difficulty');
    const question = getValue('question');
    const option_a = getValue('option_a');
    const option_b = getValue('option_b');
    const option_c = getValue('option_c');
    const option_d = getValue('option_d');
    const correct_answer = getValue('correct_answer');
    const explanation = getValue('explanation');
    const question_type = (getValue('question_type') || 'mcq').toLowerCase() as CSVQuestionType;

    // Validate ID
    if (!id) {
        errors.push({ row: rowNumber, field: 'id', message: 'ID cannot be empty' });
    } else if (existingIds.has(id)) {
        errors.push({ row: rowNumber, field: 'id', message: `Duplicate ID: "${id}"`, value: id });
    }

    // Validate required fields
    if (!subject) errors.push({ row: rowNumber, field: 'subject', message: 'Subject cannot be empty' });
    if (!topic) errors.push({ row: rowNumber, field: 'topic', message: 'Topic cannot be empty' });
    if (!VALID_DIFFICULTIES.includes(difficulty as typeof VALID_DIFFICULTIES[number])) {
        errors.push({ row: rowNumber, field: 'difficulty', message: `Invalid difficulty. Must be: ${VALID_DIFFICULTIES.join(', ')}`, value: difficulty });
    }
    if (!question) errors.push({ row: rowNumber, field: 'question', message: 'Question text cannot be empty' });

    // Validate options
    if (!option_a) errors.push({ row: rowNumber, field: 'option_a', message: 'Option A cannot be empty' });
    if (!option_b) errors.push({ row: rowNumber, field: 'option_b', message: 'Option B cannot be empty' });
    if (!option_c) errors.push({ row: rowNumber, field: 'option_c', message: 'Option C cannot be empty' });
    if (!option_d) errors.push({ row: rowNumber, field: 'option_d', message: 'Option D cannot be empty' });

    // Validate correct answer
    if (!VALID_ANSWERS.includes(correct_answer?.toUpperCase() as typeof VALID_ANSWERS[number])) {
        errors.push({ row: rowNumber, field: 'correct_answer', message: `Invalid answer. Must be: ${VALID_ANSWERS.join(', ')}`, value: correct_answer });
    }

    if (errors.length > 0) return { valid: false, errors };

    return {
        valid: true,
        errors: [],
        question: {
            id,
            subject,
            topic,
            difficulty: mapDifficulty(difficulty as 'Easy' | 'Medium' | 'Hard'),
            questionType: question_type,
            questionText: question,
            options: { A: option_a, B: option_b, C: option_c, D: option_d },
            correctAnswer: correct_answer.toUpperCase() as 'A' | 'B' | 'C' | 'D',
            explanation: explanation || '',
            createdAt: new Date(),
            usedInExams: [],
            usageCount: 0
        }
    };
}

/**
 * Validate a single row for CODING type questions
 */
function validateCodingRow(
    row: string[],
    rowNumber: number,
    headerMap: Map<string, number>,
    existingIds: Set<string>
): { valid: boolean; errors: CSVValidationError[]; question?: CodingBankQuestion } {
    const errors: CSVValidationError[] = [];

    const getValue = (field: string): string => {
        const idx = headerMap.get(field);
        return idx !== undefined ? (row[idx] || '').trim() : '';
    };

    const id = getValue('id');
    const subject = getValue('subject');
    const topic = getValue('topic');
    const difficulty = getValue('difficulty');
    const question = getValue('question');
    const sample_input = getValue('sample_input');
    const sample_output = getValue('sample_output');
    const hidden_test_cases = getValue('hidden_test_cases');
    const time_limit = getValue('time_limit');

    // Validate ID
    if (!id) {
        errors.push({ row: rowNumber, field: 'id', message: 'ID cannot be empty' });
    } else if (existingIds.has(id)) {
        errors.push({ row: rowNumber, field: 'id', message: `Duplicate ID: "${id}"`, value: id });
    }

    // Validate required fields
    if (!subject) errors.push({ row: rowNumber, field: 'subject', message: 'Subject cannot be empty' });
    if (!topic) errors.push({ row: rowNumber, field: 'topic', message: 'Topic cannot be empty' });
    if (!VALID_DIFFICULTIES.includes(difficulty as typeof VALID_DIFFICULTIES[number])) {
        errors.push({ row: rowNumber, field: 'difficulty', message: `Invalid difficulty`, value: difficulty });
    }
    if (!question) errors.push({ row: rowNumber, field: 'question', message: 'Problem statement cannot be empty' });

    // Validate coding-specific fields
    if (!sample_input) {
        errors.push({ row: rowNumber, field: 'sample_input', message: 'Sample input is required for coding questions' });
    }
    if (!sample_output) {
        errors.push({ row: rowNumber, field: 'sample_output', message: 'Sample output is required for coding questions' });
    }

    // Validate time_limit
    const timeLimitNum = parseInt(time_limit, 10);
    if (!time_limit || isNaN(timeLimitNum) || timeLimitNum <= 0) {
        errors.push({ row: rowNumber, field: 'time_limit', message: 'Time limit must be a positive number', value: time_limit });
    }

    // Validate hidden_test_cases as JSON
    let parsedTestCases: Array<{ id: string; input: string; expectedOutput: string; isHidden: boolean }> = [];
    if (hidden_test_cases) {
        try {
            const parsed = JSON.parse(hidden_test_cases);
            if (!Array.isArray(parsed)) {
                errors.push({ row: rowNumber, field: 'hidden_test_cases', message: 'hidden_test_cases must be a JSON array' });
            } else {
                parsedTestCases = parsed.map((tc: { input: string; output: string }, idx: number) => ({
                    id: `${id}-tc-${idx + 1}`,
                    input: tc.input || '',
                    expectedOutput: tc.output || '',
                    isHidden: true
                }));
            }
        } catch {
            errors.push({ row: rowNumber, field: 'hidden_test_cases', message: 'hidden_test_cases must be valid JSON', value: hidden_test_cases.substring(0, 50) });
        }
    }

    if (errors.length > 0) return { valid: false, errors };

    return {
        valid: true,
        errors: [],
        question: {
            id,
            subject,
            topic,
            difficulty: mapDifficulty(difficulty as 'Easy' | 'Medium' | 'Hard'),
            problemStatement: question,
            sampleInput: sample_input,
            sampleOutput: sample_output,
            hiddenTestCases: parsedTestCases,
            timeLimit: timeLimitNum,
            createdAt: new Date(),
            usedInExams: [],
            usageCount: 0
        }
    };
}

function mapDifficulty(csvDifficulty: 'Easy' | 'Medium' | 'Hard'): Difficulty {
    const mapping: Record<string, Difficulty> = {
        'Easy': 'easy',
        'Medium': 'medium',
        'Hard': 'hard'
    };
    return mapping[csvDifficulty] || 'medium';
}

/**
 * Convert validated CSV row to BankQuestion (for backward compatibility)
 */
export function convertToBankQuestion(csvRow: CSVQuestionRow): BankQuestion {
    return {
        id: csvRow.id,
        subject: csvRow.subject,
        topic: csvRow.topic,
        difficulty: mapDifficulty(csvRow.difficulty),
        questionType: csvRow.question_type || 'mcq',
        questionText: csvRow.question,
        options: {
            A: csvRow.option_a,
            B: csvRow.option_b,
            C: csvRow.option_c,
            D: csvRow.option_d
        },
        correctAnswer: csvRow.correct_answer as 'A' | 'B' | 'C' | 'D',
        explanation: csvRow.explanation,
        createdAt: new Date(),
        usedInExams: [],
        usageCount: 0
    };
}

/**
 * Main function to parse and validate CSV file content
 * Returns parsed questions (MCQ and Coding) and any validation errors
 */
export function parseAndValidateCSV(csvContent: string): CSVParseResult {
    const allErrors: CSVValidationError[] = [];
    const validQuestions: BankQuestion[] = [];
    const codingQuestions: CodingBankQuestion[] = [];
    const existingIds = new Set<string>();

    const rows = parseCSVContent(csvContent);

    if (rows.length === 0) {
        return {
            success: false,
            questions: [],
            codingQuestions: [],
            errors: [{ row: 0, field: 'file', message: 'CSV file is empty or could not be parsed' }],
            totalRows: 0,
            validRows: 0,
            invalidRows: 0
        };
    }

    // Validate headers
    const headers = rows[0];
    const { errors: headerErrors } = validateHeaders(headers);

    if (headerErrors.length > 0) {
        return {
            success: false,
            questions: [],
            codingQuestions: [],
            errors: headerErrors,
            totalRows: rows.length - 1,
            validRows: 0,
            invalidRows: rows.length - 1
        };
    }

    // Build header map for flexible column access
    const headerMap = new Map<string, number>();
    headers.forEach((h, i) => headerMap.set(h.toLowerCase().trim(), i));

    const dataRows = rows.slice(1);
    let validCount = 0;
    let invalidCount = 0;

    for (let i = 0; i < dataRows.length; i++) {
        const rowNumber = i + 2;
        const row = dataRows[i];

        if (row.every(field => field === '')) continue;

        // Determine question type
        const questionTypeIdx = headerMap.get('question_type');
        const questionType = (questionTypeIdx !== undefined ? row[questionTypeIdx] : 'mcq')?.toLowerCase() || 'mcq';

        if (questionType === 'coding') {
            // Process as coding question
            const result = validateCodingRow(row, rowNumber, headerMap, existingIds);
            if (result.valid && result.question) {
                existingIds.add(result.question.id);
                codingQuestions.push(result.question);
                validCount++;
            } else {
                allErrors.push(...result.errors);
                invalidCount++;
            }
        } else {
            // Process as MCQ/reasoning/fill question
            const result = validateMCQRow(row, rowNumber, headerMap, existingIds);
            if (result.valid && result.question) {
                existingIds.add(result.question.id);
                validQuestions.push(result.question);
                validCount++;
            } else {
                allErrors.push(...result.errors);
                invalidCount++;
            }
        }
    }

    console.log(`📊 [CSV] Parsed: ${validQuestions.length} MCQ, ${codingQuestions.length} Coding, ${invalidCount} invalid`);

    return {
        success: allErrors.length === 0,
        questions: validQuestions,
        codingQuestions: codingQuestions,
        errors: allErrors,
        totalRows: dataRows.length,
        validRows: validCount,
        invalidRows: invalidCount
    };
}

/**
 * Generate sample CSV content (extended format with coding)
 */
export function generateSampleCSV(): string {
    const headers = REQUIRED_HEADERS.join(',');
    const sampleRows = [
        headers,
        // MCQ example
        'Q001,Mathematics,Algebra,Easy,mcq,"What is 2 + 2?",3,4,5,6,B,"Basic addition: 2 + 2 = 4",,,,',
        // Reasoning example
        'Q002,Aptitude,Logic,Medium,reasoning,"If A > B and B > C, then?","A > C","A < C","A = C","Cannot determine",A,"Transitive property of inequality",,,,',
        // Coding example
        'Q003,Programming,Strings,Medium,coding,"Write a program to check if a string is a palindrome. Print True or False.",,,,,,racecar,True,"[{""input"":""hello"",""output"":""False""},{""input"":""madam"",""output"":""True""}]",5',
    ];

    return sampleRows.join('\n');
}

/**
 * Validate file type is CSV
 */
export function validateFileType(file: File): { valid: boolean; error?: string } {
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    const validExtensions = ['.csv'];

    const isValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some(ext =>
        file.name.toLowerCase().endsWith(ext)
    );

    if (!isValidType && !hasValidExtension) {
        return {
            valid: false,
            error: 'Please upload a valid CSV file (.csv extension)'
        };
    }

    return { valid: true };
}

/**
 * Read file content as text
 */
export function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            resolve(content);
        };
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        reader.readAsText(file);
    });
}
