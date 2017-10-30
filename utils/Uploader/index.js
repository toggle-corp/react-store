export default class Uploader {
    constructor(file, uploadUrl, header) {
        this.file = file;
        this.uploadUrl = uploadUrl;
        this.requestHeader = header;

        const xhr = new XMLHttpRequest();
        this.pending = false;

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
            this.pending = false;
        };

        xhr.onerror = () => {
            this.pending = false;
        };

        xhr.onload = () => {
            if (Math.floor(xhr.status / 100) === 2) {
                this.progress = 100;
            } else {
                this.progress = 0;
            }

            this.pending = false;
            if (this.resolveUpload) {
                this.resolveUpload(xhr.response);
            }

            if (this.onLoad) {
                this.onLoad(xhr.status, xhr.response);
            }
        };

        this.xhr = xhr;
    }

    upload = () => {
        if (this.pending) {
            console.error('Uploader already started');
            return null;
        }

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

        console.log('Upload started');

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
