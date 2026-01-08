import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Users,
  CheckCircle,
  Award,
  Shield,
  Headphones,
  DollarSign,
  Sparkles,
  Heart,
  Zap,
  TrendingUp,
  ArrowRight,
  Play
} from "lucide-react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import api from "../services/api";

const Reveal = ({ children, className = "", style, delay = 0 }) => {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setV(true), delay);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [delay]);
  return (
    <div
      ref={ref}
      style={style}
      className={`${className} transition-all duration-700 ease-out ${
        v ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
      }`}
    >
      {children}
    </div>
  );
};

const Underline = ({ align = "center" }) => (
  <div
    className={`h-[2px] bg-gradient-to-r from-primary-500 to-primary-700 w-16 mt-1 ${
      align === "left" ? "mr-auto" : "mx-auto"
    }`}
  />
);

const FloatingElement = ({ children, className = "", delay = 0 }) => {
  return (
    <div
      className={`${className} animate-float`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};

const PulseBadge = ({ children }) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-primary-500 rounded-full animate-ping opacity-20"></div>
      <div className="relative">{children}</div>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [promoSlide, setPromoSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [hoveredService, setHoveredService] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const reviewsScrollRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);
  const [reviewsPaused, setReviewsPaused] = useState(false);

  const logoUrl = "https://i.ibb.co/23Sm0NDC/broheal.png";

  // Icon mapping for Why Choose Us
  const iconMap = {
    Shield,
    Award,
    CheckCircle,
    Headphones,
    DollarSign,
  };

  useEffect(() => {
    setContent(getDefaultContent());

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress((currentScroll / totalScroll) * 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadServices();
    loadReviews();
  }, []);

  useEffect(() => {
    if (content?.heroSlides?.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % content.heroSlides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [content]);

  useEffect(() => {
    const el = reviewsScrollRef.current;
    if (!el || reviewsPaused || dragging) return;
    const id = setInterval(() => {
      el.scrollLeft += 1;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth) {
        el.scrollLeft = 0;
      }
    }, 30);
    return () => clearInterval(id);
  }, [reviewsPaused, dragging, reviews]);

  const handleReviewsMouseDown = (e) => {
    const el = reviewsScrollRef.current;
    if (!el) return;
    setDragging(true);
    setReviewsPaused(true);
    setStartX(e.pageX);
    setScrollStart(el.scrollLeft);
    const onMove = (ev) => {
      if (!dragging) return;
      const dx = ev.pageX - startX;
      el.scrollLeft = scrollStart - dx;
    };
    const onUp = () => {
      setDragging(false);
      setReviewsPaused(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  useEffect(() => {
    if (content?.promoImages?.length > 1) {
      const interval = setInterval(() => {
        setPromoSlide((prev) => (prev + 1) % content.promoImages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [content]);

  const loadContent = async () => {
    setLoading(true);
    try {
      setContent(getDefaultContent());
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const response = await api.get("/public/services");
      const list = response.data.services || [];
      if (Array.isArray(list) && list.length) {
        setServices(list.slice(0, 4));
        return;
      }
    } catch {}

    try {
      const res2 = await api.get('/user/services');
      const list2 = res2.data.services || [];
      if (Array.isArray(list2) && list2.length) {
        setServices(list2.slice(0, 4));
        return;
      }
    } catch {}

    try {
      const res3 = await api.get('/services');
      const list3 = res3.data.services || [];
      if (Array.isArray(list3) && list3.length) {
        setServices(list3.slice(0, 4));
        return;
      }
    } catch {}
  };

  const loadReviews = async () => {
    try {
      // If running locally, prefer direct localhost URL without auth headers
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        try {
          const local = await fetch('http://localhost:5000/api/public/reviews?limit=12', {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
          });
          if (local.ok) {
            const data = await local.json();
            if (Array.isArray(data.reviews) && data.reviews.length) {
              setReviews(data.reviews);
              setAvgRating(data.avgRating || 0);
              return;
            }
          }
        } catch {}
      }

      // Try relative public route
      try {
        const res = await api.get('/public/reviews?limit=12');
        const list = res.data?.reviews || [];
        if (Array.isArray(list) && list.length) {
          setReviews(list);
          setAvgRating(res.data?.avgRating || 0);
          return;
        }
      } catch {}

      // Try alias relative route
      try {
        const res2 = await api.get('/reviews?limit=12');
        const list2 = res2.data?.reviews || [];
        if (Array.isArray(list2) && list2.length) {
          setReviews(list2);
          setAvgRating(res2.data?.avgRating || 0);
          return;
        }
      } catch {}

      // Try absolute public route
      try {
        const alt = await fetch('https://brohealfrontend.onrender.com/api/public/reviews?limit=12', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          cache: 'no-store'
        });
        if (alt.ok) {
          const data = await alt.json();
          if (Array.isArray(data.reviews) && data.reviews.length) {
            setReviews(data.reviews);
            setAvgRating(data.avgRating || 0);
            return;
          }
        }
      } catch {}

      // Try absolute alias route
      try {
        const alt2 = await fetch('https://brohealfrontend.onrender.com/api/reviews?limit=12', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          cache: 'no-store'
        });
        if (alt2.ok) {
          const data2 = await alt2.json();
          if (Array.isArray(data2.reviews) && data2.reviews.length) {
            setReviews(data2.reviews);
            setAvgRating(data2.avgRating || 0);
            return;
          }
        }
      } catch {}

    } catch (e) {
      // keep default placeholders if API fails
      setReviews([]);
      setAvgRating(5.0);
    }
  };

  const getDefaultContent = () => ({
    heroSlides: [
      {
        image:
          "https://img.freepik.com/premium-photo/very-relaxed-young-latin-man-getting-deep-tissue-massage-his-back-wellness-spa-clinic_926199-2011749.jpg",
        title: "Professional Therapy at Your Doorstep",
        subtitle:
          "Book certified therapists for massage, spa & wellness services",
        ctaText: "Book Now",
        ctaLink: "/login",
      },
      {
        image:
          "https://media.istockphoto.com/id/1660017139/photo/male-masseur-massaging-the-back-and-shoulders-of-a-man-lying-on-a-massage-table-in-a-relaxing.jpg?s=612x612&w=0&k=20&c=As4QyHS-58AWRs48_oVf92-3CIHTIyyGdvHiM0mWTGY=",
        title: "Certified Experts, Trusted Care",
        subtitle: "Experienced therapists delivering quality wellness at home",
        ctaText: "Get Started",
        ctaLink: "/login",
      },
      {
        image:
          "https://www.news-medical.net/images/news/ImageForNews_785646_17213228590606550.jpg",
        title: "Relax, Recover, Rejuvenate",
        subtitle: "Massage, spa, physiotherapy and more",
        ctaText: "Explore Services",
        ctaLink: "/login",
      },
      {
        image:
          "https://deax38zvkau9d.cloudfront.net/prod/assets/images/uploads/services/1667551053mens-spa-at-home.webp",
        title: "Your Wellness, Our Priority",
        subtitle: "Verified professionals and safe service",
        ctaText: "Join Now",
        ctaLink: "/login",
      },
    ],
    promoImages: [
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=1200",
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200",
      "https://images.unsplash.com/photo-1556228724-4b5c7bffcb3a?w=1200",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200",
      "https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=1200",
    ],
    whyChooseUs: [
      {
        icon: "Shield",
        title: "Verified Professionals",
        description: "All therapists are certified and background-verified",
        order: 1,
      },
      {
        icon: "Award",
        title: "Quality Service",
        description: "Top-rated professionals with 4.5+ ratings",
        order: 2,
      },
      {
        icon: "CheckCircle",
        title: "Easy Booking",
        description: "Simple 3-step booking process",
        order: 3,
      },
      {
        icon: "DollarSign",
        title: "Pay After Service",
        description:
          "Flexible payment options - pay only after service completion",
        order: 4,
      },
      {
        icon: "Headphones",
        title: "24/7 Support",
        description: "Round-the-clock customer assistance",
        order: 5,
      },
    ],
    about: {
      image:
        "https://images.jdmagicbox.com/v2/comp/service_catalogue/body-massage-centres-022pxx22.xx22.210531112408.s8d8-wknu66v.jpg",
      title: "About BroHeal",
      paragraphs: [
        "BroHeal connects you with certified therapists for massage, spa, and wellness at your doorstep.",
        
        "Book anytime, anywhere with trusted, background-verified professionals across India.",
        "We focus on safety, quality and customer satisfaction with 24/7 support.",
      ],
      stats: [
        { value: "50K+", label: "Happy Customers" },
        { value: "500+", label: "Certified Therapists" },
        { value: "25+", label: "Cities Across India" },
        { value: "4.8/5", label: "Customer Rating" },
      ],
      ctaText: "Join BroHeal Today",
      ctaLink: "/login",
    },
    howItWorks: [
      {
        step: 1,
        title: "Choose Service",
        description: "Select from our range of wellness services",
        order: 1,
      },
      {
        step: 2,
        title: "Book Therapist",
        description: "Choose your preferred therapist and time slot",
        order: 2,
      },
      {
        step: 3,
        title: "Relax & Enjoy",
        description: "Therapist delivers premium service at your location",
        order: 3,
      },
    ],
    testimonials: [
      {
        name: "Priya Sharma",
        role: "Regular Customer",
        image: "https://i.pravatar.cc/150?img=1",
        rating: 5,
        text: "BroHeal has been a lifesaver! The therapists are professional, punctual, and provide excellent service. Highly recommended!",
        order: 1,
      },
      {
        name: "Rahul Verma",
        role: "Corporate Professional",
        image: "https://i.pravatar.cc/150?img=5",
        rating: 5,
        text: "As someone with a busy schedule, BroHeal has made it so convenient to get quality massage therapy at home. The booking process is smooth and therapists are amazing.",
        order: 2,
      },
      {
        name: "Anita Patel",
        role: "Homemaker",
        image: "https://i.pravatar.cc/150?img=8",
        rating: 5,
        text: "I've tried multiple services and each time the experience has been exceptional. The therapists are well-trained and the service quality is consistently good.",
        order: 3,
      },
    ],
    footer: {
      description: "India's leading wellness platform.",
      copyright: "© 2024 BroHeal. All rights reserved.",
    },
  });

  const googleReviews = reviews.map(r => ({
    name: r.userName,
    initial: (r.userName || 'U').charAt(0).toUpperCase(),
    color: 'bg-primary-600',
    rating: r.rating,
    text: r.text,
    link: 'https://www.google.com/search?q=broheal+reviews'
  }));

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const handleQuickBook = () => {
    if (user && user.role === "user") {
      navigate("/booking/create");
    } else {
      navigate("/login");
    }
  };

  const heroSlides = content?.heroSlides || getDefaultContent().heroSlides;
  const promoImages = content?.promoImages || getDefaultContent().promoImages;
  const whyChooseUs = content?.whyChooseUs || getDefaultContent().whyChooseUs;
  const aboutData = content?.about || getDefaultContent().about;
  const howItWorks = content?.howItWorks || getDefaultContent().howItWorks;
  const testimonials = content?.testimonials || getDefaultContent().testimonials;
  const howImages = [
    "https://media.istockphoto.com/id/1452736789/photo/mature-man-helps-younger-man-verbalize-problems-in-therapy.jpg?s=612x612&w=0&k=20&c=sLU2wcEE-TLYYPjYXfXThoBcafbNGU3n7DUzPF1FOwc=",
    "https://img.freepik.com/premium-photo/closeup-man-having-back-massage-spa-treatment-wellness-center_926199-1955400.jpg?w=360",
    "https://img.freepik.com/premium-photo/relax-spa-man-with-back-massage-wellness-therapy-luxury-holistic-treatment-table-self-care-masseuse-sleeping-client-bed-body-health-muscle-peace-with-hotel-service_590464-435451.jpg?semt=ais_hybrid&w=740&q=80",
  ];
  const galleryImages = [
    "https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=1080",
    "https://img.freepik.com/premium-photo/closeup-man-having-back-massage-spa-treatment-wellness-center_926199-1955400.jpg?w=360",
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1080",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPXyjQY3xEIn_Y3NBBSj5TLSE9Qi62yb3Z5Q&s",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1080",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXIzo6V3PjieAMNrEb-xr2Spw3IoS8J5H5qw&s",
    "https://t3.ftcdn.net/jpg/16/98/04/40/240_F_1698044073_wWgbLjlU3nMYovinieTpy2ZCZCwjp8L9.jpg",
    "https://t3.ftcdn.net/jpg/00/81/80/88/240_F_81808805_UlBVlfw2J4HgmviomgSMYmMC8jTndlBy.jpg",
    "https://www.shutterstock.com/shutterstock/videos/3618082915/thumb/1.jpg?ip=x480",
  ];

  return (
    <div className="bg-white overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-700 z-50 transform origin-left transition-transform duration-300"
           style={{ transform: `scaleX(${scrollProgress / 100})` }}>
      </div>

      <Navbar />

      {/* Floating decorative elements */}
      <FloatingElement className="fixed top-20 left-10 hidden lg:block z-10">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full opacity-20"></div>
      </FloatingElement>
      <FloatingElement className="fixed bottom-20 right-10 hidden lg:block z-10" delay={0.5}>
        <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20"></div>
      </FloatingElement>

      {/* Hero Section */}
      <section id="home" className="relative h-[600px] overflow-hidden">
  {heroSlides.map((slide, index) => (
    <div
      key={index}
      className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
        index === currentSlide
          ? "opacity-100 scale-100"
          : "opacity-0 scale-105"
      }`}
    >
      <img
        src={slide.image}
        alt={slide.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 flex items-center bg-gradient-to-r from-black/30 to-transparent">
        <Reveal key={currentSlide} className="text-white px-4 md:px-10 w-full" delay={200}>
          <div className="max-w-xl md:max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              <span className="text-sm font-semibold tracking-wider text-yellow-300">
                #1 Wellness Platform
              </span>
            </div>
            <h1 className="text-left text-4xl md:text-6xl font-semibold mb-4 leading-tight">
              {slide.title}
            </h1>
            <Underline align="left" />
            <p className="text-left text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
              {slide.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate(slide.ctaLink || "/login")}
                className="group relative bg-gradient-to-r from-[#0A3D47] via-[#0A3D47] to-[#0A3D47] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-[#08343D] hover:via-[#08343D] hover:to-[#0A3D47] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl overflow-hidden"
              >
                <span className="relative z-10">{slide.ctaText}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#08343D] to-[#0A3D47] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                <ArrowRight className="inline ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button
                onClick={() => navigate("/services")}
                className="group border-2 border-[#0A3D47] text-[#0A3D47] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gradient-to-r hover:from-[#0A3D47] hover:via-[#0A3D47] hover:to-[#0A3D47] hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                <Play className="inline mr-2 w-5 h-5 group-hover:animate-pulse" />
                Explore Services
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  ))}

  {heroSlides.length > 1 && (
    <>
      <button
        onClick={() =>
          setCurrentSlide(
            (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
          )
        }
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group transition-all duration-300 z-20"
      >
        <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={() =>
          setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
        }
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group transition-all duration-300 z-20"
      >
        <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? "bg-white w-8 shadow-lg" 
                : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </>
  )}
</section>

      {/* Stats Section with Floating Animation */}
      <section className="py-8 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Reveal className="text-center group" delay={0}>
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full animate-pulse opacity-20"></div>
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🧖</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold tracking-wide text-gray-900 group-hover:text-primary-600 transition-colors">
                BODY TREATMENTS
              </h3>
              <p className="text-gray-600 mt-2 max-w-xs mx-auto group-hover:scale-105 transition-transform duration-300">
                Nourishing therapies to detox, refresh, and revive your body gently.
              </p>
            </Reveal>

            <Reveal className="text-center bg-white rounded-2xl shadow-lg border border-yellow-200 p-8 group hover:shadow-2xl transition-all duration-500 hover:border-primary-300" delay={120}>
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full animate-pulse opacity-20"></div>
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">💆</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold tracking-wide text-gray-900 group-hover:text-primary-600 transition-colors">
                RELAXING MASSAGE
              </h3>
              <p className="text-gray-600 mt-2 max-w-xs mx-auto group-hover:scale-105 transition-transform duration-300">
                Soothing massage techniques to ease stress and relax your muscles.
              </p>
            </Reveal>

            <Reveal className="text-center group" delay={240}>
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 rounded-full animate-pulse opacity-20"></div>
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🧴</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold tracking-wide text-gray-900 group-hover:text-primary-600 transition-colors">
                RELAXATION SPA
              </h3>
              <p className="text-gray-600 mt-2 max-w-xs mx-auto group-hover:scale-105 transition-transform duration-300">
                Peaceful spa environment designed to calm your mind and body.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Reveal className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl group" delay={0}>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/20 to-transparent z-10"></div>
              <img
                src={aboutData.image}
                alt="About BroHeal"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 border-2 border-white/20 rounded-2xl pointer-events-none"></div>
            </Reveal>

            <Reveal className="space-y-6 h-96 md:h-[500px] flex flex-col justify-center" delay={120}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-4xl font-semibold text-gray-900">
                  {aboutData.title}
                </h2>
              </div>
              <Underline align="left" />
              {aboutData.paragraphs?.map((para, index) => (
                <p
                  key={index}
                  className="text-gray-600 leading-relaxed text-lg hover:translate-x-2 transition-transform duration-300 cursor-default"
                >
                  {para}
                </p>
              ))}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                {aboutData.stats?.map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="text-3xl font-bold text-primary-600 mb-1 group-hover:scale-110 transition-transform duration-300">
                      {stat.value}
                    </div>
                    <div className="text-gray-600 text-sm font-medium group-hover:text-primary-700 transition-colors">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => navigate(aboutData.ctaLink || "/login")}
                  className="group relative bg-gradient-to-r from-[#0A3D47] via-[#0A3D47] to-[#0A3D47] text-white px-8 py-3 rounded-xl text-lg font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:from-[#08343D] hover:via-[#08343D] hover:to-[#0A3D47]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {aboutData.ctaText || "Get Started"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button
                  onClick={() => navigate("/login?role=therapist")}
                  className="group border-2 border-[#0A3D47] text-[#0A3D47] px-8 py-3 rounded-xl text-lg font-semibold hover:bg-gradient-to-r hover:from-[#0A3D47] hover:via-[#0A3D47] hover:to-[#0A3D47] hover:text-white transition-all duration-300 transform hover:scale-105"
                >
                  Join as Therapist
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/always-grey.png')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-center text-white">
            {[
              { value: "500+", label: "Satisfied Customers", icon: "https://cdn-icons-png.flaticon.com/512/2920/2920055.png", color: "from-yellow-400 to-orange-500" },
              { value: "43+", label: "Well Trained Experts", icon: "https://cdn-icons-png.flaticon.com/512/3043/3043627.png", color: "from-emerald-400 to-green-500" },
              { value: "75+", label: "Popular Procedures", icon: "https://cdn-icons-png.flaticon.com/512/869/869869.png", color: "from-blue-400 to-indigo-500" },
              { value: "120+", label: "BroHeal Treatments", icon: "https://cdn-icons-png.flaticon.com/512/9783/9783897.png", color: "from-purple-400 to-pink-500" }
            ].map((stat, index) => (
              <Reveal
                key={index}
                className="flex flex-col items-center group"
                delay={index * 120}
              >
                <div className="relative mb-6">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-500 blur-xl`}></div>
                  <div className="relative w-28 h-28 bg-white/10 backdrop-blur-sm rounded-full shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <div className="w-20 h-20 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center">
                      <img
                        src={stat.icon}
                        alt={stat.label}
                        className="w-12 h-12 opacity-90 group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>

                <h3 className="text-4xl font-light tracking-wide mb-2">
                  {stat.value.split('+')[0]}<span className="text-yellow-400 font-bold">+</span>
                </h3>
                <p className="text-lg opacity-90 group-hover:opacity-100 transition-opacity">{stat.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Reveal>
            <p className="text-primary-600 font-semibold tracking-wide mb-3 flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
              Our BroHeal Services
            </p>
          </Reveal>
          
          <Reveal delay={100}>
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
              Our Most Popular Services
            </h2>
            <Underline />
          </Reveal>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {[
              { src: "https://t4.ftcdn.net/jpg/01/37/19/57/240_F_137195770_7jrqMGg583pX9WeNMjEGg0MFLfEkAS48.jpg", name: "Aroma" },
              { src: "https://t4.ftcdn.net/jpg/08/01/38/63/240_F_801386368_cJVLHeArdt7I7K2yXKeWSQ0OCQPDE2No.jpg", name: "Swedish" },
              { src: "https://t3.ftcdn.net/jpg/09/39/17/84/240_F_939178453_EkjO9Cda6c4rohWKNEaV0MfmEBhA0K3i.jpg", name: "Finger Thai Massage" },
              { src: "https://t4.ftcdn.net/jpg/11/81/58/67/240_F_1181586761_KsNeR2y0kcZyv6hhGFDacNBEkjlA290v.jpg", name: "Balinese" },
              { src: "https://t3.ftcdn.net/jpg/18/23/69/08/240_F_1823690833_hhcuDt77qbojyiqs9J5MKqFENwKmklLk.jpg", name: "Detoxifying" },
              { src: "https://t3.ftcdn.net/jpg/00/81/80/88/240_F_81808805_UlBVlfw2J4HgmviomgSMYmMC8jTndlBy.jpg", name: "Wellness" },
              { src: "https://t3.ftcdn.net/jpg/12/67/89/20/240_F_1267892000_9KAWNkQ9wlHOuSxvNnmETgE0zxdjfEKv.jpg", name: "Thai Massage" },
              { src: "https://t3.ftcdn.net/jpg/16/98/04/40/240_F_1698044073_wWgbLjlU3nMYovinieTpy2ZCZCwjp8L9.jpg", name: "Lomi Lomi" }
            ].map((service, index) => (
              <Reveal
                key={index}
                className="flex flex-col items-center group"
                delay={index * 60}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <img
                    src={service.src}
                    alt={service.name}
                    className="w-32 h-32 rounded-full object-cover shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                  />
                </div>
                <h3 className="text-xl mt-4 font-medium text-gray-800 group-hover:text-primary-600 transition-colors duration-300">
                  {service.name}
                </h3>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <button
              onClick={() => navigate('/services')}
              className="group px-10 py-4 bg-gradient-to-r from-[#0A3D47] via-[#0A3D47] to-[#0A3D47] text-white rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:from-[#08343D] hover:via-[#08343D] hover:to-[#0A3D47] font-medium text-lg"
            >
              <span className="flex items-center gap-2">
                VIEW MORE SERVICES
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </Reveal>
        </div>
      </section>

      {/* Our Services Section */}
      <section id="services" className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <Reveal>
            <h2 className="text-4xl font-semibold text-center mb-4 text-gray-900">
              Our Services
            </h2>
            <Underline />
            <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto text-lg">
              Choose from our wide range of professional wellness services
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <Reveal
                key={service._id}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                delay={idx * 120}
                onMouseEnter={() => setHoveredService(service._id)}
                onMouseLeave={() => setHoveredService(null)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      service.image ||
                      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400"
                    }
                    alt={service.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      hoveredService === service._id ? 'scale-110' : 'scale-100'
                    }`}
                  />
                  {service.discountPrice && (
                    <PulseBadge>
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                        {Math.round(
                          (1 - service.discountPrice / service.price) * 100
                        )}
                        % OFF
                      </div>
                    </PulseBadge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="p-6">
                  <h3 className="font-semibold text-xl mb-3 text-gray-900 group-hover:text-primary-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-gray-700">
                        {service.rating || "4.8"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{service.totalBookings || "100"}+ </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration}min</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-primary-600">
                      ₹{service.price}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate("/login")}
                    className="group relative w-full bg-gradient-to-r from-[#0A3D47] via-[#0A3D47] to-[#0A3D47] text-white py-3 rounded-xl font-semibold overflow-hidden hover:from-[#08343D] hover:via-[#08343D] hover:to-[#0A3D47]"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Book Now
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#08343D] to-[#0A3D47] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <Reveal>
            <h2 className="text-4xl font-semibold text-center mb-4 text-gray-900">
              Gallery
            </h2>
            <Underline />
          </Reveal>
          
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
            {galleryImages.map((src, idx) => (
              <Reveal
                key={idx}
                className="mb-5 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] group"
                style={{
                  breakInside: "avoid",
                  transitionDelay: `${(idx % 6) * 80}ms`,
                }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={src}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </Reveal>
            ))}
          </div>
          
          <Reveal delay={200} className="text-center mt-8">
              <button
                onClick={() => navigate('/gallery')} className="group px-6 py-3 border-2 border-[#0A3D47] text-[#0A3D47] rounded-xl hover:bg-gradient-to-r hover:from-[#0A3D47] hover:via-[#0A3D47] hover:to-[#0A3D47] hover:text-white transition-all duration-300 transform hover:scale-105 font-medium"
              >
                <span className="flex items-center gap-2">
                  View Full Gallery
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
          </Reveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 py-12 px-4 md:px-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto border border-white/30 p-8 md:p-12 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-10 backdrop-blur-sm">
          <Reveal className="text-white max-w-lg" delay={0}>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
              <span className="text-sm font-semibold tracking-wider text-yellow-300 uppercase">
                Limited Time Offer
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold leading-snug">
              Your Journey{" "}
              <span className="text-yellow-300">to Pure Relaxation</span>
              <br />
              <span className="text-yellow-300">Starts Here.</span>
            </h2>
            <p className="mt-4 text-white/80 text-lg">
              Experience premium wellness services at your doorstep
            </p>

            <button 
              onClick={handleQuickBook} 
              className="group mt-8 bg-gradient-to-r from-[#0A3D47] via-[#0A3D47] to-[#0A3D47] text-white px-8 py-4 rounded-full font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:from-[#08343D] hover:via-[#08343D] hover:to-[#0A3D47]"
            >
              <span className="flex items-center gap-2">
                Book Your BroHeal Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
          </Reveal>

          <Reveal className="w-full md:w-1/2" delay={200}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-700/30 to-transparent rounded-2xl blur-xl"></div>
              <img
                src="https://images.pexels.com/photos/3865793/pexels-photo-3865793.jpeg"
                alt="Massage"
                className="rounded-2xl object-cover w-full h-64 md:h-80 shadow-2xl transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Why Choose BroHeal */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <Reveal>
            <h2 className="text-4xl font-semibold text-center mb-4 text-gray-900">
              Why Choose BroHeal?
            </h2>
            <Underline />
            <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto text-lg">
              Experience the best wellness services with verified therapists and transparent pricing
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {whyChooseUs.map((item, index) => {
              const IconComponent = iconMap[item.icon] || CheckCircle;
              return (
                <Reveal
                  key={index}
                  className="text-center group"
                  delay={index * 120}
                >
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-primary-500 group-hover:to-primary-600 transition-all duration-300">
                      <IconComponent className="w-10 h-10 text-primary-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-primary-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed group-hover:scale-105 transition-transform duration-300">
                    {item.description}
                  </p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <Reveal>
            <h2 className="text-4xl font-semibold text-center mb-4 text-gray-900">How It Works</h2>
            <Underline />
            <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto text-lg">Book your wellness service in just 3 simple steps</p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {howItWorks.map((step, idx) => (
              <Reveal key={step.step || idx} delay={idx * 120}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={howImages[idx % howImages.length]} 
                      alt={step.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute top-3 left-3 w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-white flex items-center justify-center text-xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {step.step || idx + 1}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-primary-600 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 group-hover:translate-x-1 transition-transform duration-300">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200} className="text-center mt-8">
            <button 
              onClick={() => navigate('/services')} 
              className="group px-6 py-3 bg-gradient-to-r from-[#0A3D47] via-[#0A3D47] to-[#0A3D47] text-white rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:from-[#08343D] hover:via-[#08343D] hover:to-[#0A3D47] font-semibold"
            >
              <span className="flex items-center gap-2">
                Start Booking
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </Reveal>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <Reveal>
            <h2 className="text-4xl font-semibold text-center mb-2 text-gray-900">Customer Reviews</h2>
            <Underline />
          </Reveal>
          
          <Reveal delay={100} className="mt-8">
            <div className="flex items-center gap-3 mb-4 justify-center">
              <div className="text-4xl font-bold text-gray-900 animate-pulse">
                {avgRating ? avgRating.toFixed(1) : '5.0'}
              </div>
              <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
              <span className="text-gray-600">Excellent</span>
            </div>
            {googleReviews.length === 0 ? (
              <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-2xl">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg">Be the first to share your experience!</p>
              </div>
            ) : (
              <div
                className="overflow-x-auto pb-2 cursor-grab active:cursor-grabbing"
                ref={reviewsScrollRef}
                onMouseDown={handleReviewsMouseDown}
                onMouseEnter={() => setReviewsPaused(true)}
                onMouseLeave={() => { setReviewsPaused(false); setDragging(false); }}
              >
                <div className="flex gap-4 min-h-[140px]">
                  {googleReviews.map((rev, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 w-72 flex-shrink-0 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-full ${rev.color} text-white flex items-center justify-center font-bold text-xl shadow-lg`}>
                          {rev.initial}
                        </div>
                        <div className="font-semibold text-gray-900 truncate">{rev.name}</div>
                      </div>
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-5 h-5 ${i < rev.rating ? 'fill-yellow-400 text-yellow-400 animate-pulse' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">
                        "{rev.text}"
                      </p>
                      <a href={rev.link} target="_blank" rel="noreferrer" className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
                        View on Google
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
      `}</style>

      <Footer content={content} />
    </div>
  );
};

export default LandingPage;
