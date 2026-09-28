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
  updatePhysician: (id, data) => request(`/physicians/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),

  // Chat
  sendChatMessage: (message, image_base64 = null, mime_type = 'image/jpeg', session_id = null) =>
    request('/chat', { method: 'POST', body: JSON.stringify({ message, image_base64, mime_type, session_id }) }),
  chatPreview: (message, patient_name = null) =>
    request('/chat/preview', { method: 'POST', body: JSON.stringify({ message, patient_name }) }),

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


  // Reports
  getReports: () => request('/reports'),

  // Modules
  getModules: () => request('/modules'),

  // AI Clinical Assistant & Governance
  previewRedaction: (data) => request('/ai/preview-redaction', { method: 'POST', body: JSON.stringify(data) }),
  analyzeDocument: (data) => request('/ai/analyze-document', { method: 'POST', body: JSON.stringify(data) }),
  predictRisk: (data) => request('/ai/predict-risk', { method: 'POST', body: JSON.stringify(data) }),
  generateSafetyReport: (data) => request('/ai/safety-report', { method: 'POST', body: JSON.stringify(data) }),
  analyzeImage: (data) => request('/ai/analyze-image', { method: 'POST', body: JSON.stringify(data) }),
  analyzeLabReport: (data) => request('/ai/analyze-lab-report', { method: 'POST', body: JSON.stringify(data) }),
  runMultiFactorAgent: (data) => request('/ai/multi-factor-agent', { method: 'POST', body: JSON.stringify(data) }),
  getGovernancePolicy: () => request('/ai/governance-policy'),
  getSystemInstructions: () => request('/ai/system-instructions'),
  getAuditLog: (limit = 100) => request(`/ai/audit-log?limit=${limit}`),
  getAuditStats: () => request('/ai/audit-stats'),
};

export default api;
