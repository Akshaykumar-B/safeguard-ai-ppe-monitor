/**
 * LoginScreen — Firebase Auth Login
 * ===================================
 * Email/Password login only. No self-registration.
 * Only admin-created accounts can sign in.
 * Shows disabled-account warnings from AuthContext.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginScreen = () => {
    const navigate = useNavigate();
    const { login, loginWithGoogle, currentUser, userProfile, loading, authError, setAuthError } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // If already logged in with valid profile, redirect to dashboard
    useEffect(() => {
        if (!loading && currentUser && userProfile && userProfile.status === 'active') {
            navigate('/', { replace: true });
        }
    }, [loading, currentUser, userProfile, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLocalError('');
        setAuthError('');
        setSubmitting(true);
        try {
            await login(email, password);
        } catch (err) {
            setLocalError(err.message.replace('Firebase: ', ''));
        }
        setSubmitting(false);
    };

    const handleGoogleLogin = async () => {
        setLocalError('');
        setAuthError('');
        setSubmitting(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            setLocalError(err.message.replace('Firebase: ', ''));
        }
        setSubmitting(false);
    };

    const displayError = authError || localError;

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-md relative z-10" style={{ animation: 'slideIn 0.5s ease-out' }}>
                {/* Card */}
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-800">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-600/30">
                            <span className="material-icons text-white text-3xl">security</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">SafeGuard AI</h1>
                        <p className="text-slate-400 text-sm mt-1">Industrial PPE Compliance System</p>
                    </div>

                    {/* Error Display */}
                    {displayError && (
                        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm p-4 rounded-xl mb-6 flex items-start gap-3"
                            style={{ animation: 'slideIn 0.3s ease-out' }}>
                            <span className="material-icons text-lg mt-0.5">error</span>
                            <span>{displayError}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons text-slate-500 text-lg">mail</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons text-slate-500 text-lg">lock</span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    minLength={6}
                                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    <span className="material-icons text-lg">login</span>
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-slate-700"></div>
                        <span className="text-xs text-slate-500 font-bold uppercase">or</span>
                        <div className="flex-1 h-px bg-slate-700"></div>
                    </div>

                    {/* Google Sign-In */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={submitting}
                        className="w-full bg-white hover:bg-slate-50 text-slate-800 font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 border border-slate-200 flex items-center justify-center gap-3 shadow-sm"
                    >
                        <svg width="20" height="20" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                        Continue with Google
                    </button>
                    <div className="mt-8 pt-6 border-t border-slate-800">
                        <div className="flex items-center gap-3 text-slate-500 text-xs">
                            <span className="material-icons text-sm">info</span>
                            <p>Accounts are created by your system administrator. Contact admin if you need access.</p>
                        </div>
                    </div>
                </div>

                {/* Role Legend */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                    {[
                        { role: 'Admin', icon: 'admin_panel_settings', desc: 'Full access', color: 'purple' },
                        { role: 'Staff', icon: 'shield', desc: 'Safety officer', color: 'blue' },
                        { role: 'Viewer', icon: 'visibility', desc: 'Read-only', color: 'emerald' },
                    ].map((r) => (
                        <div key={r.role} className="bg-slate-900/40 backdrop-blur-sm rounded-xl p-3 text-center border border-slate-800/50">
                            <span className={`material-icons text-lg text-${r.color}-400`}>{r.icon}</span>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">{r.role}</p>
                            <p className="text-[9px] text-slate-600">{r.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
