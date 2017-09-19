// TODO:
// 1. Add retry limit
// 2. Exponential backoff
// 3. Channel system
// 4. Only retry for 5xx errors and network error

export class RestRequest {
    // handle error in response
    static handleError = (response) => {
        // console.log(response);
        if (response.ok) {
            return response;
        }
        return Promise.reject({
            responseCode: response.status,
            message: response.statusText,
        });
    };

    // read json from response
    static readJson = response => (
        response.headers.get('content-length') > 0
            ? response.json()
            : { responseCode: 200 }
    );

    constructor(url, params, success, failure, fatal, retry = -1) {
        // TODO: do validations here
        // url is required
        // for POST method body is required
        // for GET method body is not required
        // etc
        this.url = url;
        this.params = params;
        this.success = success || (() => { console.warn('There is no callback for success'); });
        this.failure = failure || (() => { console.warn('There is no callback for failure'); });
        this.fatal = fatal || failure;
        this.retry = retry;
        this.retryId = null;
    }

    start = () => {
        // console.log('Fetching', this.url);
        fetch(this.url, this.params)
            .then(RestRequest.handleError)
            .then(RestRequest.readJson)
            .then((response) => {
                const { message, responseCode } = response;
                if (responseCode >= 200 && responseCode < 300) {
                    this.success(message);
                } else {
                    // no retry
                    this.failure(`${responseCode}: ${message}`);
                }
            })
            .catch((response) => {
                const { responseCode, message } = response;
                this.fatal(`${responseCode}: ${message}`);
                if (this.retry > 0) {
                    this.retryId = setTimeout(this.start, this.retry);
                }
            });
    }

    stop = () => {
        clearTimeout(this.retryId);
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
        this.retryTime = val;
        return this;
    }

    build() {
        return new RestRequest(
            this.urlValue,
            this.paramsValue,
            this.successFn,
            this.failureFn,
            this.fatalFn,
            this.retryTime,
        );
    }
}
