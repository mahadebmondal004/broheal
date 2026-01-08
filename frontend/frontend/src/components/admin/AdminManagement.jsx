import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../../services/api';

const AdminManagement = ({ mode = 'admins' }) => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [roles, setRoles] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [roleMode, setRoleMode] = useState('create'); // create | edit
    const [selectedRole, setSelectedRole] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [editForm, setEditForm] = useState({ adminRole: '', status: 'active' });
    const [newAdmin, setNewAdmin] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'Content Manager',
        password: ''
    });
    const defaultPermissions = {
        users: { view: false, create: false, edit: false, delete: false },
        therapists: { view: false, create: false, edit: false, delete: false, approveKyc: false },
        admins: { view: false, create: false, edit: false, delete: false },
        bookings: { view: false, edit: false, cancel: false },
        services: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, edit: false },
        analytics: { view: false },
        notifications: { send: false }
    };
    const [roleForm, setRoleForm] = useState({
        name: 'admin',
        displayName: '',
        permissions: { ...defaultPermissions },
        description: ''
    });
    const usedNames = roles.map(r => r.name);
    const allNames = ['super_admin', 'admin', 'manager', 'support'];
    const creatableNames = allNames.filter(n => !usedNames.includes(n));
    const roleCreatable = roleMode === 'create' ? creatableNames.length > 0 : true;

    useEffect(() => {
        loadAdmins();
        loadRoles();
    }, []);

    const loadAdmins = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/admins');
            setAdmins(response.data.admins || []);
        } catch (error) {
            console.error('Failed to load admins:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRoles = async () => {
        try {
            setLoadingRoles(true);
            const response = await api.get('/admin/manage/roles');
            setRoles(response.data.roles || []);
        } catch (error) {
            console.error('Failed to load admin roles:', error);
        } finally {
            setLoadingRoles(false);
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/admins', newAdmin);
            setShowAddModal(false);
            setNewAdmin({ name: '', email: '', phone: '', role: 'Content Manager', password: '' });
            loadAdmins();
            alert('Admin added successfully!');
        } catch (error) {
            console.error('Failed to add admin:', error);
            alert('Failed to add admin: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteAdmin = async (adminId) => {
        if (window.confirm('Are you sure you want to delete this admin?')) {
            try {
                await api.delete(`/admin/admins/${adminId}`);
                loadAdmins();
                alert('Admin deleted successfully!');
            } catch (error) {
                console.error('Failed to delete admin:', error);
                alert('Failed to delete admin: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const openRoleModal = (role) => {
        if (role) {
            setRoleMode('edit');
            setSelectedRole(role);
            setRoleForm({
                name: role.name || 'admin',
                displayName: role.displayName || '',
                permissions: { ...defaultPermissions, ...(role.permissions || {}) },
                description: role.description || ''
            });
        } else {
            setRoleMode('create');
            setSelectedRole(null);
            setRoleForm({
                name: 'admin',
                displayName: '',
                permissions: { ...defaultPermissions },
                description: ''
            });
        }
        setShowRoleModal(true);
    };

    const submitRole = async (e) => {
        e.preventDefault();
        try {
            if (roleMode === 'create') {
                await api.post('/admin/manage/roles', roleForm);
            } else if (selectedRole?._id) {
                await api.put(`/admin/manage/roles/${selectedRole._id}`, roleForm);
            }
            setShowRoleModal(false);
            loadRoles();
            alert('Role saved successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save role');
        }
    };

    const deleteRole = async (roleId) => {
        if (!roleId) return;
        if (!window.confirm('Are you sure you want to delete this role?')) return;
        try {
            await api.delete(`/admin/manage/roles/${roleId}`);
            loadRoles();
            alert('Role deleted successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete role');
        }
    };

    const openEditAdmin = (admin) => {
        setSelectedAdmin(admin);
        setEditForm({
            adminRole: admin.adminRole?._id || '',
            status: admin.status || 'active'
        });
        setShowEditModal(true);
    };

    const submitEditAdmin = async (e) => {
        e.preventDefault();
        if (!selectedAdmin?._id) return;
        try {
            await api.put(`/admin/manage/users/${selectedAdmin._id}`, {
                role: 'admin',
                adminRole: editForm.adminRole || null,
                status: editForm.status
            });
            setShowEditModal(false);
            loadAdmins();
            alert('Admin updated successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update admin');
        }
    };

    return (
        <>
            <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 card-3d animate-fade-in overflow-hidden">
                {mode !== 'roles' && (
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Admin Management
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Manage system administrators and their permissions
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium btn-3d press-effect"
                        >
                            <Plus className="w-4 h-4" />
                            Add Admin
                        </button>
                    </div>
                )}

                {mode !== 'roles' && (loading ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        Loading admins...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 dark:bg-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                {admins.map((admin) => (
                                    <tr key={admin._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                    <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm">
                                                        {admin.name.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{admin.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{admin.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-300">{admin.adminRole?.displayName || admin.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${admin.status === 'active'
                                                ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                                : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                                                }`}>
                                                {admin.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-300">{admin.lastLogin}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openEditAdmin(admin)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAdmin(admin._id)}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}



                {mode === 'roles' && (
                    <div className="px-6 py-4 border-gray-200 dark:border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-md font-semibold text-gray-900 dark:text-white">Admin Role Management</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Create, edit and delete admin roles with permissions</p>
                            </div>
                            <button onClick={() => openRoleModal(null)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all font-medium">
                                <Plus className="w-4 h-4" />
                                Add Role
                            </button>
                        </div>
                        <div className="mt-4 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                            {loadingRoles ? (
                                <div className="p-6 text-center text-gray-600 dark:text-gray-400">Loading roles...</div>
                            ) : roles.length === 0 ? (
                                <div className="p-6 text-gray-600 dark:text-gray-400">No roles found</div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50/50 dark:bg-white/5">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Display Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">System Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Key Permissions</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                        {roles.map((r) => (
                                            <tr key={r._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-3 text-gray-900 dark:text-white font-medium">{r.displayName}</td>
                                                <td className="px-6 py-3 text-gray-500 dark:text-gray-400">{r.name}</td>
                                                <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                    <div className="flex flex-wrap gap-2">
                                                        {r.permissions?.users?.view && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">Users</span>}
                                                        {r.permissions?.therapists?.view && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">Therapists</span>}
                                                        {r.permissions?.therapists?.approveKyc && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">Approve KYC</span>}
                                                        {r.permissions?.bookings?.view && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border border-pink-200 dark:border-pink-800">Bookings</span>}
                                                        {r.permissions?.services?.view && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">Services</span>}
                                                        {r.permissions?.settings?.view && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">Settings</span>}
                                                        {r.permissions?.analytics?.view && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800">Analytics</span>}
                                                        {r.permissions?.notifications?.send && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">Notify</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => openRoleModal(r)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 transition-colors">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => deleteRole(r._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {
                showAddModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10 shadow-2xl">
                            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Add New Admin</h3>
                            <form onSubmit={handleAddAdmin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAdmin.name}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        placeholder="Full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        required
                                        value={newAdmin.phone}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        placeholder="10-digit phone"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={newAdmin.email}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                    <select
                                        value={newAdmin.role}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    >
                                        <option value="Content Manager">Content Manager</option>
                                        <option value="Support Manager">Support Manager</option>
                                        <option value="Therapist Manager">Therapist Manager</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={newAdmin.password}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        placeholder="Enter password"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-medium">
                                        Add Admin
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {
                showRoleModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10 shadow-2xl">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10 sticky top-0 bg-white dark:bg-slate-900 z-10">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{roleMode === 'create' ? 'Create Role' : 'Edit Role'}</h3>
                                <button onClick={() => setShowRoleModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={submitRole} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">System Name</label>
                                        <select
                                            value={roleForm.name}
                                            onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                            required
                                        >
                                            {(roleMode === 'create' ? creatableNames : allNames).map(n => (
                                                <option key={n} value={n}>{n}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                                        <input
                                            type="text"
                                            value={roleForm.displayName}
                                            onChange={(e) => setRoleForm({ ...roleForm, displayName: e.target.value })}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                            placeholder="e.g., Content Manager"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(roleForm.permissions).map(([groupKey, groupVal]) => {
                                            const allChecked = Object.values(groupVal).every(val => val === true);
                                            return (
                                                <div key={groupKey} className="border border-gray-200 dark:border-white/10 rounded-xl p-3 bg-gray-50/50 dark:bg-slate-900/50">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="text-sm font-semibold capitalize text-gray-900 dark:text-white">{groupKey}</div>
                                                        <label className="inline-flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 cursor-pointer font-medium hover:text-blue-700 dark:hover:text-blue-300">
                                                            <input
                                                                type="checkbox"
                                                                checked={allChecked}
                                                                onChange={(e) => {
                                                                    const isChecked = e.target.checked;
                                                                    const updated = { ...roleForm.permissions };
                                                                    const updatedGroup = { ...updated[groupKey] };
                                                                    Object.keys(updatedGroup).forEach(k => {
                                                                        updatedGroup[k] = isChecked;
                                                                    });
                                                                    updated[groupKey] = updatedGroup;
                                                                    setRoleForm({ ...roleForm, permissions: updated });
                                                                }}
                                                                className="rounded border-gray-300 dark:border-white/10 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                                                            />
                                                            Select All
                                                        </label>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.keys(groupVal).map((permKey) => (
                                                            <label key={permKey} className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!roleForm.permissions[groupKey][permKey]}
                                                                    onChange={(e) => {
                                                                        const updated = { ...roleForm.permissions };
                                                                        updated[groupKey][permKey] = e.target.checked;
                                                                        setRoleForm({ ...roleForm, permissions: updated });
                                                                    }}
                                                                    className="rounded border-gray-300 dark:border-white/10 text-blue-600 focus:ring-blue-500 bg-transparent"
                                                                />
                                                                <span className="capitalize">{permKey}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                    <textarea
                                        value={roleForm.description}
                                        onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-white/10 mt-4">
                                    <button type="button" onClick={() => setShowRoleModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
                                    <button type="submit" disabled={!roleCreatable} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-medium">{roleMode === 'create' ? 'Create Role' : 'Save Changes'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {
                showEditModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10 shadow-2xl">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10 sticky top-0 bg-white dark:bg-slate-900 z-10">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Admin</h3>
                                <button onClick={() => setShowEditModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={submitEditAdmin} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                    <select
                                        value={editForm.adminRole}
                                        onChange={(e) => setEditForm({ ...editForm, adminRole: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    >
                                        <option value="">No Role</option>
                                        {roles.map(r => (
                                            <option key={r._id} value={r._id}>{r.displayName} ({r.name})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    >
                                        <option value="active">active</option>
                                        <option value="inactive">inactive</option>
                                        <option value="blocked">blocked</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-white/10 mt-4">
                                    <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-medium">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default AdminManagement;
