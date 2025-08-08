import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { db } from '../../firebase';

const InboxView = ({ onClose }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedWaId, setSelectedWaId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'conversations'), orderBy('updatedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setConversations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      if (!selectedWaId && snap.docs.length > 0) setSelectedWaId(snap.docs[0].id);
    });
    return () => unsub();
  }, [selectedWaId]);

  useEffect(() => {
    if (!selectedWaId) return;
    const mcol = collection(doc(db, 'conversations', selectedWaId), 'messages');
    const q = query(mcol, orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(q, (snap) => setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [selectedWaId]);

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedWaId) || null,
    [conversations, selectedWaId]
  );

  const send = async () => {
    if (!text.trim() || !selectedWaId) return;
    try {
      setSending(true);
      await fetch('/api/conversations/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wa_id: selectedWaId, text }),
      });
      setText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="inbox-view">
      <div className="inbox-header">
        <h2>Inbox de Conversas</h2>
        <button className="btn-secondary" onClick={onClose}><i className="fas fa-times"></i> Fechar</button>
      </div>
      <div className="inbox-body" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
        <div className="inbox-list" style={{ background: 'var(--card-bg)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          {conversations.length === 0 && (
            <div style={{ padding: 16, color: 'var(--text-muted)' }}>Nenhuma conversa ainda.</div>
          )}
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedWaId(c.id)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: 12, borderBottom: '1px solid var(--border-color)',
                background: c.id === selectedWaId ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                color: 'var(--text-primary)'
              }}
            >
              <div style={{ fontWeight: 600 }}>{c.leadName || c.id}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.status || 'active'}</div>
            </button>
          ))}
        </div>
        <div className="inbox-thread" style={{ background: 'var(--card-bg)', borderRadius: 12, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 12, borderBottom: '1px solid var(--border-color)' }}>
            <strong>{selected?.leadName || selectedWaId || 'Selecione uma conversa'}</strong>
          </div>
          <div style={{ flex: 1, padding: 12, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map((m) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: m.direction === 'outgoing' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '70%', padding: '8px 12px', borderRadius: 12,
                  background: m.direction === 'outgoing' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.06)'
                }}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                    {m.timestamp?.toDate ? m.timestamp.toDate().toLocaleTimeString() : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: 12, borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8 }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escreva uma mensagem"
              className="form-input"
              style={{ flex: 1, background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 12px' }}
            />
            <button className="btn-primary" onClick={send} disabled={sending || !text.trim()}>
              <i className="fas fa-paper-plane"></i> Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboxView;



