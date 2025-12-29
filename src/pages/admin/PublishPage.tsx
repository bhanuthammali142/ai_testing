// ============================================
// Publish & Share Page
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Share2,
    Link2,
    Copy,
    Check,
    ExternalLink,
    Calendar,
    Circle,
    CheckCircle,
    XCircle,
    Clock,
    Globe,
    Mail,
    Key,
    Plus
} from 'lucide-react';
import { useTestStore, useUIStore } from '../../stores';
import { TestStatus } from '../../types';

const PublishPage: React.FC = () => {
    const { currentTest, updateTestStatus, updateTestAlias, syncTestToFirebase } = useTestStore();
    const { showToast } = useUIStore();

    const [urlAlias, setUrlAlias] = useState(currentTest?.urlAlias || '');
    const [copied, setCopied] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Auto-select first test if none selected but tests exist
    const { tests, setCurrentTest } = useTestStore();

    useEffect(() => {
        if (!currentTest && tests.length > 0) {
            setCurrentTest(tests[0]);
        }
    }, [currentTest, tests, setCurrentTest]);

    // Auto-sync to Firebase when test is open
    useEffect(() => {
        const syncIfOpen = async () => {
            if (currentTest && currentTest.status === 'open') {
                try {
                    await syncTestToFirebase(currentTest.id);
                    console.log('✅ Auto-synced open test to Firebase');
                } catch (_error) {
                    console.error('Failed to auto-sync:', _error);
                }
            }
        };
        syncIfOpen();
    }, [currentTest, syncTestToFirebase]);

    // Manual sync function
    const handleManualSync = async () => {
        if (!currentTest) return;
        setIsSyncing(true);
        try {
            await syncTestToFirebase(currentTest.id);
            showToast('success', 'Test synced to cloud successfully!');
        } catch (_error) {
            showToast('error', 'Failed to sync test. Please try again.');
        }
        setIsSyncing(false);
    };

    if (!currentTest) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20 animate-fade-in">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                    <Share2 className="w-10 h-10 text-primary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">No Test Selected</h2>
                <p className="text-slate-400 mb-8">
                    Create a new test or select an existing one from the dashboard to publish and share.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Link
                        to="/admin"
                        className="glass-button flex items-center gap-2"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        to="/admin/questions"
                        className="gradient-button flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Test
                    </Link>
                </div>
            </div>
        );
    }

    const testUrl = `${window.location.origin}/test/${currentTest.urlAlias || currentTest.id}`;

    const statusOptions: { status: TestStatus; label: string; description: string; icon: React.ElementType; color: string }[] = [
        {
            status: 'open',
            label: 'Open',
            description: 'Candidates can take the test',
            icon: CheckCircle,
            color: 'text-success-400 bg-success-500/20 border-success-500/30'
        },
        {
            status: 'closed',
            label: 'Closed',
            description: 'Test is not accessible',
            icon: XCircle,
            color: 'text-danger-400 bg-danger-500/20 border-danger-500/30'
        },
        {
            status: 'scheduled',
            label: 'Scheduled',
            description: 'Opens at a scheduled time',
            icon: Clock,
            color: 'text-warning-400 bg-warning-500/20 border-warning-500/30'
        },
        {
            status: 'draft',
            label: 'Draft',
            description: 'Still being edited',
            icon: Circle,
            color: 'text-slate-400 bg-slate-500/20 border-slate-500/30'
        },
    ];

    const handleStatusChange = async (status: TestStatus) => {
        updateTestStatus(currentTest.id, status);

        // Sync to Firebase when publishing (status = 'open')
        if (status === 'open') {
            await syncTestToFirebase(currentTest.id);
        }

        showToast('success', `Test status changed to ${status}`);
    };

    const handleAliasChange = () => {
        if (urlAlias.trim()) {
            // Simple validation - alphanumeric and hyphens only
            const validAlias = urlAlias.toLowerCase().replace(/[^a-z0-9-]/g, '-');
            updateTestAlias(currentTest.id, validAlias);
            setUrlAlias(validAlias);
            showToast('success', 'URL alias updated');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(testUrl);
        setCopied(true);
        showToast('success', 'Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const getAccessIcon = () => {
        switch (currentTest.settings.accessControl.accessType) {
            case 'public':
                return <Globe className="w-5 h-5 text-success-400" />;
            case 'passcode':
                return <Key className="w-5 h-5 text-warning-400" />;
            case 'email':
                return <Mail className="w-5 h-5 text-primary-400" />;
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            {/* Status Section */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-primary-400" />
                    Test Status
                </h2>
                <p className="text-slate-400 mb-6">Control whether candidates can access your test</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {statusOptions.map((option) => {
                        const Icon = option.icon;
                        const isActive = currentTest.status === option.status;
                        return (
                            <button
                                key={option.status}
                                onClick={() => handleStatusChange(option.status)}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${isActive
                                    ? option.color
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-6 h-6 ${isActive ? '' : 'text-slate-500'}`} />
                                    <div>
                                        <p className={`font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                            {option.label}
                                        </p>
                                        <p className={`text-sm ${isActive ? 'opacity-80' : 'text-slate-500'}`}>
                                            {option.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Sync to Cloud Button */}
                {currentTest.status === 'open' && (
                    <div className="mt-4 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">Sync to Cloud</p>
                                <p className="text-sm text-slate-400">
                                    Make this test visible to all students
                                </p>
                            </div>
                            <button
                                onClick={handleManualSync}
                                disabled={isSyncing}
                                className="gradient-button flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSyncing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Syncing...
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="w-4 h-4" />
                                        Sync Now
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Schedule Info */}
                {currentTest.status === 'scheduled' && (
                    <div className="mt-4 p-4 bg-warning-500/10 border border-warning-500/20 rounded-xl">
                        <div className="flex items-center gap-2 text-warning-400 mb-2">
                            <Calendar className="w-5 h-5" />
                            <span className="font-medium">Schedule Settings</span>
                        </div>
                        <p className="text-sm text-slate-400">
                            Configure the schedule in the Settings page under Access Control.
                        </p>
                    </div>
                )}
            </div>

            {/* Share Link Section */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-primary-400" />
                    Share Link
                </h2>
                <p className="text-slate-400 mb-6">Share this link with your candidates</p>

                {/* URL Display */}
                <div className="flex gap-3 mb-6">
                    <div className="flex-1 p-4 bg-slate-800 rounded-xl border border-white/10 font-mono text-sm text-primary-300 overflow-x-auto">
                        {testUrl}
                    </div>
                    <button
                        onClick={copyToClipboard}
                        className={`px-4 rounded-xl transition-all flex items-center gap-2 ${copied
                            ? 'bg-success-500 text-white'
                            : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                </div>

                {/* Custom Alias */}
                <div className="mb-6">
                    <label className="input-label">Custom URL Alias</label>
                    <div className="flex gap-3">
                        <div className="flex-1 flex items-center">
                            <span className="text-slate-500 text-sm mr-2">{window.location.origin}/test/</span>
                            <input
                                type="text"
                                value={urlAlias}
                                onChange={(e) => setUrlAlias(e.target.value.toLowerCase())}
                                className="input-field flex-1"
                                placeholder="my-custom-url"
                            />
                        </div>
                        <button
                            onClick={handleAliasChange}
                            className="glass-button"
                        >
                            Update
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        Use lowercase letters, numbers, and hyphens only
                    </p>
                </div>

                {/* Preview Link */}
                <a
                    href={testUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
                >
                    <ExternalLink className="w-4 h-4" />
                    Preview Test Page
                </a>
            </div>

            {/* Access Info */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-4">Access Configuration</h2>

                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    {getAccessIcon()}
                    <div>
                        <p className="text-white font-medium capitalize">
                            {currentTest.settings.accessControl.accessType} Access
                        </p>
                        <p className="text-sm text-slate-400">
                            {currentTest.settings.accessControl.accessType === 'public' && 'Anyone with the link can take this test'}
                            {currentTest.settings.accessControl.accessType === 'passcode' &&
                                `Passcode required: ${currentTest.settings.accessControl.passcode || 'Not set'}`}
                            {currentTest.settings.accessControl.accessType === 'email' &&
                                `${(currentTest.settings.accessControl.allowedEmails || []).length} email(s) allowed`}
                        </p>
                    </div>
                </div>

                {currentTest.settings.accessControl.timeLimitMinutes && (
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl mt-3">
                        <Clock className="w-5 h-5 text-accent-400" />
                        <div>
                            <p className="text-white font-medium">Time Limited</p>
                            <p className="text-sm text-slate-400">
                                {currentTest.settings.accessControl.timeLimitMinutes} minutes per attempt
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Share Instructions */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-4">Share Instructions</h2>

                <div className="space-y-4 text-slate-300">
                    <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                        <p>Copy the test link above and share it with your candidates via email, LMS, or messaging app.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                        <p>
                            {currentTest.settings.accessControl.accessType === 'passcode'
                                ? 'Share the passcode separately for added security.'
                                : currentTest.settings.accessControl.accessType === 'email'
                                    ? 'Only candidates whose emails are on the allowed list can access.'
                                    : 'Anyone with the link can access the test.'}
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                        <p>Monitor results in real-time from the Results dashboard.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublishPage;
