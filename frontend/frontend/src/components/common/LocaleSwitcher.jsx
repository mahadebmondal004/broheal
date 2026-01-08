import { useState } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, DollarSign, Languages } from 'lucide-react';
import { currencyData } from '../../utils/locale';

const LocaleSwitcher = ({ isDark = false }) => {
    const { locale, changeCurrency, changeLanguage } = useLocale();
    const { language, changeLanguage: setLanguage } = useLanguage();
    const [showMenu, setShowMenu] = useState(false);

    const currencies = ['INR'];
    const languages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
        { code: 'bn', name: 'বাংলা', flag: '🇮🇳' }
    ];

    const handleCurrencyChange = (currency) => {
        changeCurrency(currency);
        setShowMenu(false);
    };

    const handleLanguageChange = (lang) => {
        changeLanguage(lang);
        setLanguage(lang);
        setShowMenu(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                title="Change language and currency"
            >
                <Globe className={`w-5 h-5 ${isDark ? 'text-gray-200' : ''}`} />
                <span className={`text-sm font-medium hidden md:inline ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {currencyData[locale.currency]?.symbol} • {language.toUpperCase()}
                </span>
            </button>

            {showMenu && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowMenu(false)}
                    />

                    {/* Menu */}
                    <div className={`absolute right-0 mt-2 w-72 rounded-lg shadow-xl z-50 overflow-hidden ${isDark ? 'bg-gray-800 border border-gray-700 text-gray-100' : 'bg-white border'}`}>
                        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : ''}`}>
                            <div className="flex items-center gap-2 mb-3">
                                <DollarSign className={`w-5 h-5 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
                                <h3 className="font-semibold">Currency</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => handleCurrencyChange('INR')}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-primary-600 text-white`}
                                >
                                    {currencyData['INR'].symbol} INR
                                </button>
                            </div>
                        </div>

                        {/* Language Section */}
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Languages className={`w-5 h-5 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
                                <h3 className="font-semibold">Language</h3>
                            </div>
                            <div className="space-y-2">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleLanguageChange(lang.code)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${language === lang.code
                                                ? 'bg-primary-600 text-white'
                                                : isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        <span className="text-2xl">{lang.flag}</span>
                                        <span className="font-medium">{lang.name}</span>
                                        {language === lang.code && (
                                            <span className="ml-auto">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Current Location Info */}
                        <div className={`px-4 py-3 text-xs ${isDark ? 'bg-gray-800 border-t border-gray-700 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                            <p>Detected: {locale.country} • {locale.timezone}</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LocaleSwitcher;
