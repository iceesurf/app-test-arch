import React from 'react';
import { useBranding } from '../contexts/BrandingContext';

const BrandedTitle = ({ title, subtitle }) => {
  const { branding } = useBranding();

  return (
    <div className="branded-title">
      <div className="title-content">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      <div className="brand-info">
        <img
          src={branding.logoUrl || "/logo-nxtai.png"}
          alt={branding.brandName || "Logo"}
          className="brand-logo"
          onError={(e) => {
            e.target.src = "/logo-nxtai.png";
          }}
        />
        <span className="brand-name">{branding.brandName || "NXT.AI"}</span>
      </div>
    </div>
  );
};

export default BrandedTitle;
