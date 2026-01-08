import { Helmet } from 'react-helmet-async';

const SEO = ({
    title = 'Bro Heal - Professional Service Booking Platform',
    description = 'Book certified therapists for home services. Pay only after service completion. No advance payment required. Mobile-first service booking platform.',
    keywords = 'home service, therapist booking, massage, physiotherapy, wellness, healthcare, pay after service, mobile booking',
    image = 'https://i.ibb.co/23Sm0NDC/broheal.png',
    url = window.location.href,
    type = 'website',
    author = 'Bro Heal',
    canonical = window.location.href,
}) => {
    const siteName = 'Bro Heal';

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content={author} />
            <link rel="canonical" href={canonical} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content="en_IN" />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />
            <meta name="twitter:creator" content="@broheal" />

            {/* Additional Meta Tags */}
            <meta name="robots" content="index, follow" />
            <meta name="language" content="English, Hindi, Bengali" />
            <meta name="revisit-after" content="7 days" />
            <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            {/* Mobile App Meta */}
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content={siteName} />
            <meta name="format-detection" content="telephone=no" />
        </Helmet>
    );
};

export default SEO;
