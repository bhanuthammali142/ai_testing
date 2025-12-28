// ============================================
// Admin Layout with Sidebar Navigation
// ============================================

import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    FileQuestion,
    Settings,
    BarChart3,
    Share2,
    LogOut,
    Menu,
    X,
    GraduationCap,
    ChevronRight,
    Database
} from 'lucide-react';
import { useUserAuthStore, useTestStore, useUIStore } from '../../stores';

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOutUser } = useUserAuthStore();
    const { currentTest } = useTestStore();
    const { isSidebarOpen, toggleSidebar } = useUIStore();

    const handleLogout = async () => {
        await signOutUser();
        navigate('/');
    };

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/questions', label: 'Questions', icon: FileQuestion },
        { path: '/admin/question-bank', label: 'Question Bank', icon: Database },
        { path: '/admin/settings', label: 'Test Settings', icon: Settings },
        { path: '/admin/publish', label: 'Publish', icon: Share2 },
        { path: '/admin/results', label: 'Results', icon: BarChart3 },
        { path: '/admin/admin-settings', label: 'Admin Settings', icon: Settings },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 bg-slate-900/95 backdrop-blur-xl border-r border-white/5
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                {/* Logo Section */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
                    <Link to="/admin/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">TestExam</h1>
                            <p className="text-xs text-slate-400">Admin Panel</p>
                        </div>
                    </Link>
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden text-slate-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Current Test Info */}
                {currentTest && (
                    <div className="mx-4 mt-4 p-4 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20">
                        <p className="text-xs text-slate-400 mb-1">Current Test</p>
                        <p className="text-white font-medium truncate">{currentTest.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`
                badge text-xs capitalize
                ${currentTest.status === 'open' ? 'badge-success' :
                                    currentTest.status === 'closed' ? 'badge-danger' :
                                        currentTest.status === 'scheduled' ? 'badge-warning' : 'badge-primary'}
              `}>
                                {currentTest.status}
                            </span>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="p-4 space-y-1 mt-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200 group
                  ${active
                                        ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-white border border-primary-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }
                `}
                            >
                                <Icon className={`w-5 h-5 ${active ? 'text-primary-400' : ''}`} />
                                <span className="font-medium">{item.label}</span>
                                {active && (
                                    <ChevronRight className="w-4 h-4 ml-auto text-primary-400" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-danger-400 hover:bg-danger-500/10 rounded-xl transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 min-h-screen">
                {/* Top Bar */}
                <header className="h-20 flex items-center justify-between px-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-20">
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden text-slate-400 hover:text-white p-2"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex-1 lg:ml-0 ml-4">
                        <h2 className="text-xl font-bold text-white">
                            {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {currentTest && (
                            <Link
                                to={`/test/${currentTest.urlAlias || currentTest.id}`}
                                target="_blank"
                                className="glass-button text-sm flex items-center gap-2"
                            >
                                <Share2 className="w-4 h-4" />
                                Preview Test
                            </Link>
                        )}
                        {user && (
                            <div className="flex items-center gap-2 text-sm">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.name} className="w-8 h-8 rounded-full" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                                        <span className="text-primary-400 text-xs font-bold">{user.name[0]}</span>
                                    </div>
                                )}
                                <span className="text-slate-300 hidden sm:inline">{user.name.split(' ')[0]}</span>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
