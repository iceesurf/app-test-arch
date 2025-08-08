import React, { useEffect, useState } from 'react';
import './Leads.css';

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [importFile, setImportFile] = useState(null);
    const [newLead, setNewLead] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'new',
        source: 'manual',
        notes: ''
    });

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const response = await fetch('/api/leads');
            const data = await response.json();
            setLeads(data);
        } catch (error) {
            console.error('Erro ao buscar leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddLead = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLead)
            });
            const createdLead = await response.json();
            setLeads([createdLead, ...leads]);
            setNewLead({
                name: '',
                email: '',
                phone: '',
                company: '',
                status: 'new',
                source: 'manual',
                notes: ''
            });
            setShowAddModal(false);
        } catch (error) {
            console.error('Erro ao adicionar lead:', error);
        }
    };
    
    const handleImportCSV = async (e) => {
        e.preventDefault();
        if (!importFile) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const csv = event.target.result;
            const lines = csv.split('\n');
            const headers = lines[0].split(',');

            const importedLeads = [];

            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    const values = lines[i].split(',');
                    const lead = {
                        name: values[0] || '',
                        email: values[1] || '',
                        phone: values[2] || '',
                        company: values[3] || '',
                        status: 'new',
                        source: 'csv_import',
                        notes: values[4] || '',
                    };
                    importedLeads.push(lead);
                }
            }

            try {
                // This part could also be a single API call that accepts an array
                const promises = importedLeads.map(lead => fetch('/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(lead)
                }));
                
                await Promise.all(promises);
                
                fetchLeads(); // Refetch all leads to get updated list with IDs
                setImportFile(null);
                setShowImportModal(false);
            } catch (error) {
                console.error('Erro ao importar leads:', error);
            }
        };
        reader.readAsText(importFile);
    };

    const handleUpdateLeadStatus = async (leadId, newStatus) => {
        try {
            await fetch(`/api/leads/${leadId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            setLeads(leads.map(lead =>
                lead.id === leadId
                    ? { ...lead, status: newStatus }
                    : lead
            ));
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    const handleDeleteLead = async (leadId) => {
        if (window.confirm('Tem certeza que deseja excluir este lead?')) {
            try {
                await fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
                setLeads(leads.filter(lead => lead.id !== leadId));
            } catch (error) {
                console.error('Erro ao excluir lead:', error);
            }
        }
    };
    
    const handleBulkAction = async (action) => {
        if (selectedLeads.length === 0) return;

        try {
            const promises = selectedLeads.map(leadId => {
                if (action === 'delete') {
                    return fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
                } else {
                    return fetch(`/api/leads/${leadId}/status`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: action })
                    });
                }
            });

            await Promise.all(promises);

            if (action === 'delete') {
                setLeads(leads.filter(lead => !selectedLeads.includes(lead.id)));
            } else {
                setLeads(leads.map(lead =>
                    selectedLeads.includes(lead.id)
                        ? { ...lead, status: action }
                        : lead
                ));
            }
            setSelectedLeads([]);
        } catch (error) {
            console.error('Erro ao executar ação em massa:', error);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = (lead.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            (lead.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            (lead.company?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Carregando leads...</div>
            </div>
        );
    }

    return (
        <div className="leads-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Gerenciamento de Leads</h1>
                    <p>Gerencie sua base de leads e acompanhe o funil de vendas</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn-secondary"
                        onClick={() => setShowImportModal(true)}
                    >
                        <i className="fas fa-upload"></i>
                        Importar CSV
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => setShowAddModal(true)}
                    >
                        <i className="fas fa-plus"></i>
                        Adicionar Lead
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-users"></i>
                    </div>
                    <div className="stat-number">{leads.length}</div>
                    <div className="stat-label">Total de Leads</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-user-plus"></i>
                    </div>
                    <div className="stat-number">
                        {leads.filter(lead => lead.status === 'new').length}
                    </div>
                    <div className="stat-label">Novos Leads</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-phone"></i>
                    </div>
                    <div className="stat-number">
                        {leads.filter(lead => lead.status === 'contacted').length}
                    </div>
                    <div className="stat-label">Contatados</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="stat-number">
                        {leads.filter(lead => lead.status === 'converted').length}
                    </div>
                    <div className="stat-label">Convertidos</div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="filters-section">
                <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Buscar leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filters">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Todos os Status</option>
                        <option value="new">Novos</option>
                        <option value="contacted">Contatados</option>
                        <option value="qualified">Qualificados</option>
                        <option value="converted">Convertidos</option>
                    </select>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedLeads.length > 0 && (
                <div className="bulk-actions">
                    <span>{selectedLeads.length} leads selecionados</span>
                    <div className="bulk-buttons">
                        <button
                            className="btn-secondary"
                            onClick={() => handleBulkAction('contacted')}
                        >
                            Marcar como Contatado
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => handleBulkAction('qualified')}
                        >
                            Marcar como Qualificado
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => handleBulkAction('converted')}
                        >
                            Marcar como Convertido
                        </button>
                        <button
                            className="btn-danger"
                            onClick={() => handleBulkAction('delete')}
                        >
                            Excluir Selecionados
                        </button>
                    </div>
                </div>
            )}

            {/* Leads Table */}
            <div className="leads-table-container">
                <table className="leads-table">
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedLeads(filteredLeads.map(lead => lead.id));
                                        } else {
                                            setSelectedLeads([]);
                                        }
                                    }}
                                />
                            </th>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Telefone</th>
                            <th>Empresa</th>
                            <th>Status</th>
                            <th>Fonte</th>
                            <th>Data</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLeads.map((lead) => (
                            <tr key={lead.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedLeads.includes(lead.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedLeads([...selectedLeads, lead.id]);
                                            } else {
                                                setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                                            }
                                        }}
                                    />
                                </td>
                                <td>{lead.name}</td>
                                <td>{lead.email}</td>
                                <td>{lead.phone || 'N/A'}</td>
                                <td>{lead.company || 'N/A'}</td>
                                <td>
                                    <select
                                        value={lead.status}
                                        onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                                        className={`status-select ${lead.status}`}
                                    >
                                        <option value="new">Novo</option>
                                        <option value="contacted">Contatado</option>
                                        <option value="qualified">Qualificado</option>
                                        <option value="converted">Convertido</option>
                                    </select>
                                </td>
                                <td>
                                    <span className="source-badge">{lead.source}</span>
                                </td>
                                <td>
                                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon"
                                            onClick={() => {/* Implementar edição */}}
                                            title="Editar"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            className="btn-icon btn-danger"
                                            onClick={() => handleDeleteLead(lead.id)}
                                            title="Excluir"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredLeads.length === 0 && (
                            <tr>
                                <td colSpan="9" className="no-data">
                                    Nenhum lead encontrado
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Lead Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Adicionar Novo Lead</h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowAddModal(false)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleAddLead} className="modal-form">
                            <div className="form-group">
                                <label>Nome *</label>
                                <input
                                    type="text"
                                    value={newLead.name}
                                    onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    value={newLead.email}
                                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Telefone</label>
                                <input
                                    type="tel"
                                    value={newLead.phone}
                                    onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Empresa</label>
                                <input
                                    type="text"
                                    value={newLead.company}
                                    onChange={(e) => setNewLead({...newLead, company: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    value={newLead.status}
                                    onChange={(e) => setNewLead({...newLead, status: e.target.value})}
                                >
                                    <option value="new">Novo</option>
                                    <option value="contacted">Contatado</option>
                                    <option value="qualified">Qualificado</option>
                                    <option value="converted">Convertido</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Observações</label>
                                <textarea
                                    value={newLead.notes}
                                    onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                                    rows="3"
                                />
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Adicionar Lead
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Import CSV Modal */}
            {showImportModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Importar Leads via CSV</h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowImportModal(false)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleImportCSV} className="modal-form">
                            <div className="form-group">
                                <label>Arquivo CSV</label>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setImportFile(e.target.files[0])}
                                    required
                                />
                                <small>Formato esperado: Nome, Email, Telefone, Empresa, Observações</small>
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowImportModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Importar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leads;
