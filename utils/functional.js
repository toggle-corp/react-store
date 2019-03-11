export function* zip(...args) {
    if (args.length <= 1) {
        return;
    }
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

export function* getNaturalNumbers(startIndex = 0, step = 1) {
    let currentValue = startIndex - step;
    while (true) {
        currentValue += step;
        yield currentValue;
    }
}
