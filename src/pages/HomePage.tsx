// ============================================
// Home Page - Create or Access Test
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    GraduationCap,
    Plus,
    LogIn,
    Sparkles,
    Shield,
    BarChart3,
    Zap,
    ArrowRight,
    Lock
} from 'lucide-react';
import { useTestStore, useAuthStore, useUIStore } from '../stores';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { createTest, tests } = useTestStore();
    const { login } = useAuthStore();
    const { showToast } = useUIStore();

    const [mode, setMode] = useState<'landing' | 'create' | 'access'>('landing');
    const [testName, setTestName] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [testUrl, setTestUrl] = useState('');
    const [accessPassword, setAccessPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateTest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testName.trim() || !adminPassword.trim()) {
            showToast('error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const newTest = createTest(testName, adminPassword);
            login(newTest.id, adminPassword);
            showToast('success', 'Test created successfully!');
            navigate('/admin/dashboard');
        } catch (error) {
            showToast('error', 'Failed to create test');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccessTest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testUrl.trim() || !accessPassword.trim()) {
            showToast('error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            // Find test by URL or ID
            const test = tests.find(
                t => t.id === testUrl || t.urlAlias === testUrl || t.name.toLowerCase().includes(testUrl.toLowerCase())
            );

            if (!test) {
                showToast('error', 'Test not found');
                setIsLoading(false);
                return;
            }

            if (login(test.id, accessPassword)) {
                showToast('success', 'Access granted!');
                navigate('/admin/dashboard');
            } else {
                showToast('error', 'Invalid password');
            }
        } catch (error) {
            showToast('error', 'Failed to access test');
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        {
            icon: Sparkles,
            title: 'AI Question Generation',
            description: 'Generate questions instantly using AI, then review and customize.',
        },
        {
            icon: Shield,
            title: 'Anti-Cheating Controls',
            description: 'Disable copy/paste, right-click, and monitor tab switches.',
        },
        {
            icon: BarChart3,
            title: 'Rich Analytics',
            description: 'View detailed statistics, score distributions, and export reports.',
        },
        {
            icon: Zap,
            title: 'Instant Setup',
            description: 'Create a test in seconds. No signup required.',
        },
    ];

    if (mode === 'landing') {
        return (
            <div className="min-h-screen">
                {/* Hero Section */}
                <div className="relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary-500/20 via-accent-500/10 to-transparent rounded-full blur-3xl" />
                        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent-500/20 via-primary-500/10 to-transparent rounded-full blur-3xl" />
                    </div>

                    <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32">
                        {/* Logo */}
                        <div className="flex justify-center mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                                    <GraduationCap className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-4xl font-bold font-display text-white">TestExam</h1>
                            </div>
                        </div>

                        {/* Tagline */}
                        <h2 className="text-4xl md:text-6xl font-bold font-display text-center mb-6">
                            <span className="text-white">Create Professional</span>
                            <br />
                            <span className="text-gradient">Online Exams</span>
                        </h2>

                        <p className="text-xl text-slate-400 text-center max-w-2xl mx-auto mb-12">
                            The simplest way to create, share, and analyze online tests. No signup required.
                            Just create and share.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => setMode('create')}
                                className="gradient-button text-lg px-8 py-4 flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Create a Test
                            </button>
                            <button
                                onClick={() => setMode('access')}
                                className="glass-button text-lg px-8 py-4 flex items-center justify-center gap-2"
                            >
                                <LogIn className="w-5 h-5" />
                                Access Existing Test
                            </button>
                        </div>

                        {/* Demo link */}
                        <p className="text-center mt-8 text-slate-500">
                            Try with demo: Test ID <code className="text-primary-400">test-001</code>, Password <code className="text-primary-400">admin123</code>
                        </p>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="max-w-6xl mx-auto px-4 py-20">
                    <h3 className="section-title text-center mb-12">Powerful Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="glass-card-hover p-6 text-center"
                                >
                                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                                        <Icon className="w-7 h-7 text-primary-400" />
                                    </div>
                                    <h4 className="card-title mb-2">{feature.title}</h4>
                                    <p className="text-slate-400 text-sm">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <footer className="border-t border-white/5 py-8">
                    <p className="text-center text-slate-500 text-sm">
                        © 2024 TestExam. Built for educators and organizations.
                    </p>
                </footer>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary-500/20 via-accent-500/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent-500/20 via-primary-500/10 to-transparent rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={() => setMode('landing')}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <GraduationCap className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold font-display text-white">TestExam</h1>
                    </button>
                </div>

                {/* Form Card */}
                <div className="glass-card p-8">
                    <h2 className="text-2xl font-bold text-white text-center mb-2">
                        {mode === 'create' ? 'Create a New Test' : 'Access Your Test'}
                    </h2>
                    <p className="text-slate-400 text-center mb-8">
                        {mode === 'create'
                            ? 'Set up your test name and admin password'
                            : 'Enter your test URL and admin password'
                        }
                    </p>

                    <form onSubmit={mode === 'create' ? handleCreateTest : handleAccessTest}>
                        {mode === 'create' ? (
                            <>
                                <div className="mb-4">
                                    <label className="input-label">Test Name</label>
                                    <input
                                        type="text"
                                        value={testName}
                                        onChange={(e) => setTestName(e.target.value)}
                                        placeholder="e.g., JavaScript Fundamentals"
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="input-label">Admin Password</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={adminPassword}
                                            onChange={(e) => setAdminPassword(e.target.value)}
                                            placeholder="Choose a secure password"
                                            className="input-field pr-12"
                                            required
                                        />
                                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        You'll need this password to access admin features
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <label className="input-label">Test URL or ID</label>
                                    <input
                                        type="text"
                                        value={testUrl}
                                        onChange={(e) => setTestUrl(e.target.value)}
                                        placeholder="e.g., test-001 or js-fundamentals"
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="input-label">Admin Password</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={accessPassword}
                                            onChange={(e) => setAccessPassword(e.target.value)}
                                            placeholder="Your admin password"
                                            className="input-field pr-12"
                                            required
                                        />
                                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full gradient-button flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <>
                                    {mode === 'create' ? 'Create Test' : 'Access Test'}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Mode */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setMode(mode === 'create' ? 'access' : 'create')}
                            className="text-primary-400 hover:text-primary-300 transition-colors text-sm"
                        >
                            {mode === 'create'
                                ? 'Already have a test? Access it here'
                                : 'Need to create a new test?'
                            }
                        </button>
                    </div>
                </div>

                {/* Back to home */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => setMode('landing')}
                        className="text-slate-400 hover:text-white transition-colors text-sm"
                    >
                        ← Back to home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
