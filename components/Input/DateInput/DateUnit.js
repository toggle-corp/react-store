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
     * Minimum limiting value
     */
    min: PropTypes.number,

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
    min: 1,
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

    constructor(props) {
        super(props);

        // XXX: don't use this.input.value directly or set it directly
        // XXX: put currentValue in state
        this.currentValue = props.value;
    }

    componentWillReceiveProps(newProps) {
        // XXX: valide min
        // Always max validate whenever props change
        this.maxValidate(newProps.max);
        if (+this.currentValue !== +newProps.value) {
            this.currentValue = newProps.value;
        }
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

        // XXX: maybe validate and onChagne on blur or something
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
        if (this.props.onBlur) {
            this.props.onBlur();
        }
    }

    render() {
        const {
            className,
            disabled,
            placeholder,
            length,
            min,
            max,
        } = this.props;

        const focused = document.activeElement === this.input;
        let displayValue = isTruthy(this.currentValue) ? this.currentValue : '';

        if (!focused) {
            if (displayValue.length < length && +displayValue !== 0) {
                displayValue = leftPad(displayValue, length);
            } else if (displayValue.length === length && +displayValue === 0) {
                displayValue = '';
            }
        }

        this.currentValue = displayValue;

        return (
            <input
                className={className}
                disabled={disabled}
                min={isTruthy(min) ? String(min) : undefined}
                max={isTruthy(max) ? String(max) : undefined}

                onBlur={this.handleBlur}
                onChange={this.handleInputChange}
                onFocus={this.handleFocus}
                onKeyUp={this.handleKeyUp}

                placeholder={placeholder}
                ref={(input) => { this.input = input; }}
                type="number"
                value={displayValue}
            />
        );
    }
}
