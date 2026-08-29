import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AnimatedBackground from './components/AnimatedBackground/AnimatedBackground.jsx';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import ChatWidget from './components/ChatWidget/ChatWidget.jsx';

import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Patients from './pages/Patients/Patients.jsx';
import Appointments from './pages/Appointments/Appointments.jsx';
import CaseSummary from './pages/CaseSummary/CaseSummary.jsx';
import MedicalInventory from './pages/MedicalInventory/MedicalInventory.jsx';
import RetailSelling from './pages/RetailSelling/RetailSelling.jsx';
import PurchaseOrders from './pages/PurchaseOrders/PurchaseOrders.jsx';
import Reports from './pages/Reports/Reports.jsx';
import Physician from './pages/Physician/Physician.jsx';
import Location from './pages/Location/Location.jsx';

import './App.css';

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
          <Route path="/medical-inventory" element={<MedicalInventory />} />
          <Route path="/retail-selling" element={<RetailSelling />} />
          <Route path="/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/physician" element={<Physician />} />
          <Route path="/location" element={<Location />} />
        </Routes>
      </main>
      <ChatWidget />
    </div>
  );
}

export default App;
