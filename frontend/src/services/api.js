const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    console.error(`Fetch error on ${url}:`, error);
    throw error;
  }
}

/**
 * Build a query string from a params object, skipping null/undefined/empty values.
 * Example: buildQuery({ status: 'Active', search: '' }) => '?status=Active'
 */
function buildQuery(params = {}) {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== null && v !== undefined && v !== ''
  );
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
}

export const api = {
  // Patients
  getPatients: (params) => request(`/patients${buildQuery(params)}`),
  getPatientFilters: () => request('/patients/filters'),
  createPatient: (data) => request('/patients', { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (id, data) => request(`/patients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePatient: (id) => request(`/patients/${id}`, { method: 'DELETE' }),

  // Appointments
  getAppointments: (params) => request(`/appointments${buildQuery(params)}`),
  getAppointmentFilters: () => request('/appointments/filters'),
  createAppointment: (data) => request('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  updateAppointment: (id, data) => request(`/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAppointment: (id) => request(`/appointments/${id}`, { method: 'DELETE' }),

  // Inventory
  getInventory: () => request('/inventory'),
  createInventory: (data) => request('/inventory', { method: 'POST', body: JSON.stringify(data) }),

  // Physicians
  getPhysicians: () => request('/physicians'),
  createPhysician: (data) => request('/physicians', { method: 'POST', body: JSON.stringify(data) }),

  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),

  // Chat
  sendChatMessage: (message) => request('/chat', { method: 'POST', body: JSON.stringify({ message }) }),

  // Purchase Orders
  getPurchaseOrders: (params) => request(`/purchase-orders${buildQuery(params)}`),
  getOrderFilters: () => request('/purchase-orders/filters'),
  createPurchaseOrder: (data) => request('/purchase-orders', { method: 'POST', body: JSON.stringify(data) }),
  updatePurchaseOrder: (id, data) => request(`/purchase-orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Case Summaries
  getCaseSummaries: () => request('/case-summaries'),
  createCaseSummary: (data) => request('/case-summaries', { method: 'POST', body: JSON.stringify(data) }),
  updateCaseSummary: (id, data) => request(`/case-summaries/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Locations
  getLocations: () => request('/locations'),
  createLocation: (data) => request('/locations', { method: 'POST', body: JSON.stringify(data) }),
  updateLocation: (id, data) => request(`/locations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Retail Sales
  getRetailSales: () => request('/retail-sales'),
  createRetailSale: (data) => request('/retail-sales', { method: 'POST', body: JSON.stringify(data) }),
  deleteRetailSale: (id) => request(`/retail-sales/${id}`, { method: 'DELETE' }),

  // Reports
  getReports: () => request('/reports'),

  // Modules
  getModules: () => request('/modules'),
};

export default api;
