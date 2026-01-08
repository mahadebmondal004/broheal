import { FileText, Shield, User, CreditCard, AlertCircle, Lock, Globe, BookOpen, Scale, Mail } from 'lucide-react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

const Terms = () => {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-32 pb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="absolute top-20 -right-20 w-64 h-64 bg-blue-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 -left-20 w-64 h-64 bg-indigo-300 rounded-full opacity-20 blur-3xl"></div>
        
        <div className="container relative mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center shadow-lg">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-center text-gray-900 mb-4">
            Terms of <span className="text-blue-600">Service</span>
          </h1>
          
          <p className="text-lg text-gray-600 text-center mb-8 max-w-3xl mx-auto">
            Please read these terms carefully before using BroHeal. By accessing or using our services, you agree to be bound by these terms.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Version 2.1
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* Important Notice */}
          <div className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8 shadow-lg">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Important Notice</h2>
                <p className="text-gray-700 mb-4">
                  These Terms of Service govern your use of the BroHeal platform, including our website, mobile applications, and services. By creating an account or using our services, you acknowledge that you have read, understood, and agree to be bound by these terms.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Scale className="w-4 h-4" />
                  <span>These terms constitute a legally binding agreement between you and BroHeal.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Use of Service */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">1. Use of Service</h2>
                <p className="text-gray-600">Acceptable use and platform guidelines</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">1.1 Acceptable Use</h3>
                  <p className="text-gray-700 mb-4">
                    You agree to use the BroHeal platform only for lawful purposes and in accordance with these Terms. You may not use our services:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-600 text-sm font-bold">×</span>
                      </div>
                      <span>In any way that violates any applicable national or international law or regulation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-600 text-sm font-bold">×</span>
                      </div>
                      <span>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-600 text-sm font-bold">×</span>
                      </div>
                      <span>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-600 text-sm font-bold">×</span>
                      </div>
                      <span>To impersonate or attempt to impersonate BroHeal, a BroHeal employee, another user, or any other person or entity</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-3">1.2 Service Availability</h3>
                  <p className="text-gray-700">
                    We strive to ensure the platform is available 24/7, but we do not guarantee uninterrupted access. We may suspend, withdraw, or restrict the availability of all or any part of our platform for business and operational reasons without prior notice.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Accounts */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">2. Accounts</h2>
                <p className="text-gray-600">Account creation, security, and responsibilities</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">2.1 Account Creation</h3>
                  <p className="text-gray-700 mb-4">
                    To use certain features of our platform, you must register for an account. You agree to:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-sm font-bold">✓</span>
                      </div>
                      <span>Provide accurate, current, and complete information during registration</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-sm font-bold">✓</span>
                      </div>
                      <span>Maintain and promptly update your account information</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-sm font-bold">✓</span>
                      </div>
                      <span>Maintain the security of your account credentials</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-sm font-bold">✓</span>
                      </div>
                      <span>Accept responsibility for all activities that occur under your account</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-3">2.2 Account Security</h3>
                  <p className="text-gray-700 mb-4">
                    You are responsible for safeguarding your password and for all activities that occur under your account. You agree to:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-gray-900">Security Responsibilities</span>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Not share your password with anyone</li>
                        <li>• Notify us immediately of any unauthorized use</li>
                        <li>• Use strong, unique passwords</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <span className="font-semibold text-gray-900">Account Termination</span>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• We may suspend or terminate accounts</li>
                        <li>• For violations of these terms</li>
                        <li>• For fraudulent or abusive activities</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Bookings and Payments */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">3. Bookings and Payments</h2>
                <p className="text-gray-600">Booking terms, pricing, and payment policies</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">3.1 Booking Process</h3>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <h4 className="font-semibold text-gray-900 mb-2">Booking Confirmation</h4>
                      <p className="text-sm text-gray-700">
                        All bookings are subject to therapist availability. Confirmation is sent via email/SMS once a therapist accepts your booking.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                      <h4 className="font-semibold text-gray-900 mb-2">Rescheduling</h4>
                      <p className="text-sm text-gray-700">
                        You may reschedule appointments up to 2 hours before the scheduled time, subject to therapist availability.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-3">3.2 Pricing and Payments</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-gray-600 text-sm font-bold">₹</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Pricing Transparency</h4>
                        <p className="text-gray-700 text-sm">
                          All prices are displayed in Indian Rupees (₹) and include applicable taxes unless otherwise stated. Prices may vary based on location, service duration, and therapist expertise.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CreditCard className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Payment Methods</h4>
                        <p className="text-gray-700 text-sm">
                          We accept various payment methods including credit/debit cards, UPI, net banking, and digital wallets. All payments are processed through secure, PCI-DSS compliant payment gateways.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-3">3.3 Cancellation and Refunds</h3>
                  <p className="text-gray-700 mb-4">
                    Please refer to our separate <a href="/refund" className="text-blue-600 hover:underline font-medium">Refund & Cancellation Policy</a> for detailed information on cancellation windows, fees, and refund processing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Liability */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">4. Liability</h2>
                <p className="text-gray-600">Limitations of liability and disclaimers</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">4.1 Service Quality</h3>
                  <p className="text-gray-700 mb-4">
                    While we strive to provide high-quality services through verified therapists, we do not guarantee specific results from any wellness service. The effectiveness of treatments may vary based on individual circumstances.
                  </p>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-3">4.2 Limitations of Liability</h3>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-700 mb-3">
                      To the maximum extent permitted by law, BroHeal shall not be liable for:
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-1">•</span>
                        <span>Any indirect, incidental, special, consequential, or punitive damages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-1">•</span>
                        <span>Loss of profits, data, use, goodwill, or other intangible losses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-1">•</span>
                        <span>Damages related to unauthorized access to or use of our servers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-1">•</span>
                        <span>Any errors or omissions in any content or for any loss or damage incurred as a result of the use of any content posted, transmitted, or otherwise made available</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-3">4.3 Medical Disclaimer</h3>
                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="flex gap-3">
                      <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                      <div>
                        <p className="text-gray-700">
                          <strong>Important:</strong> Our wellness services are not intended to diagnose, treat, cure, or prevent any medical conditions. Always consult with a qualified healthcare professional for medical advice. Our therapists are wellness practitioners, not medical doctors.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Changes */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">5. Changes to Terms</h2>
                <p className="text-gray-600">Updates and modifications to these terms</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">5.1 Right to Modify</h3>
                  <p className="text-gray-700 mb-4">
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
                  </p>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-3">5.2 Continued Use</h3>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-gray-700">
                      By continuing to access or use our services after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the services.
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-3">5.3 Notification of Changes</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">How We Notify</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Email notification to registered users</li>
                        <li>• In-app notifications</li>
                        <li>• Updated date on this page</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Your Responsibility</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Regularly review these terms</li>
                        <li>• Check for updates periodically</li>
                        <li>• Maintain updated contact information</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">Questions About These Terms?</h3>
                <p className="opacity-90 mb-4">
                  If you have any questions or concerns about our Terms of Service, please contact our legal team.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" />
                    <a href="mailto:legal@broheal.com" className="hover:underline">
                      legal@broheal.com
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <button className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition-colors flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Legal Team
                </button>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/30">
              <div className="text-sm opacity-90">
                <p><strong>Note:</strong> For service-related inquiries, please contact our customer support team at <a href="mailto:support@broheal.com" className="underline">support@broheal.com</a></p>
              </div>
            </div>
          </div>

          {/* Acceptance Section */}
          <div className="mt-12 text-center">
            <div className="inline-block p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-2">By using our services, you acknowledge that:</h3>
              <p className="text-gray-700">
                You have read, understood, and agree to be bound by these Terms of Service, along with our 
                <a href="/privacy" className="text-blue-600 hover:underline font-medium mx-1">Privacy Policy</a> 
                and 
                <a href="/refund" className="text-blue-600 hover:underline font-medium ml-1">Refund & Cancellation Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Terms