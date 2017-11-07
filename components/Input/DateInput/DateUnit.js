import React from 'react';
import PropTypes from 'prop-types';

import {
    isTruthy,
    leftPad,
} from '../../../utils/common';


const propTypes = {
    /**
     * required for style override
     */
    className: PropTypes.string,

    /**
     * is input disabled
     */
    disabled: PropTypes.bool,

    /**
     * Number of digits, used to limit the digits
     * as well as to left pad with zeros
     */
    length: PropTypes.number.isRequired,

    /**
     * Maximum limiting value
     */
    max: PropTypes.number,

    /**
     * Next date unit to auto focus
     * when user finishes typing in this unit
     */
    nextUnit: PropTypes.shape({
        focus: PropTypes.func.isRequired,
    }),

    /**
     * Callback for when input loses its focus
     */
    onBlur: PropTypes.func,

    /**
     * Callback for when value changes in the input
     */
    onChange: PropTypes.func,

    /**
     * Callback for when input changes its content
     */
    onFocus: PropTypes.func,

    /**
     * Placeholder for input
     */
    placeholder: PropTypes.string,

    /**
     * Value to show in the input
     */
    value: PropTypes.string,
};

const defaultProps = {
    className: '',
    disabled: false,
    max: undefined,
    nextUnit: undefined,
    onBlur: undefined,
    onChange: undefined,
    onFocus: undefined,
    placeholder: '',
    value: '',
};


export default class DateUnit extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillReceiveProps(newProps) {
        // Always max validate whenever props change
        this.maxValidate(newProps.max);
    }

    getValue() {
        return this.input.value;
    }

    setValue(value) {
        this.input.value = value;
    }

    focus() {
        this.input.focus();
    }

    maxValidate = (max) => {
        // Validate the maximum value
        const currentValue = +this.input.value;

        if (max && currentValue > max) {
            this.input.value = max;
        }
    }

    handleInputChange = () => {
        // Input value has changed
        // We need to do some validations

        const { length, max } = this.props;
        const currentValue = this.input.value;
        const currentLength = currentValue.length;

        if (currentLength === length && +currentValue === 0) {
            // If the value is full of zeroes, empty the input
            // to just show placeholder text.
            this.input.value = '';
        } else if (currentLength > length) {
            // If the value length is more than required, just
            // take the last required number of digits.
            this.input.value = currentValue.substring(currentLength - length);
        }

        this.maxValidate(max);

        if (this.props.onChange) {
            this.props.onChange(this.input.value);
        }
    }

    handleKeyUp = (e) => {
        // On key up, if we have just typed required number of
        // digits and if there is next date unit,
        // then focus to the next date unit.
        const { nextUnit, length } = this.props;

        if (!nextUnit) {
            return;
        }

        const currentValue = this.input.value;
        const currentLength = currentValue.length;
        const key = e.key;

        // Sometimes the browser is so quick, it registers
        // two keyUp events for successive dateUnits.
        // To prevent this, we use the boolean variable justFocused.

        if (!this.justFocused && key >= '0' && key <= '9') {
            if (currentLength >= length) {
                nextUnit.focus();
            }
        }

        this.justFocused = false;
    }

    handleFocus = () => {
        this.input.select();
        this.justFocused = true;

        if (this.props.onFocus) {
            this.props.onFocus();
        }
    }

    handleBlur = () => {
        // When getting out of focus,
        // we do some extra validations
        // including leftPadding the value if it has less number
        // of digits then required.

        const currentValue = this.input.value;
        const currentLength = currentValue.length;
        const length = this.props.length;

        if (currentLength < length && +currentValue !== 0) {
            this.input.value = leftPad(currentValue, length);
        } else if (currentLength === length && +currentValue === 0) {
            this.input.value = '';
        }

        if (this.props.onChange) {
            this.props.onChange(this.input.value);
        }

        if (this.props.onBlur) {
            this.props.onBlur();
        }
    }

    render() {
        const {
            className,
            disabled,
            placeholder,
        } = this.props;

        return (
            <input
                className={className}
                disabled={disabled}
                min="1"

                onBlur={this.handleBlur}
                onChange={this.handleInputChange}
                onFocus={this.handleFocus}
                onKeyUp={this.handleKeyUp}

                placeholder={placeholder}
                ref={(input) => { this.input = input; }}
                type="number"
                value={isTruthy(this.props.value) ? this.props.value : ''}
            />
        );
    }
}
