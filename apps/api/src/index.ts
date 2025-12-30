import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import authRoutes from './routes/auth.js';
import booksRoutes from './routes/books.js';
import membersRoutes from './routes/members.js';
import borrowingsRoutes from './routes/borrowings.js';
import dashboardRoutes from './routes/dashboard.js';
import finesRoutes from './routes/fines.js';
import reportsRoutes from './routes/reports.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShelfWise Library API',
      version: '1.0.0',
      description: 'API for ShelfWise Library ERP System',
    },
    servers: [
      { url: `http://localhost:${PORT}`, description: 'Development server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Books', description: 'Book management' },
      { name: 'Members', description: 'Member management' },
      { name: 'Borrowings', description: 'Borrowing operations' },
      { name: 'Dashboard', description: 'Dashboard statistics' },
    ],
    paths: {
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', example: 'admin@shelfwise.com' },
                    password: { type: 'string', example: 'admin123' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Login successful' } },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user',
          responses: { 200: { description: 'Current user info' } },
        },
        put: {
          tags: ['Auth'],
          summary: 'Update current user profile',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Profile updated' } },
        },
      },
      '/api/books': {
        get: {
          tags: ['Books'],
          summary: 'List all books',
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'List of books' } },
        },
        post: {
          tags: ['Books'],
          summary: 'Create a new book',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    author: { type: 'string' },
                    isbn: { type: 'string' },
                    category: { type: 'string' },
                    publishedYear: { type: 'integer' },
                    description: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Book created' } },
        },
      },
      '/api/books/{id}': {
        get: {
          tags: ['Books'],
          summary: 'Get a book by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Book details' } },
        },
        put: {
          tags: ['Books'],
          summary: 'Update a book',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Book updated' } },
        },
        delete: {
          tags: ['Books'],
          summary: 'Delete a book',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Book deleted' } },
        },
      },
      '/api/books/categories': {
        get: {
          tags: ['Books'],
          summary: 'Get all categories',
          responses: { 200: { description: 'List of categories' } },
        },
      },
      '/api/books/available-copies': {
        get: {
          tags: ['Books'],
          summary: 'Get available book copies',
          responses: { 200: { description: 'List of available copies' } },
        },
      },
      '/api/books/{bookId}/copies': {
        post: {
          tags: ['Books'],
          summary: 'Add a copy to a book',
          parameters: [{ name: 'bookId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    barcode: { type: 'string' },
                    condition: { type: 'string' },
                    shelfLocation: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Copy added' } },
        },
      },
      '/api/members': {
        get: {
          tags: ['Members'],
          summary: 'List all members',
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'List of members' } },
        },
        post: {
          tags: ['Members'],
          summary: 'Create a new member',
          responses: { 201: { description: 'Member created' } },
        },
      },
      '/api/members/{id}': {
        get: {
          tags: ['Members'],
          summary: 'Get a member by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Member details' } },
        },
        put: {
          tags: ['Members'],
          summary: 'Update a member',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Member updated' } },
        },
        delete: {
          tags: ['Members'],
          summary: 'Delete a member',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Member deleted' } },
        },
      },
      '/api/borrowings': {
        get: {
          tags: ['Borrowings'],
          summary: 'List all borrowings',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'RETURNED', 'OVERDUE'] } },
            { name: 'memberId', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'List of borrowings' } },
        },
      },
      '/api/borrowings/checkout': {
        post: {
          tags: ['Borrowings'],
          summary: 'Checkout a book',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    memberId: { type: 'string' },
                    barcode: { type: 'string' },
                    dueDate: { type: 'string', format: 'date' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Book checked out' } },
        },
      },
      '/api/borrowings/{id}': {
        get: {
          tags: ['Borrowings'],
          summary: 'Get borrowing details',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Borrowing details' } },
        },
        put: {
          tags: ['Borrowings'],
          summary: 'Update borrowing (extend due date)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Borrowing updated' } },
        },
        delete: {
          tags: ['Borrowings'],
          summary: 'Delete a borrowing',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Borrowing deleted' } },
        },
      },
      '/api/borrowings/{id}/return': {
        post: {
          tags: ['Borrowings'],
          summary: 'Return a book',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Book returned' } },
        },
      },
      '/api/borrowings/overdue/list': {
        get: {
          tags: ['Borrowings'],
          summary: 'Get overdue books',
          responses: { 200: { description: 'List of overdue borrowings' } },
        },
      },
      '/api/dashboard/stats': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get dashboard statistics',
          responses: { 200: { description: 'Dashboard stats' } },
        },
      },
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          security: [],
          responses: { 200: { description: 'API is healthy' } },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later' },
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many registration attempts, please try again later' },
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many verification attempts, please try again later' },
});

const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: 'Too many resend attempts, please try again later' },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: 'Too many password reset attempts, please try again later' },
});

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many password reset attempts, please try again later' },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/auth/verify', verifyLimiter);
app.use('/api/auth/resend-code', resendLimiter);
app.use('/api/auth/forgot-password', forgotPasswordLimiter);
app.use('/api/auth/reset-password', resetPasswordLimiter);

// Swagger UI
app.use('/', swaggerUi.serve);
app.get('/', swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ShelfWise API Docs',
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/borrowings', borrowingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/fines', finesRoutes);
app.use('/api/reports', reportsRoutes);

// Error handler
app.use((err: Error & { statusCode?: number; isOperational?: boolean }, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Log error with context
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };
  console.error(JSON.stringify(errorLog, null, 2));

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Don't leak internal error details in production
  const message = err.isOperational !== false
    ? err.message
    : 'An unexpected error occurred';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
