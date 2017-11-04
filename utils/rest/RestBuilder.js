/**
 * @author tnagorra <weathermist@gmail.com>
 */

import RestRequest from './RestRequest';

/* Builder class for RestRequest */
export default class RestBuilder {
    url(val) {
        this.urlValue = val;
        return this;
    }

    params(val) {
        this.paramsValue = val;
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

    retryTime(val) {
        this.retryTimeVal = val;
        return this;
    }

    maxRetryAttempts(val) {
        this.maxRetryAttemptsVal = val;
        return this;
    }

    decay(val) {
        this.decayVal = val;
        return this;
    }

    maxRetryTime(val) {
        this.maxRetryTimeVal = val;
        return this;
    }

    build() {
        return new RestRequest(
            this.urlValue,
            this.paramsValue,
            this.successFn,
            this.failureFn,
            this.fatalFn,
            this.abortFn,
            this.preLoadFn,
            this.postLoadFn,
            this.retryTimeVal,
            this.maxRetryTimeVal,
            this.decayVal,
            this.maxRetryAttemptsVal,
        );
    }
}
