import CSSModules from 'react-css-modules';
import React from 'react';

import FloatingContainer from '../FloatingContainer';
import Option from './Option';
import styles from './styles.scss';

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
        };

        this.optionContainerStyle = {};
    }

    // rates the string for content

    componentDidMount() {
        setTimeout(() => {
            const cr = this.container.getBoundingClientRect();
            this.optionContainerStyle = {
                left: `${cr.left}px`,
                top: `${cr.top + cr.height}px`,
                width: `${cr.width}px`,
            };
        }, 0);
    }

    rate = (str, content) => (
        str.toLowerCase().indexOf(content.toLowerCase())
    )

    handleInputChange = (e) => {
        const { value } = e.target;

        const options = this.options.filter(option => (
            option.label.toLowerCase().includes(value.toLowerCase())
        ));

        options.sort((a, b) => (
            this.rate(a.label, value) - this.rate(b.label, value)
        ));

        this.setState({
            inputValue: value,
            displayOptions: options,
        });
    }

    handleInputClick = () => {
        this.setState({ showOptions: true });
    }

    handleInputBlur = () => {
        /*
        const {
            inputValue,
        } = this.state;

        if (
            !this.selectedOption
            || (this.selectedOption
                && inputValue !== this.selectedOption.label
            )
        ) {
            const option = this.options.find(d => d.label === inputValue);

            if (option) {
                this.selectedOption = option;
                this.setState({
                    inputValue: option.label,
                });
            } else {
                this.setState({
                    inputValue: this.selectedOption.label,
                });
            }
        }
        */
    }

    handleOptionClosed = () => {
        this.setState({
            showOptions: false,
        });
    }

    handleOptionClick = (key) => {
        const option = this.options.find(d => d.key === key);

        this.setState({
            showOptions: false,
            inputValue: option.label,
        });

        this.selectedOption = option;
    }

    render() {
        return (
            <div
                styleName="select-input"
                ref={(el) => { this.container = el; }}
            >
                <input
                    styleName="input"
                    type="text"
                    value={this.state.inputValue}
                    onChange={this.handleInputChange}
                    onClick={this.handleInputClick}
                    onBlur={this.handleInputBlur}
                />
                <FloatingContainer
                    show={this.state.showOptions}
                    onClose={this.handleOptionClosed}
                    containerId="options-container"
                    styleName="options"
                    styleOverride={this.optionContainerStyle}
                    closeOnBlur
                >
                    {
                        this.state.displayOptions.map(option => (
                            <Option
                                key={option.key}
                                onClick={() => {
                                    this.handleOptionClick(option.key);
                                }}
                            >
                                { option.label }
                            </Option>
                        ))
                    }
                </FloatingContainer>
            </div>
        );
    }
}
