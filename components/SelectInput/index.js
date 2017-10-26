import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

// import FloatingContainer from '../FloatingContainer';
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
            key: PropTypes.string,
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
};

const defaultProps = {
    className: '',
    keySelector: d => d.key,
    labelSelector: d => d.label,
    multiple: false,
    options: [],
    placeholder: 'Select an option',
    selectedOptionKey: undefined,
    onChange: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class SelectInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            selectedOptionKey,
            options,
            keySelector,
            labelSelector,
        } = this.props;

        const selectedOption = options.find(d => keySelector(d) === selectedOptionKey) || {};

        this.state = {
            showOptions: false,
            inputValue: labelSelector(selectedOption) || '',
            displayOptions: this.props.options,
            optionContainerStyle: {},
            selectedOption,
            selectedOptions: [],
            markedOption: {},
        };

        this.boundingClientRect = {};
    }

    componentWillReceiveProps(nextProps) {
        const {
            keySelector,
            options,
            selectedOptionKey,
        } = nextProps;

        if (nextProps.selectedOptionKey) {
            const selectedOption = options.find(d => keySelector(d) === selectedOptionKey) || {};

            this.setState({
                selectedOption,
            });
        }
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

    value = () => (this.getValue())

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

    handleOptionClick = (key) => {
        const {
            keySelector,
            labelSelector,
            multiple,
            onChange,
        } = this.props;


        if (multiple) {
            // Multi select input
            this.input.focus();

            if (onChange) {
                onChange();
            }
        } else {
            // Single select input
            const prevOptionKey = keySelector(this.state.selectedOption);
            const selectedOption = this.props.options.find(d => keySelector(d) === key);

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
                    labelSelector,
                    multiple,
                } = this.props;

                let newState = {};
                const { inputValue } = this.state;

                if (!multiple) {
                    // validate input text
                    const option = this.props.options.find(d => labelSelector(d) === inputValue);

                    if (!option || option.key !== this.state.selectedOption.key) {
                        newState = {
                            inputValue: '',
                            displayOptions: this.props.options, // reset the filter
                            selectedOption: {},
                            markedOption: {},
                        };
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
            selectedOption, // for single select input 
            selectedOptions, // for multi select input
            showOptions,
        } = this.state;

        const {
            multiple,
            keySelector,
            labelSelector,
            placeholder,
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

        return (
            <div
                styleName={`select-input ${this.state.showOptions ? 'options-shown' : ''}`}
                className={this.props.className}
                ref={(el) => { this.container = el; }}
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
                <Options
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    onBlur={this.handleOptionsBlur}
                    onOptionClick={this.handleOptionClick}
                    options={displayOptions}
                    parentClientRect={this.boundingClientRect}
                    selectedOptionKey={keySelector(selectedOption)}
                    show={showOptions}
                />
            </div>
        );
    }
}
