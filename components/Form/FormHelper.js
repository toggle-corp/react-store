/**
 * @author tnagorra <weathermist@gmail.com>
 */

export default class FormHelper {
    constructor() {
        // List of reference names
        this.elements = [];

        // Contains validation objects containing a validator and error message
        this.validations = {};
        this.validation = undefined;

        // Internal store for references
        this.references = {};
        this.referenceCollector = {};
        this.changeFnCollector = {};
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

    updateChangeFn = (name) => {
        if (this.changeFnCollector[name]) {
            return this.changeFnCollector[name];
        }
        const changeFn = (value) => {
            this.onChange(name, value);
        };
        this.changeFnCollector[name] = changeFn;
        return changeFn;
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
        return element.getValue();
    }

    // Calls changeCallback
    // onChange is triggered by all input elements
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

    // Calls successCallback or failureCallback
    onSubmit = () => {
        const { hasError, formErrors, formFieldErrors } = this.checkForErrors();
        if (hasError) {
            this.failureCallback({ formErrors, formFieldErrors });
        } else {
            // success
            const values = {};
            this.elements.forEach((name) => {
                const element = this.getRef(name);
                // skipping in final output
                if (!element) {
                    console.warn(`Element '${name}' not found.`);
                } else {
                    values[name] = this.getRefValue(name);
                }
            });
            this.successCallback(values, { formErrors, formFieldErrors });
        }
    }

    // Aggerate all the errors
    // ACCEPTS: N/A
    // RETURNS: { error: String, errors: List.String, hasError: Boolean }
    checkForErrors = () => {
        // get errors and errors count from individual validation
        const validityMap = {};

        let { hasError, formFieldErrors } = this.elements.reduce(
            (acc, name) => {
                const element = this.getRef(name);
                // skipping validation
                if (!element) {
                    console.warn(`Element '${name}' not found.`);
                    validityMap[name] = true;
                    return acc;
                }
                const value = this.getRefValue(name);
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
                const superArgs = args.map(name => this.getRefValue(name));
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
