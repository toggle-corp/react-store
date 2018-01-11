import PropTypes from 'prop-types';

export const emptyList = [];

export const keyPropType = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
]);

export const selectInputCommonPropTypes = {
    hideClearButton: PropTypes.bool,
    className: PropTypes.string,
    clearable: PropTypes.bool,
    disabled: PropTypes.bool,
    error: PropTypes.string,
    hint: PropTypes.string,
    keySelector: PropTypes.func,
    label: PropTypes.string,
    labelSelector: PropTypes.func,
    onChange: PropTypes.func,
    options: PropTypes.arrayOf(PropTypes.object),
    optionsClassName: PropTypes.string,
    placeholder: PropTypes.string,
    showHintAndError: PropTypes.bool,
    showLabel: PropTypes.bool,
    renderEmpty: PropTypes.func,
};

export const selectInputCommonDefaultProps = {
    hideClearButton: false,
    className: '',
    clearable: true,
    disabled: false,
    error: undefined,
    hint: undefined,
    keySelector: d => d.key,
    label: '',
    labelSelector: d => d.label,
    onChange: undefined,
    optionModifier: undefined,
    options: emptyList,
    optionsClassName: '',
    renderEmpty: () => 'No option available',
    showHintAndError: true,
    showLabel: true,
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
    hideSelectAllButton: PropTypes.bool,
    value: PropTypes.arrayOf(keyPropType),
};

export const multiSelectInputDefaultProps = {
    ...selectInputCommonDefaultProps,
    hideSelectAllButton: false,
    placeholder: 'Select option(s)',
    value: emptyList,
};
