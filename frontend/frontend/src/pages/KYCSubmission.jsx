import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Upload, FileText, User, Mail, Phone, Home, MapPin, Contact, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const KYCSubmission = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        idType: 'aadhar',
        idNumber: '',
        idProofUrl: '',
        certificateUrl: '',
        permanentAddress: {
            street: '',
            city: '',
            state: '',
            pincode: ''
        },
        presentAddress: {
            street: '',
            city: '',
            state: '',
            pincode: ''
        },
        reference: {
            name: '',
            mobile: '',
            relation: ''
        }
    });

    const steps = [
        { number: 1, title: 'Personal Info' },
        { number: 2, title: 'ID Verification' },
        { number: 3, title: 'Address Details' },
        { number: 4, title: 'Reference' },
        { number: 5, title: 'Review' }
    ];

    const uploadFile = async (file) => {
        try {
            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
            if (!cloudName || !uploadPreset) {
                toast.error('Upload configuration missing');
                return null;
            }
            const fd = new FormData();
            fd.append('file', file);
            fd.append('upload_preset', uploadPreset);
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { 
                method: 'POST', 
                body: fd 
            });
            const data = await res.json();
            return data.secure_url || data.url || null;
        } catch (e) {
            toast.error('File upload failed. Please try again.');
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Client-side validation
        const p1 = formData.permanentAddress;
        const p2 = formData.presentAddress;
        const ref = formData.reference;
        const pin6 = (v) => /^[0-9]{6}$/.test(String(v||''));
        const mob10 = (v) => /^[0-9]{10}$/.test(String(v||''));
        
        if (!formData.fullName || !formData.email || !formData.mobile) {
            toast.error('Please fill in all personal details');
            return;
        }
        
        if (!formData.idProofUrl || !formData.certificateUrl) { 
            toast.error('Please upload both ID proof and certificate'); 
            return; 
        }
        
        if (!p1.street || !p1.city || !p1.state || !pin6(p1.pincode)) { 
            toast.error('Please fill permanent address with valid 6-digit pincode'); 
            return; 
        }
        
        if (!p2.street || !p2.city || !p2.state || !pin6(p2.pincode)) { 
            toast.error('Please fill present address with valid 6-digit pincode'); 
            return; 
        }
        
        if (!ref.name || !mob10(ref.mobile) || !ref.relation) { 
            toast.error('Please fill reference details with valid 10-digit mobile number'); 
            return; 
        }
        
        setLoading(true);

        try {
            await api.post('/therapist/kyc', formData);
            toast.success('KYC submitted successfully! Our team will review your application.');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit KYC. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileSelect = async (field, e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            toast.error('Only JPG, PNG, and PDF files are allowed');
            return;
        }
        
        toast.info('Uploading file...');
        const url = await uploadFile(file);
        if (url) {
            setFormData(prev => ({ ...prev, [field]: url }));
            toast.success('File uploaded successfully!');
        } else {
            toast.error('Upload failed. Please try again.');
        }
    };

    const nextStep = () => {
        // Basic validation before moving to next step
        if (currentStep === 1) {
            if (!formData.fullName || !formData.email || !formData.mobile) {
                toast.error('Please fill all personal details');
                return;
            }
            if (!/^[0-9]{10}$/.test(formData.mobile)) {
                toast.error('Please enter a valid 10-digit mobile number');
                return;
            }
        }
        if (currentStep === 2) {
            if (!formData.idNumber) {
                toast.error('Please enter your ID number');
                return;
            }
        }
        setCurrentStep(prev => Math.min(prev + 1, steps.length));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const renderStep = () => {
        switch(currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <User className="w-16 h-16 mx-auto text-blue-500 mb-3" />
                            <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
                            <p className="text-gray-600 mt-2">Please provide your basic details</p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    <span className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Full Name
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange('fullName', e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    <span className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email Address
                                    </span>
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder="example@mail.com"
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    <span className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        Mobile Number
                                    </span>
                                </label>
                                <input
                                    type="tel"
                                    value={formData.mobile}
                                    onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="9876543210"
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    maxLength={10}
                                    required
                                />
                                <p className="text-xs text-gray-500">10-digit mobile number</p>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    ID Type
                                </label>
                                <select
                                    value={formData.idType}
                                    onChange={(e) => handleChange('idType', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="aadhar">Aadhar Card</option>
                                    <option value="voter">Voter ID</option>
                                    <option value="passport">Passport</option>
                                    <option value="driving_licence">Driving Licence</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );
                
            case 2:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <FileText className="w-16 h-16 mx-auto text-blue-500 mb-3" />
                            <h2 className="text-2xl font-bold text-gray-800">Identity Verification</h2>
                            <p className="text-gray-600 mt-2">Upload your ID proof and certificates</p>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    {formData.idType === 'aadhar' ? 'Aadhar Number' : 
                                     formData.idType === 'voter' ? 'Voter ID Number' :
                                     formData.idType === 'passport' ? 'Passport Number' : 'Driving Licence Number'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.idNumber}
                                    onChange={(e) => handleChange('idNumber', e.target.value)}
                                    placeholder={`Enter ${formData.idType.replace('_', ' ')} number`}
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Upload ID Proof
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                                        <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                                        <p className="text-sm text-gray-600 mb-2">Upload a clear photo of your ID</p>
                                        <p className="text-xs text-gray-500 mb-4">Supports JPG, PNG, PDF (Max 5MB)</p>
                                        <label className="cursor-pointer">
                                            <input 
                                                type="file" 
                                                accept="image/*,application/pdf" 
                                                onChange={(e)=>handleFileSelect('idProofUrl', e)}
                                                className="hidden"
                                            />
                                            <span className="inline-block bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                                                Choose File
                                            </span>
                                        </label>
                                        {formData.idProofUrl && (
                                            <div className="mt-4">
                                                <div className="flex items-center justify-center gap-2 text-green-600">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span className="text-sm">Uploaded Successfully</span>
                                                </div>
                                                <a 
                                                    href={formData.idProofUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="text-blue-600 text-sm hover:underline mt-1 inline-block"
                                                >
                                                    View Uploaded File
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Upload Certificate
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                                        <FileText className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                                        <p className="text-sm text-gray-600 mb-2">Upload your qualification certificate</p>
                                        <p className="text-xs text-gray-500 mb-4">Supports JPG, PNG, PDF (Max 5MB)</p>
                                        <label className="cursor-pointer">
                                            <input 
                                                type="file" 
                                                accept="image/*,application/pdf" 
                                                onChange={(e)=>handleFileSelect('certificateUrl', e)}
                                                className="hidden"
                                            />
                                            <span className="inline-block bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                                                Choose File
                                            </span>
                                        </label>
                                        {formData.certificateUrl && (
                                            <div className="mt-4">
                                                <div className="flex items-center justify-center gap-2 text-green-600">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span className="text-sm">Uploaded Successfully</span>
                                                </div>
                                                <a 
                                                    href={formData.certificateUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="text-blue-600 text-sm hover:underline mt-1 inline-block"
                                                >
                                                    View Uploaded File
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
                
            case 3:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <Home className="w-16 h-16 mx-auto text-blue-500 mb-3" />
                            <h2 className="text-2xl font-bold text-gray-800">Address Details</h2>
                            <p className="text-gray-600 mt-2">Provide your permanent and present addresses</p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Permanent Address
                                </h3>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={formData.permanentAddress.street}
                                        onChange={(e) => handleChange('permanentAddress', { ...formData.permanentAddress, street: e.target.value })}
                                        placeholder="Street Address"
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        required
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            value={formData.permanentAddress.city}
                                            onChange={(e) => handleChange('permanentAddress', { ...formData.permanentAddress, city: e.target.value })}
                                            placeholder="City"
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            required
                                        />
                                        <input
                                            type="text"
                                            value={formData.permanentAddress.state}
                                            onChange={(e) => handleChange('permanentAddress', { ...formData.permanentAddress, state: e.target.value })}
                                            placeholder="State"
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.permanentAddress.pincode}
                                        onChange={(e) => handleChange('permanentAddress', { ...formData.permanentAddress, pincode: e.target.value.replace(/\D/g,'').slice(0,6) })}
                                        placeholder="Pincode (6 digits)"
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Present Address
                                </h3>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={formData.presentAddress.street}
                                        onChange={(e) => handleChange('presentAddress', { ...formData.presentAddress, street: e.target.value })}
                                        placeholder="Street Address"
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        required
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            value={formData.presentAddress.city}
                                            onChange={(e) => handleChange('presentAddress', { ...formData.presentAddress, city: e.target.value })}
                                            placeholder="City"
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            required
                                        />
                                        <input
                                            type="text"
                                            value={formData.presentAddress.state}
                                            onChange={(e) => handleChange('presentAddress', { ...formData.presentAddress, state: e.target.value })}
                                            placeholder="State"
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.presentAddress.pincode}
                                        onChange={(e) => handleChange('presentAddress', { ...formData.presentAddress, pincode: e.target.value.replace(/\D/g,'').slice(0,6) })}
                                        placeholder="Pincode (6 digits)"
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
                
            case 4:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <Contact className="w-16 h-16 mx-auto text-blue-500 mb-3" />
                            <h2 className="text-2xl font-bold text-gray-800">Emergency Contact</h2>
                            <p className="text-gray-600 mt-2">Provide details of a reference person</p>
                        </div>
                        
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Reference Person Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.reference.name}
                                    onChange={(e) => handleChange('reference', { ...formData.reference, name: e.target.value })}
                                    placeholder="Full name of reference person"
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Mobile Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.reference.mobile}
                                    onChange={(e) => handleChange('reference', { ...formData.reference, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                    placeholder="9876543210"
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    maxLength={10}
                                    required
                                />
                                <p className="text-xs text-gray-500">10-digit mobile number</p>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Relationship
                                </label>
                                <input
                                    type="text"
                                    value={formData.reference.relation}
                                    onChange={(e) => handleChange('reference', { ...formData.reference, relation: e.target.value })}
                                    placeholder="Father, Mother, Friend, etc."
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                );
                
            case 5:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-3" />
                            <h2 className="text-2xl font-bold text-gray-800">Review & Submit</h2>
                            <p className="text-gray-600 mt-2">Please review all information before submission</p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium text-gray-700">Personal Details</h3>
                                    <p className="text-gray-900"><strong>Name:</strong> {formData.fullName || 'Not provided'}</p>
                                    <p className="text-gray-900"><strong>Email:</strong> {formData.email || 'Not provided'}</p>
                                    <p className="text-gray-900"><strong>Mobile:</strong> {formData.mobile || 'Not provided'}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-700">ID Details</h3>
                                    <p className="text-gray-900"><strong>ID Type:</strong> {formData.idType || 'Not provided'}</p>
                                    <p className="text-gray-900"><strong>ID Number:</strong> {formData.idNumber || 'Not provided'}</p>
                                    <p className="text-gray-900"><strong>Files Uploaded:</strong> {
                                        (formData.idProofUrl ? 'ID Proof ✓ ' : '') + 
                                        (formData.certificateUrl ? 'Certificate ✓' : '')
                                    }</p>
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium text-gray-700">Permanent Address</h3>
                                    <p className="text-gray-900">{formData.permanentAddress.street || 'Not provided'}</p>
                                    <p className="text-gray-900">{formData.permanentAddress.city}, {formData.permanentAddress.state}</p>
                                    <p className="text-gray-900">Pincode: {formData.permanentAddress.pincode || 'Not provided'}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-700">Present Address</h3>
                                    <p className="text-gray-900">{formData.presentAddress.street || 'Not provided'}</p>
                                    <p className="text-gray-900">{formData.presentAddress.city}, {formData.presentAddress.state}</p>
                                    <p className="text-gray-900">Pincode: {formData.presentAddress.pincode || 'Not provided'}</p>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-medium text-gray-700">Emergency Contact</h3>
                                <p className="text-gray-900"><strong>Name:</strong> {formData.reference.name || 'Not provided'}</p>
                                <p className="text-gray-900"><strong>Mobile:</strong> {formData.reference.mobile || 'Not provided'}</p>
                                <p className="text-gray-900"><strong>Relation:</strong> {formData.reference.relation || 'Not provided'}</p>
                            </div>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-blue-800">
                                        By submitting this form, you confirm that all information provided is accurate and complete.
                                        Inaccurate information may result in rejection of your application.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">KYC Verification</h1>
                        <p className="text-gray-600 mt-1">Complete your Know Your Customer verification</p>
                    </div>
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep >= step.number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'} transition-all`}>
                                    {step.number}
                                </div>
                                <span className={`text-xs mt-2 font-medium hidden md:block ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {step.title}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className="absolute h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Form Container */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-6 md:p-8">
                        {renderStep()}
                        
                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-6 border-t">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className={`px-6 py-3 rounded-lg font-medium transition-all ${currentStep === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Previous
                            </button>
                            
                            {currentStep < steps.length ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Submitting...
                                        </span>
                                    ) : 'Submit KYC'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> KYC verification usually takes 24-48 hours. You will receive an email notification once your verification is complete. Please ensure all uploaded documents are clear and legible.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KYCSubmission;