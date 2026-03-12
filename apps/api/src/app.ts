import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import sessionsRoutes from './modules/sessions/sessions.routes';
import universitiesRoutes from './modules/universities/universities.routes';
import teamsRoutes from './modules/teams/teams.routes';
import usersRoutes from './modules/users/user.routes';
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
app.use('/api/sessions', sessionsRoutes);
app.use('/api/universities', universitiesRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/users', usersRoutes);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
