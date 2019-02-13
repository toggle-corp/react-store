import PropTypes from 'prop-types';
import React from 'react';

import RawInput from '../RawInput';

import {
    leftPad,
    isFalsy,
    _cs,
} from '../../../utils/common';

import styles from './styles.scss';

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
        if (isFalsy(value, [''])) {
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
            isFalsy(newValue, ['']) ||
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

    render() {
        const {
            className: classNameFromProps,
            onChange, // eslint-disable-line no-unused-vars
            padLength, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props;

        const className = _cs(
            classNameFromProps,
            'digital-input',
            styles.digitalInput,
        );

        return (
            <RawInput
                className={className}
                type="number"
                onChange={this.handleChange}
                {...otherProps}
            />
        );
    }
}
