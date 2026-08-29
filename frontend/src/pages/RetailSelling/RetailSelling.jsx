import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2, CreditCard, CheckCircle, X, RefreshCw, Search } from 'lucide-react';
import Header from '../../components/Header/Header.jsx';
import api from '../../services/api.js';
import './RetailSelling.css';

const RetailSelling = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    medicine_name: '',
    qty: 1,
    price: 0,
    sale_date: new Date().toISOString().split('T')[0],
    status: 'Completed',
  });

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await api.getRetailSales();
      setCartItems(data);
    } catch (err) {
      console.error('Failed to load retail sales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!formData.medicine_name.trim()) return;
    try {
      await api.createRetailSale({
        ...formData,
        qty: parseInt(formData.qty, 10) || 1,
        price: parseFloat(formData.price) || 0,
      });
      setShowModal(false);
      setFormData({
        medicine_name: '',
        qty: 1,
        price: 0,
        sale_date: new Date().toISOString().split('T')[0],
        status: 'Completed',
      });
      await loadSales();
    } catch (err) {
      alert('Failed to add sale item.');
    }
  };

  const handleDeleteItem = async (saleId) => {
    if (!window.confirm('Remove this item from the sale?')) return;
    try {
      await api.deleteRetailSale(saleId);
      await loadSales();
    } catch (err) {
      alert('Failed to remove item.');
    }
  };

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleCompletePayment = () => {
    if (cartItems.length === 0) {
      alert('Cart is empty. Add items to cart first.');
      return;
    }
    setShowReceiptModal(true);
  };

  const filteredCartItems = cartItems.filter(item =>
    item.medicine_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="retail-selling-page">
      <Header title="Retail Selling" subtitle="Pharmacy POS & Billing Workspace">
        <button className="btn-refresh" onClick={loadSales} title="Refresh" style={{ marginRight: '8px' }}>
          <RefreshCw size={16} />
        </button>
        <button className="btn-add-patient" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Sale Item
        </button>
      </Header>

      <div className="retail-layout">
        <div>
          <div className="card fade-in-up" style={{ padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600, marginBottom: '12px' }}>Search & Add Items</h3>
            <div className="patients-search-box" style={{ width: '100%' }}>
              <input type="text" placeholder="Scan barcode or search medicine..." />
            </div>
          </div>

          <div className="card fade-in-up" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600, marginBottom: '16px' }}>Current Cart</h3>
            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--neutral-500)' }}>
                Loading sale items from backend...
              </div>
            ) : cartItems.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--neutral-400)' }}>
                No items in cart. Click "Add Sale Item" to begin.
              </div>
            ) : (
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td><strong>{item.medicine_name}</strong></td>
                      <td>{item.qty}</td>
                      <td>₹{item.price}</td>
                      <td>₹{(item.qty * item.price).toFixed(2)}</td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--error)' }}
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div>
          <div className="pos-cart-card fade-in-up">
            <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 700 }}>Billing Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>GST (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div style={{ width: '100%', height: '1px', background: 'var(--neutral-100)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, color: 'var(--sage-800)' }}>
                <span>Total Amount</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button className="btn btn-primary btn-lg" style={{ marginTop: '12px' }} onClick={handleCompletePayment}>
              <CreditCard size={18} /> Complete Payment & Print Bill
            </button>
          </div>
        </div>
      </div>

      {/* Add Sale Item Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content fade-in-up" style={{ background: 'white', padding: '24px', borderRadius: '16px', maxWidth: '450px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Add Sale Item</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Medicine Name *</label>
                <input type="text" required placeholder="e.g. Arnica Montana 30C (30ml)" value={formData.medicine_name} onChange={(e) => setFormData({ ...formData, medicine_name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Quantity</label>
                  <input type="number" min="1" value={formData.qty} onChange={(e) => setFormData({ ...formData, qty: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Price (₹)</label>
                  <input type="number" min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Sale Date</label>
                <input type="date" value={formData.sale_date} onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D0D5DD' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn-add-patient">Add to Cart</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Receipt Confirmation Modal */}
      {showReceiptModal && (
        <div className="modal-overlay">
          <div className="modal-content fade-in-up" style={{ background: 'white', padding: '24px', borderRadius: '16px', maxWidth: '420px', width: '90%' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--sage-100)', color: 'var(--sage-700)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <CheckCircle size={28} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Payment Complete</h2>
              <p style={{ fontSize: '12px', color: 'var(--neutral-500)' }}>Sage Green Wellness POS Receipt</p>
            </div>
            <div style={{ background: 'var(--neutral-25)', padding: '16px', borderRadius: '12px', fontSize: '13px', marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', marginBottom: '8px', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '6px' }}>Order Summary</div>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>{item.medicine_name} x {item.qty}</span>
                  <span>₹{(item.qty * item.price).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--neutral-200)', paddingTop: '8px', marginTop: '8px', fontWeight: '700', display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Paid:</span>
                <span style={{ color: 'var(--sage-800)' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowReceiptModal(false)}>Close</button>
              <button className="btn-add-patient" style={{ flex: 1 }} onClick={() => { window.print(); setShowReceiptModal(false); }}>Print Receipt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailSelling;
