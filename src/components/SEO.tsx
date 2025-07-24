import { useEffect } from 'react';
import { useSEOConfig } from '@/hooks/useSEOConfig';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
}

const SEO = ({ 
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  article
}: SEOProps) => {
  const seoConfig = useSEOConfig();
  
  // Use config values as defaults
  const finalTitle = title || seoConfig.seo.defaultTitle;
  const finalDescription = description || seoConfig.seo.defaultDescription;
  const finalKeywords = keywords || seoConfig.seo.defaultKeywords;
  const finalImage = image ? seoConfig.generateImageUrl(image) : seoConfig.generateImageUrl('/assets/hero-image.jpg');
  const finalUrl = url ? seoConfig.generateUrl(url) : seoConfig.generateUrl();

  useEffect(() => {
    // Update document title
    document.title = finalTitle;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', finalDescription);
    updateMetaTag('keywords', finalKeywords);
    updateMetaTag('author', seoConfig.companyName);
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('language', 'Vietnamese');
    
    // Open Graph tags
    updateMetaTag('og:title', finalTitle, true);
    updateMetaTag('og:description', finalDescription, true);
    updateMetaTag('og:image', finalImage, true);
    updateMetaTag('og:url', finalUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', seoConfig.siteName, true);
    updateMetaTag('og:locale', 'vi_VN', true);
    
    // Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:title', finalTitle, true);
    updateMetaTag('twitter:description', finalDescription, true);
    updateMetaTag('twitter:image', finalImage, true);
    updateMetaTag('twitter:site', seoConfig.seo.twitterHandle, true);
    
    // Article specific tags
    if (article && type === 'article') {
      if (article.publishedTime) {
        updateMetaTag('article:published_time', article.publishedTime, true);
      }
      if (article.modifiedTime) {
        updateMetaTag('article:modified_time', article.modifiedTime, true);
      }
      if (article.author) {
        updateMetaTag('article:author', article.author, true);
      }
      if (article.section) {
        updateMetaTag('article:section', article.section, true);
      }
      if (article.tags) {
        article.tags.forEach(tag => {
          const tagMeta = document.createElement('meta');
          tagMeta.setAttribute('property', 'article:tag');
          tagMeta.setAttribute('content', tag);
          document.head.appendChild(tagMeta);
        });
      }
    }

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', finalUrl);

    // Update alternate URLs for other domains
    const alternateUrls = [
      { href: finalUrl.replace(seoConfig.domain, 'uni-share-bot.vercel.app'), hreflang: 'vi' },
      { href: finalUrl.replace(seoConfig.domain, 'unishare.io.vn'), hreflang: 'vi' }
    ];

    // Remove existing alternate links
    document.querySelectorAll('link[rel="alternate"]').forEach(link => link.remove());
    
    // Add new alternate links
    alternateUrls.forEach(({ href, hreflang }) => {
      if (href !== finalUrl) { // Don't add self as alternate
        const alternate = document.createElement('link');
        alternate.setAttribute('rel', 'alternate');
        alternate.setAttribute('hreflang', hreflang);
        alternate.setAttribute('href', href);
        document.head.appendChild(alternate);
      }
    });

  }, [finalTitle, finalDescription, finalKeywords, finalImage, finalUrl, type, article, seoConfig]);

  return null;
};

export default SEO;
