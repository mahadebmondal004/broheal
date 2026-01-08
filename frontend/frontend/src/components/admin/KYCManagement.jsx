import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import api from '../../services/api';

const KYCManagement = () => {
    const [pendingKyc, setPendingKyc] = useState([]);
    const [approvedKyc, setApprovedKyc] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPendingKyc();
        loadApprovedKyc();
    }, []);

    const loadPendingKyc = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/therapists?kycStatus=pending');
            setPendingKyc(response.data.therapists || []);
        } catch (error) {
            console.error('Failed to load pending KYC:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadApprovedKyc = async () => {
        try {
            const response = await api.get('/admin/therapists?kycStatus=approved');
            setApprovedKyc(response.data.therapists || []);
        } catch (error) {
            console.error('Failed to load approved KYC:', error);
        }
    };

    const handleKycAction = async (therapistId, action, reason = '') => {
        try {
            if (action === 'approve') {
                await api.put(`/admin/therapists/${therapistId}/kyc/approve`);
            } else {
                await api.put(`/admin/therapists/${therapistId}/kyc/reject`, { reason });
            }

            loadPendingKyc();
            alert(`KYC ${action}ed successfully`);
        } catch (error) {
            console.error('Failed to update KYC:', error);
            alert(`Failed to ${action} KYC: ${error.response?.data?.message || error.message}`);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'Not submitted';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">KYC Management</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Review and verify therapist documents
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        {pendingKyc.length} pending approval{pendingKyc.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        Loading KYC data...
                    </div>
                ) : pendingKyc.length > 0 ? (
                    <div className="grid gap-4">
                        {pendingKyc.map((therapist) => (
                            <div key={therapist._id} className="border border-gray-200 dark:border-white/10 rounded-xl p-6 bg-white/50 dark:bg-slate-900/50 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                            <span className="font-semibold text-blue-600 dark:text-blue-400 text-lg">
                                                {therapist.name?.charAt(0) || 'T'}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-gray-900 dark:text-white">{therapist.name}</h4>
                                            <p className="text-gray-600 dark:text-gray-300">+91 {therapist.phone}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                Specialization: {therapist.specialization || 'General Therapy'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800">
                                        Pending Review
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/5">
                                    {/* Address Information */}
                                    <div className="space-y-3">
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-white/10 pb-2">Address Information</p>
                                        {/* Present/Local Address from KYC */}
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Present/Local Address:</p>
                                            <div className="text-sm text-gray-800 dark:text-gray-200 mt-1">
                                                {therapist.kyc?.presentAddress ? (
                                                    typeof therapist.kyc.presentAddress === 'string' ? (
                                                        <span>{therapist.kyc.presentAddress}</span>
                                                    ) : (
                                                        <>
                                                            {therapist.kyc.presentAddress.street && <div>{therapist.kyc.presentAddress.street}</div>}
                                                            <div>
                                                                {therapist.kyc.presentAddress.city}, {therapist.kyc.presentAddress.state} - {therapist.kyc.presentAddress.pincode}
                                                            </div>
                                                        </>
                                                    )
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-500">Not provided</span>
                                                )}
                                            </div>
                                        </div>
                                        {/* Permanent Address from KYC */}
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Permanent Address:</p>
                                            <div className="text-sm text-gray-800 dark:text-gray-200 mt-1">
                                                {therapist.kyc?.permanentAddress ? (
                                                    typeof therapist.kyc.permanentAddress === 'string' ? (
                                                        <span>{therapist.kyc.permanentAddress}</span>
                                                    ) : (
                                                        <>
                                                            {therapist.kyc.permanentAddress.street && <div>{therapist.kyc.permanentAddress.street}</div>}
                                                            <div>
                                                                {therapist.kyc.permanentAddress.city}, {therapist.kyc.permanentAddress.state} - {therapist.kyc.permanentAddress.pincode}
                                                            </div>
                                                        </>
                                                    )
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-500">Not provided</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Documents and Submission Info */}
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-white/10 pb-2">Documents</p>
                                            <ul className="text-sm text-gray-600 dark:text-gray-300 mt-2 space-y-1">
                                                <li>• <span className="text-gray-500 dark:text-gray-400">ID Type:</span> {therapist.kyc?.idType || '-'}</li>
                                                <li>• <span className="text-gray-500 dark:text-gray-400">ID Number:</span> {therapist.kyc?.idNumber || '-'}</li>
                                                <li>• <span className="text-gray-500 dark:text-gray-400">ID Proof:</span> {therapist.kyc?.idProofUrl ? <a href={therapist.kyc.idProofUrl} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">View</a> : '-'}</li>
                                                <li>• <span className="text-gray-500 dark:text-gray-400">Certificate:</span> {therapist.kyc?.certificateUrl ? <a href={therapist.kyc.certificateUrl} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">View</a> : '-'}</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-white/10 pb-2 mt-2">Emergency Contact</p>
                                            <ul className="text-sm text-gray-600 dark:text-gray-300 mt-2 space-y-1">
                                                <li>• <span className="text-gray-500 dark:text-gray-400">Name:</span> {therapist.kyc?.reference?.name || '-'}</li>
                                                <li>• <span className="text-gray-500 dark:text-gray-400">Relation:</span> {therapist.kyc?.reference?.relation || '-'}</li>
                                                <li>• <span className="text-gray-500 dark:text-gray-400">Mobile:</span> {therapist.kyc?.reference?.mobile ? `+91 ${therapist.kyc.reference.mobile}` : '-'}</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-3">Submitted On:</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {therapist.kyc?.createdAt ? formatDate(therapist.kyc.createdAt) : 'Not available'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleKycAction(therapist._id, 'approve')}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors shadow-lg shadow-green-500/20 font-medium"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Approve KYC
                                    </button>
                                    <button
                                        onClick={() => {
                                            const reason = prompt('Please enter rejection reason:');
                                            if (reason) handleKycAction(therapist._id, 'reject', reason);
                                        }}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors shadow-lg shadow-red-500/20 font-medium"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-medium">
                                        <MessageSquare className="w-4 h-4" />
                                        Request Info
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-80" />
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">All Caught Up!</h4>
                        <p className="text-gray-600 dark:text-gray-400">No pending KYC approvals at the moment.</p>
                    </div>
                )}

                <div className="mt-8 border-t border-gray-200 dark:border-white/10 pt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Verified KYC</h4>
                        <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg border border-gray-200 dark:border-white/5">{approvedKyc.length} verified</span>
                    </div>
                    {approvedKyc.length > 0 ? (
                        <div className="grid gap-4">
                            {approvedKyc.map((therapist) => (
                                <div key={therapist._id} className="border border-gray-200 dark:border-white/10 rounded-xl p-6 bg-white/50 dark:bg-slate-900/50 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                                <span className="font-semibold text-green-700 dark:text-green-400 text-lg">
                                                    {therapist.name?.charAt(0) || 'T'}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg text-gray-900 dark:text-white">{therapist.name}</h4>
                                                <p className="text-gray-600 dark:text-gray-300">+91 {therapist.phone}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    Specialization: {therapist.specialization || 'General Therapy'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                                            Verified
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/5">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Present/Local Address</p>
                                            <div className="text-sm text-gray-800 dark:text-gray-200">
                                                {therapist.kyc?.presentAddress ? (
                                                    typeof therapist.kyc.presentAddress === 'string' ? (
                                                        <span>{therapist.kyc.presentAddress}</span>
                                                    ) : (
                                                        <>
                                                            {therapist.kyc.presentAddress.street && <div>{therapist.kyc.presentAddress.street}</div>}
                                                            <div>
                                                                {therapist.kyc.presentAddress.city}, {therapist.kyc.presentAddress.state} - {therapist.kyc.presentAddress.pincode}
                                                            </div>
                                                        </>
                                                    )
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-500">Not provided</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Permanent Address</p>
                                            <div className="text-sm text-gray-800 dark:text-gray-200">
                                                {therapist.kyc?.permanentAddress ? (
                                                    typeof therapist.kyc.permanentAddress === 'string' ? (
                                                        <span>{therapist.kyc.permanentAddress}</span>
                                                    ) : (
                                                        <>
                                                            {therapist.kyc.permanentAddress.street && <div>{therapist.kyc.permanentAddress.street}</div>}
                                                            <div>
                                                                {therapist.kyc.permanentAddress.city}, {therapist.kyc.permanentAddress.state} - {therapist.kyc.permanentAddress.pincode}
                                                            </div>
                                                        </>
                                                    )
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-500">Not provided</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 dark:border-white/5 pt-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Documents</p>
                                            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                                <li>ID: {therapist.kyc?.idType || '-'}</li>
                                                <li>No: {therapist.kyc?.idNumber || '-'}</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Emergency</p>
                                            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                                <li>{therapist.kyc?.reference?.name || '-'} ({therapist.kyc?.reference?.relation || '-'})</li>
                                                <li>{therapist.kyc?.reference?.mobile ? `+91 ${therapist.kyc.reference.mobile}` : '-'}</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Approved</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{therapist.kyc?.approvedAt ? new Date(therapist.kyc.approvedAt).toLocaleString() : '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">No verified KYC to display.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KYCManagement;
