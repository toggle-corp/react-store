import {
    isFalsy,
    isFloat,
} from './common';

// VALIDATION RULES
export const requiredCondition = {
    truth: value => !isFalsy(value) && value !== '',
    message: 'field-must-not-be-empty',
};
export const numberCondition = {
    truth: value => isFalsy(value) || !isFalsy(+value),
    message: 'value-must-be-number',
};
export const integerCondition = {
    truth: value => !isFloat(+value),
    message: 'value-must-be-integer',
};
export const greaterThanZeroCondition = {
    truth: value => value >= 0,
    message: 'value-must-be-greater-than-zero',
};
export const lengthFourCondition = {
    truth: value => isFalsy(value) || value.length === 4,
    message: 'value-must-be-4-characters-long',
};
export const emailCondition = {
    truth: (value) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        // NOTE: valid if falsy value as well
        return isFalsy(value) || re.test(value);
    },
    message: 'value-must-be-valid-email',
};

// FORM CLASS

class Form {
    constructor() {
        this.elements = [];
        this.validations = {};
        this.addons = {};

        this.errors = {};
    }

    setElements(elements) {
        this.elements = elements;
    }

    setValidations(validations) {
        this.validations = validations;
    }

    setAddons(addons) {
        this.addons = addons;
    }

    setCallbackForFocus = (fn) => {
        this.focusCallback = fn;
    }

    // Generally: this.setState(addon);
    setCallbackForChangeValue = (fn) => {
        this.changeTextCallback = fn;
    }

    // Generally: success: this.props.onSubmit(result); // callback
    // Generally: failure: this.setState({ errors });
    setCallbackForSuccessAndFailure= (success, failure) => {
        this.successSubmitCallback = success;
        this.failureSubmitCallback = failure;
    }

    // NOTE: can be used from outside (used in addon)
    isValid = (name, value) => {
        for (const validation of this.validations[name] || []) {
            if (!validation.truth(value)) {
                return { status: false, message: validation.message };
            }
        }
        return { status: true };
    };

    // NOTE: can be called from outside
    updateRef = name => (ref) => {
        this[name] = ref;
    }

    // NOTE: can be called from outside
    getRef = name => (
        this[name]
    )

    // NOTE: can be called from outside
    getRefValue = name => (
        this[name].value()
    )

    onFocus = (overrideName) => {
        const errors = { ...this.errors };
        for (const name in errors) {
            const ref = this[name];
            if ((ref && ref.isFocused()) || overrideName === name) {
                delete errors[name];
            }
        }
        this.errors = errors;

        this.focusCallback({ errors });
    }

    onChangeValue = (text) => {
        // callbacks
        const getNameWithObject = name => ({
            name,
            ref: this[name],
        });
        const setTextIfFocused = ({ name, ref }) => {
            if (ref && ref.isFocused()) {
                const addonFunc = this.addons[name];

                const change = {
                    [name]: text,
                };
                const additionalChange = addonFunc ? addonFunc(text) : {};
                this.changeTextCallback({ ...change, ...additionalChange });
            }
        };

        this.elements
            .map(getNameWithObject)
            .forEach(setTextIfFocused);
    }

    onSubmit = () => {
        const errors = {};
        let errorCount = 0;

        const validate = (name) => {
            const value = this[name].value();
            const res = this.isValid(name, value);
            if (!res.status) {
                errors[name] = res.message;
                errorCount += 1;
            }
        };
        this.elements.forEach(validate);
        this.errors = errors;

        if (errorCount > 0) {
            this.failureSubmitCallback({ errors });
        } else {
            // success
            const result = {};
            for (const name of this.elements) {
                result[name] = this[name].value();
            }
            this.successSubmitCallback(result);
        }
    }
}

export default Form;
