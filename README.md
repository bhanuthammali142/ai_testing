# TestExam - Professional Online Examination Platform

A complete online exam application with support for MCQ, Reasoning, Fill-in-the-blank, and Coding questions. Built with React, TypeScript, and Tailwind CSS.

![TestExam](https://img.shields.io/badge/version-2.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)

## 🚀 Features

### Question Types
- **MCQ (Single Answer)** - Multiple choice with one correct answer
- **MCQ (Multiple Answers)** - Multiple choice with multiple correct answers
- **True/False** - Binary choice questions
- **Reasoning** - Logic and aptitude questions
- **Coding Questions** - Write and execute Python code with test cases

### Admin Features
- **Test Creation** - Create tests with custom names and admin passwords
- **Question Management**
  - Add questions manually
  - Generate with AI (rule-based generator)
  - **CSV Import** - Bulk upload questions including coding questions
- **Question Bank** - Centralized question repository with filtering
- **Test Settings**
  - Question behavior (randomization, one page/per question)
  - Review settings (passing score, result display options)
  - Access control (public, passcode, email-restricted)
  - Anti-cheating controls (disable copy/paste, right-click, etc.)
- **Publishing** - Control test status (open, closed, scheduled)
- **Analytics** - View detailed results and statistics

### Candidate Features
- **Clean Exam Interface** - Distraction-free exam experience
- **Code Editor** - Monaco-style editor for coding questions
- **Live Code Execution** - Run Python code against test cases
- **Timer** - Visible countdown with auto-submit
- **Question Navigation** - Navigate between questions easily
- **Flag Questions** - Mark questions for review
- **Auto-save** - Responses saved automatically
- **Results Review** - View score, correct answers, and explanations

### CSV Import Features
- **Single CSV for All Types** - Import MCQ, Reasoning, and Coding questions
- **Coding Question Support** - Include sample input/output and hidden test cases
- **Validation** - Automatic validation with detailed error messages
- **Preview** - Preview questions before importing
- **Question Type Filter** - Separate MCQ and Coding questions during selection

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18 with TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 3.4 |
| State Management | Zustand with persistence |
| Routing | React Router DOM 6 |
| Charts | Recharts |
| Icons | Lucide React |
| Code Execution | Client-side Python Interpreter |

## 📦 Installation

1. **Prerequisites**
   - Node.js 18+
   - npm or yarn

2. **Clone & Install**
   ```bash
   git clone https://github.com/bhanuthammali142/ai_testing.git
   cd ai_testing
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   ```
   http://localhost:5173
   ```

## 🎯 Quick Start

### Demo Access
Use these credentials to explore the demo test:
- **Test ID**: `test-001`
- **Admin Password**: `admin123`

### Creating a New Test
1. Go to the homepage
2. Click "Create a Test"
3. Enter test name and admin password
4. Add questions manually, via AI, or import from CSV
5. Configure settings and publish

### Taking a Test
1. Navigate to `/exam/test-001` or access via homepage
2. Enter required details (name, email if required)
3. Complete the exam (MCQ and Coding questions)
4. View your results

## 📂 Project Structure

```
src/
├── ai/                     # AI Question Generation
│   ├── questionGenerator.ts
│   ├── questionTemplates.ts
│   ├── questionTracker.ts
│   └── ruleBasedGenerator.ts
├── components/
│   ├── admin/              # Admin-specific components
│   │   └── QuestionBankSelector.tsx
│   ├── coding/             # Coding question components
│   │   ├── CodingQuestionEditor.tsx
│   │   ├── CodingQuestionView.tsx
│   │   └── CodingResultsView.tsx
│   ├── common/             # Reusable UI components
│   │   ├── EmptyState.tsx
│   │   ├── Loading.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   └── ToggleSwitch.tsx
│   └── layout/             # Layout components
│       ├── AdminLayout.tsx
│       └── ExamLayout.tsx
├── config/
│   └── firebase.ts         # Firebase configuration
├── data/
│   ├── mockData.ts         # Sample data and defaults
│   └── subjectData.ts      # Subject/topic definitions
├── pages/
│   ├── admin/              # Admin pages
│   │   ├── DashboardPage.tsx
│   │   ├── PublishPage.tsx
│   │   ├── QuestionBankPage.tsx
│   │   ├── QuestionsPage.tsx
│   │   ├── ResultsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── exam/               # Candidate pages
│   │   ├── ExamEntryPage.tsx
│   │   ├── ExamSubmittedPage.tsx
│   │   └── ExamTakePage.tsx
│   └── HomePage.tsx
├── services/
│   ├── coding/             # Code execution services
│   │   ├── codeExecutor.ts     # Python interpreter
│   │   ├── codingService.ts    # Evaluation logic
│   │   └── index.ts
│   └── firebaseService.ts  # Firebase integration
├── stores/                 # Zustand state stores
│   ├── aiQuestionStore.ts
│   ├── attemptStore.ts
│   ├── authStore.ts
│   ├── codingStore.ts
│   ├── questionBankStore.ts
│   ├── testStore.ts
│   └── uiStore.ts
├── types/
│   ├── coding.ts           # Coding question types
│   └── index.ts            # All type definitions
├── utils/
│   ├── csvParser.ts        # CSV parsing & validation
│   └── questionSelector.ts # Question selection logic
├── App.tsx                 # Main app with routing
├── main.tsx                # Entry point
└── index.css               # Global styles with design system
```

## 📋 CSV Format for Question Import

### Headers (All Columns)
```
id,subject,topic,difficulty,question_type,question,option_a,option_b,option_c,option_d,correct_answer,explanation,sample_input,sample_output,hidden_test_cases,time_limit
```

### Question Types
| Type | Description |
|------|-------------|
| `mcq` | Multiple Choice Question |
| `reasoning` | Logic/Aptitude Question |
| `fill` | Fill in the Blank |
| `coding` | Programming Question |

### MCQ/Reasoning Example
```csv
Q001,Mathematics,Algebra,Easy,mcq,"What is 2 + 2?",3,4,5,6,B,"Basic addition",,,,
```

### Coding Question Example
```csv
Q004,Programming,Strings,Medium,coding,"Check if palindrome",,,,,,racecar,True,"[{""input"":""hello"",""output"":""False""}]",5
```

### Hidden Test Cases Format (JSON)
```json
[
  {"input": "hello", "output": "False"},
  {"input": "madam", "output": "True"}
]
```

**Sample CSV available at**: `samples/sample_mixed_questions.csv`

## 💻 Coding Question Evaluation

### Supported Language
- **Python** (client-side interpreter)

### Security Features
- Blocked dangerous patterns (`import os`, `exec`, `eval`, etc.)
- Execution timeout enforcement
- Output length limits
- Safe module allowlist

### Test Case Evaluation
- All test cases (sample + hidden) must pass
- Exact output matching (whitespace normalized)
- Partial scoring based on passed tests
- Detailed feedback for each test case

## 🔧 Configuration

### Test Settings

| Setting | Description |
|---------|-------------|
| `showAllOnOnePage` | Display all questions on one page |
| `randomizeOrder` | Shuffle questions for each candidate |
| `allowBlankAnswers` | Allow submission without answering all |
| `enableNegativeMarking` | Deduct points for wrong answers |
| `passingScore` | Minimum percentage to pass |
| `timeLimitMinutes` | Time limit for the exam |
| `attemptLimit` | Maximum attempts allowed |

### Anti-Cheating Controls

- Disable right-click context menu
- Disable copy/paste
- Disable browser translate
- Disable autocomplete
- Disable spellcheck
- Disable printing
- Tab-switch detection and logging

## 🎨 Design System

The app uses a modern glassmorphism design with:

- **Colors**: Primary (blue), Accent (purple), Success, Warning, Danger
- **Typography**: Inter (body), Outfit (display)
- **Effects**: Glass panels, gradients, subtle animations
- **Components**: Cards, buttons, toggles, badges, code editor

## 📊 Analytics

The Results page provides:

- Total attempts count
- Average score
- Average time
- Pass rate
- Score distribution chart
- Per-question performance grid
- Individual attempt details
- Export to CSV

## 🔐 Security Features

- Password-protected admin access
- Passcode or email-restricted test access
- Anti-cheating browser controls
- Tab-switch monitoring and logging
- Secure code execution sandbox
- Blocked dangerous Python patterns

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Output
The build output will be in the `dist/` folder, ready for deployment to any static hosting service (Vercel, Netlify, etc.)

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🗂️ Key Files

| File | Purpose |
|------|---------|
| `src/utils/csvParser.ts` | CSV parsing and validation |
| `src/services/coding/codeExecutor.ts` | Python code interpreter |
| `src/services/coding/codingService.ts` | Test case evaluation |
| `src/stores/attemptStore.ts` | Exam attempt management |
| `src/stores/codingStore.ts` | Coding question state |
| `src/components/coding/CodingQuestionView.tsx` | Code editor UI |

## ✅ Recent Updates (v2.0.0)

- ✨ **CSV Import for Coding Questions** - Upload MCQ and Coding questions via single CSV
- ✨ **Question Type Filters** - Separate MCQ and Coding questions during exam creation
- 🐛 **Fixed Coding Evaluation** - Proper test case validation for coding answers
- 🐛 **Fixed CodingQuestionView Integration** - Code editor properly renders in exams
- 📝 **Updated Documentation** - Comprehensive README with all features

## 📄 License

MIT License - feel free to use this project for educational or commercial purposes.

---

Built with ❤️ for educators and organizations

**Repository**: [github.com/bhanuthammali142/ai_testing](https://github.com/bhanuthammali142/ai_testing)
