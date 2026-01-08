import { useNavigate } from 'react-router-dom'
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, Heart, Shield, Clock, Award, CheckCircle, Star, Download, Globe, Sparkles } from 'lucide-react'
import logoUrl from '../../assets/broheal.png'
import { motion } from 'framer-motion'

const Footer = ({ content }) => {
  const navigate = useNavigate()

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const go = (path) => {
    navigate(path)
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      }
    }, 0)
  }

  // Trust badges data
  const trustBadges = [
    { icon: <Shield className="w-5 h-5" />, text: '100% Safe & Secure', subtext: 'Verified Therapists' },
    { icon: <Clock className="w-5 h-5" />, text: '24/7 Support', subtext: 'Always Available' },
    { icon: <Award className="w-5 h-5" />, text: 'Certified Experts', subtext: 'Professional Staff' },
    { icon: <CheckCircle className="w-5 h-5" />, text: 'Satisfaction Guarantee', subtext: '98% Happy Clients' },
  ]

  // App download links
  const appLinks = [
    { store: 'Google Play', icon: <div className="text-2xl">📱</div>, label: 'Get it on', sublabel: 'Google Play', bg: 'from-green-500 to-emerald-600' },
    { store: 'App Store', icon: <div className="text-2xl">📱</div>, label: 'Download on', sublabel: 'App Store', bg: 'from-blue-500 to-indigo-600' },
  ]

  // Popular services
  const popularServices = [
    { name: 'Deep Tissue Massage', link: '/services/massage' },
    { name: 'Physiotherapy', link: '/services/physio' },
    { name: 'Ayurvedic Treatment', link: '/services/ayurveda' },
    { name: 'Corporate Wellness', link: '/services/corporate' },
    { name: 'Senior Care', link: '/services/senior' },
    { name: 'Sports Therapy', link: '/services/sports' },
  ]

  // Payment methods
  const paymentMethods = [
    '💳', '🏦', '📱', '💎', '🛡️'
  ]

  return (
    <footer id="contact" className="bg-gradient-to-r from-[#0A3D47] via-[#0A3D47] to-[#0A3D47] text-white">
      {/* Top Trust Section */}
      <div className="bg-gradient-to-r from-[#08343D] to-[#0A3D47] py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  {badge.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm">{badge.text}</p>
                  <p className="text-xs text-white/70">{badge.subtext}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="pt-14 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5 mb-10">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img src={logoUrl} alt="BroHeal" className="h-12 brightness-0 invert" />

              </div>
              <p className="text-white/80 text-sm max-w-md mb-6">
                {content?.footer?.description || "India's premier wellness platform delivering premium therapeutic services directly to your home. Trusted by 10,000+ clients nationwide."}
              </p>

              {/* App Download Buttons */}


              {/* Social Media */}
              <div>
                <p className="font-semibold mb-3">Connect With Us</p>
                <div className="flex items-center gap-3">
                  <motion.a
                    href="#"
                    aria-label="Facebook"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-blue-500 border border-white/20 flex items-center justify-center transition-all"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Facebook className="w-5 h-5" />
                  </motion.a>
                  <motion.a
                    href="#"
                    aria-label="Instagram"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-gradient-to-r hover:from-pink-500 hover:to-orange-500 border border-white/20 flex items-center justify-center transition-all"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                  >
                    <Instagram className="w-5 h-5" />
                  </motion.a>
                  <motion.a
                    href="#"
                    aria-label="YouTube"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-red-500 border border-white/20 flex items-center justify-center transition-all"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Youtube className="w-5 h-5" />
                  </motion.a>
                  <motion.a
                    href="#"
                    aria-label="LinkedIn"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-blue-700 border border-white/20 flex items-center justify-center transition-all"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </motion.a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-lg mb-6 pb-2 border-b border-white/20">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <motion.button
                    onClick={() => go('/')}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
                    whileHover={{ x: 5 }}
                  >
                    <div className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Home
                  </motion.button>
                </li>
                <li>
                  <motion.button
                    onClick={() => go('/services')}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
                    whileHover={{ x: 5 }}
                  >
                    <div className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Services
                  </motion.button>
                </li>
                <li>
                  <motion.button
                    onClick={() => go('/how-it-works')}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
                    whileHover={{ x: 5 }}
                  >
                    <div className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    How It Works
                  </motion.button>
                </li>
                <li>
                  <motion.button
                    onClick={() => go('/about')}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
                    whileHover={{ x: 5 }}
                  >
                    <div className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    About Us
                  </motion.button>
                </li>
                <li>
                  <motion.button
                    onClick={() => go('/blog')}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
                    whileHover={{ x: 5 }}
                  >
                    <div className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Blog & Articles
                  </motion.button>
                </li>
                <li>
                  <motion.button
                    onClick={() => go('/careers')}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
                    whileHover={{ x: 5 }}
                  >
                    <div className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Careers
                  </motion.button>
                </li>
                <li>
                  <motion.button
                    onClick={() => go('/therapist/login')}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
                    whileHover={{ x: 5 }}
                  >
                    <div className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Therapist Login
                  </motion.button>
                </li>
              </ul>
            </div>

            {/* Popular Services */}
            <div>
              <h3 className="font-semibold text-lg mb-6 pb-2 border-b border-white/20">Popular Services</h3>
              <ul className="space-y-3">
                {popularServices.map((service, index) => (
                  <li key={index}>
                    <motion.button
                      onClick={() => go(service.link)}
                      className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
                      whileHover={{ x: 5 }}
                    >
                      <div className="w-1 h-1 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      {service.name}
                    </motion.button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-lg mb-6 pb-2 border-b border-white/20">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg mt-1">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Call Us</p>
                    <p className="text-white/80 text-sm">+91 9845067452</p>
                    <p className="text-white/60 text-xs">Mon-Sun: 24/7 Available</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg mt-1">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-white/80 text-sm">support@broheal.com</p>
                    <p className="text-white/60 text-xs">Response within 2 hours</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg mt-1">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Head Office</p>
                    <p className="text-white/80 text-sm">
                      No 162, 5th Main, 2nd Cross, RT Nagar, Bangalore – 560032, Karnataka – India
                    </p>
                  </div>
                </li>
              </ul>

              {/* Newsletter Subscription */}

            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/10 pt-8 mt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-white/80 text-sm mb-2">
                  {content?.footer?.copyright || '© 2025 BroHeal Wellness Pvt. Ltd. All rights reserved.'}
                </p>
                <p className="text-white/60 text-xs">
                  Made with <Heart className="inline w-3 h-3 text-red-400" /> for healthier India
                </p>
              </div>

              {/* Payment Methods */}


              {/* Legal Links */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                <motion.button
                  onClick={() => go('/privacy')}
                  className="hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Privacy Policy
                </motion.button>
                <div className="w-px h-4 bg-white/20" />
                <motion.button
                  onClick={() => go('/terms')}
                  className="hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Terms of Service
                </motion.button>
                <div className="w-px h-4 bg-white/20" />
                <motion.button
                  onClick={() => go('/refund')}
                  className="hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Refund Policy
                </motion.button>
                <div className="w-px h-4 bg-white/20" />
                <motion.button
                  onClick={() => go('/sitemap')}
                  className="hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Sitemap
                </motion.button>
              </div>
            </div>

            {/* Certifications & Awards */}
            <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-white/60 text-xs">
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3" />
                <span>Serving 25+ Cities Across India</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-3 h-3 text-yellow-400" />
                <span>4.9/5 Customer Rating</span>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg flex items-center justify-center z-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </motion.button>
    </footer>
  )
}
export default Footer