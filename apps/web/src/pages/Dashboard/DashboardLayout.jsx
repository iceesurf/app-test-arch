import { signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import './DashboardLayout.css';

const DashboardLayout = () => {
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
            } else {
                navigate('/');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    const menuItems = [
        { path: '/dashboard', icon: 'fas fa-home', label: 'Home' },
        { path: '/dashboard/agent', icon: 'fas fa-robot', label: 'Agente WhatsApp' },
        { path: '/dashboard/leads', icon: 'fas fa-users', label: 'Leads' },
        { path: '/dashboard/ads', icon: 'fas fa-ad', label: 'Publicidade' },
        { path: '/dashboard/email', icon: 'fas fa-envelope', label: 'Email Marketing' },
        { path: '/dashboard/requests', icon: 'fas fa-shopping-cart', label: 'Solicitações' },
        { path: '/dashboard/settings', icon: 'fas fa-cog', label: 'Configurações' },
    ];

    if (!user) {
        return <div className="loading">Carregando...</div>;
    }

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <img src="/logo-nxtai.png" alt="NXT.AI" className="sidebar-logo" />
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <i className="fas fa-bars"></i>
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <a
                            key={item.path}
                            href={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <i className={item.icon}></i>
                            <span>{item.label}</span>
                        </a>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Topbar */}
                <header className="topbar">
                    <div className="topbar-left">
                        <h1 className="page-title">
                            {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                        </h1>
                    </div>

                    <div className="topbar-right">
                        <div className="user-info">
                            <div className="user-avatar">
                                <i className="fas fa-user"></i>
                            </div>
                            <div className="user-details">
                                <span className="user-name">{user.displayName || 'Usuário'}</span>
                                <span className="user-email">{user.email}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
