// ============================================
// CSV Parser & Validator for Question Bank
// ============================================
// Handles parsing and validation of CSV files containing exam questions
// Follows strict CSV format requirements

import {
    BankQuestion,
    CSVQuestionRow,
    CSVValidationError,
    CSVParseResult,
    Difficulty
} from '../types';

// Required CSV headers in exact order
const REQUIRED_HEADERS = [
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

// Valid values for validation
const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
const VALID_ANSWERS = ['A', 'B', 'C', 'D'] as const;

/**
 * Parse CSV content from a file string
 * Handles quoted fields and escaped characters
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
                    // Escaped quote
                    currentField += '"';
                    i++; // Skip next quote
                } else {
                    // End of quoted field
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
                if (char === '\r') i++; // Skip \n after \r
            } else if (char !== '\r') {
                currentField += char;
            }
        }
    }

    // Handle last field and line
    if (currentField || currentLine.length > 0) {
        currentLine.push(currentField.trim());
        if (currentLine.some(field => field !== '')) {
            lines.push(currentLine);
        }
    }

    return lines;
}

/**
 * Validate CSV headers match required format
 */
export function validateHeaders(headers: string[]): CSVValidationError[] {
    const errors: CSVValidationError[] = [];
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());

    // Check for missing headers
    for (const required of REQUIRED_HEADERS) {
        if (!normalizedHeaders.includes(required)) {
            errors.push({
                row: 1,
                field: required,
                message: `Missing required header: "${required}"`
            });
        }
    }

    // Check for correct header count
    if (headers.length !== REQUIRED_HEADERS.length && errors.length === 0) {
        errors.push({
            row: 1,
            field: 'headers',
            message: `Expected ${REQUIRED_HEADERS.length} headers, got ${headers.length}`
        });
    }

    return errors;
}

/**
 * Validate a single row of CSV data
 */
export function validateRow(
    row: string[],
    rowNumber: number,
    existingIds: Set<string>
): { valid: boolean; errors: CSVValidationError[]; question?: CSVQuestionRow } {
    const errors: CSVValidationError[] = [];

    // Check field count
    if (row.length !== REQUIRED_HEADERS.length) {
        errors.push({
            row: rowNumber,
            field: 'row',
            message: `Expected ${REQUIRED_HEADERS.length} fields, got ${row.length}`
        });
        return { valid: false, errors };
    }

    const [
        id, subject, topic, difficulty, question,
        option_a, option_b, option_c, option_d,
        correct_answer, explanation
    ] = row;

    // Validate ID (unique and not empty)
    if (!id || id.trim() === '') {
        errors.push({
            row: rowNumber,
            field: 'id',
            message: 'ID cannot be empty'
        });
    } else if (existingIds.has(id)) {
        errors.push({
            row: rowNumber,
            field: 'id',
            message: `Duplicate ID: "${id}"`,
            value: id
        });
    }

    // Validate subject
    if (!subject || subject.trim() === '') {
        errors.push({
            row: rowNumber,
            field: 'subject',
            message: 'Subject cannot be empty'
        });
    }

    // Validate topic
    if (!topic || topic.trim() === '') {
        errors.push({
            row: rowNumber,
            field: 'topic',
            message: 'Topic cannot be empty'
        });
    }

    // Validate difficulty
    if (!VALID_DIFFICULTIES.includes(difficulty as typeof VALID_DIFFICULTIES[number])) {
        errors.push({
            row: rowNumber,
            field: 'difficulty',
            message: `Invalid difficulty. Must be one of: ${VALID_DIFFICULTIES.join(', ')}`,
            value: difficulty
        });
    }

    // Validate question text
    if (!question || question.trim() === '') {
        errors.push({
            row: rowNumber,
            field: 'question',
            message: 'Question text cannot be empty'
        });
    }

    // Validate options
    const options = [
        { key: 'option_a', value: option_a },
        { key: 'option_b', value: option_b },
        { key: 'option_c', value: option_c },
        { key: 'option_d', value: option_d }
    ];

    for (const opt of options) {
        if (!opt.value || opt.value.trim() === '') {
            errors.push({
                row: rowNumber,
                field: opt.key,
                message: `${opt.key.toUpperCase().replace('_', ' ')} cannot be empty`
            });
        }
    }

    // Validate correct answer
    if (!VALID_ANSWERS.includes(correct_answer?.toUpperCase() as typeof VALID_ANSWERS[number])) {
        errors.push({
            row: rowNumber,
            field: 'correct_answer',
            message: `Invalid correct answer. Must be one of: ${VALID_ANSWERS.join(', ')}`,
            value: correct_answer
        });
    }

    // Validate explanation
    if (!explanation || explanation.trim() === '') {
        errors.push({
            row: rowNumber,
            field: 'explanation',
            message: 'Explanation cannot be empty'
        });
    }

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    // Return validated question row
    return {
        valid: true,
        errors: [],
        question: {
            id: id.trim(),
            subject: subject.trim(),
            topic: topic.trim(),
            difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
            question: question.trim(),
            option_a: option_a.trim(),
            option_b: option_b.trim(),
            option_c: option_c.trim(),
            option_d: option_d.trim(),
            correct_answer: correct_answer.toUpperCase() as 'A' | 'B' | 'C' | 'D',
            explanation: explanation.trim()
        }
    };
}

/**
 * Convert CSV difficulty to internal difficulty type
 */
function mapDifficulty(csvDifficulty: 'Easy' | 'Medium' | 'Hard'): Difficulty {
    const mapping: Record<string, Difficulty> = {
        'Easy': 'easy',
        'Medium': 'medium',
        'Hard': 'hard'
    };
    return mapping[csvDifficulty] || 'medium';
}

/**
 * Convert validated CSV row to BankQuestion
 */
export function convertToBankQuestion(csvRow: CSVQuestionRow): BankQuestion {
    return {
        id: csvRow.id,
        subject: csvRow.subject,
        topic: csvRow.topic,
        difficulty: mapDifficulty(csvRow.difficulty),
        questionText: csvRow.question,
        options: {
            A: csvRow.option_a,
            B: csvRow.option_b,
            C: csvRow.option_c,
            D: csvRow.option_d
        },
        correctAnswer: csvRow.correct_answer,
        explanation: csvRow.explanation,
        createdAt: new Date(),
        usedInExams: [],
        usageCount: 0
    };
}

/**
 * Main function to parse and validate CSV file content
 * Returns parsed questions and any validation errors
 */
export function parseAndValidateCSV(csvContent: string): CSVParseResult {
    const allErrors: CSVValidationError[] = [];
    const validQuestions: BankQuestion[] = [];
    const existingIds = new Set<string>();

    // Parse CSV content
    const rows = parseCSVContent(csvContent);

    if (rows.length === 0) {
        return {
            success: false,
            questions: [],
            errors: [{
                row: 0,
                field: 'file',
                message: 'CSV file is empty or could not be parsed'
            }],
            totalRows: 0,
            validRows: 0,
            invalidRows: 0
        };
    }

    // Validate headers (first row)
    const headers = rows[0];
    const headerErrors = validateHeaders(headers);

    if (headerErrors.length > 0) {
        return {
            success: false,
            questions: [],
            errors: headerErrors,
            totalRows: rows.length - 1,
            validRows: 0,
            invalidRows: rows.length - 1
        };
    }

    // Process data rows (skip header)
    const dataRows = rows.slice(1);
    let validCount = 0;
    let invalidCount = 0;

    for (let i = 0; i < dataRows.length; i++) {
        const rowNumber = i + 2; // Account for 1-indexed and header row
        const row = dataRows[i];

        // Skip empty rows
        if (row.every(field => field === '')) {
            continue;
        }

        const result = validateRow(row, rowNumber, existingIds);

        if (result.valid && result.question) {
            existingIds.add(result.question.id);
            validQuestions.push(convertToBankQuestion(result.question));
            validCount++;
        } else {
            allErrors.push(...result.errors);
            invalidCount++;
        }
    }

    return {
        success: allErrors.length === 0,
        questions: validQuestions,
        errors: allErrors,
        totalRows: dataRows.length,
        validRows: validCount,
        invalidRows: invalidCount
    };
}

/**
 * Generate sample CSV content for reference
 */
export function generateSampleCSV(): string {
    const sampleRows = [
        REQUIRED_HEADERS.join(','),
        'Q001,Mathematics,Algebra,Easy,"What is 2 + 2?",3,4,5,6,B,"Basic addition: 2 + 2 = 4"',
        'Q002,Mathematics,Algebra,Medium,"Solve: x² - 4 = 0","-2 and 2","-4 and 4","0 and 4","2 only",A,"Factoring: (x-2)(x+2) = 0, so x = ±2"',
        'Q003,Physics,Mechanics,Hard,"A ball is thrown vertically upward with velocity 20 m/s. What is the maximum height?","10 m","15 m","20 m","25 m",C,"Using h = v²/2g = 400/20 = 20m"'
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
