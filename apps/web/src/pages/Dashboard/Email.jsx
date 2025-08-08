import React, { useEffect, useState } from 'react';
import './Email.css';

const Email = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('campaigns');

    const [newCampaign, setNewCampaign] = useState({
        name: '',
        subject: '',
        content: '',
        templateId: '',
        audience: 'all',
        scheduledDate: '',
        scheduledTime: '',
        status: 'draft'
    });

    const [newTemplate, setNewTemplate] = useState({
        name: '',
        subject: '',
        content: '',
        category: 'general'
    });

    useEffect(() => {
        fetchCampaigns();
        fetchTemplates();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const response = await fetch('/api/emails/campaigns');
            const data = await response.json();
            setCampaigns(data);
        } catch (error) {
            console.error('Erro ao buscar campanhas:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const response = await fetch('/api/emails/templates');
            const data = await response.json();
            setTemplates(data);
        } catch (error) {
            console.error('Erro ao buscar templates:', error);
        }
    };

    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/emails/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCampaign)
            });
            const createdCampaign = await response.json();
            setCampaigns([...campaigns, createdCampaign]);
            setNewCampaign({
                name: '',
                subject: '',
                content: '',
                templateId: '',
                audience: 'all',
                scheduledDate: '',
                scheduledTime: '',
                status: 'draft'
            });
            setShowCreateModal(false);
        } catch (error) {
            console.error('Erro ao criar campanha:', error);
        }
    };

    const handleCreateTemplate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/emails/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTemplate)
            });
            const createdTemplate = await response.json();
            setTemplates([...templates, createdTemplate]);
            setNewTemplate({
                name: '',
                subject: '',
                content: '',
                category: 'general'
            });
            setShowTemplateModal(false);
        } catch (error) {
            console.error('Erro ao criar template:', error);
        }
    };

    const handleDeleteCampaign = async (campaignId) => {
        if (window.confirm('Tem certeza que deseja excluir esta campanha?')) {
            try {
                await fetch(`/api/emails/campaigns/${campaignId}`, { method: 'DELETE' });
                setCampaigns(campaigns.filter(c => c.id !== campaignId));
            } catch (error) {
                console.error('Erro ao excluir campanha:', error);
            }
        }
    };

    const handleDeleteTemplate = async (templateId) => {
        if (window.confirm('Tem certeza que deseja excluir este template?')) {
            try {
                await fetch(`/api/emails/templates/${templateId}`, { method: 'DELETE' });
                setTemplates(templates.filter(t => t.id !== templateId));
            } catch (error) {
                console.error('Erro ao excluir template:', error);
            }
        }
    };

    const handleSendCampaign = async (campaign) => {
        try {
            await fetch(`/api/emails/campaigns/${campaign.id}/send`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sentCount: (campaign.sentCount || 0) + 1 })
            });
            const updatedCampaigns = campaigns.map(c =>
                c.id === campaign.id
                    ? { ...c, status: 'sent', sentAt: new Date().toISOString(), sentCount: (c.sentCount || 0) + 1 }
                    : c
            );
            setCampaigns(updatedCampaigns);
            alert('Campanha enviada com sucesso!');
        } catch (error) {
            console.error('Erro ao enviar campanha:', error);
            alert('Erro ao enviar campanha');
        }
    };

    const handlePreviewCampaign = (campaign) => {
        setSelectedCampaign(campaign);
        setShowPreviewModal(true);
    };

    const handleUseTemplate = (template) => {
        setNewCampaign({
            ...newCampaign,
            subject: template.subject,
            content: template.content,
            templateId: template.id
        });
        setShowTemplateModal(false);
        setShowCreateModal(true);
    };


    const getStatusBadge = (status) => {
        const statusConfig = {
            draft: { label: 'Rascunho', class: 'draft' },
            scheduled: { label: 'Agendada', class: 'scheduled' },
            sent: { label: 'Enviada', class: 'sent' },
            paused: { label: 'Pausada', class: 'paused' }
        };
        return statusConfig[status] || statusConfig.draft;
    };

    const getAudienceLabel = (audience) => {
        const audienceConfig = {
            all: 'Todos os leads',
            active: 'Leads ativos',
            new: 'Novos leads',
            engaged: 'Leads engajados',
            custom: 'Audiência personalizada'
        };
        return audienceConfig[audience] || audience;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Carregando email marketing...</div>
            </div>
        );
    }

    return (
        <div className="email-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Email Marketing</h1>
                    <p>Automatize seus emails e aumente o engajamento</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn-secondary"
                        onClick={() => setShowTemplateModal(true)}
                    >
                        <i className="fas fa-plus"></i>
                        Novo Template
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <i className="fas fa-plus"></i>
                        Nova Campanha
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="email-tabs">
                <button
                    className={`tab-button ${activeTab === 'campaigns' ? 'active' : ''}`}
                    onClick={() => setActiveTab('campaigns')}
                >
                    <i className="fas fa-envelope"></i>
                    Campanhas
                </button>
                <button
                    className={`tab-button ${activeTab === 'templates' ? 'active' : ''}`}
                    onClick={() => setActiveTab('templates')}
                >
                    <i className="fas fa-file-alt"></i>
                    Templates
                </button>
                <button
                    className={`tab-button ${activeTab === 'automation' ? 'active' : ''}`}
                    onClick={() => setActiveTab('automation')}
                >
                    <i className="fas fa-cogs"></i>
                    Automação
                </button>
                <button
                    className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    <i className="fas fa-chart-bar"></i>
                    Analytics
                </button>
            </div>

            {/* Campaigns Tab */}
            {activeTab === 'campaigns' && (
                <div className="campaigns-section">
                    <div className="section-header">
                        <h2>Suas Campanhas</h2>
                        <div className="stats">
                            <div className="stat-item">
                                <span className="stat-value">{campaigns.length}</span>
                                <span className="stat-label">Total</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{campaigns.filter(c => c.status === 'sent').length}</span>
                                <span className="stat-label">Enviadas</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{campaigns.filter(c => c.status === 'draft').length}</span>
                                <span className="stat-label">Rascunhos</span>
                            </div>
                        </div>
                    </div>

                    {campaigns.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <i className="fas fa-envelope"></i>
                            </div>
                            <h3>Nenhuma campanha criada</h3>
                            <p>Crie sua primeira campanha de email para começar</p>
                            <button
                                className="btn-primary"
                                onClick={() => setShowCreateModal(true)}
                            >
                                Criar Primeira Campanha
                            </button>
                        </div>
                    ) : (
                        <div className="campaigns-grid">
                            {campaigns.map(campaign => (
                                <div key={campaign.id} className="campaign-card">
                                    <div className="campaign-header">
                                        <div className="campaign-info">
                                            <h3>{campaign.name}</h3>
                                            <p>{campaign.subject}</p>
                                        </div>
                                        <div className={`status-badge ${getStatusBadge(campaign.status).class}`}>
                                            {getStatusBadge(campaign.status).label}
                                        </div>
                                    </div>

                                    <div className="campaign-meta">
                                        <div className="meta-item">
                                            <i className="fas fa-users"></i>
                                            <span>{getAudienceLabel(campaign.audience)}</span>
                                        </div>
                                        <div className="meta-item">
                                            <i className="fas fa-calendar"></i>
                                            <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="campaign-stats">
                                        <div className="stat">
                                            <span className="stat-value">{campaign.sentCount || 0}</span>
                                            <span className="stat-label">Enviados</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-value">{campaign.openCount || 0}</span>
                                            <span className="stat-label">Abertos</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-value">{campaign.clickCount || 0}</span>
                                            <span className="stat-label">Cliques</span>
                                        </div>
                                    </div>

                                    <div className="campaign-actions">
                                        {campaign.status === 'draft' && (
                                            <button
                                                className="btn-primary"
                                                onClick={() => handleSendCampaign(campaign)}
                                                title="Enviar campanha"
                                            >
                                                <i className="fas fa-paper-plane"></i>
                                                Enviar
                                            </button>
                                        )}
                                        <button
                                            className="btn-secondary"
                                            onClick={() => handlePreviewCampaign(campaign)}
                                            title="Visualizar campanha"
                                        >
                                            <i className="fas fa-eye"></i>
                                            Visualizar
                                        </button>
                                        <button
                                            className="btn-danger"
                                            onClick={() => handleDeleteCampaign(campaign.id)}
                                            title="Excluir campanha"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
                <div className="templates-section">
                    <div className="section-header">
                        <h2>Templates de Email</h2>
                        <div className="stats">
                            <div className="stat-item">
                                <span className="stat-value">{templates.length}</span>
                                <span className="stat-label">Templates</span>
                            </div>
                        </div>
                    </div>

                    {templates.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <i className="fas fa-file-alt"></i>
                            </div>
                            <h3>Nenhum template criado</h3>
                            <p>Crie templates reutilizáveis para suas campanhas</p>
                            <button
                                className="btn-primary"
                                onClick={() => setShowTemplateModal(true)}
                            >
                                Criar Primeiro Template
                            </button>
                        </div>
                    ) : (
                        <div className="templates-grid">
                            {templates.map(template => (
                                <div key={template.id} className="template-card">
                                    <div className="template-header">
                                        <div className="template-info">
                                            <h3>{template.name}</h3>
                                            <p>{template.subject}</p>
                                        </div>
                                        <div className="template-category">
                                            {template.category}
                                        </div>
                                    </div>

                                    <div className="template-content">
                                        <div className="content-preview"
                                             dangerouslySetInnerHTML={{ __html: template.content.substring(0, 150) + '...' }}>
                                        </div>
                                    </div>

                                    <div className="template-meta">
                                        <div className="meta-item">
                                            <i className="fas fa-calendar"></i>
                                            <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="meta-item">
                                            <i className="fas fa-chart-line"></i>
                                            <span>{template.usageCount || 0} usos</span>
                                        </div>
                                    </div>

                                    <div className="template-actions">
                                        <button
                                            className="btn-primary"
                                            onClick={() => handleUseTemplate(template)}
                                            title="Usar template"
                                        >
                                            <i className="fas fa-plus"></i>
                                            Usar
                                        </button>
                                        <button
                                            className="btn-secondary"
                                            onClick={() => {
                                                setSelectedTemplate(template);
                                                setShowPreviewModal(true);
                                            }}
                                            title="Visualizar template"
                                        >
                                            <i className="fas fa-eye"></i>
                                            Visualizar
                                        </button>
                                        <button
                                            className="btn-danger"
                                            onClick={() => handleDeleteTemplate(template.id)}
                                            title="Excluir template"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Automation Tab */}
            {activeTab === 'automation' && (
                <div className="automation-section">
                    <div className="coming-soon">
                        <div className="coming-soon-icon">
                            <i className="fas fa-cogs"></i>
                        </div>
                        <h2>Automação em Desenvolvimento</h2>
                        <p>Em breve você poderá:</p>
                        <ul>
                            <li>Criar sequências automáticas de emails</li>
                            <li>Configurar gatilhos baseados em comportamento</li>
                            <li>Segmentar audiências automaticamente</li>
                            <li>Acompanhar o funil de conversão</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="analytics-section">
                    <div className="coming-soon">
                        <div className="coming-soon-icon">
                            <i className="fas fa-chart-bar"></i>
                        </div>
                        <h2>Analytics em Desenvolvimento</h2>
                        <p>Em breve você poderá:</p>
                        <ul>
                            <li>Visualizar métricas detalhadas de campanhas</li>
                            <li>Acompanhar taxas de abertura e cliques</li>
                            <li>Analisar comportamento dos leads</li>
                            <li>Gerar relatórios personalizados</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Modal de Criação de Campanha */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Criar Nova Campanha</h2>
                            <button
                                className="btn-close"
                                onClick={() => setShowCreateModal(false)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleCreateCampaign} className="campaign-form">
                            <div className="form-group">
                                <label>Nome da Campanha</label>
                                <input
                                    type="text"
                                    value={newCampaign.name}
                                    onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                                    placeholder="Ex: Boas-vindas novos leads"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Assunto do Email</label>
                                <input
                                    type="text"
                                    value={newCampaign.subject}
                                    onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                                    placeholder="Ex: Bem-vindo à nossa empresa!"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Conteúdo do Email</label>
                                <textarea
                                    value={newCampaign.content}
                                    onChange={(e) => setNewCampaign({...newCampaign, content: e.target.value})}
                                    placeholder="Digite o conteúdo do seu email..."
                                    rows="8"
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Audiência</label>
                                    <select
                                        value={newCampaign.audience}
                                        onChange={(e) => setNewCampaign({...newCampaign, audience: e.target.value})}
                                    >
                                        <option value="all">Todos os leads</option>
                                        <option value="active">Leads ativos</option>
                                        <option value="new">Novos leads</option>
                                        <option value="engaged">Leads engajados</option>
                                        <option value="custom">Audiência personalizada</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={newCampaign.status}
                                        onChange={(e) => setNewCampaign({...newCampaign, status: e.target.value})}
                                    >
                                        <option value="draft">Rascunho</option>
                                        <option value="scheduled">Agendada</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Criar Campanha
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Criação de Template */}
            {showTemplateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Criar Novo Template</h2>
                            <button
                                className="btn-close"
                                onClick={() => setShowTemplateModal(false)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleCreateTemplate} className="template-form">
                            <div className="form-group">
                                <label>Nome do Template</label>
                                <input
                                    type="text"
                                    value={newTemplate.name}
                                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                                    placeholder="Ex: Template de boas-vindas"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Categoria</label>
                                <select
                                    value={newTemplate.category}
                                    onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                                >
                                    <option value="general">Geral</option>
                                    <option value="welcome">Boas-vindas</option>
                                    <option value="promotional">Promocional</option>
                                    <option value="newsletter">Newsletter</option>
                                    <option value="nurturing">Nutrição</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Assunto Padrão</label>
                                <input
                                    type="text"
                                    value={newTemplate.subject}
                                    onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                                    placeholder="Ex: Bem-vindo à nossa empresa!"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Conteúdo do Template</label>
                                <textarea
                                    value={newTemplate.content}
                                    onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                                    placeholder="Digite o conteúdo do template..."
                                    rows="10"
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowTemplateModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Criar Template
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Preview */}
            {showPreviewModal && (selectedCampaign || selectedTemplate) && (
                <div className="modal-overlay">
                    <div className="modal-content preview-modal">
                        <div className="modal-header">
                            <h2>Preview do Email</h2>
                            <button
                                className="btn-close"
                                onClick={() => {
                                    setShowPreviewModal(false);
                                    setSelectedCampaign(null);
                                    setSelectedTemplate(null);
                                }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="email-preview">
                            <div className="preview-header">
                                <div className="preview-info">
                                    <strong>Assunto:</strong> {selectedCampaign?.subject || selectedTemplate?.subject}
                                </div>
                                <div className="preview-info">
                                    <strong>De:</strong> sua@empresa.com
                                </div>
                                <div className="preview-info">
                                    <strong>Para:</strong> lead@exemplo.com
                                </div>
                            </div>
                            <div className="preview-content"
                                 dangerouslySetInnerHTML={{ __html: selectedCampaign?.content || selectedTemplate?.content }}>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Email;
