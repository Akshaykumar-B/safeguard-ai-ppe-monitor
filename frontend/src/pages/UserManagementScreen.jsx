/**
 * UserManagementScreen — Admin-Only User Management (v2)
 * ========================================================
 * Uses invitation system: Admin adds email + role → Firestore record.
 * When invited user signs in via Google, they get the pre-assigned role.
 * No client-side Firebase Auth account creation (avoids session issues).
 */

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

const UserManagementScreen = () => {
    const {
        currentUser,
        userProfile,
        getAllUsers,
        inviteUser,
        updateUserRole,
        toggleUserStatus,
        deleteUser,
        MAX_STAFF_ACCOUNTS,
    } = useAuth();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Invite form
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteName, setInviteName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('viewer');
    const [inviting, setInviting] = useState(false);

    // Edit modal
    const [editUser, setEditUser] = useState(null);
    const [editRole, setEditRole] = useState('');

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    }, [getAllUsers]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const showMessage = (msg, type = 'success') => {
        if (type === 'success') {
            setSuccess(msg);
            setError('');
        } else {
            setError(msg);
            setSuccess('');
        }
        setTimeout(() => { setSuccess(''); setError(''); }, 4000);
    };

    // ── Invite User ────────────────────────────────────────
    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteName.trim() || !inviteEmail.trim()) {
            showMessage('Name and email are required.', 'error');
            return;
        }
        setInviting(true);
        try {
            await inviteUser(inviteName.trim(), inviteEmail.trim().toLowerCase(), inviteRole);
            showMessage(`Invited ${inviteName} as ${inviteRole}`);
            setInviteName('');
            setInviteEmail('');
            setInviteRole('viewer');
            setShowInviteForm(false);
            loadUsers();
        } catch (err) {
            showMessage(err.message, 'error');
        }
        setInviting(false);
    };

    // ── Change Role ────────────────────────────────────────
    const handleRoleChange = async () => {
        if (!editUser || !editRole) return;
        try {
            await updateUserRole(editUser.uid, editRole);
            showMessage(`Role updated to ${editRole} for ${editUser.name}`);
            setEditUser(null);
            loadUsers();
        } catch (err) {
            showMessage(err.message, 'error');
        }
    };

    // ── Toggle Status ──────────────────────────────────────
    const handleToggleStatus = async (user) => {
        const newStatus = user.status === 'active' ? 'disabled' : 'active';
        try {
            await toggleUserStatus(user.uid, newStatus);
            showMessage(`${user.name} is now ${newStatus}`);
            loadUsers();
        } catch (err) {
            showMessage(err.message, 'error');
        }
    };

    // ── Delete User ────────────────────────────────────────
    const handleDelete = async (user) => {
        if (!confirm(`Delete ${user.name} (${user.email})? This cannot be undone.`)) return;
        try {
            await deleteUser(user.uid);
            showMessage(`${user.name} deleted`);
            loadUsers();
        } catch (err) {
            showMessage(err.message, 'error');
        }
    };

    const roleBadge = (role) => {
        const colors = {
            admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            staff: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            viewer: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        };
        return (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border ${colors[role] || colors.viewer}`}>
                {role}
            </span>
        );
    };

    const statusBadge = (status) => {
        return status === 'active' ? (
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Active
            </span>
        ) : (
            <span className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
                <span className="w-2 h-2 bg-rose-400 rounded-full"></span>
                Disabled
            </span>
        );
    };

    const staffCount = users.filter(u => u.role === 'staff').length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const activeCount = users.filter(u => u.status === 'active').length;

    return (
        <div className="flex h-screen bg-slate-950 text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>

                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold">User Management</h1>
                            <p className="text-slate-400 text-sm mt-1">
                                Invite users by email — they sign in with Google and get the assigned role.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowInviteForm(!showInviteForm)}
                            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-purple-600/20"
                        >
                            <span className="material-icons text-lg">person_add</span>
                            Invite User
                        </button>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                            <span className="material-icons text-lg">error</span>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                            <span className="material-icons text-lg">check_circle</span>
                            {success}
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Total Users', value: users.length, icon: 'people', color: 'blue' },
                            { label: 'Active', value: activeCount, icon: 'check_circle', color: 'emerald' },
                            { label: 'Admins', value: adminCount, icon: 'shield', color: 'purple' },
                            { label: 'Staff', value: `${staffCount}/${MAX_STAFF_ACCOUNTS}`, icon: 'badge', color: 'amber' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 bg-${stat.color}-500/10 rounded-xl flex items-center justify-center`}>
                                        <span className={`material-icons text-${stat.color}-400`}>{stat.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        <p className="text-xs text-slate-400">{stat.label}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Invite Form */}
                    {showInviteForm && (
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 mb-6" style={{ animation: 'slideIn 0.3s ease-out' }}>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-icons text-purple-400">person_add</span>
                                Invite New User
                            </h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Add their email and role. When they sign in with Google using this email, they'll get the assigned role automatically.
                            </p>
                            <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Name</label>
                                    <input
                                        type="text"
                                        value={inviteName}
                                        onChange={(e) => setInviteName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Email</label>
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="john@example.com"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Role</label>
                                    <select
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none transition-colors"
                                    >
                                        <option value="viewer">Viewer — Read only</option>
                                        <option value="staff">Staff — Can acknowledge violations</option>
                                        <option value="admin">Admin — Full access</option>
                                    </select>
                                </div>
                                <div className="flex items-end gap-2">
                                    <button
                                        type="submit"
                                        disabled={inviting}
                                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {inviting ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <span className="material-icons text-sm">send</span>
                                        )}
                                        Invite
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowInviteForm(false)}
                                        className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                                    >
                                        <span className="material-icons text-sm">close</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Users Table */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-800">
                                        <th className="text-left px-6 py-4 text-xs text-slate-400 font-bold uppercase">User</th>
                                        <th className="text-left px-6 py-4 text-xs text-slate-400 font-bold uppercase">Role</th>
                                        <th className="text-left px-6 py-4 text-xs text-slate-400 font-bold uppercase">Status</th>
                                        <th className="text-left px-6 py-4 text-xs text-slate-400 font-bold uppercase">Type</th>
                                        <th className="text-right px-6 py-4 text-xs text-slate-400 font-bold uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => {
                                        const isSelf = user.uid === currentUser?.uid;
                                        return (
                                            <tr key={user.uid} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                            {(user.name || 'U')[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-white flex items-center gap-2">
                                                                {user.name}
                                                                {isSelf && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold">YOU</span>}
                                                            </p>
                                                            <p className="text-xs text-slate-400">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">{roleBadge(user.role)}</td>
                                                <td className="px-6 py-4">{statusBadge(user.status)}</td>
                                                <td className="px-6 py-4">
                                                    {user.isInvite ? (
                                                        <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 font-semibold">
                                                            Invited
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 font-semibold">
                                                            Registered
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {!isSelf && (
                                                        <div className="flex items-center gap-2 justify-end">
                                                            <button
                                                                onClick={() => { setEditUser(user); setEditRole(user.role); }}
                                                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                                                title="Change role"
                                                            >
                                                                <span className="material-icons text-sm text-slate-400">edit</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleStatus(user)}
                                                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                                                title={user.status === 'active' ? 'Disable' : 'Enable'}
                                                            >
                                                                <span className={`material-icons text-sm ${user.status === 'active' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                                    {user.status === 'active' ? 'block' : 'check_circle'}
                                                                </span>
                                                            </button>
                                                            {user.isInvite && (
                                                                <button
                                                                    onClick={() => handleDelete(user)}
                                                                    className="p-2 hover:bg-rose-900/30 rounded-lg transition-colors"
                                                                    title="Delete invitation"
                                                                >
                                                                    <span className="material-icons text-sm text-rose-400">delete</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center py-12 text-slate-500">
                                                <span className="material-icons text-4xl mb-2 block">people_outline</span>
                                                No users found. Click "Invite User" to add team members.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* How It Works */}
                    <div className="mt-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                            <span className="material-icons text-sm text-blue-400">info</span>
                            How Invitations Work
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { step: '1', title: 'You invite', desc: 'Add their email and choose a role (Viewer, Staff, or Admin)' },
                                { step: '2', title: 'They sign in', desc: 'User signs in with Google using the same email address' },
                                { step: '3', title: 'Role assigned', desc: 'They automatically get the role you assigned' },
                            ].map((item) => (
                                <div key={item.step} className="flex items-start gap-3">
                                    <div className="w-7 h-7 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 font-bold text-sm flex-shrink-0">
                                        {item.step}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{item.title}</p>
                                        <p className="text-xs text-slate-400">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            {/* Edit Role Modal */}
            {editUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl" style={{ animation: 'slideIn 0.2s ease-out' }}>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-icons text-purple-400">edit</span>
                            Change Role
                        </h3>
                        <div className="bg-slate-800/60 rounded-xl p-3 mb-4 border border-slate-700">
                            <p className="font-semibold text-white">{editUser.name}</p>
                            <p className="text-xs text-slate-400">{editUser.email}</p>
                        </div>
                        <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white mb-4 focus:border-purple-500 focus:outline-none"
                        >
                            <option value="viewer">Viewer — Read only</option>
                            <option value="staff">Staff — Can acknowledge violations</option>
                            <option value="admin">Admin — Full access</option>
                        </select>
                        <div className="flex gap-3">
                            <button
                                onClick={handleRoleChange}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-semibold transition-colors"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setEditUser(null)}
                                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementScreen;
