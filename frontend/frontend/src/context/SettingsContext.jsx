import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SettingsContext = createContext(null);

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        // App Settings
        appName: 'Bro Heal',
        logo: 'https://i.ibb.co/23Sm0NDC/broheal.png',
        favicon: '/favicon.ico',
        tagline: 'Professional Service Booking Platform',

        // Theme Colors
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        successColor: '#10b981',
        warningColor: '#f59e0b',
        errorColor: '#ef4444',

        // Social Media
        facebook: 'https://www.facebook.com/broheal',
        instagram: 'https://www.instagram.com/broheal',
        twitter: 'https://twitter.com/broheal',
        linkedin: 'https://www.linkedin.com/company/broheal',
        youtube: 'https://www.youtube.com/@broheal',

        // SEO
        seoTitle: 'Bro Heal - Professional Service Booking Platform',
        seoDescription: 'Book certified therapists for home services. Pay only after service completion.',
        seoKeywords: 'home service, therapist booking, massage, physiotherapy, wellness',

        // Analytics
        googleAnalyticsId: '',
        googleTagManagerId: '',
        facebookPixelId: '',
        hotjarId: '',

        // Hero Banners
        heroBanners: [
            'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
            'https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800',
            'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800'
        ],

        // Contact
        email: 'support@broheal.com',
        phone: '+91-XXXXXXXXXX',
        address: 'India',

        // Features
        commission: 10,
        currency: 'INR',
        timezone: 'Asia/Kolkata',

        loaded: false
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await api.get('/public/settings');
            const settingsData = response.data.settings || [];

            // Convert array of settings to object
            const settingsObj = settingsData.reduce((acc, setting) => {
                acc[setting.key] = setting.value;
                return acc;
            }, {});

            setSettings(prev => ({
                ...prev,
                ...settingsObj,
                loaded: true
            }));
        } catch (error) {
            console.error('Failed to load settings:', error);
            setSettings(prev => ({ ...prev, loaded: true }));
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings) => {
        try {
            await api.put('/admin/settings', { settings: newSettings });
            setSettings(prev => ({ ...prev, ...newSettings }));
            return true;
        } catch (error) {
            console.error('Failed to update settings:', error);
            return false;
        }
    };

    const value = {
        settings,
        loading,
        updateSettings,
        reloadSettings: loadSettings
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
