import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AnimatedBackground from './components/AnimatedBackground/AnimatedBackground.jsx';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Patients from './pages/Patients/Patients.jsx';
import Appointments from './pages/Appointments/Appointments.jsx';
import CaseSummary from './pages/CaseSummary/CaseSummary.jsx';
import PurchaseOrders from './pages/PurchaseOrders/PurchaseOrders.jsx';
import Reports from './pages/Reports/Reports.jsx';
import Physician from './pages/Physician/Physician.jsx';
import Location from './pages/Location/Location.jsx';
import AIAssistant from './pages/AIAssistant/AIAssistant.jsx';
import MedicalInventory from './pages/MedicalInventory/MedicalInventory.jsx';
import RiskPrediction from './pages/RiskPrediction/RiskPrediction.jsx';
import { Sparkles } from 'lucide-react';

import './App.css';

/* Floating AI Button — appears on all pages except /ai-assistant */
const FloatingAIButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on the AI assistant page
  if (location.pathname === '/ai-assistant') return null;

  return (
    <button
      className="floating-ai-btn"
      onClick={() => navigate('/ai-assistant')}
      title="Open Clinical AI Assistant"
    >
      <Sparkles size={24} />
      <span className="floating-ai-label">AI</span>
    </button>
  );
};

function App() {
  return (
    <div className="app-layout">
      <AnimatedBackground />
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/case-summary" element={<CaseSummary />} />
          <Route path="/physician" element={<Physician />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/risk-prediction" element={<RiskPrediction />} />
          <Route path="/medical-inventory" element={<MedicalInventory />} />
          <Route path="/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/location" element={<Location />} />
        </Routes>
      </main>
      <FloatingAIButton />
    </div>
  );
}

export default App;
