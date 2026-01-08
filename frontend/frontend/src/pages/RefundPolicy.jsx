import { Clock, DollarSign, AlertCircle, Phone, Mail, Shield, CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

const RefundPolicy = () => {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-32 pb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10"></div>
        <div className="absolute top-20 -right-20 w-64 h-64 bg-green-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 -left-20 w-64 h-64 bg-blue-300 rounded-full opacity-20 blur-3xl"></div>
        
        <div className="container relative mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center shadow-lg">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-center text-gray-900 mb-4">
            Refund & <span className="text-green-600">Cancellation</span> Policy
          </h1>
          
          <p className="text-lg text-gray-600 text-center mb-8 max-w-3xl mx-auto">
            Clear, transparent guidelines for cancellations and refunds. Your satisfaction is our priority.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Customer Protection Guaranteed
            </div>
            <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* Cancellation Policy */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Cancellation Policy</h2>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Timeline Header */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-red-600" />
                    <h3 className="text-xl font-bold text-gray-900">Cancellation Windows</h3>
                  </div>
                  <div className="text-sm text-gray-600">Time before appointment</div>
                </div>
              </div>
              
              {/* Timeline */}
              <div className="p-8">
                <div className="space-y-8">
                  {/* Free Cancellation */}
                  <div className="flex gap-6 items-start">
                    <div className="flex-shrink-0 w-20 h-20 rounded-full bg-green-100 border-4 border-white shadow-lg flex flex-col items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mb-1" />
                      <span className="text-xs font-bold text-green-700">FREE</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-lg text-gray-900">Free Cancellation</h4>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">100% Refund</span>
                      </div>
                      <p className="text-gray-700 mb-3">Cancel more than 2 hours before your scheduled appointment time.</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>No charges applied</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 bg-white text-sm text-gray-500">or</span>
                    </div>
                  </div>
                  
                  {/* Late Cancellation */}
                  <div className="flex gap-6 items-start">
                    <div className="flex-shrink-0 w-20 h-20 rounded-full bg-yellow-100 border-4 border-white shadow-lg flex flex-col items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-yellow-600 mb-1" />
                      <span className="text-xs font-bold text-yellow-700">FEE</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-lg text-gray-900">Late Cancellation</h4>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">Partial Refund</span>
                      </div>
                      <p className="text-gray-700 mb-3">Cancel within 2 hours of your scheduled appointment time.</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-gray-700">A cancellation fee of 20% of the service amount may apply</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-gray-700">80% of the amount will be refunded to your original payment method</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 bg-white text-sm text-gray-500">or</span>
                    </div>
                  </div>
                  
                  {/* No Show */}
                  <div className="flex gap-6 items-start">
                    <div className="flex-shrink-0 w-20 h-20 rounded-full bg-red-100 border-4 border-white shadow-lg flex flex-col items-center justify-center">
                      <XCircle className="w-8 h-8 text-red-600 mb-1" />
                      <span className="text-xs font-bold text-red-700">NO SHOW</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-lg text-gray-900">No Show / Missed Appointment</h4>
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">No Refund</span>
                      </div>
                      <p className="text-gray-700 mb-3">If you miss your appointment without prior cancellation.</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-gray-700">Full service amount will be charged</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-gray-700">No refund will be processed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Process */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Refund Process</h2>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="mb-6">
                <h3 className="font-bold text-xl text-gray-900 mb-4">Refund Timeline & Process</h3>
                <p className="text-gray-700 mb-6">
                  All eligible refunds are processed securely to your original payment method. Here's what to expect:
                </p>
              </div>
              
              <div className="space-y-8">
                {/* Step 1 */}
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center shadow">
                      1
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">Refund Initiation</h4>
                    <p className="text-gray-700 mb-3">Refund is automatically initiated upon eligible cancellation.</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Within 1 hour of cancellation</span>
                    </div>
                  </div>
                </div>
                
                {/* Step 2 */}
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center shadow">
                      2
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">Processing Period</h4>
                    <p className="text-gray-700 mb-3">Your refund request is verified and processed by our finance team.</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>1-2 business days for verification</span>
                    </div>
                  </div>
                </div>
                
                {/* Step 3 */}
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center shadow">
                      3
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">Bank Processing</h4>
                    <p className="text-gray-700 mb-3">The amount is transferred to your bank/payment provider.</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>3-7 business days depending on your bank</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Note */}
              <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Important Note</h4>
                    <p className="text-gray-700 text-sm">
                      Refund processing times may vary based on your payment method and bank. International transactions may take additional time. You will receive email notifications at each step of the refund process.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Special Cases */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Special Cases & Exceptions</h2>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">Therapist Cancellation</h3>
                  </div>
                  <p className="text-gray-700 mb-4">If the therapist cancels the appointment for any reason:</p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>100% refund will be processed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>No cancellation charges applied</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Priority booking for rescheduling</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">Service Issues</h3>
                  </div>
                  <p className="text-gray-700 mb-4">If you're unsatisfied with the service quality:</p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Report within 2 hours of service completion</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Our quality team will investigate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Partial or full refund based on assessment</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  Emergency Situations
                </h3>
                <p className="text-gray-700 mb-4">
                  For emergencies (medical, family, etc.), we understand. Contact our support team immediately with relevant documentation, and we'll review your case personally.
                </p>
                <div className="text-sm text-gray-600">
                  *Documentation may include medical certificates, official notices, or other relevant proof.
                </div>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">Need Help with a Refund?</h3>
                <p className="opacity-90 mb-4">
                  Our support team is here to assist you with any refund or cancellation queries.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" />
                    <a href="mailto:support@broheal.com" className="hover:underline">
                      support@broheal.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5" />
                    <a href="tel:+919845067452" className="hover:underline">
                      +91 98450-67452
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <button className="bg-white text-green-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition-colors flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Support
                </button>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/30">
              <div className="text-sm opacity-90">
                <p className="mb-2"><strong>Tip:</strong> When contacting support, please have your booking ID and payment details ready for faster resolution.</p>
                <p>Support hours: Monday to Saturday, 9 AM - 8 PM IST</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default RefundPolicy