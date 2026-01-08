import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, Plus, MapPin, ChevronLeft, Check, Crosshair } from 'lucide-react';
import { GoogleMap, Marker, useLoadScript, Autocomplete } from '@react-google-maps/api';
import api from '../services/api';
import { toast } from 'react-toastify';

const GOOGLE_LIBRARIES = ['places'];

const BookingCreate = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { therapistId, serviceId } = location.state || {};

    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [addons, setAddons] = useState([]);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        lat: null,
        lng: null
    });
    const [services, setServices] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showMap, setShowMap] = useState(true);
    const [autoInstance, setAutoInstance] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 });
    const [barVisible, setBarVisible] = useState(false);
    const [autoLocateEnabled, setAutoLocateEnabled] = useState(true);
    const [locating, setLocating] = useState(false);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_LIBRARIES
    });

    useEffect(() => {
        loadServices();
        if (serviceId) {
            loadServiceDetails(serviceId);
        }
    }, [serviceId]);

    useEffect(() => {
        if (selectedService && selectedService._id) {
            loadAddons(selectedService._id);
        }
    }, [selectedService]);

    useEffect(() => {
        const ready = step === 1
            ? !!selectedService
            : step === 2
                ? !!selectedDate && !!selectedTimeSlot
                : step === 3
                    ? true
                    : step === 4
                        ? !!address.street && !!address.city && !!address.state && !!address.pincode
                        : false;
        setBarVisible(ready);
    }, [step, selectedService, selectedDate, selectedTimeSlot, address.street, address.city, address.state, address.pincode]);

    const loadServices = async () => {
        try {
            const response = await api.get('/user/services');
            const list = response.data.services || [];
            setServices(Array.isArray(list) ? list : []);
        } catch (error) {
            setServices([]);
        }
    };

    const loadServiceDetails = async (id) => {
        try {
            const response = await api.get(`/user/services/${id}`);
            setSelectedService(response.data.service);
            setStep(2); // Auto move to next step if service pre-selected
            try {
                const addonsRes = await api.get(`/addons?serviceId=${response.data.service?._id}`);
                const list = addonsRes.data.addons || [];
                setAddons(Array.isArray(list) ? list : []);
            } catch (e) {
                setAddons([]);
            }
        } catch (error) {
            console.error('Failed to load service:', error);
        }
    };

    const loadAddons = async (sid) => {
        try {
            const addonsRes = await api.get(`/addons${sid ? `?serviceId=${sid}` : ''}`);
            const list = addonsRes.data.addons || [];
            setAddons(Array.isArray(list) ? list : []);
        } catch (e) {
            setAddons([]);
        }
    };

    const loadSlots = async (date) => {
        try {
            if (!therapistId) {
                // If no specific therapist, show general slots
                const generalSlots = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30'];
                const toMinutes = (val) => { 
                    const [h, m] = String(val).split(':').map(Number); 
                    return h * 60 + m 
                };
                const toHHMM = (mins) => { 
                    const h = Math.floor(mins / 60); 
                    const m = mins % 60; 
                    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` 
                };
                setAvailableSlots(generalSlots.map((t) => ({ 
                    time: t, 
                    startTime: t, 
                    endTime: toHHMM(toMinutes(t) + 60), 
                    available: true 
                })));
                return;
            }

            const response = await api.get(`/user/therapists/${therapistId}/slots?date=${date}`);
            let raw = response.data.slots || [];
            
            const toMinutes = (val) => { 
                const [h, m] = String(val).split(':').map(Number); 
                return h * 60 + m 
            };
            const toHHMM = (mins) => { 
                const h = Math.floor(mins / 60); 
                const m = mins % 60; 
                return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` 
            };
            
            const normalized = raw.map((s) => {
                if (typeof s === 'string') {
                    const st = s;
                    const et = toHHMM(toMinutes(st) + 60);
                    return { time: st, startTime: st, endTime: et, available: true };
                }
                if (s?.slotTime) {
                    const st = s.startTime || s.slotTime;
                    const et = s.endTime || toHHMM(toMinutes(st) + 60);
                    return { time: s.slotTime, startTime: st, endTime: et, available: s.status === 'available' };
                }
                if (s?.time) {
                    const st = s.startTime || s.time;
                    const et = s.endTime || toHHMM(toMinutes(st) + 60);
                    return { time: s.time, startTime: st, endTime: et, available: s.available ?? true };
                }
                return null;
            }).filter(Boolean);

            const unique = [];
            const seen = new Set();
            for (const s of normalized) {
                const key = String(s.time);
                if (!seen.has(key)) {
                    seen.add(key);
                    unique.push(s);
                }
            }
            setAvailableSlots(unique);
        } catch (error) {
            console.error('Failed to load slots:', error);
            const fallback = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
            const toMinutes = (val) => { 
                const [h, m] = String(val).split(':').map(Number); 
                return h * 60 + m 
            };
            const toHHMM = (mins) => { 
                const h = Math.floor(mins / 60); 
                const m = mins % 60; 
                return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` 
            };
            setAvailableSlots(fallback.map((t) => ({ 
                time: t, 
                startTime: t, 
                endTime: toHHMM(toMinutes(t) + 60), 
                available: true 
            })));
        }
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setSelectedTimeSlot(''); // Reset time when date changes
        loadSlots(date);
    };

    const toggleAddon = (addon) => {
        setSelectedAddons(prev => {
            const exists = prev.find(a => a.addonId === addon._id);
            if (exists) {
                return prev.filter(a => a.addonId !== addon._id);
            }
            return [
                ...prev,
                { addonId: addon._id, title: addon.name, price: addon.price, duration: addon.duration || 0 }
            ];
        });
    };

    const fillAddressFromComponents = (components, lat, lng, name) => {
        const find = (type) => components?.find((c) => c.types?.includes(type))?.long_name || '';
        setAddress((prev) => ({
            ...prev,
            street: name || `${find('street_number')} ${find('route')}`.trim() || prev.street,
            city: find('locality') || find('administrative_area_level_2') || prev.city,
            state: find('administrative_area_level_1') || prev.state,
            pincode: find('postal_code') || prev.pincode,
            lat: lat ?? prev.lat,
            lng: lng ?? prev.lng
        }));
    };

    const reverseGeocode = async (lat, lng) => {
        if (window.google?.maps) {
            try {
                const geocoder = new window.google.maps.Geocoder();
                const result = await new Promise((resolve) => {
                    geocoder.geocode({ location: { lat, lng } }, (res, status) => {
                        resolve(status === 'OK' && res && res[0] ? res[0] : null);
                    });
                });
                if (result) {
                    fillAddressFromComponents(result.address_components, lat, lng, result.formatted_address);
                    return;
                }
            } catch {}
        }
        const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!key) return;
        try {
            const resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`);
            const data = await resp.json();
            const item = data.results?.[0];
            if (item) {
                fillAddressFromComponents(item.address_components, lat, lng, item.formatted_address);
            }
        } catch {}
    };

    const handleMapClick = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setAddress((prev) => ({ ...prev, lat, lng }));
        setMapCenter({ lat, lng });
        reverseGeocode(lat, lng);
    };

    const handleUseCurrentLocation = async () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation unsupported');
            return;
        }
        setLocating(true);
        try {
            const perm = navigator.permissions ? await navigator.permissions.query({ name: 'geolocation' }).catch(() => null) : null;
            if (perm && perm.state === 'denied') {
                setLocating(false);
                toast.error('Location permission denied. Enable location in browser settings.');
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    setAddress((prev) => ({ ...prev, lat, lng }));
                    setMapCenter({ lat, lng });
                    reverseGeocode(lat, lng);
                    setLocating(false);
                },
                (err) => {
                    setLocating(false);
                    if (err?.code === 1) {
                        toast.error('Permission denied. Allow location access.');
                    } else if (err?.code === 2) {
                        toast.error('Position unavailable. Try again.');
                    } else if (err?.code === 3) {
                        toast.error('Location timeout. Try again.');
                    } else {
                        toast.error('Failed to get current location.');
                    }
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } catch {
            setLocating(false);
            toast.error('Unable to access location.');
        }
    };

    useEffect(() => {
        if (step === 4 && autoLocateEnabled && !address.lat && !address.lng) {
            handleUseCurrentLocation();
        }
    }, [step, autoLocateEnabled]);

    const onAutoLoad = (inst) => setAutoInstance(inst);
    const onPlaceChanged = () => {
        if (!autoInstance) return;
        const place = autoInstance.getPlace();
        const loc = place?.geometry?.location;
        const lat = loc?.lat?.();
        const lng = loc?.lng?.();
        if (lat && lng) {
            setMapCenter({ lat, lng });
        }
        fillAddressFromComponents(place?.address_components || [], lat, lng, place?.name || place?.formatted_address);
    };

    const handleMarkerDragEnd = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setAddress((prev) => ({ ...prev, lat, lng }));
        setMapCenter({ lat, lng });
        reverseGeocode(lat, lng);
    };

    const handleConfirmBooking = async () => {
        const isMongoId = (v) => /^[a-fA-F0-9]{24}$/.test(String(v));
        if (!selectedService || !selectedDate || !selectedTimeSlot || !address.street) {
            toast.error('Please complete all required fields');
            return;
        }

        if (!isMongoId(therapistId) || !isMongoId(selectedService?._id)) {
            toast.error('Please select a valid therapist and service');
            return;
        }

        setLoading(true);
        try {
            const bookingAddress = {
                street: address.street,
                city: address.city,
                state: address.state,
                zipCode: address.pincode,
                latitude: address.lat,
                longitude: address.lng
            };
            const bookingData = {
                therapistId,
                serviceId: selectedService._id,
                bookingDateTime: `${selectedDate}T${selectedTimeSlot}`,
                addons: selectedAddons,
                address: bookingAddress
            };

            const response = await api.post('/user/bookings', bookingData);
            toast.success('Booking confirmed successfully!');
            navigate(`/dashboard?tab=bookings&openChat=${response.data.booking?._id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    const totalDuration = (selectedService?.duration || 0) + selectedAddons.reduce((sum, a) => sum + a.duration, 0);
    const totalAmount = (selectedService?.price || 0) + selectedAddons.reduce((sum, a) => sum + a.price, 0);

    const getNext7Days = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            days.push({
                date: date.toISOString().split('T')[0],
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNum: date.getDate(),
                month: date.toLocaleDateString('en-US', { month: 'short' })
            });
        }
        return days;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-20">
                <div className="px-4 py-3 flex items-center gap-3">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Book Service</h1>
                        <p className="text-sm text-gray-600">Step {step} of 4</p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="px-4 pb-3">
                    <div className="grid items-center grid-cols-[auto,1fr,auto,1fr,auto,1fr,auto] gap-2">
                        {/* Step 1 */}
                        <div className={`${step >= 1 ? 'text-primary-600' : 'text-gray-400'} flex flex-col items-center`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-1 ${step > 1 ? 'bg-green-500 text-white' : step === 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{step > 1 ? <Check className="w-4 h-4" /> : 1}</div>
                            <span className="text-xs font-medium">Service</span>
                        </div>
                        <div className={`h-1 w-full ${step > 1 ? 'bg-primary-600' : 'bg-gray-200'}`} />
                        {/* Step 2 */}
                        <div className={`${step >= 2 ? 'text-primary-600' : 'text-gray-400'} flex flex-col items-center`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-1 ${step > 2 ? 'bg-green-500 text-white' : step === 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{step > 2 ? <Check className="w-4 h-4" /> : 2}</div>
                            <span className="text-xs font-medium">Time</span>
                        </div>
                        <div className={`h-1 w-full ${step > 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
                        {/* Step 3 */}
                        <div className={`${step >= 3 ? 'text-primary-600' : 'text-gray-400'} flex flex-col items-center`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-1 ${step > 3 ? 'bg-green-500 text-white' : step === 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{step > 3 ? <Check className="w-4 h-4" /> : 3}</div>
                            <span className="text-xs font-medium">Add-ons</span>
                        </div>
                        <div className={`h-1 w-full ${step > 3 ? 'bg-primary-600' : 'bg-gray-200'}`} />
                        {/* Step 4 */}
                        <div className={`${step >= 4 ? 'text-primary-600' : 'text-gray-400'} flex flex-col items-center`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-1 ${step === 4 ? 'bg-primary-600 text-white' : step > 4 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{4}</div>
                            <span className="text-xs font-medium">Address</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4">
                {/* Step 1: Service Selection - FIXED VERSION */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Service</h2>
                            <p className="text-gray-600">Select the service that best fits your needs</p>
                        </div>
                        
                        <div className="grid gap-4">
                            {services.map((service) => (
                                <div
                                    key={service._id}
                                    onClick={() => setSelectedService(service)}
                                    className={`bg-white rounded-xl p-4 cursor-pointer transition-all duration-200 shadow-sm border-2
                                        ${selectedService?._id === service._id
                                            ? 'border-primary-500 shadow-md bg-blue-50'
                                            : 'border-gray-100 hover:border-primary-300 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <h3 className="font-bold text-lg text-gray-900">{service.title}</h3>
                                                <span className="text-lg font-bold text-primary-600 ml-2">
                                                    ₹{service.price}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                                                {service.description}
                                            </p>
                                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                                <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                                                    <Clock className="w-4 h-4" />
                                                    {service.duration} minutes
                                                </span>
                                                <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                                                    <Calendar className="w-4 h-4" />
                                                    {service.category}
                                                </span>
                                            </div>
                                        </div>
                                        {selectedService?._id === service._id && (
                                            <div className="ml-4 flex-shrink-0">
                                                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {services.length === 0 && !loading && (
                            <div className="text-center py-8">
                                <div className="text-gray-400 mb-2">No services available</div>
                                <button 
                                    onClick={loadServices}
                                    className="text-primary-600 font-medium"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Other steps remain the same... */}
                {/* Step 2: Date & Time Selection */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Select Date & Time</h2>
                            <p className="text-gray-600">Choose when you'd like your service</p>
                        </div>

                        {/* Date Selection */}
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary-600" />
                                Select Date
                            </h3>
                            <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(88px,1fr))]">
                                {getNext7Days().map((day) => (
                                    <button
                                        key={day.date}
                                        onClick={() => handleDateChange(day.date)}
                                        className={`w-full py-3 rounded-xl text-center transition-all border-2
                                            ${selectedDate === day.date
                                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                                            }`}
                                    >
                                        <div className="text-xs font-medium">{day.month}</div>
                                        <div className="text-2xl font-bold my-1">{day.dayNum}</div>
                                        <div className="text-xs">{day.day}</div>
                                    </button>
                                ))}
                                
                                {/* Custom Date Picker */}
                                <div className="relative">
                                    <input
                                        type="date"
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                        title="Select custom date"
                                    />
                                    <button
                                        className={`w-full h-full py-3 rounded-xl text-center transition-all border-2 flex flex-col items-center justify-center
                                            ${selectedDate && !getNext7Days().find(d => d.date === selectedDate)
                                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                                            }`}
                                    >
                                        <Calendar className="w-6 h-6 mb-1" />
                                        <div className="text-xs font-medium truncate w-full px-1">
                                            {selectedDate && !getNext7Days().find(d => d.date === selectedDate) 
                                                ? (() => {
                                                    const [y, m, d] = selectedDate.split('-').map(Number);
                                                    const date = new Date(y, m - 1, d);
                                                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                                })()
                                                : 'More Dates'}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Time Slots */}
                        {selectedDate && (
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary-600" />
                                    Available Time Slots
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {availableSlots.map((slot) => (
                                        <button
                                            key={slot.time}
                                            onClick={() => {
                                                if (slot.available) setSelectedTimeSlot(slot.time);
                                            }}
                                            disabled={!slot.available}
                                            className={`p-3 rounded-lg text-center transition-all border-2
                                                ${selectedTimeSlot === slot.time
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                    : slot.available
                                                        ? 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                                                        : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            <div className="font-semibold">
                                                {to12h(slot.startTime)}
                                            </div>
                                            <div className="text-xs text-current opacity-70">
                                                to {to12h(slot.endTime)}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Add-ons */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Add-on Services</h2>
                            <p className="text-gray-600">Enhance your experience with these additions</p>
                        </div>

                        <div className="space-y-3">
                            {addons.map((addon) => (
                                <div
                                    key={addon._id}
                                    onClick={() => toggleAddon(addon)}
                                    className={`bg-white rounded-xl p-4 cursor-pointer transition-all duration-200 shadow-sm border-2
                                        ${selectedAddons.find(a => a.addonId === addon._id)
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-100 hover:border-primary-300'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-semibold text-gray-900">{addon.name}</h3>
                                                <span className="text-primary-600 font-bold ml-2">
                                                    +₹{addon.price}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-2">
                                                {addon.description}
                                            </p>
                                            {addon.duration > 0 && (
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Plus className="w-3 h-3" />
                                                    <span>+{addon.duration} minutes</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className={`ml-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                            ${selectedAddons.find(a => a.addonId === addon._id)
                                                ? 'bg-primary-500 border-primary-500'
                                                : 'border-gray-300'
                                            }`}>
                                            {selectedAddons.find(a => a.addonId === addon._id) && (
                                                <Check className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: Address - Same as before but with better styling */}
                {step === 4 && (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Address</h2>
                            <p className="text-gray-600">Where would you like the service?</p>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Street Address *
                                </label>
                                <input
                                    type="text"
                                    value={address.street}
                                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                    placeholder="House/Flat No, Street, Area"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        value={address.city}
                                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                        placeholder="City"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        value={address.state}
                                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                        placeholder="State"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pincode *
                                    </label>
                                    <input
                                        type="text"
                                        value={address.pincode}
                                        onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                        placeholder="Pincode"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Landmark
                                    </label>
                                    <input
                                        type="text"
                                        value={address.landmark}
                                        onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                                        placeholder="Nearby landmark (Optional)"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Map Section */}
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setShowMap(!showMap)}
                                    className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <MapPin className="w-5 h-5" />
                                    {showMap ? 'Hide Map' : 'Pick Location on Map'}
                                </button>

                                {showMap && isLoaded && !loadError && (
                                    <div className="mt-4 space-y-3">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Autocomplete onLoad={onAutoLoad} onPlaceChanged={onPlaceChanged}>
                                                    <input
                                                        type="text"
                                                        placeholder="Search address"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                                    />
                                                </Autocomplete>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setAutoLocateEnabled((v) => !v)}
                                                className={`px-3 py-2 border rounded-lg ${autoLocateEnabled ? 'border-primary-500 text-primary-700' : 'border-gray-300 text-gray-700'} hover:bg-gray-50`}
                                            >
                                                {autoLocateEnabled ? 'Auto Detect On' : 'Auto Detect Off'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleUseCurrentLocation}
                                                disabled={locating}
                                                className={`px-3 py-2 border rounded-lg flex items-center gap-2 ${locating ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                {locating ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                        Locating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Crosshair className="w-4 h-4" />
                                                        Use Current Location
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
                                            <GoogleMap
                                                zoom={15}
                                                center={address.lat && address.lng ? { lat: address.lat, lng: address.lng } : mapCenter}
                                                mapContainerStyle={{ width: '100%', height: '100%' }}
                                                onClick={handleMapClick}
                                            >
                                                {address.lat && address.lng && (
                                                    <Marker position={{ lat: address.lat, lng: address.lng }} draggable onDragEnd={handleMarkerDragEnd} />
                                                )}
                                            </GoogleMap>
                                        </div>
                                        {address.lat && address.lng && (
                                            <div className="text-xs text-gray-600">Selected: {address.lat.toFixed(5)}, {address.lng.toFixed(5)}</div>
                                        )}
                                    </div>
                                )}
                                {showMap && loadError && (
                                    <div className="mt-4 p-4 border rounded-lg text-sm text-gray-700 bg-yellow-50">
                                        Google Maps load error. Billing enable karein, `Maps JavaScript`, `Places`, `Geocoding` APIs on karein, aur key application restriction me `http://localhost/*` add karein.
                                    </div>
                                )}
                                {showMap && !isLoaded && !loadError && (
                                    <div className="mt-4 p-4 border rounded-lg text-sm text-gray-700 bg-gray-50">
                                        Loading Google Maps...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Fixed Bottom Bar - IMPROVED */}
            <div className={`fixed md:static bottom-0 md:bottom-auto left-0 md:left-auto right-0 md:right-auto bg-white border-t md:border-t-0 shadow-lg md:shadow-none p-4 md:p-0 safe-area-bottom transform md:transform-none transition-transform md:transition-none duration-300 ${barVisible ? 'translate-y-0' : 'translate-y-full md:translate-y-0'} rounded-t-2xl md:rounded-none`}>
                <div className="max-w-md md:max-w-3xl mx-auto">
                    {/* Summary */}
                    {(selectedService || selectedAddons.length > 0) && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                            {selectedService && (
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span className="text-gray-600">Service:</span>
                                    <span className="font-semibold">{selectedService.title}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-gray-600">Total Duration:</span>
                                <span className="font-semibold">{totalDuration} minutes</span>
                            </div>
                            <div className="flex justify-between items-center text-base">
                                <span className="text-gray-700 font-medium">Total Amount:</span>
                                <span className="font-bold text-primary-600">₹{totalAmount}</span>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (step < 4) {
                                    setStep(step + 1);
                                } else {
                                    handleConfirmBooking();
                                }
                            }}
                            disabled={
                                (step === 1 && !selectedService) ||
                                (step === 2 && (!selectedDate || !selectedTimeSlot)) ||
                                (step === 4 && (!address.street || !address.city || !address.state || !address.pincode)) ||
                                loading
                            }
                            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors
                                ${((step === 1 && !selectedService) ||
                                  (step === 2 && (!selectedDate || !selectedTimeSlot)) ||
                                  (step === 4 && (!address.street || !address.city || !address.state || !address.pincode)) ||
                                  loading)
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-primary-600 text-white hover:bg-primary-700'
                                }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Processing...
                                </div>
                            ) : step === 4 ? (
                                'Confirm Booking'
                            ) : (
                                'Continue'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Utility function to convert 24h to 12h format
const to12h = (val) => {
    if (!val) return '';
    const [hh, mm] = String(val).split(':').map(Number);
    const am = hh < 12;
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${h12}:${String(mm).padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
};

export default BookingCreate;
