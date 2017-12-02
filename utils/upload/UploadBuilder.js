/**
 * @author tnagorra <weathermist@gmail.com>
 */

import Uploader from './Uploader';

/* Builder class for Uploader */
export default class UploadBuilder {
    file(val) {
        this.fileValue = val;
        return this;
    }

    url(val) {
        this.urlValue = val;
        return this;
    }

    // params hold the headers
    params(val) {
        this.paramsValue = val;
        return this;
    }

    progress(fn) {
        this.progressFn = fn;
        return this;
    }

    success(fn) {
        this.successFn = fn;
        return this;
    }

    failure(fn) {
        this.failureFn = fn;
        return this;
    }

    fatal(fn) {
        this.fatalFn = fn;
        return this;
    }

    abort(fn) {
        this.abortFn = fn;
        return this;
    }

    preLoad(fn) {
        this.preLoadFn = fn;
        return this;
    }

    postLoad(fn) {
        this.postLoadFn = fn;
        return this;
    }

    build() {
        return new Uploader(
            this.fileValue,
            this.urlValue,
            this.paramsValue,
            this.progressFn,
            this.successFn,
            this.failureFn,
            this.fatalFn,
            this.abortFn,
            this.preLoadFn,
            this.postLoadFn,
        );
    }
}
