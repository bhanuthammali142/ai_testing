// ============================================
// Test Settings Page
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FileQuestion,
    Eye,
    Shield,
    Lock,
    Clock,
    Users,
    Save,
    RotateCcw,
    Plus,
    Settings
} from 'lucide-react';
import { useTestStore, useUIStore } from '../../stores';
import { TestSettings } from '../../types';
import { ToggleSwitch } from '../../components/common';

type SettingsTab = 'questions' | 'review' | 'access' | 'security';

const SettingsPage: React.FC = () => {
    const { currentTest, updateTestSettings } = useTestStore();
    const { showToast } = useUIStore();

    const [activeTab, setActiveTab] = useState<SettingsTab>('questions');
    const [settings, setSettings] = useState<TestSettings>(
        currentTest?.settings || {} as TestSettings
    );
    const [hasChanges, setHasChanges] = useState(false);

    // Auto-select first test if none selected but tests exist
    const { tests, setCurrentTest } = useTestStore();

    useEffect(() => {
        if (!currentTest && tests.length > 0) {
            setCurrentTest(tests[0]);
        }
    }, [currentTest, tests, setCurrentTest]);

    if (!currentTest) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20 animate-fade-in">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                    <Settings className="w-10 h-10 text-primary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">No Test Selected</h2>
                <p className="text-slate-400 mb-8">
                    Create a new test or select an existing one from the dashboard to configure settings.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Link
                        to="/admin"
                        className="glass-button flex items-center gap-2"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        to="/admin/questions"
                        className="gradient-button flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Test
                    </Link>
                </div>
            </div>
        );
    }

    const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
        { id: 'questions', label: 'Question Behavior', icon: FileQuestion },
        { id: 'review', label: 'Review & Results', icon: Eye },
        { id: 'access', label: 'Access Control', icon: Lock },
        { id: 'security', label: 'Anti-Cheating', icon: Shield },
    ];

    const updateSetting = <K extends keyof TestSettings>(
        section: K,
        key: keyof TestSettings[K],
        value: TestSettings[K][keyof TestSettings[K]]
    ) => {
        setSettings({
            ...settings,
            [section]: {
                ...settings[section],
                [key]: value,
            },
        });
        setHasChanges(true);
    };

    const handleSave = () => {
        updateTestSettings(currentTest.id, settings);
        showToast('success', 'Settings saved successfully!');
        setHasChanges(false);
    };

    const handleReset = () => {
        setSettings(currentTest.settings);
        setHasChanges(false);
        showToast('info', 'Settings reset to saved values');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Test Settings</h1>
                    <p className="text-slate-400 mt-1">Configure how your test behaves</p>
                </div>
                {hasChanges && (
                    <div className="flex gap-3">
                        <button onClick={handleReset} className="glass-button flex items-center gap-2">
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </button>
                        <button onClick={handleSave} className="gradient-button flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="glass-card p-1 flex flex-wrap gap-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-[150px] px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-white border border-primary-500/30'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Settings Content */}
            <div className="glass-card p-6">
                {/* Question Behavior */}
                {activeTab === 'questions' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="pb-4 border-b border-white/10">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <FileQuestion className="w-5 h-5 text-primary-400" />
                                Question Behavior
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">Control how questions are displayed</p>
                        </div>

                        <ToggleSwitch
                            id="showAllOnOnePage"
                            checked={settings.questionBehavior.showAllOnOnePage}
                            onChange={(checked) => updateSetting('questionBehavior', 'showAllOnOnePage', checked)}
                            label="Show all questions on one page"
                            description="If disabled, questions will be shown one at a time"
                        />

                        <ToggleSwitch
                            id="randomizeOrder"
                            checked={settings.questionBehavior.randomizeOrder}
                            onChange={(checked) => updateSetting('questionBehavior', 'randomizeOrder', checked)}
                            label="Randomize question order"
                            description="Each candidate sees questions in a different order"
                        />

                        <ToggleSwitch
                            id="allowBlankAnswers"
                            checked={settings.questionBehavior.allowBlankAnswers}
                            onChange={(checked) => updateSetting('questionBehavior', 'allowBlankAnswers', checked)}
                            label="Allow blank answers"
                            description="Candidates can submit without answering all questions"
                        />

                        <ToggleSwitch
                            id="enableNegativeMarking"
                            checked={settings.questionBehavior.enableNegativeMarking}
                            onChange={(checked) => updateSetting('questionBehavior', 'enableNegativeMarking', checked)}
                            label="Enable negative marking"
                            description="Deduct points for incorrect answers"
                        />
                    </div>
                )}

                {/* Review & Results */}
                {activeTab === 'review' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="pb-4 border-b border-white/10">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Eye className="w-5 h-5 text-primary-400" />
                                Review & Results
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">Control what candidates see after submission</p>
                        </div>

                        {/* Passing Score */}
                        <div>
                            <label className="input-label">Passing Score (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={settings.review.passingScore}
                                onChange={(e) => updateSetting('review', 'passingScore', parseInt(e.target.value) || 0)}
                                className="input-field w-32"
                            />
                        </div>

                        {/* Conclusion Text */}
                        <div>
                            <label className="input-label">Conclusion Text</label>
                            <textarea
                                value={settings.review.conclusionText}
                                onChange={(e) => updateSetting('review', 'conclusionText', e.target.value)}
                                className="input-field min-h-[80px] resize-y"
                                placeholder="Message shown after test completion..."
                            />
                        </div>

                        {/* Pass Message */}
                        <div>
                            <label className="input-label">Pass Message</label>
                            <textarea
                                value={settings.review.passMessage}
                                onChange={(e) => updateSetting('review', 'passMessage', e.target.value)}
                                className="input-field min-h-[60px] resize-y"
                                placeholder="Congratulations! You passed..."
                            />
                        </div>

                        {/* Fail Message */}
                        <div>
                            <label className="input-label">Fail Message</label>
                            <textarea
                                value={settings.review.failMessage}
                                onChange={(e) => updateSetting('review', 'failMessage', e.target.value)}
                                className="input-field min-h-[60px] resize-y"
                                placeholder="Unfortunately, you did not pass..."
                            />
                        </div>

                        <div className="pt-4 border-t border-white/10 space-y-0">
                            <ToggleSwitch
                                id="showScore"
                                checked={settings.review.showScore}
                                onChange={(checked) => updateSetting('review', 'showScore', checked)}
                                label="Show score to candidates"
                                description="Display the final score after submission"
                            />

                            <ToggleSwitch
                                id="showCorrectAnswers"
                                checked={settings.review.showCorrectAnswers}
                                onChange={(checked) => updateSetting('review', 'showCorrectAnswers', checked)}
                                label="Show correct answers"
                                description="Reveal correct answers after submission"
                            />

                            <ToggleSwitch
                                id="showExplanations"
                                checked={settings.review.showExplanations}
                                onChange={(checked) => updateSetting('review', 'showExplanations', checked)}
                                label="Show explanations"
                                description="Display answer explanations"
                            />

                            <ToggleSwitch
                                id="showQuestionOutline"
                                checked={settings.review.showQuestionOutline}
                                onChange={(checked) => updateSetting('review', 'showQuestionOutline', checked)}
                                label="Show question outline"
                                description="Display a summary of all questions"
                            />
                        </div>
                    </div>
                )}

                {/* Access Control */}
                {activeTab === 'access' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="pb-4 border-b border-white/10">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Lock className="w-5 h-5 text-primary-400" />
                                Access Control
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">Control who can take the test</p>
                        </div>

                        {/* Access Type */}
                        <div>
                            <label className="input-label">Access Type</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {[
                                    { value: 'public', label: 'Public', description: 'Anyone with the link' },
                                    { value: 'passcode', label: 'Passcode', description: 'Requires a passcode' },
                                    { value: 'email', label: 'Email List', description: 'Restrict by email' },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => updateSetting('accessControl', 'accessType', option.value as 'public' | 'passcode' | 'email')}
                                        className={`p-4 rounded-xl border transition-all text-left ${settings.accessControl.accessType === option.value
                                            ? 'bg-primary-500/20 border-primary-500/50 text-white'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                                            }`}
                                    >
                                        <p className="font-medium">{option.label}</p>
                                        <p className="text-xs mt-1 opacity-70">{option.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Passcode */}
                        {settings.accessControl.accessType === 'passcode' && (
                            <div>
                                <label className="input-label">Test Passcode</label>
                                <input
                                    type="text"
                                    value={settings.accessControl.passcode || ''}
                                    onChange={(e) => updateSetting('accessControl', 'passcode', e.target.value)}
                                    className="input-field"
                                    placeholder="Enter passcode for candidates"
                                />
                            </div>
                        )}

                        {/* Email List */}
                        {settings.accessControl.accessType === 'email' && (
                            <div>
                                <label className="input-label">Allowed Emails (comma-separated)</label>
                                <textarea
                                    value={(settings.accessControl.allowedEmails || []).join(', ')}
                                    onChange={(e) => updateSetting('accessControl', 'allowedEmails',
                                        e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                                    )}
                                    className="input-field min-h-[100px] resize-y"
                                    placeholder="student1@example.com, student2@example.com"
                                />
                            </div>
                        )}

                        <div className="pt-4 border-t border-white/10 space-y-0">
                            <ToggleSwitch
                                id="requireName"
                                checked={settings.accessControl.requireName}
                                onChange={(checked) => updateSetting('accessControl', 'requireName', checked)}
                                label="Require candidate name"
                                description="Candidates must enter their name"
                            />

                            <ToggleSwitch
                                id="requireStudentId"
                                checked={settings.accessControl.requireStudentId}
                                onChange={(checked) => updateSetting('accessControl', 'requireStudentId', checked)}
                                label="Require Student/Employee ID"
                                description="Candidates must enter their ID"
                            />
                        </div>

                        {/* Time Limit */}
                        <div className="pt-4 border-t border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="input-label flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Time Limit (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={settings.accessControl.timeLimitMinutes || ''}
                                        onChange={(e) => updateSetting('accessControl', 'timeLimitMinutes',
                                            e.target.value ? parseInt(e.target.value) : null
                                        )}
                                        className="input-field w-32"
                                        placeholder="Unlimited"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="input-label flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Attempt Limit
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={settings.accessControl.attemptLimit || ''}
                                        onChange={(e) => updateSetting('accessControl', 'attemptLimit',
                                            e.target.value ? parseInt(e.target.value) : null
                                        )}
                                        className="input-field w-32"
                                        placeholder="Unlimited"
                                    />
                                </div>
                            </div>
                        </div>

                        <ToggleSwitch
                            id="autoSubmitOnTimeout"
                            checked={settings.accessControl.autoSubmitOnTimeout}
                            onChange={(checked) => updateSetting('accessControl', 'autoSubmitOnTimeout', checked)}
                            label="Auto-submit on timeout"
                            description="Automatically submit when time expires"
                        />
                    </div>
                )}

                {/* Anti-Cheating */}
                {activeTab === 'security' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="pb-4 border-b border-white/10">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary-400" />
                                Anti-Cheating Controls
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">Security measures during the exam</p>
                        </div>

                        <div className="p-4 bg-warning-500/10 border border-warning-500/20 rounded-xl mb-4">
                            <p className="text-sm text-warning-300">
                                <strong>Note:</strong> These controls help deter cheating but are not foolproof.
                                Determined users may find ways around them.
                            </p>
                        </div>

                        <ToggleSwitch
                            id="disableRightClick"
                            checked={settings.antiCheating.disableRightClick}
                            onChange={(checked) => updateSetting('antiCheating', 'disableRightClick', checked)}
                            label="Disable right-click"
                            description="Prevent right-click context menu"
                        />

                        <ToggleSwitch
                            id="disableCopyPaste"
                            checked={settings.antiCheating.disableCopyPaste}
                            onChange={(checked) => updateSetting('antiCheating', 'disableCopyPaste', checked)}
                            label="Disable copy/paste"
                            description="Prevent copying and pasting text"
                        />

                        <ToggleSwitch
                            id="disableTranslate"
                            checked={settings.antiCheating.disableTranslate}
                            onChange={(checked) => updateSetting('antiCheating', 'disableTranslate', checked)}
                            label="Disable browser translate"
                            description="Attempt to prevent translation"
                        />

                        <ToggleSwitch
                            id="disableAutocomplete"
                            checked={settings.antiCheating.disableAutocomplete}
                            onChange={(checked) => updateSetting('antiCheating', 'disableAutocomplete', checked)}
                            label="Disable autocomplete"
                            description="Turn off form autocomplete"
                        />

                        <ToggleSwitch
                            id="disableSpellcheck"
                            checked={settings.antiCheating.disableSpellcheck}
                            onChange={(checked) => updateSetting('antiCheating', 'disableSpellcheck', checked)}
                            label="Disable spellcheck"
                            description="Turn off browser spellcheck"
                        />

                        <ToggleSwitch
                            id="disablePrinting"
                            checked={settings.antiCheating.disablePrinting}
                            onChange={(checked) => updateSetting('antiCheating', 'disablePrinting', checked)}
                            label="Disable printing"
                            description="Prevent Ctrl+P / Cmd+P"
                        />

                        <ToggleSwitch
                            id="showTechnicalDisclosure"
                            checked={settings.antiCheating.showTechnicalDisclosure}
                            onChange={(checked) => updateSetting('antiCheating', 'showTechnicalDisclosure', checked)}
                            label="Show technical disclosure"
                            description="Display monitoring notice to candidates"
                        />
                    </div>
                )}
            </div>

            {/* Floating Save Button */}
            {hasChanges && (
                <div className="fixed bottom-6 right-6 flex gap-3 animate-slide-up">
                    <button onClick={handleReset} className="glass-button shadow-xl">
                        <RotateCcw className="w-5 h-5" />
                    </button>
                    <button onClick={handleSave} className="gradient-button shadow-xl flex items-center gap-2">
                        <Save className="w-5 h-5" />
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
