
import React from 'react';

const Hero = ({ openModal }) => {
    const scrollToSection = (sectionId) => {
        document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section id="home" className="hero">
            <div className="hero-content">
                <div className="hero-text">
                    <h1 className="hero-title">
                        Plataforma Completa de <span className="gradient-text">Automação WhatsApp</span><br />
                        & Gestão de Leads
                    </h1>
                    <p className="hero-subtitle">
                        Automatize conversas, gerencie leads e aumente suas vendas com nossa plataforma
                        completa de automação de WhatsApp. Editor visual, inbox humano e white-label.
                    </p>
                    <div className="hero-buttons">
                        <button className="btn-primary" onClick={() => openModal('contactModal')}>
                            <i className="fas fa-rocket"></i>
                            Começar Agora
                        </button>
                        <button className="btn-secondary" onClick={() => scrollToSection('services')}>
                            <i className="fas fa-play"></i>
                            Ver Funcionalidades
                        </button>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="floating-card card-1">
                        <i className="fas fa-robot"></i>
                        <span>Automação</span>
                    </div>
                    <div className="floating-card card-2">
                        <i className="fas fa-users"></i>
                        <span>Leads</span>
                    </div>
                    <div className="floating-card card-3">
                        <i className="fas fa-chart-line"></i>
                        <span>Campanhas</span>
                    </div>
                    <div className="floating-card card-4">
                        <i className="fas fa-palette"></i>
                        <span>White-Label</span>
                    </div>
                </div>
            </div>
            <div className="hero-bg">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>
        </section>
    );
};

export default Hero;
