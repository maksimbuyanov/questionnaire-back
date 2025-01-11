import { Request, Response } from 'express';
import prisma from '../models/prisma';

// Проверка существования пользователя
export const checkUserExists = async (req: Request, res: Response) => {
    const { telegramId } = req.params;

    const user = await prisma.user.findUnique({
        where: { telegramId },
    });

    if (user) {
        return res.json({ exists: true });
    }
    return res.json({ exists: false });
};

// Сохранение данных пользователя
export const saveUser = async (req: Request, res: Response) => {
    const { telegramId, jobPosition, experience, age, telegramNickname } = req.body;

    if (!jobPosition || !experience) {
        return res.status(400).json({ message: 'Должность и стаж обязательны.' });
    }

    try {
        await prisma.user.create({
            data: {
                telegramId: telegramId.toString(),
                jobPosition,
                age: age ? parseInt(age) : null,
                experience: parseInt(experience),
                telegramNickname,
            },
        });

        return res.status(201).json({ message: 'Данные пользователя успешно сохранены.' });
    } catch (error) {
        console.error('Ошибка при сохранении данных:', error);
        return res.status(500).json({ message: 'Ошибка сервера при сохранении данных.' });
    }
};
