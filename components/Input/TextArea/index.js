import PropTypes from 'prop-types';
import React from 'react';

import { randomString } from '../../../utils/common';
import FaramElement from '../../Input/Faram/FaramElement';

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

    value: PropTypes.string,

    selectOnFocus: PropTypes.bool,

    changeDelay: PropTypes.number,
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
    value: '',
    selectOnFocus: false,
    changeDelay: 200,
};

class TextArea extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { value } = props;
        this.state = {
            isFocused: false,
            value,
        };
        this.inputId = randomString();
        this.pendingChange = false;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.value !== nextProps.value) {
            if (!this.pendingChange) {
                this.setState({ value: nextProps.value });
            } else {
                console.warn('Not updating, as there is a pending change.');
            }
        }
    }

    componentWillUnmount() {
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
        }
    }

    getClassName() {
        const classNames = [];

        const {
            disabled,
            error,
            required,
        } = this.props;

        const {
            isFocused,
        } = this.state;

        classNames.push('text-area');
        classNames.push(styles.textArea);

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
        clearTimeout(this.changeTimeout);
        this.pendingChange = true;

        const { value } = event.target;
        this.setState({ value });

        const { onChange, changeDelay } = this.props;
        if (onChange) {
            this.changeTimeout = setTimeout(
                () => {
                    this.pendingChange = false;
                    onChange(value);
                },
                changeDelay,
            );
        }
    }

    handleFocus = () => {
        const { selectOnFocus, onFocus } = this.props;
        if (selectOnFocus) {
            event.target.select();
        }

        this.setState({
            isFocused: true,
        });

        if (onFocus) {
            onFocus();
        }
    }

    handleBlur = () => {
        const {
            onBlur,
        } = this.props;

        this.setState({
            isFocused: false,
        });

        if (onBlur) {
            onBlur();
        }
    }
    render() {
        const {
            // skip prop injection
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
            <div className={`${classNames} ${className}`} >
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
                <textarea
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

export default FaramElement('input')(TextArea);
