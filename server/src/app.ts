import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { Container } from 'typedi';
import { DatabaseClient } from './database/database.client';
import { errorHandler } from './middleware/error.handler';
import apiRoutes from './routes';

// Load OpenAPI spec
const openapiSpec = YAML.load(path.join(__dirname, 'docs/openapi.yaml'));

export function createApp(): express.Application {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // API Documentation (Swagger UI)
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, {
    customSiteTitle: 'XenonFlow API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
    },
  }));

  // OpenAPI JSON spec endpoint (for AI consumption)
  app.get('/api-openapi.json', (_req, res) => {
    res.json(openapiSpec);
  });

  // Routes
  app.use('/api', apiRoutes);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

export function gracefulShutdown(): void {
  const db = Container.get(DatabaseClient);
  db.close();
}
