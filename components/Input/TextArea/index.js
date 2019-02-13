import PropTypes from 'prop-types';
import React from 'react';
import { randomString, isFalsy } from '@togglecorp/fujs';

import { FaramInputElement } from '../../General/FaramElements';
import Delay from '../../General/Delay';

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
    resize: PropTypes.string,

    selectOnFocus: PropTypes.bool,
};

const defaultProps = {
    className: '',
    resize: 'none',
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
};

export class NormalTextArea extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = { isFocused: false };
        this.inputId = randomString();
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

        if (!isFalsy(error, [''])) {
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
            onChange(value);
        }
    }

    handleFocus = () => {
        const { selectOnFocus, onFocus } = this.props;
        if (selectOnFocus) {
            // eslint-disable-next-line no-restricted-globals
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
            onBlur, // eslint-disable-line
            onChange, // eslint-disable-line
            onFocus, // eslint-disable-line
            selectOnFocus, // eslint-disable-line
            className,

            error,
            hint,
            label,
            showLabel,
            showHintAndError,
            resize,
            ...otherProps
        } = this.props;

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
                    style={{ resize }}
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

export default FaramInputElement(Delay(NormalTextArea));
