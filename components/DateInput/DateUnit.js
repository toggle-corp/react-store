import React from 'react';
import PropTypes from 'prop-types';


const propTypes = {
    nextUnit: PropTypes.shape({
        input: PropTypes.shape({
            focus: PropTypes.func.isRequired,
        }).isRequired,
    }),
    max: PropTypes.number,
    length: PropTypes.number.isRequired,
    className: PropTypes.string,
    placeholder: PropTypes.string,
};

const defaultProps = {
    nextUnit: undefined,
    max: undefined,
    className: '',
    placeholder: '',
};


export default class DateUnit extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    maxValidate = () => {
        const { max } = this.props;
        const currentValue = +this.input.value;

        if (max && currentValue > max) {
            // this.input.value = (currentValue % (max + 1)) + 1;
            this.input.value = max;
        }
    }

    handleInputChange = () => {
        const { length } = this.props;
        const currentValue = this.input.value;
        const currentLength = currentValue.length;

        if (currentLength === length && +currentValue === 0) {
            this.input.value = '';
        } else if (currentLength > length) {
            this.input.value = currentValue.substring(currentLength - length);
        }

        this.maxValidate();
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
                nextUnit.input.focus();
            }
        }

        this.justFocused = false;
    }

    handleFocus = () => {
        this.input.select();
        this.justFocused = true;
    }

    handleBlur = () => {
        const currentValue = this.input.value;
        const currentLength = currentValue.length;

        if (currentLength < length && +currentValue !== 0) {
            const len = (length - currentLength) + 1;
            this.input.value = Array(len).join('0') + currentValue;
        } else if (currentLength === length && +currentValue === 0) {
            this.input.value = '';
        }
    }

    render() {
        const {
            placeholder,
            className,
        } = this.props;

        return (
            <input
                type="number"
                min="1"
                placeholder={placeholder}
                className={className}
                ref={(input) => { this.input = input; }}

                onChange={this.handleInputChange}
                onKeyUp={this.handleKeyUp}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
            />
        );
    }
}
