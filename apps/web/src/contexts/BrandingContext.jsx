import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { checkApiAvailability, loadBrandingLocal, saveBrandingLocal } from '../utils/localStorage';

const BrandingContext = createContext();

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding deve ser usado dentro de um BrandingProvider');
  }
  return context;
};

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState({
    brandName: 'NXT.AI',
    primaryColor: '#8b5cf6',
    secondaryColor: '#22c55e',
    logoUrl: '/logo-nxtai.png',
    isLoading: true
  });

  // Função para ajustar brilho da cor
  const adjustBrightness = useCallback((hex, percent) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }, []);

  // Aplicar cores dinamicamente ao CSS
  const applyBrandingColors = useCallback(() => {
    const root = document.documentElement;

    // Aplicar cor primária
    root.style.setProperty('--primary-purple', branding.primaryColor);
    root.style.setProperty('--accent-primary', branding.primaryColor);
    root.style.setProperty('--accent-primary-hover', adjustBrightness(branding.primaryColor, -10));

    // Aplicar cor secundária
    root.style.setProperty('--accent-secondary', `${branding.secondaryColor}20`);
    root.style.setProperty('--accent-secondary-hover', `${branding.secondaryColor}30`);

    // Atualizar gradientes
    root.style.setProperty('--gradient-1', `linear-gradient(135deg, ${branding.primaryColor} 0%, ${adjustBrightness(branding.primaryColor, -20)} 100%)`);

    // Atualizar bordas e elementos que usam a cor primária
    root.style.setProperty('--border-accent', `${branding.primaryColor}20`);
  }, [branding.primaryColor, branding.secondaryColor, adjustBrightness]);

  // Carregar configurações de branding
  const loadBranding = useCallback(async () => {
    try {
      // Primeiro, tentar carregar do localStorage
      const localBranding = loadBrandingLocal();
      if (localBranding) {
        setBranding(prev => ({
          ...prev,
          ...localBranding,
          isLoading: false
        }));
        return;
      }

      // Verificar se a API está disponível
      const apiAvailable = await checkApiAvailability();

      if (apiAvailable) {
        // API disponível, carregar do servidor
        const response = await fetch('/api/settings/branding');
        if (response.ok) {
          const data = await response.json();
          if (data && Object.keys(data).length > 0) {
            setBranding(prev => ({ ...prev, ...data, isLoading: false }));
            // Salvar no localStorage para cache
            saveBrandingLocal(data);
          } else {
            setBranding(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          setBranding(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        // API não disponível, usar valores padrão
        const defaultBranding = {
          brandName: 'NXT.AI',
          primaryColor: '#8b5cf6',
          secondaryColor: '#22c55e',
          logoUrl: '/logo-nxtai.png'
        };
        setBranding(prev => ({ ...prev, ...defaultBranding, isLoading: false }));
        // Salvar valores padrão no localStorage
        saveBrandingLocal(defaultBranding);
      }
    } catch (error) {
      console.error('Erro ao carregar branding:', error);
      // Em caso de erro, usar valores padrão
      const defaultBranding = {
        brandName: 'NXT.AI',
        primaryColor: '#8b5cf6',
        secondaryColor: '#22c55e',
        logoUrl: '/logo-nxtai.png'
      };
      setBranding(prev => ({ ...prev, ...defaultBranding, isLoading: false }));
      saveBrandingLocal(defaultBranding);
    }
  }, []);

  // Atualizar branding
  const updateBranding = useCallback(async (newBranding) => {
    try {
      // Verificar se a API está disponível
      const apiAvailable = await checkApiAvailability();

      if (apiAvailable) {
        // API disponível, salvar no servidor
        const response = await fetch('/api/settings/branding', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newBranding)
        });

        if (response.ok) {
          setBranding(prev => ({ ...prev, ...newBranding }));
          // Salvar também no localStorage para cache
          saveBrandingLocal(newBranding);
          return { success: true };
        } else {
          // Tentar obter detalhes do erro do servidor
          let errorMessage = 'Erro ao salvar branding';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // Se não conseguir parsear JSON, usar status code
            errorMessage = `Erro ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }
      } else {
        // API não disponível, salvar localmente
        setBranding(prev => ({ ...prev, ...newBranding }));
        saveBrandingLocal(newBranding);
        return { success: true, message: 'Salvo localmente (API não disponível)' };
      }
    } catch (error) {
      console.error('Erro ao atualizar branding:', error);
      // Em caso de erro, tentar salvar localmente
      try {
        setBranding(prev => ({ ...prev, ...newBranding }));
        saveBrandingLocal(newBranding);
        return { success: true, message: 'Salvo localmente (erro na API)' };
      } catch {
        return { success: false, error: error.message };
      }
    }
  }, []);

  // Aplicar cores quando branding mudar
  useEffect(() => {
    if (!branding.isLoading && branding.primaryColor && branding.secondaryColor) {
      applyBrandingColors();
    }
  }, [branding.primaryColor, branding.secondaryColor, branding.isLoading, applyBrandingColors]);

  // Carregar branding na inicialização
  useEffect(() => {
    loadBranding();
  }, [loadBranding]);

  const value = {
    branding,
    updateBranding,
    loadBranding,
    isLoading: branding.isLoading
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
};
