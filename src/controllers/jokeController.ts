import { Request, Response } from 'express';
import prisma from '../models/prisma';

// Поиск рандомной шутки
export const getRandomJoke = async (req: Request, res: Response) => {
    const jokesCount = await prisma.joke.count()

    const random = Math.ceil(Math.random() * jokesCount);
    const joke = await prisma.joke.findUnique({
        where: {id: random}
    })


    if (joke) {
        return res.json({ joke: joke });
    }
    return res.json({ joke: 'Анекдот не найден' });
};
