// ============================================
// Register Page - Photo Capture + Email/Password Registration
// ============================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    GraduationCap,
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    Camera,
    RotateCcw,
    AlertCircle
} from 'lucide-react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { useUserAuthStore, useUIStore } from '../../stores';

// Google Icon Component
const GoogleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

type RegistrationStep = 'photo' | 'details' | 'complete';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { signInWithGoogle, user, isAuthenticated } = useUserAuthStore();
    const { showToast } = useUIStore();

    // Step management
    const [currentStep, setCurrentStep] = useState<RegistrationStep>('photo');

    // Photo capture state
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        }
    }, [isAuthenticated, user, navigate]);

    // Initialize camera when on photo step
    useEffect(() => {
        let currentStream: MediaStream | null = null;
        const startCameraLocal = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: 'user'
                    }
                });
                currentStream = mediaStream;
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    videoRef.current.onloadedmetadata = () => {
                        setIsCameraReady(true);
                    };
                }
                setCameraError(null);
            } catch (error) {
                const err = error as Error;
                console.error('Camera error:', err);
                if (err.name === 'NotAllowedError') {
                    setCameraError('Camera access denied. Please allow camera access to take your profile photo.');
                } else if (err.name === 'NotFoundError') {
                    setCameraError('No camera found. Please connect a camera and try again.');
                } else {
                    setCameraError('Failed to access camera. Please check your camera settings.');
                }
            }
        };

        if (currentStep === 'photo' && !capturedImage) {
            startCameraLocal();
        }
        return () => {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [currentStep, capturedImage]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.onloadedmetadata = () => {
                    setIsCameraReady(true);
                };
            }
            setCameraError(null);
        } catch (error) {
            const err = error as Error;
            console.error('Camera error:', err);
            if (err.name === 'NotAllowedError') {
                setCameraError('Camera access denied. Please allow camera access to take your profile photo.');
            } else if (err.name === 'NotFoundError') {
                setCameraError('No camera found. Please connect a camera and try again.');
            } else {
                setCameraError('Failed to access camera. Please check your camera settings.');
            }
        }
    };

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Mirror for selfie effect
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);

        // Stop camera after capture
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }, [stream]);

    const retakePhoto = useCallback(() => {
        setCapturedImage(null);
        setIsCameraReady(false);
        startCamera();
    }, []);

    const proceedToDetails = () => {
        if (!capturedImage) {
            showToast('error', 'Please take a photo first');
            return;
        }
        setCurrentStep('details');
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (!capturedImage) {
            showToast('error', 'Please take a photo first');
            setCurrentStep('photo');
            return;
        }

        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            const firebaseUser = userCredential.user;

            // Send verification email
            await sendEmailVerification(firebaseUser);

            // Create user document with photo
            await setDoc(doc(db, 'users', firebaseUser.uid), {
                name: formData.name,
                email: formData.email,
                role: 'user',
                photoURL: capturedImage, // Save captured photo
                emailVerified: false,
                createdAt: serverTimestamp(),
            });

            setCurrentStep('complete');
            showToast('success', 'Registration successful! Please verify your email.');

        } catch (error) {
            const err = error as any; // Using any for Firebase error codes briefly
            console.error('Registration error:', err);
            if (err.code === 'auth/email-already-in-use') {
                showToast('error', 'This email is already registered. Please login instead.');
            } else if (err.code === 'auth/weak-password') {
                showToast('error', 'Password is too weak. Please use a stronger password.');
            } else if (err.code === 'auth/operation-not-allowed') {
                showToast('error', 'Email/Password registration is not enabled. Please enable it in Firebase Console.');
            } else {
                showToast('error', err.message || 'Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        if (!capturedImage) {
            showToast('error', 'Please take a photo first before signing up');
            return;
        }

        setIsGoogleLoading(true);
        try {
            const success = await signInWithGoogle();
            if (success) {
                // Update the user's photo with captured image
                const firebaseUser = auth.currentUser;
                if (firebaseUser) {
                    await setDoc(doc(db, 'users', firebaseUser.uid), {
                        photoURL: capturedImage,
                    }, { merge: true });
                }
                showToast('success', 'Welcome to TestExam!');
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    // Step 1: Photo Capture
    if (currentStep === 'photo') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary-500/20 via-accent-500/10 to-transparent rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 w-full max-w-lg">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                <GraduationCap className="w-7 h-7 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold font-display text-white">TestExam</h1>
                        </Link>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">1</div>
                            <span className="text-white text-sm font-medium">Photo</span>
                        </div>
                        <div className="w-8 h-px bg-slate-700" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold text-sm">2</div>
                            <span className="text-slate-400 text-sm">Details</span>
                        </div>
                    </div>

                    {/* Photo Capture Card */}
                    <div className="glass-card p-8">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">Take Your Photo</h2>
                            <p className="text-slate-400">
                                This photo will be used as your profile picture during exams
                            </p>
                        </div>

                        {/* Camera View */}
                        <div className="relative aspect-[4/3] bg-slate-800 rounded-xl overflow-hidden mb-6">
                            {cameraError ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                    <AlertCircle className="w-12 h-12 text-danger-400 mb-4" />
                                    <p className="text-slate-300 mb-4">{cameraError}</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="glass-button text-sm"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : capturedImage ? (
                                <img
                                    src={capturedImage}
                                    alt="Captured"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                        style={{ transform: 'scaleX(-1)' }}
                                    />
                                    {!isCameraReady && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                                            <div className="text-center">
                                                <Camera className="w-12 h-12 text-slate-500 mx-auto mb-2 animate-pulse" />
                                                <p className="text-slate-400">Starting camera...</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Face guide overlay */}
                            {!capturedImage && isCameraReady && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-40 h-52 border-2 border-dashed border-white/30 rounded-[50%]" />
                                </div>
                            )}
                        </div>

                        <canvas ref={canvasRef} className="hidden" />

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {capturedImage ? (
                                <>
                                    <button
                                        onClick={proceedToDetails}
                                        className="w-full gradient-button flex items-center justify-center gap-2"
                                    >
                                        Continue to Registration
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={retakePhoto}
                                        className="w-full glass-button flex items-center justify-center gap-2"
                                    >
                                        <RotateCcw className="w-5 h-5" />
                                        Retake Photo
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={capturePhoto}
                                    disabled={!isCameraReady || !!cameraError}
                                    className="w-full gradient-button flex items-center justify-center gap-2"
                                >
                                    <Camera className="w-5 h-5" />
                                    Capture Photo
                                </button>
                            )}
                        </div>

                        {/* Tips */}
                        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl">
                            <p className="text-sm text-slate-400">
                                <strong className="text-white">Tips for a good photo:</strong>
                            </p>
                            <ul className="text-xs text-slate-500 mt-2 space-y-1">
                                <li>• Make sure your face is clearly visible</li>
                                <li>• Find good lighting (face the light source)</li>
                                <li>• Remove sunglasses or hats</li>
                            </ul>
                        </div>

                        {/* Login Link */}
                        <p className="mt-6 text-center text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Step 2: Registration Details
    if (currentStep === 'details') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
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

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-success-500 flex items-center justify-center text-white">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <span className="text-success-400 text-sm font-medium">Photo</span>
                        </div>
                        <div className="w-8 h-px bg-primary-500" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">2</div>
                            <span className="text-white text-sm font-medium">Details</span>
                        </div>
                    </div>

                    {/* Register Card */}
                    <div className="glass-card p-8">
                        {/* Photo Preview */}
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <img
                                    src={capturedImage || ''}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-primary-500/30"
                                />
                                <button
                                    onClick={() => setCurrentStep('photo')}
                                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors"
                                    title="Change photo"
                                >
                                    <Camera className="w-4 h-4 text-slate-300" />
                                </button>
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">Complete Registration</h2>
                            <p className="text-slate-400">
                                Enter your details to create your account
                            </p>
                        </div>

                        {/* Google Sign Up */}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isGoogleLoading}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                        >
                            {isGoogleLoading ? (
                                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <GoogleIcon />
                            )}
                            <span>{isGoogleLoading ? 'Signing up...' : 'Sign up with Google'}</span>
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-sm text-slate-500">or register with email</span>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>

                        {/* Registration Form */}
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="input-label flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`input-field ${errors.name ? 'border-danger-500' : ''}`}
                                    placeholder="John Doe"
                                />
                                {errors.name && <p className="text-xs text-danger-400 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="input-label flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className={`input-field ${errors.email ? 'border-danger-500' : ''}`}
                                    placeholder="you@example.com"
                                />
                                {errors.email && <p className="text-xs text-danger-400 mt-1">{errors.email}</p>}
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
                                        className={`input-field pr-12 ${errors.password ? 'border-danger-500' : ''}`}
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
                                {errors.password && <p className="text-xs text-danger-400 mt-1">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="input-label flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className={`input-field ${errors.confirmPassword ? 'border-danger-500' : ''}`}
                                    placeholder="••••••••"
                                />
                                {errors.confirmPassword && <p className="text-xs text-danger-400 mt-1">{errors.confirmPassword}</p>}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep('photo')}
                                    className="glass-button flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 gradient-button flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Create Account
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Login Link */}
                        <p className="mt-6 text-center text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Step 3: Registration Complete
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
            <div className="w-full max-w-md">
                <div className="glass-card p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success-500/20 flex items-center justify-center">
                        <CheckCircle className="w-10 h-10 text-success-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
                    <p className="text-slate-400 mb-6">
                        We've sent a verification link to <strong className="text-white">{formData.email}</strong>.
                        Please click the link to verify your email address.
                    </p>
                    <div className="space-y-3">
                        <Link
                            to="/login"
                            className="block w-full gradient-button text-center"
                        >
                            Go to Login
                        </Link>
                        <button
                            onClick={() => {
                                setCapturedImage(null);
                                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                                setCurrentStep('photo');
                            }}
                            className="block w-full glass-button text-center"
                        >
                            Register Another Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
