
import React from 'react';

const About = () => {
    return (
        <section id="about" className="about">
            <div className="container">
                <div className="about-content">
                    <div className="about-text">
                        <h2 className="section-title">Por que escolher nossa plataforma?</h2>
                        <p>
                            Somos especialistas em automação de WhatsApp e gestão de leads. Nossa plataforma
                            oferece tudo que você precisa para automatizar conversas, qualificar leads e
                            aumentar suas vendas de forma inteligente e eficiente.
                        </p>
                        <div className="features">
                            <div className="feature">
                                <i className="fas fa-robot"></i>
                                <span>Automação Inteligente</span>
                            </div>
                            <div className="feature">
                                <i className="fas fa-chart-line"></i>
                                <span>Métricas em Tempo Real</span>
                            </div>
                            <div className="feature">
                                <i className="fas fa-users"></i>
                                <span>Gestão de Leads</span>
                            </div>
                            <div className="feature">
                                <i className="fas fa-palette"></i>
                                <span>White-Label Completo</span>
                            </div>
                            <div className="feature">
                                <i className="fas fa-headset"></i>
                                <span>Suporte Especializado</span>
                            </div>
                            <div className="feature">
                                <i className="fas fa-shield-alt"></i>
                                <span>Segurança Garantida</span>
                            </div>
                        </div>
                    </div>
                    <div className="about-stats">
                        <div className="stat">
                            <div className="stat-number">10k+</div>
                            <div className="stat-label">Conversas Automatizadas</div>
                        </div>
                        <div className="stat">
                            <div className="stat-number">5k+</div>
                            <div className="stat-label">Leads Qualificados</div>
                        </div>
                        <div className="stat">
                            <div className="stat-number">99.9%</div>
                            <div className="stat-label">Uptime Garantido</div>
                        </div>
                        <div className="stat">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">Suporte Disponível</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
