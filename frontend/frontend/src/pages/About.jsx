import { useEffect, useState } from 'react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
 
import { 
  Heart, 
  Shield, 
  HeartPulse, 
  Star, 
  Clock, 
  MapPin, 
  Users, 
  Award, 
  CheckCircle,
  ThumbsUp,
  TrendingUp,
  Calendar,
  Phone,
  MessageSquare,
  ArrowRight,
  Sparkles,
  ChevronRight,
  BadgeCheck,
  Zap,
  Globe,
  Target
} from 'lucide-react'
import { motion } from 'framer-motion'

const About = () => {
  const [about, setAbout] = useState(null)
  
  const [activeValue, setActiveValue] = useState(0)
  const [testimonials, setTestimonials] = useState([])

  const defaultTestimonials = [
    {
      name: 'Priya Sharma',
      role: 'Regular Customer',
      image: 'https://i.pravatar.cc/150?img=1',
      rating: 5,
      content: 'BroHeal has been a lifesaver! The therapists are professional and punctual. Highly recommended!'
    },
    {
      name: 'Rahul Verma',
      role: 'Corporate Professional',
      image: 'https://i.pravatar.cc/150?img=5',
      rating: 5,
      content: 'Convenient to get quality massage therapy at home. The booking process is smooth and therapists are amazing.'
    },
    {
      name: 'Anita Patel',
      role: 'Homemaker',
      image: 'https://i.pravatar.cc/150?img=8',
      rating: 5,
      content: 'Exceptional experience every time. Well-trained therapists and consistently good service quality.'
    }
  ]

  useEffect(() => {
    setTestimonials(defaultTestimonials)
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
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5 }
    },
    hover: {
      scale: 1.05,
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

  // Default content
  const image = about?.image || 'https://images.jdmagicbox.com/quickquotes/listicle/listicle_1693567033831_mxh6q_700x468.jpg'
  const title = about?.title || 'Transforming Wellness, One Home at a Time'
  const paras = about?.paragraphs || [
    'At BroHeal, we believe that true wellness begins in the comfort of your own space. Founded in 2020, our journey started with a simple vision: to make premium therapeutic services accessible, safe, and convenient for everyone.',
    'We bring certified wellness professionals directly to your doorstep, eliminating the barriers of travel, time, and uncertainty. Each therapist in our network undergoes a rigorous 7-step verification process to ensure the highest standards of professionalism and expertise.',
    
  ]

  // Enhanced stats data with animations
  const stats = [
    { icon: <Users />, value: '10,000+', label: 'Happy Clients', suffix: 'and counting' },
    { icon: <Award />, value: '500+', label: 'Verified Therapists', suffix: 'expert certified' },
    { icon: <MapPin />, value: '25+', label: 'Cities Served', suffix: 'nationwide' },
    { icon: <ThumbsUp />, value: '98%', label: 'Satisfaction Rate', suffix: 'client retention' },
    { icon: <Clock />, value: '24/7', label: 'Support Available', suffix: 'always here for you' },
    { icon: <TrendingUp />, value: '99%', label: 'On-Time Arrival', suffix: 'reliability guaranteed' }
  ]

  // Core values with expanded content
  const values = [
    {
      icon: <Shield />,
      title: 'Safety First',
      description: 'Every therapist is background-verified and trained in safety protocols. Your wellbeing is our priority.',
      features: ['Background Verification', 'Safety Certifications', 'Hygiene Protocols', 'Emergency Preparedness'],
      color: 'from-blue-500 to-cyan-500',
      image: 'https://media.istockphoto.com/id/1396861229/photo/patient-having-his-hand-massaged-with-a-spiky-massage-ball.jpg?s=612x612&w=0&k=20&c=fz13o685VHT_W6AQTLUKO43nhDJEQklUaKzhuS6ffAM='
    },
    {
      icon: <Clock />,
      title: 'Convenience',
      description: 'Book sessions at your preferred time. We work around your schedule, not the other way around.',
      features: ['Flexible Scheduling', 'Same-Day Booking', 'Reschedule Anytime', 'No Hidden Fees'],
      color: 'from-purple-500 to-pink-500',
      image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=1200&auto=format&fit=crop'
    },
    {
      icon: <Heart />,
      title: 'Personalized Care',
      description: 'Services tailored to your specific needs with ongoing support and follow-ups.',
      features: ['Custom Treatment Plans', 'Progress Tracking', 'Regular Follow-ups', 'Personal Therapist'],
      color: 'from-rose-500 to-red-500',
      image: 'https://img.freepik.com/premium-photo/portrait-tablet-psychology-with-man-chair-white-background-studio-listen-diagnosis-psychologist-mental-health-smile-with-happy-person-counseling-therapy_590464-224055.jpg'
    },
    {
      icon: <HeartPulse />,
      title: 'Holistic Approach',
      description: 'We address physical, mental, and emotional wellness through integrated therapeutic practices.',
      features: ['Mind-Body Integration', 'Nutrition Guidance', 'Stress Management', 'Lifestyle Coaching'],
      color: 'from-emerald-500 to-green-500',
      image: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=1200&auto=format&fit=crop'
    }
  ]

  // Team members with social links
  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Founder & Chief Wellness Officer',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      bio: '15+ years in physical therapy and wellness consulting',
      expertise: ['Physical Therapy', 'Wellness Strategy', 'Team Training'],
      badge: <BadgeCheck className="w-5 h-5 text-blue-500" />
    },
    {
      name: 'Michael Chen',
      role: 'Head of Therapist Network',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      bio: 'Former hospital administrator specializing in healthcare logistics',
      expertise: ['Healthcare Operations', 'Quality Assurance', 'Network Management'],
      badge: <Zap className="w-5 h-5 text-yellow-500" />
    },
    {
      name: 'Priya Sharma',
      role: 'Customer Experience Director',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      bio: '8+ years in client relations and service excellence',
      expertise: ['Client Relations', 'Service Design', 'Feedback Systems'],
      badge: <Sparkles className="w-5 h-5 text-purple-500" />
    }
  ]

  // Process steps
  const processSteps = [
    {
      step: '01',
      title: 'Book Your Session',
      description: 'Select service, time, and location through our easy-to-use platform',
      icon: <Calendar className="w-6 h-6" />
    },
    {
      step: '02',
      title: 'Get Matched',
      description: 'Our AI matches you with the perfect therapist based on your needs',
      icon: <Target className="w-6 h-6" />
    },
    {
      step: '03',
      title: 'Therapist Arrives',
      description: 'Verified professional arrives at your doorstep with all equipment',
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      step: '04',
      title: 'Enjoy & Heal',
      description: 'Relax and receive premium therapeutic care in your comfort zone',
      icon: <HeartPulse className="w-6 h-6" />
    }
  ]

  

  // FAQ Section
  const faqs = [
    {
      question: 'How are therapists verified?',
      answer: 'Each therapist undergoes a 7-step verification process including background checks, credential verification, skill assessment, and customer service training.'
    },
    {
      question: 'What areas do you serve?',
      answer: 'We currently serve 25+ major cities across India and are expanding rapidly. Check our website for availability in your city.'
    },
    {
      question: 'Can I choose my therapist?',
      answer: 'Yes! You can view therapist profiles, specialties, and ratings before booking, or let our AI system recommend the best match.'
    },
    {
      question: 'What if I need to cancel or reschedule?',
      answer: 'You can cancel or reschedule up to 4 hours before your appointment without any charges.'
    }
  ]

  

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      {/* Enhanced Hero Section with Animations */}
      <section className="relative h-[85vh] min-h-[600px] mt-16 overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <img
            src={image}
            alt="About BroHeal"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-purple-900/60 to-blue-900/80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
        </motion.div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
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
              className="max-w-3xl -mt-6 md:-mt-10"
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
                <span className="text-white/90 text-sm font-medium">Trusted by 10,000+ clients</span>
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-6xl font-semibold text-white mb-4 leading-tight"
                variants={fadeInUp}
              >
                Redefining
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
                  Wellness Care
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl"
                variants={fadeInUp}
              >
                Bringing premium therapeutic services to your doorstep with trust, care, and convenience
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-4 mb-6"
                variants={fadeInUp}
              >
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="w-2 h-2 bg-green-400 rounded-full"
                    animate={pulseAnimation}
                  />
                  <span className="text-green-200 font-medium">✓ 24/7 Available</span>
                </div>
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="w-2 h-2 bg-yellow-400 rounded-full"
                    animate={pulseAnimation}
                  />
                  <span className="text-yellow-200 font-medium">⭐ 4.9/5 Rating</span>
                </div>
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="w-2 h-2 bg-blue-400 rounded-full"
                    animate={pulseAnimation}
                  />
                  <span className="text-blue-200 font-medium">🔒 Verified Professionals</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                variants={fadeInUp}
              >
                <motion.button 
                  className="group px-8 py-4 bg-gradient-to-r from-[#0A3D47] via-[#0A3D47] to-[#0A3D47] hover:from-[#08343D] hover:via-[#08343D] hover:to-[#0A3D47] text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center"
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Start Healing Journey</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button 
                  className="px-8 py-4 bg-gradient-to-r from-[#0A3D47] via-[#0A3D47] to-[#0A3D47] hover:from-[#08343D] hover:via-[#08343D] hover:to-[#0A3D47] text-white font-semibold rounded-xl border-2 border-[#0A3D47] transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Book Consultation
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Enhanced Stats overlay with Animation */}
      
      </section>

      {/* Enhanced Main Content with Animations */}
      <section className="py-10 md:py-12">
        <div className="container mx-auto px-4 md:px-8">
          {/* Our Story with Enhanced Design */}
          <div className="grid lg:grid-cols-2 gap-8 items-center mb-8">
            <motion.div 
              className="order-2 lg:order-1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* <motion.div 
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <Target className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-blue-700 font-semibold">Our Mission</span>
              </motion.div> */}
              
              <motion.h2 
                className="text-4xl md:text-5xl font-semibold text-gray-900 mb-8 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {title}
                <motion.div 
                  className="w-24 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-4"
                  initial={{ width: 0 }}
                  whileInView={{ width: 96 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </motion.h2>
              
              <div className="space-y-6 mb-10">
                {paras.map((p, i) => (
                  <motion.div 
                    key={i} 
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <motion.div 
                        className="w-2 h-2 bg-blue-500 rounded-full"
                        whileHover={{ scale: 1.5 }}
                      />
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed ml-4">{p}</p>
                  </motion.div>
                ))}
              </div>
              
              
              
              <div className="flex flex-wrap gap-4">
                <motion.button 
                  className="group px-8 py-3 bg-gradient-to-r from-[#0A3D47] via-[#0A3D47] to-[#0A3D47] hover:from-[#08343D] hover:via-[#08343D] hover:to-[#0A3D47] text-white font-semibold rounded-xl transition-all duration-300 flex items-center"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Explore Services</span>
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button 
                  className="px-8 py-3 border-2 border-[#0A3D47] text-[#0A3D47] hover:bg-gradient-to-r hover:from-[#0A3D47] hover:via-[#0A3D47] hover:to-[#0A3D47] hover:text-white font-semibold rounded-xl transition-all duration-300 flex items-center"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  <span>Chat with Expert</span>
                </motion.button>
              </div>
            </motion.div>
            
            <motion.div 
              className="order-1 lg:order-2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <motion.div 
                  className="rounded-3xl overflow-hidden shadow-2xl"
                  whileHover={{ scale: 1.02 }}
                >
                  <img 
                    src={image} 
                    alt="Wellness therapy session" 
                    className="w-full h-[500px] object-cover"
                    loading="lazy"
                  />
                </motion.div>
                {/* Floating Testimonial Card */}
                <motion.div 
                  className="absolute -bottom-6 -left-6 bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-2xl max-w-xs border border-gray-100"
                  initial={{ opacity: 0, scale: 0.8, x: -20, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="flex mr-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="font-bold text-gray-900 text-lg">4.9/5</span>
                  </div>
                  <p className="text-gray-700 italic mb-4">
                    "BroHeal transformed my recovery journey. The convenience and quality are unmatched!"
                  </p>
                  <div className="flex items-center">
                    <img 
                      src="https://img.freepik.com/premium-photo/closeup-man-having-back-massage-spa-treatment-wellness-center_926199-1955400.jpg?w=360"
                      alt="Alex R."
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-bold text-gray-900">Mahadeb</p>
                      <p className="text-sm text-gray-600">Client since 2025</p>
                    </div>
                  </div>
                </motion.div>
                
                {/* Floating Experience Badge */}
                <motion.div 
                  className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-2xl shadow-xl"
                  initial={{ opacity: 0, scale: 0.5, y: -20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  animate={floatingAnimation}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold">4+ Years</div>
                    <div className="text-sm opacity-90">of Excellence</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* How It Works Process with Animations */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="text-center max-w-3xl mx-auto mb-8">
              <motion.div 
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <Zap className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-blue-700 font-semibold">Simple Process</span>
              </motion.div>
              <motion.h2 
                className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                How BroHeal Works
              </motion.h2>
              <motion.p 
                className="text-gray-600 text-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                Experience premium wellness care in just four simple steps
              </motion.p>
            </div>
            
            <div className="relative">
              {/* Connection Line */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 transform -translate-y-1/2"></div>
              
              <motion.div 
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {processSteps.map((step, index) => (
                  <motion.div 
                    key={index} 
                    className="relative"
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <motion.div 
                          className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          {step.step}
                        </motion.div>
                      </div>
                      
                      <motion.div 
                        className="text-4xl text-blue-600 mb-6 flex justify-center"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                      >
                        {step.icon}
                      </motion.div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                        {step.title}
                      </h3>
                      
                      <p className="text-gray-600 text-center">
                        {step.description}
                      </p>
                      
                      <div className="mt-6 text-center">
                        <div className="inline-flex items-center text-blue-600 font-semibold text-sm">
                          <span>Learn more</span>
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
        </motion.div>
      </div>
    </motion.div>

    {/* Our Vision moved below */}
    <motion.div 
      className="mb-12"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <Globe className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Our Vision</h3>
          </div>
          <p className="text-gray-700">
            To become India's most trusted wellness platform, making therapeutic care accessible to every household while maintaining the highest standards of quality and safety.
          </p>
        </div>
      </div>
    </motion.div>

          {/* Enhanced Values Section with Animations */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="text-center max-w-3xl mx-auto mb-8">
              <motion.div 
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <Heart className="w-4 h-4 text-rose-600 mr-2" />
                <span className="text-blue-700 font-semibold">Our Philosophy</span>
              </motion.div>
              <motion.h2 
                className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Core Values That Define Us
              </motion.h2>
              <motion.p 
                className="text-gray-600 text-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                The principles that guide every interaction and service we provide
              </motion.p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-10 mb-8">
              {/* Interactive Values Display */}
              <div className="space-y-6">
                {values.map((value, index) => (
                  <motion.div 
                    key={index}
                    onMouseEnter={() => setActiveValue(index)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                      activeValue === index 
                        ? 'bg-gradient-to-r from-white to-gray-50 shadow-xl border-l-4 border-blue-500'
                        : 'bg-white hover:bg-gray-50 shadow-md'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: -10 }}
                  >
                    <div className="flex items-start">
                      <motion.div 
                        className={`p-3 rounded-xl bg-gradient-to-r ${value.color} mr-4`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="text-white">
                          {value.icon}
                        </div>
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {value.title}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {value.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {value.features.map((feature, fIndex) => (
                            <motion.span 
                              key={fIndex}
                              className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                              whileHover={{ scale: 1.1 }}
                            >
                              {feature}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Visual Value Display */}
              <motion.div 
                className="relative rounded-3xl p-8 flex items-center justify-center overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                key={activeValue}
                style={{ 
                  backgroundImage: `url(${values[activeValue].image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="relative z-10 text-center">
                  <div className="mb-8">
                    <motion.div 
                      className="text-6xl mb-4 text-blue-600"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {values[activeValue].icon}
                    </motion.div>
                    <motion.h3 
                      className="text-3xl font-semibold text-gray-900 mb-4"
                      key={activeValue}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {values[activeValue].title}
                    </motion.h3>
                    <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Key Features:</h4>
                    <ul className="space-y-3">
                      {values[activeValue].features.map((feature, index) => (
                        <motion.li 
                          key={index}
                          className="flex items-center"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
          {/* Testimonials Carousel with Animations */}
        

          {/* FAQ Section with Animations */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="text-center max-w-3xl mx-auto mb-8">
              <motion.div 
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <MessageSquare className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-blue-700 font-semibold">Got Questions?</span>
              </motion.div>
              <motion.h2 
                className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6"
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
                {faqs.map((faq, index) => (
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

          {/* Enhanced CTA Section with Animations */}
          
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default About
