import PropTypes from 'prop-types';
import React from 'react';

import ListView from '../../View/List/ListView';
import { FaramInputElement } from '../../General/FaramElements';

import Option from './Option';
import styles from './styles.scss';

const propTypes = {
    /**
     * required for style override
     */
    className: PropTypes.string,

    /**
     * unique name for the radio input
     */
    name: PropTypes.string.isRequired,

    /**
     * list of options
     */
    options: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string,
            label: PropTypes.string,
        }),
    ).isRequired,

    onChange: PropTypes.func,

    /**
     * key for selected option
     */
    value: PropTypes.string,
};

const defaultProps = {
    className: '',
    onChange: undefined,
    value: undefined,
};

class RadioInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    // XXX: use isTruthy
    static getSelectedOption = (options, value) => (
        value && options.find(d => d.key === value)
    )

    static optionKeyExtractor = option => option.key;

    constructor(props) {
        super(props);

        const selectedOption = RadioInput.getSelectedOption(
            this.props.options,
            this.props.value,
        );
        this.state = { selectedOption };
    }

    componentWillReceiveProps(nextProps) {
        if (
            this.props.value !== nextProps.value ||
            this.props.options !== nextProps.options
        ) {
            const selectedOption = RadioInput.getSelectedOption(
                nextProps.options,
                nextProps.value,
            );
            this.setState({ selectedOption });
        }
    }

    handleOptionClick = (key) => {
        const option = this.props.options.find(d => d.key === key);

        this.setState(
            { selectedOption: option },
            () => {
                if (this.props.onChange) {
                    this.props.onChange(key);
                }
            },
        );
    }

    renderOption = (key, option) => (
        <Option
            key={key}
            name={this.props.name}
            label={option.label}
            checked={this.state.selectedOption && key === this.state.selectedOption.key}
            onClick={() => this.handleOptionClick(key)}
        />
    )

    render() {
        const { className } = this.props;
        return (
            <ListView
                className={`radio-input ${className} ${styles.radioInput}`}
                data={this.props.options}
                keySelector={RadioInput.optionKeyExtractor}
                modifier={this.renderOption}
            />
        );
    }
}

export default FaramInputElement(RadioInput);
