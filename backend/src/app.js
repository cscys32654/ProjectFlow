import express from 'express';
import cors from 'cors';
import authRoutes      from './routes/auth.routes.js';
import projectRoutes   from './routes/project.routes.js';
import taskRoutes      from './routes/task.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use('/api/auth',                      authRoutes);
app.use('/api/projects',                  projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/dashboard',                 dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

export default app;