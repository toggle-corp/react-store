import PropTypes from 'prop-types';
import React from 'react';

import { leftPad } from '../../utils/common';

const propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.string,
    padLength: PropTypes.number,
};
const defaultProps = {
    value: '',
    onChange: undefined,
    padLength: 2,
};

export default class DigitalInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static padAndTrim = (value, padLength) => {
        if (value === '' || value === undefined) {
            return '';
        }
        return leftPad(+value % (10 ** padLength), padLength, '0');
    }

    static getNewValue = (newValue, oldValue, padLength) => {
        // NOTE: to identify a backspace, we look at the length of
        // old value and new value. (New value will be shorter than old value)
        // However, when value is changed from arrows in number input,
        // this algorithm cannot differentiate between the two.
        if (
            newValue === '' ||
            newValue === undefined ||
            (
                oldValue !== undefined &&
                oldValue.length > newValue.length &&
                newValue.match(/^0+$/)
            )
        ) {
            return '';
        }
        const newerValue = DigitalInput.padAndTrim(newValue, padLength);
        return newerValue;
    }

    handleChange = (event) => {
        const { value } = event.target;
        const {
            value: valueFromProps,
            padLength,
            onChange,
        } = this.props;

        if (onChange) {
            const newValue = DigitalInput.getNewValue(value, valueFromProps, padLength);
            onChange(newValue);
        }
    }

    handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
    }

    render() {
        const {
            onChange, // eslint-disable-line no-unused-vars
            padLength, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props;

        return (
            <input
                type="number"
                onChange={this.handleChange}
                onDrop={this.handleDrop}
                {...otherProps}
            />
        );
    }
}
