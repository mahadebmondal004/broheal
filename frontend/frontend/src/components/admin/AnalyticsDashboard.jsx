import { Line, Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const AnalyticsDashboard = ({ data }) => {
    // Revenue Chart Data
    const revenueData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Revenue',
                data: data?.monthlyRevenue || [12000, 19000, 15000, 25000, 22000, 30000],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }
        ]
    };

    // Bookings Chart Data
    const bookingsData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Bookings',
                data: data?.weeklyBookings || [45, 52, 38, 65, 58, 85, 92],
                backgroundColor: '#8b5cf6'
            }
        ]
    };

    // Service Distribution Data
    const serviceData = {
        labels: ['Massage', 'Physiotherapy', 'Yoga', 'Spa', 'Other'],
        datasets: [
            {
                data: data?.serviceDistribution || [30, 25, 20, 15, 10],
                backgroundColor: [
                    '#3b82f6',
                    '#8b5cf6',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444'
                ],
                borderColor: 'transparent'
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#9ca3af' // gray-400
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(156, 163, 175, 0.1)' // gray-400 with opacity
                },
                ticks: {
                    color: '#9ca3af' // gray-400
                }
            },
            y: {
                grid: {
                    color: 'rgba(156, 163, 175, 0.1)' // gray-400 with opacity
                },
                ticks: {
                    color: '#9ca3af' // gray-400
                }
            }
        }
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#9ca3af' // gray-400
                }
            }
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{data?.totalRevenue?.toLocaleString() || '2,45,000'}</p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                +12.5% from last month
                            </p>
                        </div>
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                            <DollarSign className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{data?.totalBookings || '4,567'}</p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                +8.2% from last month
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{data?.activeUsers || '1,234'}</p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                +15.3% from last month
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Booking Value</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{data?.avgBookingValue || '536'}</p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                +5.1% from last month
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                            <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Revenue Trend (Last 6 Months)</h3>
                    <div style={{ height: '300px' }}>
                        <Line data={revenueData} options={chartOptions} />
                    </div>
                </div>

                {/* Weekly Bookings */}
                <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Weekly Bookings</h3>
                    <div style={{ height: '300px' }}>
                        <Bar data={bookingsData} options={chartOptions} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Service Distribution */}
                <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Service Distribution</h3>
                    <div className="max-w-md mx-auto" style={{ height: '300px' }}>
                        <Pie data={serviceData} options={pieOptions} />
                    </div>
                </div>

                {/* Top Performers */}
                <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Top Performing Therapists</h3>
                    <div className="space-y-3">
                        {(data?.topTherapists || [
                            { name: 'Dr. Sharma', bookings: 145, revenue: 72500 },
                            { name: 'Dr. Patel', bookings: 132, revenue: 66000 },
                            { name: 'Dr. Kumar', bookings: 128, revenue: 64000 }
                        ]).map((therapist, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-xl hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{therapist.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{therapist.bookings} bookings</p>
                                    </div>
                                </div>
                                <p className="font-bold text-green-600 dark:text-green-400">₹{therapist.revenue.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
