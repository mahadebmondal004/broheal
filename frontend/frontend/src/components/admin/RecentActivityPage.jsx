import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, Filter, Search, ArrowLeft, MoreHorizontal, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import api from '../../services/api';

const RecentActivityPage = ({ onBack }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        try {
            setLoading(true);
            // Reusing the dashboard stats endpoint for now, ideally this should be a paginated /activity-logs endpoint
            const response = await api.get('/admin/dashboard/stats');
            // Assuming response.data.recentActivity exists. 
            // In a real scenario, you might want to fetch MORE logs here.
            setActivities(response.data.recentActivity || []);
        } catch (error) {
            console.error('Failed to load activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type) => {
        if (type.includes('completed')) return <CheckCircle className="w-5 h-5 text-green-600" />;
        if (type.includes('cancelled')) return <XCircle className="w-5 h-5 text-red-600" />;
        if (type.includes('pending')) return <Clock className="w-5 h-5 text-orange-600" />;
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
    };

    const getColorClass = (type) => {
        if (type.includes('completed')) return 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800';
        if (type.includes('cancelled')) return 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
        if (type.includes('pending')) return 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800';
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
    };

    const filteredActivities = activities.filter(activity => {
        const matchesFilter = filter === 'all' || activity.type.includes(filter);
        const matchesSearch = activity.message.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 p-6 card-3d flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors btn-3d-inset">
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Track all system events and user actions</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 input-3d"
                        />
                    </div>
                    <button onClick={loadActivities} className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-blue-400 transition-colors btn-3d press-effect">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors btn-3d press-effect">
                            <Filter className="w-4 h-4" />
                            <span>Filter</span>
                        </button>
                        {/* Dropdown for filter could go here */}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 card-3d overflow-hidden">
                {loading && activities.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading activity logs...</p>
                    </div>
                ) : filteredActivities.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {filteredActivities.map((activity, index) => (
                            <div key={index} className="p-4 md:p-6 hover:bg-blue-50/50 dark:hover:bg-white/5 transition-colors group">
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 w-12 h-12 rounded-xl flex items-center justify-center border ${getColorClass(activity.type)} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                        {getIcon(activity.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{activity.message}</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    Action performed by system
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-400 whitespace-nowrap bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                                                <Clock className="w-3 h-3" />
                                                <span>{new Date(activity.time).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-3">
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${activity.type.includes('completed') ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' :
                                                    activity.type.includes('cancelled') ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' :
                                                        'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                                                }`}>
                                                {activity.type.replace(/_/g, ' ').toUpperCase()}
                                            </span>
                                            {/* You could add more metadata tags here if available */}
                                        </div>
                                    </div>
                                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No activities found</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mt-2">
                            Try adjusting your filters or search query to find what you're looking for.
                        </p>
                        <button onClick={() => { setSearch(''); setFilter('all'); }} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors btn-3d press-effect">
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentActivityPage;
