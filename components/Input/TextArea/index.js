import PropTypes from 'prop-types';
import React from 'react';
import {
    _cs,
    randomString,
    isTruthyString,
} from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';

import Delay from '../../General/Delay';
import Label from '../Label';
import HintAndError from '../HintAndError';

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
    persistentHintAndError: PropTypes.bool,
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
    persistentHintAndError: true,
};

export class NormalTextArea extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = { isFocused: false };
        this.inputId = randomString(16);
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

        this.setState({ isFocused: true });

        if (onFocus) {
            onFocus();
        }
    }

    handleBlur = () => {
        const {
            onBlur,
        } = this.props;

        this.setState({ isFocused: false });

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
            className: classNameFromProps,

            error,
            hint,
            label,
            showLabel,
            showHintAndError,
            disabled,
            resize,
            required,
            persistentHintAndError,
            ...otherProps
        } = this.props;

        const { isFocused } = this.state;

        const classNames = _cs(
            classNameFromProps,
            'text-area',
            styles.textArea,
            disabled && 'disabled',
            disabled && styles.disabled,
            isFocused && 'focused',
            isFocused && styles.focused,
            isTruthyString(error) && 'error',
            isTruthyString(error) && styles.error,
            required && styles.required,
            required && 'required',
        );

        return (
            <div className={classNames}>
                <Label
                    show={showLabel}
                    text={label}
                    error={!!error}
                    active={isFocused}
                    disabled={disabled}
                />
                <textarea
                    className={_cs(styles.input, 'input')}
                    id={this.inputId}
                    onBlur={this.handleBlur}
                    onChange={this.handleChange}
                    onFocus={this.handleFocus}
                    style={{ resize }}
                    disabled={disabled}
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

export default FaramInputElement(Delay(NormalTextArea));
