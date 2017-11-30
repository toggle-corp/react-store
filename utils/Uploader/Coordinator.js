export default class Coordinator {
    constructor(maxActiveUploads = 3) {
        this.maxActiveUploads = maxActiveUploads;

        // stores all the actorss
        this.actors = [];
        // stores all the actors to be started
        // once started, it is moved to activeActors
        this.queuedActors = [];
        // stores all the actors that has started
        // once completed, it is just removed
        this.activeActors = [];
    }

    // INTERNAL
    getActorById = id => this.actors.find(
        actor => actor.id === id,
    )

    // INTERNAL
    getActorIndexById = id => this.actors.findIndex(
        actor => actor.id === id,
    )

    // INTERNAL
    getQueuedActorIndexById = id => this.queuedActors.findIndex(
        actor => actor.id === id,
    )

    // INTERNAL
    getActiveActorIndexById = id => this.activeActors.findIndex(
        actor => actor.id === id,
    )

    add = (id, nativeActor) => {
        const oldActor = this.getActorById(id);
        if (oldActor) {
            console.warn(`Uploder with id '${id}' already registered.`);
            return;
        }

        // create upload wrapper
        const actor = { id, nativeActor };

        // add upload wrapper to list
        this.actors.push(actor);
        this.queuedActors.push(actor);
    }

    remove = (id) => {
        const indexGlobal = this.getActorIndexById(id);
        if (indexGlobal >= 0) {
            this.actors.splice(indexGlobal, 1);
        }
        const indexInActive = this.getActiveActorIndexById(id);
        if (indexInActive >= 0) {
            const actor = this.activeActors[indexInActive];
            actor.nativeActor.close();
            this.activeActors.splice(indexInActive, 1);
        }
        const indexInQueued = this.getQueuedActorIndexById(id);
        if (indexInQueued >= 0) {
            this.activeActors.splice(indexInQueued, 1);
        }
    }

    // INTERNAL
    // if there is activeQueue, and the no. of actors running is less than
    // the allowed value then start new actor
    updateActiveActors = () => {
        if (this.queuedActors.length <= 0) {
            return;
        } else if (this.activeActors.length >= this.maxActiveUploads) {
            return;
        }

        const toBeActiveActor = this.queuedActors[0];
        this.activeActors.push(toBeActiveActor);
        this.queuedActors.shift();

        // start actor
        toBeActiveActor.nativeActor.start();

        // call recurisively
        this.updateActiveActors();
    }

    // actors notify co-ordinator that it has completed with or without errors
    notifyComplete = (id) => {
        // remove from activeActors
        const actorIndex = this.getActiveActorIndexById(id);
        this.activeActors.splice(actorIndex, 1);
        // recalculate active actor list
        this.updateActiveActors();
    }

    start = () => {
        // this.queuedActors = [...this.actors];
        this.updateActiveActors();
    }

    close = () => {
        const oldActiveActors = this.activeActors;

        // Clear everything
        this.actors = [];
        this.activeActors = [];
        this.queuedActors = [];

        // close current
        oldActiveActors.forEach(actor => actor.nativeActor.close());
    }

    hasActiveQueue = () => this.queuedActors.length > 0;
}
