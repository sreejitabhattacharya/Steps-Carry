// BASE_URL: Dev e vite proxy use kore '/api', production e full URL lage
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getToken = () => localStorage.getItem('sc_token');

const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  // 204 No Content handle kora
  if (res.status === 204) return { success: true };

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}: Something went wrong`);
  }
  return data;
};

export const authAPI = {
  register:       (body) => apiFetch('/auth/register',         { method: 'POST', body: JSON.stringify(body) }),
  login:          (body) => apiFetch('/auth/login',            { method: 'POST', body: JSON.stringify(body) }),
  googleLogin:    (body) => apiFetch('/auth/google',           { method: 'POST', body: JSON.stringify(body) }),
  getMe:          ()     => apiFetch('/auth/me'),
  updateProfile:  (body) => apiFetch('/auth/profile',          { method: 'PUT',  body: JSON.stringify(body) }),
  changePassword: (body) => apiFetch('/auth/change-password',  { method: 'PUT',  body: JSON.stringify(body) }),
};

export const userAPI = {
  getAddresses:           ()       => apiFetch('/users/addresses'),
  addAddress:             (body)   => apiFetch('/users/addresses',               { method: 'POST',   body: JSON.stringify(body) }),
  updateAddress:          (id, b)  => apiFetch(`/users/addresses/${id}`,         { method: 'PUT',    body: JSON.stringify(b) }),
  removeAddress:          (id)     => apiFetch(`/users/addresses/${id}`,         { method: 'DELETE' }),
  setDefaultAddress:      (id)     => apiFetch(`/users/addresses/${id}/default`, { method: 'PUT' }),

  getPaymentMethods:      ()       => apiFetch('/users/payment-methods'),
  addPaymentMethod:       (body)   => apiFetch('/users/payment-methods',               { method: 'POST',   body: JSON.stringify(body) }),
  removePaymentMethod:    (id)     => apiFetch(`/users/payment-methods/${id}`,         { method: 'DELETE' }),
  setDefaultPaymentMethod:(id)     => apiFetch(`/users/payment-methods/${id}/default`, { method: 'PUT' }),

  getWishlist:            ()          => apiFetch('/users/wishlist'),
  addToWishlist:          (productId) => apiFetch(`/users/wishlist/${productId}`,       { method: 'POST' }),
  removeFromWishlist:     (productId) => apiFetch(`/users/wishlist/${productId}`,       { method: 'DELETE' }),
  syncWishlist:           (ids)       => apiFetch('/users/wishlist',                    { method: 'PUT',  body: JSON.stringify({ wishlist: ids }) }),
};

export const orderAPI = {
  placeOrder:   (body) => apiFetch('/orders',               { method: 'POST', body: JSON.stringify(body) }),
  getMyOrders:  ()     => apiFetch('/orders/my'),
  trackOrder:   (id)   => apiFetch(`/orders/track/${id}`),
  cancelOrder:  (id, reason) => apiFetch(`/orders/${id}/cancel`, { method: 'PUT', body: JSON.stringify({ reason }) }),
};

export const productAPI = {
  getAll: (params = '') => apiFetch(`/products${params}`),
  getOne: (id)          => apiFetch(`/products/${id}`),
};

export const reviewAPI = {
  getByProduct: (productId)       => apiFetch(`/reviews/${productId}`),
  submit:       (productId, body) => apiFetch(`/reviews/${productId}`, { method: 'POST',   body: JSON.stringify(body) }),
  remove:       (id)              => apiFetch(`/reviews/${id}`,        { method: 'DELETE' }),
};

export const qaAPI = {
  getByProduct: (productId)       => apiFetch(`/qa/${productId}`),
  ask:          (productId, body) => apiFetch(`/qa/${productId}`,        { method: 'POST', body: JSON.stringify(body) }),
  answer:       (qaId, body)      => apiFetch(`/qa/${qaId}/answer`,      { method: 'POST', body: JSON.stringify(body) }),
  remove:       (id)              => apiFetch(`/qa/${id}`,               { method: 'DELETE' }),
};

export const adminAPI = {
  getStats:      ()           => apiFetch('/admin/stats'),
  getUsers:      ()           => apiFetch('/admin/users'),
  deleteUser:    (id)         => apiFetch(`/admin/users/${id}`,           { method: 'DELETE' }),
  getOrders:     ()           => apiFetch('/admin/orders'),
  updateOrderStatus: (id, s)  => apiFetch(`/admin/orders/${id}/status`,   { method: 'PUT', body: JSON.stringify({ status: s }) }),
  getProducts:   ()           => apiFetch('/admin/products'),
  createProduct: (body)       => apiFetch('/products',                    { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id, body)   => apiFetch(`/products/${id}`,              { method: 'PUT',  body: JSON.stringify(body) }),
  deleteProduct: (id)         => apiFetch(`/products/${id}`,              { method: 'DELETE' }),
  getContacts:   ()           => apiFetch('/admin/contacts'),
  updateContact: (id, status) => apiFetch(`/admin/contacts/${id}`,        { method: 'PUT',  body: JSON.stringify({ status }) }),
  deleteContact: (id)         => apiFetch(`/admin/contacts/${id}`,        { method: 'DELETE' }),
};

// Token helpers
export const saveToken       = (token) => localStorage.setItem('sc_token', token);
export const removeToken     = ()      => localStorage.removeItem('sc_token');
export const hasToken        = ()      => !!getToken();
export const isRealJWT       = (token) => token && token.split('.').length === 3 && token !== 'admin-token';
export const getStoredToken  = getToken;
