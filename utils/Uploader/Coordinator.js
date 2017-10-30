export default class Coordinator {
    constructor(maxActiveUploads = 3) {
        this.maxActiveUploads = maxActiveUploads;
        this.uploaders = []; //

        this.queuedUploaders = [];
        this.activeUploaders = [];
        this.hasActiveQueue = false;
    }

    getUploaderById = id => this.uploaders.find(uploader => uploader.id === id);

    add = (id, u) => {
        const oldUploader = this.getUploaderById(id);
        if (oldUploader) {
            console.warn(`Uploder with id '${id}' already registered.`);
            return;
        }

        const nativeUploader = u;
        const uploader = {
            id,
            nativeUploader,
            onLoad: nativeUploader.onLoad,
        };
        // override onLoad of uploader
        nativeUploader.onLoad = (status, response) => {
            this.handleUploaderLoad(id, status, response);
        };
        // add upload wrapper to list
        this.uploaders.push(uploader);
    }

    updateActiveUploaders = () => {
        if (!this.hasActiveQueue || this.activeUploaders.length >= this.maxActiveUploads) {
            return;
        }
        if (this.queuedUploaders.lengh <= 0) {
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

    handleUploaderLoad = (id, status, response) => {
        const uploaderIndex = this.activeUploaders.findIndex(d => d.id === id);
        this.activeUploaders.splice(uploaderIndex, 1);
        this.updateActiveUploaders();

        const uploader = this.getUploaderById(id);
        if (uploader.onLoad) {
            uploader.onLoad(status, response);
        }
    }

    // PUBLIC
    queueAll = () => {
        this.queuedUploaders = [...this.uploaders];
        this.hasActiveQueue = true;
        this.updateActiveUploaders();
    }

    // TODO: start, abort
}
