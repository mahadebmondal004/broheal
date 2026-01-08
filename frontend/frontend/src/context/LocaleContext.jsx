import { createContext, useContext, useState, useEffect } from 'react';
import {
    detectCountryAndLocale,
    getSuggestedLanguage,
    saveLocalePreferences,
    getSavedLocalePreferences,
    formatCurrency,
    currencyData
} from '../utils/locale';

const LocaleContext = createContext(null);

export const useLocale = () => {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error('useLocale must be used within LocaleProvider');
    }
    return context;
};

export const LocaleProvider = ({ children }) => {
    const [locale, setLocale] = useState({
        country: 'IN',
        currency: 'INR',
        language: 'en',
        timezone: 'Asia/Kolkata',
        detected: false
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initializeLocale();
    }, []);

    const initializeLocale = async () => {
        try {
            // Check if user has saved preferences
            const saved = getSavedLocalePreferences();

            if (saved) {
                setLocale({
                    ...saved,
                    currency: 'INR',
                    detected: true
                });
                setLoading(false);
                return;
            }

            // Auto-detect
            const detected = await detectCountryAndLocale();
            const suggestedLanguage = getSuggestedLanguage(detected.country);

            const newLocale = {
                country: detected.country,
                currency: 'INR',
                language: detected.languages || suggestedLanguage,
                timezone: detected.timezone,
                detected: true
            };

            setLocale(newLocale);
            saveLocalePreferences(newLocale);
        } catch (error) {
            console.error('Failed to detect locale:', error);
            // Fallback to India
            setLocale({
                country: 'IN',
                currency: 'INR',
                language: 'en',
                timezone: 'Asia/Kolkata',
                detected: false
            });
        } finally {
            setLoading(false);
        }
    };

    const updateLocale = (updates) => {
        const newLocale = { ...locale, ...updates };
        setLocale(newLocale);
        saveLocalePreferences(newLocale);
    };

    const changeCurrency = () => {
        updateLocale({ currency: 'INR' });
    };

    const changeLanguage = (language) => {
        updateLocale({ language });
    };

    const formatPrice = (amount, currency = locale.currency) => {
        return formatCurrency(amount, currency);
    };

    const getCurrencySymbol = (currency = locale.currency) => {
        return currencyData[currency]?.symbol || '₹';
    };

    const value = {
        locale,
        loading,
        updateLocale,
        changeCurrency,
        changeLanguage,
        formatPrice,
        getCurrencySymbol
    };

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};
