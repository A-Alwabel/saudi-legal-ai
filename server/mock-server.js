const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3005', 'http://127.0.0.1:3005', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mock data
let mockToken = 'mock-jwt-token-' + Date.now();
let mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@saudilegal.com',
  role: 'lawyer',
  lawFirmId: '123'
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mock server is running' });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  res.json({
    success: true,
    data: {
      token: mockToken,
      user: { ...mockUser, email }
    },
    message: 'Login successful'
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    data: {
      token: mockToken,
      user: mockUser
    },
    message: 'Registration successful'
  });
});

app.post('/api/auth/refresh', (req, res) => {
  res.json({
    success: true,
    token: 'refreshed-' + mockToken
  });
});

// Analytics routes
app.get('/api/analytics/dashboard', (req, res) => {
  res.json({
    data: {
      totalCases: 150,
      activeCases: 45,
      completedCases: 105,
      totalClients: 89,
      revenue: 450000,
      pendingTasks: 23
    }
  });
});

// Cases routes
app.get('/api/cases', (req, res) => {
  res.json({
    data: [
      { id: 1, title: 'Case 001', client: 'Client A', status: 'active' },
      { id: 2, title: 'Case 002', client: 'Client B', status: 'pending' },
      { id: 3, title: 'Case 003', client: 'Client C', status: 'completed' }
    ],
    total: 3
  });
});

// Clients routes
app.get('/api/clients', (req, res) => {
  res.json({
    data: [
      { id: 1, name: 'Client A', email: 'clienta@example.com', phone: '+966501234567' },
      { id: 2, name: 'Client B', email: 'clientb@example.com', phone: '+966502345678' }
    ],
    total: 2
  });
});

// Documents routes
app.get('/api/documents', (req, res) => {
  res.json({
    data: [
      { id: 1, name: 'Contract.pdf', type: 'contract', size: 1024000 },
      { id: 2, name: 'Agreement.docx', type: 'agreement', size: 512000 }
    ],
    total: 2
  });
});

// Tasks routes
app.get('/api/tasks', (req, res) => {
  res.json({
    data: [
      { id: 1, title: 'Review contract', status: 'pending', dueDate: '2025-09-25' },
      { id: 2, title: 'Client meeting', status: 'completed', dueDate: '2025-09-20' }
    ],
    total: 2
  });
});

// Notifications routes
app.get('/api/notifications', (req, res) => {
  res.json({
    data: [
      { 
        _id: '1', 
        title: 'New Case Assigned', 
        message: 'You have been assigned to Case #1234',
        type: 'case',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      { 
        _id: '2', 
        title: 'Payment Received', 
        message: 'Payment of SAR 5,000 received from Client A',
        type: 'payment',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      { 
        _id: '3', 
        title: 'Task Due Tomorrow', 
        message: 'Contract review is due tomorrow at 5:00 PM',
        type: 'task',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ],
    total: 3,
    unread: 2
  });
});

app.put('/api/notifications/:id/read', (req, res) => {
  res.json({
    success: true,
    message: 'Notification marked as read'
  });
});

app.put('/api/notifications/mark-all-read', (req, res) => {
  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

app.delete('/api/notifications/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Notification deleted'
  });
});

// Invoices routes  
app.get('/api/invoices', (req, res) => {
  res.json({
    data: [
      { 
        _id: '1', 
        invoiceNumber: 'INV-2024-001',
        clientId: { name: 'ABC Trading Co.' },
        caseId: { title: 'Contract Dispute' },
        items: [
          { description: 'Legal Consultation', quantity: 5, unitPrice: 500, total: 2500 }
        ],
        subtotal: 2500,
        vatAmount: 375,
        totalAmount: 2875,
        status: 'paid',
        dueDate: '2024-02-15',
        createdAt: '2024-01-15'
      },
      { 
        _id: '2', 
        invoiceNumber: 'INV-2024-002',
        clientId: { name: 'XYZ Corp' },
        caseId: { title: 'Employment Case' },
        items: [
          { description: 'Court Representation', quantity: 3, unitPrice: 1000, total: 3000 }
        ],
        subtotal: 3000,
        vatAmount: 450,
        totalAmount: 3450,
        status: 'pending',
        dueDate: '2024-02-28',
        createdAt: '2024-01-20'
      }
    ],
    total: 2
  });
});

// Payments routes
app.get('/api/payments', (req, res) => {
  res.json({
    data: [
      { _id: '1', amount: 5000, client: 'ABC Trading', date: '2024-01-10', method: 'Bank Transfer', status: 'completed' },
      { _id: '2', amount: 3500, client: 'XYZ Corp', date: '2024-01-15', method: 'Cash', status: 'pending' }
    ],
    total: 2
  });
});

// Expenses routes
app.get('/api/expenses', (req, res) => {
  res.json({
    data: [
      { _id: '1', description: 'Office Rent', amount: 15000, category: 'Rent', date: '2024-01-01', status: 'approved' },
      { _id: '2', description: 'Legal Books', amount: 2500, category: 'Resources', date: '2024-01-05', status: 'pending' }
    ],
    total: 2
  });
});

// Employees routes
app.get('/api/employees', (req, res) => {
  res.json({
    data: [
      { _id: '1', name: 'Ahmed Ali', position: 'Senior Lawyer', department: 'Legal', email: 'ahmed@firm.com', status: 'active' },
      { _id: '2', name: 'Sarah Mohammed', position: 'Legal Assistant', department: 'Legal', email: 'sarah@firm.com', status: 'active' }
    ],
    total: 2
  });
});

// Legal Library routes
app.get('/api/legal-library', (req, res) => {
  res.json({
    data: [
      { _id: '1', title: 'Saudi Labor Law', category: 'Labor', type: 'Law', year: '2023' },
      { _id: '2', title: 'Commercial Courts Law', category: 'Commercial', type: 'Law', year: '2022' }
    ],
    total: 2
  });
});

// Sessions routes
app.get('/api/sessions', (req, res) => {
  res.json({
    data: [
      { _id: '1', caseTitle: 'ABC vs XYZ', court: 'Commercial Court', date: '2024-02-15', time: '10:00 AM', status: 'scheduled' },
      { _id: '2', caseTitle: 'Employment Dispute', court: 'Labor Court', date: '2024-02-20', time: '2:00 PM', status: 'scheduled' }
    ],
    total: 2
  });
});

// Appointments routes
app.get('/api/appointments', (req, res) => {
  res.json({
    data: [
      { _id: '1', clientName: 'Mohammed Ahmed', date: '2024-02-10', time: '11:00 AM', purpose: 'Consultation', status: 'confirmed' },
      { _id: '2', clientName: 'Fatima Ali', date: '2024-02-12', time: '3:00 PM', purpose: 'Case Review', status: 'pending' }
    ],
    total: 2
  });
});

// Treasury routes
app.get('/api/treasury', (req, res) => {
  res.json({
    data: [
      { _id: '1', accountName: 'Main Account', balance: 150000, currency: 'SAR', type: 'bank', status: 'active' },
      { _id: '2', accountName: 'Petty Cash', balance: 5000, currency: 'SAR', type: 'cash', status: 'active' }
    ],
    total: 2
  });
});

// Reports routes
app.get('/api/reports', (req, res) => {
  res.json({
    data: {
      revenue: { total: 500000, monthly: 50000, growth: 15 },
      expenses: { total: 200000, monthly: 20000, categories: {} },
      profit: { total: 300000, margin: 60 },
      cases: { total: 150, active: 45, completed: 100, pending: 5 }
    }
  });
});

// Leaves routes
app.get('/api/leaves', (req, res) => {
  res.json({
    data: [
      { _id: '1', employeeName: 'Ahmed Ali', type: 'Annual', startDate: '2024-02-01', endDate: '2024-02-10', status: 'approved' },
      { _id: '2', employeeName: 'Sarah Mohammed', type: 'Sick', startDate: '2024-01-15', endDate: '2024-01-17', status: 'pending' }
    ],
    total: 2
  });
});

// Branches routes
app.get('/api/branches', (req, res) => {
  res.json({
    data: [
      { _id: '1', name: 'Main Branch', location: 'Riyadh', manager: 'Mohammed Al-Rashid', employees: 25, status: 'active' },
      { _id: '2', name: 'Jeddah Branch', location: 'Jeddah', manager: 'Fatima Al-Ahmed', employees: 15, status: 'active' }
    ],
    total: 2
  });
});

// Power of Attorney routes
app.get('/api/power-of-attorney', (req, res) => {
  res.json({
    data: [
      { _id: '1', clientName: 'ABC Company', attorneyName: 'Legal Representative', type: 'General', validUntil: '2025-12-31', status: 'active' },
      { _id: '2', clientName: 'XYZ Corp', attorneyName: 'Special Attorney', type: 'Special', validUntil: '2024-06-30', status: 'active' }
    ],
    total: 2
  });
});

// Execution Requests routes
app.get('/api/execution-requests', (req, res) => {
  res.json({
    data: [
      { _id: '1', caseNumber: 'EXE-2024-001', court: 'Execution Court', amount: 50000, status: 'pending', requestDate: '2024-01-20' },
      { _id: '2', caseNumber: 'EXE-2024-002', court: 'Execution Court', amount: 75000, status: 'approved', requestDate: '2024-01-15' }
    ],
    total: 2
  });
});

// Users routes
app.get('/api/users', (req, res) => {
  res.json({
    data: [
      { _id: '1', name: 'Admin User', email: 'admin@saudilegal.com', role: 'admin', status: 'active', lastLogin: '2024-01-20' },
      { _id: '2', name: 'Lawyer User', email: 'lawyer@saudilegal.com', role: 'lawyer', status: 'active', lastLogin: '2024-01-19' }
    ],
    total: 2
  });
});

// Roles routes
app.get('/api/roles', (req, res) => {
  res.json({
    data: [
      { _id: '1', name: 'Admin', permissions: ['all'], description: 'Full system access', usersCount: 2 },
      { _id: '2', name: 'Lawyer', permissions: ['cases', 'clients', 'documents'], description: 'Legal operations', usersCount: 5 },
      { _id: '3', name: 'Secretary', permissions: ['appointments', 'documents'], description: 'Administrative tasks', usersCount: 3 }
    ],
    total: 3
  });
});

// Archive routes
app.get('/api/archive', (req, res) => {
  res.json({
    data: [
      { _id: '1', documentName: 'Old Contract 2020', type: 'contract', archivedDate: '2023-01-01', size: '2.5 MB', category: 'Legal' },
      { _id: '2', documentName: 'Closed Case Files', type: 'case', archivedDate: '2023-06-15', size: '15 MB', category: 'Cases' }
    ],
    total: 2
  });
});

// Contacts routes
app.get('/api/contacts', (req, res) => {
  res.json({
    data: [
      { _id: '1', name: 'Judge Ahmed', title: 'Senior Judge', organization: 'Commercial Court', phone: '+966501234567', email: 'judge@court.sa' },
      { _id: '2', name: 'Expert Consultant', title: 'Legal Expert', organization: 'Consulting Firm', phone: '+966507654321', email: 'expert@consult.sa' }
    ],
    total: 2
  });
});

// Reminders routes
app.get('/api/reminders', (req, res) => {
  res.json({
    data: [
      { _id: '1', title: 'Court Hearing', description: 'Case #123 hearing', dueDate: '2024-02-15', time: '10:00 AM', priority: 'high', status: 'pending' },
      { _id: '2', title: 'Document Submission', description: 'Submit evidence for Case #456', dueDate: '2024-02-20', time: '5:00 PM', priority: 'medium', status: 'pending' }
    ],
    total: 2
  });
});

// Quotations routes
app.get('/api/quotations', (req, res) => {
  res.json({
    data: [
      { _id: '1', quotationNumber: 'QUO-2024-001', clientName: 'New Client Corp', amount: 25000, validUntil: '2024-02-28', status: 'pending' },
      { _id: '2', quotationNumber: 'QUO-2024-002', clientName: 'Startup LLC', amount: 15000, validUntil: '2024-03-15', status: 'accepted' }
    ],
    total: 2
  });
});

// CRUD operations for all features (POST, PUT, DELETE)
// Store mock data in memory for CRUD operations
let mockData = {
  cases: [],
  clients: [],
  documents: [],
  invoices: [],
  payments: [],
  expenses: [],
  treasury: [],
  tasks: [],
  appointments: [],
  employees: [],
  leaves: [],
  branches: [],
  legalLibrary: [],
  sessions: [],
  powerOfAttorney: [],
  executionRequests: [],
  users: [],
  roles: [],
  archive: [],
  contacts: [],
  reminders: [],
  quotations: []
};

// Generic POST handler for creating items
app.post('/api/:resource', (req, res) => {
  const resource = req.params.resource.replace(/-/g, '');
  const newItem = {
    _id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  if (!mockData[resource]) {
    mockData[resource] = [];
  }
  
  mockData[resource].push(newItem);
  
  res.json({
    success: true,
    data: newItem,
    message: `${resource} created successfully`
  });
});

// Generic PUT handler for updating items
app.put('/api/:resource/:id', (req, res) => {
  const resource = req.params.resource.replace(/-/g, '');
  const id = req.params.id;
  
  if (!mockData[resource]) {
    mockData[resource] = [];
  }
  
  const index = mockData[resource].findIndex(item => item._id === id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: `${resource} not found`
    });
  }
  
  mockData[resource][index] = {
    ...mockData[resource][index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: mockData[resource][index],
    message: `${resource} updated successfully`
  });
});

// Generic DELETE handler
app.delete('/api/:resource/:id', (req, res) => {
  const resource = req.params.resource.replace(/-/g, '');
  const id = req.params.id;
  
  if (!mockData[resource]) {
    mockData[resource] = [];
  }
  
  mockData[resource] = mockData[resource].filter(item => item._id !== id);
  
  res.json({
    success: true,
    message: `${resource} deleted successfully`
  });
});

// Generic handler for all other routes
app.all('/api/*', (req, res) => {
  res.json({
    success: true,
    data: req.method === 'GET' ? [] : {},
    message: `Mock response for ${req.method} ${req.path}`
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
========================================
🚀 Mock Backend Server Started
========================================
📍 URL: http://localhost:${PORT}
📍 API Base: http://localhost:${PORT}/api
📍 CORS Origin: http://localhost:3005
========================================
✅ Ready to handle frontend requests!
========================================
  `);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down mock server...');
  process.exit(0);
});
