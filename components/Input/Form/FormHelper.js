/**
 * @author tnagorra <weathermist@gmail.com>
 */

/*
 * Helper class to store all the information about a form
 * Carries out the form validations
 */
export default class FormHelper {
    constructor() {
        // List of reference names
        this.elements = [];
        this.value = {};

        // Contains validation objects containing a validator and error message
        this.validations = {};
        this.validation = undefined;

        // Internal store for references
        this.changeFnCollector = {};
    }

    // Setters

    /* Set name of elements to be validated */
    setElements(elements) {
        this.elements = elements;
    }

    setValue(value) {
        this.value = value;
    }

    /* Set each element with a validation function */
    setValidations(validations) {
        this.validations = validations;
    }

    /* Set a global validation function to validate interdependent elements */
    setValidation(validation) {
        this.validation = validation;
    }

    /* Set callbacks */
    setCallbacks({
        changeCallback, successCallback, failureCallback,
    }) {
        this.changeCallback = changeCallback;
        this.successCallback = successCallback;
        this.failureCallback = failureCallback;
    }

    /* PRIVATE: calls changeCallback with value of current element,
     * clears form field error of current element
     * clears form error
     */
    onChange = (elementName, value) => {
        // change value of current element
        const values = {
            [elementName]: value,
        };
        // clear error for current element
        const formFieldErrors = {
            [elementName]: undefined,
        };
        const formErrors = [];

        this.changeCallback(values, { formFieldErrors, formErrors });
    }

    /* checks for form errors and form field errors
     * calls failureCallback with form errors and form field errors
     * calls successCallback with all element values,
     * clears all form errors and form field errors
     */
    onSubmit = () => {
        const { hasError, formErrors, formFieldErrors } = this.checkForErrors();
        if (hasError) {
            this.failureCallback({ formErrors, formFieldErrors });
        } else {
            // success
            const values = {};
            this.elements.forEach((name) => {
                // skipping in final output
                values[name] = this.getValue(name);
            });
            this.successCallback(values, { formErrors, formFieldErrors });
        }
    }

    getValue = name => (
        this.value ? this.value[name] : undefined
    )

    /* Create a update fn for element 'name' */
    getChangeFn = (name) => {
        if (this.changeFnCollector[name]) {
            return this.changeFnCollector[name];
        }

        const changeFn = (value) => {
            this.onChange(name, value);
        };
        this.changeFnCollector[name] = changeFn;
        return changeFn;
    }

    /* PRIVATE: Check if value is valid for all elements */
    checkForErrors = () => {
        // get errors and errors count from individual validation
        const validityMap = {};

        let { hasError, formFieldErrors } = this.elements.reduce(
            (acc, name) => {
                const value = this.getValue(name);
                const res = this.isValid(name, value);
                validityMap[name] = res.ok;
                // If response is ok, send accumulator as is
                if (res.ok) {
                    return acc;
                }
                return {
                    hasError: true,
                    formFieldErrors: { ...acc.formFieldErrors, [name]: res.message },
                };
            },
            {
                hasError: false,
                formFieldErrors: {},
            },
        );

        let formErrors = [];
        if (this.validation) {
            const { fn, args } = this.validation;

            // Checks for every rule until one of them is invalid
            const validity = args.every(arg => validityMap[arg]);
            if (validity) {
                const superArgs = args.map(name => this.getValue(name));
                const res = fn(...superArgs);
                if (!res.ok) {
                    formErrors = res.formErrors;
                    formFieldErrors = { ...formFieldErrors, ...res.formFieldErrors };
                    hasError = true;
                }
            }
        }

        return { formErrors, formFieldErrors, hasError };
    }

    /* PRIVATE: Check if a value is valid for certain element */
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
