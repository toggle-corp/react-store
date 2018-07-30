import PropTypes from 'prop-types';
import React from 'react';

import FaramElement from '../../Input/Faram/FaramElement';
import Delay from '../../General/Delay';

import HintAndError from '../HintAndError';
import Label from '../Label';

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
};

const defaultProps = {
    className: '',
    disabled: false,
    error: '',
    hint: '',
    label: '',
    onChange: () => {},
    showLabel: true,
    showHintAndError: true,
    value: undefined,
    title: undefined,
};

const MIN_HOUR = 0;
const MAX_HOUR = 23;
const MIN_MINUTE = 0;
const MAX_MINUTE = 59;
const MIN_SECOND = 0;
const MAX_SECOND = 59;
const STEP = 1;

const SEPARATOR = ':';
const PADDER = '00';

const formatTimeValue = value => (
    value === undefined || value === ''
        ? undefined
        : (PADDER + value).slice(-PADDER.length)
);

const getTimeValues = (value) => {
    if (!value) {
        return {};
    }
    const values = value.split(SEPARATOR);
    return {
        h: values[0],
        m: values[1],
        s: values[2],
    };
};

const getTimeString = (h, m, s) => (
    `${h || '00'}${SEPARATOR}${m || '00'}${SEPARATOR}${s || '00'}`
);

const isValidTimeString = (value) => {
    const values = getTimeValues(value);
    const {
        h,
        m,
        s,
    } = values;

    return !(
        (h < MIN_HOUR || h > MAX_HOUR)
        || (m < MIN_MINUTE || m > MAX_MINUTE)
        || (s < MIN_SECOND || s > MAX_SECOND)
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

        if (!isValidTimeString(value)) {
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

    handleHourInputChange = (e) => {
        const { value: h } = e.target;
        const {
            value: valueFromProps,
            onChange,
        } = this.props;

        const values = getTimeValues(valueFromProps);
        const {
            m,
            s,
        } = values;

        const newValue = getTimeString(
            formatTimeValue(h),
            formatTimeValue(m),
            formatTimeValue(s),
        );

        if (newValue !== valueFromProps) {
            onChange(newValue);
        }
    }

    handleMinuteInputChange = (e) => {
        const { value: m } = e.target;
        const {
            value: valueFromProps,
            onChange,
        } = this.props;

        const values = getTimeValues(valueFromProps);
        const {
            h,
            s,
        } = values;

        const newValue = getTimeString(
            formatTimeValue(h),
            formatTimeValue(m),
            formatTimeValue(s),
        );

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
        } = this.props;

        const className = this.getClassName();
        const hourPlaceholder = 'hh';
        const minutePlaceholder = 'mm';

        const {
            h: hourValue = '',
            m: minuteValue = '',
        } = getTimeValues(value);

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
                <div className={styles.inputs}>
                    <input
                        onFocus={this.handleHourInputFocus}
                        onBlur={this.handleHourInputBlur}
                        className={styles.input}
                        type="number"
                        min={MIN_HOUR}
                        max={MAX_HOUR}
                        step={STEP}
                        placeholder={hourPlaceholder}
                        disabled={disabled}
                        value={hourValue}
                        onChange={this.handleHourInputChange}
                    />
                    <input
                        onFocus={this.handleMinuteInputFocus}
                        onBlur={this.handleMinuteInputBlur}
                        className={styles.input}
                        type="number"
                        min={MIN_MINUTE}
                        max={MAX_MINUTE}
                        step={STEP}
                        placeholder={minutePlaceholder}
                        disabled={disabled}
                        value={minuteValue}
                        onChange={this.handleMinuteInputChange}
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
