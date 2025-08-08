import { useState } from 'react';
import { useBranding } from '../contexts/BrandingContext';

export const useWhitelabel = () => {
  const { branding, updateBranding, loadBranding } = useBranding();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Aplicar branding automaticamente
  const applyBranding = async (newBranding) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateBranding(newBranding);
      if (result.success) {
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Resetar para configurações padrão
  const resetToDefault = async () => {
    const defaultBranding = {
      brandName: 'NXT.AI',
      primaryColor: '#8b5cf6',
      secondaryColor: '#22c55e',
      logoUrl: '/logo-nxtai.png'
    };

    return await applyBranding(defaultBranding);
  };

  // Validar cores
  const validateColors = (primaryColor, secondaryColor) => {
    const errors = [];

    // Validar formato de cor
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(primaryColor)) {
      errors.push('Cor primária deve ser um código hexadecimal válido');
    }
    if (!colorRegex.test(secondaryColor)) {
      errors.push('Cor secundária deve ser um código hexadecimal válido');
    }

    // Validar contraste (simplificado)
    const getLuminance = (hex) => {
      const rgb = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
      if (!rgb) return 0;
      const [r, g, b] = rgb.slice(1).map(x => parseInt(x, 16) / 255);
      return 0.299 * r + 0.587 * g + 0.114 * b;
    };

    const primaryLuminance = getLuminance(primaryColor);
    const secondaryLuminance = getLuminance(secondaryColor);

    if (Math.abs(primaryLuminance - secondaryLuminance) < 0.1) {
      errors.push('As cores devem ter contraste suficiente entre si');
    }

    return errors;
  };

  // Validar URL da logo
  const validateLogoUrl = async (url) => {
    if (!url) return { valid: true };

    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.startsWith('image/')) {
        return { valid: true };
      } else {
        return { valid: false, error: 'URL não é uma imagem válida' };
      }
    } catch (error) {
      return { valid: false, error: 'Erro ao validar URL da imagem' };
    }
  };

  // Gerar paleta de cores baseada na cor primária
  const generateColorPalette = (primaryColor) => {
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

    return {
      primary: primaryColor,
      primaryLight: adjustBrightness(primaryColor, 20),
      primaryDark: adjustBrightness(primaryColor, -20),
      primaryHover: adjustBrightness(primaryColor, -10),
      accent: `${primaryColor}20`,
      accentHover: `${primaryColor}30`
    };
  };

  return {
    branding,
    isLoading,
    error,
    applyBranding,
    resetToDefault,
    validateColors,
    validateLogoUrl,
    generateColorPalette,
    loadBranding
  };
};
