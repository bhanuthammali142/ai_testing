# TestExam - Professional Online Examination Platform

A complete online exam application inspired by Testmoz, built with React, TypeScript, and Tailwind CSS.

![TestExam](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)

## 🚀 Features

### Admin Features
- **Test Creation** - Create tests with custom names and admin passwords
- **Question Management** - Add questions manually or generate with AI
  - Multiple Choice (Single Answer)
  - Multiple Choice (Multiple Answers)
  - True/False
  - Coding Questions
- **Test Settings**
  - Question behavior (randomization, one page/per question)
  - Review settings (passing score, result display options)
  - Access control (public, passcode, email-restricted)
  - Anti-cheating controls (disable copy/paste, right-click, etc.)
- **Publishing** - Control test status (open, closed, scheduled)
- **Analytics** - View detailed results and statistics

### Candidate Features
- **Clean Exam Interface** - Distraction-free exam experience
- **Timer** - Visible countdown with auto-submit
- **Question Navigation** - Navigate between questions easily
- **Flag Questions** - Mark questions for review
- **Auto-save** - Responses saved automatically
- **Results Review** - View score, correct answers, and explanations

### UX Enhancements
- Loading skeletons
- Empty states
- Toast notifications
- Tab-switch detection and warning
- Responsive design (mobile-friendly)

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3.4
- **State Management**: Zustand with persistence
- **Routing**: React Router DOM 6
- **Charts**: Recharts
- **Icons**: Lucide React

## 📦 Installation

1. **Prerequisites**
   - Node.js 18+ 
   - npm or yarn

2. **Install Dependencies**
   ```bash
   cd testexam
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
4. Start adding questions and configuring settings

### Taking a Test
1. Navigate to `/exam/test-001`
2. Enter required details
3. Complete the exam
4. View your results

## 📂 Project Structure

```
src/
├── components/
│   ├── common/         # Reusable UI components
│   │   ├── Toast.tsx
│   │   ├── Modal.tsx
│   │   ├── Loading.tsx
│   │   ├── EmptyState.tsx
│   │   └── ToggleSwitch.tsx
│   └── layout/         # Layout components
│       ├── AdminLayout.tsx
│       └── ExamLayout.tsx
├── data/
│   └── mockData.ts     # Sample data and defaults
├── pages/
│   ├── admin/          # Admin pages
│   │   ├── DashboardPage.tsx
│   │   ├── QuestionsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── PublishPage.tsx
│   │   └── ResultsPage.tsx
│   ├── exam/           # Candidate pages
│   │   ├── ExamEntryPage.tsx
│   │   ├── ExamTakePage.tsx
│   │   └── ExamSubmittedPage.tsx
│   └── HomePage.tsx
├── stores/             # Zustand stores
│   ├── authStore.ts
│   ├── testStore.ts
│   ├── attemptStore.ts
│   ├── uiStore.ts
│   └── aiQuestionStore.ts
├── types/
│   └── index.ts        # TypeScript type definitions
├── App.tsx             # Main app with routing
├── main.tsx            # Entry point
└── index.css           # Global styles
```

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

The app uses a custom design system with:

- **Colors**: Primary (blue), Accent (purple), Success, Warning, Danger
- **Typography**: Inter (body), Outfit (display)
- **Effects**: Glassmorphism, gradients, subtle animations
- **Components**: Cards, buttons, toggles, badges

## 📊 Analytics

The Results page provides:

- Total attempts count
- Average score
- Average time
- Pass rate
- Score distribution chart
- Per-question performance grid
- Individual attempt details
- Export to CSV/Excel

## 🔐 Security Features

- Password-protected admin access
- Passcode or email-restricted test access
- Anti-cheating browser controls
- Tab-switch monitoring and logging
- Secure state persistence

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📝 Future Enhancements

- [ ] Backend API integration
- [ ] Real AI question generation
- [ ] Proctoring features
- [ ] Advanced analytics
- [ ] Question bank management
- [ ] Import/Export questions
- [ ] Email notifications
- [ ] Scheduled test windows

## 📄 License

MIT License - feel free to use this project for educational or commercial purposes.

---

Built with ❤️ for educators and organizations
