import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Plus, Search, Filter, X, Edit3, RefreshCw } from 'lucide-react';
import Header from '../../components/Header/Header.jsx';
import api from '../../services/api.js';
import './PurchaseOrders.css';

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({ vendor: '', date: '', items: '', total: '', status: 'Pending Approval' });

  // Dynamic filter values from database
  const [filterOptions, setFilterOptions] = useState({ statuses: [], vendors: [] });

  const [searchTimer, setSearchTimer] = useState(null);

  // Fetch available filter values from DB
  const loadFilters = async () => {
    try {
      const data = await api.getOrderFilters();
      setFilterOptions(data);
    } catch (err) {
      console.error('Failed to load order filters:', err);
    }
  };

  // Fetch orders with server-side filtering
  const loadOrders = useCallback(async (overrides = {}) => {
    try {
      setLoading(true);
      const params = {
        search: overrides.search !== undefined ? overrides.search : searchTerm,
        status: (overrides.status !== undefined ? overrides.status : statusFilter) === 'All' ? '' : (overrides.status !== undefined ? overrides.status : statusFilter),
      };
      const data = await api.getPurchaseOrders(params);
      setOrders(data);
    } catch (err) {
      console.error('Failed to load purchase orders:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  // Initial load
  useEffect(() => {
    loadFilters();
    loadOrders();
  }, []);

  // Re-fetch when filter chips change
  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    if (searchTimer) clearTimeout(searchTimer);
    const timer = setTimeout(() => {
      loadOrders({ search: searchTerm });
    }, 400);
    setSearchTimer(timer);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Build dynamic filter list from DB
  const statusFilters = ['All', ...filterOptions.statuses];

  const openAddModal = () => {
    setEditingOrder(null);
    setFormData({ vendor: '', date: '', items: '', total: '', status: 'Pending Approval' });
    setShowModal(true);
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    setFormData({ vendor: order.vendor, date: order.date, items: String(order.items), total: order.total, status: order.status });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vendor.trim()) return;
    try {
      const payload = { vendor: formData.vendor, date: formData.date, items: parseInt(formData.items) || 0, total: formData.total, status: formData.status };
      if (editingOrder) {
        await api.updatePurchaseOrder(editingOrder.id, payload);
      } else {
        await api.createPurchaseOrder(payload);
      }
      setShowModal(false);
      setEditingOrder(null);
      await loadFilters();
      await loadOrders();
    } catch (err) {
      alert('Failed to save order.');
    }
  };

  return (
    <div className="purchase-orders-page">
      <Header title="Purchase Orders" subtitle="Vendor Procurement & Orders Management">
        <button className="btn-refresh" onClick={() => { loadFilters(); loadOrders(); }} title="Refresh" style={{ marginRight: '8px' }}>
          <RefreshCw size={16} />
        </button>
        <button className="btn-add-patient" onClick={openAddModal}><Plus size={16} /> Create Purchase Order</button>
      </Header>

      <div className="patients-controls" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="patients-search-box">
          <Search size={16} className="patients-search-icon" />
          <input type="text" placeholder="Search order ID, vendor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          {searchTerm && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={14} style={{ color: 'var(--neutral-500)' }} />
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--neutral-600)' }}>Status:</span>
          {statusFilters.map((f) => (
            <div key={f} className={`patients-filter-chip ${statusFilter === f ? 'active' : ''}`} onClick={() => setStatusFilter(f)} style={{ cursor: 'pointer' }}>
              {f}
            </div>
          ))}
        </div>
        <div className="patients-records-text">{orders.length} orders</div>
      </div>

      <div className="card fade-in-up" style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--neutral-500)' }}>Loading purchase orders from database...</div>
        ) : (
          <table className="inventory-table">
            <thead><tr><th>Order ID</th><th>Vendor Name</th><th>Order Date</th><th>Items</th><th>Total Amount</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--neutral-400)' }}>No orders found.</td></tr>
              ) : orders.map((po) => (
                <tr key={po.id}>
                  <td><strong>{po.order_id}</strong></td><td>{po.vendor}</td><td>{po.date}</td><td>{po.items} items</td><td>{po.total}</td>
                  <td><span className={`badge ${po.status === 'Delivered' ? 'badge-success' : po.status === 'In Transit' ? 'badge-info' : 'badge-warning'}`}>{po.status}</span></td>
                  <td><button className="btn btn-secondary btn-sm" onClick={() => openEditModal(po)}><Edit3 size={12} style={{ marginRight: '4px' }} /> Update</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content fade-in-up" style={{ background: 'white', padding: '24px', borderRadius: '16px', maxWidth: '480px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{editingOrder ? 'Update Purchase Order' : 'Create Purchase Order'}</h2>
              <button onClick={() => { setShowModal(false); setEditingOrder(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Vendor Name *</label><input type="text" required placeholder="e.g. SBL Homeopathy Pvt Ltd" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Order Date</label><input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>No. of Items</label><input type="number" placeholder="12" value={formData.items} onChange={(e) => setFormData({ ...formData, items: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Total Amount</label><input type="text" placeholder="₹24,500" value={formData.total} onChange={(e) => setFormData({ ...formData, total: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }}><option value="Pending Approval">Pending Approval</option><option value="In Transit">In Transit</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option></select></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => { setShowModal(false); setEditingOrder(null); }} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn-add-patient">{editingOrder ? 'Update Order' : 'Create Order'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
