import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import FloatingContainer from '../FloatingContainer';
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

/*
const isOption = (child) => {
    console.log(child.id);
    let parentNode = child.parentNode;
    let isParent = false;

    while (parentNode) {
        if (parentNode.id === 'options-container') {
            isParent = true;
            break;
        }

        parentNode = parentNode.parentNode;
        console.log(parentNode);
    }

    return isParent;
};
*/

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

        // this.selectedOptions = [];
        this.boundingClientRect = {};
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('click', this.handleMouseDown);
        window.addEventListener('scroll', this.handleScroll);
        document.addEventListener('keydown', this.handleKeyPress);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('click', this.handleMouseDown);
        window.removeEventListener('scroll', this.handleScroll);
        document.removeEventListener('keydown', this.handleKeyPress);
    }

    getDimension = () => {
        const cr = this.container.getBoundingClientRect();
        this.boundingClientRect = cr;

        return {
            optionContainerStyle: {
                left: `${cr.left}px`,
                top: `${(cr.top + window.scrollY) + cr.height}px`,
                width: `${cr.width}px`,
            },
        };
    };

    // rates the string for content
    getRating = (str, content) => (
        str.toLowerCase().indexOf(content.toLowerCase())
    )

    getValue = () => {
        const {
            keySelector,
        } = this.props;

        if (this.props.multiple) {
            const values = this.state.selectedValues.map(d => keySelector(d));
            return values;
        }

        return this.state.selectedValue;
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


    handleDynamicStyleOverride = (optionContainer) => {
        const optionRect = optionContainer.getBoundingClientRect();
        const cr = this.boundingClientRect;

        const pageOffset = window.innerHeight;
        const containerOffset = cr.top + optionRect.height + cr.height;

        const newStyle = {
        };

        if (pageOffset < containerOffset) {
            newStyle.top = `${(cr.top + window.scrollY) - optionRect.height}px`;
        }

        return newStyle;
    }

    markNextOption = () => {
        const {
            keySelector,
        } = this.props;

        const {
            displayOptions,
            markedOption,
        } = this.state;

        const currentlyMarkedElementIndex = displayOptions.findIndex(
            d => keySelector(d) === keySelector(markedOption),
        );

        if (currentlyMarkedElementIndex < (displayOptions.length - 1)) {
            this.setState({
                markedOption: displayOptions[currentlyMarkedElementIndex + 1],
            });
        }
    }

    markPreviousOption = () => {
        const {
            keySelector,
        } = this.props;

        const {
            displayOptions,
            markedOption,
        } = this.state;

        const currentlyMarkedElementIndex = displayOptions.findIndex(
            d => keySelector(d) === keySelector(markedOption),
        );

        if (currentlyMarkedElementIndex > 0) {
            this.setState({
                markedOption: displayOptions[currentlyMarkedElementIndex - 1],
            });
        }
    }

    selectMarkedOption = () => {
        const {
            keySelector,
        } = this.props;

        const {
            markedOption,
            selectedOptions,
        } = this.state;

        if (keySelector(markedOption)) {
            if (this.props.multiple) {
                const index = selectedOptions.findIndex(
                    d => keySelector(d) === keySelector(markedOption),
                );
                this.handleOptionClick(keySelector(markedOption), !(index > -1));
            } else {
                this.handleOptionClick(keySelector(markedOption));
            }
        }
    }

    handleKeyPress = (e) => {
        if (this.state.showOptions) {
            switch (e.code) {
                case 'ArrowDown':
                    this.markNextOption();
                    break;
                case 'ArrowUp':
                    this.markPreviousOption();
                    break;
                case 'Enter':
                    this.selectMarkedOption();
                    break;
                default:
                    break;
            }
        }
        return false;
    }

    handleScroll = () => {
        if (this.state.showOptions) {
            const newState = this.getDimension();
            this.setState(newState);
        }
    }

    handleResize = () => {
        const newState = this.getDimension();
        this.setState(newState);
    };

    handleMouseDown = (e) => {
        if (
            e.target === this.container
            || this.container.contains(e.target)
        ) {
            this.mouseDownOn = 'container';

            const newState = this.getDimension();

            // show options
            this.setState({ ...newState, showOptions: true });
        } else if (
            this.optionsContainer.container && (
                e.target === this.optionsContainer.container
                || this.optionsContainer.container.contains(e.target)
            )
        ) {
            this.mouseDownOn = 'options';
            // NOTE: don't close options here
        } else {
            this.mouseDownOn = 'outside';
            this.close();
        }
    };

    // filtering
    handleInputChange = (e) => {
        // Calculate only once when clicked
        let newState = {};
        if (!this.state.optionContainerStyle.width) {
            newState = this.getDimension();
        }

        const {
            labelSelector,
        } = this.props;

        const { value } = e.target;

        const options = this.props.options.filter(option => (
            labelSelector(option).toLowerCase().includes(value.toLowerCase())
        ));

        options.sort((a, b) => (
            this.getRating(a.label, value) - this.getRating(b.label, value)
        ));


        this.setState({
            ...newState,
            inputValue: value,
            displayOptions: options,
            showOptions: true,
        });
    }

    // called by floating container when it is closed
    handleOptionClosed = () => {
        this.close();
    }

    handleOptionClick = (key, checked) => {
        const {
            keySelector,
            labelSelector,
            onChange,
        } = this.props;

        const option = this.props.options.find(d => keySelector(d) === key);

        if (this.props.multiple) {
            const selectedOptions = [...this.state.selectedOptions];

            if (checked) {
                selectedOptions.push(option);
            } else {
                const index = selectedOptions.findIndex(d => keySelector(d) === key);

                if (index !== -1) {
                    selectedOptions.splice(index, 1);
                }
            }

            this.setState({
                showOptions: true,
                selectedOptions,
            });

            // this.selectedOptions = selectedOptions;
        } else {
            this.setState({
                showOptions: false,
                inputValue: labelSelector(option),
                displayOptions: this.props.options, // reset the filter on click
                selectedOption: option,
            });
        }

        this.input.focus();
        if (key !== keySelector(this.state.selectedOption) && onChange) {
            onChange(key);
        }
    }

    // close gracefully
    close = () => {
        const {
            labelSelector,
        } = this.props;

        let newState = {};
        const { inputValue } = this.state;

        const option = this.props.options.find(d => labelSelector(d) === inputValue);

        if (!option) {
            newState = {
                inputValue: '',
                displayOptions: this.props.options, // reset the filter
                selectedOption: {},
                markedOption: {},
            };
        }
        // close options
        this.setState({ ...newState, showOptions: false });
    }


    render() {
        const { selectedOptions } = this.state;
        let placeholder = '';

        if (this.props.multiple) {
            if (selectedOptions.length > 0) {
                placeholder = `${selectedOptions.length} selected`;
            } else {
                placeholder = this.props.placeholder;
            }
        } else {
            placeholder = this.props.placeholder;
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
                    placeholder={placeholder}
                />
                <span
                    styleName="dropdown-icon"
                    className="ion-android-arrow-dropdown"
                />
                <FloatingContainer
                    ref={(el) => { this.optionsContainer = el; }}
                    show={this.state.showOptions}
                    onClose={this.handleOptionClosed}
                    containerId="options-container"
                    styleName="options"
                    styleOverride={this.state.optionContainerStyle}
                    onDynamicStyleOverride={this.handleDynamicStyleOverride}
                    closeOnTab
                >
                    { this.getOptions() }
                    {
                        this.state.displayOptions.length <= 0 &&
                            <div styleName="empty">
                                No option available
                            </div>
                    }
                </FloatingContainer>
            </div>
        );
    }
}
