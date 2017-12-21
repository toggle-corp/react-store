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
    (value, object) => (value[0] ? update(object, value[1]) : object),
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

export default update;
