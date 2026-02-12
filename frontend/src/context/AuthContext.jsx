/**
 * AuthContext — Role-Based Authentication Context (v2)
 * =====================================================
 * - Google Sign-In as primary auth method
 * - Email/Password login for pre-registered users
 * - Admin "invites" users by adding their email + role to Firestore
 * - First Google sign-in user ONLY becomes admin
 * - Subsequent users get role from Firestore invitation or default 'viewer'
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebase';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
} from 'firebase/auth';
import { googleProvider } from '../firebase';
import {
    doc,
    getDoc,
    setDoc,
    getDocs,
    updateDoc,
    collection,
    query,
    where,
    serverTimestamp,
    orderBy,
} from 'firebase/firestore';

const AuthContext = createContext(null);

// ── ADMIN EMAILS (Fallback when Firestore is unreachable) ──
// Add your Gmail addresses here to get admin access even when Firestore fails
const ADMIN_EMAILS = [
    'akshaykumarbandam@gmail.com',
    // Add more admin emails below:
];

// ── Permission Matrix ──────────────────────────────────────
const PERMISSIONS = {
    admin: {
        dashboard: true,
        liveMonitoring: true,
        workerManagement: true,
        faceDatasetUpload: true,
        violationLogs: true,
        acknowledgeViolations: true,
        analyticsReports: true,
        systemSettings: true,
        userManagement: true,
    },
    staff: {
        dashboard: true,
        liveMonitoring: true,
        workerManagement: false,
        faceDatasetUpload: false,
        violationLogs: true,
        acknowledgeViolations: true,
        analyticsReports: true,
        systemSettings: false,
        userManagement: false,
    },
    viewer: {
        dashboard: true,
        liveMonitoring: true,
        workerManagement: false,
        faceDatasetUpload: false,
        violationLogs: true,
        acknowledgeViolations: false,
        analyticsReports: true,
        systemSettings: false,
        userManagement: false,
    },
};

const MAX_STAFF_ACCOUNTS = 5;

// ── Timeout helper ─────────────────────────────────────────
function withTimeout(promise, ms = 6000) {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Firestore timeout')), ms)
        ),
    ]);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState('');
    const [firestoreOk, setFirestoreOk] = useState(true);

    // ── Auth state listener ────────────────────────────────
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);

            if (!firebaseUser) {
                setCurrentUser(null);
                setUserProfile(null);
                setLoading(false);
                return;
            }

            setCurrentUser(firebaseUser);

            // Try to load or create Firestore profile
            try {
                // 1. Check if user already has a profile
                const docRef = doc(db, 'users', firebaseUser.uid);
                const docSnap = await withTimeout(getDoc(docRef));
                setFirestoreOk(true);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.status === 'disabled') {
                        await signOut(auth);
                        setCurrentUser(null);
                        setUserProfile(null);
                        setAuthError('Your account has been disabled. Contact the administrator.');
                        setLoading(false);
                        return;
                    }
                    setUserProfile({ uid: firebaseUser.uid, ...data });
                    setAuthError('');
                } else {
                    // 2. New user — check for pre-registered invitation by email
                    let assignRole = 'viewer';
                    let assignName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
                    let inviteDocId = null;

                    try {
                        // Check if this email was invited
                        const inviteQ = query(
                            collection(db, 'users'),
                            where('email', '==', firebaseUser.email),
                            where('isInvite', '==', true)
                        );
                        const inviteSnap = await withTimeout(getDocs(inviteQ));
                        if (!inviteSnap.empty) {
                            const inviteData = inviteSnap.docs[0].data();
                            assignRole = inviteData.role || 'viewer';
                            assignName = inviteData.name || assignName;
                            inviteDocId = inviteSnap.docs[0].id;
                        } else {
                            // No invitation — check if any admin exists
                            const adminQ = query(collection(db, 'users'), where('role', '==', 'admin'));
                            const adminSnap = await withTimeout(getDocs(adminQ));
                            if (adminSnap.empty) {
                                assignRole = 'admin'; // FIRST user ever → admin
                            }
                        }
                    } catch {
                        assignRole = 'viewer';
                    }

                    // 3. Create real profile in Firestore
                    const newProfile = {
                        name: assignName,
                        email: firebaseUser.email,
                        role: assignRole,
                        status: 'active',
                        createdAt: serverTimestamp(),
                    };

                    try {
                        await withTimeout(setDoc(docRef, newProfile));
                        // Delete the invite record if it existed
                        if (inviteDocId) {
                            const { deleteDoc: delDoc } = await import('firebase/firestore');
                            try { await withTimeout(delDoc(doc(db, 'users', inviteDocId))); } catch { }
                        }
                    } catch {
                        console.warn('Could not save profile to Firestore');
                    }

                    setUserProfile({ uid: firebaseUser.uid, ...newProfile, createdAt: new Date() });
                    setAuthError('');
                }
            } catch (err) {
                console.warn('Firestore error:', err.message);
                setFirestoreOk(false);
                // Fallback: Check if email is in hardcoded admin list
                const isAdminEmail = ADMIN_EMAILS.includes(firebaseUser.email?.toLowerCase());
                setUserProfile({
                    uid: firebaseUser.uid,
                    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                    email: firebaseUser.email,
                    role: isAdminEmail ? 'admin' : 'viewer',
                    status: 'active',
                });
                setAuthError(isAdminEmail
                    ? 'Limited mode: Firestore is unreachable. Using fallback admin access.'
                    : 'Limited mode: Firestore is unreachable. Contact admin.');
            }

            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // ── Login (Email/Password) ─────────────────────────────
    const login = async (email, password) => {
        setAuthError('');
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            return cred.user;
        } catch (err) {
            const msg = err.message.replace('Firebase: ', '');
            setAuthError(msg);
            throw err;
        }
    };

    // ── Login with Google ──────────────────────────────────
    const loginWithGoogle = async () => {
        setAuthError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        } catch (err) {
            const msg = err.message.replace('Firebase: ', '');
            setAuthError(msg);
            throw err;
        }
    };

    // ── Logout ─────────────────────────────────────────────
    const logout = async () => {
        await signOut(auth);
        setCurrentUser(null);
        setUserProfile(null);
    };

    // ── Invite User (Admin Only) ───────────────────────────
    //    Creates a Firestore record by email. When the invited
    //    user signs in via Google, they get the assigned role.
    const inviteUser = async (name, email, role) => {
        if (!userProfile || userProfile.role !== 'admin') {
            throw new Error('Only administrators can invite users.');
        }
        if (!['admin', 'staff', 'viewer'].includes(role)) {
            throw new Error('Invalid role.');
        }

        // Enforce max staff limit
        if (role === 'staff') {
            const staffQ = query(collection(db, 'users'), where('role', '==', 'staff'));
            const staffSnap = await withTimeout(getDocs(staffQ));
            if (staffSnap.size >= MAX_STAFF_ACCOUNTS) {
                throw new Error(`Maximum of ${MAX_STAFF_ACCOUNTS} staff accounts reached.`);
            }
        }

        // Check if email already exists
        const existingQ = query(collection(db, 'users'), where('email', '==', email));
        const existingSnap = await withTimeout(getDocs(existingQ));
        if (!existingSnap.empty) {
            throw new Error('A user with this email already exists.');
        }

        // Create invitation record (using email hash as doc ID for pre-registration)
        const inviteId = 'invite_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '');
        await withTimeout(setDoc(doc(db, 'users', inviteId), {
            name,
            email,
            role,
            status: 'active',
            createdAt: serverTimestamp(),
            isInvite: true, // Marks this as a pre-registered invitation
        }));

        return { id: inviteId, name, email, role, status: 'active', isInvite: true };
    };

    // ── Update User Role (Admin Only) ──────────────────────
    const updateUserRole = async (uid, newRole) => {
        if (!userProfile || userProfile.role !== 'admin') {
            throw new Error('Only administrators can update roles.');
        }
        if (!['admin', 'staff', 'viewer'].includes(newRole)) {
            throw new Error('Invalid role.');
        }
        if (newRole === 'staff') {
            const staffQ = query(collection(db, 'users'), where('role', '==', 'staff'));
            const staffSnap = await withTimeout(getDocs(staffQ));
            const currentStaffCount = staffSnap.docs.filter(d => d.id !== uid).length;
            if (currentStaffCount >= MAX_STAFF_ACCOUNTS) {
                throw new Error(`Maximum of ${MAX_STAFF_ACCOUNTS} staff accounts reached.`);
            }
        }
        await withTimeout(updateDoc(doc(db, 'users', uid), { role: newRole }));
    };

    // ── Toggle User Status (Admin Only) ────────────────────
    const toggleUserStatus = async (uid, newStatus) => {
        if (!userProfile || userProfile.role !== 'admin') {
            throw new Error('Only administrators can change user status.');
        }
        if (uid === currentUser?.uid) {
            throw new Error('You cannot disable your own account.');
        }
        await withTimeout(updateDoc(doc(db, 'users', uid), { status: newStatus }));
    };

    // ── Delete User (Admin Only) ──────────────────────────
    const deleteUser = async (uid) => {
        if (!userProfile || userProfile.role !== 'admin') {
            throw new Error('Only administrators can delete users.');
        }
        if (uid === currentUser?.uid) {
            throw new Error('You cannot delete your own account.');
        }
        const { deleteDoc } = await import('firebase/firestore');
        await withTimeout(deleteDoc(doc(db, 'users', uid)));
    };

    // ── Get All Users (Admin Only) ─────────────────────────
    const getAllUsers = async () => {
        if (!userProfile || userProfile.role !== 'admin') {
            throw new Error('Only administrators can view user list.');
        }
        const usersSnap = await withTimeout(
            getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')))
        );
        return usersSnap.docs.map(d => ({ uid: d.id, ...d.data() }));
    };

    // ── Permission Check ───────────────────────────────────
    const hasPermission = useCallback((feature) => {
        if (!userProfile) return false;
        const rolePerms = PERMISSIONS[userProfile.role];
        if (!rolePerms) return false;
        return rolePerms[feature] === true;
    }, [userProfile]);

    const isAdmin = userProfile?.role === 'admin';
    const isStaff = userProfile?.role === 'staff';
    const isViewer = userProfile?.role === 'viewer';

    const value = {
        currentUser,
        userProfile,
        loading,
        authError,
        setAuthError,
        firestoreOk,
        login,
        loginWithGoogle,
        logout,
        inviteUser,
        updateUserRole,
        toggleUserStatus,
        deleteUser,
        getAllUsers,
        hasPermission,
        isAdmin,
        isStaff,
        isViewer,
        PERMISSIONS,
        MAX_STAFF_ACCOUNTS,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
