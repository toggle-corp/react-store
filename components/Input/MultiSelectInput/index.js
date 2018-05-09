import React from 'react';
import PropTypes from 'prop-types';

import { iconNames } from '../../../constants';
import FaramElement from '../../Input/Faram/FaramElement';

import Label from '../Label';
import HintAndError from '../HintAndError';
import Button from '../../Action/Button';
import Options from './Options';

import {
    listToMap,
    caseInsensitiveSubmatch,
    calcFloatingPositionInMainWindow,
    getRatingForContentInString,
} from '../../../utils/common';

import styles from './styles.scss';

export const emptyList = [];

export const numberOrStringPropType = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
]);
export const keyPropType = numberOrStringPropType;

export const propTypes = {
    className: PropTypes.string,
    clearable: PropTypes.bool,
    disabled: PropTypes.bool,
    error: PropTypes.string,
    hideClearButton: PropTypes.bool,
    hideSelectAllButton: PropTypes.bool,
    hint: PropTypes.string,
    keySelector: PropTypes.func,
    label: PropTypes.string,
    labelSelector: PropTypes.func,
    onChange: PropTypes.func,
    options: PropTypes.arrayOf(PropTypes.object),
    optionsClassName: PropTypes.string,
    placeholder: PropTypes.string,
    renderEmpty: PropTypes.func,
    showHintAndError: PropTypes.bool,
    showLabel: PropTypes.bool,
    value: PropTypes.arrayOf(keyPropType),
    title: PropTypes.string,
};

export const defaultProps = {
    className: '',
    clearable: false,
    disabled: false,
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
    value: emptyList,
    title: undefined,
};

const filterAndSortOptions = (options, value, labelSelector) => {
    const newOptions = options.filter(
        option => caseInsensitiveSubmatch(labelSelector(option), value),
    );

    newOptions.sort((a, b) => (
        getRatingForContentInString(value, labelSelector(a))
            - getRatingForContentInString(value, labelSelector(b))
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
        () => true,
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
        return labelSelector(option);
    } else if (value.length > 0) {
        return `${value.length} selected`;
    }

    return placeholder;
};

class MultiSelectInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            inputValue: '',
            placeholder: getInputPlaceholder(props),
            displayOptions: props.options,
            showOptions: false,
        };
    }

    componentWillMount() {
        const { valid, value } = validateValue(this.props);
        if (!valid) {
            this.props.onChange(value);
        }
    }

    componentDidMount() {
        if (this.container) {
            this.boundingClientRect = this.container.getBoundingClientRect();
        } else {
            // NOTE: timeout
            // should have a clearTimeout
            setTimeout(() => {
                this.boundingClientRect = this.container.getBoundingClientRect();
            }, 0);
        }
    }

    componentWillReceiveProps(nextProps) {
        const {
            value: oldValue,
            placeholder: oldPlaceholder,
            options: oldOptions,
        } = this.props;

        const areValuesEqual = nextProps.value === oldValue;
        const areOptionsEqual = nextProps.options === oldOptions;

        if (!areValuesEqual || !areOptionsEqual) {
            const { valid, value } = validateValue(nextProps);
            if (!valid) {
                nextProps.onChange(value);
                return;
            }
        }

        const arePlaceholdersEqual = nextProps.placeholder === oldPlaceholder;

        if (!areValuesEqual || !arePlaceholdersEqual) {
            const placeholder = getInputPlaceholder(nextProps);
            this.setState({ placeholder });
        }

        if (!areOptionsEqual) {
            const { inputValue } = this.state;
            const displayOptions = filterAndSortOptions(
                nextProps.options,
                inputValue,
                nextProps.labelSelector,
            );
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
        } = this.props;

        const { showOptions } = this.state;

        const classNames = [
            className,
            'multi-select-input',
            styles.multiSelectInput,
        ];

        if (disabled) {
            classNames.push('disabled');
            classNames.push(styles.disabled);
        }

        if (error) {
            classNames.push('error');
            classNames.push(styles.error);
        }

        if (clearable) {
            classNames.push('clearable');
        }

        if (showOptions) {
            classNames.push('options-shown');
            classNames.push(styles.optionsShown);
        }

        if (value && value.length !== 0) {
            classNames.push('filled');
            classNames.push(styles.filled);
        }

        return classNames.join(' ');
    };

    handleInputValueChange = (e) => {
        const { value } = e.target;
        const {
            options,
            labelSelector,
        } = this.props;

        const displayOptions = filterAndSortOptions(options, value, labelSelector);

        this.setState({
            displayOptions,
            inputValue: value,
            showOptions: true,
        });
    }

    handleInputClick = () => {
        if (this.container) {
            this.boundingClientRect = this.container.getBoundingClientRect();
        }

        if (this.input) {
            this.input.select();
        }

        const { options } = this.props;
        this.setState({
            // reset options
            displayOptions: options,
            showOptions: true,
        });
    }

    handleOptionContainerInvalidate = (optionsContainer) => {
        const containerRect = optionsContainer.getBoundingClientRect();
        let parentRect = this.boundingClientRect;
        if (this.container) {
            parentRect = this.container.getBoundingClientRect();
        }

        const offset = { top: 0, bottom: 0, left: 0, right: 0 };
        if (this.props.showHintAndError) {
            offset.top = 12;
        }

        const optionsContainerPosition = (
            calcFloatingPositionInMainWindow(parentRect, containerRect, offset)
        );
        return optionsContainerPosition;
    }

    handleOptionContainerBlur = () => {
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

        const newValue = [...value];
        const optionIndex = newValue.findIndex(d => d === key);

        if (optionIndex === -1) {
            newValue.push(key);
        } else {
            newValue.splice(optionIndex, 1);
        }

        onChange(newValue);
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

    renderActions = () => {
        const ClearButton = this.renderClearButton;
        const SelectAllButton = this.renderSelectAllButton;
        const dropdownClassName = [
            'dropdown-icon',
            styles.dropdownIcon,
            iconNames.arrowDropdown,
        ].join(' ');

        return (
            <div className={`actions ${styles.actions}`}>
                <SelectAllButton />
                <ClearButton />
                <span className={dropdownClassName} />
            </div>
        );
    }

    renderInput = () => {
        const { disabled } = this.props;
        const {
            inputValue,
            placeholder,
        } = this.state;

        const className = `input ${styles.input}`;

        return (
            <input
                className={className}
                disabled={disabled}
                onChange={this.handleInputValueChange}
                onClick={this.handleInputClick}
                placeholder={placeholder}
                ref={(el) => { this.input = el; }}
                type="text"
                value={inputValue}
            />
        );
    }

    renderClearButton = () => {
        const {
            disabled,
            value,
            hideClearButton,
        } = this.props;

        const hide = (hideClearButton || disabled || value.length === 0);
        if (hide) {
            return null;
        }

        const tooltipText = 'Clear selected option(s)';
        const className = `clear-button ${styles.clearButton}`;

        return (
            <Button
                transparent
                className={className}
                onClick={this.handleClearButtonClick}
                title={tooltipText}
                disabled={disabled}
                iconName={iconNames.close}
            />
        );
    }

    renderSelectAllButton = () => {
        const {
            value,
            options,
            disabled,
            hideSelectAllButton,
        } = this.props;

        const hide = (
            hideSelectAllButton || disabled || value.length === options.length
        );

        if (hide) {
            return null;
        }

        const tooltipText = 'Select all options';
        const className = `select-all-button ${styles.selectAllButton}`;

        return (
            <Button
                transparent
                className={className}
                onClick={this.handleSelectAllButtonClick}
                title={tooltipText}
                disabled={disabled}
                type="button"
                iconName={iconNames.checkAll}
            />
        );
    }

    render() {
        const className = this.getClassName();
        const InputElement = this.renderInput;
        const Actions = this.renderActions;

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
            value,
            title,
        } = this.props;

        const {
            displayOptions,
            showOptions,
        } = this.state;

        return (
            <div
                ref={(el) => { this.container = el; }}
                className={className}
                title={title}
            >
                <Label
                    className={styles.label}
                    show={showLabel}
                    text={label}
                />
                <div className={`input-wrapper ${styles.inputWrapper}`}>
                    <InputElement />
                    <Actions />
                </div>
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
                    onBlur={this.handleOptionContainerBlur}
                    onInvalidate={this.handleOptionContainerInvalidate}
                    onOptionClick={this.handleOptionClick}
                    optionsClassName={optionsClassName}
                    parentContainer={this.container}
                    renderEmpty={renderEmpty}
                    show={showOptions}
                />
            </div>
        );
    }
}

export default FaramElement('input')(MultiSelectInput);
