import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import api from '../../services/api.js';
import './ChatWidget.css';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '👋 Hi! How can we help with your Clinical Management workflow today?' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (textToSend) => {
    const query = textToSend || inputMsg;
    if (!query.trim()) return;

    const userMessage = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(query);
      setMessages((prev) => [...prev, { sender: 'bot', text: res.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Sorry, I am currently unable to reach the support server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-widget-panel">
          <div className="chat-widget-header">
            <h3>Support & AI Assistant</h3>
            <p>Powered by FastAPI Backend</p>
          </div>
          <div className="chat-widget-body" style={{ display: 'flex', flexDirection: 'column', height: '320px' }}>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '8px' }}>
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: m.sender === 'user' ? 'var(--sage-600)' : '#F3F4F6',
                    color: m.sender === 'user' ? 'white' : '#1F2937',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    maxWidth: '85%',
                    wordBreak: 'break-word'
                  }}
                >
                  {m.text}
                </div>
              ))}
              {loading && (
                <div style={{ alignSelf: 'flex-start', fontSize: '11px', color: '#9CA3AF', fontStyle: 'italic' }}>
                  Assistant is typing...
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '6px', paddingTop: '8px', borderTop: '1px solid #E5E7EB' }}>
              <input
                type="text"
                placeholder="Ask a question..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #D0D5DD', fontSize: '12px' }}
              />
              <button
                onClick={() => sendMessage()}
                style={{ background: 'var(--sage-600)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' }}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
      <button className="chat-widget-btn" onClick={() => setOpen(!open)}>
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && <span className="notification-dot">1</span>}
      </button>
    </div>
  );
};

export default ChatWidget;
