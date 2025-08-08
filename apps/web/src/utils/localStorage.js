// Utilitário para salvar dados localmente
const STORAGE_KEY = 'whitelabel_branding';

export const saveBrandingLocal = (branding) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(branding));
    return true;
  } catch (error) {
    return false;
  }
};

export const loadBrandingLocal = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const branding = JSON.parse(stored);
      return branding;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const clearBrandingLocal = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    return false;
  }
};

// Verificar se a API está disponível
export const checkApiAvailability = async () => {
  try {
    const response = await fetch('/api/settings/branding', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};
