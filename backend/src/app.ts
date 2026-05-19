import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import emergencyRoutes from './routes/emergency';
import bloodRoutes from './routes/blood';
import pandemicRoutes from './routes/pandemic';
import adminRoutes from './routes/admin';

const app: Application = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Healthcare API is running' });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/emergency', emergencyRoutes);
app.use('/api/v1/blood', bloodRoutes);
app.use('/api/v1/pandemic', pandemicRoutes);
app.use('/api/v1/admin', adminRoutes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
