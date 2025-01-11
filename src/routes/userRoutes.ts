import { Router } from 'express';
import { checkUserExists, saveUser } from '../controllers/userController';

const router = Router();

// Роут для проверки пользователя в базе
router.get('/exists/:telegramId', checkUserExists);

// Роут для сохранения данных пользователя
router.post('/save', saveUser);

export default router;
