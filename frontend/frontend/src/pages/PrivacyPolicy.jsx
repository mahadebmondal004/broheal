import { Shield, Lock, Eye, Database, Users, Mail, Phone } from 'lucide-react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

const PrivacyPolicy = () => {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-32 pb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-purple-600/10"></div>
        <div className="absolute top-20 -right-20 w-64 h-64 bg-primary-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 -left-20 w-64 h-64 bg-purple-300 rounded-full opacity-20 blur-3xl"></div>
        
        <div className="container relative mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-center text-gray-900 mb-4">
            Privacy <span className="text-primary-600">Policy</span>
          </h1>
          
          <p className="text-lg text-gray-600 text-center mb-8 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how BroHeal collects, uses, and protects your personal information.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              Effective: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Information We Collect */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Information We Collect</h2>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Personal Information
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Full name and contact details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Phone number and email address</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Profile picture (optional)</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-green-600" />
                    Service Information
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Booking history and preferences</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Payment and transaction data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Service location (with permission)</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  Usage Data
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>App usage patterns and interactions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Device information and IP address</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Cookies and similar technologies</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Information */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">Service Delivery</h3>
                    <p className="text-gray-700">To provide and improve our wellness services, process bookings, and facilitate therapist-customer communication.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">Payment Processing</h3>
                    <p className="text-gray-700">To securely process payments, send invoices, and handle refunds when necessary.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">Communication</h3>
                    <p className="text-gray-700">To send booking confirmations, service updates, and important notifications about your account.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">Service Improvement</h3>
                    <p className="text-gray-700">To analyze usage patterns, enhance user experience, and develop new features based on customer feedback.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Data Security Measures</h2>
            </div>
            
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl shadow-lg border border-red-100 p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
                      <span className="text-red-600 font-bold">✓</span>
                    </div>
                    <span className="font-semibold text-gray-900">SSL Encryption</span>
                  </div>
                  <p className="text-gray-700 text-sm">All data transmitted between your device and our servers is encrypted using industry-standard SSL/TLS protocols.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
                      <span className="text-red-600 font-bold">✓</span>
                    </div>
                    <span className="font-semibold text-gray-900">Secure Storage</span>
                  </div>
                  <p className="text-gray-700 text-sm">Personal information is stored on secure servers with restricted access and regular security audits.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
                      <span className="text-red-600 font-bold">✓</span>
                    </div>
                    <span className="font-semibold text-gray-900">Regular Audits</span>
                  </div>
                  <p className="text-gray-700 text-sm">We conduct regular security assessments and vulnerability testing to maintain robust protection.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
                      <span className="text-red-600 font-bold">✓</span>
                    </div>
                    <span className="font-semibold text-gray-900">Access Control</span>
                  </div>
                  <p className="text-gray-700 text-sm">Strict access controls ensure only authorized personnel can access sensitive customer data.</p>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-white/50 rounded-xl border border-red-200">
                <p className="text-gray-700 italic text-center">
                  <span className="font-semibold">Note:</span> While we implement comprehensive security measures, no method of transmission over the Internet or electronic storage is 100% secure.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Contact Us</h2>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="text-center">
                <p className="text-gray-700 mb-6 text-lg">
                  For any questions, concerns, or requests regarding your privacy or this policy, please contact our Privacy Team.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 max-w-xl mx-auto">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">Email</span>
                    </div>
                    <a href="mailto:privacy@broheal.com" className="text-blue-600 hover:text-blue-700 transition-colors">
                      privacy@broheal.com
                    </a>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Phone className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-900">Phone</span>
                    </div>
                    <a href="tel:+919845067452" className="text-green-600 hover:text-green-700 transition-colors">
                      +91 98450-67452
                    </a>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-gray-600 text-sm">
                    We typically respond to privacy inquiries within 24-48 business hours.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Updates */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-yellow-700 font-bold">!</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Policy Updates</h3>
                <p className="text-gray-700 mb-2">
                  We may update this Privacy Policy periodically to reflect changes in our practices or for other operational, legal, or regulatory reasons.
                </p>
                <p className="text-gray-700">
                  We will notify you of any material changes by posting the new Privacy Policy on this page and updating the effective date at the top.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PrivacyPolicy