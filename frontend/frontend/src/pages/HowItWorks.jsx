import { useEffect, useState } from 'react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
 
import { 
  Calendar, 
  Target, 
  UserCheck, 
  HeartPulse, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Clock,
  Shield,
  Users,
  Zap,
  ChevronRight,
  MessageSquare,
  Star,
  Award,
  MapPin,
  Phone,
  Play
} from 'lucide-react'
import { motion } from 'framer-motion'

const HowItWorks = () => {
  const [steps, setSteps] = useState([])
  const [overviewImage, setOverviewImage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const defaultSteps = [
      { 
        step: 1, 
        title: 'Choose Service', 
        description: 'Select from our range of wellness services and preferred time',
        icon: <Calendar className="w-8 h-8" />,
        details: ['Browse 50+ services', 'Flexible timing', 'No upfront payment'],
        color: 'from-blue-500 to-cyan-500'
      },
      { 
        step: 2, 
        title: 'Book Therapist', 
        description: 'Choose your preferred therapist and confirm booking',
        icon: <Target className="w-8 h-8" />,
        details: ['Verified professionals', 'Instant confirmation', 'Transparent pricing'],
        color: 'from-purple-500 to-pink-500'
      },
      { 
        step: 3, 
        title: 'Therapist Arrives', 
        description: 'Therapist arrives at your location and delivers premium service',
        icon: <UserCheck className="w-8 h-8" />,
        details: ['On-time arrival', 'Safety protocols', 'Equipment included'],
        color: 'from-rose-500 to-orange-500'
      },
      { 
        step: 4, 
        title: 'Relax & Enjoy', 
        description: 'Personalized care with progress tracking and follow-up support',
        icon: <HeartPulse className="w-8 h-8" />,
        details: ['Personalized care', 'Follow-up support', 'Pay after service'],
        color: 'from-emerald-500 to-green-500'
      }
    ]
    setSteps(defaultSteps)
    setOverviewImage('https://assets.zencare.co/2021/10/10-Surprising-Things-Therapists-Can-Help-You-With---Blog-Size.png')
    setLoading(false)
  }, [])

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { duration: 0.5, ease: "backOut" }
    },
    hover: {
      scale: 1.05,
      y: -10,
      transition: { duration: 0.3 }
    }
  }

  const floatingAnimation = {
    initial: { y: 0 },
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const pulseAnimation = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  // Benefits data
  const benefits = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: '100% Safe & Verified',
      description: 'Every therapist undergoes rigorous background checks and certification'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Flexible Scheduling',
      description: 'Book at your convenience, reschedule anytime without extra charges'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Expert Therapists',
      description: 'Certified professionals with 5+ years average experience'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Same-Day Service',
      description: 'Get matched and book sessions on the same day'
    }
  ]

  // Stats data
  const stats = [
    { value: '98%', label: 'Satisfaction Rate', icon: <Star className="w-6 h-6" /> },
    { value: '24/7', label: 'Support Available', icon: <Clock className="w-6 h-6" /> },
    { value: '500+', label: 'Verified Experts', icon: <Award className="w-6 h-6" /> },
    { value: '25+', label: 'Cities Served', icon: <MapPin className="w-6 h-6" /> }
  ]

 

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <Navbar />
      
      {/* Hero Section with Animations */}
      <section className="relative h-[50vh] min-h-[100px] mt-16 overflow-hidden">
        {/* Background Image with Animation */}
        <motion.div 
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <img
            src="https://images.unsplash.com/photo-1519824145371-296894a0daa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="How It Works"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-purple-900/60 to-blue-900/80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        </motion.div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full"
              initial={{ 
                x: Math.random() * 100 + 'vw',
                y: Math.random() * 100 + 'vh',
                opacity: 0
              }}
              animate={{ 
                y: [null, '-20vh'],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div 
              className="max-w-3xl"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div 
                className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="w-4 h-4 text-yellow-300 mr-2" />
                <span className="text-white/90 text-sm font-medium">Simple & Transparent</span>
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-7xl font-semibold text-white mb-4 leading-tight"
                variants={fadeInUp}
              >
                Your Wellness Journey
                <motion.span 
                  className="block bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['0% center', '100% center', '0% center']
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    backgroundSize: '200% auto'
                  }}
                >
                  Made Simple
                </motion.span>
              </motion.h1>
              
            
              
            
            </motion.div>
          </div>
        </div>

        {/* Floating Stats */}
       
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div 
            className="grid lg:grid-cols-2 gap-10 items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <h3 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">See It In Action</h3>
              <p className="text-gray-600 mb-6">A quick overview of how BroHeal makes wellness simple, safe, and convenient for you.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border bg-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div className="font-semibold">Verified Professionals</div>
                  </div>
                  <div className="text-sm text-gray-600">Certified experts with safety protocols</div>
                </div>
                <div className="p-5 rounded-2xl border bg-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div className="font-semibold">Flexible Scheduling</div>
                  </div>
                  <div className="text-sm text-gray-600">Book and reschedule with ease</div>
                </div>
                <div className="p-5 rounded-2xl border bg-white">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="font-semibold">Pay After Service</div>
                  </div>
                  <div className="text-sm text-gray-600">Transparent pricing, no hidden fees</div>
                </div>
                <div className="p-5 rounded-2xl border bg-white">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <div className="font-semibold">Support 24/7</div>
                  </div>
                  <div className="text-sm text-gray-600">We’re here whenever you need us</div>
                </div>
              </div>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-xl">
              <img 
                src={overviewImage || 'https://assets.zencare.co/2021/10/10-Surprising-Things-Therapists-Can-Help-You-With---Blog-Size.png'}
                alt="Overview"
                className="w-full h-[360px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-700">
                Overview
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-10 md:py-12">
        <div className="container mx-auto px-4 md:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <motion.div 
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <Zap className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-blue-700 font-semibold">4 Simple Steps</span>
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              4 Simple Steps
            </motion.h2>
            
            <motion.p 
              className="text-gray-600 text-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              From booking to healing—experience seamless wellness care delivered to your doorstep
            </motion.p>
          </div>

          {/* Steps Process with Animated Connection Line */}
          <div className="relative">
            {/* Animated Connection Line */}
            <motion.div 
              className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 transform -translate-y-1/2"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            
            <div className="relative z-10">
              <motion.div 
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-start items-start"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {(Array.isArray(steps) ? steps : []).map((step, index) => (
                  <motion.div 
                    key={index}
                    className="relative"
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    {/* Step Number Badge */}
                    <motion.div 
                      className="absolute -top-4 left-3 z-20"
                      animate={floatingAnimation}
                    >
                      <div className={`w-10 h-10 bg-gradient-to-r ${step.color} text-white rounded-full flex items-center justify-center text-lg font-semibold shadow-lg`}>
                        {step.step}
                      </div>
                    </motion.div>
                    
                    {/* Step Card */}
                    <div className="bg-gradient-to-b from-white to-gray-50 rounded-3xl p-7 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 pt-10 text-left group">
                      {/* Icon Container */}
                      <motion.div 
                        className={`inline-flex p-4 bg-gradient-to-r ${step.color} rounded-2xl mb-5`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="text-white">
                          {step.icon}
                        </div>
                      </motion.div>
                      
                      {/* Step Title */}
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      
                      {/* Step Description */}
                      <p className="text-gray-600 mb-6">
                        {step.description}
                      </p>
                      
                      {/* Step Details */}
                      <div className="space-y-3">
                        {(Array.isArray(step.details) ? step.details : []).map((detail, idx) => (
                          <motion.div 
                            key={idx}
                            className="flex items-center text-sm"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 + idx * 0.1 }}
                          >
                            <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{detail}</span>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Hover Indicator */}
                      <motion.div 
                        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        animate={pulseAnimation}
                      >
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Process Visualization */}
          <motion.div 
            className="mt-10 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6 md:p-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
                Visualizing Your Wellness Journey
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                See how thousands of clients transform their health with our seamless process
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { label: 'Booking', value: '1 min', color: 'bg-blue-500' },
                { label: 'Matching', value: '30 sec', color: 'bg-purple-500' },
                { label: 'Arrival', value: 'On Time', color: 'bg-pink-500' },
                { label: 'Satisfaction', value: '98%', color: 'bg-emerald-500' }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3`}>
                    {item.value}
                  </div>
                  <div className="text-gray-700 font-medium">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="mt-12 grid sm:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {[
              { icon: <Shield className="w-5 h-5" />, title: 'Safety First', text: 'Hygiene and verification ensured' },
              { icon: <Users className="w-5 h-5" />, title: 'Expert Network', text: 'Handpicked, certified therapists' },
              { icon: <Clock className="w-5 h-5" />, title: 'On-Time Guarantee', text: 'Punctual and reliable service' },
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl border bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
                    {item.icon}
                  </div>
                  <div className="font-semibold">{item.title}</div>
                </div>
                <div className="text-sm text-gray-600">{item.text}</div>
              </div>
            ))}
          </motion.div>

          
          <motion.div 
            className="mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.div 
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <Shield className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-blue-700 font-semibold">Why Choose Us</span>
              </motion.div>
            <motion.h2 
              className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              The BroHeal Advantage
            </motion.h2>
              <motion.p 
                className="text-gray-600 text-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                Experience wellness care reimagined for the modern lifestyle
              </motion.p>
            </div>
            
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  className="bg-gradient-to-b from-white to-gray-50 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300"
                  variants={cardVariants}
                  whileHover={{ y: -10 }}
                >
                  <motion.div 
                    className="inline-flex p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl mb-6"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-blue-600">{benefit.icon}</div>
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Call to Action Section */}
         

          {/* FAQ Section */}
          <motion.div 
            className="mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.div 
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <MessageSquare className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-blue-700 font-semibold">Common Questions</span>
              </motion.div>
              <motion.h2 
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Frequently Asked Questions
              </motion.h2>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <motion.div 
                className="space-y-6"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  {
                    question: 'How quickly can I book a session?',
                    answer: 'You can book a session in under 1 minute! Our platform is designed for quick and easy booking with instant confirmation.'
                  },
                  {
                    question: 'What if I need to cancel or reschedule?',
                    answer: 'You can cancel or reschedule up to 4 hours before your appointment without any charges. We understand that plans can change.'
                  },
                  {
                    question: 'Are therapists certified and verified?',
                    answer: 'Absolutely! Every therapist undergoes a 7-step verification process including background checks, credential verification, and skill assessment.'
                  },
                  {
                    question: 'What areas do you serve?',
                    answer: 'We currently serve 25+ major cities across India and are expanding rapidly. Check our website for availability in your city.'
                  }
                ].map((faq, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                    variants={fadeInUp}
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <motion.div 
                          className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg flex items-center justify-center"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <span className="font-bold">Q{index + 1}</span>
                        </motion.div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {faq.question}
                        </h3>
                        <p className="text-gray-700">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default HowItWorks
