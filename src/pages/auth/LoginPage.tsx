// ============================================
// Login Page - Google OAuth + Email/Password
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    GraduationCap,
    Sparkles,
    Shield,
    BarChart3,
    Zap,
    LogIn,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { useUserAuthStore, useUIStore } from '../../stores';
import { AuthUser } from '../../types';

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

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { signInWithGoogle, setUser, user, isAuthenticated, isLoading, error, clearError } = useUserAuthStore();
    const { showToast } = useUIStore();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isEmailLoading, setIsEmailLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            // Check email verification status for email/password users
            const firebaseUser = auth.currentUser;
            if (firebaseUser && !firebaseUser.emailVerified && firebaseUser.providerData[0]?.providerId === 'password') {
                navigate('/verify-email');
            } else if (!user.photoURL) {
                // Need to capture profile picture
                navigate('/capture-photo');
            } else if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        }
    }, [isAuthenticated, user, navigate]);

    // Show error toast
    useEffect(() => {
        if (error) {
            showToast('error', error);
            clearError();
        }
    }, [error, showToast, clearError]);

    const handleGoogleSignIn = async () => {
        setIsSigningIn(true);
        try {
            const success = await signInWithGoogle();
            if (success) {
                showToast('success', 'Welcome to TestExam!');
            }
        } catch (error) {
            console.error('Sign in error:', error);
        } finally {
            setIsSigningIn(false);
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        }
        if (!formData.password) {
            errors.password = 'Password is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsEmailLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            const firebaseUser = userCredential.user;

            // Check email verification
            if (!firebaseUser.emailVerified) {
                showToast('info', 'Please verify your email before logging in.');
                navigate('/verify-email');
                return;
            }

            // Get user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

            if (userDoc.exists()) {
                const userData = userDoc.data();
                const authUser: AuthUser = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    name: userData.name || firebaseUser.displayName || 'User',
                    role: userData.role || 'user',
                    photoURL: userData.photoURL || null,
                    createdAt: userData.createdAt?.toDate?.() || new Date(),
                };

                setUser(authUser);
                showToast('success', 'Welcome back!');
            } else {
                showToast('error', 'User profile not found. Please register first.');
            }
        } catch (error: any) {
            console.error('Email login error:', error);
            if (error.code === 'auth/user-not-found') {
                showToast('error', 'No account found with this email.');
            } else if (error.code === 'auth/wrong-password') {
                showToast('error', 'Incorrect password.');
            } else if (error.code === 'auth/invalid-credential') {
                showToast('error', 'Invalid email or password.');
            } else {
                showToast('error', 'Login failed. Please try again.');
            }
        } finally {
            setIsEmailLoading(false);
        }
    };

    const features = [
        {
            icon: Sparkles,
            title: 'AI Question Generation',
            description: 'Generate questions instantly using AI.',
        },
        {
            icon: Shield,
            title: 'Anti-Cheating Controls',
            description: 'Prevent cheating with advanced monitoring.',
        },
        {
            icon: BarChart3,
            title: 'Rich Analytics',
            description: 'View detailed statistics and reports.',
        },
        {
            icon: Zap,
            title: 'Instant Access',
            description: 'Sign in with Google and get started.',
        },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary-500/20 via-accent-500/10 to-transparent rounded-full blur-3xl" />
                    <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent-500/20 via-primary-500/10 to-transparent rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold font-display text-white">TestExam</h1>
                    </div>

                    {/* Tagline */}
                    <h2 className="text-4xl xl:text-5xl font-bold font-display mb-6">
                        <span className="text-white">Professional</span>
                        <br />
                        <span className="text-gradient">Online Exams</span>
                    </h2>

                    <p className="text-xl text-slate-400 mb-12 max-w-md">
                        Create, share, and analyze online tests with ease. The simplest exam platform for educators and students.
                    </p>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-4">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-5 h-5 text-primary-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium text-sm">{feature.title}</h3>
                                        <p className="text-slate-500 text-xs">{feature.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-950 relative overflow-y-auto">
                {/* Background decoration for mobile */}
                <div className="absolute inset-0 overflow-hidden lg:hidden">
                    <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary-500/20 via-accent-500/10 to-transparent rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                <GraduationCap className="w-7 h-7 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold font-display text-white">TestExam</h1>
                        </div>
                    </div>

                    {/* Login Card */}
                    <div className="glass-card p-8">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                                <LogIn className="w-8 h-8 text-primary-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                            <p className="text-slate-400">
                                Sign in to access your account
                            </p>
                        </div>

                        {/* Google Sign In Button */}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isSigningIn || isLoading}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSigningIn || isLoading ? (
                                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <GoogleIcon />
                            )}
                            <span>{isSigningIn || isLoading ? 'Signing in...' : 'Continue with Google'}</span>
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-sm text-slate-500">or sign in with email</span>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>

                        {/* Email/Password Form */}
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div>
                                <label className="input-label flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className={`input-field ${formErrors.email ? 'border-danger-500' : ''}`}
                                    placeholder="you@example.com"
                                />
                                {formErrors.email && <p className="text-xs text-danger-400 mt-1">{formErrors.email}</p>}
                            </div>

                            <div>
                                <label className="input-label flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className={`input-field pr-12 ${formErrors.password ? 'border-danger-500' : ''}`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {formErrors.password && <p className="text-xs text-danger-400 mt-1">{formErrors.password}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isEmailLoading}
                                className="w-full gradient-button flex items-center justify-center gap-2 py-3"
                            >
                                {isEmailLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <LogIn className="w-5 h-5" />
                                )}
                                {isEmailLoading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        {/* Info Cards */}
                        <div className="space-y-3 mt-6">
                            <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl">
                                <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-primary-400" />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">For Students</p>
                                    <p className="text-slate-400 text-xs">Access your assigned exams and track your progress</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl">
                                <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-4 h-4 text-accent-400" />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">For Admins</p>
                                    <p className="text-slate-400 text-xs">Create exams, manage students, and view analytics</p>
                                </div>
                            </div>
                        </div>

                        {/* Register Link */}
                        <p className="mt-6 text-center text-slate-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
                                Create one
                            </Link>
                        </p>
                    </div>

                    {/* Footer */}
                    <p className="mt-8 text-center text-sm text-slate-500">
                        © 2024 TestExam. Built for educators and students.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
