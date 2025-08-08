import React, { useCallback, useEffect, useState } from 'react';
import {
    addEdge,
    MarkerType,
    useEdgesState,
    useNodesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import FlowEditor from '../../flows/FlowEditor';
import InboxView from '../../flows/inbox/InboxView';
import './Agent.css';

// Componentes de nós personalizados
const MessageNode = ({ data }) => (
    <div className="message-node">
        <div className="node-header">
            <i className="fas fa-comment"></i>
            <span>Mensagem</span>
        </div>
        <div className="node-content">
            <p>{data.message}</p>
        </div>
    </div>
);

const ConditionNode = ({ data }) => (
    <div className="condition-node">
        <div className="node-header">
            <i className="fas fa-question-circle"></i>
            <span>Condição</span>
        </div>
        <div className="node-content">
            <p>{data.condition}</p>
        </div>
    </div>
);

const ActionNode = ({ data }) => (
    <div className="action-node">
        <div className="node-header">
            <i className="fas fa-cog"></i>
            <span>Ação</span>
        </div>
        <div className="node-content">
            <p>{data.action}</p>
        </div>
    </div>
);

const nodeTypes = {
    message: MessageNode,
    condition: ConditionNode,
    action: ActionNode
};

const Agent = () => {
    const [chatbots, setChatbots] = useState([]);
    const [selectedChatbot, setSelectedChatbot] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showFlowEditor, setShowFlowEditor] = useState(false);
    const [showInbox, setShowInbox] = useState(false);
    const [showConversationModal, setShowConversationModal] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newChatbot, setNewChatbot] = useState({
        name: '',
        description: '',
        status: 'active'
    });

    // Estados do React Flow
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [showNodeEditor, setShowNodeEditor] = useState(false);

    useEffect(() => {
        fetchChatbots();
    }, []);

    const fetchChatbots = async () => {
        try {
            const response = await fetch('/api/agents');
            const data = await response.json();
            setChatbots(data);
        } catch (error) {
            console.error('Erro ao buscar chatbots:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateChatbot = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/agents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newChatbot)
            });
            const createdChatbot = await response.json();
            setChatbots([...chatbots, createdChatbot]);
            setNewChatbot({ name: '', description: '', status: 'active' });
            setShowCreateModal(false);
        } catch (error) {
            console.error('Erro ao criar chatbot:', error);
        }
    };

    const handleDeleteChatbot = async (chatbotId) => {
        if (window.confirm('Tem certeza que deseja excluir este chatbot?')) {
            try {
                await fetch(`/api/agents/${chatbotId}`, { method: 'DELETE' });
                setChatbots(chatbots.filter(cb => cb.id !== chatbotId));
            } catch (error) {
                console.error('Erro ao excluir chatbot:', error);
            }
        }
    };

    const handleEditFlow = (chatbot) => {
        setSelectedChatbot(chatbot);
        if (chatbot.flows && chatbot.flows.length > 0) {
            const lastFlow = chatbot.flows[chatbot.flows.length - 1];
            setNodes(lastFlow.nodes || []);
            setEdges(lastFlow.edges || []);
        } else {
            const initialNodes = [{
                id: '1',
                type: 'message',
                position: { x: 250, y: 100 },
                data: { message: 'Olá! Como posso ajudar você hoje?' }
            }];
            setNodes(initialNodes);
            setEdges([]);
        }
        setShowFlowEditor(true);
    };

    const handleSaveFlow = async () => {
        if (!selectedChatbot) return;
        try {
            const flowData = {
                nodes,
                edges,
                updatedAt: new Date().toISOString()
            };
            const updatedFlows = selectedChatbot.flows ? [...selectedChatbot.flows, flowData] : [flowData];

            await fetch(`/api/agents/${selectedChatbot.id}/flow`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flows: updatedFlows })
            });

            const updatedChatbots = chatbots.map(cb =>
                cb.id === selectedChatbot.id
                    ? { ...cb, flows: updatedFlows }
                    : cb
            );
            setChatbots(updatedChatbots);
            setSelectedChatbot({ ...selectedChatbot, flows: updatedFlows });
            alert('Fluxo salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar fluxo:', error);
            alert('Erro ao salvar fluxo');
        }
    };


    const handleAddNode = (type) => {
        const newNode = {
            id: `${type}-${Date.now()}`,
            type,
            position: { x: Math.random() * 400, y: Math.random() * 300 },
            data: {
                message: type === 'message' ? 'Nova mensagem' : '',
                condition: type === 'condition' ? 'Nova condição' : '',
                action: type === 'action' ? 'Nova ação' : ''
            }
        };

        setNodes([...nodes, newNode]);
    };

    const handleNodeClick = (event, node) => {
        setSelectedNode(node);
        setShowNodeEditor(true);
    };

    const handleUpdateNode = (updatedData) => {
        const updatedNodes = nodes.map(node =>
            node.id === selectedNode.id
                ? { ...node, data: { ...node.data, ...updatedData } }
                : node
        );
        setNodes(updatedNodes);
        setShowNodeEditor(false);
        setSelectedNode(null);
    };

    const onConnect = useCallback((params) => {
        setEdges((eds) => addEdge({
            ...params,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed }
        }, eds));
    }, [setEdges]);

    const simulateConversation = (chatbot) => {
        const mockConversation = {
            id: `conv-${Date.now()}`,
            chatbotId: chatbot.id,
            leadName: 'João Silva',
            leadPhone: '+55 11 99999-9999',
            messages: [
                { type: 'incoming', text: 'Olá, gostaria de saber mais sobre seus serviços', timestamp: new Date().toISOString() },
                { type: 'outgoing', text: 'Olá! Como posso ajudar você hoje?', timestamp: new Date().toISOString() },
                { type: 'incoming', text: 'Quero criar um site para minha empresa', timestamp: new Date().toISOString() },
                { type: 'outgoing', text: 'Perfeito! Vou te ajudar com isso. Que tipo de empresa você tem?', timestamp: new Date().toISOString() },
                { type: 'incoming', text: 'Tenho uma loja de roupas', timestamp: new Date().toISOString() },
                { type: 'outgoing', text: 'Ótimo! Posso te ajudar a criar um site profissional para sua loja. Vou te enviar mais informações por email.', timestamp: new Date().toISOString() }
            ],
            status: 'active',
            category: 'sales',
            createdAt: new Date().toISOString()
        };

        setSelectedConversation(mockConversation);
        setShowConversationModal(true);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Carregando chatbots...</div>
            </div>
        );
    }

    return (
        <div className="agent-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Agente WhatsApp</h1>
                    <p>Configure chatbots inteligentes para automatizar suas conversas</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-secondary" onClick={() => setShowInbox(true)}>
                    <i className="fas fa-inbox"></i>
                    Inbox
                  </button>
                  <button
                      className="btn-primary"
                      onClick={() => setShowCreateModal(true)}
                  >
                      <i className="fas fa-plus"></i>
                      Novo Chatbot
                  </button>
                </div>
            </div>

            {/* Lista de Chatbots */}
            <div className="chatbots-section">
                <div className="section-header">
                    <h2>Seus Chatbots</h2>
                    <div className="stats">
                        <div className="stat-item">
                            <span className="stat-value">{chatbots.length}</span>
                            <span className="stat-label">Total</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{chatbots.filter(cb => cb.status === 'active').length}</span>
                            <span className="stat-label">Ativos</span>
                        </div>
                    </div>
                </div>

                {chatbots.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <i className="fas fa-robot"></i>
                        </div>
                        <h3>Nenhum chatbot criado</h3>
                        <p>Crie seu primeiro chatbot para começar a automatizar suas conversas</p>
                        <button
                            className="btn-primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            Criar Primeiro Chatbot
                        </button>
                    </div>
                ) : (
                    <div className="chatbots-grid">
                        {chatbots.map(chatbot => (
                            <div key={chatbot.id} className="chatbot-card">
                                <div className="chatbot-header">
                                    <div className="chatbot-info">
                                        <h3>{chatbot.name}</h3>
                                        <p>{chatbot.description}</p>
                                    </div>
                                    <div className={`status-badge ${chatbot.status}`}>
                                        {chatbot.status === 'active' ? 'Ativo' : 'Inativo'}
                                    </div>
                                </div>

                                <div className="chatbot-stats">
                                    <div className="stat">
                                        <span className="stat-value">{chatbot.flows?.length || 0}</span>
                                        <span className="stat-label">Fluxos</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-value">{chatbot.conversations?.length || 0}</span>
                                        <span className="stat-label">Conversas</span>
                                    </div>
                                </div>

                                <div className="chatbot-actions">
                                    <button
                                        className="btn-secondary"
                                        onClick={() => handleEditFlow(chatbot)}
                                        title="Editar fluxo"
                                    >
                                        <i className="fas fa-edit"></i>
                                        Editar Fluxo
                                    </button>
                                    <button
                                        className="btn-secondary"
                                        onClick={() => simulateConversation(chatbot)}
                                        title="Simular conversa"
                                    >
                                        <i className="fas fa-comments"></i>
                                        Simular
                                    </button>
                                    <button
                                        className="btn-danger"
                                        onClick={() => handleDeleteChatbot(chatbot.id)}
                                        title="Excluir chatbot"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Criação de Chatbot */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Criar Novo Chatbot</h2>
                            <button
                                className="btn-close"
                                onClick={() => setShowCreateModal(false)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleCreateChatbot} className="chatbot-form">
                            <div className="form-group">
                                <label>Nome do Chatbot</label>
                                <input
                                    type="text"
                                    value={newChatbot.name}
                                    onChange={(e) => setNewChatbot({...newChatbot, name: e.target.value})}
                                    placeholder="Ex: Suporte ao Cliente"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Descrição</label>
                                <textarea
                                    value={newChatbot.description}
                                    onChange={(e) => setNewChatbot({...newChatbot, description: e.target.value})}
                                    placeholder="Descreva o propósito deste chatbot"
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    value={newChatbot.status}
                                    onChange={(e) => setNewChatbot({...newChatbot, status: e.target.value})}
                                >
                                    <option value="active">Ativo</option>
                                    <option value="inactive">Inativo</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Criar Chatbot
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Editor de Fluxo */}
            {showFlowEditor && (
              <FlowEditor
                initialNodes={nodes}
                initialEdges={edges}
                onSave={({ nodes: n, edges: e }) => { setNodes(n); setEdges(e); handleSaveFlow(); }}
                onClose={() => setShowFlowEditor(false)}
              />
            )}

            {/* Editor de Nó */}
            {showNodeEditor && selectedNode && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Editar Nó</h2>
                            <button
                                className="btn-close"
                                onClick={() => setShowNodeEditor(false)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="node-editor">
                            {selectedNode.type === 'message' && (
                                <div className="form-group">
                                    <label>Mensagem</label>
                                    <textarea
                                        defaultValue={selectedNode.data.message}
                                        onBlur={(e) => handleUpdateNode({ message: e.target.value })}
                                        placeholder="Digite a mensagem que será enviada"
                                        rows="4"
                                    />
                                </div>
                            )}
                            {selectedNode.type === 'condition' && (
                                <div className="form-group">
                                    <label>Condição</label>
                                    <textarea
                                        defaultValue={selectedNode.data.condition}
                                        onBlur={(e) => handleUpdateNode({ condition: e.target.value })}
                                        placeholder="Digite a condição (ex: se contém 'preço')"
                                        rows="3"
                                    />
                                </div>
                            )}
                            {selectedNode.type === 'action' && (
                                <div className="form-group">
                                    <label>Ação</label>
                                    <textarea
                                        defaultValue={selectedNode.data.action}
                                        onBlur={(e) => handleUpdateNode({ action: e.target.value })}
                                        placeholder="Digite a ação (ex: enviar email, agendar reunião)"
                                        rows="3"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Simulação de Conversa */}
            {showConversationModal && selectedConversation && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Simulação de Conversa</h2>
                            <button
                                className="btn-close"
                                onClick={() => setShowConversationModal(false)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="conversation-info">
                            <div className="lead-info">
                                <strong>{selectedConversation.leadName}</strong>
                                <span>{selectedConversation.leadPhone}</span>
                            </div>
                            <div className={`category-badge ${selectedConversation.category}`}>
                                {selectedConversation.category === 'leads' ? 'Lead' :
                                 selectedConversation.category === 'pre-sales' ? 'Pré-venda' : 'Venda'}
                            </div>
                        </div>
                        <div className="conversation-messages">
                            {selectedConversation.messages.map((message, index) => (
                                <div key={index} className={`message ${message.type}`}>
                                    <div className="message-content">
                                        <p>{message.text}</p>
                                        <span className="message-time">
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Inbox */}
            {showInbox && (
              <div className="flow-editor-modal">
                <InboxView onClose={() => setShowInbox(false)} />
              </div>
            )}
        </div>
    );
};

export default Agent;
