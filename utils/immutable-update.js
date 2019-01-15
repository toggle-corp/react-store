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
update.extend(
    '$autoPush',
    (value, object) => (object || []).concat(value.length ? value : []),
);
update.extend(
    '$autoUnshift',
    (value, object) => (value.length ? value : []).concat(object || []),
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
        // FIXME: use unique from common
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
    '$removeFromIndex',
    (indices, lst) => {
        if (indices.length <= 0 || lst.length <= 0) {
            return lst;
        }

        const newLst = [...lst];
        const newIndices = indices.sort((a, b) => b - a);
        newIndices.forEach((index) => {
            newLst.splice(index, 1);
        });
        return newLst;
    },
);
update.extend(
    '$replaceOrPush',
    ([finder, modifier], lst) => {
        const newLst = [...lst];
        const index = newLst.findIndex(finder);
        if (index === -1) {
            return [...newLst, modifier()];
        }
        newLst.splice(index, 1, modifier(newLst[index]));
        return newLst;
    },
);


// Object
update.extend('$unset', (keysToRemove, original) => {
    const copy = { ...original };
    keysToRemove.forEach((key) => {
        delete copy[key];
    });
    return copy;
});

update.extend('$setDefault', (value, original) => {
    if (original === undefined) {
        return value;
    }
    return original;
});

update.extend('$setIfDefined', (value, original) => {
    if (value === undefined) {
        return original;
    }
    return value;
});

update.extend('$mergeIfDefined', (obj, original) => {
    const copy = { ...original };
    Object.keys(obj).forEach((key) => {
        if (obj[key] !== undefined) {
            copy[key] = obj[key];
        }
    });
    return copy;
});

update.extend('$toggleElement', (value, object) => {
    const index = object.indexOf(value);
    if (index >= 0) {
        const newObject = [...object];
        newObject.splice(index, 1);
        return newObject;
    }

    return [...object, value];
});

export default update;
