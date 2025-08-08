import React from 'react';
import { useBranding } from '../contexts/BrandingContext';
import './WhitelabelSummary.css';

const WhitelabelSummary = () => {
  const { branding } = useBranding();

  const getStatusColor = (value) => {
    return value ? 'var(--success-text)' : 'var(--text-muted)';
  };

  const getStatusText = (value) => {
    return value ? 'Configurado' : 'Não configurado';
  };

  return (
    <div className="whitelabel-summary">
      <h3>Resumo do Whitelabel</h3>

      <div className="summary-grid">
        <div className="summary-item">
          <div className="summary-icon">
            <i className="fas fa-building"></i>
          </div>
          <div className="summary-content">
            <h4>Nome da Marca</h4>
            <p>{branding.brandName || 'NXT.AI'}</p>
            <span
              className="status-badge"
              style={{ color: getStatusColor(branding.brandName) }}
            >
              {getStatusText(branding.brandName)}
            </span>
          </div>
        </div>

        <div className="summary-item">
          <div className="summary-icon">
            <i className="fas fa-palette"></i>
          </div>
          <div className="summary-content">
            <h4>Cores Personalizadas</h4>
            <div className="color-display">
              <div
                className="color-preview"
                style={{ backgroundColor: branding.primaryColor }}
              ></div>
              <div
                className="color-preview"
                style={{ backgroundColor: branding.secondaryColor }}
              ></div>
            </div>
            <span
              className="status-badge"
              style={{ color: getStatusColor(branding.primaryColor !== '#8b5cf6') }}
            >
              {getStatusText(branding.primaryColor !== '#8b5cf6')}
            </span>
          </div>
        </div>

        <div className="summary-item">
          <div className="summary-icon">
            <i className="fas fa-image"></i>
          </div>
          <div className="summary-content">
            <h4>Logo Personalizada</h4>
            <div className="logo-display">
              <img
                src={branding.logoUrl || "/logo-nxtai.png"}
                alt="Logo"
                onError={(e) => {
                  e.target.src = "/logo-nxtai.png";
                }}
              />
            </div>
            <span
              className="status-badge"
              style={{ color: getStatusColor(branding.logoUrl && branding.logoUrl !== '/logo-nxtai.png') }}
            >
              {getStatusText(branding.logoUrl && branding.logoUrl !== '/logo-nxtai.png')}
            </span>
          </div>
        </div>

        <div className="summary-item">
          <div className="summary-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="summary-content">
            <h4>Status Geral</h4>
            <p>Configuração de Whitelabel</p>
            <span
              className="status-badge"
              style={{
                color: getStatusColor(
                  branding.brandName &&
                  branding.primaryColor !== '#8b5cf6' &&
                  branding.logoUrl &&
                  branding.logoUrl !== '/logo-nxtai.png'
                )
              }}
            >
              {getStatusText(
                branding.brandName &&
                branding.primaryColor !== '#8b5cf6' &&
                branding.logoUrl &&
                branding.logoUrl !== '/logo-nxtai.png'
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="summary-actions">
        <button
          className="btn-secondary"
          onClick={() => window.location.href = '/dashboard/settings'}
        >
          <i className="fas fa-cog"></i>
          Configurar Whitelabel
        </button>
      </div>
    </div>
  );
};

export default WhitelabelSummary;
