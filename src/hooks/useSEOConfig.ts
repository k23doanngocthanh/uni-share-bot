import { useMemo } from 'react';
import seoConfig from '@/config/seo.json';

type Environment = 'production' | 'staging' | 'development';

export const useSEOConfig = () => {
  const config = useMemo(() => {
    // Detect environment based on hostname
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    
    let env: Environment = 'development';
    
    if (hostname === 'unishare.io.vn' || hostname === 'www.unishare.io.vn') {
      env = 'production';
    } else if (hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
      env = 'staging';
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
    return `${config.baseUrl}${path}`;
  };

  const generateImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) return imagePath;
    return `${config.baseUrl}${imagePath}`;
  };

  return {
    ...config,
    generateUrl,
    generateImageUrl
  };
};

export default useSEOConfig;
