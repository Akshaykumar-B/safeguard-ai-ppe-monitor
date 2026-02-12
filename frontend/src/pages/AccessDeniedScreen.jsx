/**
 * AccessDeniedScreen — Unauthorized Access Page
 * ===============================================
 * Shown when a user tries to access a page they don't have permission for.
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AccessDeniedScreen = () => {
    const navigate = useNavigate();
    const { userProfile } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="text-center max-w-md mx-auto px-6">
                {/* Icon */}
                <div className="w-24 h-24 mx-auto mb-6 bg-rose-500/10 rounded-3xl flex items-center justify-center border border-rose-500/20"
                    style={{ animation: 'slideIn 0.5s ease-out' }}>
                    <span className="material-icons text-rose-500 text-5xl">lock</span>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-white mb-3">Access Denied</h1>
                <p className="text-slate-400 text-sm mb-2">
                    You don't have permission to access this page.
                </p>

                {/* Current Role Badge */}
                {userProfile && (
                    <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 mb-8">
                        <span className="material-icons text-sm text-slate-400">person</span>
                        <span className="text-slate-300 text-sm">
                            Your role: <span className="font-bold text-white capitalize">{userProfile.role}</span>
                        </span>
                    </div>
                )}

                {/* Info Box */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-8 text-left">
                    <div className="flex items-start gap-3">
                        <span className="material-icons text-amber-500 text-lg mt-0.5">info</span>
                        <div>
                            <p className="text-sm text-slate-300 font-medium mb-1">Need access?</p>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Contact your system administrator to request elevated permissions.
                                Only administrators can modify user roles and access levels.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                        <span className="material-icons text-lg">dashboard</span>
                        Go to Dashboard
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-6 py-3 rounded-xl transition-all border border-slate-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessDeniedScreen;
