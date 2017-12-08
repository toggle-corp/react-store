/**
 * @author tnagorra <weathermist@gmail.com>
 */
export const getNumbers = (start, end) => {
    const list = [];
    for (let i = start; i < end; i += 1) {
        list.push(i);
    }
    return list;
};

export const isFalsy = val => (
    val === undefined || val === null || Number.isNaN(val) || val === false
);

export const isFalsyOrEmptyOrZero = val => (
    isFalsy(val) || val.length === 0 || val === 0
);

export const isTruthy = val => !isFalsy(val);

export const isInteger = value => (
    typeof value === 'number' && value % 1 === 0
);

// added by @frozenhelium
export const isEqualAndTruthy = (a, b) => (
    isTruthy(a) && (a === b)
);

export const isDifferentAndTruthy = (a, b) => (
    isTruthy(a) && (a !== b)
);

export const getKeyByValue = (object, value) => (
    Object.keys(object).find(key => object[key] === value)
);
// ---------------------

// Check if object is empty (or undefined)
export const isObjectEmpty = (obj) => {
    // Check if obj is defined, has keys and is object: else return true
    if (obj && Object.keys(obj).length !== 0 && obj.constructor === Object) {
        // If obj is object and has keys, check their values
        const innerEmpty = Object.values(obj).reduce((a, b) => (
            a && isFalsyOrEmptyOrZero(b)
        ), true);

        // If inner is not empty, then return false else return true
        if (!innerEmpty) {
            return false;
        }
    }
    return true;
};

export const bound = (value, max, min) => (
    Math.max(min, Math.min(max, value))
);

export const normalize = (value, max, min) => (
    (value - min) / (max - min)
);

export const randomString = (length = 8) => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i += 1) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;

    /*
     * -------------------------------------------------
     * better Algorithm, but not supported by enzyme :(
     * -------------------------------------------------

    const randomValues = new Uint8Array(length);
    window.crypto.getRandomValues(randomValues);
    return Array.from(randomValues, v => v.toString(36)).join('').substring(0, 8);
    */
};

/**
* Extract Date from timestamp
*/
export const extractDate = (timestamp) => {
    const today = new Date(timestamp);
    today.setHours(0, 0, 0, 0);
    return today.getTime();
};

/**
* Get Difference in days for (a - b)
*/
export const getDifferenceInDays = (a, b) => {
    const dateA = extractDate(a);
    const dateB = extractDate(b);
    return (dateA - dateB) / (1000 * 60 * 60 * 24);
};

/**
* Get Difference in human readable for (a - b)
*/
export const getDateDifferenceHumanReadable = (a, b) => {
    const daysDiff = getDifferenceInDays(a, b);
    return `${daysDiff} day${daysDiff === 1 ? '' : 's'}`;
};

export const addSeparator = (num, separator = ',') => {
    const nStr = String(num);
    const x = nStr.split('.');
    let x1 = x[0];
    const x2 = x.length > 1 ? `.${x[1]}` : '';
    const rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, `$1${separator}$2`);
    }
    return x1 + x2;
};

export const formattedNormalize = (number) => {
    let normalizeSuffix;
    let normalizedNumber = number;
    const digits = Math.log10(Math.abs(number));

    // something like foreach here

    if (digits >= 9) {
        normalizeSuffix = 'Ar';
        normalizedNumber /= 1000000000;
    } else if (digits >= 7) {
        normalizeSuffix = 'Cr';
        normalizedNumber /= 10000000;
    } else if (digits >= 5) {
        normalizeSuffix = 'Lac';
        normalizedNumber /= 100000;
    }
    return {
        number: normalizedNumber,
        normalizeSuffix,
    };
};

export const getRandomFromList = (items = []) => (
    items[Math.floor(Math.random() * items.length)]
);


export const leftPad = (number, length, pad = '0') => {
    const numStr = String(number);
    return numStr.length >= length ? numStr :
        new Array((length - numStr.length) + 1).join(pad) + numStr;
};

export const getNumDaysInMonth = date => (
    date ? (
        new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            0,
        ).getDate()
    ) : 32
);

/*
 * Convert camel case to kebab case
 * eg: camelToDash -> camel-to-dash
 */
export const camelToDash = str => str
    .replace(/(^[A-Z])/, ([first]) => first.toLowerCase())
    .replace(/([A-Z])/g, ([letter]) => `-${letter.toLowerCase()}`);

/*
 * Convert camel case to normal case
 * eg: camelToDash -> camel to dash
 */
export const camelToNormal = str => str
    .replace(/(^[A-Z])/, ([first]) => first.toLowerCase())
    .replace(/([A-Z])/g, ([letter]) => ` ${letter.toLowerCase()}`);


/**
 * get location from pathname
 */
export const reverseRoute = (route, params) => {
    const paths = route.split('/');

    for (let i = 0; i < paths.length; i += 1) {
        let path = paths[i];

        if (path && path.length > 0 && path.charAt(0) === ':') {
            path = path.substring(1);
            let param;

            // optional parameter
            if (path.slice(-1) === '?') {
                param = params[path.replace('?', '')];

                // omit if value not supplied
                if (!param) {
                    paths.splice(i, 1);
                } else {
                    paths[i] = param;
                }
            } else {
                param = params[path];

                if (!param) {
                    console.error(`value for param ${path} not supplied`);
                }

                paths[i] = param;
            }
        }
    }

    return paths.join('/');
};
