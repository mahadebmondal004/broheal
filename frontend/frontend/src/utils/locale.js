// Country and locale detection utility
export const detectCountryAndLocale = async () => {
    try {
        // Try to get from geolocation API (free service)
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        return {
            country: data.country_code || 'IN',
            countryName: data.country_name || 'India',
            currency: data.currency || 'INR',
            languages: data.languages?.split(',')[0] || 'en',
            timezone: data.timezone || 'Asia/Kolkata'
        };
    } catch (error) {
        // Fallback to browser locale
        const browserLang = navigator.language || navigator.userLanguage;
        const locale = new Intl.Locale(browserLang);

        // Map common locales to countries and currencies
        const localeMap = {
            'en-US': { country: 'US', currency: 'USD', language: 'en' },
            'en-GB': { country: 'GB', currency: 'GBP', language: 'en' },
            'en-IN': { country: 'IN', currency: 'INR', language: 'en' },
            'hi-IN': { country: 'IN', currency: 'INR', language: 'hi' },
            'bn-IN': { country: 'IN', currency: 'INR', language: 'bn' },
            'en-AU': { country: 'AU', currency: 'AUD', language: 'en' },
            'en-CA': { country: 'CA', currency: 'CAD', language: 'en' },
            'ar-SA': { country: 'SA', currency: 'SAR', language: 'ar' },
            'zh-CN': { country: 'CN', currency: 'CNY', language: 'zh' }
        };

        const detected = localeMap[browserLang] || { country: 'IN', currency: 'INR', language: 'en' };

        return {
            country: detected.country,
            countryName: detected.country,
            currency: detected.currency,
            languages: detected.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }
};

// Currency data with symbols and conversion rates
export const currencyData = {
    INR: { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
    USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
    EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
    GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
    AUD: { symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
    CAD: { symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
    SGD: { symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
    AED: { symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
    SAR: { symbol: 'ر.س', name: 'Saudi Riyal', locale: 'ar-SA' },
    JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
    CNY: { symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' }
};

// Format currency based on locale
export const formatCurrency = (amount, currency = 'INR') => {
    const currencyInfo = currencyData[currency] || currencyData.INR;

    try {
        return new Intl.NumberFormat(currencyInfo.locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    } catch (error) {
        // Fallback
        return `${currencyInfo.symbol}${amount.toFixed(2)}`;
    }
};

// Get live conversion rates (cached for 1 hour)
let conversionRatesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 3600000; // 1 hour

export const getConversionRates = async (baseCurrency = 'INR') => {
    // Check cache
    if (conversionRatesCache && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
        return conversionRatesCache;
    }

    try {
        // Use free API for exchange rates
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
        const data = await response.json();

        conversionRatesCache = data.rates;
        cacheTimestamp = Date.now();

        return data.rates;
    } catch (error) {
        console.error('Failed to fetch conversion rates:', error);

        // Fallback static rates (approximate)
        return {
            INR: 1,
            USD: 0.012,
            EUR: 0.011,
            GBP: 0.0095,
            AUD: 0.018,
            CAD: 0.016,
            SGD: 0.016,
            AED: 0.044,
            SAR: 0.045,
            JPY: 1.85,
            CNY: 0.087
        };
    }
};

// Convert amount from one currency to another
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) {
        return amount;
    }

    const rates = await getConversionRates(fromCurrency);
    return amount * (rates[toCurrency] || 1);
};

// Language mapping by country
export const countryToLanguage = {
    IN: 'en', // India - English (can be hi or bn too)
    US: 'en',
    GB: 'en',
    AU: 'en',
    CA: 'en',
    SG: 'en',
    AE: 'ar',
    SA: 'ar',
    JP: 'ja',
    CN: 'zh',
    DE: 'de',
    FR: 'fr',
    ES: 'es',
    IT: 'it',
    BR: 'pt',
    MX: 'es'
};

// Get suggested language based on country
export const getSuggestedLanguage = (countryCode) => {
    return countryToLanguage[countryCode] || 'en';
};

// Save preferences to localStorage
export const saveLocalePreferences = (preferences) => {
    localStorage.setItem('broheal_locale_prefs', JSON.stringify(preferences));
};

// Get saved preferences
export const getSavedLocalePreferences = () => {
    try {
        const saved = localStorage.getItem('broheal_locale_prefs');
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        return null;
    }
};

export default {
    detectCountryAndLocale,
    formatCurrency,
    getConversionRates,
    convertCurrency,
    getSuggestedLanguage,
    saveLocalePreferences,
    getSavedLocalePreferences,
    currencyData
};
