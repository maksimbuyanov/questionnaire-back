import {Answer, Joke, Option, Question, Segment} from '@prisma/client';
import {Markup, Telegraf} from 'telegraf';
import dotenv from 'dotenv'
import {makeButtonValue} from './botHelpers/utils';
import {SEPARATOR, STAGES} from './botHelpers/constants';
import {meetingService} from './botHelpers/meetingService'
import streakService from './botHelpers/streakService'
import optionsService, {OptionsService} from './botHelpers/optionsService'
import {api} from './botHelpers/api';
import {askAge, askExperience, saveUserData, welcome} from './botHelpers/newUserStages';
import {AxiosError} from 'axios';
import {deleteManager, messageManager} from './botHelpers/messageManager';
import {CallbackQuery} from 'telegraf/typings/core/types/typegram';


dotenv.config()

const botToken = process.env.BOT_TOKEN;
if (!botToken) {
    throw new Error('Не найден BOT_TOKEN в переменных окружения');
}
const bot = new Telegraf(botToken);

function createButton(question: Question) {
    return (option: Option) => Markup.button.callback(option.optionLabel, makeButtonValue(STAGES.ANSWER, [question.id, option.id]));
};

bot.start(async (ctx: any) => {
    const chatId = ctx.chat.id;

    const isUserExist = await meetingService.checkUserData(chatId)

    if (isUserExist) {
        return messageManager.registry(ctx, showQuestion(ctx))
    }

    meetingService.initUserData(chatId, ctx.chat.username)
    return welcome(ctx)
});

// Обработчик нажатий на кнопки
bot.on('callback_query', async (ctx) => {
    if (!ctx?.chat?.id) return

    const chatId = ctx.chat.id;

    // TODO Проработать типизацию
    const cb = ctx.callbackQuery as CallbackQuery.DataQuery;
    const data = cb.data as string

    const [key, ...args] = data.split(SEPARATOR)

    switch (key) {
        case STAGES.JOB_POSITION:
            meetingService.updateJobPosition(chatId, args[0])
            await askExperience(ctx);
            break;

        case STAGES.EXPERIENCE:
            if (Number.isNaN(+args[0])) break;
            meetingService.updateExperience(chatId, +args[0])
            await askAge(ctx);
            break;

        case STAGES.AGE: {
            if (Number.isNaN(+args[0]) && args[0] !== 'skip') break;
            const response = args[0]
            meetingService.updateAge(chatId, response === 'skip' ? null : +response)
            await saveUserData(ctx);
            break;
        }

        case STAGES.AFTER_JOKE:
            await deleteManager.deletePreviousMessages(ctx)
        case STAGES.SHOW_TOPIC:
            void messageManager.registry(ctx, showQuestion(ctx))
            break;

        case STAGES.ANSWER:
            const [questionId, optionId] = args
            await submitAnswer(ctx, parseInt(questionId), parseInt(optionId));
            break;


        default:
            console.log(data)
            console.log('необработанная команда')
            break;
    }
});

// Функция для отображения случайного анекдота
async function sendJoke(ctx: any) {
    const JOKE_DIVIDER = '--------------------------------------------------'

    const joke = await api.get<{ joke: Joke }>('/joke/random');
    return ctx.reply(`Разбавим рутину анекдотом:
${joke.data.joke.text}
${JOKE_DIVIDER}`,
        Markup.inlineKeyboard(
            [Markup.button.callback('ахаха, продолжай', STAGES.AFTER_JOKE)]
        ))
}

// Функция для отображения случайного вопроса
async function showQuestion(ctx: any) {
    const chatId = ctx.chat.id;

    try {
        const response = await api.get<{ question: Question & { segment: Segment } }>(`/questions/random/${chatId}`);
        const {question} = response.data;

        const invertedPyramid = OptionsService.createInvertedPyramid(optionsService.getOptions());

        const buttonBuilder = createButton(question)
        return ctx.reply(`Вопрос на тему: ${question.segment.segmentLabel}\n\n${question.questionString}`, Markup.inlineKeyboard(
            invertedPyramid.map(line => {
                return line.map(buttonBuilder)
            })));
    } catch (error) {
        if (error instanceof AxiosError<{ message: string }>) {
            console.error(error);
            return ctx.reply(error.response?.data?.message ?? error.message);
        }
        console.error(error);
        return ctx.reply('Произошла ошибка при получении вопроса.');
    }
}

function sendNext(ctx: any) {
    const chatId = ctx.chat.id;
    if (streakService.check(chatId)) {
        void messageManager.deletePreviousMessages(ctx)
        sendJoke(ctx).then((res) => deleteManager.addMessage(res))
    } else {
        void messageManager.registry(ctx, showQuestion(ctx))
    }
}

// Функция для отправки ответа пользователя
async function submitAnswer(ctx: any, questionId: number, optionId: number) {
    const chatId = ctx.chat.id;
    const data: Omit<Answer, 'id' | 'createdAt'> = {
        telegramId: chatId,
        questionId,
        optionId,
    }
    try {
        await api.post(`/answer`, data);

        sendNext(ctx);
    } catch (error) {
        console.error(error);
        await ctx.reply('Произошла ошибка при отправке ответа.');
    }
}

bot.launch().then(() => {
    console.log('Бот запущен');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
