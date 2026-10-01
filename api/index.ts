import express, { Request, Response } from 'express';
import { apiRouter } from '../server/api.js';

// Create Express application instance for Vercel Serverless Function
const app = express();

// Middleware for parsing JSON and URL-encoded request bodies (increased to 50mb for base64 images)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
