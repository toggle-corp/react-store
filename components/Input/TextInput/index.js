import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { randomString } from '../../../utils/common';
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
    initialValue: PropTypes.string,

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

    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),

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
    value: '',
    selectOnFocus: false,
    changeDelay: 200,
};

@CSSModules(styles, { allowMultiple: true })
export default class TextInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.realValue = this.props.initialValue || this.props.value;
        this.state = {
            isFocused: false,
            value: this.realValue,
        };

        this.inputId = randomString();
    }

    componentWillReceiveProps(nextProps) {
        if (this.realValue !== nextProps.value) {
            this.realValue = nextProps.value;
            this.setState({
                value: this.realValue,
            });
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

        const { isFocused } = this.state;

        const classNames = [];
        classNames.push('text-input');
        classNames.push(styles['text-input']);
        if (disabled) {
            classNames.push('disabled');
            classNames.push(styles.disabled);
        }
        if (isFocused) {
            classNames.push('focused');
            classNames.push(styles.focused);
        }
        if (error) {
            classNames.push('error');
            classNames.push(styles.error);
        }
        if (required) {
            classNames.push('required');
            classNames.push(styles.required);
        }
        return classNames.join(' ');
    }

    handleChange = (event) => {
        const { value } = event.target;
        this.realValue = value;
        this.setState({ value: this.realValue });

        const { onChange, changeDelay } = this.props;
        if (onChange) {
            clearTimeout(this.changeTimeout);
            this.changeTimeout = setTimeout(() => onChange(this.realValue), changeDelay);
        }
    }

    handleFocus = (event) => {
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
                        <div className={`${styles.label} label`}>
                            {label}
                        </div>
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
                                className={`${styles.empty} error empty`}
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
