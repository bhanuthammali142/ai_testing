// ============================================
// Empty State Component
// ============================================

import React from 'react';
import { FileQuestion, Users, BarChart3, ClipboardList, Plus } from 'lucide-react';

interface EmptyStateProps {
    type: 'questions' | 'results' | 'tests' | 'attempts' | 'generic';
    title?: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    type,
    title,
    message,
    actionLabel,
    onAction,
}) => {
    const getConfig = () => {
        switch (type) {
            case 'questions':
                return {
                    icon: <FileQuestion className="w-16 h-16" />,
                    defaultTitle: 'No Questions Yet',
                    defaultMessage: 'Start building your test by adding questions manually or using AI generation.',
                    bgGradient: 'from-primary-500/20 to-accent-500/20',
                };
            case 'results':
                return {
                    icon: <BarChart3 className="w-16 h-16" />,
                    defaultTitle: 'No Results Available',
                    defaultMessage: 'Results will appear here once candidates start taking the test.',
                    bgGradient: 'from-success-500/20 to-primary-500/20',
                };
            case 'tests':
                return {
                    icon: <ClipboardList className="w-16 h-16" />,
                    defaultTitle: 'No Tests Created',
                    defaultMessage: 'Create your first test to get started with the exam platform.',
                    bgGradient: 'from-accent-500/20 to-primary-500/20',
                };
            case 'attempts':
                return {
                    icon: <Users className="w-16 h-16" />,
                    defaultTitle: 'No Attempts Yet',
                    defaultMessage: 'Candidates haven\'t attempted this test yet. Share the test link to get started.',
                    bgGradient: 'from-warning-500/20 to-accent-500/20',
                };
            default:
                return {
                    icon: <FileQuestion className="w-16 h-16" />,
                    defaultTitle: 'Nothing Here',
                    defaultMessage: 'There\'s no content to display at the moment.',
                    bgGradient: 'from-slate-500/20 to-slate-600/20',
                };
        }
    };

    const config = getConfig();

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            {/* Icon with gradient background */}
            <div className={`
        relative p-8 rounded-full bg-gradient-to-br ${config.bgGradient}
        mb-6 animate-float
      `}>
                <div className="text-slate-400">
                    {config.icon}
                </div>
                {/* Decorative rings */}
                <div className="absolute inset-0 rounded-full border border-white/5 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute -inset-4 rounded-full border border-white/5" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-2 text-center">
                {title || config.defaultTitle}
            </h3>

            {/* Message */}
            <p className="text-slate-400 text-center max-w-md mb-6">
                {message || config.defaultMessage}
            </p>

            {/* Action Button */}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="gradient-button flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
