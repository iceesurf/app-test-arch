
import React from 'react';

const Services = () => {
    return (
        <section id="services" className="services">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Funcionalidades da Plataforma</h2>
                    <p className="section-subtitle">Tudo que você precisa para automatizar seu WhatsApp e gerenciar leads</p>
                </div>
                <div className="services-grid">
                    <div className="service-card">
                        <div className="service-icon">
                            <i className="fas fa-robot"></i>
                        </div>
                        <h3>Automação WhatsApp</h3>
                        <p>Editor visual para criar fluxos de conversa complexos e automatizados.</p>
                        <ul>
                            <li>Editor Visual Drag & Drop</li>
                            <li>Fluxos Condicionais</li>
                            <li>Integração Meta API</li>
                        </ul>
                    </div>
                    <div className="service-card">
                        <div className="service-icon">
                            <i className="fas fa-inbox"></i>
                        </div>
                        <h3>Inbox Humano</h3>
                        <p>Interface para atendimento humano com visualização em tempo real das conversas.</p>
                        <ul>
                            <li>Chat em Tempo Real</li>
                            <li>Transferência Bot → Humano</li>
                            <li>Histórico Completo</li>
                        </ul>
                    </div>
                    <div className="service-card">
                        <div className="service-icon">
                            <i className="fas fa-users"></i>
                        </div>
                        <h3>Gestão de Leads</h3>
                        <p>Sistema completo para capturar, qualificar e acompanhar leads automaticamente.</p>
                        <ul>
                            <li>Captura Automática</li>
                            <li>Qualificação Inteligente</li>
                            <li>Importação em Lote</li>
                        </ul>
                    </div>
                    <div className="service-card">
                        <div className="service-icon">
                            <i className="fas fa-ad"></i>
                        </div>
                        <h3>Campanhas Publicitárias</h3>
                        <p>Gerencie campanhas publicitárias com métricas e agendamento automático.</p>
                        <ul>
                            <li>Múltiplas Plataformas</li>
                            <li>Métricas em Tempo Real</li>
                            <li>Agendamento Inteligente</li>
                        </ul>
                    </div>
                    <div className="service-card">
                        <div className="service-icon">
                            <i className="fas fa-envelope"></i>
                        </div>
                        <h3>Email Marketing</h3>
                        <p>Campanhas de email marketing com templates personalizáveis e automação.</p>
                        <ul>
                            <li>Templates Responsivos</li>
                            <li>Automação por Gatilhos</li>
                            <li>Relatórios Detalhados</li>
                        </ul>
                    </div>
                    <div className="service-card">
                        <div className="service-icon">
                            <i className="fas fa-palette"></i>
                        </div>
                        <h3>White-Label</h3>
                        <p>Personalize a plataforma com sua marca, cores e configurações exclusivas.</p>
                        <ul>
                            <li>Branding Personalizado</li>
                            <li>Integrações Próprias</li>
                            <li>Multi-Tenant</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Services;
