import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { LocaleProvider } from './context/LocaleContext.jsx';
import { initGA, initGTM, initFacebookPixel, initHotjar } from './utils/analytics';
import { initWebVitals } from './utils/performance';
import './index.css';

// Initialize Analytics (will be overridden by dynamic settings)
initGA(import.meta.env.VITE_GA_MEASUREMENT_ID);
initGTM(import.meta.env.VITE_GTM_ID);
initFacebookPixel(import.meta.env.VITE_FACEBOOK_PIXEL_ID);
initHotjar(import.meta.env.VITE_HOTJAR_ID);

// Initialize Performance Monitoring
initWebVitals();

// Register service worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => console.log('SW registered:', registration))
            .catch(error => console.log('SW registration failed:', error));
    });
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HelmetProvider>
            <LocaleProvider>
                <SettingsProvider>
                    <LanguageProvider>
                        <App />
                    </LanguageProvider>
                </SettingsProvider>
            </LocaleProvider>
        </HelmetProvider>
    </React.StrictMode>,
);
