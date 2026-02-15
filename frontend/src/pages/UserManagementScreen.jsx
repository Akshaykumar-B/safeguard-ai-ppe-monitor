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
            admin: 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/25',
            staff: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25',
            viewer: 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-500/25',
        };
        return (
            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${colors[role] || colors.viewer}`}>
                {role}
            </span>
        );
    };

    const statusBadge = (status) => {
        return status === 'active' ? (
            <span className="flex items-center gap-2 text-xs font-bold">
                <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400">Active</span>
            </span>
        ) : (
            <span className="flex items-center gap-2 text-xs font-bold">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
                <span className="text-rose-400">Disabled</span>
            </span>
        );
    };

    const staffCount = users.filter(u => u.role === 'staff').length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const activeCount = users.filter(u => u.status === 'active').length;

    return (
        <div className="flex h-screen bg-[#0a0e1a] text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8" style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>

                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">User Management</h1>
                            <p className="text-slate-400 text-sm mt-1.5">
                                Invite users by email — they sign in with Google and get the assigned role.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowInviteForm(!showInviteForm)}
                            className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2.5 transition-all shadow-xl shadow-purple-600/30 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
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
                    <div className="grid grid-cols-4 gap-5 mb-8">
                        {[
                            { label: 'Total Users', value: users.length, icon: 'people', gradient: 'from-blue-600 to-cyan-500', shadow: 'shadow-blue-600/30', iconBg: 'bg-white/20' },
                            { label: 'Active', value: activeCount, icon: 'check_circle', gradient: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-600/30', iconBg: 'bg-white/20' },
                            { label: 'Admins', value: adminCount, icon: 'shield', gradient: 'from-purple-600 to-violet-500', shadow: 'shadow-purple-600/30', iconBg: 'bg-white/20' },
                            { label: 'Staff', value: `${staffCount}/${MAX_STAFF_ACCOUNTS}`, icon: 'badge', gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-600/30', iconBg: 'bg-white/20' },
                        ].map((stat) => (
                            <div key={stat.label} className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-5 shadow-xl ${stat.shadow} relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
                                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                                <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/5 rounded-tl-full"></div>
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className={`w-12 h-12 ${stat.iconBg} backdrop-blur-sm rounded-2xl flex items-center justify-center`}>
                                        <span className="material-icons text-white text-xl">{stat.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black text-white">{stat.value}</p>
                                        <p className="text-xs text-white/70 font-bold uppercase tracking-wider">{stat.label}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Invite Form */}
                    {showInviteForm && (
                        <div className="bg-gradient-to-br from-[#111827] to-[#0f172a] border border-purple-500/20 rounded-3xl p-7 mb-8 shadow-2xl shadow-purple-900/10 relative overflow-hidden" style={{ animation: 'slideIn 0.3s ease-out' }}>
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl"></div>
                            <h3 className="text-lg font-black mb-2 flex items-center gap-2.5 relative z-10">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                                    <span className="material-icons text-white text-sm">person_add</span>
                                </div>
                                Invite New User
                            </h3>
                            <p className="text-slate-400 text-sm mb-5 relative z-10">
                                Add their email and role. When they sign in with Google using this email, they'll get the assigned role automatically.
                            </p>
                            <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
                                <div>
                                    <label className="text-[10px] text-purple-300 font-black uppercase mb-1.5 block tracking-widest">Name</label>
                                    <input
                                        type="text"
                                        value={inviteName}
                                        onChange={(e) => setInviteName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all placeholder:text-slate-600"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-purple-300 font-black uppercase mb-1.5 block tracking-widest">Email</label>
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="john@example.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all placeholder:text-slate-600"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-purple-300 font-black uppercase mb-1.5 block tracking-widest">Role</label>
                                    <select
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
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
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
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
                                        className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
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
                        <div className="bg-[#111827]/80 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.02]">
                                        <th className="text-left px-6 py-5 text-[10px] text-slate-400 font-black uppercase tracking-widest">User</th>
                                        <th className="text-left px-6 py-5 text-[10px] text-slate-400 font-black uppercase tracking-widest">Role</th>
                                        <th className="text-left px-6 py-5 text-[10px] text-slate-400 font-black uppercase tracking-widest">Status</th>
                                        <th className="text-left px-6 py-5 text-[10px] text-slate-400 font-black uppercase tracking-widest">Type</th>
                                        <th className="text-right px-6 py-5 text-[10px] text-slate-400 font-black uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, index) => {
                                        const isSelf = user.uid === currentUser?.uid;
                                        const avatarGradients = [
                                            'from-violet-500 to-purple-600',
                                            'from-blue-500 to-cyan-500',
                                            'from-emerald-500 to-teal-500',
                                            'from-rose-500 to-pink-600',
                                            'from-amber-500 to-orange-500',
                                            'from-indigo-500 to-blue-600',
                                        ];
                                        const avatarGrad = avatarGradients[index % avatarGradients.length];
                                        return (
                                            <tr key={user.uid} className="border-b border-white/5 hover:bg-white/[0.03] transition-all group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-11 h-11 bg-gradient-to-br ${avatarGrad} rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg`}>
                                                            {(user.name || 'U')[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white flex items-center gap-2">
                                                                {user.name}
                                                                {isSelf && <span className="text-[9px] bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-2 py-0.5 rounded-full font-black tracking-wide shadow-sm">YOU</span>}
                                                            </p>
                                                            <p className="text-xs text-slate-500">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">{roleBadge(user.role)}</td>
                                                <td className="px-6 py-4">{statusBadge(user.status)}</td>
                                                <td className="px-6 py-5">
                                                    {user.isInvite ? (
                                                        <span className="text-[10px] text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 font-black uppercase tracking-wider">
                                                            Invited
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 font-black uppercase tracking-wider">
                                                            Registered
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    {!isSelf && (
                                                        <div className="flex items-center gap-1.5 justify-end">
                                                            <button
                                                                onClick={() => { setEditUser(user); setEditRole(user.role); }}
                                                                className="p-2.5 hover:bg-blue-500/10 rounded-xl transition-all group/btn"
                                                                title="Change role"
                                                            >
                                                                <span className="material-icons text-sm text-slate-500 group-hover/btn:text-blue-400 transition-colors">edit</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleStatus(user)}
                                                                className="p-2.5 hover:bg-amber-500/10 rounded-xl transition-all group/btn"
                                                                title={user.status === 'active' ? 'Disable' : 'Enable'}
                                                            >
                                                                <span className={`material-icons text-sm transition-colors group-hover/btn:scale-110 ${user.status === 'active' ? 'text-slate-500 group-hover/btn:text-amber-400' : 'text-slate-500 group-hover/btn:text-emerald-400'}`}>
                                                                    {user.status === 'active' ? 'block' : 'check_circle'}
                                                                </span>
                                                            </button>
                                                            {user.isInvite && (
                                                                <button
                                                                    onClick={() => handleDelete(user)}
                                                                    className="p-2.5 hover:bg-rose-500/10 rounded-xl transition-all group/btn"
                                                                    title="Delete invitation"
                                                                >
                                                                    <span className="material-icons text-sm text-slate-500 group-hover/btn:text-rose-400 transition-colors">delete</span>
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
                    <div className="mt-8 bg-gradient-to-br from-[#111827] to-[#0f172a] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
                        <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2.5 relative z-10">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                                <span className="material-icons text-white text-xs">info</span>
                            </div>
                            How Invitations Work
                        </h3>
                        <div className="grid grid-cols-3 gap-5 relative z-10">
                            {[
                                { step: '1', title: 'You invite', desc: 'Add their email and choose a role (Viewer, Staff, or Admin)', gradient: 'from-violet-500 to-purple-600' },
                                { step: '2', title: 'They sign in', desc: 'User signs in with Google using the same email address', gradient: 'from-blue-500 to-cyan-500' },
                                { step: '3', title: 'Role assigned', desc: 'They automatically get the role you assigned', gradient: 'from-emerald-500 to-teal-500' },
                            ].map((item) => (
                                <div key={item.step} className="flex items-start gap-3.5 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                                    <div className={`w-8 h-8 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-lg`}>
                                        {item.step}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{item.title}</p>
                                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            {/* Edit Role Modal */}
            {editUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
                    <div className="bg-gradient-to-br from-[#111827] to-[#0f172a] border border-white/10 rounded-3xl p-7 w-full max-w-md shadow-2xl relative overflow-hidden" style={{ animation: 'slideIn 0.2s ease-out' }}>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                        <h3 className="text-lg font-black text-white mb-5 flex items-center gap-3 relative z-10">
                            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <span className="material-icons text-white text-sm">edit</span>
                            </div>
                            Change Role
                        </h3>
                        <div className="bg-white/5 rounded-2xl p-4 mb-5 border border-white/5 relative z-10">
                            <p className="font-bold text-white">{editUser.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{editUser.email}</p>
                        </div>
                        <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white mb-5 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all relative z-10"
                        >
                            <option value="viewer">Viewer — Read only</option>
                            <option value="staff">Staff — Can acknowledge violations</option>
                            <option value="admin">Admin — Full access</option>
                        </select>
                        <div className="flex gap-3 relative z-10">
                            <button
                                onClick={handleRoleChange}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-600/30"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => setEditUser(null)}
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-all"
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
