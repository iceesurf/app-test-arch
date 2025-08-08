import React from 'react';
import './BrandingPreview.css';

const BrandingPreview = ({ branding }) => {
  return (
    <div className="branding-preview">
      <h3>Preview do Branding</h3>
      <div className="preview-container">
        {/* Preview do Logo */}
        <div className="preview-section">
          <h4>Logo</h4>
          <div className="logo-preview">
            <img
              src={branding.logoUrl || "/logo-nxtai.png"}
              alt={branding.brandName || "Logo"}
              onError={(e) => {
                e.target.src = "/logo-nxtai.png";
              }}
            />
            <span>{branding.brandName || "Nome da Marca"}</span>
          </div>
        </div>

        {/* Preview das Cores */}
        <div className="preview-section">
          <h4>Cores</h4>
          <div className="color-preview">
            <div className="color-item">
              <div
                className="color-swatch"
                style={{ backgroundColor: branding.primaryColor }}
              ></div>
              <span>Primária</span>
            </div>
            <div className="color-item">
              <div
                className="color-swatch"
                style={{ backgroundColor: branding.secondaryColor }}
              ></div>
              <span>Secundária</span>
            </div>
          </div>
        </div>

        {/* Preview de Botões */}
        <div className="preview-section">
          <h4>Elementos da Interface</h4>
          <div className="elements-preview">
            <button
              className="preview-btn primary"
              style={{
                background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${adjustBrightness(branding.primaryColor, -20)} 100%)`
              }}
            >
              Botão Primário
            </button>
            <button
              className="preview-btn secondary"
              style={{
                borderColor: branding.primaryColor,
                color: branding.primaryColor
              }}
            >
              Botão Secundário
            </button>
          </div>
        </div>

        {/* Preview de Cards */}
        <div className="preview-section">
          <h4>Cards</h4>
          <div className="card-preview">
            <div
              className="preview-card"
              style={{ borderColor: `${branding.primaryColor}20` }}
            >
              <div className="card-header">
                <h5>Card de Exemplo</h5>
                <div
                  className="card-icon"
                  style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${adjustBrightness(branding.primaryColor, -20)} 100%)` }}
                >
                  <i className="fas fa-star"></i>
                </div>
              </div>
              <p>Este é um exemplo de como os cards ficarão com suas cores personalizadas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Função para ajustar brilho da cor
const adjustBrightness = (hex, percent) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};

export default BrandingPreview;
