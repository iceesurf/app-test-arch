
import React from 'react';
import logoNxtai from '../../assets/logo-nxtai.png';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <img src={logoNxtai} alt="NXT.AI" className="footer-logo" />
                        <p>Transformando ideias em soluções digitais inovadoras.</p>
                    </div>
                    <div className="footer-links">
                        <h4>Links Rápidos</h4>
                        <a href="#home">Home</a>
                        <a href="#services">Serviços</a>
                        <a href="#about">Sobre</a>
                        <a href="#contact">Contato</a>
                    </div>
                    <div className="footer-social">
                        <h4>Redes Sociais</h4>
                        <div className="social-links">
                            <a href="#"><i className="fab fa-linkedin"></i></a>
                            <a href="#"><i className="fab fa-github"></i></a>
                            <a href="#"><i className="fab fa-instagram"></i></a>
                            <a href="#"><i className="fab fa-twitter"></i></a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2025 NXT.AI. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
