import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';
import api from '../services/api';

const PaymentSuccess = () => {
    const { orderId: orderIdParam } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [payment, setPayment] = useState(null);
    const [showReview, setShowReview] = useState(false);
    const [bookingId, setBookingId] = useState(null);
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const orderId = orderIdParam || searchParams.get('orderId');

        const verify = async () => {
            try {
                const response = await api.get(`/payment/verify/${orderId}`);
                const tx = response.data.transaction;
                setPayment({ orderId: tx.orderId, amount: tx.amount, status: tx.status });
                if (tx.status === 'success' && tx.bookingId) {
                    setBookingId(tx.bookingId);
                    setShowReview(true);
                }
            } catch (error) {
                setPayment({ orderId, amount: 0, status: 'success' });
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            verify();
        } else {
            setPayment({ orderId: 'unknown', amount: 0, status: 'success' });
            setLoading(false);
        }
    }, [orderIdParam, location.search]);

    const submitReview = async () => {
        if (!bookingId) return;
        try {
            setSubmitting(true);
            await api.post(`/user/bookings/${bookingId}/review`, { rating, review: reviewText.trim() });
            setShowReview(false);
        } catch (error) {
            // Silently fail here; user can submit from dashboard later
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="mobile-panel">
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="mobile-panel">
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="card text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Payment Successful!
                    </h1>

                    <p className="text-gray-600 mb-6">
                        Your payment has been processed successfully
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Order ID</span>
                            <span className="font-mono text-sm">{payment?.orderId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Amount Paid</span>
                            <span className="font-bold text-lg text-green-600">₹{payment?.amount}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Go to Dashboard
                    </button>
                </div>
            </div>

            {showReview && (
                <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Share Your Experience</h3>
                        <p className="text-gray-600 mb-4">Please rate the service and leave a short review.</p>

                        <div className="flex items-center gap-2 mb-4">
                            {[1,2,3,4,5].map((i) => (
                                <button key={i} type="button" onClick={() => setRating(i)} className="p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={i <= rating ? '#F59E0B' : 'none'} stroke={i <= rating ? '#F59E0B' : '#9CA3AF'} className="w-7 h-7">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.5a.75.75 0 011.04 0l2.27 2.28c.1.1.23.17.37.2l3.22.47a.75.75 0 01.41 1.28l-2.33 2.27a.75.75 0 00-.22.66l.55 3.21a.75.75 0 01-1.09.79l-2.89-1.52a.75.75 0 00-.7 0l-2.89 1.52a.75.75 0 01-1.09-.79l.55-3.21a.75.75 0 00-.22-.66L4.21 8.73a.75.75 0 01.41-1.28l3.22-.47a.75.75 0 00.37-.2l2.27-2.28z" />
                                    </svg>
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Type your review..."
                            className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-primary-600"
                            rows={4}
                        />

                        <div className="flex gap-3">
                            <button onClick={submitReview} disabled={submitting || !reviewText.trim()} className="btn-primary flex-1">
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                            <button onClick={() => setShowReview(false)} className="btn-outline flex-1">Later</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentSuccess;
