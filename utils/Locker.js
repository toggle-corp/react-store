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

        // Will release lock if tab is closed
        window.onunload = this.release;
    }

    // Acquire the lock: returns a promise that resolves when done.
    // To mark a lock continously for this process, it continuously
    // resets the timestamp in localStorage.
    acquire = (maxLockTime = 5000, refreshTime = 1000) => (
        new Promise((resolve) => {
            const randomTime = Math.round(Math.random() * 2000);
            this.stopped = false;

            const timeoutFn = () => {
                const callbackOnLock = () => {
                    const intervalFn = () => this.resetTimestamp();
                    this.intervals.push(setInterval(intervalFn, refreshTime));
                    // release can be called anytime, so check here
                    if (!this.stopped) {
                        resolve();
                    }
                };
                this.lamportFastLock(callbackOnLock, maxLockTime);
            };
            this.timeouts.push(setTimeout(timeoutFn, randomTime));
        })
    )

    // Clear lock if acquired and all attempts if trying to acquire
    release = () => {
        this.stopped = true;
        this.timeouts.forEach(id => clearTimeout(id));
        this.intervals.forEach(id => clearInterval(id));
        localStorage.removeItem(this.yKey);
    }

    lamportFastLock = (callback, maxLockTime) => {
        if (this.stopped) {
            return;
        }

        const getYId = y => y.split('|')[0];
        const getYTime = y => y.split('|')[1];

        localStorage[this.xKey] = this.uniqueId;
        if (
            localStorage[this.yKey]
            && (Date.now() - getYTime(localStorage[this.yKey]) < maxLockTime)
        ) {
            this.timeouts.push(setTimeout(() => {
                this.lamportFastLock(callback, maxLockTime);
            }, 100));
            return;
        }

        localStorage[this.yKey] = `${this.uniqueId}|${Date.now()}`;

        if (localStorage[this.xKey] !== this.uniqueId) {
            this.timeouts.push(setTimeout(() => {
                if (getYId(localStorage[this.yKey]) !== this.uniqueId) {
                    this.lamportFastLock(callback, maxLockTime);
                } else {
                    callback();
                }
            }, 100));
            return;
        }

        callback();
    }

    resetTimestamp = () => {
        localStorage[this.yKey] = `${this.uniqueId}|${Date.now()}`;
    }
}
