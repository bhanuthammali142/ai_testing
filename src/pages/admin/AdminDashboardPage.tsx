// ============================================
// Admin Dashboard Page (Enhanced)
// ============================================

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Users,
    FileText,
    Plus,
    Send,
    CheckCircle2,
    Clock,
    BarChart3,
    User,
    Calendar,
    Search,
    X
} from 'lucide-react';
import {
    useUserAuthStore,
    useUserManagementStore,
    useTestStore,
    useExamAssignmentStore,
    useUIStore
} from '../../stores';
import { AuthUser } from '../../types/auth';
import { Test } from '../../types';

// Published Exam Modal
interface PublishModalProps {
    exam: Test;
    users: AuthUser[];
    onClose: () => void;
    onPublish: (examId: string, userIds: string[]) => void;
}

const PublishModal: React.FC<PublishModalProps> = ({ exam, users, onClose, onPublish }) => {
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const students = users.filter(u => u.role === 'user');
    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredStudents.map(s => s.id));
        }
        setSelectAll(!selectAll);
    };

    const handleSelectUser = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handlePublish = () => {
        if (selectedUsers.length === 0) return;
        onPublish(exam.id, selectedUsers);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h3 className="text-xl font-bold text-white">Publish Exam</h3>
                        <p className="text-sm text-slate-400 mt-1">Assign "{exam.name}" to students</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>

                    {/* Select All */}
                    <div className="flex items-center justify-between mb-4 p-3 bg-slate-800/50 rounded-xl">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={handleSelectAll}
                                className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="text-white font-medium">Select All Students</span>
                        </label>
                        <span className="text-sm text-slate-400">{selectedUsers.length} selected</span>
                    </div>

                    {/* Student List */}
                    {students.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                            <p className="text-slate-400">No students registered yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {filteredStudents.map(student => (
                                <label
                                    key={student.id}
                                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors ${selectedUsers.includes(student.id)
                                        ? 'bg-primary-500/20 border border-primary-500/30'
                                        : 'bg-slate-800/50 hover:bg-slate-800'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(student.id)}
                                        onChange={() => handleSelectUser(student.id)}
                                        className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-primary-500 focus:ring-primary-500"
                                    />
                                    {student.photoURL ? (
                                        <img
                                            src={student.photoURL}
                                            alt={student.name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                            <User className="w-5 h-5 text-slate-400" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="text-white font-medium">{student.name}</p>
                                        <p className="text-sm text-slate-400">{student.email}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-white/10 flex items-center justify-end gap-3">
                    <button onClick={onClose} className="glass-button">
                        Cancel
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={selectedUsers.length === 0}
                        className="gradient-button flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                        Publish to {selectedUsers.length} Student{selectedUsers.length !== 1 ? 's' : ''}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useUserAuthStore();
    const { users, loadUsers, isLoading: usersLoading } = useUserManagementStore();
    const { tests, updateTestStatus } = useTestStore();
    const { assignExamToAllUsers, getAssignmentsForExam } = useExamAssignmentStore();
    const { showToast } = useUIStore();

    const [publishModalExam, setPublishModalExam] = useState<Test | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'exams'>('overview');

    useEffect(() => {
        loadUsers();
    }, []);

    // Redirect if not admin
    if (user && user.role !== 'admin') {
        navigate('/dashboard');
        return null;
    }

    const handlePublishExam = async (examId: string, userIds: string[]) => {
        try {
            // Assign exam to selected users
            await assignExamToAllUsers(examId, userIds);

            // Update exam status to open
            updateTestStatus(examId, 'open');

            showToast('success', `Exam published to ${userIds.length} student${userIds.length !== 1 ? 's' : ''}!`);
        } catch (error) {
            showToast('error', 'Failed to publish exam');
        }
    };

    const students = users.filter(u => u.role === 'user');
    const publishedExams = tests.filter(t => t.status === 'open');
    const draftExams = tests.filter(t => t.status === 'draft');

    // Stats
    const stats = [
        {
            label: 'Total Students',
            value: students.length,
            icon: Users,
            color: 'text-primary-400',
            bgColor: 'bg-primary-500/20',
        },
        {
            label: 'Total Exams',
            value: tests.length,
            icon: FileText,
            color: 'text-accent-400',
            bgColor: 'bg-accent-500/20',
        },
        {
            label: 'Published',
            value: publishedExams.length,
            icon: CheckCircle2,
            color: 'text-success-400',
            bgColor: 'bg-success-500/20',
        },
        {
            label: 'Drafts',
            value: draftExams.length,
            icon: Clock,
            color: 'text-warning-400',
            bgColor: 'bg-warning-500/20',
        },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="glass-card p-6 bg-gradient-to-r from-primary-500/10 to-accent-500/10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">
                            Welcome, {user?.name.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-slate-400">
                            Manage your exams and students from this dashboard.
                        </p>
                    </div>
                    <Link
                        to="/admin/questions"
                        className="gradient-button flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Exam
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="glass-card p-5">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    <p className="text-sm text-slate-400">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-1">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'overview'
                        ? 'bg-white/10 text-white'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'users'
                        ? 'bg-white/10 text-white'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    Users ({students.length})
                </button>
                <button
                    onClick={() => setActiveTab('exams')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'exams'
                        ? 'bg-white/10 text-white'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    Exams ({tests.length})
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Users */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary-400" />
                                Recent Users
                            </h3>
                            <button
                                onClick={() => setActiveTab('users')}
                                className="text-sm text-primary-400 hover:text-primary-300"
                            >
                                View all
                            </button>
                        </div>
                        {usersLoading ? (
                            <div className="text-center py-8">
                                <div className="w-8 h-8 mx-auto rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                            </div>
                        ) : students.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No students yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {students.slice(0, 5).map(student => (
                                    <div
                                        key={student.id}
                                        className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl"
                                    >
                                        {student.photoURL ? (
                                            <img
                                                src={student.photoURL}
                                                alt={student.name}
                                                className="w-10 h-10 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                                <User className="w-5 h-5 text-slate-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">{student.name}</p>
                                            <p className="text-sm text-slate-400 truncate">{student.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Exams */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-accent-400" />
                                Recent Exams
                            </h3>
                            <button
                                onClick={() => setActiveTab('exams')}
                                className="text-sm text-primary-400 hover:text-primary-300"
                            >
                                View all
                            </button>
                        </div>
                        {tests.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No exams created yet</p>
                                <Link
                                    to="/admin/questions"
                                    className="inline-block mt-3 text-primary-400 hover:text-primary-300"
                                >
                                    Create your first exam
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {tests.slice(0, 5).map(exam => {
                                    const assignmentCount = getAssignmentsForExam(exam.id).length;
                                    return (
                                        <div
                                            key={exam.id}
                                            className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-medium truncate">{exam.name}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${exam.status === 'open'
                                                        ? 'bg-success-500/20 text-success-400'
                                                        : exam.status === 'draft'
                                                            ? 'bg-warning-500/20 text-warning-400'
                                                            : 'bg-slate-500/20 text-slate-400'
                                                        }`}>
                                                        {exam.status}
                                                    </span>
                                                    {assignmentCount > 0 && (
                                                        <span className="text-xs text-slate-400">
                                                            {assignmentCount} assigned
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {exam.status === 'draft' && (
                                                <button
                                                    onClick={() => setPublishModalExam(exam)}
                                                    className="ml-3 p-2 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors"
                                                    title="Publish"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary-400" />
                        Registered Students
                    </h3>
                    {usersLoading ? (
                        <div className="text-center py-12">
                            <div className="w-10 h-10 mx-auto rounded-full border-2 border-primary-500 border-t-transparent animate-spin mb-3" />
                            <p className="text-slate-400">Loading users...</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                            <h4 className="text-lg font-semibold text-white mb-2">No Students Yet</h4>
                            <p className="text-slate-400">
                                Students will appear here after they sign in with Google.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b border-white/10">
                                        <th className="pb-3 text-sm font-medium text-slate-400">Student</th>
                                        <th className="pb-3 text-sm font-medium text-slate-400">Email</th>
                                        <th className="pb-3 text-sm font-medium text-slate-400">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {students.map(student => (
                                        <tr key={student.id}>
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    {student.photoURL ? (
                                                        <img
                                                            src={student.photoURL}
                                                            alt={student.name}
                                                            className="w-10 h-10 rounded-full"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                                            <User className="w-5 h-5 text-slate-400" />
                                                        </div>
                                                    )}
                                                    <span className="text-white font-medium">{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-slate-400">{student.email}</td>
                                            <td className="py-4 text-slate-400">
                                                {new Date(student.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'exams' && (
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-accent-400" />
                            All Exams
                        </h3>
                        <Link
                            to="/admin/questions"
                            className="gradient-button text-sm flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create Exam
                        </Link>
                    </div>
                    {tests.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                            <h4 className="text-lg font-semibold text-white mb-2">No Exams Created</h4>
                            <p className="text-slate-400 mb-4">
                                Create your first exam to get started.
                            </p>
                            <Link
                                to="/admin/questions"
                                className="gradient-button inline-flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Create Exam
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tests.map(exam => {
                                const assignmentCount = getAssignmentsForExam(exam.id).length;
                                return (
                                    <div
                                        key={exam.id}
                                        className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl"
                                    >
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{exam.name}</p>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${exam.status === 'open'
                                                    ? 'bg-success-500/20 text-success-400'
                                                    : exam.status === 'draft'
                                                        ? 'bg-warning-500/20 text-warning-400'
                                                        : 'bg-slate-500/20 text-slate-400'
                                                    }`}>
                                                    {exam.status}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    {assignmentCount} assigned
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(exam.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {exam.status === 'draft' && (
                                                <button
                                                    onClick={() => setPublishModalExam(exam)}
                                                    className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors flex items-center gap-2"
                                                >
                                                    <Send className="w-4 h-4" />
                                                    Publish
                                                </button>
                                            )}
                                            <Link
                                                to={`/admin/results`}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                title="View Results"
                                            >
                                                <BarChart3 className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Publish Modal */}
            {publishModalExam && (
                <PublishModal
                    exam={publishModalExam}
                    users={users}
                    onClose={() => setPublishModalExam(null)}
                    onPublish={handlePublishExam}
                />
            )}
        </div>
    );
};

export default AdminDashboardPage;
