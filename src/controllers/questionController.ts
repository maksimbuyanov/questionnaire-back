import { Request, Response } from 'express';
import prisma from '../models/prisma';
import { getCachedQuestions } from '../services/questionService';

// Получение случайного вопроса
export const getRandomQuestion = async (req: Request, res: Response) => {
    const { telegramId } = req.params;

    try {
        // Получаем список всех вопросов пользователя
        const unansweredQuestions = await getCachedQuestions(telegramId);

        if (unansweredQuestions.length === 0) {
            return res.status(404).json({message: 'Нет вопросов для пользователя.'});
        }

        // Выбираем случайный вопрос
        const randomQuestion = unansweredQuestions[Math.floor(Math.random() * unansweredQuestions.length)];

        // Получаем информацию о вопросе и сегменте
        const question = await prisma.question.findUnique({
            where: { id: randomQuestion.id },
            include: { segment: true,  },
        });

        return res.json({ question });
    } catch (error) {
        console.error('Ошибка при получении случайного вопроса:', error);
        return res.status(500).json({ message: 'Ошибка при получении вопроса.' });
    }
};

// Получение статистики прогресса
export const getUserProgress = async (req: Request, res: Response) => {
    const { telegramId } = req.params;

    try {
        const totalQuestions = await prisma.question.count();
        const unansweredQuestions = await getCachedQuestions(telegramId);

        return res.json({
            totalQuestions,
            unansweredQuestions: unansweredQuestions.length,
        });
    } catch (error) {
        console.error('Ошибка при получении прогресса пользователя:', error);
        return res.status(500).json({ message: 'Ошибка при получении прогресса.' });
    }
};
