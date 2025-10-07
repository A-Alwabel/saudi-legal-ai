// Input Validation Middleware for Saudi Legal AI v2
// Comprehensive validation for all API inputs

class ValidationMiddleware {
  // Validate email format
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate phone number (Saudi format)
  static isValidPhone(phone) {
    const phoneRegex = /^(\+966|966|05)[0-9]{8,9}$/;
    return phoneRegex.test(phone?.replace(/\s/g, ''));
  }

  // Validate password strength
  static isStrongPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    return password && 
           password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password);
  }

  // Validate Saudi National ID
  static isValidNationalId(id) {
    return id && /^[12]\d{9}$/.test(id);
  }

  // Sanitize string input
  static sanitizeString(str) {
    if (!str) return '';
    return String(str).trim().replace(/<script.*?>.*?<\/script>/gi, '');
  }

  // Validate required fields
  static validateRequired(fields, data) {
    const missing = [];
    fields.forEach(field => {
      if (!data[field]) {
        missing.push(field);
      }
    });
    return missing;
  }

  // Registration validation
  static validateRegistration(req, res, next) {
    const { email, password, name } = req.body;
    const errors = [];

    // Check required fields
    if (!email) errors.push('Email is required');
    if (!password) errors.push('Password is required');
    if (!name) errors.push('Name is required');

    // Validate email format
    if (email && !ValidationMiddleware.isValidEmail(email)) {
      errors.push('Invalid email format');
    }

    // Validate password strength
    if (password && !ValidationMiddleware.isStrongPassword(password)) {
      errors.push('Password must be at least 8 characters with uppercase, lowercase, and numbers');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    // Sanitize inputs
    req.body.email = ValidationMiddleware.sanitizeString(email).toLowerCase();
    req.body.name = ValidationMiddleware.sanitizeString(name);

    next();
  }

  // Login validation
  static validateLogin(req, res, next) {
    const { email, password } = req.body;
    const errors = [];

    if (!email) errors.push('Email is required');
    if (!password) errors.push('Password is required');

    if (email && !ValidationMiddleware.isValidEmail(email)) {
      errors.push('Invalid email format');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    req.body.email = ValidationMiddleware.sanitizeString(email).toLowerCase();
    next();
  }

  // Case creation validation
  static validateCase(req, res, next) {
    const { title, type, clientId } = req.body;
    const errors = [];

    if (!title) errors.push('Case title is required');
    if (!type) errors.push('Case type is required');
    if (!clientId) errors.push('Client ID is required');

    const validTypes = ['civil', 'criminal', 'commercial', 'family', 'labor', 'administrative'];
    if (type && !validTypes.includes(type)) {
      errors.push(`Invalid case type. Must be one of: ${validTypes.join(', ')}`);
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    // Sanitize
    req.body.title = ValidationMiddleware.sanitizeString(title);
    next();
  }

  // Client creation validation
  static validateClient(req, res, next) {
    const { name, email, phone, nationalId } = req.body;
    const errors = [];

    if (!name) errors.push('Client name is required');
    if (!email && !phone) errors.push('Either email or phone is required');

    if (email && !ValidationMiddleware.isValidEmail(email)) {
      errors.push('Invalid email format');
    }

    if (phone && !ValidationMiddleware.isValidPhone(phone)) {
      errors.push('Invalid phone number format (use Saudi format: +966XXXXXXXXX)');
    }

    if (nationalId && !ValidationMiddleware.isValidNationalId(nationalId)) {
      errors.push('Invalid national ID format (10 digits starting with 1 or 2)');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    // Sanitize
    req.body.name = ValidationMiddleware.sanitizeString(name);
    if (email) req.body.email = ValidationMiddleware.sanitizeString(email).toLowerCase();
    next();
  }

  // Invoice validation
  static validateInvoice(req, res, next) {
    const { clientId, amount, items } = req.body;
    const errors = [];

    if (!clientId) errors.push('Client ID is required');
    if (!amount || amount <= 0) errors.push('Valid amount is required');
    if (!items || !Array.isArray(items) || items.length === 0) {
      errors.push('At least one invoice item is required');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    next();
  }

  // Task validation
  static validateTask(req, res, next) {
    const { title, priority, status } = req.body;
    const errors = [];

    if (!title) errors.push('Task title is required');

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) {
      errors.push(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
    }

    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      errors.push(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    req.body.title = ValidationMiddleware.sanitizeString(title);
    next();
  }

  // AI consultation validation
  static validateAIConsultation(req, res, next) {
    const { query } = req.body;
    const errors = [];

    if (!query || query.trim().length === 0) {
      errors.push('Query is required');
    }

    if (query && query.length < 10) {
      errors.push('Query must be at least 10 characters');
    }

    if (query && query.length > 5000) {
      errors.push('Query must be less than 5000 characters');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    req.body.query = ValidationMiddleware.sanitizeString(query);
    next();
  }

  // Generic ID validation
  static validateId(req, res, next) {
    const { id } = req.params;
    
    // Check if it's a valid MongoDB ObjectId format
    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format'
      });
    }

    next();
  }

  // Rate limiting check (simple implementation)
  static rateLimiter(maxRequests = 100, windowMs = 60000) {
    const requests = new Map();

    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      const windowStart = now - windowMs;

      if (!requests.has(ip)) {
        requests.set(ip, []);
      }

      const userRequests = requests.get(ip);
      const recentRequests = userRequests.filter(time => time > windowStart);

      if (recentRequests.length >= maxRequests) {
        return res.status(429).json({
          success: false,
          error: 'Too many requests. Please try again later.'
        });
      }

      recentRequests.push(now);
      requests.set(ip, recentRequests);

      next();
    };
  }
}

module.exports = ValidationMiddleware;

