import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import {
    MapPin, User, ChevronLeft, ChevronRight, Star,
    Briefcase, Heart, Home, Calendar, MessageSquare,
    LogOut, Bell, Search, Clock, Navigation,
    CheckCircle, XCircle, IndianRupee, MessageCircle,
    Sun, Moon
} from 'lucide-react';
import { GoogleMap, Marker, DirectionsRenderer, useLoadScript } from '@react-google-maps/api';
import LocaleSwitcher from '../components/common/LocaleSwitcher';
import ChatWindow from '../components/common/ChatWindow';
import api from '../services/api';
import { toast } from 'react-toastify';
import logoUrl from '../assets/broheal.png';

const GOOGLE_LIBRARIES = ['places'];

const UserDashboard = () => {
    const { user, logout, updateUser } = useAuth();
    const { formatPrice } = useLocale();
    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [location, setLocation] = useState('Detecting location...');
    const [coords, setCoords] = useState(null);
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [therapists, setTherapists] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [activeTab, setActiveTab] = useState('home');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [bookings, setBookings] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { isLoaded } = useLoadScript({ googleMapsApiKey, libraries: GOOGLE_LIBRARIES });
    const [addrCoords, setAddrCoords] = useState({});
    const [routes, setRoutes] = useState({});
    const [openChatBookingId, setOpenChatBookingId] = useState(null);
    const [chatInfo, setChatInfo] = useState({});
    const avgSpeedKmph = 25;
    const [isDark, setIsDark] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const catTrackRef = useRef(null);
    const catContainerRef = useRef(null);
    const scrollX = useRef(0);
    const rafIdRef = useRef(null);
    const therapistsRef = useRef(null);

    const [showEditProfile, setShowEditProfile] = useState(false);
    const [editProfileForm, setEditProfileForm] = useState({ name: '', email: '', phone: '', profileImage: '' });
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        if (user) {
            setEditProfileForm({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                profileImage: user.profileImage || ''
            });
        }
    }, [user]);

    const uploadProfileImage = async (file) => {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        if (!cloudName || !uploadPreset) return null;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        return data.secure_url || data.url || null;
    };

    const saveUserProfile = async (imageUrl) => {
        try {
            setSavingProfile(true);
            const payload = {
                profileImage: imageUrl ?? editProfileForm.profileImage
            };
            const name = String(editProfileForm.name || '').trim();
            if (name) payload.name = name;
            const email = String(editProfileForm.email || '').trim();
            if (email && /.+@.+\..+/.test(email)) payload.email = email;
            const phone = String(editProfileForm.phone || '').trim();
            if (/^[0-9]{10}$/.test(phone)) payload.phone = phone;
            const { data } = await api.put('/user/profile', payload);
            if (data?.user) updateUser(data.user);
            try {
                const r = await api.get('/user/profile');
                if (r.data?.user) updateUser(r.data.user);
            } catch { }
            setShowEditProfile(false);
            toast.success('Profile updated');
        } catch (e) {
            toast.error('Failed to update profile');
        } finally {
            setSavingProfile(false);
        }
    };

    const categoryList = (categories.length ? categories : Array.from(new Set(services.map(s => s.category).filter(Boolean))).map(name => ({ name })));

    useEffect(() => {
        const track = catTrackRef.current;
        const container = catContainerRef.current;
        if (!track || !container) return;

        const speed = 0.5;
        let dir = -1; // -1 => left, 1 => right

        const maxShift = Math.max(0, track.scrollWidth - container.clientWidth);
        const clamp = (v) => Math.min(0, Math.max(-maxShift, v));

        const apply = () => {
            scrollX.current = clamp(scrollX.current);
            track.style.transform = `translateX(${scrollX.current}px)`;
        };

        const step = () => {
            scrollX.current += dir * speed;
            if (scrollX.current <= -maxShift) dir = 1;
            if (scrollX.current >= 0) dir = -1;
            apply();
            rafIdRef.current = requestAnimationFrame(step);
        };
        rafIdRef.current = requestAnimationFrame(step);

        const onWheel = (e) => {
            e.preventDefault();
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            scrollX.current -= delta; // wheel right => move left
            apply();
        };

        let dragging = false; let startX = 0; let startOffset = 0;
        const onDown = (e) => {
            dragging = true;
            startX = e.touches ? e.touches[0].clientX : e.clientX;
            startOffset = scrollX.current;
            container.style.cursor = 'grabbing';
        };
        const onMove = (e) => {
            if (!dragging) return;
            const x = e.touches ? e.touches[0].clientX : e.clientX;
            const dx = x - startX;
            scrollX.current = startOffset + dx;
            apply();
        };
        const onUp = () => {
            dragging = false;
            container.style.cursor = '';
        };

        container.addEventListener('wheel', onWheel, { passive: false });
        container.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        container.addEventListener('touchstart', onDown, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onUp);

        return () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            track.style.transform = '';
            container.removeEventListener('wheel', onWheel);
            container.removeEventListener('mousedown', onDown);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            container.removeEventListener('touchstart', onDown);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onUp);
        };
    }, [categories, services]);



    const handleLogout = async () => {
        try {
            await logout();
            sessionStorage.setItem('sessionRole', 'user');
            navigate('/login?role=user');
        } catch (e) {
            // no-op
        }
    };

    const heroImages = [
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
        'https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800',
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800'
    ];

    const heroSlides = [
        {
            title: 'Professional Therapy at Your Doorstep',
            subtitle: 'Book certified therapists with transparent pricing',
            cta: 'Book Now'
        },
        {
            title: 'Top Rated Therapists',
            subtitle: 'Verified professionals with excellent ratings',
            cta: 'Find Therapists'
        },
        {
            title: 'Relax & Rejuvenate',
            subtitle: 'Schedule services that fit your busy day',
            cta: 'Schedule Now'
        }
    ];

    useEffect(() => {
        const initialTab = searchParams.get('tab');
        if (initialTab) {
            setActiveTab(initialTab);
        }

        getLocation();
        loadServices();
        loadTherapists();
        loadFavorites();
        loadUserBookings();

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [searchParams]);

    useEffect(() => {
        loadCategories();
    }, []);

    // Poll chat summaries to drive unread indicators
    useEffect(() => {
        if (!bookings || bookings.length === 0) return;
        let cancelled = false;
        const fetchChats = async () => {
            try {
                const entries = await Promise.all(bookings.map(async (b) => {
                    try {
                        const r = await api.get(`/chat/${b._id}`);
                        const msgs = r.data.chat?.messages || [];
                        const last = msgs.length ? msgs[msgs.length - 1] : null;
                        return [b._id, { last }];
                    } catch {
                        return [b._id, chatInfo[b._id] || {}];
                    }
                }));
                if (!cancelled) setChatInfo(Object.fromEntries(entries));
            } catch { }
        };
        fetchChats();
        const id = setInterval(fetchChats, 10000);
        return () => { cancelled = true; clearInterval(id); };
    }, [bookings]);

    const unreadCount = bookings.filter(b => {
        const last = chatInfo[b._id]?.last;
        return last && String(last.sender) !== String(user._id);
    }).length;

    const getLocation = async () => {
        if (!navigator.geolocation) {
            setLocation('Location unavailable');
            return;
        }

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    timeout: 10000,
                    maximumAge: 60000
                });
            });

            const { latitude, longitude } = position.coords;
            setCoords({ lat: latitude, lng: longitude });

            if (googleMapsApiKey) {
                const resp = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}`
                );
                const data = await resp.json();
                const comp = data.results?.[0]?.address_components || [];
                const byType = (t) => comp.find((c) => c.types?.includes(t))?.long_name;
                const locality = byType('sublocality') || byType('locality') || byType('administrative_area_level_2');
                const city = byType('administrative_area_level_1') || byType('country');
                const label = [locality, city].filter(Boolean).join(', ');
                setLocation(label || 'Your Location');
            } else {
                setLocation('Your Location');
            }

            loadTherapists({ lat: latitude, lng: longitude });
        } catch (error) {
            setLocation('Location disabled');
            console.log('Location error:', error.message);
        }
    };

    const loadServices = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/user/services');
            setServices(response.data.services || []);
        } catch (error) {
            console.error('Failed to load services:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const res = await api.get('/public/categories');
            setCategories(res.data.categories || []);
        } catch (e) {
            setCategories([]);
        }
    };

    const loadTherapists = async (c) => {
        try {
            let url = '/user/therapists?sort=nearest';
            const use = c || coords;
            if (use?.lat && use?.lng) {
                url += `&lat=${use.lat}&lng=${use.lng}`;
            }
            const response = await api.get(url);
            setTherapists(response.data.therapists || []);
        } catch (error) {
            console.error('Failed to load therapists:', error);
        }
    };

    const loadFavorites = async () => {
        try {
            const response = await api.get('/favorites');
            const favs = response.data.favorites || [];
            setFavorites(favs);
            setFavoriteIds(new Set(favs.map(f => f.therapistId._id)));
        } catch (error) {
            console.error('Failed to load favorites:', error);
        }
    };

    const toggleFavorite = async (therapistId, e) => {
        e.stopPropagation();
        try {
            const wasFavorite = favoriteIds.has(therapistId);
            setFavoriteIds(prev => {
                const newSet = new Set(prev);
                if (wasFavorite) {
                    newSet.delete(therapistId);
                } else {
                    newSet.add(therapistId);
                }
                return newSet;
            });

            await api.post('/favorites/toggle', { therapistId });

            toast.success(wasFavorite ? 'Removed from favorites' : 'Added to favorites');
            loadFavorites();
        } catch (error) {
            setFavoriteIds(prev => {
                const newSet = new Set(prev);
                if (favoriteIds.has(therapistId)) {
                    newSet.delete(therapistId);
                } else {
                    newSet.add(therapistId);
                }
                return newSet;
            });
            toast.error('Failed to update favorites');
        }
    };

    const servicesByCategory = services.reduce((acc, service) => {
        const category = service.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(service);
        return acc;
    }, {});

    const handleBookNow = (therapistId, serviceId = null) => {
        let sid = serviceId;
        if (!sid && services && services.length > 0) {
            sid = services[0]._id;
        }
        navigate('/booking/create', {
            state: { therapistId, serviceId: sid }
        });
    };

    const loadUserBookings = async () => {
        try {
            const response = await api.get('/user/bookings');
            setBookings(response.data.bookings || []);
        } catch (error) {
            console.error('Failed to load bookings:', error);
        }
    };

    const cancelBooking = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            await api.put(`/user/bookings/${id}/cancel`);
            toast.success('Booking cancelled');
            loadUserBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const payNow = async (bookingId) => {
        try {
            const response = await api.post('/payment/initiate', { bookingId });
            const { orderId, keyId, amount, currency } = response.data;
            if (!orderId || !keyId) {
                toast.error('Payment initiation failed');
                return;
            }

            const loadScript = () => new Promise((resolve) => {
                if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
                    resolve(true);
                    return;
                }
                const s = document.createElement('script');
                s.src = 'https://checkout.razorpay.com/v1/checkout.js';
                s.onload = () => resolve(true);
                s.onerror = () => resolve(false);
                document.body.appendChild(s);
            });

            const ok = await loadScript();
            if (!ok) {
                toast.error('Failed to load payment gateway');
                return;
            }

            const options = {
                key: keyId,
                amount: Math.round(Number(amount) * 100),
                currency: currency || 'INR',
                name: 'BroHeal',
                description: 'Service Payment',
                order_id: orderId,
                handler: async function (resp) {
                    try {
                        await api.post('/payment/callback', {
                            razorpay_order_id: resp.razorpay_order_id,
                            razorpay_payment_id: resp.razorpay_payment_id,
                            razorpay_signature: resp.razorpay_signature
                        });
                        toast.success('Payment successful');
                        navigate(`/payment/success/${orderId}`);
                    } catch (e) {
                        toast('Verifying payment...');
                        navigate(`/payment/success/${orderId}`);
                    }
                },
                modal: {
                    ondismiss: function () {
                        toast.info('Payment cancelled');
                    }
                },
                theme: {
                    color: '#10b981',
                    backdrop_color: isDark ? '#111827' : '#f9fafb'
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to initiate payment');
        }
    };

    useEffect(() => {
        if (activeTab !== 'bookings') return;
        const hasLive = bookings.some(b => b.status === 'on_the_way' || b.status === 'in_progress');
        if (!hasLive) return;

        const interval = setInterval(() => {
            loadUserBookings();
        }, 3000);

        return () => clearInterval(interval);
    }, [activeTab, bookings]);

    useEffect(() => {
        const id = searchParams.get('openChat');
        if (!id) return;

        setActiveTab('bookings');
        const exists = bookings.some(b => String(b._id) === String(id));
        if (exists) {
            setTimeout(() => {
                setOpenChatBookingId(id);
            }, 100);
        }
    }, [searchParams, bookings]);

    useEffect(() => {
        const fetchAddr = async (b) => {
            if (!googleMapsApiKey) return;
            const q = [b.address?.street, b.address?.city, b.address?.state]
                .filter(Boolean).join(', ');
            if (!q) return;

            try {
                const resp = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${googleMapsApiKey}`
                );
                const data = await resp.json();
                const r = data.results?.[0]?.geometry?.location;
                if (r?.lat && r?.lng) {
                    setAddrCoords(prev => ({
                        ...prev,
                        [b._id]: { lat: r.lat, lng: r.lng }
                    }));
                }
            } catch { }
        };

        bookings.forEach((b) => {
            const need = (b.status === 'on_the_way' || b.status === 'in_progress') &&
                (!b.address?.latitude || !b.address?.longitude) &&
                !addrCoords[b._id];
            if (need) fetchAddr(b);
        });
    }, [bookings, googleMapsApiKey]);

    useEffect(() => {
        if (!isLoaded) return;

        bookings.forEach((b) => {
            const live = b.status === 'on_the_way' || b.status === 'in_progress';
            if (!live) return;

            const origin = b.therapistLocation?.latitude && b.therapistLocation?.longitude
                ? { lat: b.therapistLocation.latitude, lng: b.therapistLocation.longitude }
                : null;
            const dest = b.address?.latitude && b.address?.longitude
                ? { lat: b.address.latitude, lng: b.address.longitude }
                : addrCoords[b._id] || null;

            if (!origin || !dest) return;

            const svc = new window.google.maps.DirectionsService();
            svc.route({
                origin,
                destination: dest,
                travelMode: window.google.maps.TravelMode.DRIVING
            }, (result, status) => {
                if (status === 'OK') {
                    setRoutes((prev) => ({ ...prev, [b._id]: result }));
                }
            });
        });
    }, [isLoaded, bookings, addrCoords]);

    const distanceKm = (b) => {
        const a = b?.therapistLocation;
        const u = b?.address;
        if (!a?.latitude || !a?.longitude || !u?.latitude || !u?.longitude) return null;

        const toRad = (v) => (v * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(u.latitude - a.latitude);
        const dLng = toRad(u.longitude - a.longitude);
        const lat1 = toRad(a.latitude);
        const lat2 = toRad(u.latitude);
        const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

        return 2 * R * Math.asin(Math.sqrt(h));
    };

    const etaMin = (km) => {
        if (km === null || km === undefined) return null;
        return Math.max(1, Math.round((km / avgSpeedKmph) * 60));
    };

    const filteredTherapists = therapists.filter(therapist =>
        therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (therapist.specialization || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusConfig = (status) => {
        const configs = {
            'booked': {
                bg: isDark ? 'bg-amber-900/20' : 'bg-amber-50',
                text: isDark ? 'text-amber-300' : 'text-amber-700',
                icon: Clock,
                label: 'Booked'
            },
            'on_the_way': {
                bg: isDark ? 'bg-blue-900/20' : 'bg-blue-50',
                text: isDark ? 'text-blue-300' : 'text-blue-700',
                icon: Navigation,
                label: 'On the way'
            },
            'in_progress': {
                bg: isDark ? 'bg-purple-900/20' : 'bg-purple-50',
                text: isDark ? 'text-purple-300' : 'text-purple-700',
                icon: Clock,
                label: 'In progress'
            },
            'awaiting_payment': {
                bg: isDark ? 'bg-yellow-900/20' : 'bg-yellow-50',
                text: isDark ? 'text-yellow-300' : 'text-yellow-700',
                icon: IndianRupee,
                label: 'Awaiting payment'
            },
            'completed': {
                bg: isDark ? 'bg-emerald-900/20' : 'bg-emerald-50',
                text: isDark ? 'text-emerald-300' : 'text-emerald-700',
                icon: CheckCircle,
                label: 'Completed'
            },
            'cancelled': {
                bg: isDark ? 'bg-rose-900/20' : 'bg-rose-50',
                text: isDark ? 'text-rose-300' : 'text-rose-700',
                icon: XCircle,
                label: 'Cancelled'
            }
        };
        return configs[status] || {
            bg: isDark ? 'bg-gray-800' : 'bg-gray-50',
            text: isDark ? 'text-gray-300' : 'text-gray-700',
            icon: Clock,
            label: status
        };
    };

    const handleChatOpen = (bookingId) => {
        setOpenChatBookingId(prev => prev === bookingId ? null : bookingId);
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Top Header */}
            <header className={`sticky top-0 z-50 transition-colors duration-300 ${isDark ? 'bg-gray-800/95 backdrop-blur-sm border-gray-700' : 'bg-white/95 backdrop-blur-sm border-gray-200'}`}>
                <div className="px-4 md:px-8 py-3">
                    <div className="flex items-center justify-between gap-4">
                        {/* Location */}
                        <div className="flex items-center gap-2">
                            <div className={`p-2 transition-colors duration-300 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-primary-50 hover:bg-primary-100'}`}>
                                <MapPin className={`w-5 h-5 transition-colors duration-300 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
                            </div>
                            <div>
                                <p className={`text-xs transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your Location</p>
                                <p className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'} truncate md:truncate-none max-w-[120px] md:max-w-none`}>
                                    {location}
                                </p>
                            </div>
                        </div>

                        {/* Logo */}
                        <div className="flex items-center">
                            <img src={logoUrl} alt="Bro Heal" className="h-8 transition-transform duration-300 hover:scale-105" loading="eager" decoding="async" fetchpriority="high" />
                        </div>

                        {/* Right side icons */}
                        <div className="flex items-center gap-3">
                            <div className="hidden md:block">
                                <LocaleSwitcher isDark={isDark} />
                            </div>
                            <button
                                onClick={() => setIsDark((d) => !d)}
                                className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                aria-label="Toggle theme"
                            >
                                {isDark ? (
                                    <Sun className="w-5 h-5 text-yellow-400 transition-transform duration-300" />
                                ) : (
                                    <Moon className="w-5 h-5 text-gray-700 transition-transform duration-300" />
                                )}
                            </button>
                            <button onClick={() => navigate('/user/notifications')} className={`relative p-2 rounded-full transition-colors duration-300 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                <Bell className={`w-5 h-5 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-600'}`} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className={`flex h-[calc(100vh-73px)] transition-colors duration-300 ${isDark ? 'bg-gray-900' : ''}`}>
                {/* Desktop Sidebar */}
                <aside className={`hidden md:flex flex-col w-64 h-full border-r sticky top-0 overflow-y-auto transition-colors duration-300 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                    {/* User Profile */}
                    <div className={`p-6 border-b transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full transition-colors duration-300 flex items-center justify-center overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-primary-100'}`}>
                                {user.profileImage ? (
                                    <img
                                        src={user.profileImage}
                                        alt={user.name}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                ) : (
                                    <User className={`w-6 h-6 transition-colors duration-300 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
                                )}
                            </div>
                            <div>
                                <h3 className={`font-semibold transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{user.name}</h3>
                                <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>+91 {user.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="p-4 space-y-1">
                        <SidebarItem
                            icon={<Home className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />}
                            label="Home"
                            active={activeTab === 'home'}
                            onClick={() => setActiveTab('home')}
                            isDark={isDark}
                        />
                        <SidebarItem
                            icon={<Calendar className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />}
                            label="Bookings"
                            active={activeTab === 'bookings'}
                            onClick={() => setActiveTab('bookings')}
                            badge={bookings.filter(b => b.status === 'booked' || b.status === 'on_the_way' || b.status === 'in_progress').length}
                            isDark={isDark}
                        />
                        <SidebarItem
                            icon={<Heart className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />}
                            label="Favorites"
                            active={activeTab === 'favorites'}
                            onClick={() => setActiveTab('favorites')}
                            badge={favorites.length}
                            isDark={isDark}
                        />
                        <SidebarItem
                            icon={<MessageSquare className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />}
                            label="Messages"
                            active={activeTab === 'messages'}
                            onClick={() => setActiveTab('messages')}
                            badge={bookings.filter(b => {
                                const last = chatInfo[b._id]?.last;
                                return last && String(last.sender) !== String(user._id);
                            }).length}
                            isDark={isDark}
                        />
                        <SidebarItem
                            icon={<User className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />}
                            label="Profile"
                            active={activeTab === 'profile'}
                            onClick={() => setActiveTab('profile')}
                            isDark={isDark}
                        />

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className={`flex items-center justify-between w-full p-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${isDark ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-red-50'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg transition-colors duration-300 ${isDark ? 'bg-gray-700' : 'bg-red-100'}`}>
                                    <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                                </div>
                                <span className="font-medium">Logout</span>
                            </div>
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className={`flex-1 h-full overflow-y-auto pb-20 md:pb-0 transition-colors duration-300 ${isDark ? 'text-gray-100' : ''}`}>
                    <div className="p-4 md:p-6">
                        {activeTab === 'home' && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Hero Slider */}
                                <div className="relative h-52 md:h-72 rounded-2xl overflow-hidden shadow-xl">
                                    {heroImages.map((image, index) => (
                                        <div
                                            key={index}
                                            className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${index === currentSlide ? 'opacity-100 translate-x-0' :
                                                index < currentSlide ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'
                                                }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`Slide ${index + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-10000 hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                                        </div>
                                    ))}

                                    {/* Content */}
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="px-6 md:px-10 w-full">
                                            <div className="max-w-lg">
                                                <h2 className="text-white font-bold text-3xl md:text-4xl leading-tight animate-slideUp line-clamp-1">
                                                    {heroSlides[currentSlide]?.title}
                                                </h2>
                                                <p className="text-white/90 mt-3 text-base md:text-lg animate-slideUp delay-100 line-clamp-2">
                                                    {heroSlides[currentSlide]?.subtitle}
                                                </p>
                                                <button
                                                    onClick={() => setActiveTab('bookings')}
                                                    className="mt-6 px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg animate-slideUp delay-200"
                                                >
                                                    {heroSlides[currentSlide]?.cta}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <button
                                        onClick={() => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
                                        className="hidden"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentSlide((prev) => (prev + 1) % heroImages.length)}
                                        className="hidden"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>

                                    {/* Dots */}
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                        {heroImages.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentSlide(index)}
                                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Services */}
                                <div className="animate-fadeIn delay-300">

                                    <div className="mb-6">
                                        <h3 className={`text-lg font-semibold transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'} text-left mb-2`}>Category</h3>
                                        <div className="flex justify-start mb-3">
                                            <div className="h-[3px] w-20 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full" />
                                        </div>
                                        <div ref={catContainerRef} className="overflow-hidden -mx-2 px-2">
                                            <div ref={catTrackRef} className="flex items-center gap-6 md:gap-8 mt-2 flex-nowrap pb-2 will-change-transform select-none">
                                                {categoryList.map((cat, idx) => {
                                                    const raw = (cat.image || '').toString();
                                                    const img = raw.trim().replace(/^['"`]+|['"`]+$/g, '');
                                                    return (
                                                        <div key={cat._id || `${cat.name}-${idx}`} className="flex flex-col items-center snap-start shrink-0 cursor-pointer" onClick={() => setActiveCategory(prev => prev === cat.name ? '' : cat.name)}>
                                                            <div className={`h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden bg-gray-100 border-[3px] shadow-sm ${activeCategory === cat.name ? 'border-primary-500' : 'border-gray-300'}`}>
                                                                <img src={img || 'https://via.placeholder.com/80x80?text=Cat'} alt={cat.name} className="w-full h-full object-cover" />
                                                            </div>
                                                            <span className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{cat.name}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h2 className={`text-lg font-semibold transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'} text-left`}>Our Services</h2>
                                            <div className="flex justify-start">
                                                <div className="h-[2px] w-16 bg-gradient-to-r from-primary-500 to-primary-700 mt-1 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className={`transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1 text-left mb-4`}>Choose from a variety of professional treatments</p>

                                    {isLoading ? (
                                        <div className="flex justify-center items-center h-64">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                                        </div>
                                    ) : (
                                        <div className="animate-slideUp">
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {(activeCategory ? services.filter(s => (s.category || 'Other') === activeCategory) : services).map((service) => (
                                                    <div
                                                        key={service._id}
                                                        onClick={() => {
                                                            setSelectedServiceId(service._id);
                                                            setTimeout(() => {
                                                                therapistsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                            }, 50);
                                                        }}
                                                        className={`cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${isDark ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' : 'bg-white border border-gray-200 hover:border-primary-200'} rounded-xl p-5 hover:shadow-xl transition-shadow`}
                                                        aria-label={`Book ${service.title}`}
                                                    >
                                                        <div className="h-28 md:h-40 rounded-lg mb-4 overflow-hidden bg-gray-100">
                                                            <img src={service.image || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'} alt={service.title} className="w-full h-full object-cover" loading="lazy" />
                                                        </div>
                                                        <h4 title={service.title} className={`font-semibold text-sm md:text-lg leading-tight transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'} truncate md:whitespace-normal md:overflow-visible`}>{service.title}</h4>

                                                        <p className={`transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mb-4 line-clamp-2`}>{service.description}</p>
                                                        <div className="flex items-center">
                                                            <div className="inline-flex items-center gap-2">
                                                                <span className={`text-xl font-bold transition-colors duration-300 ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>{formatPrice(service.price)}</span>
                                                                <span className={`transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm whitespace-nowrap`}>{service.duration}min</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Therapists */}
                                <div ref={therapistsRef} className={`transition-all duration-300 transform hover:shadow-xl ${isDark ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' : 'bg-white border border-gray-200 hover:border-primary-200'} rounded-2xl p-6 animate-fadeIn`}>
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                        <div>
                                            <h2 className={`text-lg font-semibold transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Nearest Therapists</h2>
                                            <p className={`transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Find professionals near your location</p>
                                            {selectedServiceId && (
                                                <div className={`mt-1 text-sm ${isDark ? 'text-primary-300' : 'text-primary-700'}`}>
                                                    Showing therapists for: {services.find(s => s._id === selectedServiceId)?.title || 'Selected Service'}
                                                    <button onClick={() => setSelectedServiceId('')} className={`ml-2 underline ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>Clear</button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-400'}`} />
                                            <input
                                                type="text"
                                                placeholder="Search therapists..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className={`pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 w-full md:w-64 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-primary-400' : 'border-gray-300'}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {(filteredTherapists.filter(t => {
                                            if (!selectedServiceId) return true;
                                            const list = Array.isArray(t.services) ? t.services : (Array.isArray(t.serviceIds) ? t.serviceIds : []);
                                            const title = services.find(s => s._id === selectedServiceId)?.title?.toLowerCase() || '';
                                            return list.some(s => {
                                                const sid = s?._id || s?.id || s;
                                                const stitle = (s?.title || '').toLowerCase();
                                                return sid === selectedServiceId || (title && stitle.includes(title));
                                            });
                                        })).length > 0 ? (
                                            filteredTherapists.filter(t => {
                                                if (!selectedServiceId) return true;
                                                const list = Array.isArray(t.services) ? t.services : (Array.isArray(t.serviceIds) ? t.serviceIds : []);
                                                const title = services.find(s => s._id === selectedServiceId)?.title?.toLowerCase() || '';
                                                return list.some(s => {
                                                    const sid = s?._id || s?.id || s;
                                                    const stitle = (s?.title || '').toLowerCase();
                                                    return sid === selectedServiceId || (title && stitle.includes(title));
                                                });
                                            }).map((therapist) => (
                                                <div
                                                    key={therapist._id}
                                                    className={`transition-all duration-300 transform hover:scale-[1.02] ${isDark ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' : 'bg-gray-50 hover:bg-white'} rounded-xl p-5 hover:shadow-lg transition-shadow`}
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-12 h-12 rounded-full transition-colors duration-300 flex items-center justify-center overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-primary-100'}`}>
                                                                {therapist.profileImage ? (
                                                                    <img
                                                                        src={therapist.profileImage}
                                                                        alt={therapist.name}
                                                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                                                    />
                                                                ) : (
                                                                    <User className={`w-6 h-6 transition-colors duration-300 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className={`font-semibold transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{therapist.name}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <div className="flex items-center gap-1">
                                                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 transition-transform duration-300 hover:rotate-12" />
                                                                        <span className="text-sm font-medium">{therapist.rating || '4.8'}</span>
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">•</div>
                                                                    <div className={`flex items-center gap-1 transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                        <Briefcase className="w-4 h-4 transition-transform duration-300 hover:rotate-12" />
                                                                        <span className="text-sm">{therapist.jobsCompleted || '145'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => toggleFavorite(therapist._id, e)}
                                                            className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                                                        >
                                                            <Heart
                                                                className={`w-5 h-5 transition-all duration-300 ${favoriteIds.has(therapist._id)
                                                                    ? 'fill-red-500 text-red-500 animate-heartBeat'
                                                                    : isDark ? 'text-gray-300 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                                                                    }`}
                                                            />
                                                        </button>
                                                    </div>

                                                    <div className="mb-4">
                                                        <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>{therapist.distance || '2.5'} km away</p>
                                                        {therapist.specialization && (
                                                            <div className="flex flex-wrap gap-2">
                                                                {therapist.specialization.split(',').map((spec, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className={`px-2 py-1 transition-colors duration-300 ${isDark ? 'bg-gray-700 text-primary-300 hover:bg-gray-600' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'} text-xs rounded-full`}
                                                                    >
                                                                        {spec.trim()}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => handleBookNow(therapist._id)}
                                                        className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                                                    >
                                                        Book Now
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-3 text-center py-12">
                                                <User className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-bounce-slow" />
                                                <h3 className={`text-lg font-medium transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>No therapists found</h3>
                                                <p className={`transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Try adjusting your search or location</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'bookings' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <h1 className={`text-2xl font-bold transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>My Bookings</h1>
                                    <div className="flex justify-start">
                                        <div className="h-[2px] w-16 bg-gradient-to-r from-primary-500 to-primary-700 mt-1 rounded-full" />
                                    </div>
                                    <p className={`transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Manage your appointments and services</p>
                                </div>

                                {bookings.length === 0 ? (
                                    <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' : 'bg-white border border-gray-200 hover:border-primary-200'} rounded-2xl p-12 text-center animate-fadeIn`}>
                                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-bounce-slow" />
                                        <h3 className={`text-lg font-medium transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>No bookings yet</h3>
                                        <p className={`transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>When you book a service, it will appear here</p>
                                        <button
                                            onClick={() => setActiveTab('home')}
                                            className="mt-6 px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                                        >
                                            Book a Service
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {bookings.map((booking) => {
                                            const statusConfig = getStatusConfig(booking.status);
                                            const StatusIcon = statusConfig.icon;

                                            return (
                                                <div
                                                    key={booking._id}
                                                    className={`transition-all duration-300 transform hover:scale-[1.005] ${isDark ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' : 'bg-white border border-gray-200 hover:border-primary-200'} rounded-xl overflow-hidden hover:shadow-xl transition-shadow animate-slideUp`}
                                                >
                                                    <div className="p-6">
                                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                                            <div className="flex-1">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`p-2 rounded-lg transition-colors duration-300 ${statusConfig.bg}`}>
                                                                            <StatusIcon className={`w-5 h-5 transition-colors duration-300 ${statusConfig.text}`} />
                                                                        </div>
                                                                        <span className={`font-medium transition-colors duration-300 ${statusConfig.text}`}>
                                                                            {statusConfig.label}
                                                                        </span>
                                                                        {booking.status === 'on_the_way' && (
                                                                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                                                        )}
                                                                    </div>
                                                                    <span className={`text-2xl font-bold transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                                                                        ₹{booking.amount?.toLocaleString() || '0'}
                                                                    </span>
                                                                </div>

                                                                <div className="mt-6 space-y-4">
                                                                    <div>
                                                                        <h3 className={`text-lg font-semibold transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{booking.serviceId?.title}</h3>
                                                                        <p className={`transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>{booking.serviceId?.description}</p>
                                                                    </div>

                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <div className="space-y-2">
                                                                            <div className={`flex items-center gap-2 transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                                <Calendar className="w-4 h-4 transition-transform duration-300 hover:rotate-12" />
                                                                                <span className="text-sm">
                                                                                    {new Date(booking.bookingDateTime).toLocaleDateString('en-US', {
                                                                                        weekday: 'short',
                                                                                        month: 'short',
                                                                                        day: 'numeric'
                                                                                    })}
                                                                                </span>
                                                                            </div>
                                                                            <div className={`flex items-center gap-2 transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                                <Clock className="w-4 h-4 transition-transform duration-300 hover:rotate-12" />
                                                                                <span className="text-sm">
                                                                                    {new Date(booking.bookingDateTime).toLocaleTimeString('en-US', {
                                                                                        hour: '2-digit',
                                                                                        minute: '2-digit'
                                                                                    })}
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-2">
                                                                            <div className={`flex items-center gap-2 transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                                <User className="w-4 h-4 transition-transform duration-300 hover:rotate-12" />
                                                                                <span className="text-sm">{booking.therapistId?.name || 'Therapist'}</span>
                                                                            </div>
                                                                            <div className={`flex items-center gap-2 transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                                <MapPin className="w-4 h-4 transition-transform duration-300 hover:rotate-12" />
                                                                                <span className="text-sm truncate">{booking.address?.street || 'Address'}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {Array.isArray(booking.addons) && booking.addons.length > 0 && (
                                                                        <div className="mt-4">
                                                                            <p className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>Add-ons</p>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {booking.addons.map((addon, idx) => (
                                                                                    <span
                                                                                        key={idx}
                                                                                        className={`px-3 py-1.5 transition-colors duration-300 ${isDark ? 'bg-gray-700 text-primary-300 hover:bg-gray-600' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'} rounded-full text-sm`}
                                                                                    >
                                                                                        {addon.title || addon.name} (+₹{addon.price})
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap gap-3 mt-6">
                                                            <button
                                                                onClick={() => handleChatOpen(booking._id)}
                                                                className={`px-4 py-2.5 border rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 transform hover:scale-105 ${isDark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} shadow-sm hover:shadow-md`}
                                                            >
                                                                <MessageCircle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                                                                Message
                                                            </button>

                                                            {(booking.status === 'booked' || booking.status === 'on_the_way') && (
                                                                <button
                                                                    onClick={() => cancelBooking(booking._id)}
                                                                    className={`px-4 py-2.5 border text-red-700 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${isDark ? 'border-red-400 hover:bg-red-900/20' : 'border-red-300 hover:bg-red-50'} shadow-sm hover:shadow-md`}
                                                                >
                                                                    Cancel Booking
                                                                </button>
                                                            )}

                                                            {((booking.status === 'awaiting_payment') && booking.paymentStatus !== 'success') && (
                                                                <button
                                                                    onClick={() => payNow(booking._id)}
                                                                    className="px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2"
                                                                >
                                                                    <IndianRupee className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                                                                    Pay Now
                                                                </button>
                                                            )}
                                                        </div>

                                                        {openChatBookingId === booking._id && (
                                                            <div className={`mt-6 border-t transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-6 animate-fadeIn`}>
                                                                <ChatWindow
                                                                    bookingId={booking._id}
                                                                    currentUserId={user._id}
                                                                    currentUserRole="user"
                                                                    isChatDisabled={booking.status === 'completed' || booking.paymentStatus === 'success'}
                                                                />
                                                            </div>
                                                        )}

                                                        {isLoaded && (booking.status === 'on_the_way' || booking.status === 'in_progress') && (booking.address?.latitude && booking.address?.longitude) && (
                                                            <div className={`mt-6 border-t transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-6 animate-fadeIn`}>
                                                                <div className="mb-4">
                                                                    <h4 className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Live Location Tracking</h4>
                                                                    {(() => {
                                                                        const km = distanceKm(booking);
                                                                        const eta = km != null ? etaMin(km) : null;
                                                                        return km != null ? (
                                                                            <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                                Therapist is {km.toFixed(1)} km away{eta ? ` • ETA: ${eta} minutes` : ''}
                                                                            </p>
                                                                        ) : null;
                                                                    })()}
                                                                </div>
                                                                <div className={`h-64 rounded-xl overflow-hidden border transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                                                    <GoogleMap
                                                                        zoom={14}
                                                                        center={{ lat: booking.address.latitude || addrCoords[booking._id]?.lat, lng: booking.address.longitude || addrCoords[booking._id]?.lng }}
                                                                        mapContainerStyle={{ width: '100%', height: '100%' }}
                                                                        options={{
                                                                            styles: isDark ? [
                                                                                { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                                                                                { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                                                                                { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }
                                                                            ] : []
                                                                        }}
                                                                    >
                                                                        {(booking.address.latitude || addrCoords[booking._id]) && (
                                                                            <Marker
                                                                                position={{ lat: booking.address.latitude || addrCoords[booking._id]?.lat, lng: booking.address.longitude || addrCoords[booking._id]?.lng }}
                                                                                label="You"
                                                                                icon={{
                                                                                    url: `https://maps.google.com/mapfiles/ms/icons/blue-dot.png`
                                                                                }}
                                                                            />
                                                                        )}
                                                                        {booking.therapistLocation?.latitude && booking.therapistLocation?.longitude && (
                                                                            <Marker
                                                                                position={{ lat: booking.therapistLocation.latitude, lng: booking.therapistLocation.longitude }}
                                                                                label="Therapist"
                                                                                icon={{
                                                                                    url: `https://maps.google.com/mapfiles/ms/icons/red-dot.png`
                                                                                }}
                                                                            />
                                                                        )}
                                                                        {routes[booking._id] && (
                                                                            <DirectionsRenderer
                                                                                directions={routes[booking._id]}
                                                                                options={{
                                                                                    suppressMarkers: true,
                                                                                    polylineOptions: {
                                                                                        strokeColor: '#2563eb',
                                                                                        strokeWeight: 4,
                                                                                        strokeOpacity: 0.8
                                                                                    }
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </GoogleMap>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'favorites' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <h1 className={`text-2xl font-bold transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Favorite Therapists</h1>
                                    <div className="flex justify-start">
                                        <div className="h-[2px] w-16 bg-gradient-to-r from-primary-500 to-primary-700 mt-1 rounded-full" />
                                    </div>
                                    <p className={`transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Your saved professionals for quick booking</p>
                                </div>

                                {favorites.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {favorites.map((favorite) => (
                                            <div
                                                key={favorite._id}
                                                className={`transition-all duration-300 transform hover:scale-[1.02] ${isDark ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' : 'bg-white border border-gray-200 hover:border-primary-200'} rounded-xl p-5 hover:shadow-xl transition-shadow animate-slideUp`}
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-14 h-14 rounded-full transition-colors duration-300 flex items-center justify-center overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-primary-100'}`}>
                                                            {favorite.therapistId.profileImage ? (
                                                                <img
                                                                    src={favorite.therapistId.profileImage}
                                                                    alt={favorite.therapistId.name}
                                                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                                                />
                                                            ) : (
                                                                <User className={`w-7 h-7 transition-colors duration-300 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className={`font-semibold transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{favorite.therapistId.name}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <div className="flex items-center gap-1">
                                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 transition-transform duration-300 hover:rotate-12" />
                                                                    <span className="text-sm font-medium">
                                                                        {favorite.therapistId.rating || '4.8'}
                                                                    </span>
                                                                </div>
                                                                <div className="text-sm text-gray-500">•</div>
                                                                <div className={`flex items-center gap-1 transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                    <Briefcase className="w-4 h-4 transition-transform duration-300 hover:rotate-12" />
                                                                    <span className="text-sm">
                                                                        {favorite.therapistId.jobsCompleted || '145'} jobs
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => toggleFavorite(favorite.therapistId._id, e)}
                                                        className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                                    >
                                                        <Heart className="w-5 h-5 fill-red-500 text-red-500 transition-all duration-300 hover:scale-125" />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => handleBookNow(favorite.therapistId._id)}
                                                    className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                                                >
                                                    Book Now
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' : 'bg-white border border-gray-200 hover:border-primary-200'} rounded-2xl p-12 text-center animate-fadeIn`}>
                                        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse-slow" />
                                        <h3 className={`text-lg font-medium transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>No favorites yet</h3>
                                        <p className={`transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tap the heart icon on any therapist to add them here</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'messages' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <h1 className={`text-2xl font-bold transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Messages</h1>
                                    <div className="flex justify-start">
                                        <div className="h-[2px] w-16 bg-gradient-to-r from-primary-500 to-primary-700 mt-1 rounded-full" />
                                    </div>
                                    <p className={`transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Chat with your therapists</p>
                                </div>

                                <div className="space-y-4">
                                    {(() => {
                                        const shouldLoad = activeTab === 'messages' && bookings.length > 0;
                                        if (shouldLoad && Object.keys(chatInfo).length === 0) {
                                            (async () => {
                                                try {
                                                    const entries = await Promise.all(bookings.map(async (b) => {
                                                        const r = await api.get(`/chat/${b._id}`);
                                                        const msgs = r.data.chat?.messages || [];
                                                        const last = msgs.length ? msgs[msgs.length - 1] : null;
                                                        return [b._id, { last }];
                                                    }));
                                                    setChatInfo(Object.fromEntries(entries));
                                                } catch { }
                                            })();
                                        }
                                        return null;
                                    })()}

                                    {bookings.length === 0 ? (
                                        <div className={`transition-all duration-300 ${isDark ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' : 'bg-white border border-gray-200 hover:border-primary-200'} rounded-2xl p-12 text-center animate-fadeIn`}>
                                            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-bounce-slow" />
                                            <h3 className={`text-lg font-medium transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>No messages yet</h3>
                                            <p className={`transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>When you have bookings, you can chat with therapists here</p>
                                        </div>
                                    ) : (
                                        bookings.map((booking) => {
                                            const lastMessage = chatInfo[booking._id]?.last;
                                            const hasUnread = lastMessage && String(lastMessage.sender) !== String(user._id);

                                            return (
                                                <div
                                                    key={booking._id}
                                                    className={`transition-all duration-300 transform hover:scale-[1.005] ${isDark ? (hasUnread ? 'border border-primary-400 bg-gray-800 hover:border-primary-300' : 'border border-gray-700 bg-gray-800 hover:border-gray-600') : (hasUnread ? 'border-primary-300 bg-primary-50 hover:border-primary-400' : 'border-gray-200 bg-white hover:border-primary-200')} rounded-xl p-5 hover:shadow-xl transition-shadow cursor-pointer animate-slideUp`}
                                                    onClick={() => handleChatOpen(booking._id)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-full transition-colors duration-300 flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-primary-100'}`}>
                                                                <User className={`w-5 h-5 transition-colors duration-300 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
                                                            </div>
                                                            <div>
                                                                <h3 className={`font-semibold transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{booking.therapistId?.name || 'Therapist'}</h3>
                                                                <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{booking.serviceId?.title}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {hasUnread && (
                                                                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                                                            )}
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${getStatusConfig(booking.status).bg} ${getStatusConfig(booking.status).text}`}>
                                                                {getStatusConfig(booking.status).label}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className={`mt-4 text-sm transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        <div className="flex items-center gap-4">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4 transition-transform duration-300 hover:rotate-12" />
                                                                {new Date(booking.bookingDateTime).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4 transition-transform duration-300 hover:rotate-12" />
                                                                {new Date(booking.bookingDateTime).toLocaleTimeString('en-US', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {lastMessage && (
                                                        <div className={`mt-4 p-3 transition-colors duration-300 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50'} rounded-lg`}>
                                                            <p className={`text-sm truncate transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{lastMessage.text}</p>
                                                            <p className={`text-xs mt-1 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                {new Date(lastMessage.createdAt).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {openChatBookingId === booking._id && (
                                                        <div className={`mt-6 border-t transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-6 animate-fadeIn`}>
                                                            <ChatWindow
                                                                bookingId={booking._id}
                                                                currentUserId={user._id}
                                                                currentUserRole="user"
                                                                isChatDisabled={booking.status === 'completed' || booking.paymentStatus === 'success'}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <h1 className={`text-2xl font-bold transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Profile</h1>
                                    <div className="flex justify-between items-center">
                                        <div className="h-[2px] w-16 bg-gradient-to-r from-primary-500 to-primary-700 mt-1 rounded-full" />
                                        <button onClick={() => setShowEditProfile(true)} className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'border border-gray-600 text-gray-200 hover:bg-gray-700' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>Edit Profile</button>
                                    </div>
                                    <p className={`transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Manage your account information</p>
                                </div>

                                <div className={`transition-all duration-300 transform hover:shadow-xl ${isDark ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' : 'bg-white border border-gray-200 hover:border-primary-200'} rounded-2xl p-8`}>
                                    <div className="flex flex-col items-center text-center mb-8">
                                        <div className={`w-24 h-24 rounded-full transition-colors duration-300 flex items-center justify-center overflow-hidden mb-4 ${isDark ? 'bg-gray-700' : 'bg-primary-100'}`}>
                                            {user.profileImage ? (
                                                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            ) : (
                                                <User className={`w-12 h-12 transition-colors duration-300 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
                                            )}
                                        </div>
                                        <h2 className={`text-2xl font-bold transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{user.name}</h2>
                                        <p className={`transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>+91 {user.phone}</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className={`transition-colors duration-300 rounded-lg ${isDark ? 'p-4 bg-gray-800 border border-gray-700' : 'p-4 bg-gray-50'}`}>
                                            <h3 className={`font-medium transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Account Information</h3>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className={`transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Member Since</span>
                                                    <span className="font-medium">{(() => {
                                                        try {
                                                            const d = user?.createdAt ? new Date(user.createdAt) : null;
                                                            return d ? d.getFullYear() : new Date().getFullYear();
                                                        } catch { return new Date().getFullYear(); }
                                                    })()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className={`transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total Bookings</span>
                                                    <span className="font-medium">{bookings.length}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mobile-only Locale Switcher under Profile */}
                                        <div className="md:hidden">
                                            <div className={`transition-colors duration-300 rounded-lg ${isDark ? 'p-4 bg-gray-800 border border-gray-700' : 'p-4 bg-gray-50'}`}>
                                                <h3 className={`font-medium transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Language & Currency</h3>
                                                <div className="flex items-center">
                                                    <LocaleSwitcher isDark={isDark} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className={`w-full mt-8 py-3.5 border text-red-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] ${isDark ? 'border-red-400 hover:bg-red-900/20' : 'border-red-300 hover:bg-red-50'} shadow-sm hover:shadow-md`}
                                    >
                                        <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {showEditProfile && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-2xl p-6 w-full max-w-md`}>
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Edit Profile</h3>
                        <div className="mt-4 space-y-3">
                            <div>
                                <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                                <input value={editProfileForm.name} onChange={(e) => setEditProfileForm(p => ({ ...p, name: e.target.value }))} className={`mt-1 w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${isDark ? 'bg-gray-700 border border-gray-600 text-gray-100' : 'bg-white border border-gray-300'}`} />
                            </div>
                            <div>
                                <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                                <input type="email" value={editProfileForm.email} onChange={(e) => setEditProfileForm(p => ({ ...p, email: e.target.value }))} className={`mt-1 w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${isDark ? 'bg-gray-700 border border-gray-600 text-gray-100' : 'bg-white border border-gray-300'}`} />
                            </div>
                            <div>
                                <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Phone</label>
                                <input value={editProfileForm.phone} onChange={(e) => setEditProfileForm(p => ({ ...p, phone: e.target.value }))} className={`mt-1 w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${isDark ? 'bg-gray-700 border border-gray-600 text-gray-100' : 'bg-white border border-gray-300'}`} />
                            </div>
                            <div>
                                <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Profile Image</label>
                                <div className="flex items-center gap-2">
                                    <input value={editProfileForm.profileImage} onChange={(e) => setEditProfileForm(p => ({ ...p, profileImage: e.target.value }))} placeholder="Image URL" className={`mt-1 w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${isDark ? 'bg-gray-700 border border-gray-600 text-gray-100' : 'bg-white border border-gray-300'}`} />
                                    <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const url = await uploadProfileImage(f); if (url) { setEditProfileForm(p => ({ ...p, profileImage: url })); await saveUserProfile(url); } }} />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setShowEditProfile(false)} className={`px-4 py-2 rounded-lg ${isDark ? 'border border-gray-600 text-gray-200' : 'border border-gray-300 text-gray-700'}`}>Cancel</button>
                            <button disabled={savingProfile} onClick={saveUserProfile} className={`px-4 py-2 rounded-lg bg-primary-600 text-white ${savingProfile ? 'opacity-60' : ''}`}>Save</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Mobile Bottom Navigation */}
            <nav className={`fixed bottom-0 left-0 right-0 transition-colors duration-300 z-40 md:hidden ${isDark ? 'bg-gray-800/95 backdrop-blur-sm border-t border-gray-700' : 'bg-white/95 backdrop-blur-sm border-t border-gray-200'}`} style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                <div className="grid grid-cols-5 h-16">
                    <NavButton
                        icon={<Home className="w-5 h-5 transition-transform duration-300 group-hover:scale-125" />}
                        label="Home"
                        active={activeTab === 'home'}
                        onClick={() => setActiveTab('home')}
                        isDark={isDark}
                    />
                    <NavButton
                        icon={<Calendar className="w-5 h-5 transition-transform duration-300 group-hover:scale-125" />}
                        label="Bookings"
                        active={activeTab === 'bookings'}
                        onClick={() => setActiveTab('bookings')}
                        isDark={isDark}
                    />
                    <NavButton
                        icon={<Heart className="w-5 h-5 transition-transform duration-300 group-hover:scale-125" />}
                        label="Favorites"
                        active={activeTab === 'favorites'}
                        onClick={() => setActiveTab('favorites')}
                        isDark={isDark}
                    />
                    <NavButton
                        icon={<MessageSquare className="w-5 h-5 transition-transform duration-300 group-hover:scale-125" />}
                        label="Messages"
                        active={activeTab === 'messages'}
                        onClick={() => setActiveTab('messages')}
                        badge={unreadCount > 0 ? unreadCount : null}
                        isDark={isDark}
                    />
                    <NavButton
                        icon={<User className="w-5 h-5 transition-transform duration-300 group-hover:scale-125" />}
                        label="Profile"
                        active={activeTab === 'profile'}
                        onClick={() => setActiveTab('profile')}
                        isDark={isDark}
                    />
                </div>
            </nav>

            {/* Add CSS animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes heartBeat {
                    0% { transform: scale(1); }
                    25% { transform: scale(1.2); }
                    50% { transform: scale(1); }
                    75% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                
                @keyframes pulseSlow {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                
                @keyframes bounceSlow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                
                .animate-slideUp {
                    animation: slideUp 0.5s ease-out;
                }
                
                .animate-heartBeat {
                    animation: heartBeat 0.5s ease-out;
                }
                
                .animate-pulse-slow {
                    animation: pulseSlow 2s ease-in-out infinite;
                }
                
                .animate-bounce-slow {
                    animation: bounceSlow 2s ease-in-out infinite;
                }
                
                .delay-100 {
                    animation-delay: 100ms;
                }
                
                .delay-200 {
                    animation-delay: 200ms;
                }
                
                .delay-300 {
                    animation-delay: 300ms;
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

// Helper Components
const SidebarItem = ({ icon, label, active, onClick, badge, isDark }) => (
    <button
        onClick={onClick}
        className={`group flex items-center justify-between w-full p-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${active
            ? 'bg-primary-50 text-primary-700 shadow-sm'
            : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors duration-300 ${active ? 'bg-primary-100' : isDark ? 'bg-gray-700 group-hover:bg-gray-600' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                {icon}
            </div>
            <span className="font-medium">{label}</span>
        </div>
        {badge && (
            <span className="bg-primary-500 text-white text-xs font-medium px-2 py-1 rounded-full min-w-6 text-center transition-all duration-300 group-hover:scale-110">
                {badge}
            </span>
        )}
    </button>
);

const NavButton = ({ icon, label, active, onClick, badge, isDark }) => (
    <button
        onClick={onClick}
        className={`group flex flex-col items-center justify-center gap-1 relative transition-colors duration-300 ${active ? 'text-primary-600' : isDark ? 'text-gray-300' : 'text-gray-600'
            }`}
    >
        {badge && (
            <span className="absolute top-1.5 right-1/3 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-5 h-5 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                {badge}
            </span>
        )}
        <div>
            {icon}
        </div>
        <span className="text-xs font-medium transition-all duration-300">{label}</span>
        {active && (
            <div className="absolute top-0 w-12 h-1 bg-primary-600 rounded-b-full transition-all duration-300"></div>
        )}
    </button>
);

export default UserDashboard;
