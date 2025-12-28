// ============================================
// Photo Capture Page - Profile Picture via Webcam
// ============================================

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Camera,
    RotateCcw,
    Check,
    GraduationCap,
    AlertCircle
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { useUserAuthStore, useUIStore } from '../../stores';

const CapturePhotoPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useUserAuthStore();
    const { showToast } = useUIStore();

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);

    // Initialize camera
    useEffect(() => {
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
            } catch (error: any) {
                console.error('Camera error:', error);
                if (error.name === 'NotAllowedError') {
                    setCameraError('Camera access denied. Please allow camera access to take your profile photo.');
                } else if (error.name === 'NotFoundError') {
                    setCameraError('No camera found. Please connect a camera and try again.');
                } else {
                    setCameraError('Failed to access camera. Please check your camera settings.');
                }
            }
        };

        startCamera();

        // Cleanup
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Stop camera when image is captured
    useEffect(() => {
        if (capturedImage && stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }, [capturedImage, stream]);

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the video frame to canvas (mirror it for selfie effect)
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
    }, []);

    const retakePhoto = useCallback(async () => {
        setCapturedImage(null);
        setIsCameraReady(false);

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
        } catch (error) {
            console.error('Failed to restart camera:', error);
        }
    }, []);

    const savePhoto = async () => {
        if (!capturedImage || !user) return;

        setIsLoading(true);
        try {
            // Save photo to Firestore (as base64)
            // Note: For production, you'd want to use Firebase Storage instead
            await updateDoc(doc(db, 'users', user.id), {
                photoURL: capturedImage,
                photoUpdatedAt: new Date().toISOString(),
            });

            // Refresh user data
            if (refreshUser) {
                await refreshUser();
            }

            showToast('success', 'Profile photo saved successfully!');

            // Redirect based on role
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Failed to save photo:', error);
            showToast('error', 'Failed to save photo. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Check if user should be on this page
    useEffect(() => {
        if (!auth.currentUser) {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
            {/* Background decoration */}
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

                {/* Capture Card */}
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
                                <div className="w-48 h-60 border-2 border-dashed border-white/30 rounded-[50%]" />
                            </div>
                        )}
                    </div>

                    {/* Hidden canvas for capture */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {capturedImage ? (
                            <>
                                <button
                                    onClick={savePhoto}
                                    disabled={isLoading}
                                    className="w-full gradient-button flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Check className="w-5 h-5" />
                                    )}
                                    {isLoading ? 'Saving...' : 'Use This Photo'}
                                </button>
                                <button
                                    onClick={retakePhoto}
                                    disabled={isLoading}
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
                            <li>• Keep a neutral background</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CapturePhotoPage;
