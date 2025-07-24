import { useEffect } from 'react';
import { useSEOConfig } from '@/hooks/useSEOConfig';

interface StructuredDataProps {
  data: object | ((config: any) => object);
  id?: string;
}

const StructuredData = ({ data, id = 'structured-data' }: StructuredDataProps) => {
  const seoConfig = useSEOConfig();

  useEffect(() => {
    // Remove existing structured data with the same ID
    const existingScript = document.getElementById(id);
    if (existingScript) {
      existingScript.remove();
    }

    // Generate data (can be function or object)
    const structuredData = typeof data === 'function' ? data(seoConfig) : data;

    // Add new structured data
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById(id);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data, id, seoConfig]);

  return null;
};

export default StructuredData;
