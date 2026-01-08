import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Bell, ArrowLeft, Check, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const Notifications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setIsLoading(true);
        try {
            // Determine endpoint based on role
            const endpoint = user?.role === 'therapist'
                ? '/therapist/notifications'
                : '/user/notifications';

            const response = await api.get(endpoint);
            setNotifications(response.data.notifications || []);
        } catch (error) {
            console.error('Failed to load notifications:', error);
            // Don't toast on error to avoid annoyance if endpoint is missing temporarily
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            const endpoint = user?.role === 'therapist'
                ? `/therapist/notifications/${id}/read`
                : `/user/notifications/${id}/read`;

            await api.put(endpoint);
            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, seen: true } : n
            ));
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    const markAllAsRead = async () => {
        // Option to implement bulk read if API supports it, or loop
        const unseen = notifications.filter(n => !n.seen);
        if (unseen.length === 0) return;

        try {
            await Promise.all(unseen.map(n => {
                const endpoint = user?.role === 'therapist'
                    ? `/therapist/notifications/${n._id}/read`
                    : `/user/notifications/${n._id}/read`;
                return api.put(endpoint);
            }));

            setNotifications(prev => prev.map(n => ({ ...n, seen: true })));
            toast.success('All marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const isDark = true; // Consistently use dark theme or detect from context if available

    return (
        <div className={`min-h-screen ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Header */}
            <div className={`sticky top-0 z-10 px-4 py-4 ${isDark ? 'bg-slate-900/95 border-b border-slate-700' : 'bg-white/95 border-b border-gray-200'} backdrop-blur-sm`}>
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className={`p-2 rounded-full ${isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            Notifications
                        </h1>
                    </div>
                    {notifications.some(n => !n.seen) && (
                        <button
                            onClick={markAllAsRead}
                            className={`text-sm font-medium px-3 py-1.5 rounded-full ${isDark ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                }`}
                        >
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="max-w-2xl mx-auto p-4 space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`relative p-4 rounded-2xl border transition-all duration-200 ${notification.seen
                                    ? (isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-white border-gray-100')
                                    : (isDark ? 'bg-slate-800 border-indigo-500/30 shadow-lg shadow-indigo-500/5' : 'bg-white border-indigo-100 shadow-sm')
                                }`}
                        >
                            <div className="flex gap-4">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notification.seen
                                        ? (isDark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-400')
                                        : (isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600')
                                    }`}>
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className={`font-semibold ${notification.seen ? (isDark ? 'text-slate-300' : 'text-gray-700') : (isDark ? 'text-white' : 'text-gray-900')}`}>
                                            {notification.title}
                                        </h3>
                                        {!notification.seen && (
                                            <button
                                                onClick={(e) => markAsRead(notification._id, e)}
                                                className={`p-1 rounded-full ${isDark ? 'hover:bg-slate-700 text-indigo-400' : 'hover:bg-gray-100 text-indigo-600'}`}
                                                title="Mark as read"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                                        {notification.message}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(notification.createdAt)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16">
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`}>
                            <Bell className={`w-8 h-8 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
                        </div>
                        <h3 className={`text-lg font-medium ${isDark ? 'text-slate-300' : 'text-gray-900'}`}>No notifications</h3>
                        <p className={`mt-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>You're all caught up!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
