import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { Phone, Mail, MapPin, Headphones, Clock, Shield, ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

const Contact = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      await new Promise((r) => setTimeout(r, 800))
      toast.success('Message sent! Our team will reach out shortly.')
      reset()
    } catch (e) {
      toast.error('Failed to send. Please try again later.')
    }
  }

  return (
    <div className="bg-white">
      <Navbar />
      <section className="relative h-[50vh] min-h-[280px] mt-16 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600"
          alt="Contact"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">We’re here to help</h1>
            <p className="text-white/90 mt-3 max-w-xl">Reach out for bookings, support, partnerships, or general queries. Our team responds quickly.</p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-2xl border bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Call Us</div>
                    <div className="text-sm text-gray-600">+91 98450 67452</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Headphones className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Support</div>
                    <div className="text-sm text-gray-600">24/7 assistance</div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl border bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-sm text-gray-600">support@broheal.com</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Hours</div>
                    <div className="text-sm text-gray-600">Mon–Sat, 9 AM – 8 PM IST</div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 rounded-2xl p-6 md:p-8 border">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <input {...register('name', { required: true, minLength: 2 })} className="border rounded-lg px-4 py-3 w-full" placeholder="Full Name" />
                  {errors.name && <div className="text-red-600 text-sm mt-1">Please enter your name</div>}
                </div>
                <div>
                  <input {...register('phone', { required: true, pattern: /^[0-9]{10}$/ })} className="border rounded-lg px-4 py-3 w-full" placeholder="Phone (10 digits)" />
                  {errors.phone && <div className="text-red-600 text-sm mt-1">Enter a valid phone</div>}
                </div>
              </div>
              <input {...register('email', { required: true, pattern: /[^@\s]+@[^@\s]+\.[^@\s]+/ })} className="border rounded-lg px-4 py-3 mt-4 w-full" placeholder="Email" />
              {errors.email && <div className="text-red-600 text-sm mt-1">Enter a valid email</div>}
              <textarea {...register('message', { required: true, minLength: 10 })} className="border rounded-lg px-4 py-3 mt-4 w-full h-32" placeholder="How can we help?" />
              {errors.message && <div className="text-red-600 text-sm mt-1">Message should be at least 10 characters</div>}
              <button type="submit" disabled={isSubmitting} className="mt-4 px-6 py-3 bg-gradient-to-r from-[#0A3D47] via-[#0A3D47] to-[#0A3D47] text-white rounded-lg font-semibold hover:from-[#08343D] hover:via-[#08343D] hover:to-[#0A3D47] flex items-center gap-2">
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl border bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div className="font-semibold">Head Office</div>
                  <div className="text-sm text-gray-600">No 162, 5th Main, 2nd Cross, RT Nagar, Bangalore – 560032, Karnataka – India</div>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden">
                <iframe title="map" src="https://www.google.com/maps?q=No+162,+5th+Main,+2nd+Cross,+RT+Nagar,+Bangalore+560032&output=embed" className="w-full h-64 border-0"></iframe>
              </div>
            </div>

            <div className="p-6 rounded-2xl border bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div className="font-semibold">Why Contact BroHeal?</div>
                  <div className="text-sm text-gray-600">Bookings, therapist onboarding, partnership, media, or general support</div>
                </div>
              </div>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>Therapy bookings and scheduling</li>
                <li>Business and partnership inquiries</li>
                <li>Therapist onboarding and KYC</li>
                <li>Payment or refund assistance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Contact
