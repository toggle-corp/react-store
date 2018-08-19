import PropTypes from 'prop-types';
import React from 'react';

import { leftPad } from '../../../utils/common';
import FaramElement from '../../Input/Faram/FaramElement';
import Delay from '../../General/Delay';

import HintAndError from '../HintAndError';
import Label from '../Label';
import DigitalInput from '../DigitalInput';

import ActionButtons from './ActionButtons';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    error: PropTypes.string,
    hint: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func,
    showLabel: PropTypes.bool,
    showHintAndError: PropTypes.bool,
    value: PropTypes.string,
    title: PropTypes.string,
    separator: PropTypes.string,
};

const defaultProps = {
    className: '',
    disabled: false,
    error: '',
    hint: '',
    label: '',
    onChange: () => {},
    showLabel: true,
    separator: ':',
    showHintAndError: true,
    value: undefined,
    title: undefined,
};

const MIN_HOUR = 0;
const MAX_HOUR = 23;
const MIN_MINUTE = 0;
const MAX_MINUTE = 59;
const STEP = 1;

// h, m is string
const encodeTime = ({ h, m }, separator) => {
    const hour = h || '';
    const minute = m || '';
    if (hour === '' && minute === '') {
        return undefined;
    }
    // NOTE: added default value '00' for second
    return `${hour}${separator}${minute}${separator}00`;
};

// value is string
const decodeTime = (value, separator) => {
    if (!value) {
        return {};
    }
    const values = value.split(separator);
    return {
        h: values[0],
        m: values[1],
    };
};

// value is string
const isValidTimeString = (value, separator) => {
    if (value === '' || value === undefined) {
        return true;
    }
    const { h, m } = decodeTime(value, separator);
    if (h === undefined || h === '' || m === undefined || m === '') {
        return false;
    }

    return !(
        (+h < MIN_HOUR || +h > MAX_HOUR) ||
        (+m < MIN_MINUTE || +m > MAX_MINUTE)
    );
};

class TimeInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            hourInputFocused: false,
            minuteInputFocused: false,
        };
    }

    getClassName = () => {
        const {
            disabled,
            className,
            value,
            error,
            separator,
        } = this.props;

        const {
            hourInputFocused,
            minuteInputFocused,
        } = this.state;

        const classNames = [
            className,
            'time-input',
            styles.timeInput,
        ];

        if (hourInputFocused || minuteInputFocused) {
            classNames.push(styles.focused);
            classNames.push('input-focused');
        }

        if (disabled) {
            classNames.push(styles.disabled);
            classNames.push('disabled');
        }

        const isInvalid = !isValidTimeString(value, separator);
        if (isInvalid) {
            classNames.push(styles.invalid);
            classNames.push('invalid');
        }

        if (error) {
            classNames.push(styles.error);
            classNames.push('error');
        }

        return classNames.join(' ');
    }

    handleHourInputFocus = () => {
        this.setState({ hourInputFocused: true });
    }

    handleHourInputBlur = () => {
        this.setState({ hourInputFocused: false });
    }

    handleMinuteInputFocus = () => {
        this.setState({ minuteInputFocused: true });
    }

    handleMinuteInputBlur = () => {
        this.setState({ minuteInputFocused: false });
    }

    handleHourInputChange = (h) => {
        this.handleChange({ h });
    }

    handleMinuteInputChange = (m) => {
        this.handleChange({ m });
    }

    handleClearButtonClick = () => {
        this.handleChange({
            h: undefined,
            m: undefined,
        });
    }

    handleTodayButtonClick = () => {
        const date = new Date();
        this.handleChange({
            h: leftPad(String(date.getHours()), 2).slice(-2),
            m: leftPad(String(date.getMinutes()), 2).slice(-2),
        });
    }

    handleChange = (valueToOverride) => {
        const {
            onChange,
            value: valueFromProps,
            separator,
        } = this.props;

        const oldValue = decodeTime(valueFromProps, separator);

        const { h, m } = {
            ...oldValue,
            ...valueToOverride,
        };

        const newValue = encodeTime({ h, m }, separator);

        if (newValue !== valueFromProps) {
            onChange(newValue);
        }
    }

    render() {
        const {
            error,
            hint,
            label,
            showLabel,
            showHintAndError,
            title,
            disabled,
            value,
            separator,
        } = this.props;

        const className = this.getClassName();
        const hourPlaceholder = 'hh';
        const minutePlaceholder = 'mm';

        const {
            h: hourValue = '',
            m: minuteValue = '',
        } = decodeTime(value, separator);

        return (
            <div
                title={title}
                className={className}
            >
                <Label
                    className={styles.label}
                    show={showLabel}
                    text={label}
                />
                <div className={styles.input}>
                    <div className={styles.units}>
                        <DigitalInput
                            padLength={2}
                            onFocus={this.handleHourInputFocus}
                            onBlur={this.handleHourInputBlur}
                            className={styles.unit}
                            min={MIN_HOUR}
                            max={MAX_HOUR}
                            step={STEP}
                            placeholder={hourPlaceholder}
                            disabled={disabled}
                            value={hourValue}
                            onChange={this.handleHourInputChange}
                        />
                        <div className={styles.separator}>
                            {separator}
                        </div>
                        <DigitalInput
                            padLength={2}
                            onFocus={this.handleMinuteInputFocus}
                            onBlur={this.handleMinuteInputBlur}
                            className={styles.unit}
                            min={MIN_MINUTE}
                            max={MAX_MINUTE}
                            step={STEP}
                            placeholder={minutePlaceholder}
                            disabled={disabled}
                            value={minuteValue}
                            onChange={this.handleMinuteInputChange}
                        />
                    </div>
                    <ActionButtons
                        className={styles.actionButtons}
                        disabled={disabled}
                        onClearButtonClick={this.handleClearButtonClick}
                        onTodayButtonClick={this.handleTodayButtonClick}
                    />
                </div>
                <HintAndError
                    show={showHintAndError}
                    hint={hint}
                    error={error}
                />
            </div>
        );
    }
}

export default FaramElement('input')(Delay(TimeInput));
