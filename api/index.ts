import express, { Request, Response } from 'express';
import { apiRouter } from '../server/api.js';

// Create Express application instance for Vercel Serverless Function
const app = express();

// Middleware for parsing JSON request bodies
app.use(express.json());

// Healthcheck endpoints for testing deployment
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    environment: 'vercel-serverless',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    environment: 'vercel-serverless',
    timestamp: new Date().toISOString(),
  });
});

// Support both /api/* and direct routes (handles rewrite path variants seamlessly)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Export default Express app compatible with Vercel Serverless Functions
export default app;
