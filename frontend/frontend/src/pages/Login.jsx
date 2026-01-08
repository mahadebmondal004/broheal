import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import { Phone, KeyRound } from 'lucide-react';
import { initFirebase, getRecaptchaVerifier, sendPhoneOtp, resetRecaptcha } from '../services/firebaseClient';

const Login = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, isAuthenticated, user, logout } = useAuth();

    const [step, setStep] = useState('password');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(searchParams.get('role') || 'user');
    const [loading, setLoading] = useState(false);
    const [useFirebase, setUseFirebase] = useState(false);
    const [firebaseConfig, setFirebaseConfig] = useState(null);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [cooldown, setCooldown] = useState(0);
    const cooldownTimer = useRef(null);

    const logoUrl = "https://i.ibb.co/23Sm0NDC/broheal.png";

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const urlRole = searchParams.get('role');
        if (urlRole && urlRole !== role) {
            setRole(urlRole);
        }
    }, [searchParams]);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get('/public/settings');
                const settings = Object.fromEntries((res.data.settings || []).map(s => [s.key, s.value]));
                let enabled = settings.firebase_phone_otp_enabled !== 'false';
                let allowed = (role === 'user' && settings.firebase_phone_otp_user !== 'false') || (role === 'therapist' && settings.firebase_phone_otp_therapist !== 'false');

                const cfgSettings = {
                    apiKey: settings.firebaseApiKey,
                    authDomain: settings.firebaseAuthDomain,
                    projectId: settings.firebaseProjectId,
                    storageBucket: settings.firebaseStorageBucket,
                    messagingSenderId: settings.firebaseMessagingSenderId,
                    appId: settings.firebaseAppId,
                    measurementId: settings.firebaseMeasurementId
                };
                const cfgEnv = {
                    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
                    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
                    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
                    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
                    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
                    appId: import.meta.env.VITE_FIREBASE_APP_ID,
                    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
                };
                setUseFirebase(false);
                setFirebaseConfig(null);
            } catch {}
        })();
    }, [role]);

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

    // Removed auto-logout on role mismatch to prevent unintended session clearing across tabs

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
            const response = await api.post('/auth/login', { phone, password });
            const { user, accessToken, refreshToken } = response.data;
            login(user, accessToken, refreshToken);
            toast.success('Login successful!');
            navigate('/dashboard?tab=home');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };
    

    const handleSendOTP = async (e) => {
        e.preventDefault();

        if (!isValidPhone(phone)) {
            toast.error('Please enter a valid 10-digit Indian mobile number');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/send-otp', { phone });
            const devOtp = response?.data?.otp;
            startCooldown(60);
            setStep('otp');
            if (devOtp) {
                setOtp(String(devOtp));
                toast.success('OTP sent');
            } else {
                toast.success(response.data.message || 'OTP sent');
            }
        } catch (error) {
            const code = error?.code || '';
            const msg = error?.message || error.response?.data?.message || (code ? code : 'Failed to send OTP');
            const hint = code.includes('unauthorized-domain')
                ? 'Add this origin to Firebase Authorized domains'
                : code.includes('operation-not-allowed')
                ? 'Enable Phone sign-in in Firebase Authentication'
                : code.includes('billing-not-enabled')
                ? 'Enable Cloud Billing or switch reCAPTCHA to v2 in Firebase Auth'
                : '';
            toast.error(hint ? `${msg}: ${hint}` : msg);
            if (code.includes('too-many-requests')) {
                startCooldown(120);
            }
            resetRecaptcha();
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
            const response = await api.post('/auth/verify-otp', { phone, otp, name: name || 'User', role });
            const userResp = response.data;

            const { user, accessToken, refreshToken } = userResp;
            sessionStorage.setItem('sessionRole', role);
            login(user, accessToken, refreshToken);

            toast.success('Login successful!');
            if (role === 'admin') {
                navigate('/dashboard?tab=admin-management');
            } else if (role === 'therapist') {
                navigate('/dashboard?tab=home');
            } else {
                navigate('/dashboard?tab=home');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mobile-panel">
            <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-blue-50 to-white">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img src={logoUrl} alt="Bro Heal" className="h-16 w-auto mx-auto mb-3" />
                    <h1 className="text-3xl font-bold text-gray-900">Welcome to Bro Heal</h1>
                    <p className="text-gray-600 mt-2">Login to continue</p>
                </div>

                {/* Login Form */}
                <div className="card w-full max-w-md">
                    {/* Role Selector */}
                    <div className="flex gap-2 mb-6">
                        <button
                            type="button"
                            onClick={() => setRole('user')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${role === 'user'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            User
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('therapist')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${role === 'therapist'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Therapist
                        </button>
                    </div>

                    <form onSubmit={handlePasswordLogin}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <span className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-500 select-none">+91</span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="Enter 10-digit phone number"
                                    className={`input-field pl-20 ${phone && !isValidPhone(phone) ? 'ring-2 ring-rose-500 border-transparent' : ''}`}
                                    maxLength={10}
                                    required
                                />
                            </div>
                            {phone && !isValidPhone(phone) && (
                                <p className="text-sm text-rose-600 mt-1">Enter a valid Number</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full" disabled={loading || !isValidPhone(phone)}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>

                {/* Info */}
                <div className="text-center mt-6 max-w-md">
                    <p className="text-sm text-gray-500">
                        By continuing, you agree to Bro Heal's Terms of Service and Privacy Policy
                    </p>
                    <p className="text-sm text-gray-700 mt-3">
                        New here? <button className="text-primary-600 hover:underline" onClick={() => navigate('/register')}>Create an account</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
