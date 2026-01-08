import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import api from '../services/api'
import { 
  Star, 
  Users, 
  Clock, 
  Sparkles, 
  Filter, 
  Search, 
  ChevronRight,
  Shield,
  CheckCircle,
  Heart,
  Award,
  TrendingUp,
  Zap,
  ArrowRight,
  Calendar,
  MapPin,
  X,
  Loader2
} from 'lucide-react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useRef } from 'react'

const Services = () => {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [hoveredService, setHoveredService] = useState(null)

  const heroRef = useRef(null)
  const servicesRef = useRef(null)
  const benefitsRef = useRef(null)
  const ctaRef = useRef(null)
  
  const isHeroInView = useInView(heroRef, { once: true })
  const isServicesInView = useInView(servicesRef, { once: true })
  const isBenefitsInView = useInView(benefitsRef, { once: true })
  const isCtaInView = useInView(ctaRef, { once: true })

  // Sample categories
  const categories = [
    { id: 'all', name: 'All Services', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'massage', name: 'Massage Therapy', icon: <Heart className="w-4 h-4" /> },
    { id: 'physio', name: 'Physiotherapy', icon: <Zap className="w-4 h-4" /> },
    { id: 'yoga', name: 'Yoga & Meditation', icon: <Award className="w-4 h-4" /> },
    { id: 'diet', name: 'Diet & Nutrition', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'mental', name: 'Mental Wellness', icon: <Shield className="w-4 h-4" /> }
  ]

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
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "backOut" }
    },
    hover: {
      scale: 1.05,
      rotateY: 5,
      rotateX: 5,
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

  const shimmerAnimation = {
    initial: { backgroundPosition: "-200% center" },
    animate: { 
      backgroundPosition: "200% center",
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/public/services')
        setServices(res.data.services || [])
      } catch (error) {
        console.error('Error loading services:', error)
        // Sample data
        setServices([
          {
            _id: '1',
            title: 'Deep Tissue Massage',
            description: 'Professional deep tissue massage to relieve muscle tension and promote relaxation.',
            price: 1999,
            duration: 60,
            rating: 4.9,
            totalBookings: 1240,
            image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            category: 'massage',
            features: ['Stress Relief', 'Muscle Recovery', 'Certified Therapists']
          },
          {
            _id: '2',
            title: 'Sports Physiotherapy',
            description: 'Specialized therapy for athletes and active individuals to enhance performance.',
            price: 2499,
            duration: 75,
            rating: 4.8,
            totalBookings: 890,
            image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            category: 'physio',
            features: ['Injury Prevention', 'Performance Enhancement', 'Personalized Plans']
          },
          {
            _id: '3',
            title: 'Yoga & Mindfulness',
            description: 'Guided yoga sessions combined with mindfulness practices for holistic wellness.',
            price: 1499,
            duration: 60,
            rating: 4.9,
            totalBookings: 1560,
            image: 'https://images.unsplash.com/photo-1545389336-cf0900408c1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            category: 'yoga',
            features: ['Flexibility', 'Stress Reduction', 'Breathing Techniques']
          },
          {
            _id: '4',
            title: 'Nutrition Counseling',
            description: 'Personalized diet plans and nutritional guidance for optimal health.',
            price: 1799,
            duration: 45,
            rating: 4.7,
            totalBookings: 720,
            image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            category: 'diet',
            features: ['Custom Meal Plans', 'Health Assessment', 'Progress Tracking']
          },
          {
            _id: '5',
            title: 'Stress Management',
            description: 'Therapeutic sessions to manage stress, anxiety, and improve mental wellbeing.',
            price: 1699,
            duration: 50,
            rating: 4.8,
            totalBookings: 980,
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            category: 'mental',
            features: ['Anxiety Relief', 'Coping Strategies', 'Mindfulness Training']
          },
          {
            _id: '6',
            title: 'Ayurvedic Therapy',
            description: 'Traditional Ayurvedic treatments for holistic healing and balance.',
            price: 2999,
            duration: 90,
            rating: 4.9,
            totalBookings: 540,
            image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            category: 'massage',
            features: ['Traditional Methods', 'Herbal Treatments', 'Detoxification']
          },
          {
            _id: '7',
            title: 'Prenatal Massage',
            description: 'Specialized massage therapy for expecting mothers to relieve discomfort.',
            price: 2299,
            duration: 60,
            rating: 4.9,
            totalBookings: 420,
            image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            category: 'massage',
            features: ['Pregnancy Safe', 'Pain Relief', 'Certified Specialists']
          },
          {
            _id: '8',
            title: 'Corporate Wellness',
            description: 'Wellness programs designed for corporate teams to boost productivity.',
            price: 3999,
            duration: 120,
            rating: 4.7,
            totalBookings: 320,
            image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            category: 'yoga',
            features: ['Team Sessions', 'Stress Management', 'Productivity Boost']
          }
        ])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredServices = services
    .filter(service => {
      const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'rating':
          return b.rating - a.rating
        case 'popular':
        default:
          return (b.totalBookings || 0) - (a.totalBookings || 0)
      }
    })

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <Navbar />
      
      {/* Enhanced Hero Section with Animations */}
      <section ref={heroRef} className="relative h-[70vh] min-h-[500px] mt-16 overflow-hidden">
        {/* Animated Background */}
        <motion.div 
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <img
            src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Wellness Services"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-purple-900/60 to-blue-900/80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        </motion.div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
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
              className="max-w-3xl"
              initial="hidden"
              animate={isHeroInView ? "visible" : "hidden"}
              variants={staggerContainer}
            >
              <motion.div 
                className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="w-4 h-4 text-yellow-300 mr-2" />
                <span className="text-white/90 text-sm font-medium">Premium Wellness Services</span>
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-6xl font-semibold text-white mb-6 leading-tight"
                variants={fadeInUp}
              >
                Transform Your
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
                  Wellness Journey
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-white/90 mb-10 max-w-2xl"
                variants={fadeInUp}
              >
                Discover premium therapeutic services delivered to your doorstep by certified professionals. 
                Experience healing, relaxation, and rejuvenation on your terms.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                variants={fadeInUp}
              >
                <motion.div 
                  className="flex-1 relative"
                  whileHover={{ scale: 1.02 }}
                >
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search services (massage, yoga, therapy...)"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="w-5 h-5 text-white/60 hover:text-white transition-colors" />
                    </motion.button>
                  )}
                </motion.div>
                
                <motion.button 
                  className="group px-8 py-4 bg-gradient-to-r from-[#0A3D47] via-[#0A3D47] to-[#0A3D47] hover:from-[#08343D] hover:via-[#08343D] hover:to-[#0A3D47] text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Explore All Services</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Floating Stats with Animation */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 transform translate-y-1/2"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
         
        </motion.div>
      </section>

      {/* Main Content */}
      <section ref={servicesRef} className="pt-10 pb-10">
        <div className="container mx-auto px-4 md:px-8">
          {/* Categories Filter with Animation */}
          <motion.div 
            className="mb-8"
            initial="hidden"
            animate={isServicesInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
                  variants={fadeInUp}
                >
                  Our Premium Services
                </motion.h2>
                <motion.p 
                  className="text-gray-600"
                  variants={fadeInUp}
                >
                  Choose from our curated collection of wellness services
                </motion.p>
              </div>
              
              <motion.div 
                className="flex items-center gap-4"
                variants={fadeInUp}
              >
                <div className="flex items-center gap-2 text-gray-600">
                  <Filter className="w-5 h-5" />
                  <span className="font-medium">Sort by:</span>
                </div>
                <select 
                  className="px-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rating</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </motion.div>
            </div>
            
            {/* Category Tabs with Animation */}
            <motion.div 
              className="flex overflow-x-auto pb-4 gap-2 scrollbar-hide"
              variants={staggerContainer}
            >
              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.05 }}
                >
                  <span className={selectedCategory === category.id ? 'text-white' : 'text-blue-500'}>
                    {category.icon}
                  </span>
                  <span className="font-medium">{category.name}</span>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>

          {/* Services Grid with Animations */}
          {loading ? (
            <motion.div 
              className="py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex flex-col items-center justify-center">
                <motion.div 
                  className="relative mb-6"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-16 h-16 text-blue-500" />
                </motion.div>
                <motion.p 
                  className="text-gray-600"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Loading wellness services...
                </motion.p>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Results Info */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={`${searchTerm}-${selectedCategory}`}
                  className="mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <p className="text-gray-600">
                    Showing <span className="font-bold text-gray-900">{filteredServices.length}</span> services
                    {searchTerm && (
                      <span> for "<span className="font-bold text-gray-900">{searchTerm}</span>"</span>
                    )}
                    {selectedCategory !== 'all' && (
                      <span> in <span className="font-bold text-gray-900">
                        {categories.find(c => c.id === selectedCategory)?.name}
                      </span></span>
                    )}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Services Grid */}
              <AnimatePresence mode="wait">
                {filteredServices.length === 0 ? (
                  <motion.div 
                    key="empty"
                    className="text-center py-20"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <motion.div 
                      className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl mb-6"
                      animate={pulseAnimation}
                    >
                      <Search className="w-10 h-10 text-blue-600" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No services found</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      We couldn't find any services matching your search. Try different keywords or browse all categories.
                    </p>
                    <motion.button 
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedCategory('all')
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-[#0A3D47] via-[#0A3D47] to-[#0A3D47] hover:from-[#08343D] hover:via-[#08343D] hover:to-[#0A3D47] text-white font-semibold rounded-xl transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View All Services
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="services"
                    className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {filteredServices.map((service, index) => (
                      <motion.div
                        key={service._id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        onMouseEnter={() => setHoveredService(service._id)}
                        onMouseLeave={() => setHoveredService(null)}
                        transition={{ delay: index * 0.1 }}
                        className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
                      >
                        {/* Shimmer Effect on Hover */}
                        {hoveredService === service._id && (
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent z-10"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 0.7 }}
                          />
                        )}
                        
                        {/* Service Image with Parallax Effect */}
                        <div className="relative h-44 overflow-hidden">
                          <motion.img 
                            src={service.image} 
                            alt={service.title} 
                            className="w-full h-full object-cover"
                            animate={hoveredService === service._id ? 
                              { scale: 1.1, rotate: 0.5 } : 
                              { scale: 1, rotate: 0 }
                            }
                            transition={{ duration: 0.5 }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          
                          {/* Category Badge */}
                          <motion.div 
                            className="absolute top-4 left-4"
                            whileHover={{ scale: 1.1 }}
                          >
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold rounded-full">
                              {categories.find(c => c.id === service.category)?.name || 'Wellness'}
                            </span>
                          </motion.div>
                          
                          {/* Rating Badge */}
                          <motion.div 
                            className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full"
                            whileHover={{ scale: 1.1 }}
                          >
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold text-gray-900">{service.rating}</span>
                          </motion.div>
                          
                          {/* Popular Badge */}
                          {service.totalBookings > 1000 && (
                            <motion.div 
                              className="absolute bottom-4 left-4"
                              animate={floatingAnimation}
                            >
                              <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Popular Choice
                              </span>
                            </motion.div>
                          )}
                        </div>
                        
                        {/* Service Content */}
                        <div className="p-5">
                          <div className="mb-4">
                            <motion.h3 
                              className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors"
                              animate={hoveredService === service._id ? 
                                { x: 5 } : 
                                { x: 0 }
                              }
                            >
                              {service.title}
                            </motion.h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {service.description}
                            </p>
                          </div>
                          
                          {/* Features */}
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {(service.features || []).slice(0, 2).map((feature, fIndex) => (
                                <motion.span 
                                  key={fIndex}
                                  className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.1 + fIndex * 0.1 }}
                                  whileHover={{ scale: 1.1 }}
                                >
                                  {feature}
                                </motion.span>
                              ))}
                            </div>
                          </div>
                          
                          {/* Stats */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <motion.div 
                                className="flex items-center gap-1"
                                whileHover={{ scale: 1.1 }}
                              >
                                <Users className="w-4 h-4" />
                                <span className="font-medium">{service.totalBookings}+</span>
                              </motion.div>
                              <motion.div 
                                className="flex items-center gap-1"
                                whileHover={{ scale: 1.1 }}
                              >
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">{service.duration}min</span>
                              </motion.div>
                            </div>
                            
                            <motion.div 
                              className="flex items-center gap-1"
                              whileHover={{ scale: 1.1 }}
                            >
                              <Shield className="w-4 h-4 text-green-500" />
                              <span className="text-xs text-gray-500">Verified</span>
                            </motion.div>
                          </div>
                          
                          {/* Price & Action */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div>
                              <motion.div 
                                className="text-2xl font-bold text-gray-900"
                                animate={hoveredService === service._id ? 
                                  { scale: 1.1 } : 
                                  { scale: 1 }
                                }
                              >
                                ₹{service.price}
                              </motion.div>
                              <div className="text-sm text-gray-500">per session</div>
                            </div>
                            
                            <motion.button 
                            className="group relative px-6 py-3 bg-gradient-to-r from-[#0A3D47] via-[#0A3D47] to-[#0A3D47] hover:from-[#08343D] hover:via-[#08343D] hover:to-[#0A3D47] text-white font-semibold rounded-xl overflow-hidden"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => navigate('/booking/create', { state: { serviceId: service._id } })}
                            >
                              <span className="relative z-10 flex items-center">
                                Book Now
                                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </span>
                              <motion.div 
                                className="absolute inset-0 bg-gradient-to-r from-[#08343D] to-[#0A3D47]"
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                              />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Benefits Section with Animation */}
          <motion.div 
            ref={benefitsRef}
            className="mt-32"
            initial="hidden"
            animate={isBenefitsInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.div 
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4"
                variants={fadeInUp}
              >
                <Shield className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-blue-700 font-semibold">Why Choose BroHeal</span>
              </motion.div>
              <motion.h2 
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                variants={fadeInUp}
              >
                Experience The Difference
              </motion.h2>
              <motion.p 
                className="text-gray-600 text-lg"
                variants={fadeInUp}
              >
                Premium wellness services with unmatched quality and convenience
              </motion.p>
            </div>
            
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              variants={staggerContainer}
            >
              {[
                {
                  icon: <Shield className="w-8 h-8" />,
                  title: '100% Verified Professionals',
                  description: 'Every therapist undergoes rigorous background checks and certification verification.'
                },
                {
                  icon: <Calendar className="w-8 h-8" />,
                  title: 'Flexible Scheduling',
                  description: 'Book at your convenience with 24/7 availability and easy rescheduling.'
                },
                {
                  icon: <Zap className="w-8 h-8" />,
                  title: 'Same-Day Service',
                  description: 'Get matched with a therapist and book sessions on the same day.'
                }
              ].map((benefit, index) => (
                <motion.div 
                  key={index}
                  className="bg-gradient-to-b from-white to-gray-50 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                  variants={fadeInUp}
                  whileHover={{ 
                    y: -10,
                    transition: { duration: 0.3 }
                  }}
                >
                  <motion.div 
                    className="inline-flex p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl mb-6"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-blue-600">{benefit.icon}</div>
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* CTA Section with Animation */}
          <motion.div 
            ref={ctaRef}
            className="mt-32 relative overflow-hidden rounded-4xl"
            initial="hidden"
            animate={isCtaInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            {/* Animated Gradient Background */}
            <motion.div 
              className="absolute inset-0"
              animate={shimmerAnimation}
              style={{
                background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 25%, #2563eb 50%, #7c3aed 75%, #2563eb 100%)',
                backgroundSize: '200% auto'
              }}
            />
            
            {/* Floating Elements */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-64 h-64 bg-white/10 rounded-full"
                  initial={{ 
                    x: Math.random() * 100 + 'vw',
                    y: Math.random() * 100 + 'vh',
                    scale: 0
                  }}
                  animate={{ 
                    x: [null, '-50vw'],
                    y: [null, '-50vh'],
                    scale: [0, 1, 0],
                    opacity: [0, 0.3, 0]
                  }}
                  transition={{
                    duration: Math.random() * 10 + 10,
                    repeat: Infinity,
                    delay: Math.random() * 5
                  }}
                />
              ))}
            </div>
            
            
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Services
