export default class Coordinator {
    constructor(maxActiveUploads = 3) {
        this.maxActiveUploads = maxActiveUploads;
        this.uploaders = []; //

        this.queuedUploaders = [];
        this.activeUploaders = [];
        this.hasActiveQueue = false;
    }

    getUploaderById = id => this.uploaders.find(
        uploader => uploader.id === id,
    )

    getActiveUploaderIndexById = id => this.activeUploaders.findIndex(
        uploader => uploader.id === id,
    )

    static fnToIntercept = ['success', 'failure', 'fatal', 'abort'];

    add = (id, u) => {
        const oldUploader = this.getUploaderById(id);
        if (oldUploader) {
            console.warn(`Uploder with id '${id}' already registered.`);
            return;
        }
        const nativeUploader = u;

        // Copy functions of nativeUploader
        const interceptedFn = Coordinator.fnToIntercept.reduce(
            (acc, val) => {
                acc[val] = nativeUploader[val];
                return acc;
            },
            {},
        );
        // NOTE: Override functions of nativeUploader
        Coordinator.fnToIntercept.forEach((val) => {
            nativeUploader[val] = this.handleUploaderLoad(id, val);
        });

        // add upload wrapper to list
        const uploader = { id, nativeUploader, interceptedFn };
        this.uploaders.push(uploader);
    }

    // override function for onload of uploader
    handleUploaderLoad = (id, fnName) => (status, response) => {
        const uploaderIndex = this.getActiveUploaderIndexById(id);
        this.activeUploaders.splice(uploaderIndex, 1);
        this.updateActiveUploaders();

        const uploader = this.getUploaderById(id);
        const fn = uploader.interceptedFn[fnName];
        if (fn) {
            fn(status, response);
        }
    }

    // if there is activeQueue, and the no. of uploaders running is less than
    // the allowed value then start new uploader
    updateActiveUploaders = () => {
        if (!this.hasActiveQueue || this.activeUploaders.length >= this.maxActiveUploads) {
            return;
        }
        if (this.queuedUploaders.length <= 0) {
            this.hasActiveQueue = false;
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

    // PUBLIC
    queueAll = () => {
        this.queuedUploaders = [...this.uploaders];
        this.hasActiveQueue = true;
        this.updateActiveUploaders();
    }

    // TODO: start, abort individual uploaders
}
