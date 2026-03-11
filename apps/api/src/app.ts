import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
