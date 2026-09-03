import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Maximize2,
  Minimize2,
  Lock,
  Stethoscope,
  ChevronRight,
  Bot,
  User,
  ImagePlus,
  XCircle,
  Camera
} from 'lucide-react';
import api from '../../services/api.js';
import './ChatWidget.css';

const QUICK_PROMPTS = [
  "Remedies for acute migraine with aura",
  "Check safety: Amlodipine & Metformin",
  "Explain 30-day readmission risk factors",
  "How are patient records de-identified?"
];

const MAX_IMAGE_SIZE_MB = 10;

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: '👋 Hello Doctor. I am your Clinical AI Assistant for clinical decision support. All messages pass through our Server-Side Privacy Gateway before processing.\n\n📎 You can ask clinical questions, summarize reports, or attach medical images for visual analysis.\n\n⚠️ AI-generated information is intended only as clinical decision support. It must be reviewed and validated by an appropriately qualified healthcare professional before being used for patient care.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      redaction_count: 0
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Image attachment state
  const [attachedImage, setAttachedImage] = useState(null); // { base64, preview, name, size, mimeType }
  const [isDragging, setIsDragging] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open]);

  // --- Image handling ---
  const processFile = useCallback((file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please attach an image file (JPEG, PNG, WEBP, GIF).');
      return;
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      alert(`Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedImage({
        base64: reader.result,
        preview: reader.result,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    processFile(file);
    // Reset the input so same file can be re-selected
    e.target.value = '';
  };

  const removeAttachedImage = () => {
    setAttachedImage(null);
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're leaving the drop zone entirely
    if (e.currentTarget && !e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  // --- Send message ---
  const sendMessage = async (textToSend) => {
    const query = (textToSend || inputMsg).trim();
    if ((!query && !attachedImage) || loading) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = {
      sender: 'user',
      text: query || '📷 [Image attached for analysis]',
      time: currentTime,
      imagePreview: attachedImage?.preview || null
    };
    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg('');

    const imageToSend = attachedImage;
    setAttachedImage(null);
    setLoading(true);

    try {
      const messageText = query || 'Please analyze this medical image and provide clinical observations, differential diagnoses, and recommendations.';
      const res = await api.sendChatMessage(
        messageText,
        imageToSend?.base64 || null,
        imageToSend?.mimeType || 'image/jpeg'
      );
      const botMessage = {
        sender: 'bot',
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        redaction_count: res.redaction_count || 0,
        sanitized_message: res.sanitized_message
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: '⚠️ Unable to connect to the Clinical AI Gateway. Please ensure backend services are active.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          redaction_count: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: '🧹 Conversation cleared. Attach images with 📷 or type a clinical question.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        redaction_count: 0
      }
    ]);
    setAttachedImage(null);
  };

  return (
    <div className={`chat-widget ${isExpanded ? 'chat-widget-expanded-mode' : ''}`}>
      {open && (
        <div
          className={`chat-widget-panel ${isExpanded ? 'expanded' : ''}`}
          ref={dropZoneRef}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Drag Overlay */}
          {isDragging && (
            <div className="chat-drag-overlay">
              <div className="chat-drag-overlay-content">
                <Camera size={40} />
                <span>Drop medical image here</span>
                <span className="chat-drag-subtitle">X-ray, ECG, Dermatology photo, Lab scan</span>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="chat-widget-header">
            <div className="chat-header-main">
              <div className="chat-header-title-box">
                <div className="chat-bot-avatar">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3>Clinical AI Copilot</h3>
                    <span className="chat-ai-live-badge">Gemini Active</span>
                  </div>
                  <span className="chat-privacy-indicator">
                    <ShieldCheck size={11} /> Server-Side Privacy Gateway Active
                  </span>
                </div>
              </div>
              <div className="chat-header-actions">
                <button
                  className="chat-icon-btn"
                  title={isExpanded ? 'Collapse' : 'Expand'}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
                <button
                  className="chat-icon-btn"
                  title="Clear conversation"
                  onClick={handleClearChat}
                >
                  <Trash2 size={15} />
                </button>
                <button
                  className="chat-icon-btn"
                  title="Close chat"
                  onClick={() => {
                    setOpen(false);
                    setIsExpanded(false);
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="chat-quick-prompts">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                className="chat-prompt-pill"
                onClick={() => sendMessage(prompt)}
                disabled={loading}
              >
                <ChevronRight size={12} className="pill-arrow" /> {prompt}
              </button>
            ))}
          </div>

          {/* Body / Messages */}
          <div className="chat-widget-body">
            <div className="chat-messages-container">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`chat-message-row ${m.sender === 'user' ? 'user-row' : 'bot-row'}`}
                >
                  <div className="chat-avatar-icon">
                    {m.sender === 'user' ? <User size={13} /> : <Bot size={13} />}
                  </div>
                  <div className="chat-bubble-wrapper">
                    <div className={`chat-bubble ${m.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                      {/* Image preview in message */}
                      {m.imagePreview && (
                        <div className="chat-bubble-image">
                          <img src={m.imagePreview} alt="Attached medical image" />
                          <span className="chat-bubble-image-label">
                            <Camera size={10} /> Medical Image Attached
                          </span>
                        </div>
                      )}
                      <p className="chat-text-content">{m.text}</p>
                      {m.redaction_count > 0 && (
                        <div className="chat-redaction-audit-pill">
                          <Lock size={10} /> {m.redaction_count} PHI item(s) sanitized in transit
                        </div>
                      )}
                    </div>
                    <span className="chat-timestamp">{m.time}</span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="chat-message-row bot-row">
                  <div className="chat-avatar-icon">
                    <Bot size={13} />
                  </div>
                  <div className="chat-bubble bot-bubble typing-bubble">
                    <RefreshCw className="animate-spin" size={13} />
                    <span>{attachedImage ? 'Analyzing image with Gemini Vision...' : 'De-identifying & generating decision support...'}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Decision Support Compliance Notice */}
            <div className="chat-compliance-footer">
              <AlertTriangle size={11} className="compliance-icon" />
              <span>AI-generated information is intended only as clinical decision support. It must be reviewed and validated by an appropriately qualified healthcare professional before being used for patient care.</span>
            </div>

            {/* Image Preview Bar (when image is attached) */}
            {attachedImage && (
              <div className="chat-image-preview-bar">
                <div className="chat-image-preview-thumb">
                  <img src={attachedImage.preview} alt="Preview" />
                </div>
                <div className="chat-image-preview-info">
                  <span className="chat-image-preview-name">{attachedImage.name}</span>
                  <span className="chat-image-preview-size">{attachedImage.size}</span>
                </div>
                <button
                  className="chat-image-preview-remove"
                  onClick={removeAttachedImage}
                  title="Remove image"
                >
                  <XCircle size={16} />
                </button>
              </div>
            )}

            {/* Input Footer */}
            <div className="chat-input-box">
              {/* Image attach button */}
              <button
                className="chat-attach-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                title="Attach medical image (X-ray, ECG, photo)"
              >
                <ImagePlus size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <input
                type="text"
                placeholder={attachedImage ? "Add context for the image..." : "Ask clinical question, symptom evaluation, remedy..."}
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                disabled={loading}
              />
              <button
                className="chat-send-btn"
                onClick={() => sendMessage()}
                disabled={loading || (!inputMsg.trim() && !attachedImage)}
              >
                {loading ? <RefreshCw className="animate-spin" size={15} /> : <Send size={15} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button className="chat-widget-btn" onClick={() => setOpen(!open)}>
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && <span className="notification-dot">AI</span>}
      </button>
    </div>
  );
};

export default ChatWidget;
