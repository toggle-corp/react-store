/**
 * @author tnagorra <weathermist@gmail.com>
 */
import update from '../../../utils/immutable-update';
import { isTruthy, isObject } from '../../../utils/common';
import {
    accumulateValues,
    accumulateFieldErrors,
    accumulateFormErrors,
    analyzeFieldErrors,
    analyzeFormErrors,
} from './validator';

// Access a hierarchical object without throwing any error
// formname examples: name, name:shyam
const access = (value, formname) => {
    if (!value) {
        return undefined;
    }
    const keys = formname.split(':');
    let lastValue = value;
    keys.every((key) => {
        lastValue = isObject(lastValue) || Array.isArray(lastValue)
            ? lastValue[key]
            : undefined;
        return isTruthy(lastValue);
    });
    return lastValue;
};

// Get back one hierarchy for formnames
// example: name.firstname becomes name
const getParent = (formnames) => {
    const lastIndex = formnames.lastIndexOf(':');
    return formnames.substring(0, lastIndex);
};

const getChild = (formnames) => {
    const lastIndex = formnames.lastIndexOf(':');
    return formnames.substring(lastIndex + 1, formnames.length);
};

/*
// TESTS
console.warn(getParent('name') === '');
console.warn(getParent('name:lastname') === 'name');
console.warn(getParent('object:name:lastname') === 'object:name');
*/

// Add fields in between and errors at the end for formname
// example: name:firstname becomes fields:name:fields:firstname:errors
const formerrorForFormname = (formerror) => {
    if (formerror === '') {
        return 'errors';
    }
    return `fields:${formerror.replace(/:/g, ':fields:')}:errors`;
};

/*
// TEST:
console.warn(formerrorForFormname('') === 'errors');
console.warn(formerrorForFormname('name') === 'fields:name:errors');
console.warn(formerrorForFormname('name:firstname') === 'fields:name:fields:firstname:errors');
*/

// From list of keys, traverse over schema and get list of type traversed (object/array)
const getTypeList = (keyList, schema) => {
    if (keyList.length <= 0) {
        return [];
    }
    const { fields, member } = schema;
    if (fields) {
        // is object
        const [key, ...newKeyList] = keyList;
        // console.warn(key, fields, fields[key]);
        return ['$auto', ...getTypeList(newKeyList, fields[key])];
    } else if (member) {
        // is array
        // eslint-disable-next-line no-unused-vars
        const [index, ...newKeyList] = keyList;
        // console.warn(index);
        return ['$autoArray', ...getTypeList(newKeyList, member)];
    }
    return [];
};

// Insert $auto or $autoArray, after traversing over the schema
const createSettings = (keyString, schema, startSettings) => {
    const keyList = keyString.split(':');
    const typeList = getTypeList(keyList, schema);

    // Reverse the arrays
    keyList.reverse();
    typeList.reverse();

    // Create settings
    let valueSettings = startSettings;
    keyList.forEach((name, i) => {
        const accessType = typeList[i];
        valueSettings = { [accessType]: { [name]: valueSettings } };
    });
    return valueSettings;
};


/*
 * Helper class to store all the information about a form
 * Carries out the form validations
 */
export default class FormHelper {
    constructor() {
        this.value = {};
        this.schema = {};
        this.fieldErrors = {};
        this.formErrors = {};

        // Internal store for references
        this.changeCallbacks = {};
        this.pushCallbacks = {};
        this.popCallbacks = {};
    }

    setSchema(schema) {
        this.schema = schema;
    }

    setValue(value) {
        this.value = value;
    }

    setFieldErrors(fieldErrors) {
        this.fieldErrors = fieldErrors;
    }

    setFormErrors(formErrors) {
        this.formErrors = formErrors;
    }

    setCallbacks(changeCallback, failureCallback, successCallback) {
        this.changeCallback = changeCallback;
        this.failureCallback = failureCallback;
        this.successCallback = successCallback;
    }

    // Public function
    submit = () => {
        const fieldErrors = accumulateFieldErrors(this.value, this.schema);
        const formErrors = accumulateFormErrors(this.value, this.schema);
        const hasErrors = analyzeFieldErrors(fieldErrors) || analyzeFormErrors(formErrors);

        if (hasErrors) {
            this.failureCallback(fieldErrors, formErrors);
        } else {
            const values = accumulateValues(this.value, this.schema, { noUndefined: true });
            this.successCallback(values);
        }
    };

    // PRIVATE: changeCallback
    handleChange = (elementName, value) => {
        // setting value
        const valueSettings = createSettings(elementName, this.schema, { $set: value });
        const newValue = update(this.value, valueSettings);

        // setting fieldError
        let newFieldErrors = this.fieldErrors;
        const fieldErrorsValue = this.getFieldError(elementName);
        // NOTE: no need to use $auto/$autoArray when there is a value already
        if (fieldErrorsValue !== undefined) {
            const names = elementName
                .split(':')
                .reverse();
            let fieldErrorsSettings = { $set: undefined };
            names.forEach((name) => {
                fieldErrorsSettings = { [name]: fieldErrorsSettings };
            });
            newFieldErrors = update(this.fieldErrors, fieldErrorsSettings);
        }

        let newFormErrors = this.formErrors;
        let elementNameForFormErrors = getParent(elementName);
        while (elementNameForFormErrors) {
            const formErrorsValue = this.getFormError(elementNameForFormErrors);
            // NOTE: no need to use $auto/$autoArray when there is a value already
            if (formErrorsValue !== undefined) {
                const namesForFormErrors = formerrorForFormname(elementNameForFormErrors)
                    .split(':')
                    .reverse();
                let formErrorsSettings = { $set: undefined };
                namesForFormErrors.forEach((name) => {
                    formErrorsSettings = { [name]: formErrorsSettings };
                });
                newFormErrors = update(this.formErrors, formErrorsSettings);
            }
            elementNameForFormErrors = getParent(elementNameForFormErrors);
        }

        this.changeCallback(newValue, newFieldErrors, newFormErrors);
    }

    handlePush = (elementName, mode) => {
        const basicSetting = mode === 'start'
            ? { $autoArray: { $unshift: [undefined] } }
            : { $autoArray: { $push: [undefined] } };
        // setting value
        const valueSettings = createSettings(
            elementName,
            this.schema,
            basicSetting,
        );
        const newValue = update(this.value, valueSettings);

        // setting fieldError
        let newFieldErrors = this.fieldErrors;
        const fieldErrorsValue = this.getFieldError(elementName);
        // NOTE: no need to use $auto/$autoArray when there is a value already
        if (fieldErrorsValue !== undefined) {
            const names = elementName
                .split(':')
                .reverse();
            let fieldErrorsSettings = basicSetting;
            names.forEach((name) => {
                fieldErrorsSettings = { [name]: fieldErrorsSettings };
            });
            newFieldErrors = update(this.fieldErrors, fieldErrorsSettings);
        }

        // setting formFieldError
        let newFormErrors = this.formErrors;
        let elementNameForFormErrors = elementName;
        while (elementNameForFormErrors) {
            const formErrorsValue = this.getFormError(elementNameForFormErrors);
            // NOTE: no need to use $auto/$autoArray when there is a value already
            if (formErrorsValue !== undefined) {
                const namesForFormErrors = formerrorForFormname(elementNameForFormErrors)
                    .split(':')
                    .reverse();
                let formErrorsSettings = { $set: undefined };
                namesForFormErrors.forEach((name) => {
                    formErrorsSettings = { [name]: formErrorsSettings };
                });
                newFormErrors = update(this.formErrors, formErrorsSettings);
            }
            elementNameForFormErrors = getParent(elementNameForFormErrors);
        }

        this.changeCallback(newValue, newFieldErrors, newFormErrors);
    }

    handlePop = (elemName) => {
        const elementName = getParent(elemName);
        const index = getChild(elemName);

        const basicSetting = { $splice: [[index, 1]] };
        // setting value
        const valueSettings = createSettings(
            elementName,
            this.schema,
            basicSetting,
        );
        const newValue = update(this.value, valueSettings);


        // setting fieldError
        let newFieldErrors = this.fieldErrors;
        const fieldErrorsValue = this.getFieldError(elementName);
        // NOTE: no need to use $auto/$autoArray when there is a value already
        if (fieldErrorsValue !== undefined) {
            const names = elementName
                .split(':')
                .reverse();
            let fieldErrorsSettings = basicSetting;
            names.forEach((name) => {
                fieldErrorsSettings = { [name]: fieldErrorsSettings };
            });
            newFieldErrors = update(this.fieldErrors, fieldErrorsSettings);
        }

        // setting formFieldError
        let newFormErrors = this.formErrors;
        let elementNameForFormErrors = elementName;
        while (elementNameForFormErrors) {
            const formErrorsValue = this.getFormError(elementNameForFormErrors);
            // NOTE: no need to use $auto/$autoArray when there is a value already
            if (formErrorsValue !== undefined) {
                const namesForFormErrors = formerrorForFormname(elementNameForFormErrors)
                    .split(':')
                    .reverse();
                let formErrorsSettings = { $set: undefined };
                namesForFormErrors.forEach((name) => {
                    formErrorsSettings = { [name]: formErrorsSettings };
                });
                newFormErrors = update(this.formErrors, formErrorsSettings);
            }
            elementNameForFormErrors = getParent(elementNameForFormErrors);
        }

        this.changeCallback(newValue, newFieldErrors, newFormErrors);
    }

    /* Get a memoized onChange function for given formname */
    getChangeCallback = (formname) => {
        if (this.changeCallbacks[formname]) {
            return this.changeCallbacks[formname];
        }

        const changeCallback = value => this.handleChange(formname, value);
        this.changeCallbacks[formname] = changeCallback;
        return changeCallback;
    }

    /* Get a memoized onChange function for given formname */
    getPushCallback = (formname, formpush) => {
        // push callback should be unique by formname only
        if (this.pushCallbacks[formname]) {
            return this.pushCallbacks[formname];
        }

        const pushCallback = () => this.handlePush(formname, formpush);
        this.pushCallbacks[formname] = pushCallback;
        return pushCallback;
    }

    /* Get a memoized onChange function for given formname */
    getPopCallback = (formname) => {
        // pop callback should be unique by formname only
        if (this.popCallbacks[formname]) {
            return this.popCallbacks[formname];
        }

        const popCallback = () => this.handlePop(formname);
        this.popCallbacks[formname] = popCallback;
        return popCallback;
    }

    // Get value for given formname
    getValue = formname => access(this.value, formname)

    // Get field error for given formname
    getFieldError = formname => access(this.fieldErrors, formname)

    // Get form error for given formname
    getFormError = (formerror) => {
        const name = formerrorForFormname(formerror);
        return access(this.formErrors, name);
    }
}
