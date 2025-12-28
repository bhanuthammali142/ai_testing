// ============================================
// Admin Settings Page - Manage Admin Credentials
// ============================================

import React, { useState, useEffect } from 'react';
import {
    Shield,
    Plus,
    Trash2,
    AlertCircle,
    Mail,
    Users
} from 'lucide-react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useUIStore, useUserManagementStore, useUserAuthStore } from '../../stores';

interface AdminEmail {
    id: string;
    email: string;
    addedAt?: Date;
    addedBy?: string;
}

const AdminSettingsPage: React.FC = () => {
    const { showToast } = useUIStore();
    const { users, loadUsers, updateUserRole } = useUserManagementStore();
    const { user } = useUserAuthStore();

    const [adminEmails, setAdminEmails] = useState<AdminEmail[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'admins' | 'users'>('admins');

    // Load admin emails from Firestore
    useEffect(() => {
        loadAdminEmails();
        loadUsers();
    }, []);

    const loadAdminEmails = async () => {
        setIsLoading(true);
        try {
            const adminEmailsRef = collection(db, 'admin_emails');
            const snapshot = await getDocs(adminEmailsRef);

            const emails: AdminEmail[] = snapshot.docs.map(doc => ({
                id: doc.id,
                email: doc.data().email,
                addedAt: doc.data().addedAt?.toDate(),
                addedBy: doc.data().addedBy,
            }));

            // If no admin emails in Firestore, add the default ones
            if (emails.length === 0) {
                const defaultEmails = ['bhanuthammali26012@gmail.com', 'admin@testexam.com'];
                for (const email of defaultEmails) {
                    await addDoc(adminEmailsRef, {
                        email: email.toLowerCase(),
                        addedAt: new Date(),
                        addedBy: 'system',
                    });
                }
                // Reload
                const newSnapshot = await getDocs(adminEmailsRef);
                const newEmails: AdminEmail[] = newSnapshot.docs.map(doc => ({
                    id: doc.id,
                    email: doc.data().email,
                    addedAt: doc.data().addedAt?.toDate(),
                    addedBy: doc.data().addedBy,
                }));
                setAdminEmails(newEmails);
            } else {
                setAdminEmails(emails);
            }
        } catch (error) {
            console.error('Failed to load admin emails:', error);
            showToast('error', 'Failed to load admin emails');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAdminEmail = async () => {
        const email = newEmail.trim().toLowerCase();

        if (!email) {
            showToast('error', 'Please enter an email address');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast('error', 'Please enter a valid email address');
            return;
        }

        if (adminEmails.some(a => a.email === email)) {
            showToast('error', 'This email is already an admin');
            return;
        }

        setIsSaving(true);
        try {
            const adminEmailsRef = collection(db, 'admin_emails');
            const docRef = await addDoc(adminEmailsRef, {
                email,
                addedAt: new Date(),
                addedBy: user?.email || 'unknown',
            });

            setAdminEmails([...adminEmails, {
                id: docRef.id,
                email,
                addedAt: new Date(),
                addedBy: user?.email,
            }]);

            // Update the user's role in the users collection if they exist
            const existingUser = users.find(u => u.email.toLowerCase() === email);
            if (existingUser) {
                await updateUserRole(existingUser.id, 'admin');
            }

            setNewEmail('');
            showToast('success', 'Admin email added successfully');
        } catch (error) {
            console.error('Failed to add admin email:', error);
            showToast('error', 'Failed to add admin email');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveAdminEmail = async (adminEmail: AdminEmail) => {
        // Prevent removing the last admin
        if (adminEmails.length <= 1) {
            showToast('error', 'Cannot remove the last admin email');
            return;
        }

        // Prevent self-removal
        if (adminEmail.email === user?.email?.toLowerCase()) {
            showToast('error', 'You cannot remove yourself as admin');
            return;
        }

        try {
            await deleteDoc(doc(db, 'admin_emails', adminEmail.id));
            setAdminEmails(adminEmails.filter(a => a.id !== adminEmail.id));

            // Update the user's role in the users collection if they exist
            const existingUser = users.find(u => u.email.toLowerCase() === adminEmail.email);
            if (existingUser) {
                await updateUserRole(existingUser.id, 'user');
            }

            showToast('success', 'Admin email removed');
        } catch (error) {
            console.error('Failed to remove admin email:', error);
            showToast('error', 'Failed to remove admin email');
        }
    };

    const handleToggleUserRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            await updateUserRole(userId, newRole as 'admin' | 'user');

            // Update admin_emails collection
            const targetUser = users.find(u => u.id === userId);
            if (targetUser) {
                if (newRole === 'admin') {
                    // Add to admin emails
                    await addDoc(collection(db, 'admin_emails'), {
                        email: targetUser.email.toLowerCase(),
                        addedAt: new Date(),
                        addedBy: user?.email,
                    });
                    await loadAdminEmails();
                } else {
                    // Remove from admin emails
                    const adminEntry = adminEmails.find(a => a.email === targetUser.email.toLowerCase());
                    if (adminEntry) {
                        await deleteDoc(doc(db, 'admin_emails', adminEntry.id));
                        await loadAdminEmails();
                    }
                }
            }

            showToast('success', `User role updated to ${newRole}`);
        } catch (error) {
            console.error('Failed to update user role:', error);
            showToast('error', 'Failed to update user role');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
                    <p className="text-slate-400 mt-1">Manage admin access and user roles</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-px">
                <button
                    onClick={() => setActiveTab('admins')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'admins'
                        ? 'bg-primary-500/20 text-primary-400 border-b-2 border-primary-500'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <Shield className="w-4 h-4 inline mr-2" />
                    Admin Emails
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'users'
                        ? 'bg-primary-500/20 text-primary-400 border-b-2 border-primary-500'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <Users className="w-4 h-4 inline mr-2" />
                    Manage Users
                </button>
            </div>

            {/* Admin Emails Tab */}
            {activeTab === 'admins' && (
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Admin Access Control</h2>
                            <p className="text-sm text-slate-400">
                                Users with these email addresses will automatically get admin access when they register
                            </p>
                        </div>
                    </div>

                    {/* Add New Admin Email */}
                    <div className="flex gap-3 mb-6">
                        <div className="flex-1 relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Enter email address"
                                className="input-field pl-12"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddAdminEmail()}
                            />
                        </div>
                        <button
                            onClick={handleAddAdminEmail}
                            disabled={isSaving}
                            className="gradient-button flex items-center gap-2 px-6"
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Plus className="w-5 h-5" />
                            )}
                            Add Admin
                        </button>
                    </div>

                    {/* Admin Emails List */}
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-14 bg-slate-800/50 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {adminEmails.map((adminEmail) => (
                                <div
                                    key={adminEmail.id}
                                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl group hover:bg-slate-800/70 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                            <span className="text-white font-bold">
                                                {adminEmail.email[0].toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{adminEmail.email}</p>
                                            <p className="text-xs text-slate-500">
                                                {adminEmail.addedBy === 'system'
                                                    ? 'Default admin'
                                                    : `Added by ${adminEmail.addedBy}`}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveAdminEmail(adminEmail)}
                                        className="p-2 text-slate-400 hover:text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove admin"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Info */}
                    <div className="mt-6 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-primary-300 font-medium">How it works</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    When a user signs up with an email listed here, they will automatically
                                    be assigned the admin role. Existing users need their role changed in
                                    the "Manage Users" tab.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-accent-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">All Registered Users</h2>
                            <p className="text-sm text-slate-400">
                                View and manage user roles for existing users
                            </p>
                        </div>
                    </div>

                    {/* Users List */}
                    {users.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400">No registered users yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {users.map((u) => (
                                <div
                                    key={u.id}
                                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        {u.photoURL ? (
                                            <img
                                                src={u.photoURL}
                                                alt={u.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                                <span className="text-white font-bold">
                                                    {u.name[0].toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-white font-medium">{u.name}</p>
                                            <p className="text-xs text-slate-400">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                                            {u.role}
                                        </span>
                                        {u.email !== user?.email && (
                                            <button
                                                onClick={() => handleToggleUserRole(u.id, u.role)}
                                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${u.role === 'admin'
                                                    ? 'bg-danger-500/20 text-danger-400 hover:bg-danger-500/30'
                                                    : 'bg-success-500/20 text-success-400 hover:bg-success-500/30'
                                                    }`}
                                            >
                                                {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                            </button>
                                        )}
                                        {u.email === user?.email && (
                                            <span className="text-xs text-slate-500">(You)</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminSettingsPage;
