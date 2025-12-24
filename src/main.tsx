// ============================================
// TestExam Application Entry Point
// ============================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize Firebase Analytics
import { initAnalytics } from './config/firebase';
initAnalytics().then((analytics) => {
    if (analytics) {
        console.log('📊 Firebase Analytics initialized');
    }
}).catch(console.error);

// Render the application
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
