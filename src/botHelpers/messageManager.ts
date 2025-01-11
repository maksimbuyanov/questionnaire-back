import {CleanupManager} from './cleanupManager';

interface SendMessageType<ChatId extends number = number> {
    message_id: number,
    chat: { id: ChatId }
}

type Func<Return> = (ctx: any, chatId: number, messageIds?: number[]) => Return

class MessageManager<ChatId extends number = number, PayloadFnReturn extends void | Promise<unknown> = void> {
    private readonly storage: Map<number, number[]> = new Map();
    private readonly cleanupManager: CleanupManager<ChatId>
    private readonly payloadFn: Func<PayloadFnReturn>

    constructor(payloadFn: Func<PayloadFnReturn>, clearTimeoutDuration: number = CleanupManager.MINUTES_60) {
        this.storage = new Map();
        this.payloadFn = payloadFn;
        this.cleanupManager = new CleanupManager<ChatId>(this.resetMessages,
            clearTimeoutDuration
        )
    }

    registry(ctx: any, promise: Promise<SendMessageType<ChatId>>) {
        const chatId = ctx.chat.id;
        this.cleanupManager.update(chatId);
        this.deletePreviousMessages(ctx)

        promise.then(sentMessage => {
            this.addMessage(sentMessage);
        });
    }

    private getMessagesIds(chatId: ChatId) {
        return this.storage.get(chatId);
    }

    private extractMessageIds(chatId: ChatId) {
        const messageIds = this.getMessagesIds(chatId);
        this.storage.delete(chatId);
        return messageIds;
    }

    private resetMessages(chatId: ChatId) {
        this.storage.delete(chatId);
    }

    addMessage(res: SendMessageType<ChatId>) {
        const chatId = res.chat.id;
        const messageId = res.message_id;

        const messages = this?.getMessagesIds(chatId)

        if (messages) {
            messages.push(messageId);
        } else {
            this?.storage.set(chatId, [messageId]);
        }
        this?.cleanupManager.update(chatId);
    }

    deletePreviousMessages(ctx: any): PayloadFnReturn {
        const chatId = ctx.chat.id;
        const messages = this.extractMessageIds(chatId);
        return this.payloadFn(ctx, chatId, messages);
    }

    debug() {
        console.log('storage', this?.storage);
    }
}


const messageManager = new MessageManager((ctx, _, messageIds) => {
    messageIds?.forEach(messageId => {
        ctx.deleteMessage(messageId);
    });
});

class DeleteManager extends MessageManager {
    constructor() {
        super(async (ctx, chatId, messageIds) => {
            if (!messageIds) return
            for (const messageId of messageIds) {
                await ctx.telegram.editMessageReplyMarkup(chatId, messageId, undefined, {
                    reply_markup: null,
                });
            }
        });
    }
}

const deleteManager = new DeleteManager();

export {deleteManager, messageManager}
