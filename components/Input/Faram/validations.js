/**
 * @author tnagorra <weathermist@gmail.com>
 */

import {
    isFalsy,
    isTruthy,
    isInteger,
    decodeDate,
    splitInWhitespace,
    getErrorForDateValues,
} from '../../../utils/common';
import urlRegex from './regexForWeburl';


export const lessThanCondition = n => (value) => {
    const ok = isFalsy(value) || value < n;
    return {
        ok,
        message: `Value must be less than ${n}`,
    };
};

export const greaterThanCondition = n => (value) => {
    const ok = isFalsy(value) || value > n;
    return {
        ok,
        message: `Value must be greater than ${n}`,
    };
};

export const lessThanOrEqualToCondition = n => (value) => {
    const ok = isFalsy(value) || value <= n;
    return {
        ok,
        message: `Value must be less than or equal to ${n}`,
    };
};

export const greaterThanOrEqualToCondition = n => (value) => {
    const ok = isFalsy(value) || value >= n;
    return {
        ok,
        message: `Value must be greater than or equal to ${n}`,
    };
};


export const lengthLessThanCondition = n => (value) => {
    const ok = isFalsy(value) || value.length < n;
    return {
        ok,
        message: `Length must be less than ${n}`,
    };
};

export const lengthGreaterThanCondition = n => (value) => {
    const ok = isFalsy(value) || value.length > n;
    return {
        ok,
        message: `Length must be greater than ${n}`,
    };
};

export const lengthEqualToCondition = n => (value) => {
    const ok = isFalsy(value) || value.length === n;
    return {
        ok,
        message: `Length must be exactly ${n}`,
    };
};


export const requiredCondition = (value) => {
    const ok = isTruthy(value) && !(
        (
            typeof value === 'string' &&
            splitInWhitespace(value).length <= 0
        ) || (
            Array.isArray(value) &&
            value.length <= 0
        )
    );
    return {
        ok,
        message: 'Field must not be empty',
    };
};

export const numberCondition = (value) => {
    const ok = isFalsy(value) || !isFalsy(+value);
    return {
        ok,
        message: 'Value must be a number',
    };
};

export const integerCondition = (value) => {
    const ok = isFalsy(value) || isInteger(+value);
    return {
        ok,
        message: 'Value must be a integer',
    };
};

export const emailCondition = (value) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const ok = isFalsy(value) || value === '' || re.test(value);
    return {
        ok,
        message: 'Value must be a valid email',
    };
};

export const urlCondition = (value) => {
    const re = urlRegex;
    const ok = isFalsy(value) || value === '' || re.test(value);
    return {
        ok,
        message: 'Value must be a valid URL',
    };
};

export const dateCondition = (value) => {
    let error;

    if (value) {
        const dates = value.split('-');
        const yearValue = dates[0];
        const monthValue = dates[1];
        const dayValue = dates[2];

        error = getErrorForDateValues({ yearValue, monthValue, dayValue });
    }

    return {
        ok: !error,
        message: error,
    };
};
