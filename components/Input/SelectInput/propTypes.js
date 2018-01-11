import PropTypes from 'prop-types';

export const keyPropType = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
]);

export const selectInputCommonPropTypes = {
    className: PropTypes.string,
    clearable: PropTypes.bool,
    disabled: PropTypes.bool,
    error: PropTypes.string,
    hint: PropTypes.string,
    keySelector: PropTypes.func,
    label: PropTypes.string,
    labelSelector: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(PropTypes.object),
    placeholder: PropTypes.string,
    showHintAndError: PropTypes.bool,
    showLabel: PropTypes.bool,
    renderEmpty: PropTypes.func,
};

export const selectInputCommonDefaultProps = {
    className: '',
    clearable: true,
    disabled: false,
    error: undefined,
    hint: undefined,
    keySelector: d => d.key,
    label: '',
    labelSelector: d => d.label,
    optionModifier: undefined,
    options: [],
    showHintAndError: false,
    showLabel: true,
    renderEmpty: () => 'No option available',
};

// Single select input

export const singleSelectInputPropTypes = {
    ...selectInputCommonPropTypes,
    value: keyPropType,
    // optionModifier: PropTypes.func,
};

export const singleSelectInputDefaultProps = {
    ...selectInputCommonDefaultProps,
    placeholder: 'Select an option',
    value: undefined,
};


// Multi select input

export const multiSelectInputPropTypes = {
    value: PropTypes.arrayOf(keyPropType),
};

export const multiSelectInputDefaultProps = {
    ...selectInputCommonDefaultProps,
    placeholder: 'Select option(s)',
    value: [],
};
