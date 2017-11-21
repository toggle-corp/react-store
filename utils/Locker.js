/**
 * Locker to acquire a lock across threads, tabs and windows
 * based on localStorage
 */
export default class Locker {
    constructor(lock) {
        this.lock = lock;
        this.timeouts = [];
        this.intervals = [];
        this.uniqueId = `${Date.now()}:${Math.round(Math.random() * 1000000000)}`;
        this.xKey = `${this.lock}__x`;
        this.yKey = `${this.lock}__y`;
    }

    // Acquire the lock: returns a promise that resolves when done.
    // To mark a lock continously for this process, it continuously
    // resets the timestamp in localStorage.
    acquire() {
        return new Promise((resolve) => {
            const randomTime = Math.round(Math.random() * 2000);
            const maxLockTime = 5000;
            const refreshTime = 1000;
            this.stopped = false;

            this.timeouts.push(setTimeout(() => {
                this.lamportFastLock(maxLockTime, () => {
                    this.intervals.push(setInterval(() => {
                        this.resetTimestamp();
                    }, refreshTime));

                    if (!this.stopped) {
                        resolve();
                    }
                });
            }, randomTime));
        });
    }

    // Clear lock if acquired and all attempts if trying to acquire
    release() {
        this.stopped = true;
        this.timeouts.forEach(id => clearTimeout(id));
        this.intervals.forEach(id => clearInterval(id));
        localStorage.removeItem(this.yKey);
    }

    lamportFastLock(maxLockTime, callback) {
        if (this.stopped) {
            return;
        }

        const getYId = y => y.split('|')[0];
        const getYTime = y => y.split('|')[1];

        localStorage[this.xKey] = this.uniqueId;
        if (localStorage[this.yKey] &&
            (Date.now() - getYTime(localStorage[this.yKey]) < maxLockTime)) {
            this.timeouts.push(setTimeout(() => {
                this.lamportFastLock(maxLockTime, callback);
            }, 100));
            return;
        }

        localStorage[this.yKey] = `${this.uniqueId}|${Date.now()}`;

        if (localStorage[this.xKey] !== this.uniqueId) {
            this.timeouts.push(setTimeout(() => {
                if (getYId(localStorage[this.yKey]) !== this.uniqueId) {
                    this.lamportFastLock(maxLockTime, callback);
                } else {
                    callback();
                }
            }, 100));
            return;
        }

        callback();
    }

    resetTimestamp() {
        localStorage[this.yKey] = `${this.uniqueId}|${Date.now()}`;
    }
}
