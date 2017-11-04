/**
 * @author tnagorra <weathermist@gmail.com>
 */

import { isTruthy } from '../common';

const defaultSuccessFn = () => { console.warn('No success callback defined'); };
const defaultFailureFn = () => { console.warn('No failure callback defined'); };
const defaultFatalFn = () => { console.warn('No fatal callback defined'); };

/* Class for xhr requests with retry built in */
export default class RestRequest {
    /*
     * Parse url params and return an key-value pair
     * Input: stringParams (this.props.location.search.replace('?', ''))
     * Output: {'param': 'value', ....}
     */
    static parseUrlParams(stringParams) {
        // TODO: Decode
        const params = stringParams.split('&');
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
        url, params,
        success = defaultSuccessFn, failure = defaultFailureFn, fatal = defaultFatalFn,
        retryTime = -1, maxRetryTime = -1, decay = -1, maxRetryAttempts = -1,
    ) {
        this.url = url;
        this.params = params;
        this.success = success;
        this.failure = failure;
        this.fatal = fatal;
        this.retryTime = retryTime;
        this.maxRetryTime = maxRetryTime;
        this.decay = decay;
        this.maxRetryAttempts = maxRetryAttempts;

        this.retryCount = 1;
        this.retryId = null;
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
            console.warn('Max number of retries exceeded.');
            return false;
        }
        const time = this.calculateRetryTime();
        if (time < 0) {
            console.warn('Retry time is negative.');
            return false;
        }
        this.retryId = setTimeout(this.start, time);
        this.retryCount += 1;
        return true;
    }

    /* Do a xhr request and parse response as json
     * If response.okay is true, calls success callback
     * If response.okay is false, calls failure callback
     * Else, calls fatal callback
     */
    start = async () => {
        this.aborted = false;

        // Parameters can be a key-value pair or a function that returns a key-value pair
        const parameters = typeof this.params === 'function'
            ? this.params()
            : this.params;

        // DEBUG:
        console.log(`Fetching ${this.url}`, parameters);
        let response;
        try {
            response = await fetch(this.url, parameters);
            if (this.aborted) {
                // NOTE: just ignore any response
                return;
            }
        } catch (ex) {
            if (this.aborted) {
                // NOTE: just ignore any response
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
        } catch (ex) {
            // NOTE: some parsing error
            this.fatal({ errorMessage: 'Error while parsing json', errorCode: null });
            return;
        }

        // DEBUG:
        console.log(`Recieving ${this.url}`, responseBody);
        if (response.ok) {
            this.success(responseBody);
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
        this.retryCount = 1;
        this.aborted = true;
    }
}
