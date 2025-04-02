import express from 'express';
import { fetchAndCacheData } from './dataService';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';

const app = express();
const port = 3001;

/**
 * Middleware to parse JSON requests
 */
app.use(express.json());

/**
 * Mount routes
 */
app.use('/users', userRoutes);
app.use('/posts', postRoutes);

/**
 * Start the server and fetch initial data
 */
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  try {
    await fetchAndCacheData();
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
  }
});
