import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Search, Filter, X } from 'lucide-react';
import api from '../../services/api';

const ServiceManagement = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [categories, setCategories] = useState([]);
    const [newService, setNewService] = useState({
        title: '',
        image: '',
        category: '',
        price: '',
        offerPrice: '',
        duration: '',
        description: ''
    });
    const [uploadingImage, setUploadingImage] = useState(false);
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const uploadToCloudinary = async (file) => {
        const uploadViaBackend = async () => {
            try {
                const fd = new FormData();
                fd.append('image', file);
                const resp = await api.post('/admin/upload-image', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                const url = resp.data?.imageUrl;
                if (url) return url;
                throw new Error('Server upload failed');
            } catch (err) {
                alert('Image upload failed: ' + (err.response?.data?.message || err.message));
                return null;
            }
        };

        try {
            setUploadingImage(true);
            if (!cloudName || !uploadPreset) {
                return await uploadViaBackend();
            }
            const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
            const fd = new FormData();
            fd.append('file', file);
            fd.append('upload_preset', uploadPreset);
            const res = await fetch(url, { method: 'POST', body: fd });
            const data = await res.json();
            if (data.secure_url) {
                return data.secure_url;
            }
            // Fallback to backend if Cloudinary rejects (e.g., preset not found)
            return await uploadViaBackend();
        } catch (e) {
            // Final fallback error
            alert('Image upload failed: ' + (e.message || 'Unknown error'));
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    useEffect(() => {
        loadServices();
        loadCategories();
    }, []);

    useEffect(() => {
        if (showAddModal) {
            loadCategories();
        }
    }, [showAddModal]);

    const loadServices = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/services');
            setServices(response.data.services || []);
        } catch (error) {
            console.error('Failed to load services:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const r = await api.get('/admin/categories');
            const list = r.data.categories || [];
            const sorted = [...list].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
            const activeOnly = sorted.filter(c => (c.status || 'active') === 'active');
            setCategories(activeOnly);
        } catch (e) {
            try {
                const r2 = await api.get('/public/categories');
                const list2 = r2.data.categories || [];
                const sorted2 = [...list2].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
                const activeOnly2 = sorted2.filter(c => (c.status || 'active') === 'active');
                setCategories(activeOnly2);
            } catch { }
        }
    };

    const handleAddService = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title: newService.title.trim(),
                image: newService.image.trim() || undefined,
                category: newService.category.trim() || (categories.find(c => c._id === newService.categoryId)?.name || ''),
                price: Number(newService.price),
                offerPrice: newService.offerPrice ? Number(newService.offerPrice) : undefined,
                duration: Number(newService.duration),
                description: newService.description.trim()
            };
            await api.post('/admin/services', payload);
            setShowAddModal(false);
            setNewService({ title: '', image: '', category: '', price: '', offerPrice: '', duration: '', description: '' });
            loadServices();
            alert('Service added successfully!');
        } catch (error) {
            console.error('Failed to add service:', error);
            alert('Failed to add service: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                await api.delete(`/admin/services/${serviceId}`);
                loadServices();
            } catch (error) {
                console.error('Failed to delete service:', error);
                alert('Failed to delete service');
            }
        }
    };

    return (
        <>
            <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 card-3d animate-fade-in overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Service Management</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage therapy services and pricing</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Add Service
                    </button>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        Loading services...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 dark:bg-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Therapists</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bookings</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                {services.map((service) => (
                                    <tr key={service._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center filter drop-shadow-sm">
                                                    {service.image ? (
                                                        <img src={service.image} alt={service.title} className="w-full h-full object-cover rounded-full" />
                                                    ) : (
                                                        <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{service.title}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-300">{service.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-semibold">₹{service.offerPrice || service.price}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-300">{service.therapistsCount || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-300">{service.bookingsCount || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${service.status === 'active'
                                                ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                                : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                                                }`}>
                                                {service.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-600 dark:text-gray-400 transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteService(service._id)}
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

            {/* Modal - Rendered outside main container to avoid overflow-hidden clipping */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-white/10 float-3d flex flex-col">
                        <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0 border-b border-gray-200 dark:border-white/10">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Service</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 btn-3d-inset press-effect p-2 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto px-6 py-4 flex-grow">
                            <form onSubmit={handleAddService} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newService.title}
                                        onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        placeholder="e.g. Physiotherapy"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Image</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const url = await uploadToCloudinary(file);
                                                if (url) setNewService({ ...newService, image: url });
                                            }}
                                            className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
                                        />
                                    </div>
                                    {uploadingImage && (
                                        <div className="text-xs text-blue-500 mt-1">Uploading image...</div>
                                    )}
                                    {newService.image && (
                                        <div className="mt-2 h-24 w-24 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10">
                                            <img src={newService.image} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">If Cloudinary isn’t configured, you can paste an image URL below.</div>
                                    <input
                                        type="url"
                                        value={newService.image}
                                        onChange={(e) => setNewService({ ...newService, image: e.target.value })}
                                        className="mt-2 w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                    <select
                                        value={newService.categoryId || ''}
                                        onChange={(e) => setNewService({ ...newService, categoryId: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Or type a new category</div>
                                    <input
                                        type="text"
                                        value={newService.category}
                                        onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                                        className="mt-1 w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        placeholder="e.g. Therapy"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            value={newService.price}
                                            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                            placeholder="1500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Offer Price (₹)</label>
                                        <input
                                            type="number"
                                            value={newService.offerPrice}
                                            onChange={(e) => setNewService({ ...newService, offerPrice: e.target.value })}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes)</label>
                                    <input
                                        type="number"
                                        required
                                        value={newService.duration}
                                        onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        placeholder="60"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                    <textarea
                                        value={newService.description}
                                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        rows="3"
                                        placeholder="Service description..."
                                    />
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-white/10 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-medium">
                                        Add Service
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ServiceManagement;
