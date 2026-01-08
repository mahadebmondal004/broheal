import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePageTracking } from './utils/analytics';
import { usePerformanceMonitoring, useNetworkMonitoring } from './utils/performance';
import Login from './pages/Login';
import UserLogin from './pages/UserLogin';
import TherapistLogin from './pages/TherapistLogin';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import RegisterUser from './pages/RegisterUser';
import RegisterTherapist from './pages/RegisterTherapist';
import LandingPage from './pages/LandingPage';
import Services from './pages/Services';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import RefundPolicy from './pages/RefundPolicy';
import UserDashboard from './pages/UserDashboard';
import TherapistDashboard from './pages/TherapistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import KYCSubmission from './pages/KYCSubmission';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentMock from './pages/PaymentMock';
import PaymentFailure from './pages/PaymentFailure';
import BookingCreate from './pages/BookingCreate';
import Notifications from './pages/Notifications';
import ErrorBoundary from './components/common/ErrorBoundary';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/user/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// Dashboard Router
const DashboardRouter = () => {
    const { user } = useAuth();

    if (user?.role === 'admin') {
        return <AdminDashboard />;
    } else if (user?.role === 'therapist') {
        return <TherapistDashboard />;
    } else if (user?.role === 'user') {
        return <UserDashboard />;
    }

    return <Navigate to="/user/login" replace />;
};

// Analytics wrapper
const AnalyticsWrapper = ({ children }) => {
    usePageTracking();
    usePerformanceMonitoring();
    useNetworkMonitoring();
    return children;
};

const ScrollToTop = () => {
    const location = useLocation();
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
    }, [location.pathname]);
    return null;
};

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <ThemeProvider>
                    <Router>
                        <AnalyticsWrapper>
                            <ScrollToTop />
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/services" element={<Services />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/how-it-works" element={<HowItWorks />} />
                                <Route path="/gallery" element={<Gallery />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/privacy" element={<PrivacyPolicy />} />
                                <Route path="/terms" element={<Terms />} />
                                <Route path="/refund" element={<RefundPolicy />} />

                                {/* Auth Routes */}
                                <Route path="/login" element={<Navigate to="/user/login" replace />} />
                                <Route path="/register" element={<Navigate to="/register/user" replace />} />

                                <Route path="/user/login" element={<UserLogin />} />
                                <Route path="/therapist/login" element={<TherapistLogin />} />

                                <Route path="/register/user" element={<RegisterUser />} />
                                <Route path="/register/therapist" element={<RegisterTherapist />} />

                                <Route path="/admin" element={<AdminLogin />} />
                                <Route path="/theropist/login" element={<Navigate to="/therapist/login" replace />} />
                                <Route path="/Admin/login" element={<Navigate to="/admin" replace />} />

                                {/* Protected Dashboard Route */}
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <DashboardRouter />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* KYC Submission */}
                                <Route
                                    path="/kyc/submit"
                                    element={
                                        <ProtectedRoute allowedRoles={['therapist']}>
                                            <KYCSubmission />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Booking Create */}
                                <Route
                                    path="/booking/create"
                                    element={
                                        <ProtectedRoute allowedRoles={['user']}>
                                            <BookingCreate />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Notifications */}
                                <Route
                                    path="/user/notifications"
                                    element={
                                        <ProtectedRoute allowedRoles={['user']}>
                                            <Notifications />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/therapist/notifications"
                                    element={
                                        <ProtectedRoute allowedRoles={['therapist']}>
                                            <Notifications />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Payment Pages */}
                                <Route path="/payment/mock" element={<PaymentMock />} />
                                <Route path="/payment/success/:orderId" element={<PaymentSuccess />} />
                                <Route path="/payment/failure/:orderId" element={<PaymentFailure />} />

                                {/* 404 */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </AnalyticsWrapper>
                    </Router>
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                    />
                </ThemeProvider>
            </AuthProvider>
        </ErrorBoundary >
    );
}

export default App;
