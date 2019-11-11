import PropTypes from 'prop-types';
import React from 'react';
import { FaramInputElement } from '@togglecorp/faram';

import ListView from '../../View/List/ListView';

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
    // name: PropTypes.string.isRequired,

    /**
     * Is input disabled?
     */
    // disabled: PropTypes.bool,

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

    // readOnly: PropTypes.bool,

    /**
     * key for selected option
     */
    value: PropTypes.string,
};

const defaultProps = {
    className: '',
    onChange: undefined,
    value: undefined,
    // disabled: false,
    // readOnly: false,
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

        const {
            options,
            value,
        } = this.props;

        const selectedOption = RadioInput.getSelectedOption(options, value);
        this.state = { selectedOption };
    }

    componentWillReceiveProps(nextProps) {
        const {
            options,
            value,
        } = this.props;

        if (value !== nextProps.value || options !== nextProps.options) {
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

    rendererParams = (key, option) => ({
        checked: this.state.selectedOption && key === this.state.selectedOption.key,
        onClick: () => this.handleOptionClick(key),
        optionKey: key,
        // TODO: use label extractor
        label: option.label,
        // FIXME: should check about injecting all values to Option
        ...this.props,
    })

    render() {
        const {
            className,
            options,
        } = this.props;

        return (
            <ListView
                className={`radio-input ${className} ${styles.radioInput}`}
                data={options}
                keySelector={RadioInput.optionKeyExtractor}
                renderer={Option}
                rendererParams={this.rendererParams}
            />
        );
    }
}

export default FaramInputElement(RadioInput);
