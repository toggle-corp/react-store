import CSSModules from 'react-css-modules';
import React from 'react';

import FloatingContainer from '../FloatingContainer';
import Option from './Option';
import styles from './styles.scss';

// TODO:
// 1. Keyboard aware
// 2. Discard if there is no match (DONE)
// 3. Show no match (DONE)
// 4. Open dropdown on focus (REJECTED)
// 5. Retain focus on selection (DONE)
// 6. Update on layout change (DONE)
// 7. Update on scroll (NO_NEED)
// 8. Dropdown symbol on right for text input
// 9. Up or down position of option container (DONE)

@CSSModules(styles, { allowMultiple: true })
export default class SelectInput extends React.PureComponent {
    constructor(props) {
        super(props);

        this.options = [
            { key: 'opt-1', label: 'Pineapple' },
            { key: 'opt-2', label: 'Orange' },
            { key: 'opt-3', label: 'Apple' },
            { key: 'opt-4', label: 'Guava' },
            { key: 'opt-5', label: 'Banana' },
            { key: 'opt-6', label: 'Lemon' },
            { key: 'opt-7', label: 'Pear' },
            { key: 'opt-8', label: 'Melon' },
            { key: 'opt-9', label: 'Strawberry' },
            { key: 'opt-10', label: 'Mango' },
            { key: 'opt-11', label: 'Raspberry' },
            { key: 'opt-12', label: 'Grape' },
            { key: 'opt-13', label: 'Gooseberry' },
            { key: 'opt-14', label: 'Coconut' },
            { key: 'opt-15', label: 'Blackberry' },
        ];

        this.state = {
            showOptions: false,
            inputValue: '',
            displayOptions: this.options,
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

    handleKeyPress = (e) => {
        if (this.state.showOptions) {
            switch (e.code) {
                case 'ArrowDown':
                    this.markNextOption();
                    break;
                case 'ArrowUp':
                    this.markPreviousOption();
                    break;
                default:
                    break;
            }
        }
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

        const options = this.options.filter(option => (
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
        const option = this.options.find(d => d.key === key);

        this.setState({
            showOptions: false,
            inputValue: option.label,
            displayOptions: this.options, // reset the filter on click
            selectedOption: option,
        });


        this.input.focus();
    }

    // close gracefully
    close = () => {
        let newState = {};
        const { inputValue } = this.state;
        const option = this.options.find(d => d.label === inputValue);
        if (!option) {
            newState = {
                inputValue: '',
                displayOptions: this.options, // reset the filter
            };
        }
        // close options
        this.setState({ ...newState, showOptions: false });
    }


    render() {
        return (
            <div
                styleName="select-input"
                ref={(el) => { this.container = el; }}
            >
                <input
                    ref={(el) => { this.input = el; }}
                    styleName="input"
                    type="text"
                    value={this.state.inputValue}
                    onChange={this.handleInputChange}
                    placeholder="Select a fruit"
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
