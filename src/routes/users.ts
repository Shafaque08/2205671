import { Router } from 'express';
import { getTopUsers } from '../dataService';

const router = Router();

/**
 * GET /users
 * Returns the top 5 users with the highest number of posts
 */
router.get('/', (req, res) => {
  try {
    const topUsers = getTopUsers();
    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

export default router;
