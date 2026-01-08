import { useState, useEffect } from 'react';
import { Gift, Copy, Share2, Users } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ReferralProgram = () => {
    const [referralData, setReferralData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReferralData();
    }, []);

    const loadReferralData = async () => {
        try {
            const response = await api.get('/user/referral');
            setReferralData(response.data.referral);
        } catch (error) {
            console.error('Failed to load referral data:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyReferralCode = () => {
        navigator.clipboard.writeText(referralData?.referralCode);
        toast.success('Referral code copied!');
    };

    const shareReferral = () => {
        const text = `Join Bro Heal using my referral code ${referralData?.referralCode} and get ₹${referralData?.rewardAmount} off on your first booking!`;
        const url = `${window.location.origin}?ref=${referralData?.referralCode}`;

        if (navigator.share) {
            navigator.share({
                title: 'Join Bro Heal',
                text: text,
                url: url
            });
        } else {
            navigator.clipboard.writeText(`${text}\n${url}`);
            toast.success('Referral link copied!');
        }
    };

    if (loading) {
        return (
            <div className="card">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Referral Header */}
            <div className="card bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold mb-2">Refer & Earn!</h3>
                        <p className="text-purple-100">
                            Invite friends and earn ₹{referralData?.rewardAmount || 50} for each successful referral
                        </p>
                    </div>
                    <Gift className="w-12 h-12 opacity-80" />
                </div>

                {/* Referral Code */}
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm text-purple-100 mb-2">Your Referral Code</p>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold font-mono tracking-wider">
                            {referralData?.referralCode || 'LOADING...'}
                        </span>
                        <button
                            onClick={copyReferralCode}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        >
                            <Copy className="w-5 h-5" />
                        </button>
                        <button
                            onClick={shareReferral}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="card text-center">
                    <div className="text-2xl font-bold text-purple-600">
                        {referralData?.totalReferrals || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Referrals</div>
                </div>

                <div className="card text-center">
                    <div className="text-2xl font-bold text-green-600">
                        ₹{referralData?.totalEarnings || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Earned</div>
                </div>

                <div className="card text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {referralData?.referredUsers?.filter(u => u.rewardStatus === 'earned').length || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Active Referrals</div>
                </div>
            </div>

            {/* How it Works */}
            <div className="card">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-600" />
                    How It Works
                </h4>
                <div className="space-y-3">
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            1
                        </div>
                        <div>
                            <p className="font-medium">Share your code</p>
                            <p className="text-sm text-gray-600">
                                Send your unique referral code to friends
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            2
                        </div>
                        <div>
                            <p className="font-medium">They sign up & book</p>
                            <p className="text-sm text-gray-600">
                                Your friend gets ₹{referralData?.rewardAmount || 50} off their first booking
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            3
                        </div>
                        <div>
                            <p className="font-medium">You earn rewards</p>
                            <p className="text-sm text-gray-600">
                                Get ₹{referralData?.rewardAmount || 50} credited to your wallet
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Referred Users */}
            {referralData?.referredUsers && referralData.referredUsers.length > 0 && (
                <div className="card">
                    <h4 className="font-semibold mb-3">Your Referrals</h4>
                    <div className="space-y-2">
                        {referralData.referredUsers.map((ref, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium">Referral #{index + 1}</p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(ref.registeredAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`badge ${ref.rewardStatus === 'earned' ? 'badge-success' :
                                        ref.rewardStatus === 'paid' ? 'badge-info' : 'badge-warning'
                                    }`}>
                                    {ref.rewardStatus}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReferralProgram;
