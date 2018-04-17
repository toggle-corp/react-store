import {
    requiredCondition,
    integerCondition,
    lengthGreaterThanCondition,
} from './validations';

import FormHelper from './FormHelper';

const attachInputs = (store, helper, schema) => (
    Object.keys(schema.fields).reduce(
        (acc, element) => ({
            ...acc,
            [element]: {
                onChange: helper.getChangeCallback(element),
            },
        }),
        {},
    )
);

const schema = {
    fields: {
        id: [requiredCondition, integerCondition],
        name: [requiredCondition],
        description: [lengthGreaterThanCondition(5)],
    },
    validation: ({ name, description }) => {
        const messages = [];
        if (name && description && name.length > description.length) {
            messages.push('Name must be shorter than the description');
        }
        return messages;
    },
};

test('FormHelper', () => {
    const state = {
        values: {},
        formFieldErrors: {},
    };
    const changeCallback = (values, fieldErrors) => {
        state.values = values;
        state.formFieldErrors = fieldErrors;
    };
    const successCallback = (values) => {
        state.values = values;
    };
    const failureCallback = (fieldErrors) => {
        state.formFieldErrors = fieldErrors;
    };

    const helper = new FormHelper();
    helper.setValue(state.values);
    helper.setSchema(schema);
    helper.setFieldErrors(state.formFieldErrors);
    helper.setCallbacks(
        changeCallback,
        failureCallback,
        successCallback,
    );

    const inputs = attachInputs(state, helper, schema);

    inputs.id.onChange(12);
    helper.setValue(state.values);
    helper.setFieldErrors(state.formFieldErrors);
    expect(state.values.id).toEqual(12);

    helper.submit(); // Error on required field name
    expect(state.formFieldErrors.name).not.toBe(undefined);

    // Clear error on field name
    inputs.name.onChange('hari prasad adhikari');
    helper.setValue(state.values);
    helper.setFieldErrors(state.formFieldErrors);

    inputs.description.onChange('description');
    helper.setValue(state.values);
    helper.setFieldErrors(state.formFieldErrors);
    helper.submit();

    // clear error for description and overall error
    inputs.description.onChange('I am very very long description');
    helper.setValue(state.values);
    helper.setFieldErrors(state.formFieldErrors);
    expect(state.formFieldErrors.description).toBe(undefined);

    // clear error for name
    inputs.name.onChange('hari prasad');
    helper.setValue(state.values);
    helper.setFieldErrors(state.formFieldErrors);
    expect(state.formFieldErrors.name).toBe(undefined);
});
