import {
    isObject,
    isList,
    isFalsy,
    isTruthy,
    findDifferenceInList,
    isNotDefined,
} from '@togglecorp/fujs';

const emptyObject = {};
const emptyArray = [];

const hasNoKeys = obj => (
    isFalsy(obj) || Object.keys(obj).length === 0
);

const hasNoValues = array => (
    isFalsy(array) || array.length <= 0 || array.every(e => isFalsy(e))
);

const getIdentifierName = (element, identifier) => {
    const identifierName = identifier(element);
    return isFalsy(identifierName, ['']) ? 'default' : identifierName;
};

const getIdentifierChoice = (element, identifier, fieldsOrMember) => {
    const name = getIdentifierName(element, identifier);
    return fieldsOrMember[name];
};

export const accumulateValues = (obj, schema = {}, settings = {}) => {
    const {
        noFalsyValues = false,
        falsyValue = undefined,
    } = settings;

    // NOTE: if schema is array, the object is the node element
    const { member, fields, identifier } = schema;
    const isSchemaForLeaf = isList(schema);
    const isSchemaForArray = !!member;
    const isSchemaForObject = !!fields;
    const hasIdentifierFunction = !!identifier;

    if (isSchemaForLeaf) {
        if (isNotDefined(obj) && !noFalsyValues) {
            return falsyValue;
        }
        return obj;
    } else if (isSchemaForArray) {
        const safeObj = obj || emptyArray;
        const values = [];
        safeObj.forEach((element) => {
            const localMember = hasIdentifierFunction
                ? getIdentifierChoice(element, identifier, member)
                : member;
            const value = accumulateValues(element, localMember, settings);
            values.push(value);
        });
        if (hasNoValues(values)) {
            return noFalsyValues ? emptyArray : falsyValue;
        }
        return values;
    } else if (isSchemaForObject) {
        const safeObj = obj || emptyObject;
        const values = {};

        const localFields = hasIdentifierFunction
            ? getIdentifierChoice(safeObj, identifier, fields)
            : fields;

        Object.keys(localFields).forEach((fieldName) => {
            const value = accumulateValues(safeObj[fieldName], localFields[fieldName], settings);
            if (value !== undefined) {
                values[fieldName] = value;
            }
        });
        // FIXME: don't copy values if there is nothing to be cleared
        if (hasNoKeys(values)) {
            return noFalsyValues ? emptyObject : falsyValue;
        }
        return values;
    }

    console.error('Accumulate Value: Schema is invalid for ', schema);
    return undefined;
};

export const accumulateErrors = (obj, schema = {}) => {
    const { member, fields, validation, keySelector, identifier } = schema;
    const isSchemaForLeaf = isList(schema);
    const isSchemaForArray = (!!member && !!keySelector);
    const hasIdentifierFunction = !!identifier;
    const isSchemaForObject = !!fields;

    if (isSchemaForLeaf) {
        let error;
        schema.every((rule) => {
            const { ok, message } = rule(obj);
            if (!ok) {
                error = message;
            }
            return ok;
        });
        return error;
    }

    const errors = {};
    if (validation) {
        const validationErrors = validation(obj);
        if (validationErrors.length > 0) {
            errors.$internal = validationErrors;
        }
    }
    if (isSchemaForArray) {
        const safeObj = obj || emptyArray;
        safeObj.forEach((element) => {
            const localMember = hasIdentifierFunction
                ? getIdentifierChoice(element, identifier, member)
                : member;
            const fieldError = accumulateErrors(element, localMember);
            if (fieldError) {
                const index = keySelector(element);
                errors[index] = fieldError;
            }
        });
        return hasNoKeys(errors) ? undefined : errors;
    } else if (isSchemaForObject) {
        const safeObj = obj || emptyObject;
        const localFields = hasIdentifierFunction
            ? getIdentifierChoice(safeObj, identifier, fields)
            : fields;
        Object.keys(localFields).forEach((fieldName) => {
            const fieldError = accumulateErrors(safeObj[fieldName], localFields[fieldName]);
            if (fieldError) {
                errors[fieldName] = fieldError;
            }
        });
        return hasNoKeys(errors) ? undefined : errors;
    }

    console.error('Accumulate Error: Schema is invalid for ', schema);
    return undefined;
};

export const accumulateDifferentialErrors = (
    oldObj, newObj, oldError, schema = {},
) => {
    if (oldObj === newObj) {
        return oldError;
    }
    // NOTE: if schema is array, the object is the node element
    const { member, fields, validation, keySelector, identifier } = schema;
    const isSchemaForLeaf = isList(schema);
    const isSchemaForArray = !!member && !!keySelector;
    const hasIdentifierFunction = !!identifier;
    const isSchemaForObject = !!fields;

    if (isSchemaForLeaf) {
        let error;
        schema.every((rule) => {
            const { ok, message } = rule(newObj);
            if (!ok) {
                error = message;
            }
            return ok;
        });
        return error;
    }

    const errors = {};
    if (validation) {
        const validationErrors = validation(newObj);
        if (validationErrors.length > 0) {
            errors.$internal = validationErrors;
        }
    }

    if (isSchemaForArray) {
        const safeOldObj = oldObj || emptyArray;
        const safeNewObj = newObj || emptyArray;
        const safeOldError = oldError || emptyObject;

        const {
            unmodified,
            modified,
        } = findDifferenceInList(safeOldObj, safeNewObj, keySelector);

        /*
        // NOTE: no error for newly added elements
        added.forEach((e) => {
            const localMember = hasIdentifierFunction
                ? getIdentifierChoice(element, otherProps)
                : member;
            const fieldError = accumulateErrors(e, localMember);
            if (fieldError) {
                const index = keySelector(e);
                errors[index] = fieldError;
            }
        });
        */

        unmodified.forEach((e) => {
            const index = keySelector(e);
            errors[index] = safeOldError[index];
        });

        modified.forEach((e) => {
            const localMember = hasIdentifierFunction
                ? getIdentifierChoice(e.new, identifier, member)
                : member;

            const index = keySelector(e.new);

            // NOTE: clear out errors if different localMember for e.old and e.new
            const forgetOldError = (
                hasIdentifierFunction &&
                getIdentifierName(e.new, identifier) !== getIdentifierName(e.old, identifier)
            );

            const fieldError = accumulateDifferentialErrors(
                e.old,
                e.new,
                forgetOldError ? undefined : safeOldError[index],
                localMember,
            );
            if (fieldError) {
                errors[index] = fieldError;
            }
        });

        return hasNoKeys(errors) ? undefined : errors;
    } else if (isSchemaForObject) {
        const safeOldObj = oldObj || emptyObject;
        const safeNewObj = newObj || emptyObject;

        // NOTE: clear out errors if different localMember for e.old and e.new
        const forgetOldError = (
            hasIdentifierFunction &&
            getIdentifierName(safeNewObj, identifier) !== getIdentifierName(safeOldObj, identifier)
        );

        // FIXME: forgetOldError can be made a lot better if it only clears
        // error for fields that have validations changed
        const safeOldError = (!forgetOldError && oldError) || emptyObject;
        const localFields = hasIdentifierFunction
            ? getIdentifierChoice(safeNewObj, identifier, fields)
            : fields;


        Object.keys(localFields).forEach((fieldName) => {
            if (safeOldObj[fieldName] === safeNewObj[fieldName] && safeOldError[fieldName]) {
                errors[fieldName] = safeOldError[fieldName];
                return;
            }
            const fieldError = accumulateDifferentialErrors(
                safeOldObj[fieldName],
                safeNewObj[fieldName],
                safeOldError[fieldName],
                localFields[fieldName],
            );
            if (fieldError) {
                errors[fieldName] = fieldError;
            }
        });
        return hasNoKeys(errors) ? undefined : errors;
    }

    console.error('Accumulate Differential Error: Schema is invalid for ', schema);
    return undefined;
};

export const analyzeErrors = (errors) => {
    // handles undefined, null
    if (isFalsy(errors)) {
        return false;
    }
    // handles empty object {}
    const keys = Object.keys(errors);
    if (keys.length === 0) {
        return false;
    }
    return keys.some((key) => {
        const subErrors = errors[key];
        // handles object
        if (isObject(subErrors)) {
            return analyzeErrors(subErrors);
        }
        // handles string or array of strings
        return isTruthy(subErrors);
    });
};

