import React, { useEffect, useState } from 'react';
import './Requests.css';
// Removido: import { db } from '../../firebase';
// Removido: imports do 'firebase/firestore'

const Requests = () => {
    const [requests, setRequests] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    const [newRequest, setNewRequest] = useState({
        projectType: '',
        projectName: '',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        description: '',
        layout: '',
        logo: null,
        images: [],
        budget: '',
        deadline: '',
        status: 'pending'
    });

    const projectTypes = [
        { value: 'website', label: 'Website Institucional' },
        { value: 'ecommerce', label: 'E-commerce/Loja Virtual' },
        { value: 'landing', label: 'Landing Page' },
        { value: 'blog', label: 'Blog' },
        { value: 'app', label: 'Aplicativo Web' },
        { value: 'custom', label: 'Projeto Personalizado' }
    ];

    const layouts = [
        { value: 'modern', label: 'Layout Moderno' },
        { value: 'classic', label: 'Layout Clássico' },
        { value: 'minimal', label: 'Layout Minimalista' },
        { value: 'creative', label: 'Layout Criativo' },
        { value: 'corporate', label: 'Layout Corporativo' },
        { value: 'custom', label: 'Layout Personalizado' }
    ];

    const statusOptions = [
        { value: 'pending', label: 'Pendente', class: 'pending' },
        { value: 'reviewing', label: 'Em Análise', class: 'reviewing' },
        { value: 'approved', label: 'Aprovado', class: 'approved' },
        { value: 'in-progress', label: 'Em Desenvolvimento', class: 'in-progress' },
        { value: 'completed', label: 'Concluído', class: 'completed' },
        { value: 'cancelled', label: 'Cancelado', class: 'cancelled' }
    ];

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/requests');
            if (!response.ok) {
                throw new Error('Failed to fetch requests');
            }
            const data = await response.json();
             const requestsData = data.map(req => ({
                ...req,
                // Converter Timestamps do Firestore para datas no JS
                createdAt: req.createdAt?._seconds ? new Date(req.createdAt._seconds * 1000).toISOString() : new Date().toISOString(),
                updatedAt: req.updatedAt?._seconds ? new Date(req.updatedAt._seconds * 1000).toISOString() : new Date().toISOString(),
            }));
            setRequests(requestsData);
        } catch (error) {
            console.error('Erro ao buscar solicitações:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        // A lógica de upload de arquivos (logo, images) deve ser implementada aqui.
        // Por exemplo, usando o Firebase Storage.
        // Após o upload, as URLs seriam adicionadas ao objeto `requestDataToSend`.
        try {
            const requestDataToSend = { ...newRequest };
            delete requestDataToSend.logo;
            delete requestDataToSend.images;

            const response = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestDataToSend)
            });

            if (!response.ok) {
                 const errorBody = await response.text();
                throw new Error(`Failed to create request: ${errorBody}`);
            }

            const createdRequest = await response.json();

             const newRequestWithDate = {
                ...createdRequest,
                createdAt: new Date(createdRequest.createdAt._seconds * 1000).toISOString(),
                updatedAt: new Date(createdRequest.updatedAt._seconds * 1000).toISOString(),
            };

            setRequests([...requests, newRequestWithDate]);
            setNewRequest({
                projectType: '',
                projectName: '',
                clientName: '',
                clientEmail: '',
                clientPhone: '',
                description: '',
                layout: '',
                logo: null,
                images: [],
                budget: '',
                deadline: '',
                status: 'pending'
            });
            setShowCreateModal(false);

            alert('Solicitação criada com sucesso!');
        } catch (error) {
            console.error('Erro ao criar solicitação:', error);
            alert(`Erro ao criar solicitação: ${error.message}`);
        }
    };

    const handleDeleteRequest = async (requestId) => {
        if (window.confirm('Tem certeza que deseja excluir esta solicitação?')) {
            try {
                const response = await fetch(`/api/requests/${requestId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    throw new Error('Failed to delete request');
                }
                setRequests(requests.filter(r => r.id !== requestId));
            } catch (error) {
                console.error('Erro ao excluir solicitação:', error);
            }
        }
    };

    const handleUpdateStatus = async (requestId, newStatus) => {
        try {
            const response = await fetch(`/api/requests/${requestId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            const updatedRequests = requests.map(r =>
                r.id === requestId
                    ? { ...r, status: newStatus, updatedAt: new Date().toISOString() }
                    : r
            );
            setRequests(updatedRequests);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    const handleFileUpload = (e, field) => {
        const files = Array.from(e.target.files);
        if (field === 'logo') {
            setNewRequest({ ...newRequest, logo: files[0] });
        } else if (field === 'images') {
            setNewRequest({ ...newRequest, images: [...newRequest.images, ...files] });
        }
    };

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setShowDetailsModal(true);
    };

    const getStatusBadge = (status) => {
        const statusConfig = statusOptions.find(s => s.value === status);
        return statusConfig || statusOptions[0];
    };

    const getProjectTypeLabel = (type) => {
        const typeConfig = projectTypes.find(t => t.value === type);
        return typeConfig ? typeConfig.label : type;
    };

    const getLayoutLabel = (layout) => {
        const layoutConfig = layouts.find(l => l.value === layout);
        return layoutConfig ? layoutConfig.label : layout;
    };

    const filteredRequests = requests.filter(request => {
        if (activeTab === 'all') return true;
        return request.status === activeTab;
    });

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Carregando solicitações...</div>
            </div>
        );
    }

    return (
        <div className="requests-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Solicitações de Projetos</h1>
                    <p>Gerencie solicitações de sites e lojas virtuais</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    <i className="fas fa-plus"></i>
                    Nova Solicitação
                </button>
            </div>

            {/* Status Tabs */}
            <div className="status-tabs">
                <button
                    className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    <i className="fas fa-list"></i>
                    Todas ({requests.length})
                </button>
                {statusOptions.map(status => (
                    <button
                        key={status.value}
                        className={`tab-button ${activeTab === status.value ? 'active' : ''}`}
                        onClick={() => setActiveTab(status.value)}
                    >
                        <i className={`fas fa-${status.value === 'pending' ? 'clock' :
                                         status.value === 'reviewing' ? 'search' :
                                         status.value === 'approved' ? 'check' :
                                         status.value === 'in-progress' ? 'cog' :
                                         status.value === 'completed' ? 'flag' : 'times'}`}></i>
                        {status.label} ({requests.filter(r => r.status === status.value).length})
                    </button>
                ))}
            </div>

            {/* Requests Section */}
            <div className="requests-section">
                {filteredRequests.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <i className="fas fa-shopping-cart"></i>
                        </div>
                        <h3>Nenhuma solicitação encontrada</h3>
                        <p>{activeTab === 'all' ? 'Crie sua primeira solicitação de projeto' : 'Não há solicitações com este status'}</p>
                        {activeTab === 'all' && (
                            <button
                                className="btn-primary"
                                onClick={() => setShowCreateModal(true)}
                            >
                                Criar Primeira Solicitação
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="requests-grid">
                        {filteredRequests.map(request => (
                            <div key={request.id} className="request-card">
                                <div className="request-header">
                                    <div className="request-info">
                                        <h3>{request.projectName}</h3>
                                        <p>{getProjectTypeLabel(request.projectType)}</p>
                                    </div>
                                    <div className={`status-badge ${getStatusBadge(request.status).class}`}>
                                        {getStatusBadge(request.status).label}
                                    </div>
                                </div>

                                <div className="request-meta">
                                    <div className="meta-item">
                                        <i className="fas fa-user"></i>
                                        <span>{request.clientName}</span>
                                    </div>
                                    <div className="meta-item">
                                        <i className="fas fa-envelope"></i>
                                        <span>{request.clientEmail}</span>
                                    </div>
                                    <div className="meta-item">
                                        <i className="fas fa-calendar"></i>
                                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="request-details">
                                    <div className="detail-item">
                                        <strong>Layout:</strong> {getLayoutLabel(request.layout)}
                                    </div>
                                    {request.budget && (
                                        <div className="detail-item">
                                            <strong>Orçamento:</strong> R$ {request.budget}
                                        </div>
                                    )}
                                    {request.deadline && (
                                        <div className="detail-item">
                                            <strong>Prazo:</strong> {request.deadline}
                                        </div>
                                    )}
                                </div>

                                <div className="request-description">
                                    <p>{request.description.substring(0, 150)}...</p>
                                </div>

                                <div className="request-actions">
                                    <button
                                        className="btn-secondary"
                                        onClick={() => handleViewDetails(request)}
                                        title="Ver detalhes"
                                    >
                                        <i className="fas fa-eye"></i>
                                        Detalhes
                                    </button>
                                    <select
                                        className="status-select"
                                        value={request.status}
                                        onChange={(e) => handleUpdateStatus(request.id, e.target.value)}
                                    >
                                        {statusOptions.map(status => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        className="btn-danger"
                                        onClick={() => handleDeleteRequest(request.id)}
                                        title="Excluir solicitação"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Criação de Solicitação */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Nova Solicitação de Projeto</h2>
                            <button
                                className="btn-close"
                                onClick={() => setShowCreateModal(false)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleCreateRequest} className="request-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tipo de Projeto *</label>
                                    <select
                                        value={newRequest.projectType}
                                        onChange={(e) => setNewRequest({...newRequest, projectType: e.target.value})}
                                        required
                                    >
                                        <option value="">Selecione o tipo</option>
                                        {projectTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Nome do Projeto *</label>
                                    <input
                                        type="text"
                                        value={newRequest.projectName}
                                        onChange={(e) => setNewRequest({...newRequest, projectName: e.target.value})}
                                        placeholder="Ex: Site da Empresa XYZ"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nome do Cliente *</label>
                                    <input
                                        type="text"
                                        value={newRequest.clientName}
                                        onChange={(e) => setNewRequest({...newRequest, clientName: e.target.value})}
                                        placeholder="Nome completo"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email do Cliente *</label>
                                    <input
                                        type="email"
                                        value={newRequest.clientEmail}
                                        onChange={(e) => setNewRequest({...newRequest, clientEmail: e.target.value})}
                                        placeholder="cliente@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Telefone do Cliente</label>
                                    <input
                                        type="tel"
                                        value={newRequest.clientPhone}
                                        onChange={(e) => setNewRequest({...newRequest, clientPhone: e.target.value})}
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Layout Preferido</label>
                                    <select
                                        value={newRequest.layout}
                                        onChange={(e) => setNewRequest({...newRequest, layout: e.target.value})}
                                    >
                                        <option value="">Selecione o layout</option>
                                        {layouts.map(layout => (
                                            <option key={layout.value} value={layout.value}>
                                                {layout.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Orçamento (R$)</label>
                                    <input
                                        type="number"
                                        value={newRequest.budget}
                                        onChange={(e) => setNewRequest({...newRequest, budget: e.target.value})}
                                        placeholder="5000"
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Prazo de Entrega</label>
                                    <input
                                        type="date"
                                        value={newRequest.deadline}
                                        onChange={(e) => setNewRequest({...newRequest, deadline: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Logo/Imagem do Projeto</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, 'logo')}
                                    className="file-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Imagens de Referência</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleFileUpload(e, 'images')}
                                    className="file-input"
                                />
                                {newRequest.images.length > 0 && (
                                    <div className="file-list">
                                        {newRequest.images.map((file, index) => (
                                            <span key={index} className="file-item">
                                                {file.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Descrição Detalhada *</label>
                                <textarea
                                    value={newRequest.description}
                                    onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                                    placeholder="Descreva detalhadamente o projeto, funcionalidades desejadas, público-alvo, etc..."
                                    rows="6"
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Criar Solicitação
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Detalhes */}
            {showDetailsModal && selectedRequest && (
                <div className="modal-overlay">
                    <div className="modal-content details-modal">
                        <div className="modal-header">
                            <h2>Detalhes da Solicitação</h2>
                            <button
                                className="btn-close"
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSelectedRequest(null);
                                }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="request-details-content">
                            <div className="detail-section">
                                <h3>Informações do Projeto</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong>Nome:</strong> {selectedRequest.projectName}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Tipo:</strong> {getProjectTypeLabel(selectedRequest.projectType)}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Layout:</strong> {getLayoutLabel(selectedRequest.layout)}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Status:</strong>
                                        <span className={`status-badge ${getStatusBadge(selectedRequest.status).class}`}>
                                            {getStatusBadge(selectedRequest.status).label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Informações do Cliente</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong>Nome:</strong> {selectedRequest.clientName}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Email:</strong> {selectedRequest.clientEmail}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Telefone:</strong> {selectedRequest.clientPhone || 'Não informado'}
                                    </div>
                                </div>
                            </div>

                            {selectedRequest.budget && (
                                <div className="detail-section">
                                    <h3>Orçamento e Prazo</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <strong>Orçamento:</strong> R$ {selectedRequest.budget}
                                        </div>
                                        <div className="detail-item">
                                            <strong>Prazo:</strong> {selectedRequest.deadline || 'Não definido'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="detail-section">
                                <h3>Descrição</h3>
                                <div className="description-content">
                                    <p>{selectedRequest.description}</p>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Informações do Sistema</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong>Criado em:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Última atualização:</strong> {new Date(selectedRequest.updatedAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Requests;
