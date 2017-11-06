import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import Options from './Options';
import Option from './Option';
import styles from './styles.scss';

const propTypes = {
    /**
     * for styling
     */
    className: PropTypes.string,

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

    selectedOptionKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),

    selectedOptionKeys: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
    ),

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
};

const defaultProps = {
    className: '',
    error: '',
    hint: '',
    label: '',
    keySelector: d => (d || {}).key,
    labelSelector: d => (d || {}).label,
    multiple: false,
    options: [],
    placeholder: 'Select an option',
    selectedOptionKey: undefined,
    selectedOptionKeys: [],
    onChange: undefined,
    showLabel: false,
    showHintAndError: false,
};

@CSSModules(styles, { allowMultiple: true })
export default class SelectInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showOptions: false,
            inputValue: '',
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
            keySelector,
            labelSelector,
            multiple,
            options,
            selectedOptionKey,
            selectedOptionKeys,
        } = props;

        let newState = {};

        if (multiple) {
            const selectedOptions = [];
            selectedOptionKeys.forEach((key) => {
                const optionIndex = options.findIndex(d => keySelector(d) === key);

                if (optionIndex !== -1) {
                    selectedOptions.push(options[optionIndex]);
                }
            });

            if (props.selectedOptionKeys) {
                newState = {
                    selectedOptionKeys,
                    selectedOptions,
                };
            }
        } else if (props.selectedOptionKey) {
            const selectedOption = options.find(
                d => keySelector(d) === selectedOptionKey,
            ) || {};

            newState = {
                selectedOptionKey,
                selectedOption,
                inputValue: labelSelector(selectedOption) || '',
            };
        }

        return newState;
    }


    // rates the string for content
    getRating = (str, content) => (
        str.toLowerCase().indexOf(content.toLowerCase())
    )

    getValue = () => {
        const {
            keySelector,
        } = this.props;

        if (this.props.multiple) {
            const values = this.state.selectedOptions.map(d => keySelector(d));
            return values;
        }

        return keySelector(this.state.selectedOption);
    }

    getOptions = () => {
        let options;
        const { selectedOptions } = this.state;
        const {
            keySelector,
            labelSelector,
        } = this.props;

        if (this.props.multiple) {
            options = this.state.displayOptions.map((option) => {
                const key = keySelector(option);

                return (
                    <Option
                        key={key}
                        marked={keySelector(this.state.markedOption) === key}
                        checkable
                        checked={selectedOptions.find(d => keySelector(d) === key) != null}
                        onClick={(checked) => {
                            this.handleOptionClick(key, checked);
                        }}
                    >
                        { labelSelector(option) }
                    </Option>
                );
            });
        } else {
            options = this.state.displayOptions.map((option) => {
                const key = keySelector(option);

                return (
                    <Option
                        key={key}
                        selected={keySelector(this.state.selectedOption) === key}
                        marked={keySelector(this.state.markedOption) === key}
                        onClick={() => {
                            this.handleOptionClick(key);
                        }}
                    >
                        { labelSelector(option) }
                    </Option>
                );
            });
        }

        return options;
    }

    // filtering
    handleInputChange = (e) => {
        const {
            labelSelector,
        } = this.props;

        const { value } = e.target;

        const options = this.props.options.filter(option => (
            labelSelector(option).toLowerCase().includes(value.toLowerCase())
        ));

        options.sort((a, b) => (
            this.getRating(labelSelector(a), value) - this.getRating(labelSelector(b), value)
        ));

        this.setState({
            inputValue: value,
            displayOptions: options,
            showOptions: true,
        });
    }

    handleInputFocus = () => {
        if (!this.state.showOptions) {
            this.input.select();
            this.boundingClientRect = this.container.getBoundingClientRect();
            this.setState({
                showOptions: true,
                displayOptions: this.props.options, // reset the filter
            });
        }
    }

    handleInputClick = () => {
        if (!this.state.showOptions) {
            this.input.select();
            this.boundingClientRect = this.container.getBoundingClientRect();
            this.setState({
                showOptions: true,
                displayOptions: this.props.options, // reset the filter
            });
        }
    }

    handleOptionClick = (key, checked) => {
        const {
            keySelector,
            labelSelector,
            multiple,
            onChange,
            options,
        } = this.props;


        if (multiple) {
            // Multi select input
            this.input.focus();
            const selectedOptions = [...this.state.selectedOptions];
            const option = this.props.options.find(d => keySelector(d) === key);

            if (checked) {
                selectedOptions.push(option);
            } else {
                const index = selectedOptions.findIndex(d => keySelector(d) === key);
                selectedOptions.splice(index, 1);
            }

            this.setState({
                selectedOptions,
                inputValue: '',
                showOptions: true,
            });

            if (onChange) {
                const values = selectedOptions.map(d => keySelector(d));
                onChange(values);
            }
        } else {
            // Single select input
            const prevOptionKey = keySelector(this.state.selectedOption);
            const selectedOption = options.find(d => keySelector(d) === key);

            this.setState({
                selectedOption,
                inputValue: labelSelector(selectedOption),
                showOptions: false,
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
                    keySelector,
                    labelSelector,
                    multiple,
                    onChange,
                } = this.props;

                let newState = {};
                const { inputValue } = this.state;

                if (!multiple) {
                    // validate input text
                    const option = this.props.options.find(d => labelSelector(d) === inputValue);

                    if (!option || (
                        keySelector(option) !== keySelector(this.state.selectedOption)
                    )) {
                        newState = {
                            inputValue: '',
                            displayOptions: this.props.options, // reset the filter
                            selectedOption: {},
                            markedOption: {},
                        };

                        if (onChange && keySelector(this.state.selectedOption)) {
                            onChange('');
                        }
                    }
                }

                this.setState({
                    ...newState,
                    showOptions: false,
                });
            }
        }, 0);
    }

    render() {
        const {
            displayOptions,
            selectedOption,
            selectedOptions, // for multi select input
            showOptions,
        } = this.state;

        const {
            multiple,
            keySelector,
            labelSelector,
            placeholder,
            error,
            hint,
            label,
            showLabel,
            showHintAndError,
        } = this.props;

        let ph = '';

        if (multiple) {
            if (selectedOptions.length > 0) {
                ph = `${selectedOptions.length} selected`;
            } else {
                ph = placeholder;
            }
        } else {
            ph = placeholder;
        }

        const selectedOptionKey = keySelector(selectedOption);
        const selectedOptionKeys = selectedOptions.map(d => keySelector(d));

        return (
            <div
                styleName={`select-input ${this.state.showOptions ? 'options-shown' : ''}`}
                className={this.props.className}
                ref={(el) => { this.container = el; }}
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
                    styleName="input-wrapper"
                >
                    <input
                        ref={(el) => { this.input = el; }}
                        styleName="input"
                        type="text"
                        value={this.state.inputValue}
                        onChange={this.handleInputChange}
                        onClick={this.handleInputClick}
                        placeholder={ph}
                    />
                    <span
                        styleName="dropdown-icon"
                        className="ion-android-arrow-dropdown"
                    />
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
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    onBlur={this.handleOptionsBlur}
                    onOptionClick={this.handleOptionClick}
                    options={displayOptions}
                    parentClientRect={this.boundingClientRect}
                    selectedOptionKey={selectedOptionKey}
                    selectedOptionKeys={selectedOptionKeys}
                    show={showOptions}
                    multiple={multiple}
                    offsetBottom={showHintAndError ? 24 : 0}
                />
            </div>
        );
    }
}
