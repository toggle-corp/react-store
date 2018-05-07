import PropTypes from 'prop-types';

export const emptyList = [];

export const numberOrStringPropType = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
]);

export const keyPropType = numberOrStringPropType;


export const selectInputOptionCommonPropTypes = {
    optionKey: keyPropType.isRequired,
    optionLabel: PropTypes.node.isRequired,
    onClick: PropTypes.func.isRequired,
};

export const selectInputOptionCommonDefaultProps = {
};

export const singleSelectInputOptionPropTypes = {
    ...selectInputOptionCommonPropTypes,
    value: keyPropType,
};
export const singleSelectInputOptionDefaultProps = {
    ...selectInputOptionCommonDefaultProps,
    value: undefined,
};

export const multiSelectInputOptionPropTypes = {
    ...selectInputOptionCommonPropTypes,
    value: PropTypes.arrayOf(keyPropType),
};
export const multiSelectInputOptionDefaultProps = {
    ...selectInputOptionCommonDefaultProps,
    value: emptyList,
};

export const selectInputOptionsPropTypes = {
    labelSelector: PropTypes.func.isRequired,
    optionLabelSelector: PropTypes.func,
    keySelector: PropTypes.func.isRequired,
    renderEmpty: PropTypes.func.isRequired,
    optionsClassName: PropTypes.string,
    options: PropTypes.array,
    show: PropTypes.bool,
    renderOption: PropTypes.func.isRequired,
    onOptionClick: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired,
    onInvalidate: PropTypes.func.isRequired,
    parentContainer: PropTypes.object,
};

export const selectInputOptionsDefaultProps = {
    optionLabelSelector: undefined,
    optionsClassName: '',
    parentContainer: undefined,
    show: false,
};

export const selectInputCommonPropTypes = {
    hideClearButton: PropTypes.bool,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    error: PropTypes.string,
    hint: PropTypes.string,
    keySelector: PropTypes.func,
    label: PropTypes.string,
    optionLabelSelector: PropTypes.func,
    labelSelector: PropTypes.func,
    onChange: PropTypes.func,
    options: PropTypes.arrayOf(PropTypes.object),
    optionsClassName: PropTypes.string,
    placeholder: PropTypes.string,
    showHintAndError: PropTypes.bool,
    showLabel: PropTypes.bool,
    renderEmpty: PropTypes.func,
    title: PropTypes.string,
};

export const selectInputCommonDefaultProps = {
    hideClearButton: false,
    className: '',
    disabled: false,
    error: undefined,
    hint: undefined,
    keySelector: d => d.key,
    label: '',
    labelSelector: d => d.label,
    optionLabelSelector: undefined,
    onChange: undefined,
    optionModifier: undefined,
    options: emptyList,
    optionsClassName: '',
    renderEmpty: () => 'No option available',
    showHintAndError: true,
    showLabel: true,
    title: undefined,
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
