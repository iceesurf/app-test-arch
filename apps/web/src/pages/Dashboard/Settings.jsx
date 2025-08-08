import React, {useState, useEffect} from "react";
import api from "../../services/api";
import "./Settings.css";

const Settings = () => {
  const [branding, setBranding] = useState({
    logo_url: "",
    primary_color: "#007bff",
    secondary_color: "#6c757d",
    company_name: "",
  });

  const [integrations, setIntegrations] = useState({
    whatsapp: {
      phone_number_id: "",
      phone_number: "",
      business_name: "",
      access_token: "",
      verify_token: "",
      is_configured: false,
    },
    smtp: {
      host: "",
      port: 587,
      user: "",
      pass: "",
      from: "",
      is_configured: false,
    },
    webhook_url: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [brandingRes, integrationsRes] = await Promise.all([
        api.get("/settings/branding"),
        api.get("/settings/integrations"),
      ]);
      setBranding(brandingRes.data);
      setIntegrations(integrationsRes.data);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      setMessage("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleBrandingSave = async () => {
    try {
      setLoading(true);
      await api.put("/settings/branding", branding);
      setMessage("Configurações de marca salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar branding:", error);
      setMessage("Erro ao salvar configurações de marca");
    } finally {
      setLoading(false);
    }
  };

  const handleIntegrationsSave = async () => {
    try {
      setLoading(true);
      await api.put("/settings/integrations", integrations);
      setMessage("Integrações configuradas com sucesso!");
      await fetchSettings(); // Recarregar para atualizar is_configured
    } catch (error) {
      console.error("Erro ao salvar integrações:", error);
      setMessage("Erro ao salvar integrações");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <h1>Configurações</h1>

      {message && (
        <div className={`message ${message.includes("sucesso") ? "success" : "error"}`}>
          {message}
        </div>
      )}

      {/* Configurações de Marca */}
      <div className="settings-section">
        <h2>Configurações de Marca</h2>
        <div className="form-group">
          <label>URL do Logo:</label>
          <input
            type="url"
            value={branding.logo_url}
            onChange={(e) => setBranding({...branding, logo_url: e.target.value})}
            placeholder="https://exemplo.com/logo.png"
          />
        </div>
        <div className="form-group">
          <label>Nome da Empresa:</label>
          <input
            type="text"
            value={branding.company_name}
            onChange={(e) => setBranding({...branding, company_name: e.target.value})}
            placeholder="Nome da sua empresa"
          />
        </div>
        <div className="form-group">
          <label>Cor Primária:</label>
          <input
            type="color"
            value={branding.primary_color}
            onChange={(e) => setBranding({...branding, primary_color: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label>Cor Secundária:</label>
          <input
            type="color"
            value={branding.secondary_color}
            onChange={(e) => setBranding({...branding, secondary_color: e.target.value})}
          />
        </div>
        <button onClick={handleBrandingSave} disabled={loading}>
          {loading ? "Salvando..." : "Salvar Marca"}
        </button>
      </div>

      {/* Configurações de WhatsApp */}
      <div className="settings-section">
        <h2>Integração WhatsApp Business</h2>
        <div className="status-indicator">
          Status: {integrations.whatsapp.is_configured ? "✅ Configurado" : "❌ Não configurado"}
        </div>
        
        <div className="form-group">
          <label>Phone Number ID:</label>
          <input
            type="text"
            value={integrations.whatsapp.phone_number_id}
            onChange={(e) => setIntegrations({
              ...integrations,
              whatsapp: {...integrations.whatsapp, phone_number_id: e.target.value}
            })}
            placeholder="123456789012345"
          />
        </div>
        
        <div className="form-group">
          <label>Número do WhatsApp:</label>
          <input
            type="text"
            value={integrations.whatsapp.phone_number}
            onChange={(e) => setIntegrations({
              ...integrations,
              whatsapp: {...integrations.whatsapp, phone_number: e.target.value}
            })}
            placeholder="+5511999999999"
          />
        </div>
        
        <div className="form-group">
          <label>Nome do Negócio:</label>
          <input
            type="text"
            value={integrations.whatsapp.business_name}
            onChange={(e) => setIntegrations({
              ...integrations,
              whatsapp: {...integrations.whatsapp, business_name: e.target.value}
            })}
            placeholder="Nome do seu negócio"
          />
        </div>
        
        <div className="form-group">
          <label>Access Token (Permanent):</label>
          <input
            type="password"
            value={integrations.whatsapp.access_token}
            onChange={(e) => setIntegrations({
              ...integrations,
              whatsapp: {...integrations.whatsapp, access_token: e.target.value}
            })}
            placeholder="EAA..."
          />
        </div>
        
        <div className="form-group">
          <label>Verify Token:</label>
          <input
            type="text"
            value={integrations.whatsapp.verify_token}
            onChange={(e) => setIntegrations({
              ...integrations,
              whatsapp: {...integrations.whatsapp, verify_token: e.target.value}
            })}
            placeholder="seu_verify_token"
          />
        </div>

        {integrations.webhook_url && (
          <div className="webhook-info">
            <h4>URL do Webhook para configurar no Meta:</h4>
            <code>{integrations.webhook_url}</code>
            <p>Configure esta URL no painel do Meta for Developers</p>
          </div>
        )}
      </div>

      {/* Configurações de SMTP */}
      <div className="settings-section">
        <h2>Configurações de Email (SMTP)</h2>
        <div className="status-indicator">
          Status: {integrations.smtp.is_configured ? "✅ Configurado" : "❌ Não configurado"}
        </div>
        
        <div className="form-group">
          <label>Host SMTP:</label>
          <input
            type="text"
            value={integrations.smtp.host}
            onChange={(e) => setIntegrations({
              ...integrations,
              smtp: {...integrations.smtp, host: e.target.value}
            })}
            placeholder="smtp.gmail.com"
          />
        </div>
        
        <div className="form-group">
          <label>Porta:</label>
          <input
            type="number"
            value={integrations.smtp.port}
            onChange={(e) => setIntegrations({
              ...integrations,
              smtp: {...integrations.smtp, port: parseInt(e.target.value)}
            })}
            placeholder="587"
          />
        </div>
        
        <div className="form-group">
          <label>Usuário:</label>
          <input
            type="email"
            value={integrations.smtp.user}
            onChange={(e) => setIntegrations({
              ...integrations,
              smtp: {...integrations.smtp, user: e.target.value}
            })}
            placeholder="seu_email@gmail.com"
          />
        </div>
        
        <div className="form-group">
          <label>Senha (App Password):</label>
          <input
            type="password"
            value={integrations.smtp.pass}
            onChange={(e) => setIntegrations({
              ...integrations,
              smtp: {...integrations.smtp, pass: e.target.value}
            })}
            placeholder="Sua app password"
          />
        </div>
        
        <div className="form-group">
          <label>Email Remetente:</label>
          <input
            type="email"
            value={integrations.smtp.from}
            onChange={(e) => setIntegrations({
              ...integrations,
              smtp: {...integrations.smtp, from: e.target.value}
            })}
            placeholder="no-reply@suadominio.com"
          />
        </div>
      </div>

      <button onClick={handleIntegrationsSave} disabled={loading} className="save-button">
        {loading ? "Salvando..." : "Salvar Integrações"}
      </button>
    </div>
  );
};

export default Settings;





