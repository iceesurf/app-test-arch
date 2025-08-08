import React, { useEffect, useState } from 'react';
import './Ads.css';
import CampaignMetrics from './CampaignMetrics';

const Ads = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [showMetrics, setShowMetrics] = useState(false);
    const [showCampaignMetrics, setShowCampaignMetrics] = useState(false);
    const [selectedCampaignForMetrics, setSelectedCampaignForMetrics] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        platform: 'facebook',
        type: 'post',
        content: '',
        image: null,
        scheduledDate: '',
        scheduledTime: '',
        budget: '',
        targetAudience: '',
        status: 'draft'
    });

    // Mock metrics data
    const [metrics] = useState({
        totalImpressions: 15420,
        totalClicks: 892,
        totalSpent: 1250.50,
        ctr: 5.78,
        cpc: 1.40,
        cpm: 8.11
    });

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/ads');
            const data = await response.json();
            setCampaigns(data);
        } catch (error) {
            console.error('Erro ao buscar campanhas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image' && files) {
            setFormData(prev => ({
                ...prev,
                image: files[0]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await fetch('/api/ads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const createdCampaign = await response.json();
            setCampaigns([createdCampaign, ...campaigns]);
            setFormData({
                name: '',
                platform: 'facebook',
                type: 'post',
                content: '',
                image: null,
                scheduledDate: '',
                scheduledTime: '',
                budget: '',
                targetAudience: '',
                status: 'draft'
            });
            setShowModal(false);
        } catch (error) {
            console.error('Erro ao criar campanha:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCampaign = async (campaignId) => {
        if (window.confirm('Tem certeza que deseja excluir esta campanha?')) {
            try {
                await fetch(`/api/ads/${campaignId}`, { method: 'DELETE' });
                setCampaigns(campaigns.filter(c => c.id !== campaignId));
            } catch (error) {
                console.error('Erro ao excluir campanha:', error);
            }
        }
    };

    const handleStatusChange = async (campaignId, newStatus) => {
        try {
            await fetch(`/api/ads/${campaignId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            setCampaigns(campaigns.map(c =>
                c.id === campaignId
                    ? { ...c, status: newStatus }
                    : c
            ));
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            draft: { class: 'status-draft', text: 'Rascunho' },
            scheduled: { class: 'status-scheduled', text: 'Agendada' },
            active: { class: 'status-active', text: 'Ativa' },
            paused: { class: 'status-paused', text: 'Pausada' },
            completed: { class: 'status-completed', text: 'Concluída' }
        };
        const config = statusConfig[status] || statusConfig.draft;
        return <span className={`status-badge ${config.class}`}>{config.text}</span>;
    };

    const getPlatformIcon = (platform) => {
        const icons = {
            facebook: 'fab fa-facebook',
            instagram: 'fab fa-instagram',
            google: 'fab fa-google',
            linkedin: 'fab fa-linkedin',
            twitter: 'fab fa-twitter'
        };
        return icons[platform] || 'fas fa-globe';
    };

    return (
        <div className="ads-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Gerenciamento de Publicidade</h1>
                    <p>Gerencie suas campanhas publicitárias e acompanhe o ROI</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn-secondary"
                        onClick={() => setShowMetrics(!showMetrics)}
                    >
                        <i className="fas fa-chart-line"></i>
                        {showMetrics ? 'Ocultar' : 'Ver'} Métricas
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        <i className="fas fa-plus"></i>
                        Nova Campanha
                    </button>
                </div>
            </div>

            {/* Métricas Gerais */}
            {showMetrics && (
                <div className="metrics-overview">
                    <h3>Métricas Gerais</h3>
                    <div className="metrics-grid">
                        <div className="metric-card">
                            <div className="metric-icon">
                                <i className="fas fa-eye"></i>
                            </div>
                            <div className="metric-content">
                                <h4>Impressões</h4>
                                <p>{metrics.totalImpressions.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-icon">
                                <i className="fas fa-mouse-pointer"></i>
                            </div>
                            <div className="metric-content">
                                <h4>Cliques</h4>
                                <p>{metrics.totalClicks.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-icon">
                                <i className="fas fa-dollar-sign"></i>
                            </div>
                            <div className="metric-content">
                                <h4>Gasto Total</h4>
                                <p>R$ {metrics.totalSpent.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-icon">
                                <i className="fas fa-percentage"></i>
                            </div>
                            <div className="metric-content">
                                <h4>CTR</h4>
                                <p>{metrics.ctr}%</p>
                            </div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-icon">
                                <i className="fas fa-tag"></i>
                            </div>
                            <div className="metric-content">
                                <h4>CPC</h4>
                                <p>R$ {metrics.cpc}</p>
                            </div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-icon">
                                <i className="fas fa-chart-bar"></i>
                            </div>
                            <div className="metric-content">
                                <h4>CPM</h4>
                                <p>R$ {metrics.cpm}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lista de Campanhas */}
            <div className="campaigns-section">
                <div className="section-header">
                    <h3>Campanhas ({campaigns.length})</h3>
                    <div className="filters">
                        <select className="filter-select">
                            <option value="">Todas as plataformas</option>
                            <option value="facebook">Facebook</option>
                            <option value="instagram">Instagram</option>
                            <option value="google">Google Ads</option>
                            <option value="linkedin">LinkedIn</option>
                        </select>
                        <select className="filter-select">
                            <option value="">Todos os status</option>
                            <option value="draft">Rascunho</option>
                            <option value="scheduled">Agendada</option>
                            <option value="active">Ativa</option>
                            <option value="paused">Pausada</option>
                            <option value="completed">Concluída</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Carregando campanhas...</div>
                ) : campaigns.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <i className="fas fa-ad"></i>
                        </div>
                        <h3>Nenhuma campanha encontrada</h3>
                        <p>Crie sua primeira campanha publicitária para começar</p>
                        <button
                            className="btn-primary"
                            onClick={() => setShowModal(true)}
                        >
                            Criar Campanha
                        </button>
                    </div>
                ) : (
                    <div className="campaigns-grid">
                        {campaigns.map(campaign => (
                            <div key={campaign.id} className="campaign-card">
                                <div className="campaign-header">
                                    <div className="campaign-info">
                                        <h4>{campaign.name}</h4>
                                        <div className="campaign-meta">
                                            <span className="platform">
                                                <i className={getPlatformIcon(campaign.platform)}></i>
                                                {campaign.platform}
                                            </span>
                                            <span className="type">{campaign.type}</span>
                                        </div>
                                    </div>
                                    <div className="campaign-actions">
                                        {getStatusBadge(campaign.status)}
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon"
                                                onClick={() => setSelectedCampaign(campaign)}
                                                title="Ver detalhes"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={() => {
                                                    setSelectedCampaignForMetrics(campaign.id);
                                                    setShowCampaignMetrics(true);
                                                }}
                                                title="Ver métricas"
                                            >
                                                <i className="fas fa-chart-line"></i>
                                            </button>
                                            <button
                                                className="btn-icon btn-danger"
                                                onClick={() => handleDeleteCampaign(campaign.id)}
                                                title="Excluir campanha"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="campaign-content">
                                    <p className="content-preview">
                                        {campaign.content.length > 100
                                            ? `${campaign.content.substring(0, 100)}...`
                                            : campaign.content
                                        }
                                    </p>

                                    {campaign.image && (
                                        <div className="image-preview">
                                            <img src={URL.createObjectURL(campaign.image)} alt="Preview" />
                                        </div>
                                    )}
                                </div>

                                <div className="campaign-footer">
                                    <div className="campaign-details">
                                        <span>
                                            <i className="fas fa-calendar"></i>
                                            {campaign.scheduledDate ? new Date(campaign.scheduledDate).toLocaleDateString() : 'Não agendado'}
                                        </span>
                                        {campaign.budget && (
                                            <span>
                                                <i className="fas fa-dollar-sign"></i>
                                                R$ {campaign.budget}
                                            </span>
                                        )}
                                    </div>

                                    <div className="status-actions">
                                        <select
                                            value={campaign.status}
                                            onChange={(e) => handleStatusChange(campaign.id, e.target.value)}
                                            className="status-select"
                                        >
                                            <option value="draft">Rascunho</option>
                                            <option value="scheduled">Agendada</option>
                                            <option value="active">Ativa</option>
                                            <option value="paused">Pausada</option>
                                            <option value="completed">Concluída</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Criação/Edição */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Nova Campanha Publicitária</h3>
                            <button
                                className="btn-icon"
                                onClick={() => setShowModal(false)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="campaign-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nome da Campanha *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Ex: Campanha Black Friday"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Plataforma *</label>
                                    <select
                                        name="platform"
                                        value={formData.platform}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="facebook">Facebook</option>
                                        <option value="instagram">Instagram</option>
                                        <option value="google">Google Ads</option>
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="twitter">Twitter</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tipo de Conteúdo *</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="post">Post</option>
                                        <option value="story">Story</option>
                                        <option value="video">Vídeo</option>
                                        <option value="carousel">Carrossel</option>
                                        <option value="ad">Anúncio Pago</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status *</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="draft">Rascunho</option>
                                        <option value="scheduled">Agendada</option>
                                        <option value="active">Ativa</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Conteúdo *</label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Digite o conteúdo da sua campanha..."
                                    rows="4"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Imagem</label>
                                    <input
                                        type="file"
                                        name="image"
                                        onChange={handleInputChange}
                                        accept="image/*"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Orçamento (R$)</label>
                                    <input
                                        type="number"
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Data de Agendamento</label>
                                    <input
                                        type="date"
                                        name="scheduledDate"
                                        value={formData.scheduledDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Horário</label>
                                    <input
                                        type="time"
                                        name="scheduledTime"
                                        value={formData.scheduledTime}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Público-Alvo</label>
                                <input
                                    type="text"
                                    name="targetAudience"
                                    value={formData.targetAudience}
                                    onChange={handleInputChange}
                                    placeholder="Ex: Homens 25-35 anos, interessados em tecnologia"
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Criando...' : 'Criar Campanha'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Visualização */}
            {selectedCampaign && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Detalhes da Campanha</h3>
                            <button
                                className="btn-icon"
                                onClick={() => setSelectedCampaign(null)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="campaign-details">
                            <div className="detail-row">
                                <strong>Nome:</strong>
                                <span>{selectedCampaign.name}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Plataforma:</strong>
                                <span>
                                    <i className={getPlatformIcon(selectedCampaign.platform)}></i>
                                    {selectedCampaign.platform}
                                </span>
                            </div>
                            <div className="detail-row">
                                <strong>Tipo:</strong>
                                <span>{selectedCampaign.type}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Status:</strong>
                                {getStatusBadge(selectedCampaign.status)}
                            </div>
                            <div className="detail-row">
                                <strong>Conteúdo:</strong>
                                <p>{selectedCampaign.content}</p>
                            </div>
                            {selectedCampaign.budget && (
                                <div className="detail-row">
                                    <strong>Orçamento:</strong>
                                    <span>R$ {selectedCampaign.budget}</span>
                                </div>
                            )}
                            {selectedCampaign.scheduledDate && (
                                <div className="detail-row">
                                    <strong>Agendamento:</strong>
                                    <span>
                                        {new Date(selectedCampaign.scheduledDate).toLocaleDateString()}
                                        {selectedCampaign.scheduledTime && ` às ${selectedCampaign.scheduledTime}`}
                                    </span>
                                </div>
                            )}
                            {selectedCampaign.targetAudience && (
                                <div className="detail-row">
                                    <strong>Público-Alvo:</strong>
                                    <span>{selectedCampaign.targetAudience}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Métricas Detalhadas */}
            {showCampaignMetrics && selectedCampaignForMetrics && (
                <CampaignMetrics
                    campaignId={selectedCampaignForMetrics}
                    onClose={() => {
                        setShowCampaignMetrics(false);
                        setSelectedCampaignForMetrics(null);
                    }}
                />
            )}
        </div>
    );
};

export default Ads;
