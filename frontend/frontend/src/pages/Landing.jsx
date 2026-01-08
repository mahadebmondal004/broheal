import { Link } from 'react-router-dom';
import { Heart, Calendar, Shield, Star, Spa, Massage, Leaf, Clock, CheckCircle, MapPin, Users } from 'lucide-react';
import logoUrl from '../assets/broheal.png';

const Landing = () => {
    

    // Services data
    const bodyTreatments = [
        {
            id: 1,
            title: "BODY TREATMENTS",
            description: "Nourishing therapies to detox, refresh, and revive your body gently.",
            icon: <Spa className="w-10 h-10" />,
            gradient: "from-green-400 to-emerald-600",
            bgColor: "bg-gradient-to-br from-green-50 to-emerald-100"
        },
        {
            id: 2,
            title: "RELAXING MASSAGE",
            description: "Soothing massage techniques to ease stress and relax your muscles.",
            icon: <Massage className="w-10 h-10" />,
            gradient: "from-blue-400 to-indigo-600",
            bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100"
        },
        {
            id: 3,
            title: "RELAXATION SPA",
            description: "Peaceful spa environment designed to calm your mind and body.",
            icon: <Leaf className="w-10 h-10" />,
            gradient: "from-purple-400 to-pink-600",
            bgColor: "bg-gradient-to-br from-purple-50 to-pink-100"
        }
    ];

    // Testimonials
    const testimonials = [
        {
            id: 1,
            name: "Rajesh Kumar",
            role: "Software Engineer",
            content: "Best massage service I've ever experienced. The therapist was professional and on time!",
            rating: 5
        },
        {
            id: 2,
            name: "Priya Sharma",
            role: "Doctor",
            content: "After a long hospital shift, their relaxation spa is exactly what I needed. Highly recommended!",
            rating: 5
        },
        {
            id: 3,
            name: "Amit Patel",
            role: "Business Owner",
            content: "Pay after service feature is amazing. No risk, only quality service. Will book again!",
            rating: 4
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
            {/* Header */}
            <header className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logoUrl} alt="Bro Heal" className="h-12 w-auto" loading="eager" decoding="async" fetchpriority="high" />
                        <span className="text-2xl font-bold text-primary-600">Bro Heal</span>
                    </div>
                    <Link to="/login" className="btn-primary">
                        Login
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-16 md:py-24 text-center">
                <h1 className="text-5xl md:text-7xl font-semibold text-gray-900 mb-6 leading-tight">
                    Professional
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800"> Service </span>
                    Booking
                    <br />
                    <span className="text-4xl md:text-6xl">Made Simple</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                    Book certified therapists for home services. 
                    <span className="font-semibold text-primary-700"> Pay only after service completion.</span>
                    No advance payment required.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/login" className="btn-primary text-lg px-10 py-4 text-lg font-bold hover:scale-105 transition-transform">
                        Get Started Now
                    </Link>
                    <Link to="/login?role=therapist" className="btn-outline text-lg px-10 py-4 hover:scale-105 transition-transform">
                        Join as Therapist
                    </Link>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
                    <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                        <div className="text-3xl font-bold text-primary-700">10,000+</div>
                        <div className="text-gray-600 mt-2">Happy Customers</div>
                    </div>
                    <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                        <div className="text-3xl font-bold text-primary-700">4.8★</div>
                        <div className="text-gray-600 mt-2">Customer Rating</div>
                    </div>
                    <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                        <div className="text-3xl font-bold text-primary-700">500+</div>
                        <div className="text-gray-600 mt-2">Certified Therapists</div>
                    </div>
                    <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                        <div className="text-3xl font-bold text-primary-700">24/7</div>
                        <div className="text-gray-600 mt-2">Service Available</div>
                    </div>
                </div>
            </section>

            {/* Body Treatments Section */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">Premium Services</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Experience ultimate relaxation and rejuvenation with our specially curated treatments
                        </p>
                    </div>

                    {/* Services Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {bodyTreatments.map((service) => (
                            <div 
                                key={service.id} 
                                className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                            >
                                {/* Background Gradient */}
                                <div className={`absolute inset-0 ${service.bgColor} opacity-90 group-hover:opacity-100 transition-opacity duration-500`}></div>
                                
                                {/* Content */}
                                <div className="relative z-10 p-8 h-full flex flex-col">
                                    {/* Icon Container */}
                                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${service.gradient} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                                        <div className="text-white">
                                            {service.icon}
                                        </div>
                                    </div>
                                    
                                    {/* Title */}
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors duration-300">
                                        {service.title}
                                    </h3>
                                    
                                    {/* Description */}
                                    <p className="text-gray-600 flex-grow leading-relaxed mb-6">
                                        {service.description}
                                    </p>
                                    
                                    {/* Learn More Button */}
                                    <Link to="/login" className="self-start px-6 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black transition-all duration-300 transform group-hover:scale-105 shadow-md hover:shadow-lg inline-flex items-center">
                                        Learn More
                                        <span className="ml-2 inline-block transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                                    </Link>
                                    
                                    {/* Decorative Elements */}
                                    <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                                        <div className={`absolute inset-0 bg-gradient-to-r ${service.gradient} rounded-full blur-3xl`}></div>
                                    </div>
                                </div>
                                
                                {/* Hover Border Effect */}
                                <div className={`absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white/20 transition-all duration-500`}></div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom CTA */}
                    <div className="text-center mt-16">
                        <Link to="/login" className="px-10 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg inline-flex items-center">
                            Book Your Session Now
                            <span className="ml-3">→</span>
                        </Link>
                        <p className="text-gray-500 mt-4 text-sm">
                            *All treatments include complimentary consultation
                        </p>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12">Why Choose Bro Heal?</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[ 
                          {
                            icon: <Shield className="w-10 h-10" />, 
                            ring: 'from-primary-100 to-primary-200',
                            title: 'Pay After Service',
                            desc: "Pay only when you're satisfied with the service. No advance payment needed.",
                            altTitle: 'Transparent Pricing',
                            bullets: ['No advance fee', 'Pay after completion', 'Clear, upfront rates']
                          },
                          {
                            icon: <Star className="w-10 h-10" />, 
                            ring: 'from-green-100 to-green-200',
                            title: 'Certified Therapists',
                            desc: 'All therapists are verified and KYC approved for your safety.',
                            altTitle: 'Verified & Safe',
                            bullets: ['KYC verified', 'Background check', '4.8★ average rating']
                          },
                          {
                            icon: <Calendar className="w-10 h-10" />, 
                            ring: 'from-blue-100 to-blue-200',
                            title: 'Easy Booking',
                            desc: 'Book appointments in seconds with our simple booking flow.',
                            altTitle: 'Flexible Scheduling',
                            bullets: ['Same-day slots', 'Reschedule anytime', 'Reminders']
                          },
                          {
                            icon: <Heart className="w-10 h-10" />, 
                            ring: 'from-purple-100 to-purple-200',
                            title: 'Quality Service',
                            desc: 'Rated 4.8/5 by thousands of satisfied customers.',
                            altTitle: 'Premium Experience',
                            bullets: ['Top-rated experts', 'Personalized care', 'On-time guarantee']
                          }
                        ].map((c, i) => (
                          <div key={i} className="relative p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white text-left group">
                            {/* Default face */}
                            <div className="relative z-10 transition-opacity duration-300 group-hover:opacity-0">
                              <div className={`w-16 h-16 bg-gradient-to-br ${c.ring} rounded-2xl flex items-center justify-center mb-5 shadow-md`}>
                                <div className="text-gray-900">{c.icon}</div>
                              </div>
                              <h3 className="text-xl font-bold mb-3">{c.title}</h3>
                              <p className="text-gray-600">{c.desc}</p>
                            </div>
                            {/* Alt face shown on hover */}
                            <div className="absolute inset-0 p-8 rounded-3xl border border-gray-100 bg-white opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <h3 className="text-xl font-bold mb-4">{c.altTitle}</h3>
                              <ul className="space-y-2">
                                {c.bullets.map((b, idx) => (
                                  <li key={idx} className="flex items-center text-gray-700 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                    <span>{b}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-semibold text-center mb-16">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="text-center relative">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl">
                                1
                            </div>
                            <div className="absolute top-10 left-3/4 w-20 h-1 bg-primary-300 hidden md:block"></div>
                            <div className="bg-gradient-to-b from-primary-50 to-white p-8 rounded-3xl shadow-lg">
                                <Clock className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold mb-4">Choose Service</h3>
                                <p className="text-gray-600 text-lg">
                                    Browse our services and select the one you need
                                </p>
                            </div>
                        </div>

                        <div className="text-center relative">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl">
                                2
                            </div>
                            <div className="absolute top-10 left-3/4 w-20 h-1 bg-primary-300 hidden md:block"></div>
                            <div className="bg-gradient-to-b from-primary-50 to-white p-8 rounded-3xl shadow-lg">
                                <Users className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold mb-4">Book Therapist</h3>
                                <p className="text-gray-600 text-lg">
                                    Select date, time, and location for your service
                                </p>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl">
                                3
                            </div>
                            <div className="bg-gradient-to-b from-primary-50 to-white p-8 rounded-3xl shadow-lg">
                                <CheckCircle className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold mb-4">Pay After Service</h3>
                                <p className="text-gray-600 text-lg">
                                    Complete payment only after service completion
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-16">What Our Customers Say</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial) => (
                            <div key={testimonial.id} className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
                                <div className="flex items-center mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                <p className="text-gray-600 text-lg mb-6 italic">"{testimonial.content}"</p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                                        <Users className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                        <p className="text-gray-500">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-32 bg-gradient-to-r from-primary-600 to-primary-800">
                <div className="container mx-auto px-4 text-center text-white">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
                    <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-2xl mx-auto">
                        Join thousands of satisfied customers and experience premium service at your doorstep
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link 
                            to="/login" 
                            className="bg-white text-primary-700 hover:bg-gray-100 font-bold py-4 px-10 rounded-full text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                        >
                            Book Your First Service
                        </Link>
                        <Link 
                            to="/login?role=therapist" 
                            className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-4 px-10 rounded-full text-lg hover:scale-105 transition-all duration-300"
                        >
                            Become a Therapist
                        </Link>
                    </div>
                    <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-6 h-6" />
                            <span>No Advance Payment</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-6 h-6" />
                            <span>Certified Therapists</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-6 h-6" />
                            <span>24/7 Support</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-6 h-6" />
                            <span>100% Satisfaction</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                        <div className="flex items-center gap-3 mb-6 md:mb-0">
                            <img src={logoUrl} alt="Bro Heal" className="h-10 w-auto" />
                            <span className="text-2xl font-bold">Bro Heal</span>
                        </div>
                        <div className="flex gap-6">
                            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                                Terms of Service
                            </Link>
                            <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                                Contact Us
                            </Link>
                        </div>
                    </div>
                    <div className="text-center text-gray-400 border-t border-gray-800 pt-8">
                        <p>© 2024 Bro Heal. All rights reserved.</p>
                        <p className="mt-2 text-sm">Professional therapy services at your doorstep</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
