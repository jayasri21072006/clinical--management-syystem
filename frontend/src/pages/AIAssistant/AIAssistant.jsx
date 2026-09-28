import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  Search,
  User,
  Send,
  Paperclip,
  Mic,
  MicOff,
  X,
  Plus,
  MessageSquare,
  Lock,
  AlertTriangle,
  Upload,
  XCircle,
  ClipboardList,
  FlaskConical,
  Image as ImageIcon,
  Pill,
  FileText,
  FileHeart,
  Calendar,
  Activity,
  Heart,
  Shield,
  FileCheck,
  BookOpen
} from 'lucide-react';
import clinicalAIService from '../../services/clinicalAIService';
import { api } from '../../services/api';
import { ResponseValidator } from '../../components/ClinicalAI/ClinicalResponseRenderers';
import SourceViewerModal from '../../components/ClinicalAI/SourceViewerModal';
import './AIAssistant.css';

/* Central Quick Action Definitions */
const QUICK_ACTIONS = [
  { key: 'patient_summary', label: 'Patient Summary', icon: ClipboardList, prompt: 'Provide a patient summary' },
  { key: 'lab_analysis', label: 'Lab Analysis', icon: FlaskConical, prompt: 'Analyze latest lab results' },
  { key: 'medication_review', label: 'Medication Review', icon: Pill, prompt: 'Review current medication list' },
  { key: 'patient_instructions', label: 'Patient Instructions', icon: Heart, prompt: 'Create take-home patient instructions' },
  { key: 'clinical_timeline', label: 'Clinical Timeline', icon: Calendar, prompt: 'Generate clinical timeline' },
  { key: 'prior_authorization', label: 'Prior Authorization', icon: FileCheck, prompt: 'Generate prior authorization draft' },
  { key: 'document_analysis', label: 'Document Analysis', icon: FileText, prompt: 'Analyze attached clinical document' }
];

/* Welcome Suggestions */
const WELCOME_SUGGESTIONS = [
  { action: 'patient_summary', text: "Summarize this patient's history", icon: ClipboardList },
  { action: 'lab_analysis', text: "Review latest lab results & trends", icon: FlaskConical },
  { action: 'medication_review', text: "Check medications for interactions", icon: Pill },
  { action: 'clinical_timeline', text: "Show clinical timeline progression", icon: Calendar },
];

/* Context Options */
const CONTEXT_OPTIONS = [
  { key: 'history', label: 'Medical History' },
  { key: 'labs', label: 'Labs' },
  { key: 'medications', label: 'Medications' },
  { key: 'notes', label: 'Previous Notes' },
  { key: 'imaging', label: 'Imaging' },
];

const AIAssistant = () => {
  const location = useLocation();

  // Patient State
  const [patientSearch, setPatientSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Context Toggles
  const [activeContext, setActiveContext] = useState({
    history: true, labs: true, medications: true, notes: true, imaging: true
  });

  // Sessions & Messages
  const [sessions, setSessions] = useState([
    { id: 'session-1', title: 'New Conversation', patientName: 'John Doe', date: 'Today', messages: [] }
  ]);
  const [activeSessionId, setActiveSessionId] = useState('session-1');
  const [messages, setMessages] = useState([]);

  // Input & Attachments
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState(null);

  // Modal State
  const [viewingSource, setViewingSource] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initial Patient Load
  useEffect(() => {
    clinicalAIService.searchPatients('').then(list => {
      setSearchResults(list);
      if (list.length > 0) setSelectedPatient(list[0]);
    });
  }, []);

  const handleSearchChange = (val) => {
    setPatientSearch(val);
    setShowPatientDropdown(true);
    clinicalAIService.searchPatients(val).then(res => setSearchResults(res));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Context Controls
  const toggleContext = (key) => setActiveContext(prev => ({ ...prev, [key]: !prev[key] }));
  const handleSelectAllContext = () => setActiveContext({ history: true, labs: true, medications: true, notes: true, imaging: true });
  const handleClearAllContext = () => setActiveContext({ history: false, labs: false, medications: false, notes: false, imaging: false });

  // Patient Selection
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientSearch('');
    setShowPatientDropdown(false);
  };
  const handleDeselectPatient = () => setSelectedPatient(null);

  // Session Handlers
  const handleNewSession = () => {
    const newId = `session-${Date.now()}`;
    const pName = selectedPatient ? selectedPatient.name : 'General';
    const newSession = { id: newId, title: 'New Conversation', patientName: pName, date: 'Today', messages: [] };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setMessages([]);
  };

  const handleSwitchSession = (sessionId) => {
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages } : s));
    const target = sessions.find(s => s.id === sessionId);
    if (target) {
      setActiveSessionId(sessionId);
      setMessages(target.messages || []);
    }
  };

  /* File Handling */
  const processFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        mimeType: file.type || 'application/pdf',
        base64: reader.result
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileSelect = (e) => { processFile(e.target.files[0]); e.target.value = ''; };
  const removeFile = () => setAttachedFile(null);

  // Drag and Drop
  const handleDragEnter = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); e.stopPropagation(); if (e.currentTarget && !e.currentTarget.contains(e.relatedTarget)) setIsDragging(false); }, []);
  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files?.length > 0) processFile(files[0]);
  }, [processFile]);

  /* Voice Input */
  const toggleVoice = () => {
    setVoiceError(null);
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceError('Voice input is not supported in this browser.');
      return;
    }
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); return; }
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false; recognition.interimResults = false; recognition.lang = 'en-US';
      recognition.onresult = (event) => { setInputText(prev => prev ? `${prev} ${event.results[0][0].transcript}` : event.results[0][0].transcript); setIsRecording(false); };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition; recognition.start(); setIsRecording(true);
    } catch { setVoiceError('Unable to access microphone.'); setIsRecording(false); }
  };

  /**
   * RUN CLINICAL ACTION ROUTER
   */
  const executeClinicalAction = async (actionKey, queryText = '') => {
    const text = (queryText || inputText).trim();
    if (!text && !attachedFile && actionKey === 'general' && !queryText) return;

    const fileToSend = attachedFile;
    const effectiveText = text || (fileToSend ? `Please analyze this attached document (${fileToSend.name}) thoroughly, extract key clinical findings, and provide the best next medical steps.` : `Executing ${actionKey}`);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // User Message
    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: effectiveText,
      time: now,
      fileName: fileToSend?.name || null
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setAttachedFile(null);
    setIsLoading(true);

    // Update Session Title
    if (messages.length === 0) {
      const titleText = (fileToSend ? `DOC: ${fileToSend.name.slice(0, 18)}` : (actionKey === 'general' ? (text.slice(0, 24) || 'Clinical Chat') : actionKey.replace(/_/g, ' '))).toUpperCase();
      setSessions(prev => prev.map(s =>
        s.id === activeSessionId ? { ...s, title: titleText, patientName: selectedPatient ? selectedPatient.name : 'General' } : s
      ));
    }

    try {
      let resultData;

      // 1. If it's a general natural chat message or attached document analysis
      if (actionKey === 'general' || (actionKey === 'document_analysis' && fileToSend) || fileToSend) {
        const chatPrompt = selectedPatient 
          ? `[Patient Context: ${selectedPatient.name}, Age: ${selectedPatient.age}, Gender: ${selectedPatient.gender}]\nClinician Query: ${effectiveText}`
          : effectiveText;

        const response = await api.sendChatMessage(
          chatPrompt,
          fileToSend?.base64 || null,
          fileToSend?.mimeType || (fileToSend?.name?.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
          activeSessionId
        );

        resultData = {
          type: 'chat',
          reply: response.reply,
          model_used: response.model_used,
          redaction_count: response.redaction_count,
          disclaimer: response.disclaimer
        };
      } else {
        // 2. Structured Quick Action
        resultData = await clinicalAIService.runClinicalAIAction({
          action: actionKey,
          patientId: selectedPatient?.id || 'P-10294',
          input: text,
          context: activeContext,
          file: fileToSend
        });
      }

      // AI Response Message
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        expectedType: actionKey,
        ...resultData
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Execution error:', err);
      const isGreeting = /^(hi|hello|hey|greetings|good morning|good evening)/i.test(text.trim());
      const replyText = isGreeting
        ? "Hello! I am your Clinical AI Assistant. How can I assist you with medical questions, patient records, or clinical decision support today?"
        : "I am here to assist with medical knowledge, disease mechanisms, lab reviews, and clinical decision support. How can I assist you further?";

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        type: 'chat',
        reply: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="clinical-ai-page"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {viewingSource && <SourceViewerModal source={viewingSource} onClose={() => setViewingSource(null)} />}

      {isDragging && (
        <div className="ai-drag-overlay">
          <Upload size={48} />
          <span>Drop file here to attach</span>
          <span className="drag-sub">PDF, DOCX, TXT, or Medical Image scans</span>
        </div>
      )}

      {/* ═══ LEFT PANEL: PATIENT CONTEXT & SESSIONS ═══ */}
      <div className="ai-left-panel">
        <div className="ai-left-header">
          <h2><User size={18} /> Patient Context</h2>
          <div className="patient-search-box">
            <Search size={14} className="patient-search-icon" />
            <input
              type="text"
              placeholder="Search by name, ID, phone, DOB..."
              value={patientSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowPatientDropdown(true)}
            />
            {showPatientDropdown && searchResults.length > 0 && (
              <div className="patient-search-results">
                {searchResults.map((p) => (
                  <div key={p.id} className="patient-search-item" onMouseDown={() => handleSelectPatient(p)}>
                    <div className="patient-search-item-avatar">{p.name?.[0] || '?'}</div>
                    <div className="patient-search-item-info">
                      <div className="patient-search-item-name">{p.name} ({p.mrn || p.id})</div>
                      <div className="patient-search-item-meta">{p.age}y {p.gender} · DOB: {p.dob}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedPatient ? (
          <div className="selected-patient-card">
            <div className="selected-patient-top">
              <div className="selected-patient-avatar">{selectedPatient.name?.[0] || '?'}</div>
              <div>
                <div className="selected-patient-name">{selectedPatient.name}</div>
                <div className="selected-patient-id">{selectedPatient.mrn || selectedPatient.id}</div>
              </div>
            </div>

            <div className="selected-patient-details">
              <div className="patient-detail-row"><span className="patient-detail-label">Age / Sex</span><span className="patient-detail-value">{selectedPatient.age}y · {selectedPatient.gender}</span></div>
              <div className="patient-detail-row patient-detail-full"><span className="patient-detail-label">Allergies</span><span className="patient-detail-value alert">{selectedPatient.allergies?.join(', ') || 'NKDA'}</span></div>
              <div className="patient-detail-row patient-detail-full"><span className="patient-detail-label">Active Conditions</span><span className="patient-detail-value">{selectedPatient.conditions?.map(c => c.name).join(', ')}</span></div>
              <div className="patient-detail-row patient-detail-full"><span className="patient-detail-label">Medications</span><span className="patient-detail-value">{selectedPatient.medications?.map(m => m.name).join(', ')}</span></div>
            </div>

            <div className="patient-card-actions">
              <button className="btn-patient-act" onClick={() => setShowPatientDropdown(true)}>Change Patient</button>
              <button className="btn-patient-act clear" onClick={handleDeselectPatient}><X size={12} /> Clear</button>
            </div>
          </div>
        ) : (
          <div className="no-patient-state">
            <User size={32} />
            <p>Search and select a patient to provide clinical context to the AI assistant.</p>
          </div>
        )}



        {/* Session History */}
        <div className="session-history">
          <div className="session-history-header">
            <span className="session-history-title">Conversations</span>
            <button className="btn-new-session" onClick={handleNewSession}><Plus size={13} /> New Conversation</button>
          </div>
          <div className="session-list font-scroll">
            {sessions.map((session) => (
              <div key={session.id} className={`session-item ${session.id === activeSessionId ? 'active' : ''}`} onClick={() => handleSwitchSession(session.id)}>
                <MessageSquare size={14} className="session-icon" />
                <div className="session-info">
                  <div className="session-item-text">{session.title}</div>
                  <div className="session-sub">{session.patientName} · {session.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ai-security-footer">
          <Lock size={13} />
          <span>Secure Clinical Workspace · Patient information protected</span>
        </div>
      </div>

      {/* ═══ CENTER PANEL: CLINICAL AI WORKSPACE ═══ */}
      <div className="ai-center-panel">
        <div className="ai-center-header">
          <div className="ai-center-header-left">
            <div className="ai-header-icon"><Sparkles size={20} /></div>
            <div>
              <h1>Clinical AI Assistant</h1>
              <span className="ai-subtitle">Your intelligent clinical workspace</span>
            </div>
          </div>
          {selectedPatient && (
            <span className="ai-header-btn"><User size={14} /> {selectedPatient.name} ({selectedPatient.mrn || selectedPatient.id})</span>
          )}
        </div>

        {selectedPatient && (
          <div className="ai-context-banner">
            <User size={14} />
            <span>Context Active: <strong>{selectedPatient.name}</strong> ({selectedPatient.age}y {selectedPatient.gender})</span>
          </div>
        )}

        {voiceError && (
          <div className="ai-voice-error font-notice">
            <AlertTriangle size={13} /> <span>{voiceError}</span>
            <button onClick={() => setVoiceError(null)}><X size={12} /></button>
          </div>
        )}

        {/* Central Chat Thread */}
        <div className="ai-messages-container font-scroll">
          {messages.length === 0 ? (
            <div className="ai-welcome-state">
              <div className="ai-welcome-icon"><Sparkles size={36} /></div>
              <h2>How can I help with {selectedPatient ? `${selectedPatient.name}'s` : 'clinical'} care today?</h2>
              <p>Select an explicit clinical action below or type a natural question.</p>

              <div className="ai-welcome-suggestions">
                {WELCOME_SUGGESTIONS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <button key={i} className="ai-suggestion-chip" onClick={() => executeClinicalAction(s.action, s.text)}>
                      <Icon size={14} /> {s.text}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className={`ai-message-row ${msg.role}`}>
                  {msg.role === 'assistant' && (
                    <div className="ai-msg-avatar bot-avatar"><Sparkles size={14} /></div>
                  )}

                  {msg.role === 'user' ? (
                    <div className="ai-user-bubble">
                      {msg.fileName && <div className="user-attached-file"><Paperclip size={12} /> {msg.fileName}</div>}
                      <p>{msg.text}</p>
                      <div className="msg-time">{msg.time}</div>
                    </div>
                  ) : (
                    /* DEDICATED RESPONSE COMPONENT RENDERER */
                    <ResponseValidator
                      data={msg}
                      expectedType={msg.expectedType}
                      onViewSource={(src) => setViewingSource(src)}
                      onAddToRecord={(rec) => console.log('Saved to record:', rec)}
                    />
                  )}

                  {msg.role === 'user' && <div className="ai-msg-avatar user-avatar">Dr</div>}
                </div>
              ))}

              {isLoading && (
                <div className="ai-message-row assistant">
                  <div className="ai-msg-avatar bot-avatar"><Sparkles size={14} /></div>
                  <div className="ai-typing-indicator">
                    <div className="typing-dots"><span></span><span></span><span></span></div>
                    <span className="typing-text">Analyzing clinical action...</span>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Safety Disclaimer */}
        <div className="ai-safety-notice">
          <AlertTriangle size={13} />
          <span>Clinical AI provides decision-support and drafting assistance. Review and verify all outputs before clinical use.</span>
        </div>

        {/* Composer */}
        <div className="ai-input-area">
          {attachedFile && (
            <div className="ai-input-file-chip">
              <Paperclip size={14} />
              <span>{attachedFile.name} ({attachedFile.size})</span>
              <button className="btn-remove-file" onClick={removeFile}><XCircle size={16} /></button>
            </div>
          )}

          <form className="ai-input-form" onSubmit={(e) => { e.preventDefault(); executeClinicalAction('general', inputText); }}>
            <button type="button" className="ai-input-btn" onClick={() => fileInputRef.current?.click()} title="Attach file"><Paperclip size={18} /></button>
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt,image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
            <input
              ref={inputRef}
              type="text"
              className="ai-text-input"
              placeholder={selectedPatient ? `Ask about ${selectedPatient.name}'s care or type any question...` : "Ask any clinical question (e.g., 'hi', 'symptoms of migraine', 'lab interpretation')..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
            />
            <button type="button" className={`ai-input-btn ${isRecording ? 'recording' : ''}`} onClick={toggleVoice} title="Voice input">
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <button type="submit" className="ai-send-btn" disabled={isLoading || (!inputText.trim() && !attachedFile)}>
              <Send size={16} />
            </button>
          </form>

          {/* Quick Action Chips triggering explicit actions */}
          <div className="ai-quick-actions font-scroll">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button key={action.key} className="ai-quick-chip" onClick={() => executeClinicalAction(action.key, action.prompt)} disabled={isLoading}>
                  <Icon size={12} /> {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
