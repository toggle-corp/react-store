/**
 * @author tnagorra <weathermist@gmail.com>
 */

export class RestRequest {
    constructor(
        url, params, success, failure, fatal,
        retryTime = -1, maxRetryAttempts = -1, maxRetryTime = -1, decay = -1,
    ) {
        this.url = url;
        this.params = params;
        this.success = success || (() => { console.warn('There is no callback for success'); });
        this.failure = failure || (() => { console.warn('There is no callback for failure'); });
        this.fatal = fatal || (() => { console.warn('There is no callback for fatal'); });
        this.retryTime = retryTime;
        this.retryCount = 1;
        this.retryId = null;
        this.maxRetryAttempts = maxRetryAttempts;
        this.maxRetryTime = maxRetryTime;
        this.decay = decay;
    }

    // get time after which retry is to be performed
    calculateTime = () => {
        let time;
        if (this.decay >= 0) {
            time = this.decay * (Math.pow(2, this.retryCount) - 1) * 1000; // eslint-disable-line
            if (this.maxRetryTime >= 0) {
                time = Math.min(time, this.maxRetryTime);
            }
        } else {
            time = this.retryTime;
        }
        return time;
    }

    retry = () => {
        if (this.retryCount > this.maxRetryAttempts && this.maxRetryAttempts >= 0) {
            console.warn('Max number of retries exceeded.');
            return false;
        }
        const time = this.calculateTime();
        if (time < 0) {
            console.warn('Retry time is invalid. Please configure RestRequest properly.');
            return false;
        }
        this.retryId = setTimeout(this.start, time);
        this.retryCount += 1;
        return true;
    }

    start = async () => {
        // console.log('Fetching', this.url);
        let response;
        try {
            const parameters = typeof this.params === 'function' ? this.params() : this.params;
            response = await fetch(this.url, parameters);
        } catch (ex) {
            const retryable = this.retry();
            if (!retryable) {
                this.fatal({ errorMessage: ex.message, errorCode: ex.statusCode });
            }
            return;
        }

        let responseBody;
        try {
            responseBody = await response.json();
        } catch (ex) {
            // NOTE: some parse error
            this.fatal({ errorMessage: 'Error while parsing json', errorCode: null });
            return;
        }

        console.log(response);

        if (response.ok) {
            this.success(responseBody);
        } else {
            const is5xxError = Math.floor(response.status / 100) === 5;
            const retryable = is5xxError && this.retry();
            if (!retryable) {
                this.failure(responseBody);
            }
        }
    }

    stop = () => {
        clearTimeout(this.retryId);
        this.retryCount = 0;
    }
}

export class RestBuilder {
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

    retryTime(val = 3000) {
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
            this.retryTimeVal,
            this.maxRetryAttemptsVal,
            this.maxRetryTimeVal,
            this.decayVal,
        );
    }
}
