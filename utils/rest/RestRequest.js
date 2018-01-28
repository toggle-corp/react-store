/**
 * @author tnagorra <weathermist@gmail.com>
 */

import { isTruthy } from '../common';

const noop = () => {};

/* Class for xhr requests with retry built in */
export default class RestRequest {
    /*
     * Parse url params and return an key-value pair
     * Input: stringParams (this.props.location.search.replace('?', ''))
     * Output: {'param': 'value', ....}
     */
    static parseUrlParams(stringParams) {
        // TODO: Decode
        const params = decodeURIComponent(stringParams).split('&');
        const paramsJson = {};
        params.forEach((param) => {
            const split = param.split('=');
            paramsJson[split[0]] = split[1];
        });
        return paramsJson;
    }

    /*
     * Accept a key-value pair and transform to query string
     */
    static prepareUrlParams(params) {
        return Object.keys(params)
            .filter(k => isTruthy(params[k]))
            .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
            .join('&');
    }

    constructor(
        url, params, success, failure, fatal, abort, preLoad, postLoad,
        retryTime = -1, maxRetryTime = -1, decay = -1, maxRetryAttempts = -1,
        pollTime = -1, maxPollAttempts = -1, shouldPoll,
        delay = 0,
    ) {
        const createWarningFn = text => (response) => {
            const parameters = typeof params === 'function' ? params() : params;
            console.warn(`${text} ${url}`, parameters);
            if (response) {
                console.log(response);
            }
        };

        if (!success) {
            createWarningFn('No success callback defined')();
        }
        if (!failure) {
            createWarningFn('No failure callback defined')();
        }
        if (!fatal) {
            createWarningFn('No fatal callback defined')();
        }

        const successFn = success || createWarningFn('No success callback defined');
        const failureFn = failure || createWarningFn('No failure callback defined');
        const fatalFn = fatal || createWarningFn('No fatal callback defined');
        const abortFn = abort || createWarningFn('No abort callback defined');
        const preLoadFn = preLoad || noop;
        const postLoadFn = postLoad || noop;

        this.url = url;
        this.params = params;

        this.success = (...attrs) => {
            postLoadFn();
            successFn(...attrs);
        };
        this.failure = (...attrs) => {
            postLoadFn();
            failureFn(...attrs);
        };
        this.fatal = (...attrs) => {
            postLoadFn();
            fatalFn(...attrs);
        };

        // NOTE: postLoad in not called on abort,
        // as load was interrupted
        this.abort = abortFn;
        this.preLoad = preLoadFn;
        this.postLoad = postLoadFn;

        this.retryTime = retryTime;
        this.decay = decay;
        this.maxRetryTime = maxRetryTime;
        this.maxRetryAttempts = maxRetryAttempts;

        this.pollTime = pollTime;
        this.maxPollAttempts = maxPollAttempts;
        this.shouldPoll = shouldPoll;

        this.delay = delay;

        if (maxRetryAttempts > 0 && this.retryTime <= 0 && this.decay <= 0) {
            throw new Error('RestRequest is not configured properly for retry.');
        }
        if (maxPollAttempts > 0 && (this.pollTime <= 0 || !this.shouldPoll)) {
            throw new Error('RestRequest is not configured properly for poll.');
        }

        this.retryCount = 1;
        this.retryId = null;

        this.pollCount = 1;
        this.pollId = null;

        this.aborted = false;
    }

    /* PRIVATE: Exponential function */
    exponentialTime = (decay, iteration) => (
        // eslint-disable-next-line no-restricted-properties
        decay * (Math.pow(2, iteration) - 1) * 1000
    )

    /* PRIVATE: get time after which retry is to be performed */
    calculateRetryTime = () => {
        const time = this.decay > 0
            ? this.exponentialTime(this.decay, this.retryCount)
            : this.retryTime;

        // retry time should be less than maxRetryTime (if defined)
        if (this.maxRetryTime > 0) {
            return Math.min(time, this.maxRetryTime);
        }
        return time;
    }

    /* Calculate the next retry time and call this.start again */
    retry = () => {
        if (this.maxRetryAttempts >= 0 && this.retryCount > this.maxRetryAttempts) {
            console.warn(`Max no. of retries exceeded ${this.url}`, this.parameters);
            return false;
        }
        const time = this.calculateRetryTime();
        if (time < 0) {
            // NOTE: this should never occur
            console.warn(`Retry time is negative ${this.url}`, this.parameters);
            return false;
        }
        this.retryId = setTimeout(this.internalStart, time);
        this.retryCount += 1;
        return true;
    }

    /* Call this.start again */
    poll = () => {
        if (this.maxPollAttempts <= 0) {
            return false;
        }
        if (this.pollCount > this.maxPollAttempts) {
            console.warn(`Max no. of polls exceeded ${this.url}`, this.parameters);
            return false;
        }
        this.pollId = setTimeout(this.internalStart, this.pollTime);
        this.pollCount += 1;
        return true;
    }

    start = () => {
        this.retryId = setTimeout(this.internalStart, this.delay);
    }

    /* Do a xhr request and parse response as json
     * If response.okay is true, calls success callback
     * If response.okay is false, calls failure callback
     * Else, calls fatal callback
     */
    internalStart = async () => {
        // Parameters can be a key-value pair or a function that returns a key-value pair
        this.parameters = typeof this.params === 'function' ? this.params() : this.params;

        if (this.aborted) {
            this.abort();
            return;
        }
        // Call function before fetch
        this.preLoad();

        // DEBUG:
        console.log(`Fetching ${this.url}`, this.parameters);
        let response;
        try {
            response = await fetch(this.url, this.parameters);
            if (this.aborted) {
                this.abort();
                return;
            }
        } catch (ex) {
            if (this.aborted) {
                this.abort();
                return;
            }
            // NOTE: a network problem may occur
            console.error(ex);
            const retrySuccessful = this.retry();
            if (!retrySuccessful) {
                this.fatal({ errorMessage: ex.message, errorCode: ex.statusCode });
            }
            return;
        }

        let responseBody;
        try {
            responseBody = await response.json();
            if (this.aborted) {
                this.abort();
                return;
            }
        } catch (ex) {
            if (this.aborted) {
                this.abort();
                return;
            }
            // NOTE: Unless the response is supposed to be NO CONTENT, we
            // have got parsing error.
            // For example, this can happend in REST DELETE request.
            if (response.status !== 204) {
                this.fatal({ errorMessage: 'Error while parsing json', errorCode: null });
                return;
            }
        }

        // DEBUG:
        console.log(`Recieving ${this.url}`, responseBody);
        const isOkay = response.ok && Math.floor(responseBody.responseCode / 100) === 2;
        if (isOkay) {
            // NOTE: clear out old retryCount
            this.retryCount = 1;
            if (this.shouldPoll && this.shouldPoll(responseBody)) {
                this.poll();
            } else {
                this.success(responseBody);
            }
            return;
        }

        // NOTE: problem with response may occur
        const is5xxError = Math.floor(response.status / 100) === 5;
        // Only retry on 5xx errors
        if (!is5xxError) {
            this.failure(responseBody);
            return;
        }

        const retrySuccessful = this.retry();
        if (!retrySuccessful) {
            this.failure(responseBody);
        }
    }

    /* Stop any retry action */
    stop = () => {
        clearTimeout(this.retryId);
        clearTimeout(this.pollId);
        this.pollCount = 1;
        this.retryCount = 1;
        this.aborted = true;
        // NOTE: fetch is not really aborted, just ignored
    }
}
