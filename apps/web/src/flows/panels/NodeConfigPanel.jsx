import React from 'react';
import { nodeSchemas } from '../nodes/registry.jsx';

function parseKV(text = '') {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [k, ...r] = l.split('=');
      return { key: k?.trim(), value: r.join('=')?.trim() };
    });
}

function parseMap(text = '') {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [from, to] = l.split('->').map((s) => s.trim());
      return { from, to };
    });
}

const NodeConfigPanel = ({ node, onChange }) => {
  if (!node) return null;
  const schema = nodeSchemas[node.type];
  const config = node.data?.config || {};

  const update = (key, value) => {
    const next = { ...config, [key]: value };
    onChange({ ...node, data: { ...(node.data || {}), config: next } });
  };

  return (
    <div style={{ width: 360, borderLeft: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
      <div style={{ padding: 16, borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ fontWeight: 700 }}>{schema?.title || 'Configuração'}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{node.type}</div>
      </div>
      <div style={{ padding: 16, display: 'grid', gap: 12 }}>
        {(schema?.fields || []).map((f) => (
          <div key={f.key} className="form-group">
            <label>{f.label}</label>
            {f.type === 'text' && (
              <input value={config[f.key] ?? ''} onChange={(e) => update(f.key, e.target.value)} />
            )}
            {f.type === 'textarea' && (
              <textarea value={config[f.key] ?? ''} onChange={(e) => update(f.key, e.target.value)} rows={4} />
            )}
            {f.type === 'number' && (
              <input type="number" value={config[f.key] ?? f.default ?? 0} onChange={(e) => update(f.key, Number(e.target.value))} />
            )}
            {f.type === 'select' && (
              <select value={config[f.key] ?? f.default} onChange={(e) => update(f.key, e.target.value)}>
                {f.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
          </div>
        ))}

        {/* Auxiliares para campos compostos no apiRequest */}
        {node.type === 'action:apiRequest' && (
          <>
            <div className="form-group">
              <label>Headers (k=v por linha)</label>
              <textarea
                value={config.headers || ''}
                onChange={(e) => update('headers', e.target.value)}
                placeholder="Authorization=Bearer ...\nContent-Type=application/json"
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Query (k=v por linha)</label>
              <textarea
                value={config.query || ''}
                onChange={(e) => update('query', e.target.value)}
                placeholder="q=teste\nlimit=10"
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Mapeamentos (from→to por linha)</label>
              <textarea
                value={config.mapResponse || ''}
                onChange={(e) => update('mapResponse', e.target.value)}
                placeholder="data.user.name→vars.userName"
                rows={3}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NodeConfigPanel;


