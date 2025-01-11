import { Router } from 'express';
import { getRandomQuestion, getUserProgress } from '../controllers/questionController';

const router = Router();

// Роут для получения случайного вопроса
router.get('/random/:telegramId', getRandomQuestion);

// Роут для получения статистики прогресса пользователя
router.get('/progress/:telegramId', getUserProgress);

export default router;
