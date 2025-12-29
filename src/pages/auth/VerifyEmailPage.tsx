// ============================================
// Email Verification Page
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Mail,
    CheckCircle,
    RefreshCw,
    GraduationCap
} from 'lucide-react';
import { sendEmailVerification, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useUIStore } from '../../stores';

const VerifyEmailPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useUIStore();

    const [email, setEmail] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                // No user logged in, redirect to login
                navigate('/login');
                return;
            }

            setEmail(user.email || '');

            // Reload user to check verification status
            await user.reload();

            if (user.emailVerified) {
                showToast('success', 'Email verified successfully!');
                navigate('/capture-photo');
            }
        });

        return () => unsubscribe();
    }, [navigate, showToast]);

    // Countdown timer for resend button
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleResendEmail = async () => {
        const user = auth.currentUser;
        if (!user) return;

        setIsResending(true);
        try {
            await sendEmailVerification(user);
            showToast('success', 'Verification email sent! Please check your inbox.');
            setCountdown(60); // 60 second cooldown
        } catch (error) {
            const err = error as any;
            console.error('Error sending verification email:', err);
            if (err.code === 'auth/too-many-requests') {
                showToast('error', 'Too many requests. Please try again later.');
            } else {
                showToast('error', 'Failed to send verification email. Please try again.');
            }
        } finally {
            setIsResending(false);
        }
    };

    const handleCheckVerification = async () => {
        const user = auth.currentUser;
        if (!user) return;

        setIsChecking(true);
        try {
            await user.reload();
            if (user.emailVerified) {
                showToast('success', 'Email verified successfully!');
                navigate('/capture-photo');
            } else {
                showToast('info', 'Email not verified yet. Please check your inbox.');
            }
        } catch (_error) {
            console.error('Error checking verification:', _error);
            showToast('error', 'Failed to check verification status.');
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary-500/20 via-accent-500/10 to-transparent rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <GraduationCap className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold font-display text-white">TestExam</h1>
                    </Link>
                </div>

                {/* Verification Card */}
                <div className="glass-card p-8 text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <Mail className="w-10 h-10 text-primary-400" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-3">Verify Your Email</h2>

                    <p className="text-slate-400 mb-6">
                        We've sent a verification link to{' '}
                        <strong className="text-white">{email}</strong>.
                        Please click the link in the email to verify your account.
                    </p>

                    {/* Instructions */}
                    <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
                        <p className="text-sm text-slate-300 mb-2 font-medium">Didn't receive the email?</p>
                        <ul className="text-xs text-slate-400 space-y-1">
                            <li>• Check your spam or junk folder</li>
                            <li>• Make sure you entered the correct email</li>
                            <li>• Wait a few minutes and try again</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {/* Check Verification Button */}
                        <button
                            onClick={handleCheckVerification}
                            disabled={isChecking}
                            className="w-full gradient-button flex items-center justify-center gap-2"
                        >
                            {isChecking ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <CheckCircle className="w-5 h-5" />
                            )}
                            {isChecking ? 'Checking...' : 'I\'ve Verified My Email'}
                        </button>

                        {/* Resend Button */}
                        <button
                            onClick={handleResendEmail}
                            disabled={isResending || countdown > 0}
                            className="w-full glass-button flex items-center justify-center gap-2"
                        >
                            {isResending ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <Mail className="w-5 h-5" />
                            )}
                            {countdown > 0
                                ? `Resend in ${countdown} s`
                                : isResending
                                    ? 'Sending...'
                                    : 'Resend Verification Email'
                            }
                        </button>
                    </div>

                    {/* Back to Login */}
                    <p className="mt-6 text-sm text-slate-500">
                        Wrong email?{' '}
                        <Link to="/login" className="text-primary-400 hover:text-primary-300">
                            Sign in with different account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
