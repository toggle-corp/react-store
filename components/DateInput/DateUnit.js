import React from 'react';
import PropTypes from 'prop-types';

import { isTruthy, leftPad } from '../../utils/common';


const propTypes = {
    className: PropTypes.string,
    length: PropTypes.number.isRequired,
    max: PropTypes.number,
    nextUnit: PropTypes.shape({
        focus: PropTypes.func.isRequired,
    }),
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    placeholder: PropTypes.string,
    value: PropTypes.string,
};

const defaultProps = {
    className: '',
    max: undefined,
    nextUnit: undefined,
    onChange: undefined,
    onFocus: undefined,
    onBlur: undefined,
    placeholder: '',
    value: '',
};


export default class DateUnit extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillReceiveProps(newProps) {
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
        const currentValue = +this.input.value;

        if (max && currentValue > max) {
            this.input.value = max;
        }
    }

    handleInputChange = () => {
        const { length, max } = this.props;
        const currentValue = this.input.value;
        const currentLength = currentValue.length;

        if (currentLength === length && +currentValue === 0) {
            this.input.value = '';
        } else if (currentLength > length) {
            this.input.value = currentValue.substring(currentLength - length);
        }

        this.maxValidate(max);

        if (this.props.onChange) {
            this.props.onChange(this.input.value);
        }
    }

    handleKeyUp = (e) => {
        const { nextUnit, length } = this.props;

        if (!nextUnit) {
            return;
        }

        const currentValue = this.input.value;
        const currentLength = currentValue.length;
        const key = e.key;

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
            placeholder,
            className,
        } = this.props;

        return (
            <input
                className={className}
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
