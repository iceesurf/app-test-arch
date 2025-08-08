import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import React, { useEffect, useState } from 'react';
import { db, functions } from '../../firebase';
import './CampaignMetrics.css';

const CampaignMetrics = ({ campaignId, onClose }) => {
    const [campaign, setCampaign] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (campaignId) {
            fetchCampaignData();
        }
    }, [campaignId]);

    const fetchCampaignData = async () => {
        try {
            setLoading(true);
            const campaignRef = doc(db, 'ads_campaigns', campaignId);
            const campaignDoc = await getDoc(campaignRef);

            if (campaignDoc.exists()) {
                const campaignData = campaignDoc.data();
                setCampaign({ id: campaignDoc.id, ...campaignData });
                setMetrics(campaignData.metrics || {});
            }
        } catch (error) {
            console.error('Erro ao buscar dados da campanha:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshMetrics = async () => {
        try {
            setRefreshing(true);
            const getMetrics = httpsCallable(functions, 'getCampaignMetrics');
            const result = await getMetrics({ campaignId });

            if (result.data.success) {
                setMetrics(result.data.metrics);
                // Atualizar também os dados da campanha
                await fetchCampaignData();
            }
        } catch (error) {
            console.error('Erro ao atualizar métricas:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const formatNumber = (num) => {
        return num ? num.toLocaleString() : '0';
    };

    const formatCurrency = (num) => {
        return num ? `R$ ${num.toFixed(2)}` : 'R$ 0,00';
    };

    const formatPercentage = (num) => {
        return num ? `${num.toFixed(2)}%` : '0%';
    };

    if (loading) {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="loading">Carregando métricas...</div>
                </div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="error-message">Campanha não encontrada</div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content metrics-modal">
                <div className="modal-header">
                    <h3>Métricas da Campanha</h3>
                    <div className="header-actions">
                        <button
                            className="btn-icon"
                            onClick={refreshMetrics}
                            disabled={refreshing}
                        >
                            <i className={`fas ${refreshing ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
                        </button>
                        <button
                            className="btn-icon"
                            onClick={onClose}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div className="campaign-info">
                    <h4>{campaign.name}</h4>
                    <div className="campaign-meta">
                        <span className="platform">
                            <i className={`fab fa-${campaign.platform}`}></i>
                            {campaign.platform}
                        </span>
                        <span className="type">{campaign.type}</span>
                        <span className={`status status-${campaign.status}`}>
                            {campaign.status}
                        </span>
                    </div>
                </div>

                <div className="metrics-grid">
                    <div className="metric-card">
                        <div className="metric-icon impressions">
                            <i className="fas fa-eye"></i>
                        </div>
                        <div className="metric-content">
                            <h5>Impressões</h5>
                            <p className="metric-value">{formatNumber(metrics?.impressions || 0)}</p>
                            <p className="metric-description">Visualizações da campanha</p>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon clicks">
                            <i className="fas fa-mouse-pointer"></i>
                        </div>
                        <div className="metric-content">
                            <h5>Cliques</h5>
                            <p className="metric-value">{formatNumber(metrics?.clicks || 0)}</p>
                            <p className="metric-description">Interações com a campanha</p>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon ctr">
                            <i className="fas fa-percentage"></i>
                        </div>
                        <div className="metric-content">
                            <h5>CTR</h5>
                            <p className="metric-value">{formatPercentage(metrics?.ctr || 0)}</p>
                            <p className="metric-description">Taxa de cliques</p>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon spent">
                            <i className="fas fa-dollar-sign"></i>
                        </div>
                        <div className="metric-content">
                            <h5>Gasto</h5>
                            <p className="metric-value">{formatCurrency(metrics?.spent || 0)}</p>
                            <p className="metric-description">Valor investido</p>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon cpc">
                            <i className="fas fa-tag"></i>
                        </div>
                        <div className="metric-content">
                            <h5>CPC</h5>
                            <p className="metric-value">{formatCurrency(metrics?.cpc || 0)}</p>
                            <p className="metric-description">Custo por clique</p>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon cpm">
                            <i className="fas fa-chart-bar"></i>
                        </div>
                        <div className="metric-content">
                            <h5>CPM</h5>
                            <p className="metric-value">{formatCurrency(metrics?.cpm || 0)}</p>
                            <p className="metric-description">Custo por mil impressões</p>
                        </div>
                    </div>
                </div>

                <div className="performance-summary">
                    <h4>Resumo de Performance</h4>
                    <div className="summary-grid">
                        <div className="summary-item">
                            <span className="label">ROI Estimado:</span>
                            <span className="value">
                                {metrics?.spent && metrics?.clicks ?
                                    `${((metrics.clicks * 2.5 - metrics.spent) / metrics.spent * 100).toFixed(1)}%` :
                                    'N/A'
                                }
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Alcance Estimado:</span>
                            <span className="value">
                                {metrics?.impressions ?
                                    `${Math.floor(metrics.impressions * 0.8).toLocaleString()}` :
                                    'N/A'
                                }
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Engajamento:</span>
                            <span className="value">
                                {metrics?.impressions && metrics?.clicks ?
                                    `${((metrics.clicks / metrics.impressions) * 100).toFixed(2)}%` :
                                    'N/A'
                                }
                            </span>
                        </div>
                    </div>
                </div>

                <div className="campaign-details">
                    <h4>Detalhes da Campanha</h4>
                    <div className="details-grid">
                        <div className="detail-item">
                            <span className="label">Conteúdo:</span>
                            <p className="value">{campaign.content}</p>
                        </div>
                        {campaign.budget && (
                            <div className="detail-item">
                                <span className="label">Orçamento:</span>
                                <span className="value">{formatCurrency(campaign.budget)}</span>
                            </div>
                        )}
                        {campaign.scheduledDate && (
                            <div className="detail-item">
                                <span className="label">Agendamento:</span>
                                <span className="value">
                                    {new Date(campaign.scheduledDate).toLocaleDateString()}
                                    {campaign.scheduledTime && ` às ${campaign.scheduledTime}`}
                                </span>
                            </div>
                        )}
                        {campaign.targetAudience && (
                            <div className="detail-item">
                                <span className="label">Público-Alvo:</span>
                                <span className="value">{campaign.targetAudience}</span>
                            </div>
                        )}
                        {campaign.publishedAt && (
                            <div className="detail-item">
                                <span className="label">Publicado em:</span>
                                <span className="value">
                                    {new Date(campaign.publishedAt.toDate()).toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        className="btn-secondary"
                        onClick={onClose}
                    >
                        Fechar
                    </button>
                    <button
                        className="btn-primary"
                        onClick={refreshMetrics}
                        disabled={refreshing}
                    >
                        {refreshing ? 'Atualizando...' : 'Atualizar Métricas'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CampaignMetrics;
