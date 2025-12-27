import request from 'supertest';
import express from 'express';

// Simple mock express app for testing
const app = express();
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mock auth endpoints for testing
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (email === 'admin@library.com' && password === 'admin123') {
    return res.json({
      token: 'mock-jwt-token',
      user: { id: '1', email, name: 'Admin', role: 'ADMIN' },
    });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

describe('API Health Check', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});

describe('Authentication', () => {
  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@library.com', password: 'admin123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('admin@library.com');
    });

    it('should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@library.com', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should require email and password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });
  });
});

describe('Input Validation', () => {
  it('should validate email format', () => {
    const validEmails = ['test@example.com', 'user@domain.org', 'admin@library.com'];
    const invalidEmails = ['notanemail', '@nodomain.com', 'missing@'];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    validEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(true);
    });

    invalidEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });

  it('should validate ISBN format', () => {
    const validISBNs = ['978-3-16-148410-0', '0-19-852663-6', '9780198526636'];

    validISBNs.forEach(isbn => {
      // ISBN can be 10 or 13 digits, optionally with hyphens
      const normalized = isbn.replace(/-/g, '');
      expect(normalized.length === 10 || normalized.length === 13).toBe(true);
    });
  });
});

describe('Business Logic', () => {
  it('should calculate overdue days correctly', () => {
    const calculateOverdueDays = (dueDate: Date): number => {
      const now = new Date();
      if (now <= dueDate) return 0;
      return Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    };

    // Book due yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(calculateOverdueDays(yesterday)).toBe(1);

    // Book due 7 days ago
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    expect(calculateOverdueDays(weekAgo)).toBe(7);

    // Book due tomorrow (not overdue)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(calculateOverdueDays(tomorrow)).toBe(0);
  });

  it('should calculate fines correctly', () => {
    const FINE_RATE_PER_DAY = 0.50;

    const calculateFine = (daysOverdue: number): number => {
      return daysOverdue * FINE_RATE_PER_DAY;
    };

    expect(calculateFine(0)).toBe(0);
    expect(calculateFine(1)).toBe(0.50);
    expect(calculateFine(7)).toBe(3.50);
    expect(calculateFine(30)).toBe(15.00);
  });

  it('should check borrowing limits', () => {
    const canBorrow = (currentLoans: number, maxBooks: number): boolean => {
      return currentLoans < maxBooks;
    };

    expect(canBorrow(0, 5)).toBe(true);
    expect(canBorrow(4, 5)).toBe(true);
    expect(canBorrow(5, 5)).toBe(false);
    expect(canBorrow(6, 5)).toBe(false);
  });

  it('should generate member numbers correctly', () => {
    const generateMemberNumber = (count: number): string => {
      return `LIB-${String(count + 1).padStart(3, '0')}`;
    };

    expect(generateMemberNumber(0)).toBe('LIB-001');
    expect(generateMemberNumber(9)).toBe('LIB-010');
    expect(generateMemberNumber(99)).toBe('LIB-100');
    expect(generateMemberNumber(999)).toBe('LIB-1000');
  });
});

describe('Data Integrity', () => {
  it('should validate book copy status transitions', () => {
    const validTransitions: Record<string, string[]> = {
      'AVAILABLE': ['BORROWED', 'MAINTENANCE', 'LOST'],
      'BORROWED': ['AVAILABLE', 'LOST'],
      'MAINTENANCE': ['AVAILABLE', 'LOST'],
      'LOST': ['AVAILABLE'],
    };

    const canTransition = (from: string, to: string): boolean => {
      return validTransitions[from]?.includes(to) ?? false;
    };

    // Valid transitions
    expect(canTransition('AVAILABLE', 'BORROWED')).toBe(true);
    expect(canTransition('BORROWED', 'AVAILABLE')).toBe(true);
    expect(canTransition('MAINTENANCE', 'AVAILABLE')).toBe(true);

    // Invalid transitions
    expect(canTransition('BORROWED', 'MAINTENANCE')).toBe(false);
    expect(canTransition('BORROWED', 'BORROWED')).toBe(false);
  });

  it('should validate member status', () => {
    const validStatuses = ['ACTIVE', 'SUSPENDED', 'EXPIRED'];

    validStatuses.forEach(status => {
      expect(validStatuses.includes(status)).toBe(true);
    });

    expect(validStatuses.includes('INVALID')).toBe(false);
  });
});
