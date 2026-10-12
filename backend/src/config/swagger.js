import swaggerUi from 'swagger-ui-express'

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'TailorConnect API Documentation',
    version: '1.0.0',
    description: 'Production-ready REST API for TailorConnect tailoring services and fashion learning platform.'
  },
  servers: [
    {
      url: 'https://tailorconnect-deploy.onrender.com',
      description: 'Production Server (Render)'
    },
    {
      url: 'http://localhost:5000',
      description: 'Development Server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token: Bearer <token>'
      }
    }
  },
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register a new user account (Customer, Tailor, Student, Admin)',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                  role: { type: 'string', enum: ['CUSTOMER', 'TAILOR', 'STUDENT', 'ADMIN'] },
                  phone: { type: 'string' },
                  location: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Registration successful' } }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Login with email/username/phone and password',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  identifier: { type: 'string' },
                  password: { type: 'string' },
                  role: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Login successful with JWT token' } }
      }
    },
    '/api/auth/google': {
      post: {
        summary: 'Google OAuth authentication endpoint',
        tags: ['Authentication'],
        responses: { 200: { description: 'Google login successful' } }
      }
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current authenticated user profile',
        tags: ['Authentication'],
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'User profile retrieved' } }
      }
    },
    '/api/tailors': {
      get: {
        summary: 'Search & list verified active tailors',
        tags: ['Tailors'],
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'location', in: 'query', schema: { type: 'string' } },
          { name: 'specialist', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Tailors list with pagination' } }
      }
    },
    '/api/orders': {
      post: {
        summary: 'Customer places a bespoke dress order',
        tags: ['Orders'],
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'Order created' } }
      }
    },
    '/api/tailors/orders': {
      get: {
        summary: 'Incoming orders strictly for the logged-in tailor',
        tags: ['Orders'],
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Tailor incoming orders' } }
      }
    },
    '/api/courses': {
      get: {
        summary: 'Search and browse active tailoring learning courses',
        tags: ['Courses'],
        responses: { 200: { description: 'Active courses list' } }
      }
    },
    '/api/courses/{courseId}/register': {
      post: {
        summary: 'Student registers for a course',
        tags: ['Courses'],
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Registered for course' } }
      }
    },
    '/api/payments': {
      post: {
        summary: 'Process payment for an order or course enrollment',
        tags: ['Payments'],
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'Payment successful' } }
      }
    },
    '/api/payments/{id}/receipt': {
      get: {
        summary: 'Download official PDF tax invoice & payment receipt',
        tags: ['Payments'],
        responses: { 200: { description: 'PDF stream' } }
      }
    },
    '/api/students/certificates': {
      get: {
        summary: 'List earned course completion certificates for logged-in student',
        tags: ['Certificates'],
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Student certificates list' } }
      }
    },
    '/api/certificates/{id}/download': {
      get: {
        summary: 'Download official high-resolution landscape completion certificate PDF',
        tags: ['Certificates'],
        responses: { 200: { description: 'PDF stream' } }
      }
    },
    '/api/admin/dashboard': {
      get: {
        summary: 'Admin dashboard platform statistics (totalCustomers, totalTailors, totalStudents)',
        tags: ['Admin'],
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Admin statistics' } }
      }
    }
  }
}

export const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}
