import PropTypes from 'prop-types';
import React from 'react';

import {
    randomString,
    isTruthy,
    isFalsy,
    addSeparator,
} from '../../../utils/common';

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
     * Initial value for the input
     */
    initialValue: PropTypes.number,

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

    changeDelay: PropTypes.number,
};

const defaultProps = {
    className: '',
    disabled: false,
    error: '',
    hint: '',
    initialValue: undefined,
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
    changeDelay: 400,
};

export default class NumberInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static changeToNumber = (val = '') => {
        const newVal = val.replace(/[^0-9]/g, '');
        return newVal;
    };

    static concatNumber = (sign, value) => {
        let op = '';
        if (isTruthy(sign)) {
            op += sign;
        }
        if (isTruthy(value)) {
            op += value;
        }
        return op;
    }

    static calculateNewValues = (v, separator) => {
        if (isFalsy(v)) {
            return {};
        }
        // TODO: Value provided is most likely to be number
        // when it is provided from props, change it to string first
        const value = String(v);

        let signPart;
        let numberPart = value;

        // extract sign
        if (value[0] === '-' || value[0] === '+') {
            signPart = value[0];
            numberPart = value.substr(1);
        }

        // get string with only number
        const numberSanitizedPart = NumberInput.changeToNumber(numberPart);
        const numberWithCommaPart = addSeparator(numberSanitizedPart, separator);

        // get value to display
        const displayValue = NumberInput.concatNumber(signPart, numberWithCommaPart);

        // get value to return outside
        let realValue = NumberInput.concatNumber(signPart, numberSanitizedPart);
        if (realValue === '+' || realValue === '-' || realValue === '') {
            realValue = undefined;
        } else {
            realValue = +realValue;
        }

        return { realValue, displayValue };
    }

    constructor(props) {
        super(props);

        const { realValue, displayValue } = NumberInput.calculateNewValues(
            props.value || props.initialValue,
            props.separator,
        );
        this.realValue = realValue;

        this.state = {
            isFocused: false,
            value: displayValue,
        };

        this.inputId = randomString();
    }

    componentWillReceiveProps(nextProps) {
        if (this.realValue !== nextProps.value) {
            const { realValue, displayValue } = NumberInput.calculateNewValues(
                nextProps.value,
                nextProps.separator,
            );
            this.realValue = realValue;
            this.setState({ value: displayValue });
        }
    }

    componentWillUnmount() {
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
        }
    }

    getClassName() {
        const {
            disabled,
            error,
            required,
        } = this.props;

        const {
            isFocused,
        } = this.state;

        const classNames = [];

        classNames.push('text-input');
        classNames.push(styles['text-input']);

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
        const { separator } = this.props;
        const { value } = event.target;

        const { realValue, displayValue } = NumberInput.calculateNewValues(
            value,
            separator,
        );
        this.realValue = realValue;
        this.setState({ value: displayValue });

        const { onChange, changeDelay } = this.props;
        if (onChange) {
            clearTimeout(this.changeTimeout);
            this.changeTimeout = setTimeout(() => onChange(this.realValue), changeDelay);
        }
    }

    handleFocus = () => {
        const { selectOnFocus, onFocus } = this.props;
        if (selectOnFocus) {
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
            // skip prop injection for initialValue & onChange (used internally)
            initialValue, // eslint-disable-line
            value: propValue, // eslint-disable-line
            onBlur, // eslint-disable-line
            onChange, // eslint-disable-line
            onFocus, // eslint-disable-line
            selectOnFocus, // eslint-disable-line
            changeDelay, // eslint-disable-line
            className,

            error,
            hint,
            label,
            showLabel,
            showHintAndError,
            ...otherProps
        } = this.props;

        const { value = '' } = this.state;

        const classNames = this.getClassName();

        return (
            <div className={`${classNames} ${className}`}>
                {
                    showLabel && (
                        <label
                            className={`${styles.label} label`}
                            htmlFor={this.inputId}
                        >
                            {label}
                        </label>
                    )
                }
                <input
                    className={`${styles.input} input`}
                    id={this.inputId}
                    onBlur={this.handleBlur}
                    onChange={this.handleChange}
                    onFocus={this.handleFocus}
                    value={value}
                    {...otherProps}
                />
                {
                    showHintAndError && [
                        !error && hint && (
                            <p
                                key="hint"
                                className={`${styles.hint} hint`}
                            >
                                {hint}
                            </p>
                        ),
                        error && !hint && (
                            <p
                                key="error"
                                className={`${styles.error} error`}
                            >
                                {error}
                            </p>
                        ),
                        !error && !hint && (
                            <p
                                key="empty"
                                className={`${styles.empty} empty error`}
                            >
                                -
                            </p>
                        ),
                    ]
                }
            </div>
        );
    }
}
