import React from 'react';
import { Handle, Position } from 'reactflow';

// Schemas: definem os campos exigidos/configuráveis por tipo de nó
export const nodeSchemas = {
  'trigger:newMessage': {
    title: 'Gatilho: Nova Mensagem',
    fields: [
      { key: 'matchMode', label: 'Ativar quando', type: 'select', options: ['any', 'keywords', 'regex'], required: true, default: 'any' },
      { key: 'keywords', label: 'Palavras-chave (separadas por vírgula)', type: 'text', required: false, default: '' },
      { key: 'regex', label: 'Regex', type: 'text', required: false, default: '' },
    ],
  },
  'trigger:scheduled': {
    title: 'Gatilho: Agendado',
    fields: [
      { key: 'scheduleType', label: 'Tipo', type: 'select', options: ['once', 'recurring'], required: true, default: 'once' },
      { key: 'dateTime', label: 'Data/Hora (ISO)', type: 'text', required: false, default: '' },
      { key: 'cron', label: 'Cron (recorrente)', type: 'text', required: false, default: '' },
    ],
  },
  'action:sendMessage': {
    title: 'Ação: Enviar Mensagem',
    fields: [
      { key: 'type', label: 'Tipo', type: 'select', options: ['text'], required: true, default: 'text' },
      { key: 'text', label: 'Texto', type: 'textarea', required: true, default: 'Olá! {{contact.name}}' },
    ],
  },
  'action:apiRequest': {
    title: 'Ação: Requisição HTTP',
    fields: [
      { key: 'method', label: 'Método', type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], required: true, default: 'GET' },
      { key: 'url', label: 'URL', type: 'text', required: true, default: '' },
      { key: 'headers', label: 'Headers (k=v por linha)', type: 'textarea', required: false, default: '' },
      { key: 'query', label: 'Query Params (k=v por linha)', type: 'textarea', required: false, default: '' },
      { key: 'body', label: 'Body JSON', type: 'textarea', required: false, default: '' },
      { key: 'mapResponse', label: 'Mapeamentos (from->to por linha)', type: 'textarea', required: false, default: '' },
      { key: 'timeoutMs', label: 'Timeout (ms)', type: 'number', required: false, default: 15000 },
    ],
  },
  'action:setVariable': {
    title: 'Ação: Definir Variável',
    fields: [
      { key: 'scope', label: 'Escopo', type: 'select', options: ['contact', 'vars'], required: true, default: 'contact' },
      { key: 'name', label: 'Nome', type: 'text', required: true, default: '' },
      { key: 'value', label: 'Valor', type: 'text', required: true, default: '' },
    ],
  },
  'logic:branch': {
    title: 'Lógica: Condição (If/Else)',
    fields: [
      { key: 'mode', label: 'Modo', type: 'select', options: ['ALL', 'ANY'], required: true, default: 'ALL' },
      { key: 'conditions', label: 'Condições (uma por linha: left op right)', type: 'textarea', required: true, default: 'contact.name EQUALS João' },
    ],
  },
  'logic:delay': {
    title: 'Lógica: Aguardar',
    fields: [
      { key: 'ms', label: 'Duração', type: 'number', required: true, default: 5 },
      { key: 'unit', label: 'Unidade', type: 'select', options: ['seconds', 'minutes', 'hours', 'days'], required: true, default: 'minutes' },
    ],
  },
  'logic:humanTakeover': {
    title: 'Lógica: Transferir para Humano',
    fields: [
      // sem campos obrigatórios
    ],
  },
};

export function getDefaultConfigFor(type) {
  const schema = nodeSchemas[type];
  const cfg = {};
  if (!schema) return cfg;
  for (const f of schema.fields) {
    cfg[f.key] = f.default ?? '';
  }
  return cfg;
}

export function validateConfig(type, config) {
  const schema = nodeSchemas[type];
  if (!schema) return true;
  for (const f of schema.fields) {
    if (f.required) {
      const v = config?.[f.key];
      if (v === undefined || v === null || String(v).trim() === '') return false;
    }
  }
  return true;
}

// Componentes com handles apropriados por tipo
const Card = ({ title, subtitle, color = '#8b5cf6', children, invalid }) => (
  <div style={{
    padding: 12,
    borderRadius: 10,
    minWidth: 200,
    background: 'var(--bg-primary)',
    border: `2px solid ${invalid ? '#ef4444' : color}`,
    color: 'var(--text-primary)'
  }}>
    <div style={{ fontSize: 12, textTransform: 'uppercase', opacity: 0.8 }}>{title}</div>
    {subtitle ? <div style={{ marginTop: 6, fontWeight: 600 }}>{subtitle}</div> : null}
    {children}
  </div>
);

const TriggerNode = ({ data, nodeType }) => {
  const invalid = !validateConfig(nodeType, data?.config || {});
  return (
  <Card title="Trigger" subtitle={data?.subtitle} color="#22c55e" invalid={invalid}>
    <Handle type="source" id="out" position={Position.Bottom} style={{ background: '#22c55e' }} />
  </Card>
)};

const ActionNode = ({ data, title, color, nodeType }) => {
  const invalid = !validateConfig(nodeType, data?.config || {});
  return (
  <Card title={title} subtitle={data?.subtitle} color={color} invalid={invalid}>
    <Handle type="target" id="in" position={Position.Top} />
    <Handle type="source" id="out" position={Position.Bottom} />
  </Card>
)};

const BranchNode = ({ data }) => {
  const invalid = !(data?.config && data?.config?.conditions);
  return (
  <Card title="Condição" subtitle={data?.config?.mode || 'ALL'} color="#f59e0b" invalid={invalid}>
    <Handle type="target" id="in" position={Position.Top} />
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
      <div style={{ fontSize: 12, opacity: 0.8 }}>true</div>
      <div style={{ fontSize: 12, opacity: 0.8 }}>false</div>
    </div>
    <Handle type="source" id="true" position={Position.Bottom} style={{ left: '25%' }} />
    <Handle type="source" id="false" position={Position.Bottom} style={{ left: '75%' }} />
  </Card>
)};

export const nodeComponents = {
  'trigger:newMessage': ({ data }) => <TriggerNode nodeType={'trigger:newMessage'} data={{ ...data, subtitle: data?.config?.matchMode || 'any' }} />,
  'trigger:scheduled': ({ data }) => <TriggerNode nodeType={'trigger:scheduled'} data={{ ...data, subtitle: data?.config?.scheduleType || 'once' }} />,
  'action:sendMessage': ({ data }) => <ActionNode nodeType={'action:sendMessage'} data={{ ...data, subtitle: (data?.config?.text || '').slice(0, 30) }} title="Enviar Mensagem" color="#3b82f6" />,
  'action:apiRequest': ({ data }) => <ActionNode nodeType={'action:apiRequest'} data={{ ...data, subtitle: data?.config?.method || 'GET' }} title="HTTP Request" color="#06b6d4" />,
  'action:setVariable': ({ data }) => <ActionNode nodeType={'action:setVariable'} data={{ ...data, subtitle: data?.config?.name || '' }} title="Set Variável" color="#06b6d4" />,
  'logic:branch': ({ data }) => <BranchNode data={data} />,
  'logic:delay': ({ data }) => <ActionNode nodeType={'logic:delay'} data={{ ...data, subtitle: `${data?.config?.ms || 0} ${data?.config?.unit || 's'}` }} title="Aguardar" color="#f59e0b" />,
  'logic:humanTakeover': ({ data }) => <ActionNode nodeType={'logic:humanTakeover'} data={data} title="Transferir p/ Humano" color="#ef4444" />,
};


