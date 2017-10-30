export default class Uploader {
    constructor(file, uploadUrl, requestHeader) {
        this.file = file;
        this.uploadUrl = uploadUrl;
        this.requestHeader = requestHeader;
        this.pending = false;
        this.progress = 0;

        this.onProgress = undefined;
        this.onAbort = undefined;
        this.onError = undefined;
        this.onLoad = undefined;

        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const progress = Math.round((e.loaded * 100) / e.total);
                this.progress = progress;
            }
            if (this.onProgress) {
                this.onProgress(this.progress, e);
            }
        };

        xhr.onabort = () => {
            this.progress = 0;
            this.pending = false;

            if (this.resolveUpload) {
                this.resolveUpload(xhr.status, xhr.response);
            }
            if (this.onAbort) {
                this.onAbort(xhr.status, xhr.response);
            }
        };

        xhr.onerror = () => {
            this.progress = 0;
            this.pending = false;

            if (this.resolveUpload) {
                this.resolveUpload(xhr.status, xhr.response);
            }
            if (this.onError) {
                this.onError(xhr.status, xhr.response);
            }
        };

        xhr.onload = () => {
            this.progress = Math.floor(xhr.status / 100) === 2 ? 100 : 0;
            this.pending = false;

            if (this.resolveUpload) {
                this.resolveUpload(xhr.status, xhr.response);
            }
            if (this.onLoad) {
                this.onLoad(xhr.status, xhr.response);
            }
        };

        this.xhr = xhr;
    }

    // PUBLIC (Promise)
    upload = () => {
        const promise = new Promise((resolve) => {
            this.resolveUpload = resolve;
            this.start();
        });

        return promise;
    }

    start = () => {
        if (this.pending) {
            console.error('Uploader already started');
            return;
        }
        this.pending = true;

        const formData = new FormData();
        formData.append('file', this.file);
        formData.append('title', this.file.name);

        const headerKeys = Object.keys(this.requestHeader);

        this.xhr.open('POST', this.uploadUrl);
        headerKeys.forEach((key) => {
            this.xhr.setRequestHeader(key, this.requestHeader[key]);
        });

        this.xhr.send(formData);
    }

    abort = () => {
        if (this.pending) {
            this.xhr.abort();
        }
    }
}

export { default as UploadCoordinator } from './Coordinator';
