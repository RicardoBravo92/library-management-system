import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import { generalRateLimiter } from './middlewares/rateLimit.middleware.js';

const app: Application = express()
app.use(helmet()); 
app.use(compression()); 
app.use(morgan('dev')); 
app.use(cors()); 
app.use(express.json()); 
app.use(generalRateLimiter); 

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library Management System API',
      version: '1.0.0',
      description: 'A professional REST API for managing a library system, including authors, books, and users with JWT authentication.',
      contact: {
        name: 'API Support',
        email: 'support@library.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      },
    },
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
    servers: [
      {
        url: '/api/v1',
        description: 'V1 Server',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/routes/index.ts'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API Routes
app.use('/', routes);

app.use(errorHandler);

export default app;
