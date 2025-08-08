import React, { useEffect, useState } from 'react';
import { useBranding } from '../contexts/BrandingContext';

const StableLogo = ({ className = "sidebar-logo", alt, onError }) => {
  const { branding } = useBranding();
  const [logoUrl, setLogoUrl] = useState('/logo-nxtai.png');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (branding && !branding.isLoading && branding.logoUrl) {
      setLogoUrl(branding.logoUrl);
    }
  }, [branding?.logoUrl, branding?.isLoading]);

  const handleError = (e) => {
    if (e.target.src !== '/logo-nxtai.png') {
      e.target.src = '/logo-nxtai.png';
    }
    if (onError) {
      onError(e);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Não renderizar até que o branding esteja carregado
  if (branding.isLoading) {
    return <div className={className} style={{ width: '40px', height: '40px', backgroundColor: '#f0f0f0' }} />;
  }

  return (
    <img
      src={logoUrl}
      alt={alt || branding?.brandName || "NXT.AI"}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      style={{
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  );
};

export default StableLogo;
