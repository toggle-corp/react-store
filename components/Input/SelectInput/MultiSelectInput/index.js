import React from 'react';

import { iconNames } from '../../../../constants';

import styles from './styles.scss';
import {
    emptyList,
    multiSelectInputPropTypes,
    multiSelectInputDefaultProps,
} from '../propTypes';

import {
    getClassName,
    getOptionClassName,
    renderLabel,
    renderOptions,
    renderHintAndError,
    isOptionActive,
    handleInputValueChange,
    getOptionsContainerPosition,
    handleInputClick,
    renderClearButton,
} from '../utils';

export default class MultiSelectInput extends React.PureComponent {
    static propTypes = multiSelectInputPropTypes;
    static defaultProps = multiSelectInputDefaultProps;

    constructor(props) {
        super(props);

        this.state = {
            isFocused: false,
            inputValue: '',
            placeholder: this.getInputPlaceholder(props),
            displayOptions: props.options,
        };
    }

    componentWillReceiveProps(nextProps) {
        const {
            value: oldValue,
            placeholder: oldPlaceholder,
        } = this.props;

        if (nextProps.value !== oldValue || nextProps.placeholder !== oldPlaceholder) {
            this.setState({
                placeholder: this.getInputPlaceholder(nextProps),
            });
        }
    }

    getValue = () => this.props.value

    getInputPlaceholder = (props) => {
        const {
            value,
            placeholder,
        } = props;

        if (value.length > 0) {
            return `${value.length} selected`;
        }

        return placeholder;
    }

    handleInputChange = (e) => { handleInputValueChange(this, e.target.value); }

    handleOptionContainerInvalidate = optionsContainer => (
        getOptionsContainerPosition(this, optionsContainer)
    )

    handleOptionContainerBlur = () => {
        const {
            options,
        } = this.props;

        this.setState({
            showOptions: false,
            displayOptions: options,
            inputValue: '',
            placeholder: this.getInputPlaceholder(this.props),
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

    renderInput = () => {
        const { disabled } = this.props;
        const {
            inputValue,
            placeholder,
        } = this.state;

        return (
            <input
                className={`input ${styles.input}`}
                disabled={disabled}
                onChange={this.handleInputChange}
                onClick={() => { handleInputClick(this); }}
                placeholder={placeholder}
                ref={(el) => { this.input = el; }}
                type="text"
                value={inputValue}
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
        const showSelectAllButton = !(
            hideSelectAllButton || disabled || value.length === options.length
        );

        if (!showSelectAllButton) {
            return null;
        }

        return (
            <button
                className={`select-all-button ${styles['select-all-button']}`}
                onClick={this.handleSelectAllButtonClick}
                title="Select all options"
                disabled={this.props.disabled}
                type="button"
            >
                <span className={iconNames.checkAll} />
            </button>
        );
    }

    renderActions = () => {
        const {
            disabled,
            value,
            hideClearButton,
        } = this.props;
        const showClearButton = !(hideClearButton || disabled || value.length === 0);
        const ClearButton = renderClearButton;
        const SelectAllButton = this.renderSelectAllButton;

        return (
            <div className={`actions ${styles.actions}`}>
                <SelectAllButton />
                <ClearButton
                    show={showClearButton}
                    styles={styles}
                    parent={this}
                />
                <span className={`dropdown-icon ${styles['dropdown-icon']} ${iconNames.arrowDropdown}`} />
            </div>
        );
    }

    renderCheckbox = (p) => {
        const { active } = p;
        const classNames = ['checkbox', styles.checkbox];

        if (active) {
            classNames.push(iconNames.checkbox);
        } else {
            classNames.push(iconNames.checkboxOutlineBlank);
        }

        return <span className={classNames.join(' ')} />;
    }

    renderOption = (p) => {
        const {
            labelSelector,
            keySelector,
            value,
        } = this.props;
        const { option } = p;
        const key = keySelector(option);
        const active = isOptionActive(key, value);
        const Checkbox = this.renderCheckbox;

        return (
            <button
                className={getOptionClassName(styles, active)}
                onClick={() => { this.handleOptionClick(key); }}
            >
                <Checkbox active={active} />
                { labelSelector(option) }
            </button>
        );
    }

    render() {
        const className = getClassName(styles, 'multi-select-input', this.state, this.props);
        const Label = renderLabel;
        const Input = this.renderInput;
        const Actions = this.renderActions;
        const Options = renderOptions;
        const HintAndError = renderHintAndError;

        return (
            <div
                ref={(el) => { this.container = el; }}
                className={className}
            >
                <Label
                    styles={styles}
                    {...this.props}
                />
                <div className={`input-wrapper ${styles['input-wrapper']}`}>
                    <Input />
                    <Actions />
                </div>
                <HintAndError
                    styles={styles}
                    {...this.props}
                />
                <Options
                    parent={this}
                    styles={styles}
                />
            </div>
        );
    }
}
