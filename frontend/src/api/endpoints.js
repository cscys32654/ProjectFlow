import api from './axios';

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
  users:    ()     => api.get('/auth/users'),
};

// Projects
export const projectAPI = {
  getAll:       ()         => api.get('/projects'),
  getById:      (id)       => api.get(`/projects/${id}`),
  create:       (data)     => api.post('/projects', data),
  update:       (id, data) => api.put(`/projects/${id}`, data),
  delete:       (id)       => api.delete(`/projects/${id}`),
  addMember:    (id, uid)  => api.post(`/projects/${id}/members`, { userId: uid }),
  removeMember: (id, uid)  => api.delete(`/projects/${id}/members/${uid}`),
};

// Tasks
export const taskAPI = {
  getByProject: (pid, params) => api.get(`/projects/${pid}/tasks`, { params }),
  create:       (pid, data)   => api.post(`/projects/${pid}/tasks`, data),
  update:       (pid, tid, d) => api.put(`/projects/${pid}/tasks/${tid}`, d),
  updateStatus: (pid, tid, s) => api.patch(`/projects/${pid}/tasks/${tid}/status`, { status: s }),
  delete:       (pid, tid)    => api.delete(`/projects/${pid}/tasks/${tid}`),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
};