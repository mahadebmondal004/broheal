import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Save, Upload, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const DynamicSettings = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        appName: '', logo: '', tagline: '',
        primaryColor: '', secondaryColor: '',
        facebook: '', instagram: '', twitter: '', linkedin: '', youtube: '',
        seoTitle: '', seoDescription: '', seoKeywords: '',
        googleAnalyticsId: '', googleTagManagerId: '', facebookPixelId: '', hotjarId: '',
        heroBanners: [],
        email: '', phone: '', address: '',
        emailHost: '', emailPort: '', emailUser: '', emailPassword: '', emailFrom: '', emailSecure: 'true',
        paytmMerchantId: '', paytmMerchantKey: '', paytmWebsite: '', paytmChannelId: '', paytmIndustryType: '', paytmCallbackUrl: '', paytmTestMode: 'true',
        razorpay_key_id: '', razorpay_key_secret: '', razorpay_enabled: 'true', razorpay_callback_url: '',
        whatsappApiUrl: '', whatsappPhoneNumberId: '', whatsappAccessToken: '', whatsappBusinessAccountId: '',
        googleMapsApiKey: '', googleMapsRestrictions: '',
        firebaseApiKey: '', firebaseAuthDomain: '', firebaseProjectId: '', firebaseStorageBucket: '', firebaseMessagingSenderId: '', firebaseAppId: '', firebaseMeasurementId: '', firebaseServiceAccountKey: '',
        commission_percentage: '',
        fast2sms_api_key: '', fast2sms_sender_id: '', fast2sms_route: 'p', fast2sms_enabled: 'false'
    });

    const [activeTab, setActiveTab] = useState('app');
    const [loading, setLoading] = useState(false);
    const [newBanner, setNewBanner] = useState('');
    const [showPasswords, setShowPasswords] = useState({});

    useEffect(() => { loadSettings(); }, []);

    const loadSettings = async () => {
        try {
            const response = await api.get('/admin/settings');
            const settingsData = response.data.settings || [];
            const settingsObj = settingsData.reduce((acc, setting) => {
                if (setting.key === 'heroBanners') {
                    acc[setting.key] = JSON.parse(setting.value || '[]');
                } else {
                    acc[setting.key] = setting.value;
                }
                return acc;
            }, {});
            setSettings(prev => ({ ...prev, ...settingsObj }));
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const numericKeys = ['commission_percentage'];
            const settingsArray = Object.entries(settings).map(([key, value]) => {
                const publicSettings = [
                    'appName', 'logo', 'tagline', 'primaryColor', 'secondaryColor',
                    'facebook', 'instagram', 'twitter', 'linkedin', 'youtube',
                    'seoTitle', 'seoDescription', 'seoKeywords', 'heroBanners',
                    'email', 'phone', 'address', 'googleMapsApiKey',
                    'firebaseApiKey', 'firebaseAuthDomain', 'firebaseProjectId', 'firebaseStorageBucket', 'firebaseMessagingSenderId', 'firebaseAppId', 'firebaseMeasurementId',
                    'firebase_phone_otp_enabled', 'firebase_phone_otp_user', 'firebase_phone_otp_therapist', 'firebase_phone_otp_admin'
                ];
                const isNumeric = numericKeys.includes(key);
                const coercedValue = isNumeric ? Number(value) : value;
                const valueType = isNumeric ? 'number' : (typeof value === 'object' ? 'array' : typeof value);
                return {
                    key,
                    value: typeof coercedValue === 'object' ? JSON.stringify(coercedValue) : coercedValue,
                    type: valueType,
                    isPublic: publicSettings.includes(key)
                };
            });
            await api.put('/admin/settings', { settings: settingsArray });
            toast.success('Settings saved successfully!');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const handleBannerAdd = () => {
        if (newBanner.trim()) {
            setSettings(prev => ({ ...prev, heroBanners: [...prev.heroBanners, newBanner] }));
            setNewBanner('');
        }
    };

    const handleBannerRemove = (index) => {
        setSettings(prev => ({ ...prev, heroBanners: prev.heroBanners.filter((_, i) => i !== index) }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const tabs = [
        { id: 'app', label: 'App' },
        { id: 'theme', label: 'Theme' },
        { id: 'social', label: 'Social' },
        { id: 'seo', label: 'SEO' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'banners', label: 'Banners' },
        { id: 'contact', label: 'Contact' },
        { id: 'email', label: 'Email SMTP' },
        { id: 'payment', label: 'Payment Gateway' },
        { id: 'commission', label: 'Commission' },
        { id: 'whatsapp', label: 'WhatsApp API' },
        { id: 'sms', label: 'Fast2SMS' },
        { id: 'maps', label: 'Google Maps' },
        { id: 'firebase', label: 'Firebase' }
    ];

    const inputClass = "w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";

    return (
        <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-sm animate-fade-in p-6 pb-24 text-gray-900 dark:text-white">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Platform Settings</h2>
                <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-medium disabled:opacity-50">
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 border-b border-gray-200 dark:border-white/10 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'app' && (
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>App Name</label>
                        <input type="text" value={settings.appName} onChange={(e) => setSettings({ ...settings, appName: e.target.value })} className={inputClass} placeholder="Bro Heal" />
                    </div>
                    <div>
                        <label className={labelClass}>Logo URL</label>
                        <div className="flex gap-2">
                            <input type="url" value={settings.logo} onChange={(e) => setSettings({ ...settings, logo: e.target.value })} className={inputClass} placeholder="https://example.com/logo.png" />
                            {settings.logo && <img src={settings.logo} alt="Logo" className="h-12 w-auto border border-gray-300 dark:border-white/10 rounded" />}
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Tagline</label>
                        <input type="text" value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} className={inputClass} placeholder="Professional Service Booking Platform" />
                    </div>
                </div>
            )}

            {activeTab === 'theme' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Primary Color</label>
                        <div className="flex gap-2">
                            <input type="color" value={settings.primaryColor} onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })} className="w-12 h-10 border border-gray-300 dark:border-white/10 rounded cursor-pointer bg-transparent" />
                            <input type="text" value={settings.primaryColor} onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })} className={inputClass} placeholder="#3b82f6" />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Secondary Color</label>
                        <div className="flex gap-2">
                            <input type="color" value={settings.secondaryColor} onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })} className="w-12 h-10 border border-gray-300 dark:border-white/10 rounded cursor-pointer bg-transparent" />
                            <input type="text" value={settings.secondaryColor} onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })} className={inputClass} placeholder="#8b5cf6" />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'social' && (
                <div className="space-y-4">
                    {['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'].map((platform) => (
                        <div key={platform}>
                            <label className={`${labelClass} capitalize`}>{platform}</label>
                            <input type="url" value={settings[platform]} onChange={(e) => setSettings({ ...settings, [platform]: e.target.value })} className={inputClass} placeholder={`https://${platform}.com/yourpage`} />
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'seo' && (
                <div className="space-y-4">
                    <div><label className={labelClass}>SEO Title</label><input type="text" value={settings.seoTitle} onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })} className={inputClass} /></div>
                    <div><label className={labelClass}>SEO Description</label><textarea value={settings.seoDescription} onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })} className={inputClass} rows={3} /></div>
                    <div><label className={labelClass}>SEO Keywords</label><input type="text" value={settings.seoKeywords} onChange={(e) => setSettings({ ...settings, seoKeywords: e.target.value })} className={inputClass} /></div>
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="space-y-4">
                    <div><label className={labelClass}>Google Analytics ID</label><input type="text" value={settings.googleAnalyticsId} onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })} className={inputClass} /></div>
                    <div><label className={labelClass}>Google Tag Manager ID</label><input type="text" value={settings.googleTagManagerId} onChange={(e) => setSettings({ ...settings, googleTagManagerId: e.target.value })} className={inputClass} /></div>
                    <div><label className={labelClass}>Facebook Pixel ID</label><input type="text" value={settings.facebookPixelId} onChange={(e) => setSettings({ ...settings, facebookPixelId: e.target.value })} className={inputClass} /></div>
                    <div><label className={labelClass}>Hotjar ID</label><input type="text" value={settings.hotjarId} onChange={(e) => setSettings({ ...settings, hotjarId: e.target.value })} className={inputClass} /></div>
                </div>
            )}

            {activeTab === 'banners' && (
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Hero Banners</label>
                        <div className="flex gap-2 mb-3">
                            <input type="url" value={newBanner} onChange={(e) => setNewBanner(e.target.value)} className={inputClass} placeholder="https://example.com/banner.jpg" />
                            <button onClick={handleBannerAdd} className="bg-blue-600 text-white rounded-xl px-4 hover:bg-blue-700 transition-colors flex items-center gap-2"><Plus className="w-5 h-5" />Add</button>
                        </div>
                        <div className="space-y-2">
                            {settings.heroBanners?.map((banner, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                                    <img src={banner} alt={`Banner ${index + 1}`} className="w-20 h-12 object-cover rounded" />
                                    <span className="flex-1 text-sm truncate text-gray-700 dark:text-gray-300">{banner}</span>
                                    <button onClick={() => handleBannerRemove(index)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'contact' && (
                <div className="space-y-4">
                    <div><label className={labelClass}>Email</label><input type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className={inputClass} /></div>
                    <div><label className={labelClass}>Phone</label><input type="tel" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className={inputClass} /></div>
                    <div><label className={labelClass}>Address</label><textarea value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className={inputClass} rows={3} /></div>
                </div>
            )}

            {activeTab === 'email' && (
                <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4 text-sm text-blue-800 dark:text-blue-300"><strong>SMTP Config</strong> for notifications</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelClass}>SMTP Host</label><input type="text" value={settings.emailHost} onChange={(e) => setSettings({ ...settings, emailHost: e.target.value })} className={inputClass} /></div>
                        <div><label className={labelClass}>SMTP Port</label><input type="number" value={settings.emailPort} onChange={(e) => setSettings({ ...settings, emailPort: e.target.value })} className={inputClass} /></div>
                    </div>
                    <div><label className={labelClass}>SMTP Username</label><input type="text" value={settings.emailUser} onChange={(e) => setSettings({ ...settings, emailUser: e.target.value })} className={inputClass} /></div>
                    <div><label className={labelClass}>SMTP Password</label>
                        <div className="relative"><input type={showPasswords.emailPassword ? 'text' : 'password'} value={settings.emailPassword} onChange={(e) => setSettings({ ...settings, emailPassword: e.target.value })} className={inputClass} /><button type="button" onClick={() => togglePasswordVisibility('emailPassword')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"><Eye className="w-5 h-5" /></button></div>
                    </div>
                    <div><label className={labelClass}>From Email</label><input type="email" value={settings.emailFrom} onChange={(e) => setSettings({ ...settings, emailFrom: e.target.value })} className={inputClass} /></div>
                    <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><input type="checkbox" checked={settings.emailSecure === 'true'} onChange={(e) => setSettings({ ...settings, emailSecure: e.target.checked ? 'true' : 'false' })} /> Use Secure Connection (TLS)</label>
                </div>
            )}

            {activeTab === 'payment' && (
                <div className="space-y-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4 text-sm text-yellow-800 dark:text-yellow-300"><strong>Paytm Gateway</strong> Config</div>
                    <div><label className={labelClass}>Merchant ID</label><input type="text" value={settings.paytmMerchantId} onChange={(e) => setSettings({ ...settings, paytmMerchantId: e.target.value })} className={inputClass} /></div>
                    <div><label className={labelClass}>Merchant Key</label><div className="relative"><input type={showPasswords.paytmMerchantKey ? 'text' : 'password'} value={settings.paytmMerchantKey} onChange={(e) => setSettings({ ...settings, paytmMerchantKey: e.target.value })} className={inputClass} /><button type="button" onClick={() => togglePasswordVisibility('paytmMerchantKey')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"><Eye className="w-5 h-5" /></button></div></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelClass}>Website</label><input type="text" value={settings.paytmWebsite} onChange={(e) => setSettings({ ...settings, paytmWebsite: e.target.value })} className={inputClass} /></div>
                        <div><label className={labelClass}>Channel ID</label><input type="text" value={settings.paytmChannelId} onChange={(e) => setSettings({ ...settings, paytmChannelId: e.target.value })} className={inputClass} /></div>
                    </div>
                    <div><label className={labelClass}>Industry Type</label><input type="text" value={settings.paytmIndustryType} onChange={(e) => setSettings({ ...settings, paytmIndustryType: e.target.value })} className={inputClass} /></div>
                    <div><label className={labelClass}>Callback URL</label><input type="url" value={settings.paytmCallbackUrl} onChange={(e) => setSettings({ ...settings, paytmCallbackUrl: e.target.value })} className={inputClass} /></div>
                    <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><input type="checkbox" checked={settings.paytmTestMode === 'true'} onChange={(e) => setSettings({ ...settings, paytmTestMode: e.target.checked ? 'true' : 'false' })} /> Test Mode</label>
                    <hr className="border-gray-200 dark:border-white/10" />
                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4 text-sm text-green-800 dark:text-green-300"><strong>Razorpay</strong> Config</div>
                    <div><label className={labelClass}>Key ID</label><input type="text" value={settings.razorpay_key_id} onChange={(e) => setSettings({ ...settings, razorpay_key_id: e.target.value })} className={inputClass} /></div>
                    <div><label className={labelClass}>Key Secret</label><div className="relative"><input type={showPasswords.razorpay_key_secret ? 'text' : 'password'} value={settings.razorpay_key_secret} onChange={(e) => setSettings({ ...settings, razorpay_key_secret: e.target.value })} className={inputClass} /><button type="button" onClick={() => togglePasswordVisibility('razorpay_key_secret')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"><Eye className="w-5 h-5" /></button></div></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><input type="checkbox" checked={settings.razorpay_enabled === 'true'} onChange={(e) => setSettings({ ...settings, razorpay_enabled: e.target.checked ? 'true' : 'false' })} /> Enable Razorpay</label>
                        <div><label className={labelClass}>Callback URL</label><input type="url" value={settings.razorpay_callback_url} onChange={(e) => setSettings({ ...settings, razorpay_callback_url: e.target.value })} className={inputClass} /></div>
                    </div>
                </div>
            )}
            {activeTab === 'commission' && (
                <div className="space-y-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mb-4 text-sm text-indigo-800 dark:text-indigo-300"><strong>Commission</strong> - Default platform commission</div>
                    <div><label className={labelClass}>Default Commission (%)</label><input type="number" min="0" max="100" value={settings.commission_percentage} onChange={(e) => setSettings({ ...settings, commission_percentage: e.target.value })} className={inputClass} /></div>
                </div>
            )}
            {activeTab === 'whatsapp' && (
                <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4 text-sm text-green-800 dark:text-green-300"><strong>WhatsApp Cloud API</strong></div>
                    <div><label className={labelClass}>API URL</label><input type="url" value={settings.whatsappApiUrl} onChange={(e) => setSettings({ ...settings, whatsappApiUrl: e.target.value })} className={inputClass} /></div>
                    <div><label className={labelClass}>Phone Number ID</label><input type="text" value={settings.whatsappPhoneNumberId} onChange={(e) => setSettings({ ...settings, whatsappPhoneNumberId: e.target.value })} className={inputClass} /></div>
                    <div><label className={labelClass}>Access Token</label><div className="relative"><input type={showPasswords.whatsappAccessToken ? 'text' : 'password'} value={settings.whatsappAccessToken} onChange={(e) => setSettings({ ...settings, whatsappAccessToken: e.target.value })} className={inputClass} /><button type="button" onClick={() => togglePasswordVisibility('whatsappAccessToken')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"><Eye className="w-5 h-5" /></button></div></div>
                    <div><label className={labelClass}>Business Account ID</label><input type="text" value={settings.whatsappBusinessAccountId} onChange={(e) => setSettings({ ...settings, whatsappBusinessAccountId: e.target.value })} className={inputClass} /></div>
                </div>
            )}
            {activeTab === 'sms' && (
                <div className="space-y-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4 text-sm text-yellow-800 dark:text-yellow-300"><strong>Fast2SMS</strong> Config</div>
                    <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><input type="checkbox" checked={settings.fast2sms_enabled === 'true'} onChange={(e) => setSettings({ ...settings, fast2sms_enabled: e.target.checked ? 'true' : 'false' })} /> Enable Fast2SMS</label>
                    <div><label className={labelClass}>API Key</label><div className="relative"><input type={showPasswords.fast2sms_api_key ? 'text' : 'password'} value={settings.fast2sms_api_key} onChange={(e) => setSettings({ ...settings, fast2sms_api_key: e.target.value })} className={inputClass} /><button type="button" onClick={() => togglePasswordVisibility('fast2sms_api_key')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"><Eye className="w-5 h-5" /></button></div></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelClass}>Sender ID</label><input type="text" value={settings.fast2sms_sender_id} onChange={(e) => setSettings({ ...settings, fast2sms_sender_id: e.target.value })} className={inputClass} /></div>
                        <div><label className={labelClass}>Route</label><select value={settings.fast2sms_route} onChange={(e) => setSettings({ ...settings, fast2sms_route: e.target.value })} className={inputClass}><option value="p">Promotional</option><option value="otp">OTP</option><option value="dlt">DLT</option></select></div>
                    </div>
                </div>
            )}
            {activeTab === 'maps' && (
                <div className="space-y-4">
                    <div><label className={labelClass}>API Key</label><div className="relative"><input type={showPasswords.googleMapsApiKey ? 'text' : 'password'} value={settings.googleMapsApiKey} onChange={(e) => setSettings({ ...settings, googleMapsApiKey: e.target.value })} className={inputClass} /><button type="button" onClick={() => togglePasswordVisibility('googleMapsApiKey')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"><Eye className="w-5 h-5" /></button></div></div>
                    <div><label className={labelClass}>Restrictions</label><textarea value={settings.googleMapsRestrictions} onChange={(e) => setSettings({ ...settings, googleMapsRestrictions: e.target.value })} className={inputClass} rows={3} /></div>
                </div>
            )}
            {activeTab === 'firebase' && (
                <div className="space-y-4">
                    <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4 text-sm text-orange-800 dark:text-orange-300"><strong>Firebase</strong> Config</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelClass}>API Key</label><input type="text" value={settings.firebaseApiKey} onChange={(e) => setSettings({ ...settings, firebaseApiKey: e.target.value })} className={inputClass} /></div>
                        <div><label className={labelClass}>Auth Domain</label><input type="text" value={settings.firebaseAuthDomain} onChange={(e) => setSettings({ ...settings, firebaseAuthDomain: e.target.value })} className={inputClass} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelClass}>Project ID</label><input type="text" value={settings.firebaseProjectId} onChange={(e) => setSettings({ ...settings, firebaseProjectId: e.target.value })} className={inputClass} /></div>
                        <div><label className={labelClass}>Storage Bucket</label><input type="text" value={settings.firebaseStorageBucket} onChange={(e) => setSettings({ ...settings, firebaseStorageBucket: e.target.value })} className={inputClass} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelClass}>Messaging Sender ID</label><input type="text" value={settings.firebaseMessagingSenderId} onChange={(e) => setSettings({ ...settings, firebaseMessagingSenderId: e.target.value })} className={inputClass} /></div>
                        <div><label className={labelClass}>App ID</label><input type="text" value={settings.firebaseAppId} onChange={(e) => setSettings({ ...settings, firebaseAppId: e.target.value })} className={inputClass} /></div>
                    </div>
                    <div><label className={labelClass}>Measurement ID</label><input type="text" value={settings.firebaseMeasurementId} onChange={(e) => setSettings({ ...settings, firebaseMeasurementId: e.target.value })} className={inputClass} /></div>
                    <div><label className={labelClass}>Service Account Key (JSON)</label><textarea value={settings.firebaseServiceAccountKey} onChange={(e) => setSettings({ ...settings, firebaseServiceAccountKey: e.target.value })} className={inputClass} rows={6} /></div>
                    <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><input type="checkbox" checked={settings.firebase_phone_otp_enabled === 'true'} onChange={(e) => setSettings({ ...settings, firebase_phone_otp_enabled: e.target.checked ? 'true' : 'false' })} /> Enable Firebase Phone OTP</label>
                </div>
            )}
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-gray-200 dark:border-white/10 p-4 flex justify-end gap-3 z-10">
                <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-medium disabled:opacity-50">
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving All Settings...' : 'Save All Changes'}
                </button>
            </div>
        </div>
    );
};

export default DynamicSettings;
