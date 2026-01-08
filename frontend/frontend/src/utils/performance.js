import { useEffect } from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Send metrics to analytics
const sendToAnalytics = (metric) => {
    if (import.meta.env.VITE_ENABLE_VITALS !== 'true') {
        return;
    }
    const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
        rating: metric.rating,
    });

    // Send to GA4
    if (window.gtag) {
        window.gtag('event', metric.name, {
            event_category: 'Web Vitals',
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            event_label: metric.id,
            non_interaction: true,
        });
    }

    // Send to custom endpoint (optional)
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
    const endpoint = `${API_BASE}/analytics/vitals`;
    if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, body);
    } else {
        fetch(endpoint, {
            body,
            method: 'POST',
            keepalive: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

// Initialize Web Vitals tracking
export const initWebVitals = () => {
    getCLS(sendToAnalytics);
    getFID(sendToAnalytics);
    getFCP(sendToAnalytics);
    getLCP(sendToAnalytics);
    getTTFB(sendToAnalytics);
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
    useEffect(() => {
        // Track page load time
        if (window.performance && window.performance.timing) {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            const connectTime = perfData.responseEnd - perfData.requestStart;
            const renderTime = perfData.domComplete - perfData.domLoading;

            if (window.gtag) {
                window.gtag('event', 'timing_complete', {
                    name: 'load',
                    value: pageLoadTime,
                    event_category: 'Performance',
                });
            }

            console.log('Performance Metrics:', {
                pageLoadTime,
                connectTime,
                renderTime,
            });
        }

        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) {
                        console.warn('Long task detected:', entry);
                        if (window.gtag) {
                            window.gtag('event', 'long_task', {
                                event_category: 'Performance',
                                value: Math.round(entry.duration),
                            });
                        }
                    }
                }
            });

            try {
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // longtask observer not supported
            }
        }
    }, []);
};

// Network information monitoring
export const useNetworkMonitoring = () => {
    useEffect(() => {
        if ('connection' in navigator) {
            const connection = navigator.connection;

            const logNetworkInfo = () => {
                console.log('Network Info:', {
                    effectiveType: connection.effectiveType,
                    downlink: connection.downlink,
                    rtt: connection.rtt,
                    saveData: connection.saveData,
                });

                if (window.gtag) {
                    window.gtag('event', 'network_info', {
                        event_category: 'Performance',
                        connection_type: connection.effectiveType,
                        downlink: connection.downlink,
                        rtt: connection.rtt,
                    });
                }
            };

            logNetworkInfo();
            connection.addEventListener('change', logNetworkInfo);

            return () => {
                connection.removeEventListener('change', logNetworkInfo);
            };
        }
    }, []);
};

export default {
    initWebVitals,
    usePerformanceMonitoring,
    useNetworkMonitoring,
};
