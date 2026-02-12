/**
 * Header — Role-Aware Top Bar
 * =============================
 * Shows user role badge, role-specific actions, and logout.
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const ROLE_BADGE = {
    admin: { label: 'Admin', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    staff: { label: 'Staff', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    viewer: { label: 'Viewer', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

const Header = ({ title, showAddWorker = false }) => {
    const navigate = useNavigate();
    const { darkMode, setDarkMode, notifications, markNotificationRead, markAllNotificationsRead, stats } = useApp();
    const { userProfile, logout, hasPermission } = useAuth();
    const [showNotifs, setShowNotifs] = useState(false);
    const notifRef = useRef(null);

    const badge = ROLE_BADGE[userProfile?.role] || ROLE_BADGE.viewer;

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifs(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <header className="h-16 bg-white dark:bg-background-dark border-b border-primary/10 flex items-center justify-between px-8 z-10 sticky top-0">
            <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{title}</h1>
                <span className="flex items-center gap-1.5 ml-4 bg-success/10 text-success text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
                    LIVE MONITORING
                </span>
            </div>
            <div className="flex items-center gap-3">
                {/* Role Badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${badge.color}`}>
                    {badge.label}
                </span>

                {/* Dark Mode Toggle */}
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/5 transition-all"
                    title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    <span className="material-icons text-xl">{darkMode ? 'light_mode' : 'dark_mode'}</span>
                </button>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifs(!showNotifs)}
                        className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/5 transition-all"
                    >
                        <span className="material-icons text-xl">notifications</span>
                        {stats.unreadNotifications > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30">
                                {stats.unreadNotifications}
                            </span>
                        )}
                    </button>

                    {showNotifs && (
                        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50"
                            style={{ animation: 'slideIn 0.2s ease-out' }}>
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="font-bold text-sm">Notifications</h3>
                                <button
                                    onClick={markAllNotificationsRead}
                                    className="text-[10px] text-primary font-bold uppercase hover:underline"
                                >
                                    Mark all read
                                </button>
                            </div>
                            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <p className="p-6 text-center text-sm text-slate-400">No notifications</p>
                                ) : (
                                    notifications.map(n => (
                                        <button
                                            key={n.id}
                                            onClick={() => markNotificationRead(n.id)}
                                            className={`w-full text-left p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-3 ${!n.read ? 'bg-primary/5' : ''}`}
                                        >
                                            <span className={`material-icons text-sm mt-0.5 ${n.type === 'danger' ? 'text-rose-500' : n.type === 'warning' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                {n.type === 'danger' ? 'error' : n.type === 'warning' ? 'warning' : 'check_circle'}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs leading-relaxed ${!n.read ? 'font-semibold' : 'text-slate-500'}`}>{n.message}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                                            </div>
                                            {!n.read && <span className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0"></span>}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Add Worker (Admin only) */}
                {showAddWorker && hasPermission('workerManagement') && (
                    <button
                        onClick={() => navigate('/add-worker')}
                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                    >
                        <span className="material-icons text-sm">person_add</span>
                        Add Worker
                    </button>
                )}

                {/* Logout Button */}
                <button
                    onClick={logout}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
                    title="Sign Out"
                >
                    <span className="material-icons text-xl">logout</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
