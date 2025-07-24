import { useMemo } from 'react';
import seoConfig from '@/config/seo.json';

type Environment = 'production' | 'staging' | 'github' | 'development';

export const useSEOConfig = () => {
  const config = useMemo(() => {
    // Detect environment based on hostname
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    
    let env: Environment = 'development';
    
    if (hostname === 'unishare.io.vn' || hostname === 'www.unishare.io.vn') {
      env = 'production';
    } else if (hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
      env = 'staging';
    } else if (hostname.includes('github.io') || pathname.startsWith('/uni-share-bot')) {
      env = 'github';
    }
    
    const envConfig = seoConfig[env];
    const seoData = seoConfig.seo;
    const contact = seoConfig.contact;
    const social = seoConfig.social;
    
    return {
      ...envConfig,
      seo: seoData,
      contact,
      social,
      environment: env
    };
  }, []);

  const generateUrl = (path: string = '') => {
    // Remove leading slash if it exists to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    if (config.environment === 'github' && cleanPath) {
      return `${config.baseUrl}/${cleanPath}`;
    }
    return cleanPath ? `${config.baseUrl}/${cleanPath}` : config.baseUrl;
  };

  const generateImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) return imagePath;
    // Handle GitHub Pages base path for images
    if (config.environment === 'github') {
      const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
      return `${config.baseUrl}/${cleanPath}`;
    }
    return `${config.baseUrl}${imagePath}`;
  };

  return {
    ...config,
    generateUrl,
    generateImageUrl
  };
};

export default useSEOConfig;
