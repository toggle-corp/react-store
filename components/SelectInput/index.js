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
};

const defaultProps = {
    className: '',
    options: [],
    placeholder: 'Select an option',
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
            selectedOption: {},
            markedOption: {},
        };

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
            displayOptions,
            markedOption,
        } = this.state;

        const currentlyMarkedElementIndex = displayOptions.findIndex(
            d => d.key === markedOption.key,
        );

        if (currentlyMarkedElementIndex < (displayOptions.length - 1)) {
            this.setState({
                markedOption: displayOptions[currentlyMarkedElementIndex + 1],
            });
        }
    }

    markPreviousOption = () => {
        const {
            displayOptions,
            markedOption,
        } = this.state;

        const currentlyMarkedElementIndex = displayOptions.findIndex(
            d => d.key === markedOption.key,
        );

        if (currentlyMarkedElementIndex > 0) {
            this.setState({
                markedOption: displayOptions[currentlyMarkedElementIndex - 1],
            });
        }
    }

    selectMarkedOption = () => {
        this.handleOptionClick(this.state.markedOption.key);
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

            // Calculate only once when clicked
            const newState = this.getDimension();

            // show options
            this.setState({ ...newState, showOptions: true });
        } else if (
            this.state.showOptions && (
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

        const { value } = e.target;

        const options = this.props.options.filter(option => (
            option.label.toLowerCase().includes(value.toLowerCase())
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

    handleOptionClick = (key) => {
        const option = this.props.options.find(d => d.key === key);

        this.setState({
            showOptions: false,
            inputValue: option.label,
            displayOptions: this.props.options, // reset the filter on click
            selectedOption: option,
        });


        this.input.focus();
    }

    // close gracefully
    close = () => {
        let newState = {};
        const { inputValue } = this.state;
        const option = this.props.options.find(d => d.label === inputValue);
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
                    placeholder={this.props.placeholder}
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
                    {
                        this.state.displayOptions.map(option => (
                            <Option
                                key={option.key}
                                selected={this.state.selectedOption.key === option.key}
                                marked={this.state.markedOption.key === option.key}
                                onClick={() => {
                                    this.handleOptionClick(option.key);
                                }}
                            >
                                { option.label }
                            </Option>
                        ))
                    }
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
