import { useState } from 'react';
import { Send, Users, Briefcase, User } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const NotificationManagement = () => {
    const [form, setForm] = useState({
        title: '',
        message: '',
        target: 'all_users', // all_users, all_therapists, specific_user
        userId: ''
    });
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.message) {
            toast.error('Title and message are required');
            return;
        }
        if (form.target === 'specific_user' && !form.userId) {
            toast.error('User ID is required for specific user');
            return;
        }

        try {
            setSending(true);
            const res = await api.post('/admin/notifications/send', form);
            toast.success(res.data.message || 'Notifications sent!');
            setForm({ title: '', message: '', target: 'all_users', userId: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send notifications');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-sm p-6 max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Send Notification
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Audience</label>
                        <div className="space-y-3">
                            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.target === 'all_users'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    : 'border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}>
                                <input
                                    type="radio"
                                    name="target"
                                    value="all_users"
                                    checked={form.target === 'all_users'}
                                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                                    className="hidden"
                                />
                                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                    <Users className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                </div>
                                <span className="font-medium">All Users</span>
                            </label>

                            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.target === 'all_therapists'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    : 'border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}>
                                <input
                                    type="radio"
                                    name="target"
                                    value="all_therapists"
                                    checked={form.target === 'all_therapists'}
                                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                                    className="hidden"
                                />
                                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                    <Briefcase className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                </div>
                                <span className="font-medium">All Therapists</span>
                            </label>

                            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.target === 'specific_user'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    : 'border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}>
                                <input
                                    type="radio"
                                    name="target"
                                    value="specific_user"
                                    checked={form.target === 'specific_user'}
                                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                                    className="hidden"
                                />
                                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                    <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                </div>
                                <span className="font-medium">Specific User ID</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {form.target === 'specific_user' && (
                            <div className="animate-fade-in">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">User ID</label>
                                <input
                                    type="text"
                                    value={form.userId}
                                    onChange={(e) => setForm({ ...form, userId: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-shadow"
                                    placeholder="Enter user Mongo ID"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-shadow"
                                placeholder="Notification Title"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                    <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-shadow min-h-[120px] resize-none"
                        placeholder="Write your message here..."
                        required
                    />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/10">
                    <button
                        type="submit"
                        disabled={sending}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 active:bg-blue-800 transition-all shadow-lg hover:shadow-blue-500/25 ${sending ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {sending ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Send Notification
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NotificationManagement;
