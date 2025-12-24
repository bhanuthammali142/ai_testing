// ============================================
// Exam Layout for Candidates
// ============================================

import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
    Clock,
    AlertTriangle,
    CheckCircle,
    Save
} from 'lucide-react';
import { useAttemptStore, useTestStore, useUIStore } from '../../stores';

const ExamLayout: React.FC = () => {
    const navigate = useNavigate();
    const { currentAttempt, incrementTabSwitch } = useAttemptStore();
    const { currentTest } = useTestStore();
    const { showToast } = useUIStore();

    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showTabWarning, setShowTabWarning] = useState(false);

    // Timer logic
    useEffect(() => {
        if (!currentTest?.settings.accessControl.timeLimitMinutes || !currentAttempt) {
            return;
        }

        const timeLimit = currentTest.settings.accessControl.timeLimitMinutes * 60;
        const elapsed = Math.floor(
            (Date.now() - new Date(currentAttempt.startedAt).getTime()) / 1000
        );
        const remaining = Math.max(0, timeLimit - elapsed);
        setTimeRemaining(remaining);

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev === null) return null;
                if (prev <= 0) {
                    clearInterval(interval);
                    // Auto-submit on timeout
                    if (currentTest.settings.accessControl.autoSubmitOnTimeout) {
                        showToast('warning', 'Time is up! Your exam has been auto-submitted.');
                        navigate('/exam/submitted');
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [currentAttempt, currentTest, navigate, showToast]);

    // Tab visibility detection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && currentAttempt) {
                incrementTabSwitch();
                setShowTabWarning(true);
                showToast('warning', 'Tab switch detected! This activity has been recorded.');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [currentAttempt, incrementTabSwitch, showToast]);

    // Anti-cheating measures
    useEffect(() => {
        if (!currentTest) return;

        const { antiCheating } = currentTest.settings;

        // Disable right-click
        const handleContextMenu = (e: MouseEvent) => {
            if (antiCheating.disableRightClick) {
                e.preventDefault();
                showToast('warning', 'Right-click is disabled during the exam.');
            }
        };

        // Disable copy/paste
        const handleCopyPaste = (e: ClipboardEvent) => {
            if (antiCheating.disableCopyPaste) {
                e.preventDefault();
                showToast('warning', 'Copy/Paste is disabled during the exam.');
            }
        };

        // Disable printing
        const handleKeyDown = (e: KeyboardEvent) => {
            if (antiCheating.disablePrinting && (e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                showToast('warning', 'Printing is disabled during the exam.');
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopyPaste);
        document.addEventListener('paste', handleCopyPaste);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopyPaste);
            document.removeEventListener('paste', handleCopyPaste);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentTest, showToast]);

    // Format time display
    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Get timer color based on remaining time
    const getTimerColor = () => {
        if (timeRemaining === null) return 'text-slate-300';
        if (timeRemaining <= 60) return 'text-danger-400 animate-pulse';
        if (timeRemaining <= 300) return 'text-warning-400';
        return 'text-success-400';
    };

    // Simulate auto-save
    useEffect(() => {
        const saveInterval = setInterval(() => {
            setIsSaving(true);
            setTimeout(() => setIsSaving(false), 1000);
        }, 30000); // Auto-save every 30 seconds

        return () => clearInterval(saveInterval);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Tab Warning Modal */}
            {showTabWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
                    <div className="glass-card p-8 max-w-md text-center animate-scale-in">
                        <AlertTriangle className="w-16 h-16 text-warning-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Tab Switch Detected!</h3>
                        <p className="text-slate-300 mb-6">
                            You have switched away from the exam tab. This activity has been recorded
                            and will be visible to the administrator.
                        </p>
                        <p className="text-sm text-slate-400 mb-6">
                            Tab switches: {currentAttempt?.tabSwitchCount || 0}
                        </p>
                        <button
                            onClick={() => setShowTabWarning(false)}
                            className="gradient-button"
                        >
                            Continue Exam
                        </button>
                    </div>
                </div>
            )}

            {/* Exam Header */}
            <header className="fixed top-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Test Name */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-white truncate max-w-[200px] md:max-w-none">
                            {currentTest?.name || 'Exam'}
                        </span>
                    </div>

                    {/* Center - Timer */}
                    {timeRemaining !== null && (
                        <div className={`flex items-center gap-2 ${getTimerColor()}`}>
                            <Clock className="w-5 h-5" />
                            <span className="font-mono text-lg font-bold">
                                {formatTime(timeRemaining)}
                            </span>
                        </div>
                    )}

                    {/* Right - Auto-save indicator */}
                    <div className="flex items-center gap-4">
                        {isSaving ? (
                            <div className="flex items-center gap-2 text-primary-400">
                                <Save className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Saving...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-success-400">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm hidden md:inline">Auto-saved</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Technical Disclosure Banner */}
            {currentTest?.settings.antiCheating.showTechnicalDisclosure && (
                <div className="fixed top-16 left-0 right-0 z-20 bg-warning-500/10 border-b border-warning-500/20 px-4 py-2">
                    <p className="text-center text-sm text-warning-400">
                        <AlertTriangle className="w-4 h-4 inline mr-2" />
                        This exam session is monitored. Tab switches and copy/paste attempts are recorded.
                    </p>
                </div>
            )}

            {/* Main Content */}
            <main className={`
        pt-16 min-h-screen
        ${currentTest?.settings.antiCheating.showTechnicalDisclosure ? 'pt-28' : 'pt-20'}
      `}>
                <Outlet />
            </main>
        </div>
    );
};

export default ExamLayout;
