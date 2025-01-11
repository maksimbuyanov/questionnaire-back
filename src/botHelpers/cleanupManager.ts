export class CleanupManager<Entity> {
    static MINUTES_15 = 15 * 60 * 1000
    static MINUTES_30 = 30 * 60 * 1000
    static MINUTES_60 = 60 * 60 * 1000

    private timeoutMap: Map<Entity, NodeJS.Timeout> = new Map();
    private readonly clearTimeoutDuration: number = CleanupManager.MINUTES_60
    private readonly cleanupFn: (entity: Entity) => void

    constructor(cleanupFn: (entity: Entity) => void, clearTimeoutDuration: number) {
        this.cleanupFn = cleanupFn;
        this.clearTimeoutDuration = clearTimeoutDuration;
    }

    private registry(entity: Entity) {
        this.timeoutMap.set(entity, setTimeout(() => {
            this.cleanupFn(entity);
            this.timeoutMap.delete(entity);
        }, this.clearTimeoutDuration));
    }

    update(entity: Entity) {
        clearTimeout(this.timeoutMap.get(entity))
        this.registry(entity);
    }

    unregister(entity: Entity) {
        clearTimeout(this.timeoutMap.get(entity))
        this.timeoutMap.delete(entity);
    }
}
