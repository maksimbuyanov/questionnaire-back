import {Markup} from 'telegraf';
import {oneLineButton} from './utils';
import {STAGES} from './constants';
import {messageManager} from './messageManager';
import {meetingService} from './meetingService';

const HELP_TEXT = 'Бот работает следующим образом: для начала мы познакомимся, это нужно для анализа статистики с разных сторон, пожалуйста отвечай максимально честно. \n\n' +
    'После этого тебе будут приходить сообщения с темами касающимися frontend и вариантами ответов, тебе нужно выбрать тот уровень разработчика, на котором, по твоему мнению, разработчик должен свободно обращаться с данной технологией (навыком). \n\n' +
    'Не обязательно проходить все вопросы за раз, ты можешь прерваться, а когда вернешься просто набери заново /start и мы продолжим с того же места, где остановились.'

export async function welcome(ctx: any) {
    const config = [
        {value: 'junior', label: 'Junior',},
        {value: 'middle', label: 'Middle',},
        {value: 'senior', label: 'Senior',},
        {value: 'lead', label: 'Lead',}
    ]
    await ctx.reply('Добро пожаловать в бот калибровки матрицы компетенций Frontend-разработчиков!\n\n' + HELP_TEXT).then((res: any) => messageManager.addMessage(res))
    const promise = ctx.reply('Давайте начнем с вашей текущей должности.', Markup.inlineKeyboard(
        config.map(oneLineButton(STAGES.JOB_POSITION))
    ));
    void messageManager.registry(ctx, promise);
}

export async function askExperience(ctx: any) {
    const config = [
        {value: '1', label: '0-1 год'},
        {value: '2', label: '1-3 года'},
        {value: '3', label: '3-5 лет'},
        {value: '5', label: 'Больше 5 лет'},
    ]
    const promise = ctx.reply('Каков ваш опыт работы?', Markup.inlineKeyboard(
        config.map(oneLineButton(STAGES.EXPERIENCE))
    ));

    void messageManager.registry(ctx, promise);
}

export async function askAge(ctx: any) {
    const config = [
        {value: '1', label: '18-25'},
        {value: '2', label: '26-35'},
        {value: '3', label: '36-45'},
        {value: 'skip', label: 'Пропустить'},
    ]
    const promise = ctx.reply('Укажите ваш возраст (можно пропустить):', Markup.inlineKeyboard(
        config.map(oneLineButton(STAGES.AGE))
    ));
    void messageManager.registry(ctx, promise);
}

export async function saveUserData(ctx: any) {
    const chatId = ctx.chat.id;

    try {
        await meetingService.saveUserData(chatId)

        await ctx.reply('Ваши данные сохранены.').then((res: any) => messageManager.addMessage(res))

        const button = Markup.button.callback('Показать тему', STAGES.SHOW_TOPIC)
        ctx.reply('Нажмите "Показать тему", чтобы начать.',
            Markup.inlineKeyboard([button])
        )
            .then((res: any) => messageManager.addMessage(res))

    } catch (error) {
        console.error(error);
        await ctx.reply('Произошла ошибка при сохранении данных.');
    }
}
