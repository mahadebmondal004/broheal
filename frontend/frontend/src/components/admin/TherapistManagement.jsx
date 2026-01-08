import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Download, Calendar, MapPin, Search, X } from 'lucide-react';
import api from '../../services/api';

const TherapistManagement = () => {
    const [therapists, setTherapists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSlotsModal, setShowSlotsModal] = useState(false);
    const [selectedTherapist, setSelectedTherapist] = useState(null);
    const [slotsDate, setSlotsDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [slots, setSlots] = useState([]);
    const [allSlots, setAllSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [groupedSlots, setGroupedSlots] = useState({});
    const [query, setQuery] = useState('');
    const [kycFilter, setKycFilter] = useState('all');
    const [newTherapist, setNewTherapist] = useState({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        password: ''
    });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTherapist, setEditTherapist] = useState({
        name: '',
        email: '',
        phone: '',
        specialization: ''
    });

    const to12h = (val) => {
        if (!val) return '';
        const [hh, mm] = String(val).split(':').map(Number);
        const am = hh < 12;
        const h12 = hh % 12 === 0 ? 12 : hh % 12;
        return `${h12}:${String(mm).padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
    };

    const getSlotHour = (t) => {
        const s = t.startTime || t.slotTime || t.time || '';
        if (!s) return 0;
        const [hh] = String(s).split(':').map(Number);
        return hh || 0;
    };

    const slotColorClass = (t) => {
        const h = getSlotHour(t);
        if (h >= 5 && h < 12) return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-100';
        if (h >= 12 && h < 17) return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-100';
        if (h >= 17 && h <= 21) return 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-100';
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100';
    };

    useEffect(() => {
        loadTherapists();
    }, [query, kycFilter]);

    const loadTherapists = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.set('page', '1');
            params.set('limit', '1000');
            const q = (query || '').trim();
            if (q) params.set('search', q);
            if (kycFilter && kycFilter !== 'all') params.set('kycStatus', kycFilter);
            const response = await api.get(`/admin/therapists?${params.toString()}`);
            setTherapists(response.data.therapists || []);
        } catch (error) {
            console.error('Failed to load therapists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTherapist = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/therapists', newTherapist);
            setShowAddModal(false);
            setNewTherapist({ name: '', email: '', phone: '', specialization: '', password: '' });
            loadTherapists();
            alert('Therapist added successfully!');
        } catch (error) {
            console.error('Failed to add therapist:', error);
            alert('Failed to add therapist: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteTherapist = async (therapistId) => {
        if (window.confirm('Are you sure you want to delete this therapist?')) {
            try {
                await api.delete(`/admin/therapists/${therapistId}`);
                loadTherapists();
                alert('Therapist deleted successfully!');
            } catch (error) {
                console.error('Failed to delete therapist:', error);
                alert('Failed to delete therapist: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const exportData = async () => {
        try {
            const response = await api.get('/admin/export?type=therapists', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `therapists_export_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed');
        }
    };

    const handleEditOpen = (therapist) => {
        setSelectedTherapist(therapist);
        setEditTherapist({
            name: therapist.name || '',
            email: therapist.email || '',
            phone: therapist.phone || '',
            specialization: therapist.specialization || ''
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/manage/users/${selectedTherapist._id}`, {
                name: editTherapist.name,
                email: editTherapist.email,
                phone: editTherapist.phone,
                specialization: editTherapist.specialization,
                role: 'therapist'
            });
            setShowEditModal(false);
            alert('Therapist updated successfully!');
            loadTherapists();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update therapist');
        }
    };

    const loadTherapistSlots = async (therapistId, date) => {
        try {
            setLoadingSlots(true);
            const res1 = await api.get(`/admin/therapists/${therapistId}/slots?date=${date}`);
            let data = res1.data.slots || [];
            if (!Array.isArray(data) || data.length === 0) {
                const res2 = await api.get(`/admin/therapists/${therapistId}/slots`);
                data = res2.data.slots || [];
            }
            const normalizedAll = (data || []).map((s) => {
                if (typeof s === 'string') return { slotTime: s, status: 'available', slotDate: date };
                return s;
            }).filter((s) => {
                if (!s) return false;
                return s.status ? s.status === 'available' : true;
            });
            setAllSlots(normalizedAll);

            const filteredByDate = normalizedAll.filter((s) => {
                const d = s.slotDate ? new Date(s.slotDate) : new Date(date);
                const ymd = d.toISOString().slice(0, 10);
                return ymd === date;
            });
            setSlots(filteredByDate);

            const grouped = normalizedAll.reduce((acc, s) => {
                const d = s.slotDate ? new Date(s.slotDate) : new Date(date);
                const ymd = d.toISOString().slice(0, 10);
                if (!acc[ymd]) acc[ymd] = [];
                acc[ymd].push(s);
                return acc;
            }, {});
            setGroupedSlots(grouped);
        } catch (error) {
            setSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    const openSlotsModal = (therapist) => {
        setSelectedTherapist(therapist);
        setShowSlotsModal(true);
        loadTherapistSlots(therapist._id, slotsDate);
    };

    return (
        <>
            <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 card-3d animate-fade-in overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Therapist Management</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all therapists and their profiles</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Add Therapist
                        </button>
                        <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        Loading therapists...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                            <div className="relative w-full md:w-80">
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Search name, email, phone"
                                />
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                            <div>
                                <select
                                    value={kycFilter}
                                    onChange={(e) => setKycFilter(e.target.value)}
                                    className="bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All KYC</option>
                                    <option value="approved">Approved</option>
                                    <option value="pending">Pending</option>
                                    <option value="rejected">Rejected/Not submitted</option>
                                </select>
                            </div>
                        </div>
                        <table className="w-full">
                            <thead className="bg-gray-50/50 dark:bg-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Therapist</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Specialization</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">KYC Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                {therapists
                                    .filter((t) => {
                                        const q = query.trim().toLowerCase();
                                        const qOk = q === ''
                                            ? true
                                            : [t.name, t.email, t.phone].some((v) => v && String(v).toLowerCase().includes(q));
                                        const kyc = t.kyc?.approvalStatus || 'not submitted';
                                        const kycOk = kycFilter === 'all'
                                            ? true
                                            : kycFilter === 'rejected'
                                                ? (kyc === 'rejected' || kyc === 'not submitted')
                                                : kyc === kycFilter;
                                        return qOk && kycOk;
                                    })
                                    .map((therapist) => (
                                        <tr key={therapist._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                        <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm">
                                                            {therapist.name?.charAt(0) || 'T'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{therapist.name}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{therapist.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-300">+91 {therapist.phone}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-300">
                                                {therapist.specialization || 'General Therapy'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${therapist.kyc?.approvalStatus === 'approved'
                                                    ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                                    : therapist.kyc?.approvalStatus === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
                                                        : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                                                    }`}>
                                                    {therapist.kyc?.approvalStatus || 'not submitted'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openSlotsModal(therapist)}
                                                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 transition-colors"
                                                        title="View Slots"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditOpen(therapist)}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTherapist(therapist._id)}
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
                )}

            </div>

            {/* Modals - Rendered outside main container */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10 shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10 sticky top-0 bg-white dark:bg-slate-900 z-10">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Therapist</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddTherapist} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newTherapist.name}
                                    onChange={(e) => setNewTherapist({ ...newTherapist, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    placeholder="Full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={newTherapist.email}
                                    onChange={(e) => setNewTherapist({ ...newTherapist, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    required
                                    value={newTherapist.phone}
                                    onChange={(e) => setNewTherapist({ ...newTherapist, phone: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    placeholder="10-digit phone number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialization</label>
                                <input
                                    type="text"
                                    required
                                    value={newTherapist.specialization}
                                    onChange={(e) => setNewTherapist({ ...newTherapist, specialization: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    placeholder="Specialization"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={newTherapist.password}
                                    onChange={(e) => setNewTherapist({ ...newTherapist, password: e.target.value })}
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
                                    Add Therapist
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10 shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10 sticky top-0 bg-white dark:bg-slate-900 z-10">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Therapist</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editTherapist.name}
                                    onChange={(e) => setEditTherapist({ ...editTherapist, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    placeholder="Full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editTherapist.email}
                                    onChange={(e) => setEditTherapist({ ...editTherapist, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={editTherapist.phone}
                                    onChange={(e) => setEditTherapist({ ...editTherapist, phone: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    placeholder="10-digit phone number"
                                    maxLength={10}
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialization</label>
                                <input
                                    type="text"
                                    value={editTherapist.specialization}
                                    onChange={(e) => setEditTherapist({ ...editTherapist, specialization: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    placeholder="Specialization"
                                />
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-medium">
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showSlotsModal && selectedTherapist && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10 shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10 sticky top-0 bg-white dark:bg-slate-900 z-10">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Slots - {selectedTherapist.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Phone: +91 {selectedTherapist.phone}</p>
                            </div>
                            <button onClick={() => setShowSlotsModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <input
                                    type="date"
                                    value={slotsDate}
                                    onChange={(e) => { setSlotsDate(e.target.value); loadTherapistSlots(selectedTherapist._id, e.target.value); }}
                                    className="px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 border border-gray-200 dark:border-white/10">
                                {loadingSlots ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                                    </div>
                                ) : slots.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                        {slots.map((t, idx) => (
                                            <div key={`${(t._id || t.time || t.slotTime || t)}-${idx}`} className={`px-3 py-2 rounded-lg border text-gray-700 ${slotColorClass(t)}`}>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 opacity-70" />
                                                    <div className="text-sm font-medium">{t.startTime && t.endTime ? `${to12h(t.startTime)} - ${to12h(t.endTime)}` : to12h(t.slotTime || t.time || t)}</div>
                                                </div>
                                                {t.location && (
                                                    <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>{(t.location.city || t.location.address) || ''}{t.location.pincode ? `, ${t.location.pincode}` : ''}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-gray-500 dark:text-gray-400">No slots available for selected date</p>
                                        {Object.keys(groupedSlots).length > 0 && (
                                            <div className="space-y-3">
                                                {Object.entries(groupedSlots).map(([dateKey, items]) => (
                                                    <div key={dateKey}>
                                                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{dateKey}</div>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                            {items.map((t, idx) => (
                                                                <div key={`g-${(t._id || t.time || t.slotTime || t)}-${idx}`} className={`px-3 py-2 rounded-lg border text-gray-700 ${slotColorClass(t)}`}>
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar className="w-4 h-4 opacity-70" />
                                                                        <div className="text-sm font-medium">{t.startTime && t.endTime ? `${to12h(t.startTime)} - ${to12h(t.endTime)}` : to12h(t.slotTime || t.time || t)}</div>
                                                                    </div>
                                                                    {t.location && (
                                                                        <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
                                                                            <MapPin className="w-3 h-3" />
                                                                            <span>{(t.location.city || t.location.address) || ''}{t.location.pincode ? `, ${t.location.pincode}` : ''}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>

    );

};

export default TherapistManagement;
