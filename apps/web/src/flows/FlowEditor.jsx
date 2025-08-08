import dagre from 'dagre';
import React, { useCallback, useState } from 'react';
import ReactFlow, { addEdge, Background, Controls, MarkerType, MiniMap, useEdgesState, useNodesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { getDefaultConfigFor, nodeComponents } from './nodes/registry.jsx';
import NodeConfigPanel from './panels/NodeConfigPanel';

const FlowEditor = ({ initialNodes = [], initialEdges = [], onSave, onClose }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } }, eds));
  }, [setEdges]);

  const addNode = (type) => {
    const id = `${type}-${Date.now()}`;
    const position = { x: 200 + Math.random() * 300, y: 100 + Math.random() * 200 };
    const config = getDefaultConfigFor(type);
    setNodes((nds) => nds.concat({ id, type, position, data: { config } }));
  };

  const save = () => onSave?.({ nodes, edges });

  const removeSelected = () => {
    if (!selectedNode) return;
    const id = selectedNode.id;
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setSelectedNode(null);
  };

  const duplicateSelected = () => {
    if (!selectedNode) return;
    const src = selectedNode;
    const cloneId = `${src.type}-${Date.now()}`;
    const newNode = {
      ...src,
      id: cloneId,
      position: { x: (src.position?.x || 0) + 40, y: (src.position?.y || 0) + 40 },
      data: JSON.parse(JSON.stringify(src.data || {})),
    };
    setNodes((nds) => nds.concat(newNode));
    setSelectedNode(newNode);
  };

  const autoLayout = () => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 80 });
    g.setDefaultEdgeLabel(() => ({}));

    const NODE_WIDTH = 220;
    const NODE_HEIGHT = 100;

    nodes.forEach((n) => {
      g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });
    edges.forEach((e) => {
      g.setEdge(e.source, e.target);
    });

    dagre.layout(g);

    setNodes((nds) => nds.map((n) => {
      const pos = g.node(n.id);
      if (!pos) return n;
      return { ...n, position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 } };
    }));
  };

  return (
    <div className="flow-editor-modal">
      <div className="flow-editor-header">
        <div className="editor-info">
          <h2>Editor de Fluxo</h2>
          <p>Arraste e conecte os nós para criar o fluxo de conversa</p>
        </div>
        <div className="editor-actions">
          <button className="btn-secondary" onClick={onClose}><i className="fas fa-times"></i> Fechar</button>
          <button className="btn-primary" onClick={save}><i className="fas fa-save"></i> Salvar Fluxo</button>
        </div>
      </div>

      <div className="flow-toolbar">
        <button className="btn-tool" onClick={() => addNode('trigger:newMessage')}><i className="fas fa-bolt"></i> Nova Mensagem</button>
        <button className="btn-tool" onClick={() => addNode('trigger:scheduled')}><i className="fas fa-clock"></i> Agendado</button>
        <button className="btn-tool" onClick={() => addNode('action:sendMessage')}><i className="fas fa-comment"></i> Enviar Mensagem</button>
        <button className="btn-tool" onClick={() => addNode('action:apiRequest')}><i className="fas fa-globe"></i> HTTP</button>
        <button className="btn-tool" onClick={() => addNode('action:setVariable')}><i className="fas fa-pen"></i> Set Variável</button>
        <button className="btn-tool" onClick={() => addNode('logic:branch')}><i className="fas fa-code-branch"></i> Condição</button>
        <button className="btn-tool" onClick={() => addNode('logic:delay')}><i className="fas fa-hourglass"></i> Aguardar</button>
        <button className="btn-tool" onClick={() => addNode('logic:humanTakeover')}><i className="fas fa-user-tie"></i> Humano</button>
        <div style={{ flex: 1 }} />
        <button className="btn-tool" onClick={duplicateSelected} disabled={!selectedNode}><i className="fas fa-clone"></i> Duplicar</button>
        <button className="btn-tool" onClick={removeSelected} disabled={!selectedNode}><i className="fas fa-trash"></i> Remover</button>
        <button className="btn-tool" onClick={autoLayout}><i className="fas fa-sitemap"></i> Auto-layout</button>
      </div>

      <div className="flow-canvas" style={{ display: 'grid', gridTemplateColumns: '1fr 360px' }}>
        <div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, n) => setSelectedNode(n)}
            nodeTypes={nodeComponents}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
        <NodeConfigPanel
          node={selectedNode}
          onChange={(newNode) => setNodes((list) => list.map((n) => (n.id === newNode.id ? newNode : n)))}
        />
      </div>
    </div>
  );
};

export default FlowEditor;


