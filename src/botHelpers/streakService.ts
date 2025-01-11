import {CleanupManager} from './cleanupManager';

class StreakService {
    static MINUTES_15 = 15 * 60 * 1000
    private map: Record<number, number> = {}
    private readonly maxStreak: number
    private cleanupManager: CleanupManager<number>

    constructor(maxStreak: number = 5, clearTimeoutDuration: number = CleanupManager.MINUTES_15) {
        this.maxStreak = maxStreak
        this.cleanupManager = new CleanupManager<number>((userId => {
                delete this.map[userId]
            }),
            clearTimeoutDuration
        )
    }

    check(userId: number) {
        if (this.map[userId] === undefined) {
            this.registryUser(userId)
        } else {
            this.incrementUser(userId)
        }

        if (this.map[userId] >= this.maxStreak) {
            this.unregisterUser(userId)
            return true
        } else {
            return false
        }
    }

    private registryUser(userId: number) {
        this.map[userId] = 1
        this.cleanupManager.update(userId)

    }

    private incrementUser(userId: number) {
        this.map[userId]++
        this.cleanupManager.update(userId)
    }


    private unregisterUser(userId: number) {
        delete this.map[userId]
        this.cleanupManager.unregister(userId)
    }
}

export default new StreakService(2)
