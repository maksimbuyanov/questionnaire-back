import prisma from '../models/prisma';

// Функция для получения всех вопросов, на которые пользователь еще не ответил
export const getCachedQuestions = async (telegramId: string) => {
    const answers = await prisma.answer.findMany({
        where: { telegramId },
    });

    const answeredQuestionIds = answers.map((answer) => answer.questionId);

    const unansweredQuestions = await prisma.question.findMany({
        where: {
            id: {
                notIn: answeredQuestionIds,
            },
        },
    });

    return unansweredQuestions;
};

// Функция для кеширования вопросов для пользователя (можно добавить расширенную логику кеширования)
export const setCacheForUser = async (telegramId: string, questions: any[]) => {
    // Здесь можно интегрировать Redis или другие методы кеширования
    // Пока оставим для будущего расширения
};
