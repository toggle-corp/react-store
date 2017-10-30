export default class Coordinator {
    constructor() {
        this.maxActiveUploads = 3;
        this.currentUploads = [];
        this.uploadQueue = [];
        this.uploaders = [];

        this.uploadQueued = false;
    }

    add = (id, uploader) => {
        const newUploader = uploader;

        this.uploaders.push({
            id,
            uploader: newUploader,
            onLoad: uploader.onLoad,
        });

        newUploader.onLoad = (status, response) => {
            this.handleUploaderLoad(id, status, response);
        };
    }

    start = (id) => {
        const uploader = this.uploaders.find(d => d.id === id);

        if (uploader) {
            uploader.start();
        } else {
            console.warn(`Uploader with id = ${id} not found`);
        }
    }

    updateQueue = () => {
        if (this.uploadQueued && this.uploadQueue.length < this.maxActiveUploads) {
            if (this.currentUploads.length > 0) {
                this.uploadQueue.push(this.currentUploads[0]);
                this.currentUploads[0].uploader.start();
                this.currentUploads.shift();
                this.updateQueue();
            } else {
                this.uploadQueued = false;
            }
        }
    }

    handleUploaderLoad = (id, status, response) => {
        const uploaderIndex = this.uploadQueue.findIndex(d => d.id === id);
        const uploader = this.uploaders.find(d => d.id === id);

        this.uploadQueue.splice(uploaderIndex, 1);
        this.updateQueue();

        if (uploader.onLoad) {
            uploader.onLoad(status, response);
        }
    }

    queueAll = () => {
        this.currentUploads = [...this.uploaders];
        this.uploadQueued = true;
        this.updateQueue();
    }
}
