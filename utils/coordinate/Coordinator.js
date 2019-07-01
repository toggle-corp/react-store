/**
 * @author frozenhelium
 * @co-author tnagorra <weathermist@gmail.com>
 */

export default class Coordinator {
    constructor(preSession = undefined, postSession = undefined, maxActiveActors = 3) {
        this.maxActiveActors = maxActiveActors;
        this.preSession = preSession;
        this.postSession = postSession;

        // stores all the actors to be started
        // once started, it is moved to activeActors
        this.queuedActors = [];
        // stores all the actors that has started
        // once completed, it is just removed
        this.activeActors = [];

        // NOTE:
        // If all the actors immediately fail then,
        // at the time when the notifyComplete is called
        // the activeActors and queuedActors are both empty which
        // results in multiple postSession calls.
        // To prevent this, memorize the session state
        this.inSession = false;
        this.totalErrors = 0;
    }

    // INTERNAL
    getActorById = id => [...this.queuedActors, ...this.activeActors].find(
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
        if (oldActor !== undefined) {
            // console.warn(`Uploder with id '${id}' already registered.`);
            return false;
        }

        // create upload wrapper
        const actor = { id, nativeActor };

        // add upload wrapper to list
        this.queuedActors.push(actor);
        return true;
    }

    remove = (id) => {
        const indexInActive = this.getActiveActorIndexById(id);
        if (indexInActive >= 0) {
            console.log(id, 'active');
            const actor = this.activeActors[indexInActive];
            actor.nativeActor.stop();
            this.activeActors.splice(indexInActive, 1);
        }
        const indexInQueued = this.getQueuedActorIndexById(id);
        if (indexInQueued >= 0) {
            console.log(id, 'queue');
            this.queuedActors.splice(indexInQueued, 1);
        }
    }

    // INTERNAL
    // if there is activeQueue, and the no. of actors running is less than
    // the allowed value then start new actor
    updateActiveActors = () => {
        if (!this.inSession) {
            // current session has already completed
            // console.log('Session has already completed');
            return;
        }
        if (this.queuedActors.length <= 0 && this.activeActors.length <= 0) {
            // session has completed
            console.log('Session has completed');
            this.inSession = false;
            if (this.postSession) {
                this.postSession(this.totalErrors);
            }
            this.totalErrors = 0;
            return;
        }
        if (this.queuedActors.length <= 0) {
            // no queued actors left, but has active actors
            // console.log('No queued actors left');
            return;
        }
        if (this.activeActors.length >= this.maxActiveActors) {
            // over capacity
            // console.log('Update postponed until notified');
            return;
        }

        const toBeActiveActor = this.queuedActors[0];
        this.activeActors.push(toBeActiveActor);
        this.queuedActors.shift();

        // console.log('New actor started');

        // start actor
        toBeActiveActor.nativeActor.start();

        // call recurisively
        this.updateActiveActors();
    }

    // actors notify co-ordinator that it has completed with or without errors
    notifyComplete = (id, hasError = false) => {
        this.totalErrors += hasError ? 1 : 0;
        // remove from activeActors
        const actorIndex = this.getActiveActorIndexById(id);
        if (actorIndex < 0) {
            // console.warn('Id doesnt exist');
            return false;
        }
        this.activeActors.splice(actorIndex, 1);

        // console.log('Actor complete');
        // recalculate active actor list
        this.updateActiveActors();
        return true;
    }

    start = () => {
        this.inSession = true;
        if (this.preSession) {
            this.preSession();
        }
        this.updateActiveActors();
    }

    stop = () => {
        // console.warn('Session closing');
        const oldActiveActors = this.activeActors;

        // Clear everything
        this.activeActors = [];
        this.queuedActors = [];

        // stop current
        oldActiveActors.forEach(actor => actor.nativeActor.stop());

        /*
            // NOTE: don't call post session on stop
            // Make a different callback
            if (this.postSession) {
                this.postSession();
            }
        */
    }

    hasQueuedActors = () => this.queuedActors.length > 0;
}
