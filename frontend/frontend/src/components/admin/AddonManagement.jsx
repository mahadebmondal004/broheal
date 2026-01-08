import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AddonManagement = () => {
    const [addons, setAddons] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingAddon, setEditingAddon] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration: '',
        icon: '➕',
        category: 'other',
        isActive: true
    });

    const categories = [
        { value: 'massage', label: 'Massage' },
        { value: 'spa', label: 'Spa' },
        { value: 'therapy', label: 'Therapy' },
        { value: 'wellness', label: 'Wellness' },
        { value: 'other', label: 'Other' }
    ];

    const iconOptions = ['➕', '💆', '🧖', '💅', '🌿', '🔥', '❄️', '💎', '⭐', '✨'];

    useEffect(() => {
        loadAddons();
    }, []);

    const loadAddons = async () => {
        try {
            const response = await api.get('/addons');
            setAddons(response.data.addons || []);
        } catch (error) {
            toast.error('Failed to load addons');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingAddon) {
                await api.put(`/addons/${editingAddon._id}`, formData);
                toast.success('Addon updated successfully');
            } else {
                await api.post('/addons', formData);
                toast.success('Addon created successfully');
            }

            setShowModal(false);
            setEditingAddon(null);
            resetForm();
            loadAddons();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save addon');
        }
    };

    const handleEdit = (addon) => {
        setEditingAddon(addon);
        setFormData({
            name: addon.name,
            description: addon.description || '',
            price: addon.price,
            duration: addon.duration || '',
            icon: addon.icon || '➕',
            category: addon.category,
            isActive: addon.isActive
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this addon?')) return;

        try {
            await api.delete(`/addons/${id}`);
            toast.success('Addon deleted successfully');
            loadAddons();
        } catch (error) {
            toast.error('Failed to delete addon');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.patch(`/addons/${id}/toggle`);
            toast.success('Addon status updated');
            loadAddons();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            duration: '',
            icon: '➕',
            category: 'other',
            isActive: true
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Service Addons</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Manage optional add-ons for services</p>
                </div>
                <button
                    onClick={() => {
                        setEditingAddon(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Add Addon
                </button>
            </div>

            {/* Addons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {addons.map((addon) => (
                    <div key={addon._id} className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl">{addon.icon}</div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{addon.name}</h3>
                                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 capitalize bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md inline-block mt-1">{addon.category}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggleStatus(addon._id)}
                                className="transition-colors"
                            >
                                {addon.isActive ? (
                                    <ToggleRight className="w-8 h-8 text-green-500 dark:text-green-400" />
                                ) : (
                                    <ToggleLeft className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                                )}
                            </button>
                        </div>

                        {addon.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{addon.description}</p>
                        )}

                        <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                            <div>
                                <span className="text-xl font-bold text-gray-900 dark:text-white">₹{addon.price}</span>
                                {addon.duration > 0 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">+{addon.duration} min</span>
                                )}
                            </div>
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${addon.isActive
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10'
                                }`}>
                                {addon.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(addon)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-white/10 rounded-xl text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(addon._id)}
                                className="px-4 py-2 border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {addons.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium">No addons created yet</p>
                        <p className="text-sm mt-1">Click "Add Addon" to create your first addon</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10 shadow-2xl">
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                                {editingAddon ? 'Edit Addon' : 'Create New Addon'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-shadow"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-shadow"
                                        rows="2"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Price (₹) *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-shadow"
                                            min="0"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Duration (min)</label>
                                        <input
                                            type="number"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-shadow"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-shadow"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Icon</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {iconOptions.map(icon => (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, icon }))}
                                                className={`p-3 text-2xl border rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${formData.icon === icon
                                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                                                        : 'border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950'
                                                    }`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded text-blue-600"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Active Status</label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingAddon(null);
                                            resetForm();
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-medium">
                                        {editingAddon ? 'Update Addon' : 'Create Addon'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddonManagement;
