import React, { useEffect, useState } from 'react';

const Settings = () => {
  const [tab, setTab] = useState('branding');
  const [branding, setBranding] = useState({ brandName: '', primaryColor: '#8b5cf6', secondaryColor: '#22c55e', logoUrl: '' });
  const [integrations, setIntegrations] = useState({ metaPhoneNumberId: '', metaToken: '', smtpHost: '', smtpPort: 587, smtpUser: '', smtpPass: '', smtpFrom: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [b, i] = await Promise.all([
          fetch('/api/settings/branding').then((r) => r.ok ? r.json() : {}),
          fetch('/api/settings/integrations').then((r) => r.ok ? r.json() : {}),
        ]);
        if (b && Object.keys(b).length) setBranding((prev) => ({ ...prev, ...b }));
        if (i && Object.keys(i).length) setIntegrations((prev) => ({ ...prev, ...i }));
      } catch {}
    })();
  }, []);

  const saveBranding = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings/branding', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(branding) });
      alert('Branding salvo!');
    } finally { setSaving(false); }
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
        <div className="card" style={{ background: 'var(--card-bg)', borderRadius: 12, padding: 16, border: '1px solid var(--border-color)' }}>
          <div className="form-group">
            <label>Nome da Marca</label>
            <input value={branding.brandName} onChange={(e)=>setBranding({ ...branding, brandName: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Cor Primária</label>
            <input type="color" value={branding.primaryColor} onChange={(e)=>setBranding({ ...branding, primaryColor: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Cor Secundária</label>
            <input type="color" value={branding.secondaryColor} onChange={(e)=>setBranding({ ...branding, secondaryColor: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Logo URL</label>
            <input value={branding.logoUrl} onChange={(e)=>setBranding({ ...branding, logoUrl: e.target.value })} placeholder="https://..." />
          </div>
          <div className="form-actions">
            <button className="btn-primary" disabled={saving} onClick={saveBranding}>Salvar</button>
          </div>
        </div>
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





