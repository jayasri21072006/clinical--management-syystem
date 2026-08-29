import React, { useState, useEffect } from 'react';
import { Pill, Plus, Search, AlertTriangle, CheckCircle, X } from 'lucide-react';
import Header from '../../components/Header/Header.jsx';
import api from '../../services/api.js';
import './MedicalInventory.css';

const MedicalInventory = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Dilution',
    stock: 10,
    unit: 'Bottles',
    expiry: '2028-12'
  });

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await api.getInventory();
      setItems(data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await api.createInventory({ ...formData, stock: parseInt(formData.stock, 10) || 0 });
      setShowModal(false);
      setFormData({ name: '', category: 'Dilution', stock: 10, unit: 'Bottles', expiry: '2028-12' });
      await loadInventory();
    } catch (err) {
      alert('Failed to add medicine to inventory.');
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="medical-inventory-page">
      <Header title="Medical Inventory" subtitle="Pharmacy & Stock Management">
        <button className="btn-add-patient" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Medicine
        </button>
      </Header>

      <div className="inventory-table-card fade-in-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="patients-search-box">
            <Search size={16} className="patients-search-icon" />
            <input
              type="text"
              placeholder="Search medicine name, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-500)' }}>
            {filteredItems.length} items listed
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--neutral-500)' }}>
            Loading inventory stock...
          </div>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Medicine ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Expiry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.id}</strong></td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.stock} {item.unit}</td>
                  <td>{item.expiry}</td>
                  <td>
                    <span className={`badge ${item.status === 'In Stock' ? 'badge-success' : 'badge-warning'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Medicine Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content fade-in-up" style={{ background: 'white', padding: '24px', borderRadius: '16px', maxWidth: '450px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Add New Medicine</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddMedicine} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Medicine Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rhus Tox 30C"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}
                  >
                    <option value="Dilution">Dilution</option>
                    <option value="Mother Tincture">Mother Tincture</option>
                    <option value="Biochemic">Biochemic</option>
                    <option value="Ointment">Ointment</option>
                    <option value="Tablets">Tablets</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Stock Qty</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Expiry Date</label>
                  <input
                    type="text"
                    placeholder="YYYY-MM"
                    value={formData.expiry}
                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn-add-patient">Add Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalInventory;
