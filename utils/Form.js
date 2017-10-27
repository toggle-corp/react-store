/**
 * @author tnagorra <weathermist@gmail.com>
 */

import {
    isFalsy,
    isInteger,
} from './common';

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

export function createValidation(...parameters) {
    const args = [...parameters];
    console.log(args);
    if (args.length <= 0) {
        console.warn('No arguments supplied');
        this.validation = undefined;
        return {};
    }
    const fn = args.splice(args.length - 1, 1)[0];
    console.log(fn, typeof fn);
    if (typeof fn !== 'function') {
        console.warn('Last argument must be a function');
        this.validation = undefined;
        return {};
    }
    return { fn, args };
}


// TODO: Use builder pattern
class Form {
    constructor() {
        // List of reference names
        this.elements = [];

        // Contains validation objects containing a validator and error message
        this.validations = {};
        this.validation = undefined;

        // Internal store for references
        this.references = {};
        this.referenceCollector = {};
    }

    // Setters

    setElements(elements) {
        this.elements = elements;
    }

    setValidations(validations) {
        this.validations = validations;
    }

    setValidation(validation) {
        this.validation = validation;
    }

    setCallbacks({
        changeCallback, successCallback, failureCallback,
    }) {
        this.changeCallback = changeCallback;
        this.successCallback = successCallback;
        this.failureCallback = failureCallback;
    }

    // Used to reference of a component locally using element 'name'
    updateRef = (name) => {
        if (this.referenceCollector[name]) {
            return this.referenceCollector[name];
        }
        const referenceFn = (ref) => {
            this.references[name] = ref;
        };
        this.referenceCollector[name] = referenceFn;
        return referenceFn;
    }

    // Access component using the locally saved element 'name'
    getRef = name => (
        this.references[name]
    )

    getRefValue = (name) => {
        const element = this.getRef(name);
        if (!element) {
            console.warn(`Element '${name}' not found.`);
            return undefined;
        }
        return element.value();
    }

    isRefFocused = (name) => {
        const element = this.getRef(name);
        if (!element) {
            console.warn(`Element '${name}' not found.`);
            return false;
        }
        return element.isFocused();
    }

    // Calls changeCallback
    // onChange is triggered by all input elements
    // the input element is idenfied by isFocused() of input element
    onChange = (value) => {
        // Get name of element to be modified
        const elementName = this.elements.find(name => this.isRefFocused(name));

        if (elementName) {
            // change value of current element
            const values = {
                [elementName]: value,
            };
            // clear error for current element
            const errors = {
                [elementName]: undefined,
            };
            const error = undefined;

            this.changeCallback(values, { error, errors });
        } else {
            this.console.warn('No element found which triggered onChange');
        }
    }

    /*
        formErrors: additive
        formValues: additive
        formError: replace
    */

    // Calls successCallback or failureCallback
    onSubmit = () => {
        const { errorCount, error, errors } = this.checkForErrors();
        if (errorCount > 0 || error) {
            this.failureCallback({ error, errors });
        } else {
            // success
            const values = {};
            this.elements.every((name) => {
                values[name] = this.getRefValue(name);
                return true;
            });
            this.successCallback(values, { error, errors });
        }
    }

    // Aggerate all the errors
    // ACCEPTS: N/A
    // RETURNS: { error: String, errors: List.String, errorCount: Number }
    checkForErrors = () => {
        // get errors and errors count from individual validation
        const { errorCount, errors } = this.elements.reduce(
            (acc, name) => {
                const value = this.getRefValue(name);
                const res = this.isValid(name, value);
                // If response is ok, send accumulator as is
                if (res.ok) {
                    return acc;
                }
                return {
                    errorCount: acc.errorCount + 1,
                    errors: { ...acc.errors, [name]: res.message },
                };
            },
            {
                errorCount: 0,
                errors: {},
            },
        );

        let error;
        if (this.validation) {
            const { fn, args } = this.validation;
            const superArgs = args.map(name => this.getRefValue(name));
            const res = fn(...superArgs);
            if (!res.ok) {
                error = res.message;
            }
        }

        return { error, errors, errorCount };
    }


    // Check if a value is valid for certain element
    // ACCEPTS: name: String, value: String
    // RETURNS: { ok: Boolean, message: String }
    isValid = (name, value) => {
        let returnVal = { ok: true };
        const validationRules = this.validations[name] || [];

        // Checks for every rule until one of them is invalid,
        // and set returnVal to specific error
        validationRules.every((validationRule) => {
            const valid = validationRule.truth(value);
            if (!valid) {
                returnVal = {
                    ok: false,
                    message: validationRule.message,
                };
            }
            return valid;
        });
        return returnVal;
    };
}

export default Form;
