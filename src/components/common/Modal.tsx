// ============================================
// Modal Component
// ============================================

import React from 'react';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useUIStore } from '../../stores';

const Modal: React.FC = () => {
    const { modal, hideModal } = useUIStore();

    if (!modal.isOpen) return null;

    const getIcon = () => {
        switch (modal.type) {
            case 'warning':
                return <AlertTriangle className="w-12 h-12 text-warning-400" />;
            case 'confirm':
                return <Info className="w-12 h-12 text-primary-400" />;
            case 'alert':
                return <CheckCircle className="w-12 h-12 text-success-400" />;
            default:
                return <Info className="w-12 h-12 text-primary-400" />;
        }
    };

    const handleConfirm = () => {
        modal.onConfirm?.();
        hideModal();
    };

    const handleCancel = () => {
        modal.onCancel?.();
        hideModal();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleCancel}
            />

            {/* Modal Content */}
            <div className="relative glass-card p-8 max-w-md w-full animate-scale-in">
                {/* Close Button */}
                <button
                    onClick={handleCancel}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    {getIcon()}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white text-center mb-3">
                    {modal.title}
                </h3>

                {/* Message */}
                <p className="text-slate-300 text-center mb-8">
                    {modal.message}
                </p>

                {/* Actions */}
                <div className="flex gap-4 justify-center">
                    {modal.cancelText && (
                        <button
                            onClick={handleCancel}
                            className="gradient-button-secondary"
                        >
                            {modal.cancelText}
                        </button>
                    )}
                    <button
                        onClick={handleConfirm}
                        className={`
              gradient-button
              ${modal.type === 'warning' ? 'from-danger-500 to-danger-600 shadow-danger-500/30' : ''}
            `}
                    >
                        {modal.confirmText || 'OK'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
