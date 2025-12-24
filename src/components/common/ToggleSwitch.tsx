// ============================================
// Toggle Switch Component
// ============================================

import React from 'react';

interface ToggleSwitchProps {
    id: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    id,
    checked,
    onChange,
    label,
    description,
    disabled = false,
}) => {
    return (
        <div className={`flex items-center justify-between py-3 ${disabled ? 'opacity-50' : ''}`}>
            <div className="flex-1 pr-4">
                {label && (
                    <label htmlFor={id} className="text-white font-medium cursor-pointer">
                        {label}
                    </label>
                )}
                {description && (
                    <p className="text-sm text-slate-400 mt-0.5">{description}</p>
                )}
            </div>
            <button
                id={id}
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent 
                    transition-colors duration-200 ease-in-out
                    ${checked
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500'
                        : 'bg-slate-600'
                    }
                    ${!disabled && 'hover:shadow-lg cursor-pointer'}
                    focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-slate-900
                `}
            >
                <span
                    className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 
                        transition duration-200 ease-in-out
                        ${checked ? 'translate-x-5' : 'translate-x-0'}
                    `}
                />
            </button>
        </div>
    );
};

export default ToggleSwitch;
