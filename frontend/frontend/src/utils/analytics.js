import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics 4
export const initGA = (measurementId) => {
    if (!measurementId) return;

    // Load GA4 script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
        window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', measurementId, {
        page_path: window.location.pathname,
    });
};

// Google Tag Manager
export const initGTM = (gtmId) => {
    if (!gtmId) return;

    // GTM script
    const script = document.createElement('script');
    script.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId}');
  `;
    document.head.appendChild(script);

    // GTM noscript
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.insertBefore(noscript, document.body.firstChild);
};

// Facebook Pixel
export const initFacebookPixel = (pixelId) => {
    if (!pixelId) return;

    const script = document.createElement('script');
    script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
    document.head.appendChild(script);

    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;
    document.body.appendChild(noscript);
};

// Hotjar
export const initHotjar = (hjid, hjsv = 6) => {
    if (!hjid) return;

    const script = document.createElement('script');
    script.innerHTML = `
    (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:${hjid},hjsv:${hjsv}};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
  `;
    document.head.appendChild(script);
};

// Track page view
export const trackPageView = (path) => {
    if (window.gtag) {
        window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
            page_path: path,
        });
    }
    if (window.fbq) {
        window.fbq('track', 'PageView');
    }
};

// Track custom event
export const trackEvent = (eventName, eventParams = {}) => {
    if (window.gtag) {
        window.gtag('event', eventName, eventParams);
    }
    if (window.fbq) {
        window.fbq('trackCustom', eventName, eventParams);
    }
};

// Track conversion
export const trackConversion = (value, currency = 'INR') => {
    if (window.gtag) {
        window.gtag('event', 'conversion', {
            value: value,
            currency: currency,
        });
    }
    if (window.fbq) {
        window.fbq('track', 'Purchase', { value: value, currency: currency });
    }
};

// Custom hook for page tracking
export const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        trackPageView(location.pathname + location.search);
    }, [location]);
};

export default {
    initGA,
    initGTM,
    initFacebookPixel,
    initHotjar,
    trackPageView,
    trackEvent,
    trackConversion,
    usePageTracking,
};
