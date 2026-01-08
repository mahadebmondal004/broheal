import { useEffect, useState } from 'react';
import { GoogleMap, Marker, Polyline, useLoadScript } from '@react-google-maps/api';
import { MapPin, Navigation } from 'lucide-react';
import api from '../../services/api';

const GPSTracker = ({ bookingId, userLocation, therapistId }) => {
    const [therapistLocation, setTherapistLocation] = useState(null);
    const [route, setRoute] = useState([]);
    const [eta, setEta] = useState(null);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    useEffect(() => {
        if (!bookingId || !therapistId) return;

        // Poll therapist location every 5 seconds
        const interval = setInterval(async () => {
            try {
                const response = await api.get(`/user/bookings/${bookingId}/therapist-location`);
                if (response.data.location) {
                    const { latitude, longitude, timestamp } = response.data.location;
                    const newLocation = { lat: latitude, lng: longitude };

                    setTherapistLocation(newLocation);
                    setRoute(prev => [...prev, newLocation].slice(-20)); // Keep last 20 points

                    // Calculate ETA (simple distance-based estimation)
                    if (userLocation) {
                        const distance = calculateDistance(newLocation, userLocation);
                        const estimatedTime = Math.ceil(distance / 0.5); // Assuming 30km/h average speed
                        setEta(estimatedTime);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch therapist location:', error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [bookingId, therapistId, userLocation]);

    const calculateDistance = (point1, point2) => {
        const R = 6371; // Earth's radius in km
        const dLat = toRad(point2.lat - point1.lat);
        const dLon = toRad(point2.lng - point1.lng);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const toRad = (value) => (value * Math.PI) / 180;

    if (!isLoaded) {
        return (
            <div className="card">
                <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
            </div>
        );
    }

    const center = therapistLocation || userLocation || { lat: 12.9716, lng: 77.5946 };

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-primary-600" />
                    Live Tracking
                </h3>
                {eta && (
                    <span className="text-sm text-gray-600">
                        ETA: {eta} min
                    </span>
                )}
            </div>

            <div className="h-64 rounded-lg overflow-hidden">
                <GoogleMap
                    zoom={14}
                    center={center}
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    options={{
                        zoomControl: true,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false
                    }}
                >
                    {/* User Location */}
                    {userLocation && (
                        <Marker
                            position={userLocation}
                            icon={{
                                path: window.google?.maps?.SymbolPath?.CIRCLE,
                                fillColor: '#3b82f6',
                                fillOpacity: 1,
                                strokeColor: '#ffffff',
                                strokeWeight: 2,
                                scale: 8
                            }}
                            title="Your Location"
                        />
                    )}

                    {/* Therapist Location */}
                    {therapistLocation && (
                        <Marker
                            position={therapistLocation}
                            icon={{
                                path: window.google?.maps?.SymbolPath?.FORWARD_CLOSED_ARROW,
                                fillColor: '#10b981',
                                fillOpacity: 1,
                                strokeColor: '#ffffff',
                                strokeWeight: 2,
                                scale: 6,
                                rotation: 0
                            }}
                            title="Therapist Location"
                        />
                    )}

                    {/* Route */}
                    {route.length > 1 && (
                        <Polyline
                            path={route}
                            options={{
                                strokeColor: '#8b5cf6',
                                strokeOpacity: 0.8,
                                strokeWeight: 4
                            }}
                        />
                    )}
                </GoogleMap>
            </div>

            <div className="mt-3 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                    <span>You</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span>Therapist</span>
                </div>
            </div>
        </div>
    );
};

export default GPSTracker;
