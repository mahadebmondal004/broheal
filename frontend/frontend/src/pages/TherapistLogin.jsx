import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import { Phone, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';
import logoUrl from '../assets/broheal.png';

const TherapistLogin = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    // States
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const isValidPhone = (p) => /^[6-9][0-9]{9}$/.test(p) && !/^([0-9])\1{9}$/.test(p);

    const handlePasswordLogin = async (e) => {
        e.preventDefault();

        if (!isValidPhone(phone)) {
            toast.error('Please enter a valid 10-digit Indian mobile number');
            return;
        }
        if (!password || password.length < 4) {
            toast.error('Please enter your password');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/login', { phone, password, role: 'therapist' });
            const { user, accessToken, refreshToken } = response.data;

            if (user.role !== 'therapist') {
                toast.error('This portal is for Therapists only.');
                return;
            }

            login(user, accessToken, refreshToken);
            toast.success('Welcome back, Partner!');
            navigate('/dashboard?tab=home');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
            {/* 3D Glowing Background Effects - Emerald/Teal Theme for Therapist */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
            <div className="absolute top-[40%] left-[60%] w-[20%] h-[20%] bg-green-500/10 rounded-full blur-[80px]" />

            {/* Glassmorphism Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

            <div className="relative w-full max-w-md perspective-1000">
                {/* Main Card */}
                <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 overflow-hidden group hover:shadow-emerald-500/10 transition-all duration-500">

                    {/* Glossy Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 pointer-events-none" />

                    {/* Logo Section */}
                    <div className="text-center mb-8 relative z-10">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl shadow-lg flex items-center justify-center mb-4 transform group-hover:scale-105 transition-transform duration-300">
                            <img src={logoUrl} alt="Bro Heal" className="w-16 h-16 object-contain drop-shadow-md brightness-0 invert" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Therapist Login</h1>
                        <p className="text-emerald-200 text-sm font-medium">Partner Portal</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handlePasswordLogin} className="space-y-6 relative z-10">
                        {/* Phone Input */}
                        <div className="space-y-2 group/input">
                            <label className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${focusedField === 'phone' ? 'text-emerald-400' : 'text-slate-400'}`}>
                                Phone Number
                            </label>
                            <div className={`relative flex items-center bg-slate-800/50 border rounded-xl transition-all duration-300 ${focusedField === 'phone' || (phone && isValidPhone(phone))
                                    ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                                    : 'border-white/10 hover:border-white/20'
                                }`}>
                                <div className="pl-4 pr-3 py-3 border-r border-white/10">
                                    <span className="text-slate-400 font-medium">+91</span>
                                </div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    onFocus={() => setFocusedField('phone')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full bg-transparent text-white px-4 py-3 outline-none placeholder:text-slate-500 font-medium tracking-wide"
                                    placeholder="98765 43210"
                                    required
                                />
                                <div className="pr-4">
                                    <Phone className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'phone' ? 'text-emerald-400' : 'text-slate-500'}`} />
                                </div>
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2 group/input">
                            <label className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${focusedField === 'password' ? 'text-emerald-400' : 'text-slate-400'}`}>
                                Password
                            </label>
                            <div className={`relative flex items-center bg-slate-800/50 border rounded-xl transition-all duration-300 ${focusedField === 'password'
                                    ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                                    : 'border-white/10 hover:border-white/20'
                                }`}>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full bg-transparent text-white pl-4 pr-4 py-3 outline-none placeholder:text-slate-500 font-medium tracking-wide"
                                    placeholder="••••••••"
                                    required
                                />
                                <div className="pr-4">
                                    <KeyRound className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'password' ? 'text-emerald-400' : 'text-slate-500'}`} />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button type="button" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                                    Forgot Password?
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !isValidPhone(phone) || !password}
                            className="w-full relative group overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-teal-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                        >
                            <div className="absolute inset-0 bg-white/20 blur-md group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                            <span className="relative flex items-center justify-center gap-2">
                                {loading ? 'Logging In...' : 'Access Portal'}
                                {!loading && <ArrowRight className="w-5 h-5" />}
                            </span>
                        </button>
                    </form>

                    {/* Footer / Links */}
                    <div className="mt-8 pt-6 border-t border-white/10 text-center relative z-10">
                        <p className="text-slate-400 text-sm mb-4">
                            New Partner?{' '}
                            <button
                                onClick={() => navigate('/register/therapist')}
                                className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
                            >
                                Join Us
                            </button>
                        </p>

                        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 bg-slate-800/30 py-2 rounded-lg border border-white/5 mx-auto max-w-[80%]">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>Verified Professionals Only</span>
                        </div>

                        <div className="mt-4">
                            <button
                                onClick={() => navigate('/user/login')}
                                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                Are you a User/Patient? Login here
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TherapistLogin;
