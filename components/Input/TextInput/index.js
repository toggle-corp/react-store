import PropTypes from 'prop-types';
import React from 'react';

import { randomString } from '../../../utils/common';
import Input from '../../../utils/input';

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

@Input
export default class TextInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const value = this.props.initialValue || this.props.value;
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
                console.warn('TextInput: not updating, as there is a pending change.');
            }
        }
    }

    componentWillUnmount() {
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
        }
    }

    getClassName() {
        const {
            className,
            disabled,
            error,
            required,
        } = this.props;

        const { isFocused } = this.state;

        const classNames = [
            className,
            'text-input',
            styles.textInput,
        ];

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
        clearTimeout(this.changeTimeout);
        this.pendingChange = true;

        const { value } = event.target;
        this.setState({ value });

        const {
            onChange,
            changeDelay,
        } = this.props;

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

    handleFocus = (event) => {
        const {
            selectOnFocus,
            onFocus,
        } = this.props;

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
            initialValue, // eslint-disable-line no-unused-vars
            value: propValue, // eslint-disable-line no-unused-vars
            onBlur, // eslint-disable-line no-unused-vars
            onChange, // eslint-disable-line no-unused-vars
            onFocus, // eslint-disable-line no-unused-vars
            selectOnFocus, // eslint-disable-line no-unused-vars
            changeDelay, // eslint-disable-line no-unused-vars
            className: dummy, // eslint-disable-line no-unused-vars

            error,
            hint,
            label,
            showLabel,
            showHintAndError,
            ...otherProps
        } = this.props;

        const { value = '' } = this.state;
        const className = this.getClassName();

        return (
            <div className={className}>
                <Label
                    className={styles.label}
                    show={showLabel}
                    text={label}
                />
                <input
                    className={`${styles.input} input`}
                    id={this.inputId}
                    onBlur={this.handleBlur}
                    onChange={this.handleChange}
                    onFocus={this.handleFocus}
                    value={value}
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
