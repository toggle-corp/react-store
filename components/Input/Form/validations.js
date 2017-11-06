/**
 * @author tnagorra <weathermist@gmail.com>
 */

import {
    isFalsy,
    isInteger,
} from '../../utils/common';

// VALIDATION RULES
export const requiredCondition = {
    truth: value => !isFalsy(value) && value !== '',
    message: 'Field must not be empty',
};
export const numberCondition = {
    truth: value => isFalsy(value) || !isFalsy(+value),
    message: 'Value must be a number',
};

export const integerCondition = {
    truth: value => isInteger(+value),
    message: 'Value must be an integer',
};

export const lessThanCondition = n => ({
    truth: value => value < n,
    message: `Value must be less than ${n}`,
});

export const greaterThanCondition = n => ({
    truth: value => value > n,
    message: `Value must be greater than ${n}`,
});

export const lessThanOrEqualToCondition = n => ({
    truth: value => value <= n,
    message: `Value must be less than or equal to ${n}`,
});

export const greaterThanOrEqualToCondition = n => ({
    truth: value => value >= n,
    message: `Value must be greater than or equal to ${n}`,
});

export const lengthLessThanCondition = n => ({
    truth: value => isFalsy(value) || value.length < n,
    message: `Length must be less than ${n} characters`,
});

export const lengthGreaterThanCondition = n => ({
    truth: value => isFalsy(value) || value.length > n,
    message: `Length must be greater than ${n} characters`,
});

export const lengthEqualToCondition = n => ({
    truth: value => isFalsy(value) || value.length === n,
    message: `Length must have exactly ${n} characters`,
});

export const emailCondition = {
    truth: (value) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        // NOTE: valid if falsy value as well
        return isFalsy(value) || re.test(value);
    },
    message: 'Value must be a valid email',
};

export const urlCondition = {
    truth: (value) => {
        // NOTE: NOT valid for unicode
        const re = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/;
        // NOTE: valid if falsy value as well
        return isFalsy(value) || re.test(value);
    },
    message: 'Value must be a valid URL',
};

// Validator

/* Create a validation function for dependency injection */
export function createValidation(...parameters) {
    const args = [...parameters];
    if (args.length <= 0) {
        console.warn('No arguments supplied');
        this.validation = undefined;
        return {};
    }
    const fn = args.splice(args.length - 1, 1)[0];
    if (typeof fn !== 'function') {
        console.warn('Last argument must be a function');
        this.validation = undefined;
        return {};
    }
    return { fn, args };
}

/* USAGE
createValidation('email', 'password', (email, password) => {
  if (password.length > email.length) {
      return {
          ok: false,
          formErrors: ['Form has combined validation error.'],
          formFieldErrors: {
              email: 'Email must be longer than password',
              password: 'Password must be shorter than email',
          },
      };
  }
  return { ok: true };
});
*/
