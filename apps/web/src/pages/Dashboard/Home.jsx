import React, { useEffect, useState } from 'react';
import './Home.css';
// Removido: import { db } from '../../firebase';
// Removido: import { collection, getDocs, query } from 'firebase/firestore';

const Home = () => {
    const [stats, setStats] = useState({
        totalLeads: 0,
        activeChatbots: 0,
        campaigns: 0,
        requests: 0
    });
    const [recentLeads, setRecentLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/dashboard/stats');
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }
            const data = await response.json();
            setStats(data.stats);
            setRecentLeads(data.recentLeads);
        } catch (error) {
            console.error('Erro ao buscar dados da dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Carregando dashboard...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-home">
            {/* Welcome Section */}
            <div className="welcome-section">
                <h1>Bem-vindo ao seu Dashboard</h1>
                <p>Gerencie seus leads, campanhas e automações em um só lugar</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-users"></i>
                    </div>
                    <div className="stat-number">{stats.totalLeads}</div>
                    <div className="stat-label">Total de Leads</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-robot"></i>
                    </div>
                    <div className="stat-number">{stats.activeChatbots}</div>
                    <div className="stat-label">Chatbots Ativos</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-ad"></i>
                    </div>
                    <div className="stat-number">{stats.campaigns}</div>
                    <div className="stat-label">Campanhas</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-shopping-cart"></i>
                    </div>
                    <div className="stat-number">{stats.requests}</div>
                    <div className="stat-label">Solicitações</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h2>Ações Rápidas</h2>
                <div className="actions-grid">
                    <div className="action-card">
                        <div className="action-icon">
                            <i className="fas fa-plus"></i>
                        </div>
                        <h3>Adicionar Lead</h3>
                        <p>Importe novos leads via CSV ou adicione manualmente</p>
                        <button className="btn-primary">
                            <i className="fas fa-plus"></i>
                            Adicionar Lead
                        </button>
                    </div>

                    <div className="action-card">
                        <div className="action-icon">
                            <i className="fas fa-robot"></i>
                        </div>
                        <h3>Criar Chatbot</h3>
                        <p>Configure um novo agente de conversa para WhatsApp</p>
                        <button className="btn-primary">
                            <i className="fas fa-robot"></i>
                            Criar Chatbot
                        </button>
                    </div>

                    <div className="action-card">
                        <div className="action-icon">
                            <i className="fas fa-ad"></i>
                        </div>
                        <h3>Nova Campanha</h3>
                        <p>Crie uma campanha publicitária para suas redes sociais</p>
                        <button className="btn-primary">
                            <i className="fas fa-ad"></i>
                            Criar Campanha
                        </button>
                    </div>

                    <div className="action-card">
                        <div className="action-icon">
                            <i className="fas fa-envelope"></i>
                        </div>
                        <h3>Email Marketing</h3>
                        <p>Envie emails automatizados para sua base de leads</p>
                        <button className="btn-primary">
                            <i className="fas fa-envelope"></i>
                            Enviar Email
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Leads */}
            <div className="recent-leads">
                <div className="section-header">
                    <h2>Leads Recentes</h2>
                    <button className="btn-secondary">
                        <i className="fas fa-eye"></i>
                        Ver Todos
                    </button>
                </div>

                <div className="leads-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Telefone</th>
                                <th>Status</th>
                                <th>Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentLeads.map((lead) => (
                                <tr key={lead.id}>
                                    <td>{lead.name}</td>
                                    <td>{lead.email}</td>
                                    <td>{lead.phone || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge ${lead.status || 'new'}`}>
                                            {lead.status || 'Novo'}
                                        </span>
                                    </td>
                                    <td>
                                        {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                                    </td>
                                </tr>
                            ))}
                            {recentLeads.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="no-data">
                                        Nenhum lead encontrado
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Activity Feed */}
            <div className="activity-feed">
                <h2>Atividade Recente</h2>
                <div className="activity-list">
                    <div className="activity-item">
                        <div className="activity-icon">
                            <i className="fas fa-user-plus"></i>
                        </div>
                        <div className="activity-content">
                            <p>Novo lead adicionado: João Silva</p>
                            <span className="activity-time">Há 2 horas</span>
                        </div>
                    </div>

                    <div className="activity-item">
                        <div className="activity-icon">
                            <i className="fas fa-robot"></i>
                        </div>
                        <div className="activity-content">
                            <p>Chatbot "Vendas 2024" foi atualizado</p>
                            <span className="activity-time">Há 4 horas</span>
                        </div>
                    </div>

                    <div className="activity-item">
                        <div className="activity-icon">
                            <i className="fas fa-envelope"></i>
                        </div>
                        <div className="activity-content">
                            <p>Campanha de email enviada para 150 leads</p>
                            <span className="activity-time">Há 6 horas</span>
                        </div>
                    </div>

                    <div className="activity-item">
                        <div className="activity-icon">
                            <i className="fas fa-ad"></i>
                        </div>
                        <div className="activity-content">
                            <p>Nova campanha publicitária criada</p>
                            <span className="activity-time">Ontem</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
