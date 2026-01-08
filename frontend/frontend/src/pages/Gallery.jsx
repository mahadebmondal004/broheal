import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react'

const images = [
  { src: 'https://img.freepik.com/premium-photo/man-finds-deep-relaxation-as-he-receives-professional-back-massage-tranquil-spa-setting-men-enjoying-relaxing-spa-massage-ai-generated_538213-24717.jpg', category: 'Spa', caption: 'Relaxation Spa' },
  { src: 'https://media.istockphoto.com/id/529440469/photo/deep-tissue-massage.jpg?s=612x612&w=0&k=20&c=QluognArZKEc_COya3wC-Ekeu1pQ7jsj6rU5US2m76M=', category: 'Massage', caption: 'Deep Tissue Massage' },
  { src: 'https://img.freepik.com/premium-photo/relax-man-spa-back-massage-luxury-wellness-therapy-healing-skincare-therapist-touch-body-muscle-reflexology-sleeping-black-man-salon-bed-stress-relief-holistic-detox_590464-99658.jpg', category: 'Wellness', caption: 'Holistic Wellness' },
  { src: 'https://media.istockphoto.com/id/1066506450/photo/young-man-enjoying-on-a-massage-treatment-at-the-spa.jpg?s=612x612&w=0&k=20&c=x44fW1OUR9GCGTboqc5QcO78uN9eo8oZ2u03p1Xs1As=', category: 'Spa', caption: 'Aromatherapy' },
  { src: 'https://media.istockphoto.com/id/1452736789/photo/mature-man-helps-younger-man-verbalize-problems-in-therapy.jpg?s=612x612&w=0&k=20&c=sLU2wcEE-TLYYPjYXfXThoBcafbNGU3n7DUzPF1FOwc=', category: 'Therapy', caption: 'Counselling' },
  { src: 'https://img.freepik.com/premium-photo/relax-spa-man-with-back-massage-wellness-therapy-luxury-holistic-treatment-table-self-care-masseuse-sleeping-client-bed-body-health-muscle-peace-with-hotel-service_590464-435451.jpg?semt=ais_hybrid&w=740&q=80', category: 'Massage', caption: 'At-home Massage' },
  { src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSr07ua7YcumGfQrKsaRNH3_9G-HydGKZcEiA&s', category: 'Wellness', caption: 'Mind & Body' },
  { src: 'https://img.freepik.com/premium-photo/closeup-man-having-back-massage-spa-treatment-wellness-center_926199-1955400.jpg?w=360', category: 'Spa', caption: 'Premium Spa' }
]

const Gallery = () => {
  const [filter, setFilter] = useState('All')
  const [current, setCurrent] = useState(null)
  const filters = ['All', 'Spa', 'Massage', 'Therapy', 'Wellness']
  const filtered = useMemo(() => filter === 'All' ? images : images.filter(i => i.category === filter), [filter])

  useEffect(() => {
    const onKey = (e) => {
      if (current === null) return
      if (e.key === 'Escape') setCurrent(null)
      if (e.key === 'ArrowRight') setCurrent((idx) => (idx + 1) % filtered.length)
      if (e.key === 'ArrowLeft') setCurrent((idx) => (idx - 1 + filtered.length) % filtered.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, filtered.length])

  return (
    <div className="bg-white">
      <Navbar />
      <section className="relative h-[40vh] min-h-[280px] mt-16 overflow-hidden">
        <img src={images[0].src} alt="Gallery" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">Gallery</h1>
            <p className="text-white/90 mt-3 max-w-xl">Experience the ambiance and premium wellness service visuals.</p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Visual Gallery</div>
                <div className="text-sm text-gray-600">{filtered.length} items</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-2 bg-gray-50 border rounded-lg text-sm text-gray-600 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-lg text-sm border ${filter === f ? 'bg-gradient-to-r from-[#0A3D47] via-[#0A3D47] to-[#0A3D47] text-white border-[#0A3D47]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>{f}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
            {filtered.map((img, i) => (
              <motion.div key={i} className="mb-5 rounded-2xl overflow-hidden shadow hover:shadow-xl cursor-pointer relative" whileHover={{ y: -4 }} onClick={() => setCurrent(i)}>
                <img src={img.src} alt={img.caption || `Gallery ${i+1}`} className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="text-white text-sm font-medium">{img.caption}</div>
                  <div className="text-white/80 text-xs">{img.category}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {current !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <button className="absolute top-6 right-6 p-2 rounded-full bg-white/90 hover:bg-white" onClick={() => setCurrent(null)}>
            <X className="w-5 h-5" />
          </button>
          <button className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white" onClick={() => setCurrent((idx) => (idx - 1 + filtered.length) % filtered.length)}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white" onClick={() => setCurrent((idx) => (idx + 1) % filtered.length)}>
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="max-w-5xl w-[92%] rounded-2xl overflow-hidden shadow-2xl">
            <img src={filtered[current].src} alt={filtered[current].caption || 'Preview'} className="w-full h-auto object-contain" />
            <div className="bg-white px-4 py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">{filtered[current].caption}</div>
                <div className="text-sm text-gray-600">{filtered[current].category}</div>
              </div>
              <div className="text-sm text-gray-600">{current + 1} / {filtered.length}</div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default Gallery
