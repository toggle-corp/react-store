const defaultProgressFn = () => { /* console.warn('No progress callback defined'); */ };
const defaultSuccessFn = () => { console.warn('No success callback defined'); };
const defaultFailureFn = () => { console.warn('No failure callback defined'); };
const defaultFatalFn = () => { console.warn('No fatal callback defined'); };
const defaultAbortFn = () => { console.warn('No abort callback defined'); };
const defaultPreLoadFn = () => { /* console.warn('No preload callback defined'); */ };
const defaultPostLoadFn = () => { /* console.warn('No postload callback defined'); */ };

export default class Uploader {
    constructor(
        file, url, params = {},
        progress = defaultProgressFn, success = defaultSuccessFn,
        failure = defaultFailureFn, fatal = defaultFatalFn,
        abort = defaultAbortFn, preLoad = defaultPreLoadFn, postLoad = defaultPostLoadFn,
    ) {
        this.file = file;
        this.uploadUrl = url;
        this.params = params;
        this.progress = progress;
        this.success = (...attrs) => { postLoad(); success(...attrs); };
        this.failure = (...attrs) => { postLoad(); failure(...attrs); };
        this.fatal = (...attrs) => { postLoad(); fatal(...attrs); };
        this.abort = (...attrs) => { postLoad(); abort(...attrs); };
        this.preLoad = preLoad;
        this.postLoad = postLoad;

        // If the uploader is working or not
        this.uploading = false;
        this.progressPercent = 0;

        this.xhr = this.createNativeUploader();
    }

    // PRIVATE
    createNativeUploader = () => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const progressPercent = Math.round((e.loaded * 100) / e.total);
                this.progressPercent = progressPercent;
            }
            // callback
            this.progress(this.progressPercent, e);
        };

        xhr.onabort = () => {
            this.uploading = false;
            this.progressPercent = 0;

            // callback
            this.abort();
        };

        xhr.onerror = () => {
            this.uploading = false;
            this.progressPercent = 0;

            let response;
            try {
                response = JSON.parse(xhr.response);
            } catch (err) {
                // callback
                this.fatal({ errorMessage: 'Error while parsing json', errorCode: null }, xhr.status);
                return;
            }
            // callback
            this.fatal(response, xhr.status);
        };

        xhr.onload = () => {
            const okay = Math.floor(xhr.status / 100) === 2;

            this.uploading = false;
            this.progressPercent = okay ? 100 : 0;

            let response;
            try {
                response = JSON.parse(xhr.response);
            } catch (err) {
                // callback
                this.fatal({ errorMessage: 'Error while parsing json', errorCode: null }, xhr.status);
                return;
            }

            console.log(`Recieving ${this.uploadUrl}`, response);

            if (okay) {
                // callback
                this.success(response, xhr.status);
            } else {
                // callback
                this.failure(response, xhr.status);
            }
        };

        return xhr;
    }

    start = () => {
        if (this.uploading) {
            console.error('Uploader already started');
            return;
        }
        this.uploading = true;

        // callback
        this.preLoad();

        this.xhr.open('POST', this.uploadUrl);

        const formData = new FormData();
        formData.append('file', this.file);
        formData.append('title', this.file.name);

        const parameters = typeof this.params === 'function' ? this.params() : this.params;

        // DEBUG:
        console.log(`Fetching ${this.uploadUrl}`, parameters);

        const headerKeys = Object.keys(parameters.headers);
        headerKeys.forEach((key) => {
            this.xhr.setRequestHeader(key, parameters.headers[key]);
        });

        const bodyKeys = Object.keys(parameters.body);
        bodyKeys.forEach((key) => {
            formData.append(key, parameters.body[key]);
        });

        this.xhr.send(formData);
    }

    stop = () => {
        if (this.uploading) {
            this.xhr.abort();
        }
    }
}
