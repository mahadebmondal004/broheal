import { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import api from '../services/api';

const AddonSelector = ({ serviceId, selectedAddons, onAddonsChange }) => {
    const [addons, setAddons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAddons();
    }, [serviceId]);

    const loadAddons = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/addons?serviceId=${serviceId || ''}`);
            setAddons(response.data.addons || []);
        } catch (error) {
            console.error('Failed to load addons:', error);
        } finally {
            setLoading(false);
        }
    };

    const isSelected = (addonId) => {
        return selectedAddons.some(addon => addon.addonId === addonId);
    };

    const toggleAddon = (addon) => {
        if (isSelected(addon._id)) {
            // Remove addon
            onAddonsChange(selectedAddons.filter(a => a.addonId !== addon._id));
        } else {
            // Add addon
            onAddonsChange([
                ...selectedAddons,
                {
                    addonId: addon._id,
                    title: addon.name,
                    price: addon.price,
                    duration: addon.duration || 0
                }
            ]);
        }
    };

    const getTotalPrice = () => {
        return selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    };

    const getTotalDuration = () => {
        return selectedAddons.reduce((sum, addon) => sum + (addon.duration || 0), 0);
    };

    if (loading) {
        return (
            <div className="p-4">
                <p className="text-gray-500 text-sm">Loading addons...</p>
            </div>
        );
    }

    if (addons.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-lg mb-1">Add Optional Extras</h3>
                <p className="text-sm text-gray-600">Enhance your service with these add-ons</p>
            </div>

            {/* Addons List */}
            <div className="space-y-2">
                {addons.map((addon) => (
                    <button
                        key={addon._id}
                        onClick={() => toggleAddon(addon)}
                        className={`w-full p-4 rounded-lg border-2 transition-all ${isSelected(addon._id)
                                ? 'border-primary-600 bg-primary-50'
                                : 'border-gray-200 bg-white hover:border-primary-300'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {/* Icon */}
                            <div className="text-3xl">{addon.icon}</div>

                            {/* Content */}
                            <div className="flex-1 text-left">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold">{addon.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-primary-600">+₹{addon.price}</span>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected(addon._id)
                                                ? 'bg-primary-600 border-primary-600'
                                                : 'border-gray-300'
                                            }`}>
                                            {isSelected(addon._id) ? (
                                                <Minus className="w-4 h-4 text-white" />
                                            ) : (
                                                <Plus className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {addon.description && (
                                    <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                                )}

                                {addon.duration > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Additional {addon.duration} minutes
                                    </p>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Summary */}
            {selectedAddons.length > 0 && (
                <div className="card p-4 bg-primary-50 border border-primary-200">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">
                            {selectedAddons.length} addon{selectedAddons.length > 1 ? 's' : ''} selected
                        </span>
                        <div className="text-right">
                            <div className="font-bold text-primary-600">+₹{getTotalPrice()}</div>
                            {getTotalDuration() > 0 && (
                                <div className="text-xs text-gray-600">+{getTotalDuration()} min</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddonSelector;
