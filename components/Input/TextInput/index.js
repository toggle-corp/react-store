import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';

import Delay from '../../General/Delay';

import RawInput from '../RawInput';
import HintAndError from '../HintAndError';
import Label from '../Label';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    error: PropTypes.string,
    hint: PropTypes.string,
    label: PropTypes.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    required: PropTypes.bool,
    showLabel: PropTypes.bool,
    showHintAndError: PropTypes.bool,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    selectOnFocus: PropTypes.bool,
    title: PropTypes.string,
    persistentHintAndError: PropTypes.bool,
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
    persistentHintAndError: true,
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
            className: classNameFromProps,
            disabled,
            error,
            required,
        } = this.props;

        const { isFocused } = this.state;

        const className = _cs(
            classNameFromProps,
            styles.textInput,
            'text-input',
            disabled && styles.disabled,
            disabled && 'disabled',
            isFocused && styles.focused,
            isFocused && 'focused',
            error && styles.error,
            error && 'error',
            required && styles.required,
            required && 'required',
        );

        return className;
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
            onBlur, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            onChange, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            onFocus, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            selectOnFocus, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
            className: classNameFromProps,

            error,
            hint,
            label,
            showLabel,
            showHintAndError,
            disabled,
            title,
            persistentHintAndError,
            ...otherProps
        } = this.props;

        const { isFocused } = this.state;

        const className = this.getClassName();

        return (
            <div
                className={className}
                title={title}
            >
                <Label
                    show={showLabel}
                    text={label}
                    error={!!error}
                    active={isFocused}
                    disabled={disabled}
                />
                <RawInput
                    className={styles.input}
                    onBlur={this.handleBlur}
                    onChange={this.handleChange}
                    onFocus={this.handleFocus}
                    disabled={disabled}
                    type="text"
                    {...otherProps}
                />
                <HintAndError
                    show={showHintAndError}
                    hint={hint}
                    error={error}
                    persistent={persistentHintAndError}
                />
            </div>
        );
    }
}

export default FaramInputElement(Delay(TextInput));
