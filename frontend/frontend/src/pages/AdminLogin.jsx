import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import { Mail, KeyRound } from 'lucide-react';
import logoUrl from '../assets/broheal.png';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, isAdmin } = useAuth();

    const [step, setStep] = useState('credentials'); // 'credentials' or 'otp'
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const cooldownTimer = useRef(null);

    useEffect(() => {
        if (isAuthenticated && isAdmin) {
            navigate('/dashboard');
        } else if (isAuthenticated && !isAdmin) {
            toast.error('Admin access required');
            navigate('/dashboard');
        }
    }, [isAuthenticated, isAdmin, navigate]);

    useEffect(() => {
        return () => {
            if (cooldownTimer.current) {
                clearInterval(cooldownTimer.current);
                cooldownTimer.current = null;
            }
        };
    }, []);

    const startCooldown = (sec) => {
        if (cooldownTimer.current) {
            clearInterval(cooldownTimer.current);
            cooldownTimer.current = null;
        }
        setCooldown(sec);
        cooldownTimer.current = setInterval(() => {
            setCooldown((s) => {
                if (s <= 1) {
                    clearInterval(cooldownTimer.current);
                    cooldownTimer.current = null;
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/admin/send-otp', { email });
            const devOtp = response?.data?.otp;
            startCooldown(60);
            setStep('otp');
            if (devOtp) {
                console.log('Dev OTP:', devOtp);
                toast.success('OTP sent to email');
            } else {
                toast.success(response.data.message || 'OTP sent to email');
            }
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || 'Failed to send OTP';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            const payload = { otp, email };
            const response = await api.post('/auth/admin/verify-otp', payload);
            const userResp = response.data;

            const { user, accessToken, refreshToken } = userResp;
            sessionStorage.setItem('sessionRole', 'admin');
            login(user, accessToken, refreshToken);

            toast.success('Admin login successful!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-2xl mb-4">
                        <img src={logoUrl} alt="Bro Heal" className="w-60 h-20 object-contain" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Admin Portal</h1>
                    <p className="text-blue-200">Secure administrative access</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">

                    {step === 'credentials' ? (
                        <form onSubmit={handleSendOTP}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-blue-100 mb-2">
                                    Email ID
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter Email ID"
                                        className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                disabled={loading || !email}
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-blue-100 mb-2">
                                    Enter Verification Code
                                </label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-2xl tracking-widest placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                                <p className="text-sm text-blue-200 mt-2">
                                    OTP sent to {email}
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-3"
                                disabled={loading || otp.length !== 6}
                            >
                                {loading ? 'Verifying...' : 'Verify & Login'}
                            </button>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleSendOTP({ preventDefault: () => { } })}
                                    disabled={loading || cooldown > 0}
                                    className="flex-1 py-3 px-4 bg-white/5 text-blue-100 font-medium rounded-lg border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('credentials');
                                        setOtp('');
                                    }}
                                    className="flex-1 py-3 px-4 bg-white/5 text-blue-100 font-medium rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                                >
                                    Change Email
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Regular Login Link */}
                <div className="text-center mt-6">
                    <p className="text-blue-200 text-sm">
                        Not an admin?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-blue-400 hover:text-blue-300 font-medium underline"
                        >
                            Go to regular login
                        </button>
                    </p>
                </div>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-200 text-xs text-center">
                        🔒 This is a secure admin portal. All activities are logged and monitored.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
