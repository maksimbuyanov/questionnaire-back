import {User} from '@prisma/client';
import {api} from './api';
import {CleanupManager} from './cleanupManager';

class MeetingService<UserId extends number = number> {
    userData: Record<number, User> = {};
    cleanupManager: CleanupManager<UserId>;

    constructor(cleanupTime: number = CleanupManager.MINUTES_60) {
        this.cleanupManager = new CleanupManager<UserId>((userId:UserId)=> {
            delete this.userData[userId]
        },cleanupTime);
    }

    updateJobPosition(id: UserId, position: User['jobPosition']) {
        this.userData[id].jobPosition = position
    }

    updateExperience(id: UserId, experience: User['experience']) {
        this.userData[id].experience = experience
    }

    updateAge(id: UserId, age: User['age']) {
        this.userData[id].age = age
    }

    getUserData(id: UserId) {
        return this.userData[id]
    }

    initUserData(id: UserId, username?: string) {
        this.userData[id] = {
            telegramId: id.toString(),
            jobPosition: 'outstaff',
            experience: 99,
            age: null,
            telegramNickname: username ?? null,
        }

        this.cleanupManager.update(id);
    }

    async checkUserData(id: UserId) {
        const res = await api.get<{
            exists: boolean;
        }>(`/user/exists/${id}`);
        return res.data.exists;
    }

    saveUserData(id: UserId) {
        return api.post('/user/save', this.getUserData(id));
    }
}

export const meetingService = new MeetingService();
