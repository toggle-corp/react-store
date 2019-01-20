import PropTypes from 'prop-types';
import React from 'react';

import { FaramInputElement } from '../../General/FaramElements';
import Delay from '../../General/Delay';
import { isFalsy } from '../../../utils/common';

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

    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),

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
    value: '',
    selectOnFocus: false,
    title: undefined,
};

class TextInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = { isFocused: false };
    }

    getClassName = () => {
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
        if (!isFalsy(error, [''])) {
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
        const { onChange } = this.props;

        if (onChange) {
            onChange(value);
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
            // skip prop injection
            onBlur, // eslint-disable-line no-unused-vars
            onChange, // eslint-disable-line no-unused-vars
            onFocus, // eslint-disable-line no-unused-vars
            selectOnFocus, // eslint-disable-line no-unused-vars
            className: dummy, // eslint-disable-line no-unused-vars

            error,
            hint,
            label,
            showLabel,
            showHintAndError,
            title,
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

export default FaramInputElement(Delay(TextInput));
