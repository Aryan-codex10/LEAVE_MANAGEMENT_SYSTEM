import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db-connection.js';
import authRoutes from './routes/auth-routes.js';
import leaveRoutes from './routes/leave-routes.js';

// Load environment variables from .env before any app logic
dotenv.config();

connectDB();

const app = express();

// Allow the configured client origin(s) to call this API with credentials
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',');
app.use(cors({ origin: allowedOrigins }));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Leave Management API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
