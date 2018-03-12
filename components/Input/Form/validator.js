import { isFalsy, isTruthy } from '../../../utils/common';

const isObject = item => (
    typeof item === 'object' && !Array.isArray(item) && item !== null
);

const hasNoKeys = obj => (
    isFalsy(obj) || Object.keys(obj).length === 0
);

const hasNoValues = array => (
    isFalsy(array) || array.length <= 0 || array.every(e => isFalsy(e))
);

export const accumulateValues = (obj, schema) => {
    // if schema is array, return object
    if (Array.isArray(schema)) {
        return obj;
    }

    // At this point, obj should be defined

    if (schema.member) {
        // schema is for array
        const fieldErrors = [];
        (obj || []).forEach((element) => {
            const fieldError = accumulateValues(element, schema.member);
            fieldErrors.push(fieldError);
        });
        return hasNoValues(fieldErrors) ? undefined : fieldErrors;
    } else if (schema.fields) {
        // schema is for object
        const fieldErrors = {};
        Object.keys(schema.fields).forEach((fieldName) => {
            const validations = schema.fields[fieldName];
            const value = (obj || {})[fieldName];

            const fieldError = accumulateValues(value, validations);
            if (fieldError) {
                fieldErrors[fieldName] = fieldError;
            }
        });
        return hasNoKeys(fieldErrors) ? undefined : fieldErrors;
    }
    return undefined;
};

export const accumulateFieldErrors = (obj, schema) => {
    // if schema is array, iterate over and check conditions
    if (Array.isArray(schema)) {
        let fieldError;
        schema.every((rule) => {
            const { ok, message } = rule(obj);
            if (!ok) {
                fieldError = message;
            }
            return ok;
        });
        return fieldError;
    }

    const { member, fields } = schema;
    if (member) {
        // schema is for array
        const fieldErrors = [];
        (obj || []).forEach((element) => {
            const fieldError = accumulateFieldErrors(element, member);
            fieldErrors.push(fieldError);
        });
        return hasNoValues(fieldErrors) ? undefined : fieldErrors;
    } else if (fields) {
        // schema is for object
        const fieldErrors = {};
        Object.keys(fields).forEach((fieldName) => {
            const validations = fields[fieldName];
            const value = (obj || {})[fieldName];

            const fieldError = accumulateFieldErrors(value, validations);
            if (fieldError) {
                fieldErrors[fieldName] = fieldError;
            }
        });
        return hasNoKeys(fieldErrors) ? undefined : fieldErrors;
    }
    return undefined;
};

export const accumulateFormErrors = (obj, schema) => {
    if (Array.isArray(schema)) {
        return undefined;
    }

    const formErrors = {};
    if (schema.validation) {
        const errors = schema.validation(obj);
        if (errors.length > 0) {
            formErrors.errors = errors;
        }
    }

    const { member, fields } = schema;
    if (member) {
        // schema is for array
        const errors = [];
        (obj || []).forEach((element) => {
            const error = accumulateFormErrors(element, member);
            errors.push(error);
        });
        if (!hasNoValues(errors)) {
            formErrors.fields = errors;
        }
    } else if (fields) {
        // schema is for object
        const errors = {};
        Object.keys(fields).forEach((fieldName) => {
            const validations = fields[fieldName];
            const value = (obj || {})[fieldName];

            const error = accumulateFormErrors(value, validations);
            if (error) {
                errors[fieldName] = error;
            }
        });
        if (!hasNoKeys(errors)) {
            formErrors.fields = errors;
        }
    }
    return hasNoKeys(formErrors) ? undefined : formErrors;
};

export const analyzeFieldErrors = (fieldErrors) => {
    if (isFalsy(fieldErrors)) {
        return false;
    }
    const keys = Object.keys(fieldErrors);
    if (keys.length === 0) {
        return false;
    }
    return keys.every((key) => {
        const val = fieldErrors[key];
        if (isObject(val)) {
            return analyzeFieldErrors(val);
        }
        return isTruthy(val);
    });
};

export const analyzeFormErrors = (formErrors) => {
    if (isFalsy(formErrors)) {
        return false;
    } else if (isTruthy(formErrors.errors) && formErrors.errors.length > 0) {
        return true;
    } else if (isTruthy(formErrors.fields)) {
        // Iterate over keys and continue until error is found
        return Object.keys(formErrors.fields).some((fieldName) => {
            const value = formErrors.fields[fieldName];
            return analyzeFormErrors(value);
        });
    }
    return false;
};
