import {
    requiredCondition,
    integerCondition,
    lengthGreaterThanCondition,
    createValidation,
} from './validations';

import FormHelper from './FormHelper';

const attachInputs = (store, helper, elements) => (
    elements.reduce(
        (acc, element) => {
            acc[element] = {
                ref: helper.updateRef(element),
                onChange: helper.updateChangeFn(element),
                getValue: () => store.values[element],
            };
            // ref is called automatically in reality
            acc[element].ref(acc[element]);
            return acc;
        },
        {},
    )
);

const elements = [
    'id',
    'name',
    'description',
];

const validations = {
    id: [
        requiredCondition,
        integerCondition,
    ],
    name: [
        requiredCondition,
    ],
    description: [
        lengthGreaterThanCondition(5),
    ],
};

const validation = createValidation('name', 'description', (name, description) => {
    if (name && description && name.length > description.length) {
        return {
            ok: false,
            formErrors: ['Form has combined validation error.'],
            formFieldErrors: {
                name: 'Name must be shorter',
                description: 'Description must be longer',
            },
        };
    }
    return { ok: true };
});


test('', () => {
    const state = {
        values: {},
        formErrors: undefined,
        formFieldErrors: {},
    };
    const changeCallback = (values, { formFieldErrors }) => {
        state.formErrors = undefined;
        state.values = { ...state.values, ...values };
        state.formFieldErrors = { ...state.formFieldErrors, ...formFieldErrors };
    };
    const successCallback = (values) => {
        state.values = { ...state.values, ...values };
    };
    const failureCallback = ({ formErrors, formFieldErrors }) => {
        state.formErrors = formErrors;
        state.formFieldErrors = { ...state.formFieldErrors, ...formFieldErrors };
    };

    const helper = new FormHelper();
    helper.setElements(elements);
    helper.setValidations(validations);
    helper.setValidation(validation);
    helper.setCallbacks({
        changeCallback,
        successCallback,
        failureCallback,
    });

    const inputs = attachInputs(state, helper, elements);
    inputs.id.onChange(12);

    // Set value in field id
    expect(state.values.id).toEqual(12);
    // Error on required field name
    helper.onSubmit();
    expect(state.formFieldErrors.name).not.toBe(undefined);
    // Clear error on field name
    inputs.name.onChange('hari prasad');
    inputs.description.onChange('short err');
    helper.onSubmit();
    // error because description is shorter than name
    expect(state.formErrors).not.toBe(undefined);
    expect(state.formFieldErrors.name).not.toBe(undefined);
    expect(state.formFieldErrors.description).not.toBe(undefined);

    // clear error for description and overall error
    inputs.description.onChange('a lot longer error');
    expect(state.formFieldErrors.description).toBe(undefined);
    expect(state.formErrors).toBe(undefined);
    // clear error for name
    inputs.name.onChange('haris');
    expect(state.formFieldErrors.name).toBe(undefined);
});
