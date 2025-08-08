
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { auth } from '../../firebase';

const Header = () => {
    const [user, setUser] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            unsubscribe();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Erro no login:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Erro no logout:', error);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
            <nav className="nav">
                <div className="nav-brand">
                    <img src="/logo-nxtai.png" alt="NXT AI" className="logo" />
                </div>

                <div className={`nav-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <a href="#home" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                        Home
                    </a>
                    <a href="#services" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                        Serviços
                    </a>
                    <a href="#about" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                        Sobre
                    </a>
                    <a href="#contact" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                        Contato
                    </a>

                    <div className="nav-buttons">
                        {user ? (
                            <>
                                <a href="/dashboard" className="btn-login">
                                    Dashboard
                                </a>
                                <button onClick={handleLogout} className="btn-register">
                                    Sair
                                </button>
                            </>
                        ) : (
                            <button onClick={handleLogin} className="btn-register">
                                Login com Google
                            </button>
                        )}
                    </div>
                </div>

                <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}>
                    <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </button>
            </nav>
        </header>
    );
};

export default Header;
