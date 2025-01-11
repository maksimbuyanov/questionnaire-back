import { Router } from 'express';
import prisma  from '../models/prisma'; // Импортируем Prisma-клиент

const router = Router();

// Маршрут для получения всех вариантов ответов
router.get('/', async (req, res) => {
    try {
        const options = await prisma.option.findMany({
            select: {
                id: true,
                optionLabel: true,
            },
        });

        return res.json(options);
    } catch (error) {
        console.error('Ошибка при получении вариантов ответа:', error);
        return res.status(500).json({ error: 'Не удалось получить варианты ответа.' });
    }
});

export default router;
