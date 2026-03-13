import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import sessionsRoutes from './modules/sessions/sessions.routes';
import universitiesRoutes from './modules/universities/universities.routes';
import teamsRoutes from './modules/teams/teams.routes';
import usersRoutes from './modules/users/user.routes';
import projectsRoutes from './modules/projects/projects.routes';
import votingRoutes from './modules/voting/voting.routes';
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
app.use('/api', projectsRoutes);
app.use('/api', votingRoutes);

// API not found handler (keeps 404 responses JSON and explicit)
app.use('/api', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
