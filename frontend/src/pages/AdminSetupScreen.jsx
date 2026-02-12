/**
 * AdminSetupScreen — One-Time Admin Promotion
 * =============================================
 * Accessible at /setup-admin ONLY when no admin user exists in Firestore.
 * Allows the current logged-in user to self-promote to admin.
 * After the first admin is created, this page becomes inaccessible.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, setDoc, query, where, serverTimestamp } from 'firebase/firestore';

const AdminSetupScreen = () => {
    const navigate = useNavigate();
    const { currentUser, userProfile, loading } = useAuth();
    const [checking, setChecking] = useState(true);
    const [hasAdmin, setHasAdmin] = useState(false);
    const [promoting, setPromoting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        checkForAdmin();
    }, []);

    const checkForAdmin = async () => {
        try {
            const adminQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
            const snap = await getDocs(adminQuery);
            setHasAdmin(!snap.empty);
        } catch (err) {
            console.warn('Could not check for admin:', err);
            setHasAdmin(false); // Allow setup if we can't check
        }
        setChecking(false);
    };

    const promoteToAdmin = async () => {
        if (!currentUser) return;
        setPromoting(true);
        setError('');
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            // Try to update existing doc first
            try {
                await updateDoc(userRef, { role: 'admin', status: 'active' });
            } catch {
                // If doc doesn't exist, create it
                await setDoc(userRef, {
                    name: currentUser.displayName || currentUser.email.split('@')[0],
                    email: currentUser.email,
                    role: 'admin',
                    status: 'active',
                    createdAt: serverTimestamp(),
                });
            }
            setSuccess(true);
            setTimeout(() => {
                window.location.href = '/'; // Full reload to refresh auth state
            }, 1500);
        } catch (err) {
            setError('Failed to promote: ' + err.message);
        }
        setPromoting(false);
    };

    if (loading || checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (hasAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center max-w-md px-6">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                        <span className="material-icons text-emerald-500 text-3xl">check_circle</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Admin Already Exists</h1>
                    <p className="text-slate-400 text-sm mb-6">An administrator account already exists. Contact your admin to change your role.</p>
                    <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="max-w-md w-full px-6" style={{ animation: 'slideIn 0.5s ease-out' }}>
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-purple-600/30">
                            <span className="material-icons text-white text-3xl">admin_panel_settings</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">Admin Setup</h1>
                        <p className="text-slate-400 text-sm mt-2">No administrator found. Set up the first admin account.</p>
                    </div>

                    {currentUser && (
                        <div className="bg-slate-800/60 rounded-xl p-4 mb-6 border border-slate-700">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-2">Your Account</p>
                            <p className="text-white font-semibold">{currentUser.displayName || currentUser.email}</p>
                            <p className="text-slate-400 text-sm">{currentUser.email}</p>
                            {userProfile && (
                                <p className="text-xs text-amber-400 mt-2">Current role: <span className="font-bold uppercase">{userProfile.role}</span></p>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm p-3 rounded-xl mb-4">
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm p-4 rounded-xl flex items-center gap-3">
                            <span className="material-icons">check_circle</span>
                            <span>Promoted to Admin! Redirecting...</span>
                        </div>
                    ) : (
                        <button
                            onClick={promoteToAdmin}
                            disabled={promoting || !currentUser}
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
                        >
                            {promoting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Promoting...
                                </>
                            ) : (
                                <>
                                    <span className="material-icons text-lg">security</span>
                                    Make Me Administrator
                                </>
                            )}
                        </button>
                    )}

                    <p className="text-[10px] text-slate-600 text-center mt-4">
                        This page is only accessible when no admin exists.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminSetupScreen;
