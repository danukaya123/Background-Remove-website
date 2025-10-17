import Head from 'next/head';
import { useRouter } from 'next/router';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import NotificationComponent from '../components/NotificationComponent';

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const currentUrl = `https://rbg.quizontal.cc${router.asPath}`;
  
  // Default meta information - Optimized for WhatsApp
  const defaultMeta = {
    title: 'Quizontal - Remove Image Backgrounds 100% Free',
    description: '🚀 Remove image backgrounds automatically with AI. 100% free, no watermarks. Perfect for product photos, portraits, and creative projects. Process images in seconds!',
    keywords: 'background remover, remove bg, AI background removal, image editing, free background removal, product photos, portrait editing, remove background from image',
    image: 'https://rbg.quizontal.cc/og-image.jpg',
    url: currentUrl,
    siteName: 'Quizontal AI Background Remover'
  };

  return (
    <>
      <Head>
        {/* ===== BASIC META TAGS ===== */}
        <title>{defaultMeta.title}</title>
        <meta name="description" content={defaultMeta.description} />
        <meta name="keywords" content={defaultMeta.keywords} />
        <meta name="author" content="Quizontal" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        
        {/* ===== CANONICAL URL ===== */}
        <link rel="canonical" href={defaultMeta.url} />

        {/* ===== FAVICON ===== */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* ===== OPEN GRAPH META TAGS (Facebook, WhatsApp, LinkedIn) ===== */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={defaultMeta.url} />
        <meta property="og:title" content={defaultMeta.title} />
        <meta property="og:description" content={defaultMeta.description} />
        <meta property="og:image" content={defaultMeta.image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:secure_url" content={defaultMeta.image} />
        <meta property="og:image:alt" content="Quizontal AI Background Removal - Remove backgrounds instantly for free" />
        <meta property="og:site_name" content={defaultMeta.siteName} />
        <meta property="og:locale" content="en_US" />

        {/* ===== TWITTER CARD META TAGS ===== */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@quizontal" />
        <meta name="twitter:creator" content="@quizontal" />
        <meta name="twitter:title" content={defaultMeta.title} />
        <meta name="twitter:description" content={defaultMeta.description} />
        <meta name="twitter:image" content={defaultMeta.image} />
        <meta name="twitter:image:alt" content="Quizontal AI Background Removal" />

        {/* ===== WHATSAPP SPECIFIC META TAGS ===== */}
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:secure_url" content={defaultMeta.image} />
        
        {/* ===== ADDITIONAL SEO META TAGS ===== */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* ===== MOBILE SPECIFIC META TAGS ===== */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Quizontal" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* ===== STRUCTURED DATA (JSON-LD) ===== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Quizontal AI Background Remover",
              "description": defaultMeta.description,
              "url": "https://rbg.quizontal.cc",
              "applicationCategory": "MultimediaApplication",
              "operatingSystem": "Any",
              "permissions": "browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "description": "Free background removal service"
              },
              "author": {
                "@type": "Organization",
                "name": "Quizontal",
                "url": "https://rbg.quizontal.cc"
              },
              "creator": {
                "@type": "Organization",
                "name": "Quizontal",
                "url": "https://rbg.quizontal.cc"
              },
              "featureList": [
                "AI-Powered Background Removal",
                "100% Free Service",
                "No Watermarks",
                "Instant Processing",
                "High Quality Results"
              ]
            })
          }}
        />

        {/* ===== ORGANIZATION SCHEMA MARKUP ===== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Quizontal",
              "url": "https://rbg.quizontal.cc",
              "logo": "https://rbg.quizontal.cc/logo.png",
              "description": defaultMeta.description,
              "sameAs": [
                "https://twitter.com/quizontal",
                "https://facebook.com/quizontal",
                "https://linkedin.com/company/quizontal"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "quizontal.business@gmail.com",
                "contactType": "customer service",
                "areaServed": "Worldwide",
                "availableLanguage": ["English"]
              },
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "US"
              }
            })
          }}
        />

        {/* ===== WEBSITE SCHEMA ===== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Quizontal AI Background Remover",
              "url": "https://rbg.quizontal.cc",
              "description": defaultMeta.description,
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://rbg.quizontal.cc/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </Head>

      <NotificationProvider>
        <AuthProvider>
          <NotificationComponent />
          <Component {...pageProps} />
        </AuthProvider>
      </NotificationProvider>
    </>
  );
}
