/**
 * @author tnagorra <weathermist@gmail.com>
 */

import Coordinator from './Coordinator';

/* Builder class for Uploader */
export default class CoorindatorBuilder {
    preSession(fn) {
        this.preSessionFn = fn;
        return this;
    }

    postSession(fn) {
        this.postSessionFn = fn;
        return this;
    }

    maxActiveActors(val) {
        this.maxActiveActors = val;
        return this;
    }

    build() {
        return new Coordinator(
            this.preSessionFn,
            this.postSessionFn,
            this.maxActiveActors,
        );
    }
}
