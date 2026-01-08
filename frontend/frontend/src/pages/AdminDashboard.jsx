import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ChatWindow from '../components/common/ChatWindow';
import api from '../services/api';
import {
    LayoutDashboard, Users, Briefcase, DollarSign, Settings,
    LogOut, Menu, X, CheckCircle, UserCog, FileText,
    Calendar, TrendingUp, AlertCircle, BarChart3,
    Shield, CreditCard, MapPin, Package, Download, Plus,
    MessageSquare, Bell, Moon, Sun
} from 'lucide-react';

// Import Management Components
import UserManagement from '../components/admin/UserManagement';
import TherapistManagement from '../components/admin/TherapistManagement';
import AdminManagement from '../components/admin/AdminManagement';
import KYCManagement from '../components/admin/KYCManagement';
import ServiceManagement from '../components/admin/ServiceManagement';
import AddonServiceManagement from '../components/admin/AddonServiceManagement';
import PayoutManagement from '../components/admin/PayoutManagement';
import ZoneManagement from '../components/admin/ZoneManagement';
import LandingPageManager from '../components/admin/LandingPageManager';
import DynamicSettings from '../components/admin/DynamicSettings';
import SlotManagement from '../components/admin/SlotManagement';
import CategoryManagement from '../components/admin/CategoryManagement';
import TransactionManagement from '../components/admin/TransactionManagement';
import NotificationManagement from '../components/admin/NotificationManagement';
import AdminProfile from '../components/admin/AdminProfile';
import RecentActivityPage from '../components/admin/RecentActivityPage';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(false);
    const [adminBookings, setAdminBookings] = useState([]);
    const [openChatBookingId, setOpenChatBookingId] = useState(null);
    const [chatInfo, setChatInfo] = useState({});
    const [adminPermissions, setAdminPermissions] = useState(null);

    const logoUrl = "https://i.ibb.co/23Sm0NDC/broheal.png";
    const displayName = (user?.name && user.name.trim()) || user?.email || (user?.phone ? `+91 ${user.phone}` : 'Admin');

    useEffect(() => {
        const initialTab = searchParams.get('tab');
        if (initialTab) {
            setActiveTab(initialTab);
        }
        loadDashboardStats();
        loadAdminBookings();
        if (user?.role === 'admin' && user?._id) {
            loadAdminPermissions(user._id);
        }
    }, [searchParams]);

    const loadDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/dashboard/stats');
            setStats(response.data.stats);
            setRecentActivity(response.data.recentActivity || []);
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAdminPermissions = async (id) => {
        try {
            const res = await api.get(`/admin/manage/users/${id}`);
            const perms = res.data?.user?.adminRole?.permissions || null;
            setAdminPermissions(perms);
        } catch (error) {
            setAdminPermissions(null);
        }
    };

    const loadAdminBookings = async () => {
        try {
            const response = await api.get('/admin/bookings');
            setAdminBookings(response.data.bookings || []);
        } catch (error) {
        }
    };

    const exportData = async (type) => {
        try {
            const response = await api.get(`/admin/export?type=${type}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_export_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed: ' + (error.response?.data?.message || error.message));
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, change, subtitle }) => (
        <div className="relative group overflow-hidden rounded-2xl border border-white/20 bg-white/60 dark:bg-slate-800/50 p-6 backdrop-blur-xl card-3d transition-3d hover:scale-105">
            <div className={`absolute right-0 top-0 w-32 h-32 bg-gradient-to-br ${color.replace('text-', 'from-')}/20 to-transparent blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />

            <div className="relative flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
                    {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}

                    {typeof change !== 'undefined' && (
                        <div className={`mt-3 inline-flex items-center text-xs font-semibold rounded-full px-2.5 py-1 backdrop-blur-md ${change > 0
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                            }`}>
                            {change > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1 transform rotate-180" />}
                            <span>{Math.abs(change)}%</span>
                        </div>
                    )}
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${color.replace('text-', 'from-')}/10 to-transparent border border-white/10 btn-3d group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-8 h-8 ${color}`} />
                </div>
            </div>

            {typeof change !== 'undefined' && (
                <div className="mt-4 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${change > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(Math.abs(change) * 10, 100)}%` }}
                    />
                </div>
            )}
        </div>
    );

    const SidebarButton = ({ tab, icon: Icon, label, badge, onClick }) => (
        <button
            onClick={onClick || (() => { setActiveTab(tab); setSidebarOpen(false); })}
            className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 group relative overflow-hidden press-effect ${activeTab === tab
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white btn-3d border border-white/10'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-white btn-3d-inset'
                }`}
        >
            {activeTab === tab && (
                <div className="absolute inset-0 bg-white/20 blur-sm mix-blend-overlay" />
            )}

            <Icon className={`w-5 h-5 relative z-10 transition-transform duration-300 ${activeTab === tab ? 'scale-110' : 'group-hover:scale-110'
                }`} />

            <span className="font-medium relative z-10 text-sm tracking-wide">{label}</span>

            {badge && (
                <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full relative z-10 badge-3d animate-pulse">
                    {badge}
                </span>
            )}
        </button>
    );

    return (
        <div className={`flex h-screen overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#020617] text-white' : 'bg-gray-50 text-gray-900'}`}>

            {/* Background Ambience (Dark Mode) */}
            {isDarkMode && (
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/15 blur-[100px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/15 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 sidebar-3d transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
                }`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center btn-3d">
                                <img src={logoUrl} alt="Bro Heal" className="h-8 w-auto invert brightness-0" />
                            </div>
                            <div>
                                <span className="font-bold text-xl tracking-tight">Bro Heal</span>
                                <p className="text-[10px] font-medium opacity-60 uppercase tracking-widest">Admin Panel</p>
                            </div>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3 mt-2">Main</div>
                        <SidebarButton tab="dashboard" icon={LayoutDashboard} label="Dashboard" />

                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3 mt-4">Management</div>
                        {(adminPermissions?.users?.view ?? true) && <SidebarButton tab="user-management" icon={Users} label="Users" />}
                        {(adminPermissions?.therapists?.view ?? true) && <SidebarButton tab="therapist-management" icon={Briefcase} label="Therapists" />}
                        {(adminPermissions?.admins?.view ?? true) && <SidebarButton tab="admin-management" icon={Shield} label="Admins" />}
                        {(adminPermissions?.admins?.edit ?? true) && <SidebarButton tab="role-management" icon={UserCog} label="Roles" />}

                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3 mt-4">Operations</div>
                        {((adminPermissions?.therapists?.approveKyc ?? false) || (adminPermissions?.therapists?.view ?? true)) && (
                            <SidebarButton tab="kyc-management" icon={CheckCircle} label="KYC Approvals" badge={stats?.pendingKyc || 0} />
                        )}
                        {(adminPermissions?.services?.view ?? true) && <SidebarButton tab="service-management" icon={Package} label="Services" />}
                        {(adminPermissions?.services?.view ?? true) && <SidebarButton tab="category-management" icon={Package} label="Categories" />}
                        {(adminPermissions?.therapists?.view ?? true) && <SidebarButton tab="slot-management" icon={Calendar} label="Slots" />}
                        {(adminPermissions?.bookings?.view ?? true) && <SidebarButton tab="bookings" icon={Calendar} label="Bookings" />}
                        {(adminPermissions?.bookings?.view ?? true) && <SidebarButton tab="messages" icon={MessageSquare} label="Messages" />}
                        {(adminPermissions?.services?.view ?? true) && <SidebarButton tab="addon-services" icon={Plus} label="Addons" />}
                        {(adminPermissions?.analytics?.view ?? true) && <SidebarButton tab="transactions" icon={DollarSign} label="Transactions" />}
                        {(adminPermissions?.analytics?.view ?? true) && <SidebarButton tab="payout-management" icon={CreditCard} label="Payouts" />}
                        {(adminPermissions?.settings?.view ?? true) && <SidebarButton tab="zone-management" icon={MapPin} label="Zones" />}

                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3 mt-4">System</div>
                        {(adminPermissions?.settings?.view ?? true) && <SidebarButton tab="landing-page" icon={FileText} label="Landing Page" />}
                        {(adminPermissions?.settings?.view ?? true) && <SidebarButton tab="settings" icon={Settings} label="Settings" />}
                        <SidebarButton tab="notification-management" icon={Bell} label="Notifications" />

                        {(adminPermissions?.analytics?.view ?? true) && <SidebarButton tab="reports" icon={BarChart3} label="Analytics" />}
                        {(adminPermissions?.analytics?.view ?? true) && <SidebarButton tab="exports" icon={Download} label="Exports" />}
                    </nav>

                    <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-slate-900/30">
                        <button
                            onClick={() => { logout(); window.location.href = '/admin'; }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-200 group btn-3d-inset press-effect"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative z-10 box-border">
                {/* Header */}
                <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between transition-all">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors btn-3d press-effect"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                                {activeTab === 'dashboard' ? 'Overview' :
                                    activeTab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-all text-gray-600 dark:text-gray-300 btn-3d press-effect"
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <div className="h-8 w-px bg-gray-200 dark:bg-white/10 mx-2" />

                        <div
                            className="flex items-center gap-3 cursor-pointer p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all border border-transparent hover:border-gray-200 dark:hover:border-white/10 pr-4 btn-3d-inset press-effect"
                            onClick={() => setActiveTab('profile')}
                        >
                            {user?.profileImage ? (
                                <img src={user.profileImage} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-white/20 shadow-sm" />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                                    {displayName?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-semibold leading-none">{displayName}</p>
                                <p className="text-xs opacity-60 mt-1">Administrator</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Body */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
                    {loading && activeTab === 'dashboard' && (
                        <div className="flex justify-center items-center py-20">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-white/10 opacity-30"></div>
                                <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'dashboard' && !loading && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 shadow-2xl shadow-blue-500/20">
                                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 rounded-full bg-black/10 blur-3xl"></div>
                                <div className="relative z-10">
                                    <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {displayName}! 👋</h2>
                                    <p className="text-blue-100 max-w-xl">Here's what's happening with your platform today. You have <span className="font-bold text-white">{stats?.pendingKyc || 0} pending KYC</span> requests and <span className="font-bold text-white">{stats?.pendingPayouts || 0} payout requests</span>.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} color="text-blue-500" />
                                <StatCard title="Total Therapists" value={stats?.totalTherapists || 0} icon={Briefcase} color="text-purple-500" />
                                <StatCard title="Total Bookings" value={stats?.totalBookings || 0} icon={Calendar} color="text-indigo-500" change={12} />
                                <StatCard title="Total Revenue" value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`} icon={DollarSign} color="text-green-500" change={8.5} />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 p-6 shadow-xl">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold">Recent Activity</h3>
                                        <button onClick={() => setActiveTab('activity-logs')} className="text-sm text-blue-500 hover:text-blue-400 font-medium">View All</button>
                                    </div>
                                    <div className="space-y-4">
                                        {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                                            <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:bg-blue-50 dark:hover:bg-white/10 transition-colors">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type.includes('completed') ? 'bg-green-100 text-green-600' :
                                                    activity.type.includes('cancelled') ? 'bg-red-100 text-red-600' :
                                                        'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{activity.message}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(activity.time).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-10 text-gray-500">No recent activity</div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-gradient-to-br from-orange-400 to-rose-500 rounded-3xl p-6 text-white shadow-lg shadow-orange-500/20">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold">Pending Actions</h3>
                                            <AlertCircle className="w-6 h-6 opacity-80" />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center bg-white/20 rounded-xl p-3 backdrop-blur-md">
                                                <span>KYC Requests</span>
                                                <span className="font-bold text-xl">{stats?.pendingKyc || 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white/20 rounded-xl p-3 backdrop-blur-md">
                                                <span>Payouts</span>
                                                <span className="font-bold text-xl">{stats?.pendingPayouts || 0}</span>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 p-6 shadow-xl">
                                        <h3 className="font-bold mb-4 text-gray-900 dark:text-white">System Status</h3>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-sm font-medium text-green-500">All Systems Operational</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Server Load: 12%</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Database: Connected</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="animate-fade-in">
                        {activeTab === 'user-management' && <UserManagement />}
                        {activeTab === 'therapist-management' && <TherapistManagement />}
                        {activeTab === 'admin-management' && <AdminManagement mode="admins" />}
                        {activeTab === 'role-management' && <AdminManagement mode="roles" />}
                        {activeTab === 'kyc-management' && <KYCManagement />}
                        {activeTab === 'service-management' && <ServiceManagement />}
                        {activeTab === 'slot-management' && <SlotManagement />}
                        {activeTab === 'category-management' && <CategoryManagement />}
                        {activeTab === 'activity-logs' && <RecentActivityPage onBack={() => setActiveTab('dashboard')} />}
                        {activeTab === 'booking-management' && <div className="p-4 text-center">Bookings Management Component Coming Soon</div>}
                        {activeTab === 'bookings' && (
                            <div className="p-5 bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 shadow-xl">
                                <h2 className="text-2xl font-bold mb-4">Bookings</h2>
                                <div className="text-center py-10 opacity-60">
                                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>Please use a dedicated Booking Management component here.</p>
                                </div>
                            </div>
                        )}
                        {activeTab === 'addon-services' && <AddonServiceManagement />}
                        {activeTab === 'transactions' && <TransactionManagement />}
                        {activeTab === 'payout-management' && <PayoutManagement />}
                        {activeTab === 'zone-management' && <ZoneManagement />}
                        {activeTab === 'landing-page' && <LandingPageManager />}
                        {activeTab === 'settings' && <DynamicSettings />}
                        {activeTab === 'notification-management' && <NotificationManagement />}
                        {activeTab === 'profile' && <AdminProfile />}

                        {activeTab === 'reports' && (
                            <div className="text-center py-20 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-white/10">
                                <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-gray-500">Advanced Analytics Coming Soon</h3>
                            </div>
                        )}
                        {activeTab === 'exports' && (
                            <div className="p-8 bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10">
                                <h2 className="text-2xl font-bold mb-6">Data Exports</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <button onClick={() => exportData('users')} className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-500/20 hover:border-blue-500 transition-colors group">
                                        <Download className="w-8 h-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                                        <h3 className="font-bold text-blue-700 dark:text-blue-300">Export Users</h3>
                                        <p className="text-sm text-blue-600/60 dark:text-blue-400/60 mt-2">Download all user data as CSV</p>
                                    </button>
                                    <button onClick={() => exportData('bookings')} className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-500/20 hover:border-purple-500 transition-colors group">
                                        <Download className="w-8 h-8 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
                                        <h3 className="font-bold text-purple-700 dark:text-purple-300">Export Bookings</h3>
                                        <p className="text-sm text-purple-600/60 dark:text-purple-400/60 mt-2">Download booking history as CSV</p>
                                    </button>
                                    <button onClick={() => exportData('revenue')} className="p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-500/20 hover:border-green-500 transition-colors group">
                                        <Download className="w-8 h-8 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
                                        <h3 className="font-bold text-green-700 dark:text-green-300">Export Revenue</h3>
                                        <p className="text-sm text-green-600/60 dark:text-green-400/60 mt-2">Download financial reports as CSV</p>
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'messages' && (
                            <div className="h-[600px] bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 overflow-hidden flex">
                                <div className="w-80 border-r border-gray-200 dark:border-white/10 p-4 bg-white/50 dark:bg-white/5">
                                    <h3 className="font-bold mb-4">Active Chats</h3>
                                    <div className="space-y-2">
                                        {adminBookings.filter(b => b.status === "in_progress" || b.status === "pending").length > 0 ? (
                                            adminBookings.filter(b => b.status === "in_progress" || b.status === "pending").map(booking => (
                                                <div key={booking._id} onClick={() => { setOpenChatBookingId(booking._id); setChatInfo({ user: booking.userId?.name, therapist: booking.therapistId?.name }); }} className={`p-3 rounded-xl cursor-pointer hover:bg-white/50 dark:hover:bg-white/10 transition-colors ${openChatBookingId === booking._id ? 'bg-white shadow-sm dark:bg-white/20' : ''}`}>
                                                    <p className="text-sm font-bold truncate">{booking.serviceId?.title}</p>
                                                    <p className="text-xs opacity-70 truncate">{booking.userId?.name} • {booking.therapistId?.name}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm opacity-50 text-center py-4">No active chats</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 p-0 bg-white/30 dark:bg-black/20">
                                    {openChatBookingId ? (
                                        <div className="h-full flex flex-col">
                                            <div className="p-4 border-b border-gray-200 dark:border-white/10">
                                                <h3 className="font-bold">{chatInfo.user} with {chatInfo.therapist}</h3>
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <ChatWindow
                                                    bookingId={openChatBookingId}
                                                    currentUserId={user._id}
                                                    currentUserRole="admin"
                                                    recipientName={`${chatInfo.user} - ${chatInfo.therapist}`}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center opacity-40 font-bold">Select a chat to view</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
                />
            )}
        </div>
    );
};

export default AdminDashboard;
