import { RestRequest } from '@togglecorp/react-rest-request';

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
        this.successFn = (key, ...props) => fn(...props);
        return this;
    }

    failure(fn) {
        this.failureFn = (key, ...props) => fn(...props);
        return this;
    }

    fatal(fn) {
        this.fatalFn = (key, ...props) => fn(...props);
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

    afterLoad(fn) {
        this.afterLoadFn = fn;
        return this;
    }

    pollTime(val) {
        this.pollTimeVal = val;
        return this;
    }

    maxPollAttempts(val) {
        this.maxPollAttemptsVal = val;
        return this;
    }

    shouldPoll(fn) {
        this.shouldPollFn = fn;
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

    /*
    decay(val) {
        this.decayVal = val;
        return this;
    }
    */

    /*
    maxRetryTime(val) {
        this.maxRetryTimeVal = val;
        return this;
    }
    */

    delay(val) {
        this.delayVal = val;
        return this;
    }

    build() {
        return new RestRequest({
            key: 'unknown',
            url: this.urlValue,
            params: this.paramsValue,

            delay: this.delayVal,

            shouldPoll: this.shouldPollFn,
            pollTime: this.pollTimeVal,
            maxPollAttempts: this.maxPollAttemptsVal,

            onSuccess: this.successFn,
            onFailure: this.failureFn,
            onFatal: this.fatalFn,
            onAbort: this.abortFn,
            onPreLoad: this.preLoadFn,
            onPostLoad: this.postLoadFn,
            onAfterLoad: this.afterLoadFn,

            // shouldRetry, (new)
            retryTime: this.retryTimeVal,
            maxRetryAttemptsVal: this.maxRetryAttemptsVal,

            // this.maxRetryTimeVal, (obsolete)
            // this.decayVal, (obsolete)
        });
    }
}

export class BgRestBuilder extends RestBuilder {
    constructor() {
        super();
        this.delayVal = 100; // ms

        // this.decayVal = 0.3;
        // this.maxRetryTimeVal = 3000;
    }
}


export class FgRestBuilder extends RestBuilder {
    constructor() {
        super();
        this.delayVal = 50; // ms

        this.retryTimeVal = 1000;
        this.maxRetryAttemptsVal = 5;
    }
}
