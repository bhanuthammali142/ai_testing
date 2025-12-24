// ============================================
// Subject & Topic Data for AI Question Generation
// ============================================

export interface Topic {
    id: string;
    name: string;
    subtopics?: string[];
}

export interface Subject {
    id: string;
    name: string;
    icon: string;
    color: string;
    topics: Topic[];
}

// Comprehensive subject-topic hierarchy
export const subjectData: Subject[] = [
    {
        id: 'programming',
        name: 'Programming & Development',
        icon: '💻',
        color: 'from-blue-500 to-cyan-500',
        topics: [
            {
                id: 'javascript',
                name: 'JavaScript',
                subtopics: ['Variables & Data Types', 'Functions & Scope', 'Arrays & Objects', 'DOM Manipulation', 'Async/Await & Promises', 'ES6+ Features', 'Error Handling', 'Closures', 'Prototypes & Classes']
            },
            {
                id: 'python',
                name: 'Python',
                subtopics: ['Syntax Basics', 'Data Structures', 'OOP in Python', 'File Handling', 'List Comprehensions', 'Decorators', 'Generators', 'Exception Handling', 'Modules & Packages']
            },
            {
                id: 'java',
                name: 'Java',
                subtopics: ['OOP Concepts', 'Collections Framework', 'Multithreading', 'Exception Handling', 'Streams API', 'JDBC', 'Generics', 'Annotations', 'Lambda Expressions']
            },
            {
                id: 'react',
                name: 'React.js',
                subtopics: ['Components & Props', 'State Management', 'Hooks', 'Context API', 'React Router', 'Forms & Validation', 'Performance Optimization', 'Testing', 'Redux']
            },
            {
                id: 'nodejs',
                name: 'Node.js',
                subtopics: ['Core Modules', 'Express.js', 'REST APIs', 'Authentication', 'Database Integration', 'Middleware', 'Error Handling', 'File System', 'Streams']
            },
            {
                id: 'typescript',
                name: 'TypeScript',
                subtopics: ['Type System', 'Interfaces', 'Generics', 'Type Guards', 'Utility Types', 'Decorators', 'Modules', 'Enums', 'Advanced Types']
            },
            {
                id: 'html-css',
                name: 'HTML & CSS',
                subtopics: ['Semantic HTML', 'CSS Selectors', 'Flexbox', 'CSS Grid', 'Responsive Design', 'Animations', 'CSS Variables', 'Accessibility', 'Preprocessors']
            },
            {
                id: 'sql',
                name: 'SQL & Databases',
                subtopics: ['Basic Queries', 'Joins', 'Aggregations', 'Subqueries', 'Indexes', 'Stored Procedures', 'Transactions', 'Normalization', 'NoSQL Basics']
            },
        ]
    },
    {
        id: 'data-science',
        name: 'Data Science & AI',
        icon: '🤖',
        color: 'from-purple-500 to-pink-500',
        topics: [
            {
                id: 'machine-learning',
                name: 'Machine Learning',
                subtopics: ['Supervised Learning', 'Unsupervised Learning', 'Neural Networks', 'Decision Trees', 'SVM', 'Random Forest', 'Gradient Boosting', 'Model Evaluation', 'Feature Engineering']
            },
            {
                id: 'deep-learning',
                name: 'Deep Learning',
                subtopics: ['CNN', 'RNN', 'LSTM', 'Transformers', 'GANs', 'Transfer Learning', 'Attention Mechanism', 'Backpropagation', 'Optimization']
            },
            {
                id: 'data-analysis',
                name: 'Data Analysis',
                subtopics: ['Pandas', 'NumPy', 'Data Cleaning', 'EDA', 'Statistical Analysis', 'Visualization', 'Hypothesis Testing', 'Correlation', 'Regression']
            },
            {
                id: 'nlp',
                name: 'Natural Language Processing',
                subtopics: ['Text Processing', 'Tokenization', 'Word Embeddings', 'Sentiment Analysis', 'Named Entity Recognition', 'Language Models', 'Text Classification', 'Machine Translation']
            },
            {
                id: 'statistics',
                name: 'Statistics',
                subtopics: ['Descriptive Statistics', 'Probability', 'Distributions', 'Hypothesis Testing', 'Confidence Intervals', 'ANOVA', 'Chi-Square', 'Bayesian Statistics']
            },
        ]
    },
    {
        id: 'mathematics',
        name: 'Mathematics',
        icon: '📐',
        color: 'from-green-500 to-teal-500',
        topics: [
            {
                id: 'algebra',
                name: 'Algebra',
                subtopics: ['Linear Equations', 'Quadratic Equations', 'Polynomials', 'Inequalities', 'Functions', 'Logarithms', 'Sequences & Series', 'Matrices']
            },
            {
                id: 'calculus',
                name: 'Calculus',
                subtopics: ['Limits', 'Derivatives', 'Integrals', 'Applications', 'Differential Equations', 'Multivariable Calculus', 'Vector Calculus', 'Series']
            },
            {
                id: 'geometry',
                name: 'Geometry',
                subtopics: ['Lines & Angles', 'Triangles', 'Circles', 'Coordinate Geometry', 'Mensuration', '3D Geometry', 'Transformations', 'Trigonometry']
            },
            {
                id: 'discrete-math',
                name: 'Discrete Mathematics',
                subtopics: ['Set Theory', 'Logic', 'Graph Theory', 'Combinatorics', 'Number Theory', 'Relations', 'Boolean Algebra', 'Recurrence Relations']
            },
            {
                id: 'linear-algebra',
                name: 'Linear Algebra',
                subtopics: ['Vectors', 'Matrices', 'Eigenvalues', 'Linear Transformations', 'Vector Spaces', 'Determinants', 'Orthogonality', 'SVD']
            },
        ]
    },
    {
        id: 'science',
        name: 'Science',
        icon: '🔬',
        color: 'from-orange-500 to-red-500',
        topics: [
            {
                id: 'physics',
                name: 'Physics',
                subtopics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Modern Physics', 'Waves', 'Nuclear Physics', 'Quantum Mechanics']
            },
            {
                id: 'chemistry',
                name: 'Chemistry',
                subtopics: ['Atomic Structure', 'Chemical Bonding', 'Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Electrochemistry', 'Chemical Kinetics']
            },
            {
                id: 'biology',
                name: 'Biology',
                subtopics: ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Human Anatomy', 'Plant Biology', 'Microbiology', 'Biochemistry']
            },
            {
                id: 'environmental-science',
                name: 'Environmental Science',
                subtopics: ['Ecosystems', 'Climate Change', 'Pollution', 'Conservation', 'Biodiversity', 'Renewable Energy', 'Sustainability']
            },
        ]
    },
    {
        id: 'business',
        name: 'Business & Management',
        icon: '📊',
        color: 'from-indigo-500 to-purple-500',
        topics: [
            {
                id: 'marketing',
                name: 'Marketing',
                subtopics: ['Digital Marketing', 'SEO', 'Social Media', 'Content Marketing', 'Analytics', 'Branding', 'Consumer Behavior', 'Market Research']
            },
            {
                id: 'finance',
                name: 'Finance',
                subtopics: ['Financial Analysis', 'Investment', 'Risk Management', 'Corporate Finance', 'Banking', 'Portfolio Management', 'Derivatives']
            },
            {
                id: 'management',
                name: 'Management',
                subtopics: ['Strategic Management', 'Operations', 'HR Management', 'Project Management', 'Leadership', 'Organizational Behavior', 'Supply Chain']
            },
            {
                id: 'accounting',
                name: 'Accounting',
                subtopics: ['Financial Accounting', 'Cost Accounting', 'Taxation', 'Auditing', 'Management Accounting', 'IFRS', 'Bookkeeping']
            },
            {
                id: 'economics',
                name: 'Economics',
                subtopics: ['Microeconomics', 'Macroeconomics', 'International Trade', 'Monetary Policy', 'Fiscal Policy', 'Market Structures', 'Game Theory']
            },
        ]
    },
    {
        id: 'languages',
        name: 'Languages',
        icon: '🌍',
        color: 'from-yellow-500 to-orange-500',
        topics: [
            {
                id: 'english',
                name: 'English',
                subtopics: ['Grammar', 'Vocabulary', 'Reading Comprehension', 'Writing Skills', 'Speaking', 'Literature', 'Business English']
            },
            {
                id: 'spanish',
                name: 'Spanish',
                subtopics: ['Grammar', 'Vocabulary', 'Conjugation', 'Conversation', 'Culture', 'Reading', 'Writing']
            },
            {
                id: 'french',
                name: 'French',
                subtopics: ['Grammar', 'Vocabulary', 'Conjugation', 'Conversation', 'Culture', 'Reading', 'Writing']
            },
            {
                id: 'german',
                name: 'German',
                subtopics: ['Grammar', 'Vocabulary', 'Cases', 'Conversation', 'Culture', 'Reading', 'Writing']
            },
        ]
    },
    {
        id: 'general',
        name: 'General Knowledge',
        icon: '📚',
        color: 'from-slate-500 to-gray-600',
        topics: [
            {
                id: 'current-affairs',
                name: 'Current Affairs',
                subtopics: ['World News', 'Politics', 'Economy', 'Sports', 'Technology', 'Science & Environment']
            },
            {
                id: 'history',
                name: 'History',
                subtopics: ['Ancient History', 'Medieval History', 'Modern History', 'World Wars', 'Civilizations', 'Revolutions']
            },
            {
                id: 'geography',
                name: 'Geography',
                subtopics: ['Physical Geography', 'Human Geography', 'Countries & Capitals', 'Climate', 'Natural Resources', 'Maps']
            },
            {
                id: 'aptitude',
                name: 'Aptitude',
                subtopics: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Data Interpretation', 'Puzzles']
            },
        ]
    },
    {
        id: 'cloud',
        name: 'Cloud & DevOps',
        icon: '☁️',
        color: 'from-sky-500 to-blue-600',
        topics: [
            {
                id: 'aws',
                name: 'AWS',
                subtopics: ['EC2', 'S3', 'Lambda', 'RDS', 'VPC', 'IAM', 'CloudFormation', 'DynamoDB', 'EKS']
            },
            {
                id: 'azure',
                name: 'Azure',
                subtopics: ['Virtual Machines', 'App Service', 'Functions', 'Storage', 'Active Directory', 'DevOps', 'Kubernetes']
            },
            {
                id: 'docker',
                name: 'Docker & Containers',
                subtopics: ['Docker Basics', 'Dockerfile', 'Docker Compose', 'Networking', 'Volumes', 'Security', 'Optimization']
            },
            {
                id: 'kubernetes',
                name: 'Kubernetes',
                subtopics: ['Pods', 'Services', 'Deployments', 'ConfigMaps', 'Secrets', 'Ingress', 'Helm', 'Operators']
            },
            {
                id: 'devops',
                name: 'DevOps Practices',
                subtopics: ['CI/CD', 'Git', 'Jenkins', 'Terraform', 'Ansible', 'Monitoring', 'Logging', 'Site Reliability']
            },
        ]
    },
];

// AI Question templates by type and difficulty
export const questionTemplates = {
    'mcq-single': {
        easy: [
            'What is the primary purpose of {topic}?',
            'Which of the following best describes {concept}?',
            'What is {term} commonly used for?',
            'Select the correct definition of {concept}.',
            'Which statement about {topic} is TRUE?',
        ],
        medium: [
            'In the context of {topic}, what would happen if {scenario}?',
            'Which approach is MOST appropriate for {problem}?',
            'What is the key difference between {concept1} and {concept2}?',
            'Which of the following is NOT a characteristic of {concept}?',
            'How does {concept} improve {outcome}?',
        ],
        hard: [
            'Given the scenario: {complex_scenario}, what would be the optimal solution?',
            'Which combination of {concepts} would best address {challenge}?',
            'Analyze the following: {code_or_situation}. What is the issue?',
            'In an advanced implementation of {topic}, which trade-off is most critical?',
            'What is the time complexity of {algorithm} in the worst case?',
        ],
    },
    'mcq-multiple': {
        easy: [
            'Select ALL features of {concept}.',
            'Which of the following are types of {category}?',
            'Mark all correct statements about {topic}.',
        ],
        medium: [
            'Which of the following are valid approaches to {problem}?',
            'Select all benefits of using {technology}.',
            'Which factors affect {outcome}? (Select all that apply)',
        ],
        hard: [
            'In {scenario}, which of the following optimizations would be effective?',
            'Select all correct statements about the implementation of {complex_concept}.',
            'Which of the following statements about {advanced_topic} are TRUE?',
        ],
    },
    'true-false': {
        easy: [
            '{statement_about_basics}',
            '{concept} is primarily used for {purpose}.',
            'The term {term} refers to {definition}.',
        ],
        medium: [
            '{nuanced_statement}',
            'In {context}, {claim} is always true.',
            '{concept1} can be used interchangeably with {concept2}.',
        ],
        hard: [
            'Under all circumstances, {advanced_claim}.',
            'The theoretical limit of {concept} is {value}.',
            '{complex_statement_with_edge_cases}',
        ],
    },
    'coding': {
        easy: [
            'Write a function that {simple_task}.',
            'Complete the code to {basic_operation}.',
            'Fix the bug in the following code: {code_snippet}',
        ],
        medium: [
            'Implement a function that {moderate_task} with the following constraints: {constraints}.',
            'Optimize the following code for better performance: {code_snippet}',
            'Write a function to solve: {problem_description}',
        ],
        hard: [
            'Design and implement an algorithm that {complex_task} with O({complexity}) time complexity.',
            'Given the following system constraints: {constraints}, implement {solution}.',
            'Write production-ready code that handles: {edge_cases}',
        ],
    },
};

// Sample generated questions for each subject/topic combination
export const aiQuestionBank: Record<string, Record<string, Array<{
    text: string;
    options?: { text: string; isCorrect: boolean }[];
    correctAnswer?: string;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
}>>> = {
    'javascript': {
        'Variables & Data Types': [
            {
                text: 'Which keyword is used to declare a block-scoped variable in JavaScript?',
                options: [
                    { text: 'var', isCorrect: false },
                    { text: 'let', isCorrect: true },
                    { text: 'const', isCorrect: false },
                    { text: 'Both let and const', isCorrect: false },
                ],
                explanation: 'The "let" keyword declares a block-scoped variable that can be reassigned. "const" also has block scope but cannot be reassigned.',
                difficulty: 'easy',
            },
            {
                text: 'What will be the output of: typeof null?',
                options: [
                    { text: '"null"', isCorrect: false },
                    { text: '"undefined"', isCorrect: false },
                    { text: '"object"', isCorrect: true },
                    { text: '"boolean"', isCorrect: false },
                ],
                explanation: 'This is a known JavaScript quirk. "typeof null" returns "object" due to a bug in the original JavaScript implementation that was never fixed for backward compatibility.',
                difficulty: 'medium',
            },
            {
                text: 'In JavaScript, which of the following are falsy values? (Select all that apply)',
                options: [
                    { text: '0', isCorrect: true },
                    { text: '""', isCorrect: true },
                    { text: '[]', isCorrect: false },
                    { text: 'null', isCorrect: true },
                    { text: 'undefined', isCorrect: true },
                ],
                explanation: 'Falsy values in JavaScript are: false, 0, "", null, undefined, and NaN. Empty arrays [] and objects {} are truthy.',
                difficulty: 'medium',
            },
        ],
        'Functions & Scope': [
            {
                text: 'What is a closure in JavaScript?',
                options: [
                    { text: 'A function that returns another function', isCorrect: false },
                    { text: 'A function that has access to variables from its outer scope even after the outer function has returned', isCorrect: true },
                    { text: 'A way to close browser windows using JavaScript', isCorrect: false },
                    { text: 'A method to prevent memory leaks', isCorrect: false },
                ],
                explanation: 'A closure is created when a function retains access to its lexical scope even when the function is executed outside that scope. This is a fundamental concept for data privacy and factory functions.',
                difficulty: 'medium',
            },
            {
                text: 'What is the difference between "call" and "apply" methods?',
                options: [
                    { text: 'call passes arguments as an array, apply passes them individually', isCorrect: false },
                    { text: 'call passes arguments individually, apply passes them as an array', isCorrect: true },
                    { text: 'There is no difference', isCorrect: false },
                    { text: 'apply can only be used with arrow functions', isCorrect: false },
                ],
                explanation: 'Both methods invoke a function with a specific "this" value, but "call" accepts arguments individually while "apply" accepts them as an array. Remember: A for Array, C for Comma-separated.',
                difficulty: 'medium',
            },
        ],
        'Async/Await & Promises': [
            {
                text: 'What does the following code output?\n\nconsole.log("1");\nsetTimeout(() => console.log("2"), 0);\nPromise.resolve().then(() => console.log("3"));\nconsole.log("4");',
                options: [
                    { text: '1, 2, 3, 4', isCorrect: false },
                    { text: '1, 4, 3, 2', isCorrect: true },
                    { text: '1, 4, 2, 3', isCorrect: false },
                    { text: '1, 3, 2, 4', isCorrect: false },
                ],
                explanation: 'Microtasks (Promises) have higher priority than macrotasks (setTimeout). So: sync logs (1, 4), then microtask queue (3), then macrotask queue (2).',
                difficulty: 'hard',
            },
        ],
    },
    'python': {
        'Data Structures': [
            {
                text: 'What is the difference between a list and a tuple in Python?',
                options: [
                    { text: 'Lists are ordered, tuples are unordered', isCorrect: false },
                    { text: 'Lists are mutable, tuples are immutable', isCorrect: true },
                    { text: 'Lists can only contain numbers, tuples can contain any type', isCorrect: false },
                    { text: 'There is no difference', isCorrect: false },
                ],
                explanation: 'Lists are mutable (can be modified after creation) while tuples are immutable (cannot be changed). Tuples are generally faster and can be used as dictionary keys.',
                difficulty: 'easy',
            },
            {
                text: 'What will be the output of: list(range(0, 10, 2))?',
                options: [
                    { text: '[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]', isCorrect: false },
                    { text: '[0, 2, 4, 6, 8]', isCorrect: true },
                    { text: '[2, 4, 6, 8, 10]', isCorrect: false },
                    { text: '[0, 2, 4, 6, 8, 10]', isCorrect: false },
                ],
                explanation: 'range(start, stop, step) generates numbers from start to stop-1 with the given step. So range(0, 10, 2) gives 0, 2, 4, 6, 8.',
                difficulty: 'easy',
            },
        ],
        'OOP in Python': [
            {
                text: 'Which method is called when an object is created in Python?',
                options: [
                    { text: '__new__', isCorrect: false },
                    { text: '__init__', isCorrect: true },
                    { text: '__create__', isCorrect: false },
                    { text: '__constructor__', isCorrect: false },
                ],
                explanation: '__init__ is the initializer method called after the object is created. Technically, __new__ creates the object, but __init__ is commonly known as the constructor.',
                difficulty: 'easy',
            },
            {
                text: 'What is the purpose of the "self" parameter in Python class methods?',
                options: [
                    { text: 'It is a reserved keyword that must be used', isCorrect: false },
                    { text: 'It refers to the instance of the class', isCorrect: true },
                    { text: 'It refers to the class itself', isCorrect: false },
                    { text: 'It is used to define static methods', isCorrect: false },
                ],
                explanation: 'The "self" parameter represents the instance of the class and is used to access instance attributes and methods.',
                difficulty: 'easy',
            },
            {
                text: 'How do you create a private attribute in Python?',
                options: [
                    { text: 'Using the "private" keyword', isCorrect: false },
                    { text: 'Prefixing with double underscore __', isCorrect: true },
                    { text: 'Using the @private decorator', isCorrect: false },
                    { text: 'Declaring it outside the class', isCorrect: false },
                ],
                explanation: 'Python uses name mangling for attributes prefixed with double underscores (__). This makes them harder to access from outside the class.',
                difficulty: 'medium',
            },
            {
                text: 'What is method overriding in Python?',
                options: [
                    { text: 'Creating multiple methods with the same name', isCorrect: false },
                    { text: 'Redefining a parent class method in a child class', isCorrect: true },
                    { text: 'Calling a method multiple times', isCorrect: false },
                    { text: 'Converting a method to a function', isCorrect: false },
                ],
                explanation: 'Method overriding allows a child class to provide a specific implementation for a method that is already defined in its parent class.',
                difficulty: 'medium',
            },
            {
                text: 'What does the @property decorator do in Python?',
                options: [
                    { text: 'Makes a method static', isCorrect: false },
                    { text: 'Converts a method into a read-only attribute', isCorrect: true },
                    { text: 'Makes an attribute private', isCorrect: false },
                    { text: 'Creates a class variable', isCorrect: false },
                ],
                explanation: 'The @property decorator allows you to define getter methods that can be accessed like attributes, providing a clean interface for attribute access with custom logic.',
                difficulty: 'medium',
            },
            {
                text: 'What is multiple inheritance in Python?',
                options: [
                    { text: 'A class with multiple instances', isCorrect: false },
                    { text: 'A class inheriting from multiple parent classes', isCorrect: true },
                    { text: 'Creating multiple child classes from one parent', isCorrect: false },
                    { text: 'Using multiple __init__ methods', isCorrect: false },
                ],
                explanation: 'Multiple inheritance allows a class to inherit attributes and methods from more than one parent class. Python supports this feature unlike some other languages.',
                difficulty: 'medium',
            },
            {
                text: 'What is the Method Resolution Order (MRO) in Python?',
                options: [
                    { text: 'The order in which methods are defined in a class', isCorrect: false },
                    { text: 'The order in which base classes are searched for a method', isCorrect: true },
                    { text: 'The order of method execution in a program', isCorrect: false },
                    { text: 'The alphabetical order of method names', isCorrect: false },
                ],
                explanation: 'MRO determines the order in which base classes are searched when looking for a method. Python uses the C3 linearization algorithm.',
                difficulty: 'hard',
            },
            {
                text: 'What is an abstract class in Python?',
                options: [
                    { text: 'A class with no methods', isCorrect: false },
                    { text: 'A class that cannot be instantiated and may have abstract methods', isCorrect: true },
                    { text: 'A class with only private attributes', isCorrect: false },
                    { text: 'A class defined inside another class', isCorrect: false },
                ],
                explanation: 'Abstract classes are defined using the ABC module and cannot be instantiated directly. They can have abstract methods that must be implemented by subclasses.',
                difficulty: 'medium',
            },
            {
                text: 'How do you call the parent class constructor in Python 3?',
                options: [
                    { text: 'parent.__init__(self)', isCorrect: false },
                    { text: 'super().__init__()', isCorrect: true },
                    { text: 'base.__init__()', isCorrect: false },
                    { text: 'init(parent)', isCorrect: false },
                ],
                explanation: 'In Python 3, super().__init__() is the preferred way to call the parent class constructor. It properly handles multiple inheritance.',
                difficulty: 'easy',
            },
            {
                text: 'What is the difference between @classmethod and @staticmethod?',
                options: [
                    { text: 'No difference, they are aliases', isCorrect: false },
                    { text: '@classmethod receives the class as first argument, @staticmethod receives nothing', isCorrect: true },
                    { text: '@staticmethod can modify class state, @classmethod cannot', isCorrect: false },
                    { text: '@classmethod is faster than @staticmethod', isCorrect: false },
                ],
                explanation: '@classmethod receives the class (cls) as first argument and can modify class state. @staticmethod receives no implicit arguments and works like a regular function.',
                difficulty: 'medium',
            },
        ],
        'Syntax Basics': [
            {
                text: 'What is the correct way to create a comment in Python?',
                options: [
                    { text: '// This is a comment', isCorrect: false },
                    { text: '# This is a comment', isCorrect: true },
                    { text: '/* This is a comment */', isCorrect: false },
                    { text: '-- This is a comment', isCorrect: false },
                ],
                explanation: 'Python uses # for single-line comments. For multi-line comments, you can use triple quotes (docstrings).',
                difficulty: 'easy',
            },
            {
                text: 'Which of the following is the correct way to define a function in Python?',
                options: [
                    { text: 'function myFunc():', isCorrect: false },
                    { text: 'def myFunc():', isCorrect: true },
                    { text: 'func myFunc():', isCorrect: false },
                    { text: 'define myFunc():', isCorrect: false },
                ],
                explanation: 'Python uses the "def" keyword to define functions, followed by the function name, parentheses for parameters, and a colon.',
                difficulty: 'easy',
            },
            {
                text: 'How do you check the type of a variable in Python?',
                options: [
                    { text: 'typeof(variable)', isCorrect: false },
                    { text: 'type(variable)', isCorrect: true },
                    { text: 'variable.type()', isCorrect: false },
                    { text: 'getType(variable)', isCorrect: false },
                ],
                explanation: 'The type() function returns the type of an object in Python.',
                difficulty: 'easy',
            },
        ],
        'List Comprehensions': [
            {
                text: 'What is the output of [x**2 for x in range(5)]?',
                options: [
                    { text: '[1, 4, 9, 16, 25]', isCorrect: false },
                    { text: '[0, 1, 4, 9, 16]', isCorrect: true },
                    { text: '[0, 2, 4, 6, 8]', isCorrect: false },
                    { text: '[1, 2, 3, 4, 5]', isCorrect: false },
                ],
                explanation: 'range(5) produces 0, 1, 2, 3, 4. Squaring each gives 0, 1, 4, 9, 16.',
                difficulty: 'easy',
            },
            {
                text: 'What is the correct syntax for a list comprehension with a condition?',
                options: [
                    { text: '[x for x in list where x > 0]', isCorrect: false },
                    { text: '[x for x in list if x > 0]', isCorrect: true },
                    { text: '[x if x > 0 for x in list]', isCorrect: false },
                    { text: '[for x in list if x > 0: x]', isCorrect: false },
                ],
                explanation: 'The condition in a list comprehension comes after the for clause: [expression for item in iterable if condition].',
                difficulty: 'medium',
            },
        ],
        'Decorators': [
            {
                text: 'What is a decorator in Python?',
                options: [
                    { text: 'A design pattern for UI elements', isCorrect: false },
                    { text: 'A function that modifies the behavior of another function', isCorrect: true },
                    { text: 'A way to add comments to code', isCorrect: false },
                    { text: 'A type of class attribute', isCorrect: false },
                ],
                explanation: 'Decorators are functions that take another function as input and extend its behavior without explicitly modifying it.',
                difficulty: 'medium',
            },
            {
                text: 'What is the correct syntax to apply a decorator to a function?',
                options: [
                    { text: 'decorator(function)', isCorrect: false },
                    { text: '@decorator before the function definition', isCorrect: true },
                    { text: 'function.decorate(decorator)', isCorrect: false },
                    { text: 'apply decorator to function', isCorrect: false },
                ],
                explanation: 'The @ symbol followed by the decorator name is placed on the line before the function definition.',
                difficulty: 'easy',
            },
        ],
    },
    'react': {
        'Hooks': [
            {
                text: 'Which hook should be used to perform side effects in a React functional component?',
                options: [
                    { text: 'useState', isCorrect: false },
                    { text: 'useEffect', isCorrect: true },
                    { text: 'useContext', isCorrect: false },
                    { text: 'useReducer', isCorrect: false },
                ],
                explanation: 'useEffect is designed for side effects like data fetching, subscriptions, or DOM manipulation. It runs after render and can optionally clean up.',
                difficulty: 'easy',
            },
            {
                text: 'What is the purpose of the dependency array in useEffect?',
                options: [
                    { text: 'To list all state variables used in the component', isCorrect: false },
                    { text: 'To control when the effect should re-run', isCorrect: true },
                    { text: 'To import external dependencies', isCorrect: false },
                    { text: 'To define the order of hook execution', isCorrect: false },
                ],
                explanation: 'The dependency array tells React when to re-run the effect. An empty array means run once on mount, no array means run on every render, and specific values mean run when those values change.',
                difficulty: 'medium',
            },
            {
                text: 'Which hook is best for managing complex state logic with multiple sub-values?',
                options: [
                    { text: 'useState', isCorrect: false },
                    { text: 'useEffect', isCorrect: false },
                    { text: 'useReducer', isCorrect: true },
                    { text: 'useMemo', isCorrect: false },
                ],
                explanation: 'useReducer is preferred when you have complex state logic involving multiple sub-values or when the next state depends on the previous one. It follows the Redux pattern.',
                difficulty: 'medium',
            },
        ],
        'State Management': [
            {
                text: 'What causes unnecessary re-renders in React and how can they be prevented?',
                options: [
                    { text: 'Using too many components; use fewer components', isCorrect: false },
                    { text: 'State changes in parent; use React.memo, useMemo, and useCallback', isCorrect: true },
                    { text: 'Using hooks; avoid hooks entirely', isCorrect: false },
                    { text: 'CSS styling; use inline styles instead', isCorrect: false },
                ],
                explanation: 'Re-renders propagate from parent to children. React.memo prevents re-render if props haven\'t changed. useMemo memoizes values, useCallback memoizes functions.',
                difficulty: 'hard',
            },
        ],
    },
    'machine-learning': {
        'Supervised Learning': [
            {
                text: 'What is the main difference between classification and regression?',
                options: [
                    { text: 'Classification is faster than regression', isCorrect: false },
                    { text: 'Classification predicts discrete labels, regression predicts continuous values', isCorrect: true },
                    { text: 'Regression can only work with numerical data', isCorrect: false },
                    { text: 'Classification requires more data than regression', isCorrect: false },
                ],
                explanation: 'Classification predicts categorical outputs (e.g., spam/not spam), while regression predicts continuous numerical outputs (e.g., house prices).',
                difficulty: 'easy',
            },
            {
                text: 'What is overfitting in machine learning?',
                options: [
                    { text: 'When the model is too simple to capture patterns', isCorrect: false },
                    { text: 'When the model performs well on training data but poorly on unseen data', isCorrect: true },
                    { text: 'When the training takes too long', isCorrect: false },
                    { text: 'When the dataset is too large', isCorrect: false },
                ],
                explanation: 'Overfitting occurs when a model learns the training data too well, including noise, and fails to generalize to new data. Solutions include regularization, cross-validation, and more data.',
                difficulty: 'easy',
            },
        ],
        'Model Evaluation': [
            {
                text: 'When is F1-score more appropriate than accuracy?',
                options: [
                    { text: 'When the dataset is balanced', isCorrect: false },
                    { text: 'When dealing with imbalanced classes', isCorrect: true },
                    { text: 'When training neural networks', isCorrect: false },
                    { text: 'When using unsupervised learning', isCorrect: false },
                ],
                explanation: 'F1-score is the harmonic mean of precision and recall, making it better for imbalanced datasets where accuracy can be misleading (e.g., 99% accuracy by always predicting the majority class).',
                difficulty: 'medium',
            },
        ],
    },
};

// Function to get topics for a subject
export const getTopicsForSubject = (subjectId: string): Topic[] => {
    const subject = subjectData.find(s => s.id === subjectId);
    return subject?.topics || [];
};

// Function to get subtopics for a topic
export const getSubtopicsForTopic = (subjectId: string, topicId: string): string[] => {
    const subject = subjectData.find(s => s.id === subjectId);
    const topic = subject?.topics.find(t => t.id === topicId);
    return topic?.subtopics || [];
};

// Function to get all subjects
export const getAllSubjects = (): Subject[] => subjectData;

// Function to search topics across all subjects
export const searchTopics = (query: string): Array<{ subject: Subject; topic: Topic }> => {
    const results: Array<{ subject: Subject; topic: Topic }> = [];
    const lowerQuery = query.toLowerCase();

    subjectData.forEach(subject => {
        subject.topics.forEach(topic => {
            if (
                topic.name.toLowerCase().includes(lowerQuery) ||
                topic.subtopics?.some(st => st.toLowerCase().includes(lowerQuery))
            ) {
                results.push({ subject, topic });
            }
        });
    });

    return results;
};
