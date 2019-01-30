export function* zip(...args) {
    const iterators = [...args].map(x => x[Symbol.iterator]());
    while (true) {
        const current = iterators.map(x => x.next());
        if (current.some(x => x.done)) {
            break;
        }
        yield current.map(x => x.value);
    }
}

export function* zipWith(func, ...args) {
    const zipped = zip(...args);
    while (true) {
        const current = zipped.next();
        if (current.done) {
            break;
        }
        yield func(...current.value);
    }
}

