// TODO:
// 3. Channel system
// 4. Only retry for 5xx errors and network error

export class RestRequest {
    constructor(
        url, params, success, failure, fatal,
        retry = 300, retryAttempts = -1, maxTimeout = -1, decay = -1,
    ) {
        this.url = url;
        this.params = params;
        this.success = success || (() => { console.warn('There is no callback for success'); });
        this.failure = failure || (() => { console.warn('There is no callback for failure'); });
        this.fatal = fatal || failure;
        this.retry = retry;
        this.retryCount = 1;
        this.retryId = null;
        this.retryAttempts = retryAttempts;
        this.maxTimeout = maxTimeout;
        this.decay = decay;
    }

    start = async () => {
        // console.log('Fetching', this.url);
        let response;
        try {
            response = await fetch(this.url, this.params);

            // NOTE: always required a body with message and responseCode
            if (!response.ok) {
                const ex = {
                    responseCode: response.status,
                    message: response.statusText,
                };
                throw ex;
            }
        } catch (ex) {
            // NOTE: only catch network related error here
            const { responseCode = 0, message } = ex;
            // fatal error
            this.fatal(`${responseCode}: ${message}`);
            if (this.retryCount > this.retryAttempts && this.retryAttempts >= 0) {
                console.log('3: The total number of retries exceeded');
            } else {
                let time;
                if (this.decay >= 0) {
                    time = this.decay * (Math.pow(2, this.retryCount) - 1) * 1000; // eslint-disable-line
                    // console.log(time, 'decay', this.decay);
                    if (this.maxTimeout >= 0) {
                        time = Math.min(time, this.maxTimeout);
                        // console.log(time, 'max timeout');
                    }
                } else {
                    time = this.retry;
                    console.log(time, 'no decay');
                }

                this.retryId = setTimeout(this.start, time);
                this.retryCount += 1;
            }
            return;
        }

        let message;
        let responseCode;
        try {
            const json = await response.json();
            message = json.message;
            responseCode = json.responseCode;
        } catch (ex) {
            // NOTE: No retry here
            this.fatal('1: Could not parse body as json');
            return;
        }

        // TODO: success or failure condition using custom error code
        if (responseCode >= 200 && responseCode < 300) {
            this.success(message);
        } else {
            this.failure(`${responseCode}: ${message}`);
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

    retry(val = 3000) {
        this.retryVal = val;
        return this;
    }

    retryAttempts(val) {
        this.retryAttemptsVal = val;
        return this;
    }

    decay(val) {
        this.decayVal = val;
        return this;
    }

    maxTimeout(val) {
        this.maxTimeoutVal = val;
        return this;
    }

    build() {
        return new RestRequest(
            this.urlValue,
            this.paramsValue,
            this.successFn,
            this.failureFn,
            this.fatalFn,
            this.retryVal,
            this.retryAttemptsVal,
            this.maxTimeoutVal,
            this.decayVal,
        );
    }
}
