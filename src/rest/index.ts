import express, { Request, Response, NextFunction } from 'express';
import { router as apiRoutes } from './routes';
import { logger } from '../logging/logger';
import { HttpError } from '../errors/httpError';

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Mount API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    logger.warn(`HTTP Error ${err.statusCode}: ${err.message} for ${req.method} ${req.originalUrl}`);
    res.status(err.statusCode).json({ error: err.message });
  } else {
    logger.error(`Unhandled error for ${req.method} ${req.originalUrl}: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export { app };