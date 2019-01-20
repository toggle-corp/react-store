import PropTypes from 'prop-types';
import React from 'react';

import { FaramInputElement } from '../../General/FaramElements';
import FloatingContainer from '../../View/FloatingContainer';
import Delay from '../../General/Delay';
import DatePicker from '../DatePicker';

import HintAndError from '../HintAndError';
import Label from '../Label';
import DigitalInput from '../DigitalInput';

import {
    leftPad,
    getErrorForDateValues,
    getNumDaysInMonthX,
    isFalsy,
    decodeDate as decodeAsDate,
} from '../../../utils/common';
import {
    calcFloatPositionInMainWindow,
    defaultOffset,
    defaultLimit,
} from '../../../utils/bounds';

import ActionButtons from './ActionButtons';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    hint: PropTypes.string,
    error: PropTypes.string,
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
    separator: '-',
    readOnly: false,
    value: undefined,
    showHintAndError: true,
    title: undefined,
};

const MIN_YEAR = 1900;
const MAX_YEAR = 9999;
const MIN_MONTH = 1;
const MAX_MONTH = 12;
const MIN_DAY = 1;
const STEP = 1;

const createDate = (y, m, d) => {
    if (getErrorForDateValues({ yearValue: y, monthValue: m, dayValue: d })) {
        return undefined;
    }
    return new Date(y, m - 1, d);
};


// y, m, d is string
const encodeDate = ({ y = '', m = '', d = '' }, separator) => {
    if (isFalsy(y, [0, '']) && isFalsy(m, [0, '']) && isFalsy(d, [0, ''])) {
        return undefined;
    }
    return `${y}${separator}${m}${separator}${d}`;
};

// value is string
const decodeDate = (value, separator) => {
    if (!value) {
        return {};
    }
    const values = value.split(separator);
    return {
        y: values[0],
        m: values[1],
        d: values[2],
    };
};

// value is string
const isValidDateString = (value, separator) => {
    if (value === '' || value === undefined) {
        return true;
    }
    const { y, m, d } = decodeDate(value, separator);

    return !getErrorForDateValues({ yearValue: +y, monthValue: +m, dayValue: +d });
};

class DateInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            yearInputFocused: false,
            monthInputFocused: false,
            dayInputFocused: false,
            showDatePicker: false,
        };

        this.containerRef = React.createRef();
        this.boundingClientRect = {};
    }

    getClassName = () => {
        const {
            disabled,
            className,
            value,
            error,
            separator,
            readOnly,
        } = this.props;

        const {
            yearInputFocused,
            monthInputFocused,
            dayInputFocused,
        } = this.state;

        const classNames = [
            className,
            'date-input',
            styles.dateInput,
        ];

        if (yearInputFocused || monthInputFocused || dayInputFocused) {
            classNames.push(styles.focused);
            classNames.push('input-focused');
            classNames.push('input-in-focus');
        }

        if (disabled) {
            classNames.push(styles.disabled);
            classNames.push('disabled');
        }

        const isInvalid = !isValidDateString(value, separator);
        if (isInvalid) {
            classNames.push(styles.invalid);
            classNames.push('invalid');
        }

        if (error) {
            classNames.push(styles.error);
            classNames.push('error');
        }

        if (readOnly) {
            classNames.push('read-only');
            classNames.push(styles.readOnly);
        }

        return classNames.join(' ');
    }

    handleYearInputFocus = () => {
        this.setState({ yearInputFocused: true });
    }

    handleYearInputBlur = () => {
        this.setState({ yearInputFocused: false });
    }

    handleMonthInputFocus = () => {
        this.setState({ monthInputFocused: true });
    }

    handleMonthInputBlur = () => {
        this.setState({ monthInputFocused: false });
    }

    handleDayInputFocus = () => {
        this.setState({ dayInputFocused: true });
    }

    handleDayInputBlur = () => {
        this.setState({ dayInputFocused: false });
    }

    handleYearInputChange = (y) => {
        this.handleChange({ y });
    }

    handleMonthInputChange = (m) => {
        this.handleChange({ m });
    }

    handleDayInputChange = (d) => {
        this.handleChange({ d });
    }

    handleClearButtonClick = () => {
        this.handleChange({
            y: undefined,
            m: undefined,
            d: undefined,
        });
    }

    handleTodayButtonClick = () => {
        const date = new Date();
        this.handleChange({
            y: leftPad(String(date.getFullYear()), 4).slice(-4),
            m: leftPad(String(date.getMonth() + 1), 2).slice(-2),
            d: leftPad(String(date.getDate()), 2).slice(-2),
        });
    }

    handleCalendarButtonClick = () => {
        const { current: container } = this.containerRef;
        this.boundingClientRect = container.getBoundingClientRect();
        this.setState({ showDatePicker: true });
    }

    handleDatePickerBlur = () => {
        this.setState({ showDatePicker: false });
    }

    handleDatePickerInvalidate = (datePickerContainer) => {
        const contentRect = datePickerContainer.getBoundingClientRect();

        const { current: container } = this.containerRef;
        const parentRect = container
            ? container.getBoundingClientRect()
            : this.boundingClientRect;

        const { showHintAndError } = this.props;
        const offset = { ...defaultOffset };
        if (showHintAndError) {
            offset.top = 12;
        }

        const optionsContainerPosition = calcFloatPositionInMainWindow({
            parentRect,
            contentRect,
            offset,
            limit: {
                ...defaultLimit,
                minW: parentRect.width,
            },
        });

        return optionsContainerPosition;
    }

    handleDatePickerDatePick = (timestamp) => {
        const newDate = decodeAsDate(timestamp);
        this.setState(
            { showDatePicker: false },
            () => {
                this.handleChange({
                    y: leftPad(String(newDate.getFullYear()), 4).slice(-4),
                    m: leftPad(String(newDate.getMonth() + 1), 2).slice(-2),
                    d: leftPad(String(newDate.getDate()), 2).slice(-2),
                });
            },
        );
    }

    handleChange = (valueToOverride) => {
        const {
            onChange,
            value: valueFromProps,
            separator,
        } = this.props;

        const oldValue = decodeDate(valueFromProps, separator);
        const { y, m, d } = {
            ...oldValue,
            ...valueToOverride,
        };

        const newValue = encodeDate({ y, m, d }, separator);
        if (newValue !== valueFromProps) {
            onChange(newValue);
        }
    }

    renderDatePicker = ({ y, m, d }) => {
        const date = createDate(+y, +m, +d);
        const datetime = date && date.getTime();

        return (
            <FloatingContainer
                className={styles.datePickerContainer}
                parent={this.container}
                onBlur={this.handleDatePickerBlur}
                onInvalidate={this.handleDatePickerInvalidate}
            >
                <DatePicker
                    value={datetime}
                    onChange={this.handleDatePickerDatePick}
                />
            </FloatingContainer>
        );
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
            readOnly,
            separator,
        } = this.props;
        const { showDatePicker } = this.state;

        const className = this.getClassName();
        const yearPlaceholder = 'yyyy';
        const monthPlaceholder = 'mm';
        const dayPlaceholder = 'dd';

        const {
            y: yearValue = '',
            m: monthValue = '',
            d: dayValue = '',
        } = decodeDate(value, separator);

        const FloatingDatePicker = this.renderDatePicker;
        const inputAndActionsClassName = `
            ${styles.input}
            input-and-actions
        `;

        return (
            <div
                ref={this.containerRef}
                title={title}
                className={className}
            >
                <Label
                    className={styles.label}
                    show={showLabel}
                    text={label}
                />
                <div className={inputAndActionsClassName}>
                    <div className={styles.units}>
                        <DigitalInput
                            onFocus={this.handleDayInputFocus}
                            onBlur={this.handleDayInputBlur}
                            className={styles.dayUnit}
                            padLength={2}
                            min={MIN_DAY}
                            max={getNumDaysInMonthX(+yearValue, +monthValue)}
                            step={STEP}
                            placeholder={dayPlaceholder}
                            disabled={disabled || readOnly}
                            value={dayValue}
                            onChange={this.handleDayInputChange}
                        />
                        <DigitalInput
                            onFocus={this.handleMonthInputFocus}
                            onBlur={this.handleMonthInputBlur}
                            className={styles.monthUnit}
                            padLength={2}
                            min={MIN_MONTH}
                            max={MAX_MONTH}
                            step={STEP}
                            placeholder={monthPlaceholder}
                            disabled={disabled || readOnly}
                            value={monthValue}
                            onChange={this.handleMonthInputChange}
                        />
                        <DigitalInput
                            onFocus={this.handleYearInputFocus}
                            onBlur={this.handleYearInputBlur}
                            className={styles.yearUnit}
                            padLength={4}
                            min={MIN_YEAR}
                            max={MAX_YEAR}
                            step={STEP}
                            placeholder={yearPlaceholder}
                            disabled={disabled || readOnly}
                            value={yearValue}
                            onChange={this.handleYearInputChange}
                        />
                    </div>
                    <ActionButtons
                        className={styles.actionButtons}
                        disabled={disabled}
                        readOnly={readOnly}
                        onClearButtonClick={this.handleClearButtonClick}
                        onTodayButtonClick={this.handleTodayButtonClick}
                        onCalendarButtonClick={this.handleCalendarButtonClick}
                    />
                </div>
                <HintAndError
                    show={showHintAndError}
                    hint={hint}
                    error={error}
                />
                { showDatePicker &&
                    <FloatingDatePicker
                        y={yearValue}
                        m={monthValue}
                        d={dayValue}
                    />
                }
            </div>
        );
    }
}

export default FaramInputElement(Delay(DateInput));
