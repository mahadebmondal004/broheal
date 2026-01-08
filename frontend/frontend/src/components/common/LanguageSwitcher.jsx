import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { languages } from '../../i18n/config';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
    const { language, changeLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <Globe className="w-5 h-5" />
                <span className="text-lg">{languages[language].flag}</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20 overflow-hidden">
                        {Object.entries(languages).map(([code, { name, flag }]) => (
                            <button
                                key={code}
                                onClick={() => {
                                    changeLanguage(code);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${language === code ? 'bg-primary-50' : ''
                                    }`}
                            >
                                <span className="text-xl">{flag}</span>
                                <span className="font-medium">{name}</span>
                                {language === code && (
                                    <span className="ml-auto text-primary-600">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default LanguageSwitcher;
