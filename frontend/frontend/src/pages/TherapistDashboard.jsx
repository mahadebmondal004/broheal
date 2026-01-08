import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import {
    Wallet, MapPin, CheckCircle, Clock,
    Star, Calendar, MessageSquare, User, LogOut,
    Home, Gift, CreditCard, ChevronLeft, ChevronRight,
    FileText, Settings, Bell, Navigation,
    DollarSign, TrendingUp, Users, Plus,
    Sun, Moon
} from 'lucide-react';
import api from '../services/api';
import ChatWindow from '../components/common/ChatWindow';
import { toast } from 'react-toastify';

const TherapistDashboard = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('home');
    const [bookingFilter, setBookingFilter] = useState('all');
    const [stats, setStats] = useState({
        walletBalance: 0,
        pendingJobs: 0,
        completedJobs: 0,
        totalReviews: 0,
        avgRating: 0
    });
    const [kycStatus, setKycStatus] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [trackingBookingId, setTrackingBookingId] = useState(null);
    const [geoWatchId, setGeoWatchId] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [routeDestination, setRouteDestination] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [openChatBookingId, setOpenChatBookingId] = useState(null);
    const [chatInfo, setChatInfo] = useState({});
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isDark, setIsDark] = useState(() => localStorage.getItem('therapistTheme') === 'dark');
    const [newSlotStart, setNewSlotStart] = useState('');
    const [newSlotEnd, setNewSlotEnd] = useState('');
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [editProfileForm, setEditProfileForm] = useState({ name: '', email: '', phone: '', profileImage: '' });
    const [savingProfile, setSavingProfile] = useState(false);
    const [showReferral, setShowReferral] = useState(false);
    const [referralInfo, setReferralInfo] = useState(null);
    const [showBankModal, setShowBankModal] = useState(false);
    const [bankForm, setBankForm] = useState({ accountNumber: '', ifscCode: '', upiId: '' });
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    useEffect(() => {
        if (user) {
            setEditProfileForm({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                profileImage: user.profileImage || ''
            });
            try {
                const saved = localStorage.getItem('therapist_bank_details');
                if (saved) setBankForm(JSON.parse(saved));
            } catch { }
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

    const handleProfileImageFile = async (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const url = await uploadProfileImage(f);
        if (url) {
            setEditProfileForm(p => ({ ...p, profileImage: url }));
            await saveTherapistProfile(url);
        }
    };
    const saveTherapistProfile = async (imageUrl) => {
        try {
            setSavingProfile(true);
            const payload = {
                profileImage: imageUrl ?? editProfileForm.profileImage
            };
            const name = String(editProfileForm.name || '').trim();
            if (name) payload.name = name;
            const email = String(editProfileForm.email || '').trim();
            if (email && /.+@.+\..+/.test(email)) payload.email = email;
            if (/^[0-9]{10}$/.test(String(editProfileForm.phone || ''))) {
                payload.phone = editProfileForm.phone;
            }
            const { data } = await api.put('/therapist/profile', payload);
            if (data?.user) updateUser(data.user);
            try {
                const r = await api.get('/therapist/profile');
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

    const openReferral = async () => {
        try {
            const { data } = await api.get('/therapist/referral');
            setReferralInfo(data.referral || null);
            setShowReferral(true);
        } catch (e) {
            setReferralInfo(null);
            setShowReferral(true);
        }
    };

    const saveBankDetails = () => {
        try {
            localStorage.setItem('therapist_bank_details', JSON.stringify(bankForm));
            toast.success('Bank details saved');
            setShowBankModal(false);
        } catch {
            toast.error('Failed to save bank details');
        }
    };

    const withdrawFunds = async () => {
        try {
            const amt = Number(withdrawAmount);
            if (!Number.isFinite(amt) || amt < 100) { toast.error('Minimum withdraw ₹100'); return; }
            const details = { ...bankForm };
            if (!details.accountNumber && !details.upiId) { toast.error('Add bank or UPI details'); return; }
            const { data } = await api.post('/therapist/wallet/withdraw', { amount: amt, bankDetails: details });
            toast.success('Withdrawal requested');
            setShowWithdraw(false);
            setWithdrawAmount('');
            await loadTransactions();
            await loadStats();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Withdraw failed');
        }
    };
    const [addingSlot, setAddingSlot] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const heroImages = [
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
        'https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800',
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800'
    ];
    const heroSlides = [
        {
            title: 'Grow Your Practice',
            subtitle: 'Manage slots, track bookings, and boost your ratings',
            cta: 'Add Slots',
            action: () => setActiveTab('slots')
        },
        {
            title: 'Stay On Top of Jobs',
            subtitle: 'View upcoming bookings and update live status',
            cta: 'View Bookings',
            action: () => setActiveTab('bookings')
        },
        {
            title: 'Wallet & Earnings',
            subtitle: 'Check balance and recent transactions at a glance',
            cta: 'Open Wallet',
            action: () => setActiveTab('wallet')
        }
    ];

    const logoUrl = "https://i.ibb.co/23Sm0NDC/broheal.png";

    useEffect(() => {
        localStorage.setItem('therapistTheme', isDark ? 'dark' : 'light');
    }, [isDark]);

    useEffect(() => {
        try {
            sessionStorage.setItem('sessionRole', 'therapist');
        } catch { }
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            sessionStorage.setItem('sessionRole', 'therapist');
            navigate('/login?role=therapist');
        } catch (e) {
            // no-op
        }
    };

    useEffect(() => {
        const initialTab = searchParams.get('tab');
        if (initialTab) {
            setActiveTab(initialTab);
        }
        loadStats();
        loadBookings();
        loadKycStatus();
        loadTransactions();
    }, [searchParams]);

    // Poll chat summaries to power unread indicators
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

    useEffect(() => {
        if (activeTab === 'slots' && selectedDate) {
            loadSlots(selectedDate);
        }
    }, [activeTab, selectedDate]);

    const loadStats = async () => {
        try {
            const response = await api.get('/therapist/stats');
            setStats(response.data.stats || stats);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const loadKycStatus = async () => {
        try {
            const response = await api.get('/therapist/kyc/status');
            setKycStatus(response.data?.kyc?.approvalStatus || 'not submitted');
        } catch (error) {
            setKycStatus('not submitted');
        }
    };

    const loadTransactions = async () => {
        try {
            const response = await api.get('/therapist/transactions?limit=50');
            setTransactions(response.data.transactions || []);
        } catch (error) {
            setTransactions([]);
        }
    };

    const loadBookings = async () => {
        try {
            const response = await api.get('/therapist/bookings');
            setBookings(response.data.bookings || []);
        } catch (error) {
            console.error('Failed to load bookings:', error);
        }
    };

    const loadSlots = async (date) => {
        try {
            setLoadingSlots(true);
            const response = await api.get(`/therapist/slots?date=${date}`);
            const incoming = response.data.slots || [];
            if (Array.isArray(incoming) && incoming.length) {
                const normalized = incoming.map((s) => {
                    if (typeof s === 'string') return { time: s, startTime: s, endTime: null };
                    if (s?.slotTime) return { time: s.slotTime, startTime: s.startTime || s.slotTime, endTime: s.endTime || null, status: s.status };
                    if (s?.time) return { time: s.time, startTime: s.startTime || s.time, endTime: s.endTime || null, status: s.status };
                    return null;
                }).filter(Boolean);
                const toMinutes = (val) => { const [h, m] = String(val).split(':').map(Number); return h * 60 + m }
                const toHHMM = (mins) => { const h = Math.floor(mins / 60); const m = mins % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` }
                setSlots(normalized.map((t) => ({
                    time: t.time,
                    startTime: t.startTime,
                    endTime: t.endTime || toHHMM(toMinutes(t.startTime) + 60),
                    selected: false,
                    saved: false
                })));
            } else {
                setSlots([]);
            }
        } catch (error) {
            setSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    const toggleSlot = (idx) => {
        setSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, selected: !s.selected } : s)));
    };

    const saveSlots = async () => {
        try {
            const toMinutes = (val) => { const [h, m] = String(val).split(':').map(Number); return h * 60 + m };
            const toHHMM = (mins) => { const h = Math.floor(mins / 60); const m = mins % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` };
            const payload = slots
                .filter((s) => s.selected || !s.saved)
                .map((s) => ({
                    slotDate: selectedDate,
                    slotTime: s.startTime || s.time,
                    startTime: s.startTime || s.time,
                    endTime: s.endTime || toHHMM(toMinutes(s.startTime || s.time) + 60),
                    status: 'available'
                }));
            if (payload.length === 0) {
                toast.info('No new slots to save');
                return;
            }
            await api.post('/therapist/slots', { slots: payload });
            await loadSlots(selectedDate);
            toast.success('Slots saved');
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Failed to save slots');
        } finally {
            setSlots((prev) => prev.map((s) => ({ ...s, saved: true, selected: false })));
        }
    };

    const addSlot = async () => {
        try {
            if (!newSlotStart || !selectedDate) return;
            const toMinutes = (val) => { const [h, m] = String(val).split(':').map(Number); return h * 60 + m };
            const end = newSlotEnd || (() => { const mins = toMinutes(newSlotStart) + 60; const h = Math.floor(mins / 60); const m = mins % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` })();
            if (toMinutes(end) <= toMinutes(newSlotStart)) { toast.error('End time must be after start time'); return; }
            setAddingSlot(true);
            await api.post('/therapist/slots', { slots: [{ slotDate: selectedDate, slotTime: newSlotStart, startTime: newSlotStart, endTime: end, status: 'available' }] });
            setNewSlotStart('');
            setNewSlotEnd('');
            await loadSlots(selectedDate);
            toast.success('Slot added');
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Failed to add slot');
        } finally {
            setAddingSlot(false);
        }
    };

    const filteredBookings = bookings.filter(booking => {
        if (bookingFilter === 'all') return true;
        if (bookingFilter === 'pending') return booking.status === 'booked';
        if (bookingFilter === 'on-the-way') return booking.status === 'on_the_way';
        if (bookingFilter === 'in-progress') return booking.status === 'in_progress';
        if (bookingFilter === 'completed') return booking.status === 'completed';
        if (bookingFilter === 'cancelled') return booking.status === 'cancelled';
        return true;
    });

    const getStatusColor = (status) => {
        const colors = {
            'booked': 'bg-amber-50 text-amber-700 border-amber-200',
            'on_the_way': 'bg-blue-50 text-blue-700 border-blue-200',
            'in_progress': 'bg-purple-50 text-purple-700 border-purple-200',
            'completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'cancelled': 'bg-rose-50 text-rose-700 border-rose-200',
            'awaiting_payment': 'bg-yellow-50 text-yellow-700 border-yellow-200'
        };
        return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    const updateBookingStatus = async (id, status) => {
        try {
            let payload = { status };
            if (status === 'on_the_way' && navigator.geolocation) {
                await new Promise((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            const { latitude, longitude } = pos.coords;
                            payload.location = { lat: latitude, lng: longitude };
                            resolve();
                        },
                        () => resolve(),
                        { enableHighAccuracy: true, timeout: 5000 }
                    );
                });
            }
            await api.put(`/therapist/bookings/${id}/status`, payload);
            if (status === 'on_the_way' && navigator.geolocation) {
                const watchId = navigator.geolocation.watchPosition(
                    async (pos) => {
                        try {
                            await api.put(`/therapist/bookings/${id}/location`, { lat: pos.coords.latitude, lng: pos.coords.longitude });
                            setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                        } catch (e) { }
                    },
                    () => { },
                    { enableHighAccuracy: true, maximumAge: 2000 }
                );
                setTrackingBookingId(id);
                setGeoWatchId(watchId);
            } else if (geoWatchId) {
                navigator.geolocation.clearWatch(geoWatchId);
                setGeoWatchId(null);
                setTrackingBookingId(null);
                setCurrentLocation(null);
                setRouteDestination(null);
            }
            toast.success('Status updated');
            loadBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleOnTheWay = async (booking) => {
        try {
            let origin = null;
            if (navigator.geolocation) {
                await new Promise((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                            setCurrentLocation(origin);
                            resolve();
                        },
                        () => resolve(),
                        { enableHighAccuracy: true, timeout: 5000 }
                    );
                });
            }
            await updateBookingStatus(booking._id, 'on_the_way');
            const destLat = booking.address?.latitude;
            const destLng = booking.address?.longitude;
            if (destLat && destLng) {
                setRouteDestination({ lat: destLat, lng: destLng });
            }
        } catch (e) {
            // no-op
        }
    };

    const scrollLeft = () => {
        const container = document.getElementById('stats-cards-container');
        if (container) {
            container.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        const container = document.getElementById('stats-cards-container');
        if (container) {
            container.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    const to12h = (val) => {
        if (!val) return ''
        const [hh, mm] = String(val).split(':').map(Number)
        const am = hh < 12
        const h12 = hh % 12 === 0 ? 12 : hh % 12
        return `${h12}:${String(mm).padStart(2, '0')} ${am ? 'AM' : 'PM'}`
    }

    const safeFormat = (val, fmt) => {
        const d = val instanceof Date ? val : new Date(val)
        if (!d || isNaN(d.getTime())) return ''
        try { return format(d, fmt) } catch { return '' }
    }

    const addOneHour = (val) => {
        if (!val || !/^[0-9]{2}:[0-9]{2}$/.test(val)) return val
        const [hh, mm] = val.split(':').map(Number)
        const nextH = (hh + 1) % 24
        return `${String(nextH).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
            {/* Top Header */}
            <header className={`sticky top-0 z-50 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} header-animated`}>
                <div className="px-4 md:px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={logoUrl} alt="Bro Heal" className="h-8 w-auto" />
                            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                                    {user.profileImage ? (
                                        <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-4 h-4 text-primary-600" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{user.name}</span>
                                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>+91 {user.phone}</span>
                                </div>
                            </div>
                        </div>

                        <div className={`flex items-center gap-2 px-2 py-1 rounded-full border ${isDark ? 'bg-gray-700/60 border-gray-600' : 'bg-gray-50/80 border-gray-200'} shadow-sm`}>
                            <button
                                onClick={() => setIsDark((d) => !d)}
                                className={`p-2 w-9 h-9 flex items-center justify-center rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                                aria-label="Toggle theme"
                            >
                                {isDark ? (
                                    <Sun className="w-5 h-5 text-yellow-400" />
                                ) : (
                                    <Moon className="w-5 h-5 text-gray-700" />
                                )}
                            </button>
                            <span className={`${isDark ? 'bg-gray-600' : 'bg-gray-300'} h-5 w-px rounded-full`} />
                            <button onClick={() => navigate('/therapist/notifications')} className={`relative p-2 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}>
                                <Bell className={`w-5 h-5 ${isDark ? 'text-gray-200' : 'text-gray-600'}`} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>
                            <button
                                onClick={handleLogout}
                                className={`hidden md:flex items-center gap-2 px-4 py-2 text-red-600 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-red-50'} rounded-lg transition-colors`}
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className={`flex ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                {/* Fixed Sidebar */}
                <aside className={`hidden md:flex flex-col w-64 h-[calc(100vh-73px)] border-r ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} fixed top-[73px] left-0 overflow-y-hidden`}>
                    <nav className="flex-1 p-4 space-y-1">
                        <SidebarItem
                            icon={<Home className="w-5 h-5" />}
                            label="Dashboard"
                            active={activeTab === 'home'}
                            onClick={() => setActiveTab('home')}
                            isDark={isDark}
                        />
                        <SidebarItem
                            icon={<Calendar className="w-5 h-5" />}
                            label="Bookings"
                            active={activeTab === 'bookings'}
                            onClick={() => setActiveTab('bookings')}
                            badge={stats.pendingJobs > 0 ? stats.pendingJobs : null}
                            isDark={isDark}
                        />
                        <SidebarItem
                            icon={<Calendar className="w-5 h-5" />}
                            label="Time Slots"
                            active={activeTab === 'slots'}
                            onClick={() => setActiveTab('slots')}
                            isDark={isDark}
                        />
                        <SidebarItem
                            icon={<Wallet className="w-5 h-5" />}
                            label="Wallet"
                            active={activeTab === 'wallet'}
                            onClick={() => setActiveTab('wallet')}
                            isDark={isDark}
                        />
                        <SidebarItem
                            icon={<MessageSquare className="w-5 h-5" />}
                            label="Messages"
                            active={activeTab === 'messages'}
                            onClick={() => setActiveTab('messages')}
                            badge={bookings.filter(b => {
                                const last = chatInfo[b._id]?.last;
                                return last && String(last.sender) !== String(user._id);
                            }).length || null}
                            isDark={isDark}
                        />
                        <SidebarItem
                            icon={<User className="w-5 h-5" />}
                            label="Profile"
                            active={activeTab === 'profile'}
                            onClick={() => setActiveTab('profile')}
                            isDark={isDark}
                        />
                    </nav>

                    <div className="p-4 border-t border-gray-200 md:hidden">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content - Scrollable */}
                <main className="flex-1 pb-20 md:pb-0 overflow-y-auto min-h-[calc(100vh-73px)] md:ml-64">
                    <div className="p-4 md:p-6">
                        {activeTab === 'home' && (
                            <div className="space-y-6">
                                <div className="relative h-52 md:h-72 rounded-2xl overflow-hidden shadow-xl">
                                    {heroImages.map((image, index) => (
                                        <div
                                            key={index}
                                            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${index === currentSlide ? 'translate-x-0' :
                                                index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                                                }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`Slide ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
                                        </div>
                                    ))}

                                    <div className="absolute inset-0 flex items-center">
                                        <div className="px-6 md:px-10 w-full">
                                            <div className="max-w-lg">
                                                <h2 className="text-white font-bold text-3xl md:text-4xl leading-tight line-clamp-1">
                                                    {heroSlides[currentSlide]?.title}
                                                </h2>
                                                <p className="text-white/90 mt-3 text-base md:text-lg line-clamp-2">
                                                    {heroSlides[currentSlide]?.subtitle}
                                                </p>
                                                <button
                                                    onClick={() => heroSlides[currentSlide]?.action?.()}
                                                    className="mt-6 px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    {heroSlides[currentSlide]?.cta}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

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

                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                        {heroImages.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentSlide(index)}
                                                className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-white w-6' : 'bg-white/50'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {/* Welcome Section with Horizontal Scroll */}
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Welcome back, {user.name}!</h1>
                                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Here's your daily overview</p>
                                        </div>
                                        <div className="hidden md:block">
                                            <div className="text-right">
                                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Today</p>
                                                <p className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{safeFormat(new Date(), 'EEEE, MMMM d')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Scrollable Stats Cards */}
                                    <div className="relative">
                                        <button
                                            onClick={scrollLeft}
                                            className="hidden"
                                        >
                                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                                        </button>

                                        <div
                                            id="stats-cards-container"
                                            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
                                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                        >
                                            {/* Wallet Balance Card */}
                                            <div className={`min-w-[280px] ${isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200'} rounded-xl p-6`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="p-2.5 rounded-lg bg-emerald-50">
                                                        <Wallet className="w-5 h-5 text-emerald-600" />
                                                    </div>
                                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-700">
                                                        +1%
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className={`text-3xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>₹{stats.walletBalance.toLocaleString()}</p>
                                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Wallet Balance</p>
                                                </div>
                                            </div>

                                            {/* Pending Jobs Card */}
                                            <div className={`min-w-[280px] ${isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200'} rounded-xl p-6`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="p-2.5 rounded-lg bg-amber-50">
                                                        <Clock className="w-5 h-5 text-amber-600" />
                                                    </div>
                                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-700">
                                                        +2%
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className={`text-3xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{stats.pendingJobs}</p>
                                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Pending Jobs</p>
                                                </div>
                                            </div>

                                            {/* Completed Jobs Card */}
                                            <div className={`min-w-[280px] ${isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200'} rounded-xl p-6`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="p-2.5 rounded-lg bg-blue-50">
                                                        <CheckCircle className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-700">
                                                        +3%
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className={`text-3xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{stats.completedJobs}</p>
                                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Completed Jobs</p>
                                                </div>
                                            </div>

                                            {/* Rating Card */}
                                            <div className={`min-w-[280px] ${isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200'} rounded-xl p-6`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="p-2.5 rounded-lg bg-purple-50">
                                                        <Star className="w-5 h-5 text-purple-600" />
                                                    </div>
                                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-700">
                                                        +4%
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-baseline gap-2">
                                                        <p className={`text-3xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{stats.avgRating.toFixed(1)}</p>
                                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>({stats.totalReviews} reviews)</p>
                                                    </div>
                                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Rating</p>
                                                </div>
                                            </div>

                                            {/* Add more cards here if needed */}
                                        </div>

                                        <button
                                            onClick={scrollRight}
                                            className="hidden"
                                        >
                                            <ChevronRight className="w-4 h-4 text-gray-600" />
                                        </button>
                                    </div>
                                </div>

                                {/* KYC Banner */}
                                {kycStatus !== 'approved' && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-amber-100 rounded-lg">
                                                <FileText className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-amber-900">
                                                    {kycStatus === 'pending' ? 'KYC Under Review' : 'Complete Your KYC'}
                                                </h3>
                                                <p className="text-sm text-amber-700 mt-1">
                                                    {kycStatus === 'pending'
                                                        ? 'Your documents are being reviewed. You\'ll be notified once approved.'
                                                        : 'Submit KYC to start accepting bookings and manage your availability.'
                                                    }
                                                </p>
                                                <button
                                                    onClick={() => navigate('/kyc/submit')}
                                                    className="mt-3 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                                                >
                                                    {kycStatus === 'pending' ? 'View Status' : 'Submit KYC'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Quick Actions */}
                                <div className={`${isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-200'} rounded-xl p-6`}>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Quick Actions</h2>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Access frequently used features</p>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('bookings')}
                                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            View All
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <ActionButton
                                            icon={<Calendar className="w-5 h-5" />}
                                            label="Time Slots"
                                            onClick={() => setActiveTab('slots')}
                                            color="primary"
                                            trend="+5%"
                                        />
                                        <ActionButton
                                            icon={<Wallet className="w-5 h-5" />}
                                            label="Wallet"
                                            onClick={() => setActiveTab('wallet')}
                                            color="emerald"
                                            trend="+1%"
                                        />
                                        <ActionButton
                                            icon={<MessageSquare className="w-5 h-5" />}
                                            label="Messages"
                                            onClick={() => setActiveTab('messages')}
                                            color="blue"
                                            trend="+3%"
                                            badge={bookings.filter(b => {
                                                const last = chatInfo[b._id]?.last;
                                                return last && String(last.sender) !== String(user._id);
                                            }).length || null}
                                        />
                                        <ActionButton
                                            icon={<User className="w-5 h-5" />}
                                            label="Profile"
                                            onClick={() => setActiveTab('profile')}
                                            color="purple"
                                            trend="+2%"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Rest of the tabs remain the same as before */}
                        {activeTab === 'bookings' && (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Bookings</h1>
                                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Manage your appointments and services</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={bookingFilter}
                                            onChange={(e) => setBookingFilter(e.target.value)}
                                            className={`px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isDark ? 'bg-gray-800 border border-gray-700 text-gray-100' : 'bg-white border border-gray-300'}`}
                                        >
                                            <option value="all">All Bookings</option>
                                            <option value="pending">Pending</option>
                                            <option value="on-the-way">On the way</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                {filteredBookings.length === 0 ? (
                                    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-12 text-center`}>
                                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className={`text-lg font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>No bookings found</h3>
                                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>When you receive bookings, they'll appear here</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredBookings.map((booking) => (
                                            <div key={booking._id} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl overflow-hidden hover:shadow-md transition-shadow`}>
                                                <div className="p-5">
                                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                                                        {booking.status.replace('_', ' ')}
                                                                    </span>
                                                                    {booking.paymentStatus !== 'success' && booking.status === 'awaiting_payment' && (
                                                                        <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                                                                            Awaiting Payment
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>₹{booking.amount?.toLocaleString() || '0'}</span>
                                                            </div>

                                                            <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} mt-4`}>{booking.serviceId?.title}</h3>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                                <div className="space-y-2">
                                                                    <div className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                        <Calendar className="w-4 h-4" />
                                                                        <span className="text-sm">
                                                                            {new Date(booking.bookingDateTime).toLocaleDateString('en-US', {
                                                                                weekday: 'short',
                                                                                month: 'short',
                                                                                day: 'numeric'
                                                                            })}
                                                                        </span>
                                                                    </div>
                                                                    <div className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                        <Clock className="w-4 h-4" />
                                                                        <span className="text-sm">{to12h(new Date(booking.bookingDateTime).toTimeString().substring(0, 5))}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <div className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                        <User className="w-4 h-4" />
                                                                        <span className="text-sm">{booking.userId?.name || 'Customer'}</span>
                                                                    </div>
                                                                    <div className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                        <MapPin className="w-4 h-4" />
                                                                        <span className="text-sm truncate">{booking.address?.street || 'Address not specified'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 mt-6">
                                                        <button
                                                            onClick={() => setOpenChatBookingId(openChatBookingId === booking._id ? null : booking._id)}
                                                            className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'border border-gray-600 text-gray-200 hover:bg-gray-700' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                                                        >
                                                            Message
                                                        </button>

                                                        {booking.status === 'booked' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleOnTheWay(booking)}
                                                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
                                                                >
                                                                    <Navigation className="w-4 h-4" />
                                                                    Start Journey
                                                                </button>
                                                                <button
                                                                    onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                                                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'border border-gray-600 text-gray-200 hover:bg-gray-700' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        )}
                                                        {booking.status === 'on_the_way' && (
                                                            <>
                                                                <button
                                                                    onClick={() => updateBookingStatus(booking._id, 'in_progress')}
                                                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                                                                >
                                                                    Start Service
                                                                </button>
                                                                <button
                                                                    onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                                                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'border border-gray-600 text-gray-200 hover:bg-gray-700' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        )}
                                                        {booking.status === 'in_progress' && (
                                                            <>
                                                                <button
                                                                    onClick={() => updateBookingStatus(booking._id, 'completed')}
                                                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                                                                >
                                                                    Complete Service
                                                                </button>
                                                                <button
                                                                    onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                                                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'border border-gray-600 text-gray-200 hover:bg-gray-700' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>

                                                    {openChatBookingId === booking._id && (
                                                        <div className={`mt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-6`}>
                                                            <ChatWindow
                                                                bookingId={booking._id}
                                                                currentUserId={user._id}
                                                                currentUserRole="therapist"
                                                                isChatDisabled={booking.status === 'completed' || booking.paymentStatus === 'success'}
                                                            />
                                                        </div>
                                                    )}

                                                    {((booking._id === trackingBookingId) || booking.status === 'on_the_way') && currentLocation && routeDestination && (
                                                        <div className="mt-6 border-t border-gray-200 pt-6">
                                                            <div className="mb-4">
                                                                <h4 className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Live Navigation</h4>
                                                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Your current location is being tracked</p>
                                                            </div>
                                                            <div className="rounded-lg overflow-hidden border border-gray-200">
                                                                <iframe
                                                                    title={`route-${booking._id}`}
                                                                    className="w-full h-64"
                                                                    style={{ border: 0 }}
                                                                    loading="lazy"
                                                                    allowFullScreen
                                                                    referrerPolicy="no-referrer-when-downgrade"
                                                                    src={`https://www.google.com/maps/embed/v1/directions?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&origin=${currentLocation.lat},${currentLocation.lng}&destination=${routeDestination.lat},${routeDestination.lng}&mode=driving`}
                                                                />
                                                            </div>
                                                            <button
                                                                className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${isDark ? 'border border-gray-600 text-gray-200 hover:bg-gray-700' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                                                                onClick={() => {
                                                                    const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${routeDestination.lat},${routeDestination.lng}&travelmode=driving`;
                                                                    window.open(url, '_blank');
                                                                }}
                                                            >
                                                                <Navigation className="w-4 h-4" />
                                                                Open in Google Maps
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'slots' && (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Manage Time Slots</h1>
                                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Set your availability for appointments</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-3">
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className={`col-span-2 sm:col-span-1 w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isDark ? 'bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-400' : 'bg-white border border-gray-300'}`}
                                        />
                                        <input
                                            type="time"
                                            value={newSlotStart}
                                            onChange={(e) => {
                                                const v = e.target.value
                                                setNewSlotStart(v)
                                                const autoEnd = addOneHour(v)
                                                setNewSlotEnd(autoEnd)
                                            }}
                                            className={`w-full px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isDark ? 'bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-400' : 'bg-white border border-gray-300'}`}
                                        />
                                        <input
                                            type="time"
                                            value={newSlotEnd}
                                            onChange={(e) => setNewSlotEnd(e.target.value)}
                                            placeholder="End"
                                            className={`w-full px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isDark ? 'bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-400' : 'bg-white border border-gray-300'}`}
                                        />
                                        <button
                                            onClick={addSlot}
                                            disabled={addingSlot}
                                            className={`w-full sm:w-auto px-4 py-2.5 ${addingSlot ? 'bg-primary-400' : 'bg-primary-600'} text-white rounded-lg font-medium hover:bg-primary-700 transition-colors`}
                                        >
                                            {addingSlot ? 'Adding...' : 'Add Slot'}
                                        </button>
                                        <button
                                            onClick={saveSlots}
                                            className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                                        >
                                            Save Slots
                                        </button>
                                    </div>
                                </div>

                                {!stats.kycApproved && kycStatus !== 'approved' && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-100 rounded-lg">
                                                <Clock className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-amber-900">Profile Pending Approval</h3>
                                                <p className="text-sm text-amber-700">Your slots will be managed by admin until your profile is approved</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6`}>
                                    {loadingSlots ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                                        </div>
                                    ) : slots.length === 0 ? (
                                        <div className={`text-center py-12`}>
                                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className={`text-lg font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>No slots available</h3>
                                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Select a date to view or add available time slots</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="mb-6">
                                                <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-3`}>
                                                    Available slots for {safeFormat(selectedDate, 'MMMM d, yyyy')}
                                                </h3>
                                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Click on time slots to select/deselect them</p>
                                            </div>
                                            <div className="grid gap-2 sm:gap-3 grid-cols-[repeat(auto-fit,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
                                                {slots.map((slot, idx) => (
                                                    <button
                                                        key={`${slot.time}-${idx}`}
                                                        onClick={() => toggleSlot(idx)}
                                                        className={`p-4 rounded-xl border-2 transition-all text-center min-w-[140px] sm:min-w-[160px] ${slot.saved
                                                                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                                                : slot.selected
                                                                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                                                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                                                            }`}
                                                    >
                                                        <div className="font-medium">
                                                            {slot.startTime && slot.endTime
                                                                ? `${to12h(slot.startTime)} - ${to12h(slot.endTime)}`
                                                                : to12h(slot.time)
                                                            }
                                                        </div>
                                                        <div className="text-xs mt-1 opacity-75">
                                                            {slot.saved ? 'Saved' : slot.selected ? 'Selected' : 'Available'}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'wallet' && (
                            <div className="space-y-6">
                                <div>
                                    <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Wallet</h1>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Manage your earnings and withdrawals</p>
                                </div>

                                {/* Balance Card */}
                                <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-primary-100">Available Balance</p>
                                            <p className="text-4xl font-bold mt-2">₹{stats.walletBalance.toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 bg-white/20 rounded-xl">
                                            <Wallet className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <button className="mt-6 w-full py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setShowWithdraw(true)}>
                                        Withdraw Funds
                                    </button>
                                </div>

                                {/* Transactions */}
                                <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl overflow-hidden`}>
                                    <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Recent Transactions</h2>
                                    </div>
                                    {transactions.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className={`text-lg font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>No transactions yet</h3>
                                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Your transaction history will appear here</p>
                                        </div>
                                    ) : (
                                        <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                            {transactions.map((transaction) => (
                                                <div key={transaction._id} className={`p-6 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-3 rounded-lg ${transaction.status === 'success'
                                                                    ? 'bg-emerald-100 text-emerald-600'
                                                                    : transaction.status === 'failed'
                                                                        ? 'bg-rose-100 text-rose-600'
                                                                        : 'bg-amber-100 text-amber-600'
                                                                }`}>
                                                                {transaction.transactionType === 'withdrawal' ? (
                                                                    <DollarSign className="w-5 h-5" />
                                                                ) : (
                                                                    <TrendingUp className="w-5 h-5" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className={`font-medium capitalize ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                                                                    {transaction.transactionType?.replace('_', ' ')}
                                                                </p>
                                                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                    {safeFormat(transaction.createdAt, 'MMM d, yyyy • hh:mm a')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`text-lg font-semibold ${transaction.transactionType === 'withdrawal'
                                                                    ? 'text-rose-600'
                                                                    : 'text-emerald-600'
                                                                }`}>
                                                                {transaction.transactionType === 'withdrawal' ? '-' : '+'}₹{transaction.amount?.toLocaleString()}
                                                            </p>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.status === 'success'
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : transaction.status === 'failed'
                                                                        ? 'bg-rose-100 text-rose-800'
                                                                        : 'bg-amber-100 text-amber-800'
                                                                }`}>
                                                                {transaction.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'messages' && (
                            <div className="space-y-6">
                                <div>
                                    <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Messages</h1>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Communicate with your clients</p>
                                </div>

                                <div className="space-y-4">
                                    {bookings.length === 0 ? (
                                        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-12 text-center`}>
                                            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                                            <p className="text-gray-600">When you receive bookings, you can chat with clients here</p>
                                        </div>
                                    ) : (
                                        bookings.map((booking) => {
                                            const lastMessage = chatInfo[booking._id]?.last;
                                            const hasUnread = lastMessage && String(lastMessage.sender) !== String(user._id);

                                            return (
                                                <div
                                                    key={booking._id}
                                                    className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl border ${hasUnread ? 'border-primary-300 bg-primary-50' : isDark ? 'border-gray-700' : 'border-gray-200'} p-5 hover:shadow-md transition-shadow cursor-pointer`}
                                                    onClick={() => setOpenChatBookingId(openChatBookingId === booking._id ? null : booking._id)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                                    <User className="w-5 h-5 text-primary-600" />
                                                                </div>
                                                                <div>
                                                                    <h3 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{booking.userId?.name || 'Customer'}</h3>
                                                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{booking.serviceId?.title}</p>
                                                                </div>
                                                            </div>

                                                            <div className={`mt-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                <div className="flex items-center gap-4">
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar className="w-4 h-4" />
                                                                        {new Date(booking.bookingDateTime).toLocaleDateString('en-US', {
                                                                            month: 'short',
                                                                            day: 'numeric'
                                                                        })}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="w-4 h-4" />
                                                                        {to12h(new Date(booking.bookingDateTime).toTimeString().substring(0, 5))}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <MapPin className="w-4 h-4" />
                                                                        {booking.address?.area || 'Location'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {lastMessage && (
                                                                <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                                                    <p className={`text-sm truncate ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{lastMessage.text}</p>
                                                                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        {safeFormat(lastMessage.createdAt, 'MMM d, hh:mm a')}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-col items-end gap-2">
                                                            {hasUnread && (
                                                                <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                                                            )}
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                                {booking.status.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {openChatBookingId === booking._id && (
                                                        <div className="mt-6 border-t border-gray-200 pt-6">
                                                            <ChatWindow
                                                                bookingId={booking._id}
                                                                currentUserId={user._id}
                                                                currentUserRole="therapist"
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
                            <div className="space-y-6">
                                <div>
                                    <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Profile & Settings</h1>
                                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Manage your account and preferences</p>
                                </div>

                                {/* Profile Overview */}
                                <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                                            {user.profileImage ? (
                                                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-10 h-10 text-primary-600" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} truncate`}>{user.name}</h2>
                                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>+91 {user.phone}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                                <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                                                    Therapist
                                                </span>
                                                {kycStatus === 'approved' && (
                                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                                                        Verified
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button onClick={() => setShowEditProfile(true)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0 ${isDark ? 'border border-gray-600 text-gray-200 hover:bg-gray-700' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                                            Edit Profile
                                        </button>
                                    </div>
                                </div>

                                {/* Settings Menu */}
                                <div className="space-y-3">
                                    <MenuItem
                                        icon={<Gift className="w-5 h-5" />}
                                        title="Referral Program"
                                        description="Invite friends & earn rewards"
                                        onClick={openReferral}
                                        color="purple"
                                        isDark={isDark}
                                    />
                                    <MenuItem
                                        icon={<FileText className="w-5 h-5" />}
                                        title="KYC Verification"
                                        description={kycStatus === 'approved' ? 'Verified' : 'Complete your verification'}
                                        onClick={() => navigate('/kyc/submit')}
                                        color="blue"
                                        badge={kycStatus === 'approved' ? 'verified' : kycStatus === 'pending' ? 'pending' : 'not submitted'}
                                        isDark={isDark}
                                    />
                                    <MenuItem
                                        icon={<CreditCard className="w-5 h-5" />}
                                        title="Bank Account"
                                        description="Manage payment methods"
                                        onClick={() => setShowBankModal(true)}
                                        color="emerald"
                                        isDark={isDark}
                                    />
                                    <MenuItem
                                        icon={<Settings className="w-5 h-5" />}
                                        title="Settings"
                                        description="App preferences and notifications"
                                        onClick={() => { }}
                                        color="gray"
                                        isDark={isDark}
                                    />
                                </div>

                                <div className={`pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full py-3.5 border border-rose-200 text-rose-700 rounded-lg font-medium hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Logout Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className={`fixed bottom-0 left-0 right-0 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} z-40 md:hidden`} style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                <div className="grid grid-cols-6 h-16">
                    <NavButton
                        icon={<Home className="w-5 h-5" />}
                        label="Home"
                        active={activeTab === 'home'}
                        onClick={() => setActiveTab('home')}
                    />
                    <NavButton
                        icon={<Calendar className="w-5 h-5" />}
                        label="Bookings"
                        active={activeTab === 'bookings'}
                        onClick={() => setActiveTab('bookings')}
                        badge={stats.pendingJobs > 0 ? stats.pendingJobs : null}
                    />
                    <NavButton
                        icon={<Calendar className="w-5 h-5" />}
                        label="Slots"
                        active={activeTab === 'slots'}
                        onClick={() => setActiveTab('slots')}
                    />
                    <NavButton
                        icon={<Wallet className="w-5 h-5" />}
                        label="Wallet"
                        active={activeTab === 'wallet'}
                        onClick={() => setActiveTab('wallet')}
                    />
                    <NavButton
                        icon={<MessageSquare className="w-5 h-5" />}
                        label="Messages"
                        active={activeTab === 'messages'}
                        onClick={() => setActiveTab('messages')}
                        badge={bookings.filter(b => {
                            const last = chatInfo[b._id]?.last;
                            return last && String(last.sender) !== String(user._id);
                        }).length || null}
                    />
                    <NavButton
                        icon={<User className="w-5 h-5" />}
                        label="Profile"
                        active={activeTab === 'profile'}
                        onClick={() => setActiveTab('profile')}
                    />
                </div>
            </nav>

            {/* Custom CSS for scrollbar hiding */}
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

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
                                    <input type="file" accept="image/*" onChange={handleProfileImageFile} />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setShowEditProfile(false)} className={`px-4 py-2 rounded-lg ${isDark ? 'border border-gray-600 text-gray-200' : 'border border-gray-300 text-gray-700'}`}>Cancel</button>
                            <button disabled={savingProfile} onClick={saveTherapistProfile} className={`px-4 py-2 rounded-lg bg-primary-600 text-white ${savingProfile ? 'opacity-60' : ''}`}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {showReferral && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-2xl p-6 w-full max-w-md`}>
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Referral Program</h3>
                        <div className="mt-4 space-y-3">
                            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Share your code and earn rewards.</p>
                            <div className="flex items-center gap-2">
                                <input readOnly value={referralInfo?.referralCode || ''} className={`mt-1 w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border border-gray-600 text-gray-100' : 'bg-white border border-gray-300'}`} />
                                <button className="px-3 py-2 rounded-lg border" onClick={() => { navigator.clipboard?.writeText(referralInfo?.referralCode || ''); toast.success('Copied'); }}>Copy</button>
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Referrals: {referralInfo?.totalReferrals ?? 0} • Estimated Reward per referral: ₹{referralInfo?.rewardAmount ?? 50}</div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setShowReferral(false)} className={`px-4 py-2 rounded-lg ${isDark ? 'border border-gray-600 text-gray-200' : 'border border-gray-300 text-gray-700'}`}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {showBankModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-2xl p-6 w-full max-w-md`}>
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Bank Account</h3>
                        <div className="mt-4 space-y-3">
                            <div>
                                <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Account Number</label>
                                <input value={bankForm.accountNumber} onChange={(e) => setBankForm(p => ({ ...p, accountNumber: e.target.value }))} className={`mt-1 w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border border-gray-600 text-gray-100' : 'bg-white border border-gray-300'}`} />
                            </div>
                            <div>
                                <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>IFSC Code</label>
                                <input value={bankForm.ifscCode} onChange={(e) => setBankForm(p => ({ ...p, ifscCode: e.target.value }))} className={`mt-1 w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border border-gray-600 text-gray-100' : 'bg-white border border-gray-300'}`} />
                            </div>
                            <div>
                                <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>UPI ID (optional)</label>
                                <input value={bankForm.upiId} onChange={(e) => setBankForm(p => ({ ...p, upiId: e.target.value }))} className={`mt-1 w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border border-gray-600 text-gray-100' : 'bg-white border border-gray-300'}`} />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setShowBankModal(false)} className={`px-4 py-2 rounded-lg ${isDark ? 'border border-gray-600 text-gray-200' : 'border border-gray-300 text-gray-700'}`}>Cancel</button>
                            <button onClick={saveBankDetails} className={`px-4 py-2 rounded-lg bg-primary-600 text-white`}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {showWithdraw && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-2xl p-6 w-full max-w-md`}>
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Withdraw Funds</h3>
                        <div className="mt-4 space-y-3">
                            <div>
                                <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Amount (₹)</label>
                                <input type="number" min="100" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className={`mt-1 w-full px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700 border border-gray-600 text-gray-100' : 'bg-white border border-gray-300'}`} />
                            </div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Bank/UPI: {bankForm.accountNumber || bankForm.upiId ? `${bankForm.accountNumber ? bankForm.accountNumber : bankForm.upiId} ${bankForm.ifscCode ? '(' + bankForm.ifscCode + ')' : ''}` : 'Not set'}</p>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setShowWithdraw(false)} className={`px-4 py-2 rounded-lg ${isDark ? 'border border-gray-600 text-gray-200' : 'border border-gray-300 text-gray-700'}`}>Cancel</button>
                            <button onClick={withdrawFunds} className={`px-4 py-2 rounded-lg bg-primary-600 text-white`}>Withdraw</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// Helper Components
const SidebarItem = ({ icon, label, active, onClick, badge, isDark }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-between w-full p-3 rounded-xl transition-colors ${active
                ? 'bg-primary-50 text-primary-700'
                : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${active ? 'bg-primary-100' : isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                {icon}
            </div>
            <span className="font-medium">{label}</span>
        </div>
        {badge && (
            <span className="bg-primary-500 text-white text-xs font-medium px-2 py-1 rounded-full min-w-6 text-center">
                {badge}
            </span>
        )}
    </button>
);

const ActionButton = ({ icon, label, onClick, color, trend, badge }) => {
    const colorClasses = {
        primary: 'bg-primary-50 text-primary-600 hover:bg-primary-100',
        blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
        emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
        purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
    };

    return (
        <button
            onClick={onClick}
            className={`${colorClasses[color]} rounded-xl p-4 transition-colors relative`}
        >
            <div className="flex flex-col items-center gap-2">
                {icon}
                <span className="text-sm font-medium">{label}</span>
                {trend && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                        {trend}
                    </span>
                )}
            </div>
            {badge && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-5 h-5 flex items-center justify-center">
                    {badge}
                </span>
            )}
        </button>
    );
};

const MenuItem = ({ icon, title, description, onClick, color, badge, isDark }) => {
    const colorClasses = {
        purple: 'bg-purple-50 text-purple-600',
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        gray: 'bg-gray-50 text-gray-600'
    };

    return (
        <button
            onClick={onClick}
            className={`w-full rounded-xl p-4 transition-colors ${isDark ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
                        {icon}
                    </div>
                    <div className="text-left">
                        <p className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{title}</p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {badge && (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge === 'verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : badge === 'pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}>
                            {badge}
                        </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
            </div>
        </button>
    );
};

const NavButton = ({ icon, label, active, onClick, badge }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1 relative ${active ? 'text-primary-600' : 'text-gray-600'
            }`}
    >
        {badge && (
            <span className="absolute top-1.5 right-1/3 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-5 h-5 flex items-center justify-center">
                {badge}
            </span>
        )}
        {icon}
        <span className="text-xs font-medium">{label}</span>
        {active && (
            <div className="absolute top-0 w-12 h-1 bg-primary-600 rounded-b-full"></div>
        )}
    </button>
);

export default TherapistDashboard;
