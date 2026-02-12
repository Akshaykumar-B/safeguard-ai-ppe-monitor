/**
 * ProtectedRoute — Role-Based Route Guard
 * ========================================
 * Wraps page components to enforce authentication and RBAC.
 * Redirects to login if not authenticated, or AccessDenied if role insufficient.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredPermission }) => {
    const { currentUser, userProfile, loading, hasPermission } = useAuth();

    // Still loading auth state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Not logged in → redirect to login
    if (!currentUser || !userProfile) {
        return <Navigate to="/login" replace />;
    }

    // Account disabled
    if (userProfile.status === 'disabled') {
        return <Navigate to="/login" replace />;
    }

    // Permission check (if a specific permission is required)
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return <Navigate to="/access-denied" replace />;
    }

    return children;
};

export default ProtectedRoute;
