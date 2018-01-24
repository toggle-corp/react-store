import React from 'react';

import { iconNames } from '../../../../constants';

import Option from './Option';
import Options from '../Options';
import styles from './styles.scss';
import {
    emptyList,
    multiSelectInputPropTypes,
    multiSelectInputDefaultProps,
} from '../propTypes';

import {
    getClassName,
    renderLabel,
    renderHintAndError,
    handleInputValueChange,
    getOptionsContainerPosition,
    handleInputClick,
    renderClearButton,
    filterAndSortOptions,
} from '../utils';

import {
    listToMap,
} from '../../../../utils/common';

export default class MultiSelectInput extends React.PureComponent {
    static propTypes = multiSelectInputPropTypes;
    static defaultProps = multiSelectInputDefaultProps;

    constructor(props) {
        super(props);

        this.state = {
            inputValue: '',
            placeholder: this.getInputPlaceholder(props),
            displayOptions: props.options,
        };
    }

    componentWillMount() {
        const result = this.validateValue(this.props);
        if (!result.valid) {
            this.props.onChange(result.value);
        }
    }

    componentDidMount() {
        if (this.container) {
            this.boundingClientRect = this.container.getBoundingClientRect();
        } else {
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
        const arePlaceholdersEqual = nextProps.placeholder === oldPlaceholder;
        const areOptionsEqual = nextProps.options === oldOptions;

        if (!(areValuesEqual && arePlaceholdersEqual)) {
            this.setState({
                placeholder: this.getInputPlaceholder(nextProps),
            });
        }

        if (!areOptionsEqual) {
            const {
                labelSelector,
                options,
            } = nextProps;

            const { inputValue } = this.state;
            const displayOptions = filterAndSortOptions(options, inputValue, labelSelector);
            this.setState({ displayOptions });
        }

        if (!(areValuesEqual && areOptionsEqual)) {
            const result = this.validateValue(nextProps);

            if (!result.valid) {
                nextProps.onChange(result.value);
            }
        }
    }

    getValue = () => this.props.value

    getInputPlaceholder = (props) => {
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
    }

    validateValue = (prop) => {
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


    render() {
        const className = getClassName(styles, 'multi-select-input', this.state, this.props);
        const Label = renderLabel;
        const Input = this.renderInput;
        const Actions = this.renderActions;
        const HintAndError = renderHintAndError;

        const {
            labelSelector,
            keySelector,
            renderEmpty,
            optionsClassName,
            value,
        } = this.props;

        const {
            displayOptions,
            showOptions,
        } = this.state;

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
                    labelSelector={labelSelector}
                    keySelector={keySelector}
                    renderEmpty={renderEmpty}
                    optionsClassName={optionsClassName}
                    options={displayOptions}
                    show={showOptions}
                    renderOption={Option}
                    onOptionClick={this.handleOptionClick}
                    onBlur={this.handleOptionContainerBlur}
                    onInvalidate={this.handleOptionContainerInvalidate}
                    parentContainer={this.container}
                    value={value}
                />
            </div>
        );
    }
}
