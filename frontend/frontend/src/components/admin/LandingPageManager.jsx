import { useState, useEffect } from 'react';
import {
    Save, Plus, Trash2, GripVertical, Eye, X,
    Image as ImageIcon, FileText, Star, DollarSign,
    Shield, Award, CheckCircle, Headphones
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import ImageUploader from '../common/ImageUploader';

const LandingPageManager = () => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('hero');
    const [draggedItem, setDraggedItem] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const iconOptions = [
        { name: 'Shield', icon: Shield },
        { name: 'Award', icon: Award },
        { name: 'CheckCircle', icon: CheckCircle },
        { name: 'DollarSign', icon: DollarSign },
        { name: 'Headphones', icon: Headphones }
    ];

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/landing-content');
            setContent(response.data.content);
        } catch (error) {
            toast.error('Failed to load landing page content');
        } finally {
            setLoading(false);
        }
    };

    const saveContent = async () => {
        try {
            setSaving(true);
            await api.put('/admin/landing-content', content);
            toast.success('Landing page updated successfully!');
        } catch (error) {
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    // Drag and Drop Functions
    const handleDragStart = (index, type) => {
        setDraggedItem({ index, type });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (index, type) => {
        if (!draggedItem || draggedItem.type !== type) return;

        const items = [...content[type]];
        const draggedItemContent = items[draggedItem.index];

        items.splice(draggedItem.index, 1);
        items.splice(index, 0, draggedItemContent);

        // Update order numbers
        items.forEach((item, i) => {
            item.order = i + 1;
        });

        setContent({ ...content, [type]: items });
        setDraggedItem(null);
        toast.success('Order updated!');
    };

    // Hero Slides Functions
    const addHeroSlide = () => {
        setContent({
            ...content,
            heroSlides: [
                ...content.heroSlides,
                {
                    image: '',
                    title: '',
                    subtitle: '',
                    ctaText: 'Book Now',
                    ctaLink: '/login',
                    isActive: true,
                    order: content.heroSlides.length + 1
                }
            ]
        });
    };

    const updateHeroSlide = (index, field, value) => {
        const updated = [...content.heroSlides];
        updated[index][field] = value;
        setContent({ ...content, heroSlides: updated });
    };

    const deleteHeroSlide = (index) => {
        if (confirm('Delete this slide?')) {
            const updated = content.heroSlides.filter((_, i) => i !== index);
            setContent({ ...content, heroSlides: updated });
        }
    };

    // Why Choose Us Functions
    const addWhyChooseItem = () => {
        setContent({
            ...content,
            whyChooseUs: [
                ...content.whyChooseUs,
                {
                    icon: 'CheckCircle',
                    title: '',
                    description: '',
                    isActive: true,
                    order: content.whyChooseUs.length + 1
                }
            ]
        });
    };

    const updateWhyChooseItem = (index, field, value) => {
        const updated = [...content.whyChooseUs];
        updated[index][field] = value;
        setContent({ ...content, whyChooseUs: updated });
    };

    const deleteWhyChooseItem = (index) => {
        if (confirm('Delete this item?')) {
            const updated = content.whyChooseUs.filter((_, i) => i !== index);
            setContent({ ...content, whyChooseUs: updated });
        }
    };

    // About Section Functions
    const updateAbout = (field, value) => {
        setContent({
            ...content,
            about: { ...content.about, [field]: value }
        });
    };

    const updateAboutParagraph = (index, value) => {
        const updated = [...content.about.paragraphs];
        updated[index] = value;
        setContent({
            ...content,
            about: { ...content.about, paragraphs: updated }
        });
    };

    const addAboutParagraph = () => {
        setContent({
            ...content,
            about: {
                ...content.about,
                paragraphs: [...content.about.paragraphs, '']
            }
        });
    };

    const updateAboutStat = (index, field, value) => {
        const updated = [...content.about.stats];
        updated[index][field] = value;
        setContent({
            ...content,
            about: { ...content.about, stats: updated }
        });
    };

    // How It Works Functions
    const updateHowItWorks = (index, field, value) => {
        const updated = [...content.howItWorks];
        updated[index][field] = value;
        setContent({ ...content, howItWorks: updated });
    };

    // Testimonials Functions
    const addTestimonial = () => {
        setContent({
            ...content,
            testimonials: [
                ...content.testimonials,
                {
                    name: '',
                    role: '',
                    image: '',
                    rating: 5,
                    text: '',
                    isActive: true,
                    order: content.testimonials.length + 1
                }
            ]
        });
    };

    const updateTestimonial = (index, field, value) => {
        const updated = [...content.testimonials];
        updated[index][field] = value;
        setContent({ ...content, testimonials: updated });
    };

    const deleteTestimonial = (index) => {
        if (confirm('Delete this testimonial?')) {
            const updated = content.testimonials.filter((_, i) => i !== index);
            setContent({ ...content, testimonials: updated });
        }
    };

    // Footer Functions
    const updateFooter = (field, value) => {
        setContent({
            ...content,
            footer: { ...content.footer, [field]: value }
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mr-2"></div>
                Loading content...
            </div>
        );
    }

    if (!content) {
        return <div className="p-6 text-gray-500 dark:text-gray-400">Failed to load content</div>;
    }

    return (
        <div className="p-6 bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-sm animate-fade-in text-gray-900 dark:text-white pb-24">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Landing Page Manager</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Manage all landing page content</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowPreview(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                        <Eye className="w-5 h-5" />
                        Preview
                    </button>
                    <button
                        onClick={saveContent}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-medium disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-white/10 mb-6">
                <div className="flex gap-4 overflow-x-auto no-scrollbar">
                    {['hero', 'why-choose', 'about', 'how-it-works', 'testimonials', 'footer'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hero Slides Editor */}
            {activeTab === 'hero' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Hero Slides</h3>
                        <button onClick={addHeroSlide} className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm font-medium">
                            <Plus className="w-4 h-4" />
                            Add Slide
                        </button>
                    </div>

                    {content.heroSlides.map((slide, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm space-y-4 cursor-move hover:shadow-md transition-shadow"
                            draggable
                            onDragStart={() => handleDragStart(index, 'heroSlides')}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(index, 'heroSlides')}
                        >
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                                <div className="flex items-center gap-2">
                                    <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Slide {index + 1}</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={slide.isActive}
                                            onChange={(e) => updateHeroSlide(index, 'isActive', e.target.checked)}
                                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-800 dark:border-white/10"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                                    </label>
                                    <button
                                        onClick={() => deleteHeroSlide(index)}
                                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <ImageUploader
                                currentImage={slide.image}
                                onImageUploaded={(url) => updateHeroSlide(index, 'image', url)}
                                label="Hero Image"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={slide.title}
                                        onChange={(e) => updateHeroSlide(index, 'title', e.target.value)}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
                                    <input
                                        type="text"
                                        value={slide.subtitle}
                                        onChange={(e) => updateHeroSlide(index, 'subtitle', e.target.value)}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CTA Button Text</label>
                                    <input
                                        type="text"
                                        value={slide.ctaText}
                                        onChange={(e) => updateHeroSlide(index, 'ctaText', e.target.value)}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CTA Link</label>
                                    <input
                                        type="text"
                                        value={slide.ctaLink}
                                        onChange={(e) => updateHeroSlide(index, 'ctaLink', e.target.value)}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        placeholder="/login"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Why Choose Us Editor */}
            {activeTab === 'why-choose' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Why Choose Us</h3>
                        <button onClick={addWhyChooseItem} className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm font-medium">
                            <Plus className="w-4 h-4" />
                            Add Benefit
                        </button>
                    </div>

                    {content.whyChooseUs.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm space-y-4 cursor-move hover:shadow-md transition-shadow"
                            draggable
                            onDragStart={() => handleDragStart(index, 'whyChooseUs')}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(index, 'whyChooseUs')}
                        >
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                                <div className="flex items-center gap-2">
                                    <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Benefit {index + 1}</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={item.isActive}
                                            onChange={(e) => updateWhyChooseItem(index, 'isActive', e.target.checked)}
                                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-800 dark:border-white/10"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                                    </label>
                                    <button
                                        onClick={() => deleteWhyChooseItem(index)}
                                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {iconOptions.map(({ name, icon: Icon }) => (
                                        <button
                                            key={name}
                                            type="button"
                                            onClick={() => updateWhyChooseItem(index, 'icon', name)}
                                            className={`p-3 border rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${item.icon === name
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                                                : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400'
                                                }`}
                                        >
                                            <Icon className="w-6 h-6 mx-auto" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => updateWhyChooseItem(index, 'title', e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    value={item.description}
                                    onChange={(e) => updateWhyChooseItem(index, 'description', e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    rows="2"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* About Section Editor */}
            {activeTab === 'about' && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">About Section</h3>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
                        <ImageUploader
                            currentImage={content.about.image}
                            onImageUploaded={(url) => updateAbout('image', url)}
                            label="About Section Image"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                            <input
                                type="text"
                                value={content.about.title}
                                onChange={(e) => updateAbout('title', e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Paragraphs</label>
                                <button onClick={addAboutParagraph} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                                    + Add Paragraph
                                </button>
                            </div>
                            {content.about.paragraphs.map((para, index) => (
                                <textarea
                                    key={index}
                                    value={para}
                                    onChange={(e) => updateAboutParagraph(index, e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white mb-2"
                                    rows="3"
                                />
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stats</label>
                            {content.about.stats.map((stat, index) => (
                                <div key={index} className="grid grid-cols-2 gap-3 mb-2">
                                    <input
                                        type="text"
                                        value={stat.value}
                                        onChange={(e) => updateAboutStat(index, 'value', e.target.value)}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        placeholder="50K+"
                                    />
                                    <input
                                        type="text"
                                        value={stat.label}
                                        onChange={(e) => updateAboutStat(index, 'label', e.target.value)}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        placeholder="Happy Customers"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CTA Text</label>
                                <input
                                    type="text"
                                    value={content.about.ctaText}
                                    onChange={(e) => updateAbout('ctaText', e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CTA Link</label>
                                <input
                                    type="text"
                                    value={content.about.ctaLink}
                                    onChange={(e) => updateAbout('ctaLink', e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* How It Works Editor */}
            {activeTab === 'how-it-works' && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">How It Works</h3>

                    {content.howItWorks.map((step, index) => (
                        <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white">Step {step.step}</h4>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={step.title}
                                    onChange={(e) => updateHowItWorks(index, 'title', e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    value={step.description}
                                    onChange={(e) => updateHowItWorks(index, 'description', e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    rows="2"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Testimonials Editor */}
            {activeTab === 'testimonials' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Testimonials</h3>
                        <button onClick={addTestimonial} className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm font-medium">
                            <Plus className="w-4 h-4" />
                            Add Testimonial
                        </button>
                    </div>

                    {content.testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm space-y-4 cursor-move hover:shadow-md transition-shadow"
                            draggable
                            onDragStart={() => handleDragStart(index, 'testimonials')}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(index, 'testimonials')}
                        >
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                                <div className="flex items-center gap-2">
                                    <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Testimonial {index + 1}</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={testimonial.isActive}
                                            onChange={(e) => updateTestimonial(index, 'isActive', e.target.checked)}
                                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-800 dark:border-white/10"
                                        />
                                        <span className="text-sm">Active</span>
                                    </label>
                                    <button
                                        onClick={() => deleteTestimonial(index)}
                                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={testimonial.name}
                                        onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                    <input
                                        type="text"
                                        value={testimonial.role}
                                        onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                                    <select
                                        value={testimonial.rating}
                                        onChange={(e) => updateTestimonial(index, 'rating', parseInt(e.target.value))}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    >
                                        {[5, 4, 3, 2, 1].map(r => (
                                            <option key={r} value={r}>{r} Stars</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <ImageUploader
                                currentImage={testimonial.image}
                                onImageUploaded={(url) => updateTestimonial(index, 'image', url)}
                                label="Customer Photo"
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Testimonial Text</label>
                                <textarea
                                    value={testimonial.text}
                                    onChange={(e) => updateTestimonial(index, 'text', e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    rows="3"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer Editor */}
            {activeTab === 'footer' && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Footer</h3>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea
                                value={content.footer.description}
                                onChange={(e) => updateFooter('description', e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                rows="2"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Play Store Link</label>
                                <input
                                    type="text"
                                    value={content.footer.playStoreLink}
                                    onChange={(e) => updateFooter('playStoreLink', e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    placeholder="#"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">App Store Link</label>
                                <input
                                    type="text"
                                    value={content.footer.appStoreLink}
                                    onChange={(e) => updateFooter('appStoreLink', e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    placeholder="#"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Copyright Text</label>
                            <input
                                type="text"
                                value={content.footer.copyright}
                                onChange={(e) => updateFooter('copyright', e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Save Button (Sticky) */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-gray-200 dark:border-white/10 p-4 flex justify-end gap-3 z-10 transition-all">
                <button
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-2 px-6 py-2 border border-gray-300 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-medium transition-colors"
                >
                    <Eye className="w-5 h-5" />
                    Preview
                </button>
                <button
                    onClick={saveContent}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-medium disabled:opacity-50"
                >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200 dark:border-white/10">
                        <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-slate-900">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Landing Page Preview</h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-500 dark:text-gray-400"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto flex-1 bg-gray-50 dark:bg-black/20">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-gray-200 dark:border-white/5 shadow-sm">
                                <p className="text-gray-600 dark:text-gray-300 mb-2 font-medium">Preview Mode</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Navigate to the main landing page to see your changes applied live.</p>
                                <a
                                    href="/"
                                    target="_blank"
                                    className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-500/20"
                                >
                                    <Eye className="w-4 h-4" />
                                    Open Landing Page
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPageManager;
