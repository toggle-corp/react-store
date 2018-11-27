import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import {
    isTruthy,
    addSeparator,
} from '../../../utils/common';
import { FaramInputElement } from '../../General/FaramElements';
import Delay from '../../General/Delay';

import HintAndError from '../HintAndError';
import Label from '../Label';
import styles from './styles.scss';

const propTypes = {
    /**
     * required for style override
     */
    className: PropTypes.string,

    /**
     * Is input disabled?
     */
    disabled: PropTypes.bool,

    /**
     * String to show in case of error
     */
    error: PropTypes.string,

    /**
     * Hint text
     */
    hint: PropTypes.string,

    /**
     * Input label
     */
    label: PropTypes.string,

    /**
     * A callback for when the input loses focus
     */
    onBlur: PropTypes.func,

    /**
     * A callback for when the input changes its content
     */
    onChange: PropTypes.func,

    /**
     * A callback for when the input gets focus
     */
    onFocus: PropTypes.func,

    /**
     * Is a required element for form
     */
    required: PropTypes.bool,
    showLabel: PropTypes.bool,
    showHintAndError: PropTypes.bool,
    value: PropTypes.number,
    separator: PropTypes.string,
    selectOnFocus: PropTypes.bool,
    title: PropTypes.string,
};

const defaultProps = {
    className: '',
    disabled: false,
    error: '',
    hint: '',
    label: '',
    onBlur: undefined,
    onChange: undefined,
    onFocus: undefined,
    required: false,
    showLabel: true,
    showHintAndError: true,
    value: undefined,
    separator: ',',
    selectOnFocus: false,
    title: undefined,
};

const INT_LIMIT = 9007199254740992;

const sanitizeNumber = (value = '') => {
    if (value === '') {
        return value;
    }

    const newValue = value.replace(/[^0-9]/g, '');
    if (newValue === '') {
        return newValue;
    }

    const realValue = +newValue;
    // NOTE: Limit integer value to MAX_LIMIT
    return (
        isTruthy(realValue)
            ? String(Math.min(INT_LIMIT, realValue))
            : newValue
    );
};

const isSign = value => value === '-';

const getNumberAndSign = (value = '') => {
    if (Number.isNaN(value)) {
        return { sign: '-' };
    }

    const stringValue = value.toString();
    const firstCharacter = stringValue.charAt(0);

    if (isSign(firstCharacter)) {
        return {
            sign: '-',
            number: sanitizeNumber(stringValue.substring(1)),
        };
    }

    return { number: sanitizeNumber(stringValue) };
};

class NumberInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = { isFocused: false };
    }

    getDisplayValue = memoize((value, separator) => {
        const {
            sign = '',
            number = '',
        } = getNumberAndSign(value);
        const numberWithSeparator = addSeparator(number, separator);
        return `${sign}${numberWithSeparator}`;
    })

    getClassName() {
        const {
            disabled,
            error,
            required,
            className,
        } = this.props;

        const {
            isFocused,
        } = this.state;

        const classNames = [
            className,
            'number-input',
            styles.numberInput,
        ];

        if (disabled) {
            classNames.push(styles.disabled);
            classNames.push('disabled');
        }

        if (isFocused) {
            classNames.push(styles.focused);
            classNames.push('focused');
        }

        if (error) {
            classNames.push(styles.error);
            classNames.push('error');
        }

        if (required) {
            classNames.push(styles.required);
            classNames.push('required');
        }

        return classNames.join(' ');
    }

    handleChange = (event) => {
        const { value } = event.target;
        const { onChange } = this.props;
        if (onChange) {
            const {
                number = '',
                sign = '',
            } = getNumberAndSign(value);

            let realValue;
            if (number === '' && sign !== '') {
                realValue = NaN;
            } else if (number === '' && sign === '') {
                realValue = undefined;
            } else {
                realValue = +`${sign}${number}`;
            }
            onChange(realValue);
        }
    }

    handleFocus = () => {
        const { selectOnFocus, onFocus } = this.props;
        if (selectOnFocus) {
            // eslint-disable-next-line no-restricted-globals
            event.target.select();
        }

        this.setState({ isFocused: true });
        if (onFocus) {
            onFocus();
        }
    }

    handleBlur = () => {
        const { onBlur } = this.props;
        this.setState({ isFocused: false });
        if (onBlur) {
            onBlur();
        }
    }

    render() {
        const {
            // skip prop injection
            value: propValue, // eslint-disable-line no-unused-vars
            onBlur, // eslint-disable-line no-unused-vars
            onChange, // eslint-disable-line no-unused-vars
            onFocus, // eslint-disable-line no-unused-vars
            selectOnFocus, // eslint-disable-line no-unused-vars
            className: propClassName, // eslint-disable-line no-unused-vars

            error,
            hint,
            label,
            showLabel,
            showHintAndError,
            value,
            title,
            separator,
            ...otherProps
        } = this.props;

        const className = this.getClassName();

        return (
            <div
                className={className}
                title={title}
            >
                <Label
                    className={styles.label}
                    show={showLabel}
                    text={label}
                />
                <input
                    className={`${styles.input} input`}
                    onBlur={this.handleBlur}
                    onChange={this.handleChange}
                    onFocus={this.handleFocus}
                    value={this.getDisplayValue(value, separator)}
                    {...otherProps}
                />
                <HintAndError
                    show={showHintAndError}
                    hint={hint}
                    error={error}
                />
            </div>
        );
    }
}

export default FaramInputElement(Delay(NumberInput));
