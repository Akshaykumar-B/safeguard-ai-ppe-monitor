/**
 * Sidebar — Role-Based Navigation Menu
 * ======================================
 * Shows/hides navigation items based on user role.
 * Admin sees all items; Staff and Viewer see restricted menus.
 */

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const activePath = location.pathname;
    const { userProfile, hasPermission, logout } = useAuth();

    // Build nav items based on permissions
    const mainNavItems = [
        { path: "/", icon: "dashboard", label: "Dashboard", permission: 'dashboard' },
        { path: "/live", icon: "videocam", label: "Live Monitoring", permission: 'liveMonitoring' },
        { path: "/workers", icon: "badge", label: "Workers", permission: 'workerManagement' },
        { path: "/analytics", icon: "analytics", label: "Analytics", permission: 'analyticsReports' },
        { path: "/violations", icon: "warning", label: "Violations Log", permission: 'violationLogs' },
    ];

    const adminNavItems = [
        { path: "/settings", icon: "settings", label: "System Config", permission: 'systemSettings' },
        { path: "/users", icon: "manage_accounts", label: "User Management", permission: 'userManagement' },
    ];

    // Filter based on permissions
    const visibleMainItems = mainNavItems.filter(item => hasPermission(item.permission));
    const visibleAdminItems = adminNavItems.filter(item => hasPermission(item.permission));

    // Role styling
    const roleStyle = {
        admin: { label: 'Administrator', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: 'admin_panel_settings' },
        staff: { label: 'Safety Officer', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: 'shield' },
        viewer: { label: 'Viewer', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: 'visibility' },
    };
    const currentRole = roleStyle[userProfile?.role] || roleStyle.viewer;

    return (
        <aside className="w-64 border-r border-primary/10 bg-white dark:bg-background-dark/50 hidden lg:flex flex-col shrink-0">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
                    <span className="material-icons">visibility</span>
                </div>
                <span className="font-bold text-xl tracking-tight">SafeGuard AI</span>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-4 space-y-1 py-4">
                {visibleMainItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activePath === item.path
                            ? "bg-primary/10 text-primary"
                            : "text-slate-500 hover:bg-primary/5 hover:text-primary"
                            }`}
                    >
                        <span className="material-icons text-[20px]">{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                ))}

                {/* Admin Section */}
                {visibleAdminItems.length > 0 && (
                    <>
                        <div className="pt-4 pb-2 px-4 uppercase text-[10px] font-bold text-slate-400 tracking-widest">
                            Administration
                        </div>
                        {visibleAdminItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activePath === item.path
                                    ? "bg-primary/10 text-primary"
                                    : "text-slate-500 hover:bg-primary/5 hover:text-primary"
                                    }`}
                            >
                                <span className="material-icons text-[20px]">{item.icon}</span>
                                <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </>
                )}
            </nav>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-primary/10">
                <div className="flex items-center gap-3 px-2">
                    <div className={`w-9 h-9 rounded-xl ${currentRole.bg} flex items-center justify-center`}>
                        <span className={`material-icons text-lg ${currentRole.color}`}>{currentRole.icon}</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold truncate">{userProfile?.name || 'User'}</p>
                        <p className={`text-[10px] font-medium truncate ${currentRole.color}`}>
                            {currentRole.label}
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                        title="Sign Out"
                    >
                        <span className="material-icons text-sm">logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
