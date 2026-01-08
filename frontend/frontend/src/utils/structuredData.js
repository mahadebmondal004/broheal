// LocalBusiness Schema for SEO
export const getBusinessSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'Bro Heal',
    'image': 'https://i.ibb.co/23Sm0NDC/broheal.png',
    'description': 'Professional service booking platform for home healthcare and wellness services',
    'address': {
        '@type': 'PostalAddress',
        'addressCountry': 'IN',
        'addressLocality': 'India'
    },
    'geo': {
        '@type': 'GeoCoordinates',
        'latitude': 12.9716,
        'longitude': 77.5946
    },
    'url': 'https://broheal.com',
    'telephone': '+91-XXXXXXXXXX',
    'priceRange': '₹₹',
    'openingHoursSpecification': [
        {
            '@type': 'OpeningHoursSpecification',
            'dayOfWeek': [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday'
            ],
            'opens': '00:00',
            'closes': '23:59'
        }
    ],
    'sameAs': [
        'https://www.facebook.com/broheal',
        'https://www.instagram.com/broheal',
        'https://twitter.com/broheal'
    ]
});

// Service Schema
export const getServiceSchema = (service) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    'serviceType': service.title,
    'provider': {
        '@type': 'LocalBusiness',
        'name': 'Bro Heal'
    },
    'areaServed': {
        '@type': 'Country',
        'name': 'India'
    },
    'hasOfferCatalog': {
        '@type': 'OfferCatalog',
        'name': service.category,
        'itemListElement': [
            {
                '@type': 'Offer',
                'itemOffered': {
                    '@type': 'Service',
                    'name': service.title,
                    'description': service.description
                },
                'price': service.price,
                'priceCurrency': 'INR'
            }
        ]
    }
});

// Review Schema
export const getReviewSchema = (reviews) => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Bro Heal',
    'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': reviews.averageRating || '4.8',
        'reviewCount': reviews.totalReviews || '1000',
        'bestRating': '5',
        'worstRating': '1'
    }
});

// Person Schema (for Therapists)
export const getTherapistSchema = (therapist) => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': therapist.name,
    'jobTitle': 'Certified Therapist',
    'worksFor': {
        '@type': 'Organization',
        'name': 'Bro Heal'
    },
    'description': therapist.bio || 'Professional certified therapist',
    'image': therapist.profileImage,
    'aggregateRating': therapist.rating ? {
        '@type': 'AggregateRating',
        'ratingValue': therapist.rating,
        'reviewCount': therapist.reviewCount || 0
    } : undefined
});

// Booking/Reservation Schema
export const getBookingSchema = (booking) => ({
    '@context': 'https://schema.org',
    '@type': 'EventReservation',
    'reservationNumber': booking._id,
    'reservationStatus': 'https://schema.org/ReservationConfirmed',
    'reservationFor': {
        '@type': 'Service',
        'name': booking.serviceId?.title,
        'provider': {
            '@type': 'Person',
            'name': booking.therapistId?.name
        }
    },
    'startTime': booking.bookingDateTime,
    'underName': {
        '@type': 'Person',
        'name': booking.userId?.name
    },
    'totalPrice': booking.amount,
    'priceCurrency': 'INR'
});

// FAQ Schema
export const getFAQSchema = (faqs) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer
        }
    }))
});

// WebSite Schema
export const getWebsiteSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Bro Heal',
    'url': 'https://broheal.com',
    'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://broheal.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
    }
});

// BreadcrumbList Schema
export const getBreadcrumbSchema = (items) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': item.url
    }))
});

// Inject structured data into page
export const injectStructuredData = (schema) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);

    // Remove existing schema
    const existing = document.querySelector('script[type="application/ld+json"]');
    if (existing) {
        existing.remove();
    }

    document.head.appendChild(script);
};

export default {
    getBusinessSchema,
    getServiceSchema,
    getReviewSchema,
    getTherapistSchema,
    getBookingSchema,
    getFAQSchema,
    getWebsiteSchema,
    getBreadcrumbSchema,
    injectStructuredData
};
