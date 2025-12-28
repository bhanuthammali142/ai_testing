// ============================================
// Home Page - Landing with Google Login
// ============================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    GraduationCap,
    LogIn,
    Sparkles,
    Shield,
    BarChart3,
    Zap,
    ArrowRight,
    Users,
    CheckCircle
} from 'lucide-react';
import { useUserAuthStore, useUIStore } from '../stores';

// Google Icon Component
const GoogleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24">
        <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
    </svg>
);

const HomePage: React.FC = () => {
    const { signInWithGoogle, isLoading } = useUserAuthStore();
    const { showToast } = useUIStore();

    const [isSigningIn, setIsSigningIn] = useState(false);


    const handleGoogleSignIn = async () => {
        setIsSigningIn(true);
        try {
            const success = await signInWithGoogle();
            if (success) {
                showToast('success', 'Welcome to TestExam!');
                // Redirect is handled by AuthRedirect in App.tsx
            }
        } catch (error) {
            console.error('Sign in error:', error);
        } finally {
            setIsSigningIn(false);
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
            description: 'Sign in with Google and create your first test in minutes.',
        },
    ];

    const steps = [
        {
            number: '01',
            title: 'Sign In',
            description: 'Login with your Google account - no signup required',
        },
        {
            number: '02',
            title: 'Create Exam',
            description: 'Add questions manually or use AI to generate them',
        },
        {
            number: '03',
            title: 'Publish',
            description: 'Assign exam to students and they can start immediately',
        },
    ];

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
                        The simplest way to create, share, and analyze online tests.
                        Sign in with Google and get started in seconds.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isSigningIn || isLoading}
                            className="flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[280px]"
                        >
                            {isSigningIn || isLoading ? (
                                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <GoogleIcon />
                            )}
                            <span>{isSigningIn || isLoading ? 'Signing in...' : 'Sign in with Google'}</span>
                        </button>
                        <Link
                            to="/login"
                            className="glass-button text-lg px-8 py-4 flex items-center justify-center gap-2"
                        >
                            <LogIn className="w-5 h-5" />
                            Login
                        </Link>
                    </div>

                    {/* Social Proof */}
                    <div className="flex flex-wrap justify-center items-center gap-6 mt-12 text-slate-400">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary-400" />
                            <span>Used by educators worldwide</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-success-400" />
                            <span>Free to get started</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* How it Works */}
            <div className="max-w-6xl mx-auto px-4 py-20">
                <h3 className="section-title text-center mb-4">How It Works</h3>
                <p className="text-center text-slate-400 mb-12 max-w-xl mx-auto">
                    Get your online exam up and running in three simple steps
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="relative">
                            <div className="glass-card p-6 text-center h-full">
                                <div className="text-5xl font-bold text-gradient mb-4">{step.number}</div>
                                <h4 className="card-title mb-2">{step.title}</h4>
                                <p className="text-slate-400">{step.description}</p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                                    <ArrowRight className="w-8 h-8 text-primary-400" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-6xl mx-auto px-4 py-20 border-t border-white/5">
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

            {/* CTA Section */}
            <div className="max-w-4xl mx-auto px-4 py-20">
                <div className="glass-card p-8 md:p-12 text-center bg-gradient-to-r from-primary-500/10 to-accent-500/10">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to Get Started?
                    </h3>
                    <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                        Sign in with Google and create your first exam in minutes.
                        No credit card required.
                    </p>
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isSigningIn || isLoading}
                        className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSigningIn || isLoading ? (
                            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <GoogleIcon />
                        )}
                        <span>{isSigningIn || isLoading ? 'Signing in...' : 'Get Started with Google'}</span>
                    </button>
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
};

export default HomePage;
