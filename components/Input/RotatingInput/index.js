import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import { FaramInputElement } from '../../General/FaramElements';
import Button from '../../Action/Button';
import HintAndError from '../HintAndError';
import { iconNames } from '../../../constants';

import Label from '../Label';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    error: PropTypes.string,
    rendererSelector: PropTypes.func,
    hint: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func,
    required: PropTypes.bool,
    showLabel: PropTypes.bool,
    showHintAndError: PropTypes.bool,
    options: PropTypes.arrayOf(PropTypes.object),
    keySelector: PropTypes.func,
    readOnly: PropTypes.bool,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
};

const defaultProps = {
    className: '',
    disabled: false,
    readOnly: false,
    error: '',
    hint: '',
    label: '',
    onChange: undefined,
    required: false,
    showLabel: true,
    keySelector: d => d.key,
    rendererSelector: d => d.renderer,
    showHintAndError: true,
    value: '',
    options: [],
};

const emptyObject = {};

class RotatingInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleButtonClick = () => {
        const {
            onChange,
            options,
            value,
            disabled,
            keySelector,
            readOnly,
        } = this.props;
        const currentIndex = options.findIndex(o => keySelector(o) === value);

        const newValue = options[currentIndex + 1] === undefined ? (
            keySelector(options[0])
        ) : (
            keySelector(options[currentIndex + 1])
        );

        if (onChange && !disabled && !readOnly) {
            onChange(newValue);
        }
    }

    render() {
        const {
            options,
            keySelector,
            rendererSelector,
            error,
            hint,
            label,
            value,
            showLabel,
            showHintAndError,
            className,
            disabled,
            required,
        } = this.props;

        const classNames = _cs(
            className,
            'rotating-input',
            styles.rotatingInput,
            disabled && 'disabled',
            disabled && styles.disabled,
            error && 'error',
            error && styles.error,
            required && 'required',
            required && styles.required,
        );

        // FIXME: unsafe if options is list of number
        const currentRenderer = rendererSelector(
            options.find(o => keySelector(o) === value) || emptyObject,
        );

        return (
            <div className={classNames}>
                <Label
                    className={styles.label}
                    show={showLabel}
                    text={label}
                />
                <Button
                    className={styles.button}
                    iconName={iconNames.swap}
                    onClick={this.handleButtonClick}
                    transparent
                >
                    {currentRenderer}
                </Button>
                <HintAndError
                    show={showHintAndError}
                    hint={hint}
                    error={error}
                />
            </div>
        );
    }
}

export default FaramInputElement(RotatingInput);
