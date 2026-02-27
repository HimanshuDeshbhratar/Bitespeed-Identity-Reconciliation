import 'dotenv/config';
import express from 'express';
import identifyRouter from './routes/identify';
import { initDB } from './config/database';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/identify', identifyRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const startServer = async () => {
  try {
    await initDB();

    app.listen(PORT, () => {
      console.log(`Database schema loaded successfully.`);
      console.log(`Bitespeed Identify API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();