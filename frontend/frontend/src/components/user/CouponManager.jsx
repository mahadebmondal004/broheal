import { useState } from 'react';
import { Tag, Percent, Calendar, Users } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const CouponManager = ({ coupons, onApplyCoupon }) => {
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [error, setError] = useState('');

    const validateCoupon = async () => {
        setError('');
        try {
            const response = await api.post('/user/validate-coupon', {
                code: couponCode
            });

            if (response.data.valid) {
                setAppliedCoupon(response.data.coupon);
                onApplyCoupon(response.data.coupon);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid coupon code');
            setAppliedCoupon(null);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        onApplyCoupon(null);
    };

    const calculateDiscount = (amount, coupon) => {
        if (!coupon) return 0;

        let discount = 0;
        if (coupon.type === 'percentage') {
            discount = (amount * coupon.value) / 100;
            if (coupon.maxDiscount) {
                discount = Math.min(discount, coupon.maxDiscount);
            }
        } else {
            discount = coupon.value;
        }

        return Math.min(discount, amount);
    };

    return (
        <div className="space-y-4">
            {/* Available Coupons */}
            {coupons && coupons.length > 0 && !appliedCoupon && (
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Available Offers</h4>
                    <div className="space-y-2">
                        {coupons.map((coupon) => (
                            <button
                                key={coupon.code}
                                onClick={() => {
                                    setCouponCode(coupon.code);
                                    validateCoupon();
                                }}
                                className="w-full card hover:shadow-md transition-shadow text-left"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Tag className="w-4 h-4 text-primary-600" />
                                            <span className="font-mono font-bold text-primary-600">
                                                {coupon.code}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{coupon.description}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Percent className="w-3 h-3" />
                                                {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                                            </span>
                                            {coupon.minOrderAmount > 0 && (
                                                <span>Min: ₹{coupon.minOrderAmount}</span>
                                            )}
                                        </div>
                                    </div>
                                    <button className="text-primary-600 text-sm font-medium">
                                        APPLY
                                    </button>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Coupon Input */}
            {!appliedCoupon && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Have a coupon code?
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Enter code"
                            className="input-field flex-1"
                        />
                        <button onClick={validateCoupon} className="btn-primary">
                            Apply
                        </button>
                    </div>
                    {error && (
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                    )}
                </div>
            )}

            {/* Applied Coupon */}
            {appliedCoupon && (
                <div className="card bg-green-50 border-green-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Tag className="w-4 h-4 text-green-600" />
                                <span className="font-mono font-bold text-green-600">
                                    {appliedCoupon.code}
                                </span>
                            </div>
                            <p className="text-sm text-gray-700">
                                {appliedCoupon.type === 'percentage'
                                    ? `${appliedCoupon.value}% discount applied`
                                    : `₹${appliedCoupon.value} discount applied`}
                            </p>
                        </div>
                        <button
                            onClick={removeCoupon}
                            className="text-sm text-red-600 hover:text-red-700"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponManager;
