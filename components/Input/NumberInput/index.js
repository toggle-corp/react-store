import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
import {
    randomString,
    isTruthy,
    isFalsy,
    addSeparator,
} from '../../../utils/common';


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
};

@CSSModules(styles, { allowMultiple: true })
export default class NumberInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { realValue, displayValue } = this.calculateNewValues(
            props.value || props.initialValue,
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
            const { realValue, displayValue } = this.calculateNewValues(nextProps.value);
            this.realValue = realValue;
            this.setState({ value: displayValue });
        }
    }

    componentWillUnmount() {
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
        }
    }

    getValue = () => this.realValue;

    getStyleName() {
        const styleNames = [];

        const {
            disabled,
            error,
            required,
        } = this.props;

        const {
            isFocused,
        } = this.state;

        styleNames.push('text-input');

        if (disabled) {
            styleNames.push('disabled');
        }

        if (isFocused) {
            styleNames.push('focused');
        }

        if (error) {
            styleNames.push('error');
        }

        if (required) {
            styleNames.push('required');
        }

        return styleNames.join(' ');
    }

    changeToNumber = (val = '') => {
        const newVal = val.replace(/[^0-9]/g, '');
        return newVal;
    };

    concatNumber = (sign, value) => {
        let op = '';
        if (isTruthy(sign)) {
            op += sign;
        }
        if (isTruthy(value)) {
            op += value;
        }
        return op;
    }

    calculateNewValues = (v) => {
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
        const numberSanitizedPart = this.changeToNumber(numberPart);
        const numberWithCommaPart = addSeparator(numberSanitizedPart, this.props.separator);

        // get value to display
        const displayValue = this.concatNumber(signPart, numberWithCommaPart);

        // get value to return outside
        let realValue = this.concatNumber(signPart, numberSanitizedPart);
        if (realValue === '+' || realValue === '-' || realValue === '') {
            realValue = undefined;
        } else {
            realValue = +realValue;
        }

        return { realValue, displayValue };
    }

    handleChange = (event) => {
        const { onChange } = this.props;
        const { value } = event.target;

        const { realValue, displayValue } = this.calculateNewValues(value);
        this.realValue = realValue;
        this.setState({
            value: displayValue,
        });

        if (onChange) {
            clearTimeout(this.changeTimeout);
            this.changeTimeout = setTimeout(() => onChange(this.realValue), 400);
        }
    }

    handleFocus = () => {
        const { onFocus } = this.props;
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
            className,

            error,
            hint,
            label,
            showLabel,
            showHintAndError,
            ...otherProps
        } = this.props;

        const { value = '' } = this.state;

        const styleName = this.getStyleName();

        return (
            <div
                className={`${styleName} ${className}`}
                styleName={styleName}
            >
                {
                    showLabel && (
                        <label
                            className="label"
                            htmlFor={this.inputId}
                            styleName="label"
                        >
                            {label}
                        </label>
                    )
                }
                <input
                    className="input"
                    id={this.inputId}
                    onBlur={this.handleBlur}
                    onChange={this.handleChange}
                    onFocus={this.handleFocus}
                    styleName="input"
                    value={value}
                    {...otherProps}
                />
                {
                    showHintAndError && [
                        !error && hint && (
                            <p
                                key="hint"
                                className="hint"
                                styleName="hint"
                            >
                                {hint}
                            </p>
                        ),
                        error && !hint && (
                            <p
                                key="error"
                                styleName="error"
                                className="error"
                            >
                                {error}
                            </p>
                        ),
                        !error && !hint && (
                            <p
                                key="empty"
                                styleName="empty"
                                className="error empty"
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
