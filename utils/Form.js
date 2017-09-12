import {
    isFalsy,
    isFloat,
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
    truth: value => !isFloat(+value),
    message: 'Value must be an integer',
};
export const greaterThanZeroCondition = {
    truth: value => value >= 0,
    message: 'Value must be greater than zero',
};
export const lengthFourCondition = {
    truth: value => isFalsy(value) || value.length === 4,
    message: 'Value must have 4 characters',
};
export const emailCondition = {
    truth: (value) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        // NOTE: valid if falsy value as well
        return isFalsy(value) || re.test(value);
    },
    message: 'Value must be a valid email',
};

// TODO: Use builder pattern
class Form {
    constructor() {
        // List of reference names
        this.elements = [];
        // Contains validation objects containing a validator and error message
        this.validations = {};
        // Contains addons objects for complex relationships
        this.addons = {};

        // Stores all the errors
        this.errors = {};
        // TODO: add warning

        this.references = {};
    }

    // Setters

    setElements(elements) {
        this.elements = elements;
    }

    setValidations(validations) {
        this.validations = validations;
    }

    setAddons(addons) {
        this.addons = addons;
    }

    setCallbackForFocus = (focusFn) => {
        this.focusCallback = focusFn;
    }

    setCallbackForChange = (changeFn) => {
        this.changeCallback = changeFn;
    }

    setCallbackForSuccessAndFailure= (successFn, failureFn) => {
        this.successCallback = successFn;
        this.failureCallback = failureFn;
    }

    // Used to reference of a component locally using element 'name'
    // ACCESS: public
    updateRef = name => (ref) => {
        this.references[name] = ref;
    }

    // Access component using the locally saved element 'name'
    // ACCESS: public
    getRef = name => (
        this.references[name]
    )

    // Check if a value is valid for certain element
    // ACCESS: public (eg. from addons)
    isValid = (name, value) => {
        let returnVal = { ok: true };
        const validationRules = this.validations[name] || [];

        // Checks for every rule until one of them is invalid,
        // and set returnVal to specific error
        validationRules.every((validationRule) => {
            const valid = validationRule.truth(value);
            if (!valid) {
                returnVal = { ok: false, message: validationRule.message };
            }
            return valid;
        });
        return returnVal;
    };

    // Remove the error for the element which is currently focused
    // or whose name is equal to overrideName
    onFocus = (overrideName) => {
        // Get name of element to be deleted
        const findFn = name => this.getRef(name).isFocused() || overrideName === name;
        const deletionName = Object.keys(this.errors).find(findFn);

        if (deletionName) {
            // delete error for 'deletionName'
            this.errors = { ...this.errors, [deletionName]: undefined };
        }
        this.focusCallback(this.errors);
    }

    onChange = (text) => {
        // Get name of element to be modified
        const findFn = name => this.getRef(name).isFocused();
        const modificationName = this.elements.find(findFn);

        if (modificationName) {
            const change = {
                [modificationName]: text,
            };
            const addonRule = this.addons[modificationName];
            const addonChange = addonRule ? addonRule(text) : {};
            this.changeCallback({ ...change, ...addonChange });
        }
    }

    onSubmit = () => {
        // get errors and error counts
        const { errorCount, errors } = this.elements.reduce((acc, name) => {
            const value = this.getRef(name).value();
            const res = this.isValid(name, value);
            if (!res.ok) {
                return {
                    errorCount: acc.errorCount + 1,
                    errors: { ...acc.errors, [name]: res.message },
                };
            }
            return acc;
        }, { errorCount: 0, errors: {} });

        this.errors = errors;

        if (errorCount > 0) {
            this.failureCallback(errors);
        } else {
            // success
            const returnVal = {};
            this.elements.every((name) => {
                returnVal[name] = this.getRef(name).value();
                return true;
            });
            this.successCallback(returnVal);
        }
    }
}

export default Form;
