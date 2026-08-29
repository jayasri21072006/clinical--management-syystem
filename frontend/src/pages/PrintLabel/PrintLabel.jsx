import React, { useState, useEffect } from 'react';
import { Tag, Printer, Check, RefreshCw } from 'lucide-react';
import Header from '../../components/Header/Header.jsx';
import api from '../../services/api.js';
import './PrintLabel.css';

const PrintLabel = () => {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await api.getCaseSummaries();
      setCases(data);
      if (data.length > 0 && !selectedCase) {
        setSelectedCase(data[0]);
      }
    } catch (err) {
      console.error('Failed to load case summaries for label:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  // Extract first prescription line for label
  const firstPrescription = selectedCase?.prescription
    ? selectedCase.prescription.split('\n')[0] || ''
    : '';

  // Extract dosage from prescription (text after the dash)
  const dosagePart = firstPrescription.includes(' - ')
    ? firstPrescription.split(' - ').slice(1).join(' - ')
    : firstPrescription;

  // Extract remedy name
  const remedyName = firstPrescription.includes(' - ')
    ? firstPrescription.split(' - ')[0].replace(/^\d+\.\s*/, '')
    : firstPrescription;

  const today = new Date().toISOString().split('T')[0];

  const handlePrint = () => {
    if (!selectedCase) return;

    const printWindow = window.open('', '_blank', 'width=600,height=400');
    if (!printWindow) {
      alert('Please allow popups to print labels.');
      return;
    }

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription Label - ${selectedCase.patient_name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: #ffffff;
            }
            .label-box {
              width: 380px;
              border: 2px solid #2e7d32;
              border-radius: 8px;
              padding: 16px;
              background-color: #f1f8e9;
              box-sizing: border-box;
            }
            .label-title {
              font-size: 16px;
              font-weight: bold;
              color: #1b5e20;
              border-bottom: 1px solid #c8e6c9;
              padding-bottom: 6px;
              margin-bottom: 10px;
              text-align: center;
              letter-spacing: 0.5px;
            }
            .label-row {
              font-size: 12px;
              color: #333;
              margin-bottom: 6px;
            }
            .rx-title {
              font-size: 14px;
              font-weight: bold;
              color: #2e7d32;
              margin-top: 8px;
              margin-bottom: 4px;
            }
            .footer-text {
              font-size: 9px;
              color: #666;
              margin-top: 10px;
              border-top: 1px dashed #ccc;
              padding-top: 6px;
              text-align: center;
            }
            @media print {
              body { padding: 0; background: none; }
              .label-box { width: 100%; border: 2px solid #000; background: none; }
            }
          </style>
        </head>
        <body>
          <div class="label-box">
            <div class="label-title">SAGE GREEN WELLNESS CLINIC</div>
            <div class="label-row"><strong>Patient:</strong> ${selectedCase.patient_name} (#${selectedCase.patient_id_ref}) &nbsp;|&nbsp; <strong>Date:</strong> ${selectedCase.last_visit || today}</div>
            <div class="rx-title">Rx: ${remedyName || 'N/A'}</div>
            <div class="label-row"><strong>Dosage:</strong> ${dosagePart || 'As prescribed by physician.'}</div>
            <div class="footer-text">Keep out of reach of children. Store in a cool, dry place away from direct sunlight.</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <div className="print-label-page">
      <Header title="Print Label" subtitle="Prescription Bottle & Box Sticker Generator">
        <button className="btn-refresh" onClick={loadCases} title="Refresh">
          <RefreshCw size={16} />
        </button>
      </Header>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--neutral-500)' }}>
          Loading case data for label...
        </div>
      ) : cases.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--neutral-500)' }}>
          No case summaries available. Create a case first to generate labels.
        </div>
      ) : (
        <>
          {/* Case Selector */}
          <div className="card fade-in-up" style={{ padding: '16px', marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
              Select Patient / Case
            </label>
            <select
              value={selectedCase?.id || ''}
              onChange={(e) => {
                const found = cases.find(c => c.id === parseInt(e.target.value));
                setSelectedCase(found || null);
              }}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD', fontSize: '14px' }}
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.patient_name} (#{c.patient_id_ref}) — {c.case_status}
                </option>
              ))}
            </select>
          </div>

          {selectedCase && (
            <div className="label-preview-card fade-in-up">
              <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600, marginBottom: '16px' }}>Label Preview</h3>

              <div className="prescription-label-box">
                <div className="label-title">SAGE GREEN WELLNESS CLINIC</div>
                <div style={{ fontSize: '12px', color: 'var(--neutral-600)' }}>
                  <strong>Patient:</strong> {selectedCase.patient_name} (#{selectedCase.patient_id_ref}) | <strong>Date:</strong> {selectedCase.last_visit || today}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sage-800)', marginTop: '6px' }}>
                  Rx: {remedyName || 'N/A'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--neutral-700)' }}>
                  <strong>Dosage:</strong> {dosagePart || 'As prescribed by physician.'}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--neutral-400)', marginTop: '8px' }}>
                  Keep out of reach of children. Store in a cool, dry place away from direct sunlight.
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary btn-md" onClick={handlePrint}>
                  <Printer size={16} /> Print Sticker Label
                </button>
                <button className="btn btn-secondary btn-md" onClick={handlePrint}>
                  Customize Format
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PrintLabel;

