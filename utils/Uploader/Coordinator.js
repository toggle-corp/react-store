// TODO: start, abort individual uploaders

export default class Coordinator {
    constructor(maxActiveUploads = 3) {
        this.maxActiveUploads = maxActiveUploads;

        // stores all the uploaders
        this.uploaders = [];
        // stores all the uploaders to be started
        // once started, it is moved to activeUploaders
        this.queuedUploaders = [];
        // stores all the uploaders that has started
        // once completed, it is just removed
        this.activeUploaders = [];
    }

    // INTERNAL
    static fnToIntercept = ['success', 'failure', 'fatal', 'abort'];

    hasActiveQueue = () => this.queuedUploaders.length > 0;

    // INTERNAL
    getUploaderById = id => this.uploaders.find(
        uploader => uploader.id === id,
    )

    // INTERNAL
    getUploaderIndexById = id => this.uploaders.findIndex(
        uploader => uploader.id === id,
    )

    // INTERNAL
    getQueuedUploaderIndexById = id => this.queuedUploaders.findIndex(
        uploader => uploader.id === id,
    )

    // INTERNAL
    getActiveUploaderIndexById = id => this.activeUploaders.findIndex(
        uploader => uploader.id === id,
    )

    add = (id, u) => {
        const oldUploader = this.getUploaderById(id);
        if (oldUploader) {
            console.warn(`Uploder with id '${id}' already registered.`);
            return;
        }
        const nativeUploader = u;
        // Copy functions of nativeUploader
        const interceptedFn = Coordinator.fnToIntercept.reduce(
            (acc, fnName) => {
                acc[fnName] = nativeUploader[fnName];
                return acc;
            },
            {},
        );
        // NOTE: Override functions of nativeUploader
        Coordinator.fnToIntercept.forEach((fnName) => {
            nativeUploader[fnName] = this.handleUploaderLoad(id, fnName);
        });

        // add upload wrapper to list
        const uploader = { id, nativeUploader, interceptedFn };
        this.uploaders.push(uploader);
        this.queuedUploaders.push(uploader);
    }

    remove = (id) => {
        /*
            // NOTE: removing this caused error with callbacks
            const indexGlobal = this.getUploaderIndexById(id);
            if (indexGlobal >= 0) {
                this.uploaders.splice(indexGlobal, 1);
            }
        */
        const indexInActive = this.getActiveUploaderIndexById(id);
        if (indexInActive >= 0) {
            const uploader = this.activeUploaders[indexInActive];
            uploader.nativeUploader.close();
            this.activeUploaders.splice(indexInActive, 1);
        }
        const indexInQueued = this.getQueuedUploaderIndexById(id);
        if (indexInQueued >= 0) {
            this.activeUploaders.splice(indexInQueued, 1);
        }
    }

    // INTERNAL
    // override function for onload of uploader
    handleUploaderLoad = (id, fnName) => (status, response) => {
        // callback
        const uploader = this.getUploaderById(id);
        const fn = uploader.interceptedFn[fnName];
        if (fn) {
            fn(status, response);
        }

        // remove from activeUploaders
        const uploaderIndex = this.getActiveUploaderIndexById(id);
        this.activeUploaders.splice(uploaderIndex, 1);
        // recalculate active uploader list
        this.updateActiveUploaders();
    }

    // INTERNAL
    // if there is activeQueue, and the no. of uploaders running is less than
    // the allowed value then start new uploader
    updateActiveUploaders = () => {
        if (this.queuedUploaders.length <= 0) {
            return;
        } else if (this.activeUploaders.length >= this.maxActiveUploads) {
            return;
        }

        const toBeActiveUploader = this.queuedUploaders[0];
        this.activeUploaders.push(toBeActiveUploader);
        this.queuedUploaders.shift();

        // start uploader
        toBeActiveUploader.nativeUploader.start();

        // call recurisively
        this.updateActiveUploaders();
    }

    queueAll = () => {
        // this.queuedUploaders = [...this.uploaders];
        this.updateActiveUploaders();
    }

    close = () => {
        this.activeUploaders.forEach(uploader => uploader.nativeUploader.close());
    }
}
