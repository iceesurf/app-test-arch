import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { BrandingProvider } from './contexts/BrandingContext';
import { auth } from './firebase';

// Landing Page Components
import About from './pages/Marketing/About';
import Contact from './pages/Marketing/Contact';
import ContactModal from './pages/Marketing/ContactModal';
import Footer from './pages/Marketing/Footer';
import Header from './pages/Marketing/Header';
import Hero from './pages/Marketing/Hero';
import RegisterModal from './pages/Marketing/RegisterModal';
import Services from './pages/Marketing/Services';

// Dashboard Components
import Ads from './pages/Dashboard/Ads';
import Agent from './pages/Dashboard/Agent';
import DashboardLayout from './pages/Dashboard/DashboardLayout';
import Email from './pages/Dashboard/Email';
import Home from './pages/Dashboard/Home';
import Leads from './pages/Dashboard/Leads';
import Requests from './pages/Dashboard/Requests';
import Settings from './pages/Dashboard/Settings';

import './pages/Marketing/style.css';

// Landing Page Component
const LandingPage = () => {
    const [modal, setModal] = useState(null);

    const openModal = (modalId) => setModal(modalId);
    const closeModal = () => setModal(null);
    const switchModal = (fromModalId, toModalId) => {
        closeModal();
        openModal(toModalId);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (event.target.classList.contains('modal')) {
                closeModal();
            }
        };

        window.addEventListener('click', handleClickOutside);

        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div>
            <Header openModal={openModal} />
            <Hero openModal={openModal} />
            <Services />
            <About />
            <Contact />
            <Footer />
            <RegisterModal modal={modal} closeModal={closeModal} switchModal={switchModal} />
            <ContactModal modal={modal} closeModal={closeModal} />
        </div>
    );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="loading">Carregando...</div>;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <BrandingProvider>
            <Router>
                <Routes>
                    {/* Landing Page Route */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Dashboard Routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Home />} />
                        <Route path="agent" element={<Agent />} />
                        <Route path="leads" element={<Leads />} />
                        <Route path="ads" element={<Ads />} />
                        <Route path="email" element={<Email />} />
                        <Route path="requests" element={<Requests />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Routes>
            </Router>
        </BrandingProvider>
    );
}

export default App;
