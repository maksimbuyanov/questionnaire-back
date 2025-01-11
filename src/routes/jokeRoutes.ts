import { Router } from 'express';
import { getRandomJoke } from '../controllers/jokeController';

const router = Router();

// Роут для поиска случайного анекдота
router.get('/random', getRandomJoke);

export default router;
