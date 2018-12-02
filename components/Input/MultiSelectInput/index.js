import React from 'react';
import PropTypes from 'prop-types';

import { iconNames } from '../../../constants';
import { FaramInputElement } from '../../General/FaramElements';

import Label from '../Label';
import HintAndError from '../HintAndError';
import Button from '../../Action/Button';
import DangerButton from '../../Action/Button/DangerButton';
import Options from './Options';

import {
    listToMap,
    caseInsensitiveSubmatch,
    getRatingForContentInString,
} from '../../../utils/common';

import {
    calcFloatPositionInMainWindow,
    defaultOffset,
    defaultLimit,
} from '../../../utils/bounds';

import styles from './styles.scss';

export const emptyList = [];
export const numberOrStringPropType = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
]);
export const keyPropType = numberOrStringPropType;

export const propTypes = {
    autoFocus: PropTypes.bool,
    className: PropTypes.string,
    clearable: PropTypes.bool,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    error: PropTypes.string,
    hideClearButton: PropTypes.bool,
    hideSelectAllButton: PropTypes.bool,
    hint: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    labelSelector: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(PropTypes.object),
    optionsClassName: PropTypes.string,
    placeholder: PropTypes.string,
    renderEmpty: PropTypes.func,
    showHintAndError: PropTypes.bool,
    showLabel: PropTypes.bool,
    title: PropTypes.string,
    value: PropTypes.arrayOf(keyPropType),
    keySelector: PropTypes.func,
};

export const defaultProps = {
    autoFocus: undefined,
    className: '',
    clearable: false,
    disabled: false,
    readOnly: false,
    error: undefined,
    hideClearButton: false,
    hideSelectAllButton: false,
    hint: undefined,
    keySelector: d => d.key,
    label: '',
    labelSelector: d => d.label,
    onChange: undefined,
    options: emptyList,
    optionsClassName: '',
    placeholder: 'Select option(s)',
    renderEmpty: () => 'No option available',
    showHintAndError: true,
    showLabel: true,
    title: undefined,
    value: emptyList,
};

const filterAndSortOptions = ({
    options,
    value,
    labelSelector,
}) => {
    const newOptions = options.filter(
        option => caseInsensitiveSubmatch(
            labelSelector(option),
            value,
        ),
    );

    const rate = getRatingForContentInString;
    newOptions.sort((a, b) => (
        rate(value, labelSelector(a)) - rate(value, labelSelector(b))
    ));

    return newOptions;
};

const validateValue = (prop) => {
    const {
        value,
        options,
        keySelector,
    } = prop;

    let valid = true;
    const validValues = [];

    const optionsMap = listToMap(
        options,
        keySelector,
        (element, key) => key,
    );

    value.forEach((v) => {
        const val = optionsMap[v];
        if (val) {
            validValues.push(val);
        } else {
            valid = false;
        }
    });

    return { valid, value: validValues };
};

const getInputPlaceholder = (props) => {
    const {
        value,
        placeholder,
        labelSelector,
        keySelector,
        options,
    } = props;

    // NOTE: if there is only one value selected, show its label instead
    if (value.length === 1) {
        const key = value[0];
        const option = options.find(o => keySelector(o) === key);
        if (!option) {
            // FIXME: better error message
            return 'ERROR';
        }
        return labelSelector(option);
    } else if (value.length > 0) {
        return `${value.length} selected`;
    }

    return placeholder;
};

export class NormalMultiSelectInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            focusedKey: undefined,
            displayOptions: props.options,
            inputInFocus: props.autoFocus,
            inputValue: '',
            placeholder: getInputPlaceholder(props),
            showOptions: false,
        };

        this.container = React.createRef();
        this.input = React.createRef();
    }

    componentWillMount() {
        const {
            valid,
            value,
        } = validateValue(this.props);

        const { onChange } = this.props;

        if (!valid) {
            onChange(value);
        }
    }

    componentDidMount() {
        const { current: container } = this.container;
        if (container) {
            this.boundingClientRect = container.getBoundingClientRect();
        }
    }

    componentWillReceiveProps(nextProps) {
        const {
            value: newValue,
            placeholder: newPlaceholder,
            options: newOptions,
            onChange,
        } = nextProps;

        const {
            value: oldValue,
            placeholder: oldPlaceholder,
            options: oldOptions,
        } = this.props;

        const areValuesEqual = newValue === oldValue;
        const areOptionsEqual = newOptions === oldOptions;

        if (!areValuesEqual || !areOptionsEqual) {
            const {
                valid,
                value,
            } = validateValue(nextProps);

            if (!valid) {
                onChange(value);
                return;
            }
        }

        const arePlaceholdersEqual = newPlaceholder === oldPlaceholder;

        if (!areValuesEqual || !arePlaceholdersEqual) {
            const placeholder = getInputPlaceholder(nextProps);
            this.setState({ placeholder });
        }

        if (!areOptionsEqual) {
            const { inputValue } = this.state;
            const displayOptions = filterAndSortOptions({
                ...nextProps,
                value: inputValue,
            });
            this.setState({ displayOptions });
        }
    }

    getClassName = () => {
        const {
            disabled,
            error,
            clearable,
            className,
            value,
            options,
            hideClearButton,
            hideSelectAllButton,
        } = this.props;

        const {
            showOptions,
            inputInFocus,
        } = this.state;

        const classNames = [
            className,
            'multi-select-input',
            styles.multiSelectInput,
        ];

        if (showOptions) {
            classNames.push(styles.showOptions);
            classNames.push('show-options');
        }

        if (disabled) {
            classNames.push('disabled');
            classNames.push(styles.disabled);
        }

        if (inputInFocus) {
            classNames.push(styles.inputInFocus);
            classNames.push('input-in-focus');
        }

        if (error) {
            classNames.push(styles.error);
            classNames.push('error');
        }

        if (hideClearButton) {
            classNames.push(styles.hideClearButton);
            classNames.push('hide-clear-button');
        }

        if (hideSelectAllButton) {
            classNames.push(styles.hideSelectAllButton);
            classNames.push('hide-select-all-button');
        }

        if (clearable) {
            classNames.push('clearable');
        }

        if (value.length !== 0) {
            classNames.push(styles.filled);
            classNames.push('filled');
        }

        if (value.length === options.length) {
            classNames.push(styles.completelyFilled);
            classNames.push('completely-filled');
        }

        return classNames.join(' ');
    };

    toggleDropdown = () => {
        const { current: container } = this.container;
        const { current: input } = this.input;
        const { options } = this.props;
        const { showOptions } = this.state;

        if (showOptions) {
            this.handleOptionsBlur();
        } else {
            if (input) {
                input.select();
            }

            if (container) {
                this.boundingClientRect = container.getBoundingClientRect();
            }
        }

        this.setState({
            displayOptions: options,
            showOptions: !showOptions,
            focusedKey: undefined,
        });
    }

    handleInputValueChange = (e) => {
        const { value } = e.target;
        const displayOptions = filterAndSortOptions({
            ...this.props,
            value,
        });

        this.setState({
            displayOptions,
            inputValue: value,
            showOptions: true,
            focusedKey: undefined,
        });
    }

    handleInputKeyDown = (e) => {
        const { focusedKey, displayOptions, showOptions } = this.state;
        const { keySelector } = this.props;

        // Keycodes:
        // 9: Tab
        // 27: Escape
        // 13: Enter
        // 32: Space
        // 38: Down
        // 40: Up

        // If tab or escape was pressed and dropdown is being shown,
        // hide the dropdown.
        if ((e.keyCode === 9 || e.keyCode === 27) && showOptions) {
            this.toggleDropdown();
            return;
        }

        // List of special keys, we are going to handle
        const specialKeys = [40, 38, 13, 32];
        if (displayOptions.length === 0 || specialKeys.indexOf(e.keyCode) === -1) {
            return;
        }

        // Handle space and enter keys only if an option is focused
        if ((e.keyCode === 13 || e.keyCode === 32) && !focusedKey) {
            return;
        }

        // First, disable default behaviour for these keys
        e.stopPropagation();
        e.preventDefault();

        // If any of the special keys was pressed but the dropdown is currently hidden,
        // show the dropdown.
        if (!showOptions) {
            this.toggleDropdown();
            return;
        }

        if (e.keyCode === 13 || e.keyCode === 32) {
            this.handleOptionClick(focusedKey);
            return;
        }

        // For up and down key, find which option is currently focused
        const index = displayOptions.findIndex(o => keySelector(o) === focusedKey);

        // And then calculate new option to focus
        let newFocusedKey;
        if (e.keyCode === 40) {
            if (index < displayOptions.length) {
                newFocusedKey = keySelector(displayOptions[index + 1]);
            }
        } else if (e.keyCode === 38) {
            if (index === -1) {
                newFocusedKey = keySelector(displayOptions[displayOptions.length - 1]);
            } else if (index > 0) {
                newFocusedKey = keySelector(displayOptions[index - 1]);
            }
        }

        this.setState({ focusedKey: newFocusedKey });
    }

    handleInputFocus = () => {
        this.setState({ inputInFocus: true });
    }

    handleInputBlur = () => {
        this.setState({ inputInFocus: false });
    }

    handleInputClick = () => {
        this.toggleDropdown();
    }

    handleDropdownButtonClick = () => {
        this.toggleDropdown();
    }

    handleOptionsInvalidate = (optionsContainer) => {
        const contentRect = optionsContainer.getBoundingClientRect();
        let parentRect = this.boundingClientRect;
        const { current: container } = this.container;

        if (container) {
            parentRect = container.getBoundingClientRect();
        }

        const { showHintAndError } = this.props;

        const offset = { ...defaultOffset };
        if (showHintAndError) {
            offset.top = 12;
        }

        const optionsContainerPosition = (
            calcFloatPositionInMainWindow({
                parentRect,
                contentRect,
                offset,
                limit: {
                    ...defaultLimit,
                    minW: parentRect.width,
                    maxW: parentRect.width,
                },
            })
        );

        return optionsContainerPosition;
    };

    handleOptionsBlur = () => {
        const { options } = this.props;

        this.setState({
            showOptions: false,
            displayOptions: options,
            inputValue: '',
            placeholder: getInputPlaceholder(this.props),
        });
    }

    handleOptionClick = (key) => {
        const {
            value,
            onChange,
        } = this.props;
        const { current: input } = this.input;

        const newValue = [...value];
        const optionIndex = newValue.findIndex(d => d === key);

        if (optionIndex === -1) {
            newValue.push(key);
        } else {
            newValue.splice(optionIndex, 1);
        }

        input.select();
        this.setState({ focusedKey: key }, () => {
            onChange(newValue);
        });
    }

    handleOptionFocus = (focusedKey) => {
        this.setState({ focusedKey });
    }

    handleSelectAllButtonClick = () => {
        const {
            options,
            keySelector,
            onChange,
        } = this.props;

        const newValue = options.map(d => keySelector(d));
        onChange(newValue);
    }

    handleClearButtonClick = () => {
        const { onChange } = this.props;
        onChange(emptyList);
    }

    handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
    }

    renderActions = () => {
        const {
            disabled,
            readOnly,
        } = this.props;

        const className = `
            actions
            ${styles.actions}
        `;
        const dropdownButtonClassName = `
            dropdown-button
            ${styles.dropdownButton}
        `;

        const ClearButton = this.renderClearButton;
        const SelectAllButton = this.renderSelectAllButton;

        return (
            <div className={className}>
                <SelectAllButton />
                <ClearButton />
                <Button
                    tabIndex="-1"
                    iconName={iconNames.arrowDropdown}
                    className={dropdownButtonClassName}
                    onClick={this.handleDropdownButtonClick}
                    transparent
                    disabled={disabled || readOnly}
                />
            </div>
        );
    }

    renderInput = () => {
        const {
            readOnly,
            disabled,
            autoFocus,
        } = this.props;

        const {
            inputValue,
            placeholder,
        } = this.state;

        const className = `
            input
            ${styles.input}
        `;

        return (
            <input
                className={className}
                disabled={disabled || readOnly}
                onBlur={this.handleInputBlur}
                onChange={this.handleInputValueChange}
                onClick={this.handleInputClick}
                onFocus={this.handleInputFocus}
                onKeyDown={this.handleInputKeyDown}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={autoFocus}
                placeholder={placeholder}
                ref={this.input}
                type="text"
                value={inputValue}
                onDrop={this.handleDrop}
            />
        );
    }

    renderClearButton = () => {
        const {
            readOnly,
            disabled,
            value,
            hideClearButton,
        } = this.props;

        const hide = (hideClearButton || disabled || readOnly || value.length === 0);
        if (hide) {
            return null;
        }

        const tooltipText = 'Clear selected option(s)';
        const className = `
            clear-button
            ${styles.clearButton}
        `;

        return (
            <DangerButton
                transparent
                tabIndex="-1"
                className={className}
                onClick={this.handleClearButtonClick}
                title={tooltipText}
                disabled={disabled || readOnly}
                iconName={iconNames.close}
            />
        );
    }

    renderSelectAllButton = () => {
        const {
            value,
            options,
            disabled,
            readOnly,
            hideSelectAllButton,
        } = this.props;

        const hide = (
            hideSelectAllButton || disabled || readOnly || value.length === options.length
        );

        if (hide) {
            return null;
        }

        const tooltipText = 'Select all options';
        const className = `
            select-all-button
            ${styles.selectAllButton}
        `;

        return (
            <Button
                transparent
                tabIndex="-1"
                className={className}
                onClick={this.handleSelectAllButtonClick}
                title={tooltipText}
                disabled={disabled || readOnly}
                type="button"
                iconName={iconNames.checkAll}
            />
        );
    }

    renderInputAndActions = () => {
        const InputElement = this.renderInput;
        const Actions = this.renderActions;

        const className = `
            input-and-actions
            ${styles.inputAndActions}
        `;

        return (
            <div className={className}>
                <InputElement />
                <Actions />
            </div>
        );
    }

    render() {
        const className = this.getClassName();

        const {
            error,
            hint,
            keySelector,
            label,
            labelSelector,
            optionsClassName,
            renderEmpty,
            showHintAndError,
            showLabel,
            title,
            value,
        } = this.props;

        const {
            displayOptions,
            showOptions,
            focusedKey,
        } = this.state;

        const { current: container } = this.container;
        const InputAndActions = this.renderInputAndActions;
        return (
            <div
                className={className}
                ref={this.container}
                title={title}
            >
                <Label
                    className={styles.label}
                    show={showLabel}
                    text={label}
                />
                <InputAndActions />
                <HintAndError
                    show={showHintAndError}
                    error={error}
                    hint={hint}
                />
                <Options
                    activeKeys={value}
                    data={displayOptions}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    onBlur={this.handleOptionsBlur}
                    onInvalidate={this.handleOptionsInvalidate}
                    onOptionClick={this.handleOptionClick}
                    onOptionFocus={this.handleOptionFocus}
                    className={optionsClassName}
                    parentContainer={container}
                    renderEmpty={renderEmpty}
                    show={showOptions}
                    focusedKey={focusedKey}
                />
            </div>
        );
    }
}

export default FaramInputElement(NormalMultiSelectInput);
