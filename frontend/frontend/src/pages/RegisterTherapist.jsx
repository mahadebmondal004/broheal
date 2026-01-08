import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { Phone, KeyRound, User as UserIcon, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import logoUrl from '../assets/broheal.png';

const RegisterTherapist = () => {
  const navigate = useNavigate();

  // States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const isValidPhone = (p) => /^[6-9][0-9]{9}$/.test(p) && !/^([0-9])\1{9}$/.test(p);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Please enter your name');
    if (!isValidPhone(phone)) return toast.error('Enter a valid 10-digit mobile number');
    if (!password || password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await api.post('/auth/register/therapist', { name: name.trim(), phone, password });
      toast.success('Registration successful. Please login to continue.');
      navigate('/therapist/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
      {/* 3D Glowing Background Effects - Emerald/Gold for Therapist */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-600/20 rounded-full blur-[120px] animate-pulse delay-700" />

      {/* Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

      <div className="relative w-full max-w-md perspective-1000">
        <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 overflow-hidden group hover:shadow-emerald-500/10 transition-all duration-500">

          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 pointer-events-none" />

          {/* Logo & Header */}
          <div className="text-center mb-8 relative z-10">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform duration-500">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Therapist Partner</h1>
            <p className="text-emerald-200 text-sm font-medium">Join our network of professionals</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {/* Name Input */}
            <div className="space-y-1">
              <div className={`relative flex items-center bg-slate-800/50 border rounded-xl transition-all duration-300 ${focusedField === 'name' ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-white/10 hover:border-white/20'
                }`}>
                <UserIcon className="absolute left-4 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Full Name"
                  className="w-full bg-transparent text-white pl-12 pr-4 py-3 outline-none placeholder:text-slate-500 font-medium"
                  required
                />
              </div>
            </div>

            {/* Phone Input */}
            <div className="space-y-1">
              <div className={`relative flex items-center bg-slate-800/50 border rounded-xl transition-all duration-300 ${focusedField === 'phone' || (phone && isValidPhone(phone)) ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-white/10 hover:border-white/20'
                }`}>
                <div className="absolute left-4 flex items-center gap-2 pointer-events-none">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400 font-medium text-sm">+91</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Phone Number"
                  className="w-full bg-transparent text-white pl-16 pr-4 py-3 outline-none placeholder:text-slate-500 font-medium"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className={`relative flex items-center bg-slate-800/50 border rounded-xl transition-all duration-300 ${focusedField === 'password' ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-white/10 hover:border-white/20'
                }`}>
                <KeyRound className="absolute left-4 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Create Password"
                  className="w-full bg-transparent text-white pl-12 pr-4 py-3 outline-none placeholder:text-slate-500 font-medium"
                  required
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <div className={`relative flex items-center bg-slate-800/50 border rounded-xl transition-all duration-300 ${focusedField === 'confirm' ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-white/10 hover:border-white/20'
                }`}>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Confirm Password"
                  className="w-full bg-transparent text-white pl-4 pr-4 py-3 outline-none placeholder:text-slate-500 font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isValidPhone(phone)}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-teal-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] disabled:opacity-50 disabled:transform-none mt-4"
            >
              <div className="absolute inset-0 bg-white/20 blur-md group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? 'Registering...' : 'Join Now'}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center relative z-10">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/therapist/login')}
                className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
              >
                Login
              </button>
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-4">
              <ShieldCheck className="w-3 h-3" />
              <span>Professional Verification Required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterTherapist;
