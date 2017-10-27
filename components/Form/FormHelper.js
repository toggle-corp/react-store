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
            const error = [];

            this.changeCallback(values, { error, errors });
        } else {
            this.console.warn('No element found which triggered onChange');
        }
    }

    // Calls successCallback or failureCallback
    onSubmit = () => {
        const { hasError, error, errors } = this.checkForErrors();
        if (hasError) {
            this.failureCallback({ error, errors });
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
            this.successCallback(values, { error, errors });
        }
    }

    // Aggerate all the errors
    // ACCEPTS: N/A
    // RETURNS: { error: String, errors: List.String, hasError: Boolean }
    checkForErrors = () => {
        // get errors and errors count from individual validation
        const validityMap = {};

        let { hasError, errors } = this.elements.reduce(
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
                    errors: { ...acc.errors, [name]: res.message },
                };
            },
            {
                hasError: false,
                errors: {},
            },
        );

        let error = [];
        if (this.validation) {
            const { fn, args } = this.validation;

            // Checks for every rule until one of them is invalid
            const validity = args.every(arg => validityMap[arg]);
            if (validity) {
                const superArgs = args.map(name => this.getRefValue(name));
                const res = fn(...superArgs);
                if (!res.ok) {
                    error = res.formErrors;
                    errors = { ...errors, ...res.formFieldErrors };
                    hasError = true;
                }
            }
        }

        return { error, errors, hasError };
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
