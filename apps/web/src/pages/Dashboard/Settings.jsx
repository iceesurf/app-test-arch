import React, { useEffect, useState } from 'react';
import BrandingPreview from '../../components/BrandingPreview';
import LogoUpload from '../../components/LogoUpload';
import { useBranding } from '../../contexts/BrandingContext';
import { useWhitelabel } from '../../hooks/useWhitelabel';

const Settings = () => {
  const [tab, setTab] = useState('branding');
  const { branding: brandingContext, updateBranding } = useBranding();
  const { applyBranding, resetToDefault, validateColors, isLoading: whitelabelLoading, error: whitelabelError } = useWhitelabel();
  const [branding, setBranding] = useState({ brandName: '', primaryColor: '#8b5cf6', secondaryColor: '#22c55e', logoUrl: '' });
  const [integrations, setIntegrations] = useState({ metaPhoneNumberId: '', metaToken: '', smtpHost: '', smtpPort: 587, smtpUser: '', smtpPass: '', smtpFrom: '' });
  const [saving, setSaving] = useState(false);
  const [logoError, setLogoError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    // Carregar branding do contexto
    if (brandingContext && !brandingContext.isLoading) {
      setBranding(prev => ({ ...prev, ...brandingContext }));
    }

    // Carregar integrações
    (async () => {
      try {
        const i = await fetch('/api/settings/integrations').then((r) => r.ok ? r.json() : {});
        if (i && Object.keys(i).length) setIntegrations((prev) => ({ ...prev, ...i }));
      } catch {}
    })();
  }, [brandingContext]);

  const saveBranding = async () => {
    // Validar cores antes de salvar
    const colorErrors = validateColors(branding.primaryColor, branding.secondaryColor);
    setValidationErrors(colorErrors);

    if (colorErrors.length > 0) {
      alert('Erro de validação: ' + colorErrors.join(', '));
      return;
    }

    setSaving(true);
    try {
      const result = await applyBranding(branding);
      if (result.success) {
        const message = result.message || 'Branding salvo com sucesso!';
        alert(message);
      } else {
        alert('Erro ao salvar branding: ' + result.error);
      }
    } finally { setSaving(false); }
  };

  const handleReset = async () => {
    if (confirm('Tem certeza que deseja resetar para as configurações padrão?')) {
      const result = await resetToDefault();
      if (result.success) {
        alert('Configurações resetadas com sucesso!');
        window.location.reload();
      } else {
        alert('Erro ao resetar configurações: ' + result.error);
      }
    }
  };
  const saveIntegrations = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings/integrations', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(integrations) });
      alert('Integrações salvas!');
    } finally { setSaving(false); }
  };

  return (
    <div className="settings-page" style={{ display: 'grid', gap: 16 }}>
      <div className="card" style={{ background: 'var(--card-bg)', borderRadius: 12, padding: 16, border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn-tool ${tab==='branding'?'active':''}`} onClick={() => setTab('branding')}>Branding</button>
          <button className={`btn-tool ${tab==='integrations'?'active':''}`} onClick={() => setTab('integrations')}>Integrações</button>
        </div>
      </div>

      {tab === 'branding' && (
        <>
          <div className="card" style={{ background: 'var(--card-bg)', borderRadius: 12, padding: 16, border: '1px solid var(--border-color)' }}>
            <div className="form-group">
              <label>Nome da Marca</label>
              <input
                value={branding.brandName}
                onChange={(e)=>setBranding({ ...branding, brandName: e.target.value })}
                placeholder="Digite o nome da sua marca"
              />
            </div>
            <div className="form-group">
              <label>Cor Primária</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e)=>setBranding({ ...branding, primaryColor: e.target.value })}
                />
                <span style={{ color: 'var(--text-muted)' }}>{branding.primaryColor}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Cor Secundária</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={branding.secondaryColor}
                  onChange={(e)=>setBranding({ ...branding, secondaryColor: e.target.value })}
                />
                <span style={{ color: 'var(--text-muted)' }}>{branding.secondaryColor}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Logo</label>
              <LogoUpload
                value={branding.logoUrl}
                onChange={(url) => setBranding({ ...branding, logoUrl: url })}
                onError={setLogoError}
              />
              {logoError && (
                <small style={{ color: 'var(--danger-text)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  {logoError}
                </small>
              )}
            </div>
            <div className="form-actions">
              <button className="btn-primary" disabled={saving || whitelabelLoading} onClick={saveBranding}>
                {saving || whitelabelLoading ? 'Salvando...' : 'Salvar Branding'}
              </button>
              <button
                className="btn-secondary"
                onClick={handleReset}
                style={{ marginLeft: '1rem' }}
              >
                Resetar para Padrão
              </button>
            </div>

            {validationErrors.length > 0 && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-text)',
                borderRadius: '8px',
                color: 'var(--danger-text)'
              }}>
                <strong>Erros de validação:</strong>
                <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {whitelabelError && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-text)',
                borderRadius: '8px',
                color: 'var(--danger-text)'
              }}>
                <strong>Erro:</strong> {whitelabelError}
              </div>
            )}
          </div>

          <BrandingPreview branding={branding} />
        </>
      )}

      {tab === 'integrations' && (
        <div className="card" style={{ background: 'var(--card-bg)', borderRadius: 12, padding: 16, border: '1px solid var(--border-color)' }}>
          <div className="form-group"><label>Meta Phone Number ID</label><input value={integrations.metaPhoneNumberId} onChange={(e)=>setIntegrations({ ...integrations, metaPhoneNumberId: e.target.value })} /></div>
          <div className="form-group"><label>Meta Token</label><input value={integrations.metaToken} onChange={(e)=>setIntegrations({ ...integrations, metaToken: e.target.value })} /></div>
          <div className="form-group"><label>SMTP Host</label><input value={integrations.smtpHost} onChange={(e)=>setIntegrations({ ...integrations, smtpHost: e.target.value })} /></div>
          <div className="form-group"><label>SMTP Port</label><input type="number" value={integrations.smtpPort} onChange={(e)=>setIntegrations({ ...integrations, smtpPort: Number(e.target.value) })} /></div>
          <div className="form-group"><label>SMTP User</label><input value={integrations.smtpUser} onChange={(e)=>setIntegrations({ ...integrations, smtpUser: e.target.value })} /></div>
          <div className="form-group"><label>SMTP Pass</label><input value={integrations.smtpPass} onChange={(e)=>setIntegrations({ ...integrations, smtpPass: e.target.value })} /></div>
          <div className="form-group"><label>SMTP From</label><input value={integrations.smtpFrom} onChange={(e)=>setIntegrations({ ...integrations, smtpFrom: e.target.value })} /></div>
          <div className="form-actions"><button className="btn-primary" disabled={saving} onClick={saveIntegrations}>Salvar</button></div>
        </div>
      )}
    </div>
  );
};

export default Settings;





