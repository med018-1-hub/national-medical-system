import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import emergencyRoutes from './routes/emergency';

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

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
