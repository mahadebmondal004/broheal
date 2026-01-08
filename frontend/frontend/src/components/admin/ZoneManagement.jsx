import { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Plus, Edit, Trash2, Users, X, Check, Search } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, Circle, Autocomplete } from '@react-google-maps/api';
import api from '../../services/api';

const libraries = ['places', 'geometry', 'drawing'];
const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '0.75rem'
};
const defaultCenter = {
    lat: 28.6139,
    lng: 77.2090
};

const ZoneManagement = () => {
    const [zones, setZones] = useState([]);
    const [therapists, setTherapists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
    const [editingZone, setEditingZone] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        areas: '',
        therapists: [],
        coordinates: defaultCenter,
        radius: 5000 // meters
    });

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries
    });

    const mapRef = useRef(null);

    const onLoad = useCallback(function callback(map) {
        mapRef.current = map;
    }, []);

    const onUnmount = useCallback(function callback(map) {
        mapRef.current = null;
    }, []);

    useEffect(() => {
        loadZones();
        loadTherapists();
    }, []);

    const loadZones = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/zones');
            setZones(response.data.zones || []);
        } catch (error) {
            console.error('Failed to load zones:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTherapists = async () => {
        try {
            const response = await api.get('/admin/therapists?limit=1000');
            setTherapists(response.data.therapists || []);
        } catch (error) {
            console.error('Failed to load therapists:', error);
        }
    };

    const [searchResult, setSearchResult] = useState(null);
    const searchBoxRef = useRef(null);

    const onPlaceChanged = () => {
        if (searchBoxRef.current) {
            const place = searchBoxRef.current.getPlace();
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();

                // Extract address components
                let name = '';
                let areas = [];
                let description = '';

                if (place.name) {
                    name = place.name;
                }

                if (place.address_components) {
                    // Try to find a locality or sublocality for the name if place.name is generic
                    const locality = place.address_components.find(c => c.types.includes('locality'))?.long_name;
                    const sublocality = place.address_components.find(c => c.types.includes('sublocality'))?.long_name;

                    if (!name || name === place.formatted_address) {
                        name = sublocality || locality || '';
                    }

                    // Build areas list from sublocalities and neighborhoods
                    const neighborhood = place.address_components.find(c => c.types.includes('neighborhood'))?.long_name;
                    if (neighborhood) areas.push(neighborhood);
                    if (sublocality && sublocality !== name) areas.push(sublocality);
                    if (locality && locality !== name) areas.push(locality);
                }

                if (place.formatted_address) {
                    description = place.formatted_address;
                    if (areas.length === 0) {
                        // If no specific areas found, use parts of formatted address
                        areas = place.formatted_address.split(',').slice(0, 2).map(s => s.trim());
                    }
                }

                setFormData(prev => ({
                    ...prev,
                    coordinates: { lat, lng },
                    name: prev.name || name, // Only set if empty or keep existing? User said "automatic le lena chahiye" so maybe overwrite or fill if empty. Let's overwrite for better UX on search.
                    description: description,
                    areas: areas.join(', ')
                }));
            }
        }
    };

    const onLoadAutocomplete = (autocomplete) => {
        searchBoxRef.current = autocomplete;
    };

    const handleMapClick = (e) => {
        if (showAddModal || editingZone) {
            setFormData({
                ...formData,
                coordinates: {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng()
                }
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                type: 'zone', // Required by backend
                center: formData.coordinates, // Map coordinates to center
                // Ensure therapists is an array of IDs
                therapists: formData.therapists
            };

            if (editingZone) {
                await api.put(`/admin/zones/${editingZone._id}`, payload);
                alert('Zone updated successfully!');
            } else {
                await api.post('/admin/zones', payload);
                alert('Zone added successfully!');
            }

            closeModal();
            loadZones();
        } catch (error) {
            console.error('Failed to save zone:', error);
            alert('Failed to save zone: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this zone?')) return;
        try {
            await api.delete(`/admin/zones/${id}`);
            loadZones();
        } catch (error) {
            console.error('Failed to delete zone:', error);
            alert('Failed to delete zone');
        }
    };

    const openAddModal = () => {
        setFormData({
            name: '',
            description: '',
            areas: '',
            therapists: [],
            coordinates: defaultCenter,
            radius: 5000
        });
        setEditingZone(null);
        setShowAddModal(true);
    };

    const openEditModal = (zone) => {
        setFormData({
            name: zone.name || '',
            description: zone.description || '',
            areas: zone.areas || '',
            therapists: zone.therapists?.map(t => typeof t === 'object' ? t._id : t) || [],
            coordinates: zone.coordinates || defaultCenter,
            radius: zone.radius || 5000
        });
        setEditingZone(zone);
        setShowAddModal(true);
    };

    const closeModal = () => {
        setShowAddModal(false);
        setEditingZone(null);
    };

    const toggleTherapist = (therapistId) => {
        setFormData(prev => {
            const current = prev.therapists || [];
            if (current.includes(therapistId)) {
                return { ...prev, therapists: current.filter(id => id !== therapistId) };
            } else {
                return { ...prev, therapists: [...current, therapistId] };
            }
        });
    };

    return (
        <>
            <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 card-3d overflow-hidden flex flex-col h-[calc(100vh-100px)] animate-fade-in">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Zone Management</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage service areas, map locations, and therapist assignments</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${viewMode === 'map'
                                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300'
                                : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                        >
                            {viewMode === 'list' ? 'Switch to Map View' : 'Switch to List View'}
                        </button>
                        <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium btn-3d press-effect"
                        >
                            <Plus className="w-4 h-4" />
                            Add Zone
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    {loading && !zones.length ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 z-10 font-medium text-gray-900 dark:text-white">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mr-2"></div> Loading...
                        </div>
                    ) : null}

                    {viewMode === 'map' ? (
                        <div className="h-full w-full p-4">
                            {isLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '0.75rem' }}
                                    center={defaultCenter}
                                    zoom={11}
                                    onLoad={onLoad}
                                    onUnmount={onUnmount}
                                >
                                    {zones.map(zone => (
                                        <div key={zone._id}>
                                            <Marker
                                                position={zone.coordinates || defaultCenter}
                                                title={zone.name}
                                                onClick={() => openEditModal(zone)}
                                            />
                                            <Circle
                                                center={zone.coordinates || defaultCenter}
                                                radius={zone.radius || 5000}
                                                options={{
                                                    strokeColor: '#2563EB',
                                                    strokeOpacity: 0.8,
                                                    strokeWeight: 2,
                                                    fillColor: '#2563EB',
                                                    fillOpacity: 0.20,
                                                }}
                                            />
                                        </div>
                                    ))}
                                </GoogleMap>
                            ) : (
                                <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-slate-900 rounded-xl">
                                    <p className="text-gray-500 dark:text-gray-400">Loading Map...</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50 dark:bg-white/5 sticky top-0 z-10 backdrop-blur-sm">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Zone Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Therapists</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                    {zones.map((zone) => (
                                        <tr key={zone._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                        <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{zone.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{zone.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-900 dark:text-gray-300 truncate max-w-[200px]">{zone.areas}</p>
                                                {zone.coordinates && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        Lat: {zone.coordinates.lat?.toFixed(4)}, Lng: {zone.coordinates.lng?.toFixed(4)}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-900 dark:text-gray-300">{zone.therapists?.length || zone.therapistsCount || 0} assigned</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${zone.status === 'active'
                                                    ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                                    : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                                                    }`}>
                                                    {zone.status || 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(zone)}
                                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                                        title="Edit Zone"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(zone._id)}
                                                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                                        title="Delete Zone"
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
            </div>

            {/* Modal - Rendered outside main container to avoid overflow-hidden clipping */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-white/10">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingZone ? 'Edit Zone' : 'Add New Zone'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                            {/* Form Side */}
                            <div className="w-full lg:w-1/3 p-6 overflow-y-auto border-r border-gray-200 dark:border-white/10 space-y-5 bg-white dark:bg-slate-900">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zone Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        placeholder="e.g. South Delhi"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        rows="2"
                                        placeholder="Zone description..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Areas (comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.areas}
                                        onChange={(e) => setFormData({ ...formData, areas: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        placeholder="Area 1, Area 2, Area 3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coverage Radius (meters)</label>
                                    <input
                                        type="number"
                                        value={formData.radius}
                                        onChange={(e) => setFormData({ ...formData, radius: Number(e.target.value) })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign Therapists</label>
                                    <div className="border border-gray-300 dark:border-white/10 rounded-xl max-h-60 overflow-y-auto bg-gray-50 dark:bg-slate-950">
                                        {therapists.length > 0 ? (
                                            therapists.map(therapist => (
                                                <div
                                                    key={therapist._id}
                                                    className={`flex items-center p-3 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer border-b border-gray-100 dark:border-white/5 last:border-0 ${formData.therapists.includes(therapist._id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                                        }`}
                                                    onClick={() => toggleTherapist(therapist._id)}
                                                >
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 ${formData.therapists.includes(therapist._id)
                                                        ? 'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500'
                                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800'
                                                        }`}>
                                                        {formData.therapists.includes(therapist._id) && (
                                                            <Check className="w-3.5 h-3.5 text-white" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{therapist.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{therapist.specialization}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                No therapists found.
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {formData.therapists.length} therapist(s) selected
                                    </p>
                                </div>
                            </div>

                            {/* Map Side */}
                            <div className="w-full lg:w-2/3 bg-gray-100 dark:bg-gray-800 relative">
                                {isLoaded ? (
                                    <GoogleMap
                                        mapContainerStyle={{ width: '100%', height: '100%' }}
                                        center={formData.coordinates || defaultCenter}
                                        zoom={12}
                                        onClick={handleMapClick}
                                    >
                                        <div className="absolute top-4 left-4 z-10 w-80">
                                            <Autocomplete
                                                onLoad={onLoadAutocomplete}
                                                onPlaceChanged={onPlaceChanged}
                                            >
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Search location..."
                                                        className="w-full px-4 py-2 pl-10 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                </div>
                                            </Autocomplete>
                                        </div>

                                        <Marker
                                            position={formData.coordinates || defaultCenter}
                                            draggable={true}
                                            onDragEnd={(e) => setFormData({
                                                ...formData,
                                                coordinates: { lat: e.latLng.lat(), lng: e.latLng.lng() }
                                            })}
                                        />
                                        <Circle
                                            center={formData.coordinates || defaultCenter}
                                            radius={formData.radius || 5000}
                                            options={{
                                                strokeColor: '#2563EB',
                                                strokeOpacity: 0.8,
                                                strokeWeight: 2,
                                                fillColor: '#2563EB',
                                                fillOpacity: 0.20,
                                                editable: true,
                                                draggable: false
                                            }}
                                            onRadiusChanged={function () {
                                                if (this.getRadius) {
                                                    setFormData(prev => ({ ...prev, radius: this.getRadius() }));
                                                }
                                            }}
                                        />
                                        <div className="absolute top-4 right-4 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg shadow-md z-10 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/10">
                                            Click on map to set zone center
                                        </div>
                                    </GoogleMap>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-200 dark:border-white/10 flex justify-end gap-3 bg-gray-50 dark:bg-slate-900/50 rounded-b-xl">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-4 py-2 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-medium"
                            >
                                {editingZone ? 'Update Zone' : 'Create Zone'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ZoneManagement;
