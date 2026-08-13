import axios from 'axios';

// Base URL for the backend API. Set VITE_API_URL in a .env file to override.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL });

const MOCK_USERS = {
  'employee@penthara.dev': {
    _id: 'usr_emp_01',
    name: 'Aryan (Employee)',
    email: 'employee@penthara.dev',
    role: 'employee',
    leaveBalance: 18,
  },
  'admin@penthara.dev': {
    _id: 'usr_adm_01',
    name: 'HR Admin',
    email: 'admin@penthara.dev',
    role: 'admin',
    leaveBalance: 24,
  },
};

const INITIAL_MOCK_LEAVES = [
  {
    _id: 'leave_mock_01',
    user: MOCK_USERS['employee@penthara.dev'],
    leaveType: 'Casual Leave',
    startDate: '2026-08-10',
    endDate: '2026-08-12',
    reason: 'Family emergency and personal commitments.',
    status: 'Approved',
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-02T14:30:00.000Z',
  },
  {
    _id: 'leave_mock_02',
    user: MOCK_USERS['employee@penthara.dev'],
    leaveType: 'Sick Leave',
    startDate: '2026-08-15',
    endDate: '2026-08-16',
    reason: 'Feeling unwell, resting per medical guidance.',
    status: 'Pending',
    createdAt: '2026-08-11T09:15:00.000Z',
    updatedAt: '2026-08-11T09:15:00.000Z',
  },
];

const getMockUsers = () => {
  const saved = localStorage.getItem('lms_mock_users');
  if (!saved) {
    localStorage.setItem('lms_mock_users', JSON.stringify(MOCK_USERS));
    return MOCK_USERS;
  }
  return JSON.parse(saved);
};

const saveMockUser = (email, user) => {
  const users = getMockUsers();
  users[email.toLowerCase().trim()] = user;
  localStorage.setItem('lms_mock_users', JSON.stringify(users));
};

const getMockLeaves = () => {
  const saved = localStorage.getItem('lms_mock_leaves');

  // Seed the initial dataset on first access
  if (!saved) {
    localStorage.setItem('lms_mock_leaves', JSON.stringify(INITIAL_MOCK_LEAVES));
    return INITIAL_MOCK_LEAVES;
  }
  return JSON.parse(saved);
};

const saveMockLeaves = (leaves) => {
  localStorage.setItem('lms_mock_leaves', JSON.stringify(leaves));
};

const handleMockRequest = (config) => {
  const method = config.method.toUpperCase();
  // Strip the /api prefix from the URL to match route patterns
  const url = (config.url || '').replace('/api', '');

  // ---- Auth: Login ----
  if (method === 'POST' && url.includes('/auth/login')) {
    const data = JSON.parse(config.data || '{}');
    const email = (data.email || '').toLowerCase().trim();
    
    const users = getMockUsers();
    let user = users[email];
    
    // If the user doesn't exist, create a new one dynamically to mock automatic login
    if (!user) {
      const namePrefix = email.split('@')[0] || 'User';
      const name = namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1);
      
      user = {
        _id: 'usr_' + Date.now() + Math.random().toString(36).substr(2, 5),
        name: name,
        email: email,
        role: email.includes('admin') ? 'admin' : 'employee',
        leaveBalance: 18,
      };
      
      saveMockUser(email, user);
    }
    
    const mockToken = 'mock_jwt_token_' + btoa(JSON.stringify(user));
    return { data: { token: mockToken, user } };
  }

  // ---- Auth: Register ----
  if (method === 'POST' && url.includes('/auth/register')) {
    const data = JSON.parse(config.data || '{}');
    const email = (data.email || '').toLowerCase().trim();
    
    const users = getMockUsers();
    let user = users[email];
    
    if (!user) {
      user = {
        _id: 'usr_' + Date.now() + Math.random().toString(36).substr(2, 5),
        name: data.name || 'New Employee',
        email: email,
        role: 'employee',
        leaveBalance: 18,
      };
      saveMockUser(email, user);
    }
    
    const mockToken = 'mock_jwt_token_' + btoa(JSON.stringify(user));
    return { data: { token: mockToken, user } };
  }

  // ---- Auth: Current user profile ----
  if (method === 'GET' && url.includes('/auth/me')) {
    const savedUser = localStorage.getItem('lms_user');
    const user = savedUser ? JSON.parse(savedUser) : MOCK_USERS['employee@penthara.dev'];
    return { data: { user } };
  }

  // ---- Leaves: Personal leave history ----
  if (method === 'GET' && url.includes('/leaves/my')) {
    const savedUser = localStorage.getItem('lms_user');
    const currentUser = savedUser ? JSON.parse(savedUser) : MOCK_USERS['employee@penthara.dev'];
    const leaves = getMockLeaves().filter((l) => l.user?.email === currentUser.email);
    return { data: { leaves } };
  }

  // ---- Leaves: Balance computation ----
  if (method === 'GET' && url.includes('/leaves/balance')) {
    const savedUser = localStorage.getItem('lms_user');
    const currentUser = savedUser ? JSON.parse(savedUser) : MOCK_USERS['employee@penthara.dev'];

    const leaves = getMockLeaves().filter(
      (l) => l.user?.email === currentUser.email && l.status === 'Approved'
    );
    const daysTaken = leaves.reduce((acc, l) => {
      const ms = 1000 * 60 * 60 * 24;
      const days = Math.round((new Date(l.endDate) - new Date(l.startDate)) / ms) + 1;
      return acc + days;
    }, 0);

    const pendingRequests = getMockLeaves().filter(
      (l) => l.user?.email === currentUser.email && l.status === 'Pending'
    ).length;

    return {
      data: {
        totalAllotted: currentUser.leaveBalance || 18,
        daysTaken,
        daysRemaining: Math.max((currentUser.leaveBalance || 18) - daysTaken, 0),
        pendingRequests,
      },
    };
  }

  // ---- Leaves: All leaves (Admin view) ----
  if (method === 'GET' && url.endsWith('/leaves')) {
    return { data: { leaves: getMockLeaves() } };
  }

  // ---- Leaves: Submit new application ----
  if (method === 'POST' && url.endsWith('/leaves')) {
    const data = JSON.parse(config.data || '{}');
    const savedUser = localStorage.getItem('lms_user');
    const currentUser = savedUser ? JSON.parse(savedUser) : MOCK_USERS['employee@penthara.dev'];
    const leaves = getMockLeaves();

    const newLeave = {
      _id: 'leave_' + Date.now(),
      user: currentUser,
      leaveType: data.leaveType || 'Casual Leave',
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Prepend to list so newest appears first
    leaves.unshift(newLeave);
    saveMockLeaves(leaves);
    return { data: { leave: newLeave } };
  }

  // ---- Leaves: Admin review status update (PATCH /leaves/:id/status) ----
  if (method === 'PATCH' && url.includes('/leaves/') && url.includes('/status')) {
    const parts = url.split('/');
    const leaveId = parts[2];
    const data = JSON.parse(config.data || '{}');
    const leaves = getMockLeaves();

    const target = leaves.find((l) => l._id === leaveId);
    if (target) {
      target.status = data.status;
      target.reviewNote = data.reviewNote || '';
      target.updatedAt = new Date().toISOString();
      saveMockLeaves(leaves);
    }
    return { data: { leave: target } };
  }

  return null;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Detect network failures and route through the mock handler
    if (!error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      const mockResult = handleMockRequest(error.config);
      if (mockResult) {
        return mockResult;
      }
    }

    // Auto-clear credentials on authentication failure
    if (error.response?.status === 401) {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
    }
    return Promise.reject(error);
  }
);

export default api;
