/**
 * @author tnagorra <weathermist@gmail.com>
 */

import update from 'immutability-helper';

// Auto vivification
update.extend(
    '$auto',
    (value, object) => update(object || {}, value),
);
update.extend(
    '$autoArray',
    (value, object) => update(object || [], value),
);

// Control
update.extend(
    '$if',
    (value, object) => {
        if (value[0]) {
            return update(object, value[1]);
        }
        return value[2] ? update(object, value[2]) : object;
    },
);
update.extend(
    '$bulk',
    (value, object) => value.reduce(
        (acc, val) => update(acc, val),
        object,
    ),
);

// Array
update.extend(
    '$filter',
    (value, object) => {
        const filtered = object.slice().filter(value);
        if (filtered.length === object.length) {
            return object;
        }
        return filtered;
    },
);
update.extend(
    '$sort',
    (value, object) => object.slice().sort(value),
);
update.extend(
    '$unique',
    (value, object) => {
        const memory = {};
        const newArr = [];
        object.forEach((o) => {
            const id = value(o);
            if (!memory[id]) {
                memory[id] = true;
                newArr.push(o);
            }
        });
        // for efficiency
        if (newArr.length === object.length) {
            return object;
        }
        return newArr;
    },
);
update.extend(
    '$autoPush',
    (value, object) => (object || []).concat(value.length ? value : []),
);
update.extend(
    '$autoUnshift',
    (value, object) => (value.length ? value : []).concat(object || []),
);
update.extend('$unset', (keysToRemove, original) => {
    const copy = { ...original };
    keysToRemove.forEach((key) => {
        delete copy[key];
    });
    return copy;
});

export default update;
