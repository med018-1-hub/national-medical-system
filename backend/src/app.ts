import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import patientRoutes from './routes/patient.routes';

const app: Application = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Healthcare API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
