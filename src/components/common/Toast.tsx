// ============================================
// Toast Notification Component
// ============================================

import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useUIStore } from '../../stores';

const Toast: React.FC = () => {
    const { toasts, removeToast } = useUIStore();

    if (toasts.length === 0) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-success-400" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-danger-400" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-warning-400" />;
            case 'info':
                return <Info className="w-5 h-5 text-primary-400" />;
            default:
                return <Info className="w-5 h-5 text-primary-400" />;
        }
    };

    const getBorderColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'border-success-500/30';
            case 'error':
                return 'border-danger-500/30';
            case 'warning':
                return 'border-warning-500/30';
            case 'info':
                return 'border-primary-500/30';
            default:
                return 'border-primary-500/30';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
            glass-card p-4 flex items-start gap-3 animate-slide-down
            ${getBorderColor(toast.type)}
          `}
                >
                    {getIcon(toast.type)}
                    <p className="flex-1 text-sm text-slate-200">{toast.message}</p>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Toast;
