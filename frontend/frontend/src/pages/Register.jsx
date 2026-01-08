import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { Phone, KeyRound, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('user');
    const [loading, setLoading] = useState(false);

    const logoUrl = "https://i.ibb.co/23Sm0NDC/broheal.png";

    const isValidPhone = (p) => /^[6-9][0-9]{9}$/.test(p) && !/^([0-9])\1{9}$/.test(p);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Please enter your name');
            return;
        }
        if (!isValidPhone(phone)) {
            toast.error('Please enter a valid 10-digit Indian mobile number');
            return;
        }
        if (!password || password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/register', { name: name.trim(), phone, password, role });
            const data = res?.data || {};
            if (role === 'user' && data?.success && data?.accessToken && data?.refreshToken && data?.user) {
                login(data.user, data.accessToken, data.refreshToken);
                toast.success('Registration successful. Logged in as user.');
                navigate('/dashboard');
            } else {
                toast.success('Registration successful. Please login.');
                navigate(role === 'therapist' ? '/login?role=therapist' : '/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mobile-panel">
            <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-blue-50 to-white">
                <div className="text-center mb-8">
                    <img src={logoUrl} alt="Bro Heal" className="h-16 w-auto mx-auto mb-3" />
                    <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
                    <p className="text-gray-600 mt-2">Register to get started</p>
                </div>

                <div className="card w-full max-w-md">
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

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

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
                                    placeholder="Create a password"
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your password"
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full" disabled={loading || !isValidPhone(phone)}>
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </form>
                </div>

                <p className="text-sm text-gray-500 mt-6 text-center max-w-md">
                    Already have an account? <button className="text-primary-600 hover:underline" onClick={() => navigate('/login')}>Login</button>
                </p>
            </div>
        </div>
    );
};

export default Register;
