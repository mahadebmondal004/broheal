import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { XCircle, Home, RefreshCw } from 'lucide-react';

const PaymentFailure = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [reason, setReason] = useState('');

    useEffect(() => {
        const search = new URLSearchParams(location.search);
        const r = search.get('reason');
        const code = search.get('code');
        if (r || code) {
            setReason([r, code].filter(Boolean).join(' • '));
        }
    }, [location.search]);

    return (
        <div className="mobile-panel">
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="card text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-12 h-12 text-red-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Payment Failed
                    </h1>

                    <p className="text-gray-600 mb-6">
                        Unfortunately, your payment could not be processed. Please try again.
                    </p>
                    {reason && (
                        <div className="bg-red-50 text-red-700 rounded-lg p-3 mb-4 text-sm">
                            {reason}
                        </div>
                    )}

                    {orderId && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Order ID</span>
                                <span className="font-mono text-sm">{orderId}</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Try Again
                        </button>

                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn-secondary w-full flex items-center justify-center gap-2"
                        >
                            <Home className="w-5 h-5" />
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailure;
