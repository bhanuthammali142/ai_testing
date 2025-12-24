// ============================================
// Loading Spinner & Skeleton Components
// ============================================

import React from 'react';

// Loading Spinner
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
    size = 'md',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div
            className={`
        ${sizeClasses[size]}
        border-primary-500/30 border-t-primary-500
        rounded-full animate-spin
        ${className}
      `}
        />
    );
};

// Full Page Loading
export const FullPageLoader: React.FC<{ message?: string }> = ({
    message = 'Loading...'
}) => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
            <Spinner size="lg" />
            <p className="mt-4 text-slate-300 animate-pulse">{message}</p>
        </div>
    );
};

// Skeleton Line
export const SkeletonLine: React.FC<{ className?: string; width?: string }> = ({
    className = '',
    width = 'w-full'
}) => {
    return (
        <div className={`skeleton h-4 ${width} ${className}`} />
    );
};

// Skeleton Card
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`glass-card p-6 ${className}`}>
            <SkeletonLine width="w-3/4" className="mb-4" />
            <SkeletonLine width="w-full" className="mb-2" />
            <SkeletonLine width="w-5/6" className="mb-2" />
            <SkeletonLine width="w-2/3" />
        </div>
    );
};

// Skeleton Table
export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
    return (
        <div className="glass-card overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <SkeletonLine key={i} width="w-24" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="p-4 border-b border-white/5 flex gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <SkeletonLine key={i} width="w-24" />
                    ))}
                </div>
            ))}
        </div>
    );
};

// Skeleton Stats
export const SkeletonStats: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-6">
                    <SkeletonLine width="w-1/3" className="mb-4" />
                    <div className="skeleton h-8 w-24 mb-2" />
                    <SkeletonLine width="w-1/2" />
                </div>
            ))}
        </div>
    );
};

export default Spinner;
