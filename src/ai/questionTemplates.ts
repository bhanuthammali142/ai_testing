// ============================================
// Question Templates - Source of Truth
// All questions grouped by Subject → Topic → Difficulty
// ============================================

export interface QuestionTemplate {
    id: string;
    question: string;
    options: { text: string; isCorrect: boolean }[];
    correctAnswer: string;
    explanation: string;
}

export interface TopicQuestions {
    easy: QuestionTemplate[];
    medium: QuestionTemplate[];
    hard: QuestionTemplate[];
}

export interface SubjectTopics {
    [topic: string]: TopicQuestions;
}

export interface QuestionBank {
    [subject: string]: SubjectTopics;
}

// Comprehensive question bank
export const questionTemplates: QuestionBank = {
    Python: {
        Loops: {
            easy: [
                { id: "py-loops-e-1", question: "Which keyword is used to start a for loop in Python?", options: [{ text: "for", isCorrect: true }, { text: "loop", isCorrect: false }, { text: "foreach", isCorrect: false }, { text: "iterate", isCorrect: false }], correctAnswer: "for", explanation: "Python uses 'for' keyword to start a for loop." },
                { id: "py-loops-e-2", question: "What does the 'break' statement do in a loop?", options: [{ text: "Exits the loop immediately", isCorrect: true }, { text: "Skips current iteration", isCorrect: false }, { text: "Restarts the loop", isCorrect: false }, { text: "Pauses the loop", isCorrect: false }], correctAnswer: "Exits the loop immediately", explanation: "The break statement terminates the loop entirely." },
                { id: "py-loops-e-3", question: "What is the output of: for i in range(3): print(i)", options: [{ text: "0 1 2", isCorrect: true }, { text: "1 2 3", isCorrect: false }, { text: "0 1 2 3", isCorrect: false }, { text: "1 2", isCorrect: false }], correctAnswer: "0 1 2", explanation: "range(3) generates 0, 1, 2." },
                { id: "py-loops-e-4", question: "Which loop is used when the number of iterations is unknown?", options: [{ text: "while loop", isCorrect: true }, { text: "for loop", isCorrect: false }, { text: "do loop", isCorrect: false }, { text: "repeat loop", isCorrect: false }], correctAnswer: "while loop", explanation: "While loops run until a condition becomes false." },
                { id: "py-loops-e-5", question: "What does 'continue' do in a loop?", options: [{ text: "Skips to next iteration", isCorrect: true }, { text: "Exits the loop", isCorrect: false }, { text: "Restarts loop", isCorrect: false }, { text: "Nothing", isCorrect: false }], correctAnswer: "Skips to next iteration", explanation: "Continue skips the rest of current iteration." }
            ],
            medium: [
                { id: "py-loops-m-1", question: "What is the output of: [x**2 for x in range(4)]", options: [{ text: "[0, 1, 4, 9]", isCorrect: true }, { text: "[1, 4, 9, 16]", isCorrect: false }, { text: "[0, 2, 4, 6]", isCorrect: false }, { text: "[1, 2, 3, 4]", isCorrect: false }], correctAnswer: "[0, 1, 4, 9]", explanation: "List comprehension squares 0,1,2,3." },
                { id: "py-loops-m-2", question: "How do you iterate over both index and value in a list?", options: [{ text: "enumerate(list)", isCorrect: true }, { text: "index(list)", isCorrect: false }, { text: "range(list)", isCorrect: false }, { text: "iter(list)", isCorrect: false }], correctAnswer: "enumerate(list)", explanation: "enumerate() returns index and value pairs." },
                { id: "py-loops-m-3", question: "What happens if while condition never becomes False?", options: [{ text: "Infinite loop", isCorrect: true }, { text: "Error", isCorrect: false }, { text: "Loop skips", isCorrect: false }, { text: "Runs once", isCorrect: false }], correctAnswer: "Infinite loop", explanation: "The loop runs forever without termination." }
            ],
            hard: [
                { id: "py-loops-h-1", question: "What is the time complexity of nested loops with n iterations each?", options: [{ text: "O(n²)", isCorrect: true }, { text: "O(n)", isCorrect: false }, { text: "O(log n)", isCorrect: false }, { text: "O(2n)", isCorrect: false }], correctAnswer: "O(n²)", explanation: "Nested loops multiply: n × n = n²." },
                { id: "py-loops-h-2", question: "What does 'else' block after a for loop execute?", options: [{ text: "When loop completes without break", isCorrect: true }, { text: "When loop breaks", isCorrect: false }, { text: "Always", isCorrect: false }, { text: "Never", isCorrect: false }], correctAnswer: "When loop completes without break", explanation: "The else runs only if no break occurred." }
            ]
        },
        Functions: {
            easy: [
                { id: "py-func-e-1", question: "Which keyword is used to define a function in Python?", options: [{ text: "def", isCorrect: true }, { text: "function", isCorrect: false }, { text: "func", isCorrect: false }, { text: "define", isCorrect: false }], correctAnswer: "def", explanation: "Python uses 'def' to define functions." },
                { id: "py-func-e-2", question: "What does a function return if no return statement is given?", options: [{ text: "None", isCorrect: true }, { text: "0", isCorrect: false }, { text: "Empty string", isCorrect: false }, { text: "Error", isCorrect: false }], correctAnswer: "None", explanation: "Functions return None by default." },
                { id: "py-func-e-3", question: "What are parameters in a function?", options: [{ text: "Input values to function", isCorrect: true }, { text: "Output values", isCorrect: false }, { text: "Local variables", isCorrect: false }, { text: "Global variables", isCorrect: false }], correctAnswer: "Input values to function", explanation: "Parameters receive values when function is called." },
                { id: "py-func-e-4", question: "How do you call a function named 'greet'?", options: [{ text: "greet()", isCorrect: true }, { text: "call greet", isCorrect: false }, { text: "run greet", isCorrect: false }, { text: "greet[]", isCorrect: false }], correctAnswer: "greet()", explanation: "Functions are called using parentheses." }
            ],
            medium: [
                { id: "py-func-m-1", question: "What is a lambda function?", options: [{ text: "Anonymous single-expression function", isCorrect: true }, { text: "Named function", isCorrect: false }, { text: "Class method", isCorrect: false }, { text: "Module", isCorrect: false }], correctAnswer: "Anonymous single-expression function", explanation: "Lambda creates small anonymous functions." },
                { id: "py-func-m-2", question: "What does *args do in function parameters?", options: [{ text: "Accepts variable positional arguments", isCorrect: true }, { text: "Accepts keyword arguments", isCorrect: false }, { text: "Makes arguments optional", isCorrect: false }, { text: "Multiplies arguments", isCorrect: false }], correctAnswer: "Accepts variable positional arguments", explanation: "*args collects extra positional arguments as tuple." },
                { id: "py-func-m-3", question: "What is a decorator in Python?", options: [{ text: "Function that modifies another function", isCorrect: true }, { text: "Class attribute", isCorrect: false }, { text: "Variable type", isCorrect: false }, { text: "Loop type", isCorrect: false }], correctAnswer: "Function that modifies another function", explanation: "Decorators wrap and extend function behavior." }
            ],
            hard: [
                { id: "py-func-h-1", question: "What is a closure in Python?", options: [{ text: "Function retaining access to enclosing scope", isCorrect: true }, { text: "Closed function", isCorrect: false }, { text: "Private function", isCorrect: false }, { text: "Static function", isCorrect: false }], correctAnswer: "Function retaining access to enclosing scope", explanation: "Closures remember variables from their enclosing scope." },
                { id: "py-func-h-2", question: "What is memoization?", options: [{ text: "Caching function results", isCorrect: true }, { text: "Memory allocation", isCorrect: false }, { text: "Variable storage", isCorrect: false }, { text: "Loop optimization", isCorrect: false }], correctAnswer: "Caching function results", explanation: "Memoization stores results to avoid recomputation." }
            ]
        },
        DataStructures: {
            easy: [
                { id: "py-ds-e-1", question: "Which data structure uses key-value pairs?", options: [{ text: "Dictionary", isCorrect: true }, { text: "List", isCorrect: false }, { text: "Tuple", isCorrect: false }, { text: "Set", isCorrect: false }], correctAnswer: "Dictionary", explanation: "Dictionaries store key-value pairs." },
                { id: "py-ds-e-2", question: "Are lists mutable or immutable?", options: [{ text: "Mutable", isCorrect: true }, { text: "Immutable", isCorrect: false }, { text: "Both", isCorrect: false }, { text: "Neither", isCorrect: false }], correctAnswer: "Mutable", explanation: "Lists can be modified after creation." },
                { id: "py-ds-e-3", question: "What does append() do to a list?", options: [{ text: "Adds element at end", isCorrect: true }, { text: "Removes element", isCorrect: false }, { text: "Sorts list", isCorrect: false }, { text: "Reverses list", isCorrect: false }], correctAnswer: "Adds element at end", explanation: "append() adds one element to list end." },
                { id: "py-ds-e-4", question: "Which is immutable: list, tuple, or dict?", options: [{ text: "Tuple", isCorrect: true }, { text: "List", isCorrect: false }, { text: "Dictionary", isCorrect: false }, { text: "All of them", isCorrect: false }], correctAnswer: "Tuple", explanation: "Tuples cannot be modified after creation." }
            ],
            medium: [
                { id: "py-ds-m-1", question: "What is the time complexity of dictionary lookup?", options: [{ text: "O(1) average", isCorrect: true }, { text: "O(n)", isCorrect: false }, { text: "O(log n)", isCorrect: false }, { text: "O(n²)", isCorrect: false }], correctAnswer: "O(1) average", explanation: "Hash tables provide constant-time lookup." },
                { id: "py-ds-m-2", question: "How do sets handle duplicate values?", options: [{ text: "Automatically removes duplicates", isCorrect: true }, { text: "Raises error", isCorrect: false }, { text: "Keeps all", isCorrect: false }, { text: "Keeps first only", isCorrect: false }], correctAnswer: "Automatically removes duplicates", explanation: "Sets only store unique values." }
            ],
            hard: [
                { id: "py-ds-h-1", question: "What is a defaultdict?", options: [{ text: "Dict with default value for missing keys", isCorrect: true }, { text: "Empty dictionary", isCorrect: false }, { text: "Sorted dictionary", isCorrect: false }, { text: "Frozen dictionary", isCorrect: false }], correctAnswer: "Dict with default value for missing keys", explanation: "defaultdict auto-creates values for new keys." }
            ]
        }
    },
    JavaScript: {
        Basics: {
            easy: [
                { id: "js-basics-e-1", question: "Which keyword declares a block-scoped variable?", options: [{ text: "let", isCorrect: true }, { text: "var", isCorrect: false }, { text: "const", isCorrect: false }, { text: "variable", isCorrect: false }], correctAnswer: "let", explanation: "let creates block-scoped variables." },
                { id: "js-basics-e-2", question: "What is the result of typeof null?", options: [{ text: "object", isCorrect: true }, { text: "null", isCorrect: false }, { text: "undefined", isCorrect: false }, { text: "boolean", isCorrect: false }], correctAnswer: "object", explanation: "This is a known JavaScript quirk." },
                { id: "js-basics-e-3", question: "How do you write a single-line comment?", options: [{ text: "// comment", isCorrect: true }, { text: "# comment", isCorrect: false }, { text: "-- comment", isCorrect: false }, { text: "/* comment", isCorrect: false }], correctAnswer: "// comment", explanation: "JavaScript uses // for single-line comments." },
                { id: "js-basics-e-4", question: "What is === in JavaScript?", options: [{ text: "Strict equality", isCorrect: true }, { text: "Assignment", isCorrect: false }, { text: "Loose equality", isCorrect: false }, { text: "Not equal", isCorrect: false }], correctAnswer: "Strict equality", explanation: "=== checks value and type equality." }
            ],
            medium: [
                { id: "js-basics-m-1", question: "What is hoisting in JavaScript?", options: [{ text: "Moving declarations to top", isCorrect: true }, { text: "Error handling", isCorrect: false }, { text: "Memory allocation", isCorrect: false }, { text: "Loop optimization", isCorrect: false }], correctAnswer: "Moving declarations to top", explanation: "Hoisting moves var/function declarations up." },
                { id: "js-basics-m-2", question: "What is the difference between null and undefined?", options: [{ text: "null is intentional absence, undefined is uninitialized", isCorrect: true }, { text: "They are the same", isCorrect: false }, { text: "null is for objects only", isCorrect: false }, { text: "undefined is an error", isCorrect: false }], correctAnswer: "null is intentional absence, undefined is uninitialized", explanation: "null is assigned, undefined is default absence." }
            ],
            hard: [
                { id: "js-basics-h-1", question: "What is the temporal dead zone?", options: [{ text: "Period where let/const can't be accessed before declaration", isCorrect: true }, { text: "Memory leak period", isCorrect: false }, { text: "Async waiting time", isCorrect: false }, { text: "Garbage collection phase", isCorrect: false }], correctAnswer: "Period where let/const can't be accessed before declaration", explanation: "let/const are hoisted but not initialized until declaration." }
            ]
        },
        Async: {
            easy: [
                { id: "js-async-e-1", question: "What is a Promise in JavaScript?", options: [{ text: "Object representing async operation result", isCorrect: true }, { text: "A function type", isCorrect: false }, { text: "Error handler", isCorrect: false }, { text: "Loop construct", isCorrect: false }], correctAnswer: "Object representing async operation result", explanation: "Promises handle async operations." },
                { id: "js-async-e-2", question: "What keyword makes a function async?", options: [{ text: "async", isCorrect: true }, { text: "await", isCorrect: false }, { text: "promise", isCorrect: false }, { text: "defer", isCorrect: false }], correctAnswer: "async", explanation: "async keyword before function declaration." }
            ],
            medium: [
                { id: "js-async-m-1", question: "What does await do?", options: [{ text: "Pauses execution until Promise resolves", isCorrect: true }, { text: "Creates a Promise", isCorrect: false }, { text: "Rejects a Promise", isCorrect: false }, { text: "Starts async function", isCorrect: false }], correctAnswer: "Pauses execution until Promise resolves", explanation: "await waits for Promise completion." },
                { id: "js-async-m-2", question: "What is Promise.all()?", options: [{ text: "Runs multiple promises in parallel", isCorrect: true }, { text: "Creates one promise", isCorrect: false }, { text: "Cancels promises", isCorrect: false }, { text: "Chains promises", isCorrect: false }], correctAnswer: "Runs multiple promises in parallel", explanation: "Promise.all waits for all promises to resolve." }
            ],
            hard: [
                { id: "js-async-h-1", question: "What is the event loop?", options: [{ text: "Mechanism handling async callbacks", isCorrect: true }, { text: "For loop type", isCorrect: false }, { text: "DOM event handler", isCorrect: false }, { text: "Error handler", isCorrect: false }], correctAnswer: "Mechanism handling async callbacks", explanation: "Event loop manages call stack and callback queue." }
            ]
        }
    },
    React: {
        Hooks: {
            easy: [
                { id: "react-hooks-e-1", question: "Which hook manages state in functional components?", options: [{ text: "useState", isCorrect: true }, { text: "useEffect", isCorrect: false }, { text: "useContext", isCorrect: false }, { text: "useRef", isCorrect: false }], correctAnswer: "useState", explanation: "useState creates and manages component state." },
                { id: "react-hooks-e-2", question: "Which hook is used for side effects?", options: [{ text: "useEffect", isCorrect: true }, { text: "useState", isCorrect: false }, { text: "useMemo", isCorrect: false }, { text: "useCallback", isCorrect: false }], correctAnswer: "useEffect", explanation: "useEffect handles side effects like API calls." },
                { id: "react-hooks-e-3", question: "What does useRef return?", options: [{ text: "Mutable ref object", isCorrect: true }, { text: "State value", isCorrect: false }, { text: "Callback function", isCorrect: false }, { text: "Context value", isCorrect: false }], correctAnswer: "Mutable ref object", explanation: "useRef returns object with .current property." }
            ],
            medium: [
                { id: "react-hooks-m-1", question: "What is the dependency array in useEffect?", options: [{ text: "Controls when effect re-runs", isCorrect: true }, { text: "List of components", isCorrect: false }, { text: "State variables", isCorrect: false }, { text: "Props list", isCorrect: false }], correctAnswer: "Controls when effect re-runs", explanation: "Effect runs when dependencies change." },
                { id: "react-hooks-m-2", question: "What does useMemo do?", options: [{ text: "Memoizes computed values", isCorrect: true }, { text: "Creates state", isCorrect: false }, { text: "Handles effects", isCorrect: false }, { text: "Creates refs", isCorrect: false }], correctAnswer: "Memoizes computed values", explanation: "useMemo caches expensive computations." }
            ],
            hard: [
                { id: "react-hooks-h-1", question: "What is the rules of hooks?", options: [{ text: "Only call hooks at top level, only in React functions", isCorrect: true }, { text: "Any order is fine", isCorrect: false }, { text: "Hooks can be in loops", isCorrect: false }, { text: "No rules", isCorrect: false }], correctAnswer: "Only call hooks at top level, only in React functions", explanation: "Hooks must be called consistently at top level." }
            ]
        },
        Components: {
            easy: [
                { id: "react-comp-e-1", question: "What are props in React?", options: [{ text: "Properties passed to components", isCorrect: true }, { text: "Local state", isCorrect: false }, { text: "CSS styles", isCorrect: false }, { text: "Event handlers", isCorrect: false }], correctAnswer: "Properties passed to components", explanation: "Props are read-only data passed from parent." },
                { id: "react-comp-e-2", question: "What is JSX?", options: [{ text: "JavaScript syntax extension for UI", isCorrect: true }, { text: "New JavaScript version", isCorrect: false }, { text: "CSS framework", isCorrect: false }, { text: "Testing library", isCorrect: false }], correctAnswer: "JavaScript syntax extension for UI", explanation: "JSX lets you write HTML-like syntax in JavaScript." }
            ],
            medium: [
                { id: "react-comp-m-1", question: "What is the virtual DOM?", options: [{ text: "In-memory representation of real DOM", isCorrect: true }, { text: "Browser DOM", isCorrect: false }, { text: "Server rendering", isCorrect: false }, { text: "CSS model", isCorrect: false }], correctAnswer: "In-memory representation of real DOM", explanation: "Virtual DOM enables efficient DOM updates." }
            ],
            hard: [
                { id: "react-comp-h-1", question: "What is React reconciliation?", options: [{ text: "Algorithm to diff virtual DOM", isCorrect: true }, { text: "State management", isCorrect: false }, { text: "Event handling", isCorrect: false }, { text: "Component mounting", isCorrect: false }], correctAnswer: "Algorithm to diff virtual DOM", explanation: "Reconciliation determines minimal DOM updates." }
            ]
        }
    }
};

// Get all available subjects
export const getSubjects = (): string[] => Object.keys(questionTemplates);

// Get topics for a subject
export const getTopics = (subject: string): string[] => {
    return questionTemplates[subject] ? Object.keys(questionTemplates[subject]) : [];
};

// Get question count for subject/topic/difficulty
export const getQuestionCount = (subject: string, topic: string, difficulty: 'easy' | 'medium' | 'hard'): number => {
    return questionTemplates[subject]?.[topic]?.[difficulty]?.length ?? 0;
};
