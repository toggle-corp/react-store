import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import Options from './Options';
import Option from './Option';
import styles from './styles.scss';

import { iconNames } from '../../../constants';

const propTypes = {
    /**
     * for styling
     */
    className: PropTypes.string,

    /**
     * Is select input clearable?
     */
    clearable: PropTypes.bool,

    /**
     * Is select input disabled?
     */
    disabled: PropTypes.bool,

    /**
     * Key selector function
     * should return key from provided row data
     */
    keySelector: PropTypes.func,

    /**
     * Value selector function
     * should return value from provided row data
     */
    labelSelector: PropTypes.func,

    /**
     * Multiple selection
     */
    multiple: PropTypes.bool,

    onChange: PropTypes.func,

    /**
     * Options to be shown
     */
    options: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number,
            ]),
            label: PropTypes.string,
        }),
    ),

    /**
     * Placeholder for the input
     */
    placeholder: PropTypes.string,

    /**
     * String to show in case of error
     */
    error: PropTypes.string,

    /**
     * Hint text
     */
    hint: PropTypes.string,

    /**
     * Input label
     */
    label: PropTypes.string,

    showLabel: PropTypes.bool,
    showHintAndError: PropTypes.bool,

    optionsIdentifier: PropTypes.string,

    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.arrayOf(
            PropTypes.string,
        ),
        PropTypes.arrayOf(
            PropTypes.number,
        ),
    ]),
};

const defaultProps = {
    className: '',
    clearable: true,
    disabled: false,
    error: '',
    hint: '',
    keySelector: d => d.key,
    label: '',
    labelSelector: d => d.label,
    multiple: false,
    onChange: undefined,
    options: [],
    optionsIdentifier: undefined,
    placeholder: 'Select an option',
    showHintAndError: true,
    showLabel: true,
    value: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class SelectInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            inputValue: '',
            areOptionsShown: false,
            displayOptions: this.props.options,
            optionContainerStyle: {},
            selectedOptions: [],
            markedOption: {},
            ...this.getOptionsFromProps(props),
        };

        this.boundingClientRect = {};
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            ...this.getOptionsFromProps(nextProps),
        });
    }

    getOptionsFromProps = (props) => {
        const {
            multiple,
            options,
            value,
        } = props;

        let selectedOptionKey;
        let selectedOptionKeys;

        if (multiple) {
            selectedOptionKeys = value || [];
        } else {
            selectedOptionKey = value;
        }

        let newState = {};

        if (multiple) {
            const selectedOptions = [];

            // Create selected options array from selected option keys
            selectedOptionKeys.forEach((key) => {
                const optionIndex = options.findIndex(d => this.keySelector(d) === key);

                if (optionIndex !== -1) {
                    selectedOptions.push(options[optionIndex]);
                } else {
                    console.warn(`SelectInput: option with key ${key} not found`);
                }
            });

            newState = {
                selectedOptionKeys,
                selectedOptions,
            };
        } else {
            const selectedOption = options.find(
                d => this.keySelector(d) === selectedOptionKey,
            );

            newState = {
                selectedOptionKey,
                selectedOption,
                inputValue: this.labelSelector(selectedOption),
            };
        }

        return newState;
    }


    // rates the string for content
    getRating = (str, content) => (
        str.toLowerCase().indexOf(content.toLowerCase())
    )

    getValue = () => {
        if (this.props.multiple) {
            const values = this.state.selectedOptions.map(d => this.keySelector(d));
            return values;
        }

        return this.keySelector(this.state.selectedOption);
    }

    getOptions = () => {
        let options;
        const { selectedOptions } = this.state;
        if (this.props.multiple) {
            options = this.state.displayOptions.map((option) => {
                const key = this.keySelector(option);

                return (
                    <Option
                        key={key}
                        marked={this.keySelector(this.state.markedOption) === key}
                        checkable
                        checked={selectedOptions.find(d => this.keySelector(d) === key) != null}
                        onClick={(checked) => {
                            this.handleOptionClick(key, checked);
                        }}
                    >
                        { this.labelSelector(option) }
                    </Option>
                );
            });
        } else {
            options = this.state.displayOptions.map((option) => {
                const key = this.keySelector(option);

                return (
                    <Option
                        key={key}
                        selected={this.keySelector(this.state.selectedOption) === key}
                        marked={this.keySelector(this.state.markedOption) === key}
                        onClick={() => {
                            this.handleOptionClick(key);
                        }}
                    >
                        { this.labelSelector(option) }
                    </Option>
                );
            });
        }

        return options;
    }

    getStyleName = () => {
        const styleNames = [];

        styleNames.push('select-input');

        const {
            areOptionsShown,
            isFocused,
        } = this.state;

        const {
            disabled,
        } = this.props;

        const {
            error,
            multiple,
        } = this.props;

        if (multiple) {
            styleNames.push('multiple');
        }

        if (disabled) {
            styleNames.push('disabled');
        }

        if (areOptionsShown) {
            styleNames.push('options-shown');
        }

        if (isFocused) {
            styleNames.push('focused');
        }

        if (error) {
            styleNames.push('error');
        }

        const { selectedOptions } = this.state;
        if (selectedOptions.length > 0) {
            styleNames.push('selected');
        }

        return styleNames.join(' ');
    }

    getPlaceholder = () => {
        const {
            multiple,
            placeholder,
        } = this.props;

        const { selectedOptions } = this.state;

        if (multiple && selectedOptions.length > 0) {
            return `${selectedOptions.length} selected`;
        }

        return placeholder;
    }

    // filtering
    handleInputChange = (e) => {
        const { value } = e.target;

        const options = this.props.options.filter(option => (
            this.labelSelector(option).toLowerCase().includes(value.toLowerCase())
        ));

        options.sort((a, b) => (
            this.getRating(this.labelSelector(a), value) -
            this.getRating(this.labelSelector(b), value)
        ));

        this.setState({
            inputValue: value,
            displayOptions: options,
            areOptionsShown: true,
        });
    }

    handleInputFocus = () => {
        if (!this.state.areOptionsShown) {
            this.input.select();
            this.boundingClientRect = this.container.getBoundingClientRect();
            this.setState({
                areOptionsShown: true,
                displayOptions: this.props.options, // reset the filter
            });
        }
    }

    handleInputClick = () => {
        if (!this.state.areOptionsShown) {
            this.input.select();
            this.boundingClientRect = this.container.getBoundingClientRect();
            this.setState({
                areOptionsShown: true,
                displayOptions: this.props.options, // reset the filter
            });
        }
    }

    handleOptionClick = (key, checked) => {
        const {
            multiple,
            onChange,
            options,
        } = this.props;


        if (multiple) {
            // Multi select input
            this.input.focus();
            const selectedOptions = [...this.state.selectedOptions];
            const option = this.props.options.find(d => this.keySelector(d) === key);

            if (checked) {
                selectedOptions.push(option);
            } else {
                const index = selectedOptions.findIndex(d => this.keySelector(d) === key);
                selectedOptions.splice(index, 1);
            }

            this.setState({
                selectedOptions,
                inputValue: '',
                areOptionsShown: true,
            });

            if (onChange) {
                const values = selectedOptions.map(d => this.keySelector(d));
                onChange(values);
            }
        } else {
            // Single select input
            const prevOptionKey = this.keySelector(this.state.selectedOption);
            const selectedOption = options.find(d => this.keySelector(d) === key);

            this.setState({
                selectedOption,
                inputValue: this.labelSelector(selectedOption),
                areOptionsShown: false,
            });

            if (onChange && key !== prevOptionKey) {
                onChange(key);
            }
        }
    }

    handleOptionsBlur = () => {
        // setTimeout is used to let document.activeElement
        // to be changed before test
        setTimeout(() => {
            // close options only if not focused on input
            if (document.activeElement !== this.input) {
                const {
                    multiple,
                    onChange,
                } = this.props;

                let newState = {};
                const { inputValue } = this.state;

                if (!multiple) {
                    // validate input text
                    const option = this.props.options.find(
                        d => this.labelSelector(d) === inputValue,
                    );

                    if (!option || (
                        this.keySelector(option) !== this.keySelector(this.state.selectedOption)
                    )) {
                        newState = {
                            inputValue: '',
                            displayOptions: this.props.options, // reset the filter
                            selectedOption: undefined,
                            markedOption: {},
                        };

                        if (onChange && this.keySelector(this.state.selectedOption)) {
                            onChange(undefined);
                        }
                    }
                }

                this.setState({
                    ...newState,
                    areOptionsShown: false,
                });
            }
        }, 0);
    }

    handleClearButtonClick = () => {
        const {
            multiple,
            onChange,
        } = this.props;

        const {
            selectedOptions: prevSelectedOptions,
            selectedOption: prevSelectedOption,
        } = this.state;

        this.setState({
            selectedOptionKey: undefined,
            selectedOption: undefined,
            selectedOptions: [],
            inputValue: '',
        });

        if (multiple) {
            if (onChange && prevSelectedOptions.length !== 0) {
                onChange([]);
            }
        } else if (onChange && Object.keys(prevSelectedOption).length !== 0) {
            onChange(undefined);
        }
    }

    keySelector = (selectedOption) => {
        if (!selectedOption) {
            return undefined;
        }
        return this.props.keySelector(selectedOption);
    }

    labelSelector = (selectedOption) => {
        if (!selectedOption) {
            return '';
        }
        return this.props.labelSelector(selectedOption);
    }

    render() {
        const {
            displayOptions,
            inputValue,
            selectedOption,
            selectedOptions, // for multi select input
            areOptionsShown,
        } = this.state;

        const {
            className,
            clearable,
            disabled,
            multiple,
            error,
            hint,
            label,
            showLabel,
            showHintAndError,
        } = this.props;

        const selectedOptionKey = this.keySelector(selectedOption);
        const selectedOptionKeys = selectedOptions.map(d => this.keySelector(d));

        const placeholder = this.getPlaceholder();
        const styleName = this.getStyleName();

        const hideClearButton = multiple
            ? this.state.selectedOptions.length <= 0
            : !this.state.selectedOption;
        return (
            <div
                className={`${styleName} ${className}`}
                ref={(el) => { this.container = el; }}
                styleName={styleName}
            >
                {
                    showLabel && (
                        <label
                            htmlFor={this.inputId}
                            styleName="label"
                        >
                            {label}
                        </label>
                    )
                }
                <div
                    className="input-wrapper"
                    styleName="input-wrapper"
                >
                    <input
                        className="input"
                        onChange={this.handleInputChange}
                        onClick={this.handleInputClick}
                        placeholder={placeholder}
                        ref={(el) => { this.input = el; }}
                        styleName="input"
                        type="text"
                        value={inputValue}
                        disabled={disabled}
                    />
                    <div
                        styleName="actions"
                        className="actions"
                    >
                        {
                            clearable && !disabled && !hideClearButton && (
                                <button
                                    className="clear-button"
                                    onClick={this.handleClearButtonClick}
                                    styleName="clear-button"
                                    title="Clear selected option(s)"
                                    disabled={disabled}
                                    type="button"
                                >
                                    <span
                                        className={`clear-icon ${iconNames.close}`}
                                    />
                                </button>
                            )
                        }
                        <span
                            styleName="dropdown-icon"
                            className={`dropdown-icon ${iconNames.arrowDropdown}`}
                        />
                    </div>
                </div>
                {
                    showHintAndError && [
                        !error && hint && (
                            <p
                                key="hint"
                                className="hint"
                                styleName="hint"
                            >
                                {hint}
                            </p>
                        ),
                        error && !hint && (
                            <p
                                key="error"
                                styleName="error"
                                className="error"
                            >
                                {error}
                            </p>
                        ),
                        !error && !hint && (
                            <p
                                key="empty"
                                styleName="empty"
                                className="error empty"
                            >
                                -
                            </p>
                        ),
                    ]
                }
                <Options
                    keySelector={this.keySelector}
                    labelSelector={this.labelSelector}
                    onBlur={this.handleOptionsBlur}
                    onOptionClick={this.handleOptionClick}
                    options={displayOptions}
                    parentClientRect={this.boundingClientRect}
                    selectedOptionKey={selectedOptionKey}
                    selectedOptionKeys={selectedOptionKeys}
                    show={areOptionsShown}
                    multiple={multiple}
                    offsetBottom={showHintAndError ? 24 : 0}
                    identifier={this.props.optionsIdentifier}
                />
            </div>
        );
    }
}
