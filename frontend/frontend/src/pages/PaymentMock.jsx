import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, XCircle } from 'lucide-react';
import api from '../services/api';

const PaymentMock = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [orderId, setOrderId] = useState('');
    const [amount, setAmount] = useState(0);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const oid = params.get('orderId') || '';
        const amt = parseFloat(params.get('amount') || '0');
        setOrderId(oid);
        setAmount(isNaN(amt) ? 0 : amt);
    }, [location.search]);

    const handleSuccess = async () => {
        try {
            setProcessing(true);
            const txnId = `TXN${Date.now()}`;
            const payload = {
                STATUS: 'TXN_SUCCESS',
                ORDERID: orderId,
                TXNAMOUNT: String(amount),
                TXNID: txnId
            };
            await api.post('/payment/callback', payload);
            navigate(`/payment/success/${orderId}`);
        } catch (error) {
            navigate(`/payment/failure/${orderId}`);
        } finally {
            setProcessing(false);
        }
    };

    const handleFailure = async () => {
        try {
            setProcessing(true);
            const payload = {
                STATUS: 'TXN_FAILURE',
                ORDERID: orderId,
                TXNAMOUNT: String(amount)
            };
            await api.post('/payment/callback', payload);
            navigate(`/payment/failure/${orderId}`);
        } catch (error) {
            navigate(`/payment/failure/${orderId}`);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="mobile-panel">
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="card max-w-md w-full">
                    <h1 className="text-xl font-semibold mb-2">Mock Payment</h1>
                    <p className="text-gray-600 mb-4">This is a test-mode payment screen.</p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Order ID</span>
                            <span className="font-mono text-sm">{orderId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Amount</span>
                            <span className="font-bold text-lg">₹{amount}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            disabled={!orderId || processing}
                            onClick={handleSuccess}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <CreditCard className="w-5 h-5" />
                            Pay Now
                        </button>
                        <button
                            disabled={!orderId || processing}
                            onClick={handleFailure}
                            className="btn-secondary w-full flex items-center justify-center gap-2"
                        >
                            <XCircle className="w-5 h-5" />
                            Fail Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentMock;
