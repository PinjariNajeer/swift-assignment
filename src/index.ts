import express from 'express';
import { connectToDatabase } from './db';
import userRoutes from './routes/userRoutes';

const app = express();
const PORT = 3000;

app.use(express.json());

// Connect to MongoDB
connectToDatabase().then(() => {
  // Routes
  app.use('/users', userRoutes);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});