import { Router } from 'express';
import prisma  from '../models/prisma'; // Импортируем Prisma-клиент

const router = Router();

/**
 * POST /answer
 * Сохраняет ответ пользователя на вопрос.
 */
router.post('/', async (req, res) => {
    const { telegramId, questionId, optionId } = req.body;

    if (!telegramId || !questionId || !optionId) {
        return res.status(400).json({ error: 'Необходимо указать telegramId, questionId и optionId.' });
    }

    try {
        // Сохраняем ответ пользователя в таблицу Answer
        const answer = await prisma.answer.create({
            data: {
                telegramId: telegramId.toString(),
                questionId: parseInt(questionId),
                optionId: parseInt(optionId),
                // question:prisma.question
            },
        });

        return res.status(201).json({ message: 'Ответ успешно сохранен.', answer });
    } catch (error) {
        console.error('Ошибка при сохранении ответа:', error);
        return res.status(500).json({ error: 'Не удалось сохранить ответ.' });
    }
});

export default router;
