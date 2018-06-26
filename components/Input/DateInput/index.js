import PropTypes from 'prop-types';
import React from 'react';

import FloatingContainer from '../../View/FloatingContainer';
import DatePicker from '../DatePicker';
import { iconNames } from '../../../constants';

import {
    getNumDaysInMonthX,
    leftPad,
    decodeDate,
    getErrorForDateValues,
    MIN_YEAR,
} from '../../../utils/common';

import {
    calcFloatPositionInMainWindow,
    defaultOffset,
    defaultLimit,
} from '../../../utils/bounds';

import FaramElement from '../../Input/Faram/FaramElement';

import HintAndError from '../HintAndError';
import Label from '../Label';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    showLabel: PropTypes.bool,
    label: PropTypes.string,
    disabled: PropTypes.bool,
    hint: PropTypes.string,
    error: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    showHintAndError: PropTypes.bool,
    title: PropTypes.string,
};

const defaultProps = {
    className: '',
    showLabel: true,
    label: '',
    hint: '',
    error: '',
    disabled: false,
    value: undefined,
    onChange: undefined,
    showHintAndError: true,
    title: undefined,
};

class DateInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static encodeDateValues = ({
        dayValue,
        monthValue,
        yearValue,
    }) => {
        const yearStr = yearValue ? leftPad(yearValue, 4) : '';
        const monthStr = monthValue ? leftPad(monthValue, 2) : '';
        const dayStr = dayValue ? leftPad(dayValue, 2) : '';
        return `${yearStr}-${monthStr}-${dayStr}`;
    }

    static decodeDateValues = ({
        dayValue,
        monthValue,
        yearValue,
    }) => {
        if (!dayValue || !monthValue || !yearValue) {
            return undefined;
        }

        if (getErrorForDateValues({ yearValue, monthValue, dayValue })) {
            return undefined;
        }

        return new Date(
            yearValue,
            monthValue - 1,
            dayValue,
        );
    }

    constructor(props) {
        super(props);

        const { value } = this.props;
        const { d, m, y } = this.processValue(value);

        this.state = {
            showDatePicker: false,
            dayValue: d,
            monthValue: m,
            yearValue: y,
            isDayInputFocused: false,
            isMonthInputFocused: false,
            isYearInputFocused: false,
        };

        this.boundingClientRect = {};
    }

    componentWillMount() {
        this.validate(false);
    }

    componentWillReceiveProps(nextProps) {
        const { value: oldValue } = this.props;
        const { value: newValue } = nextProps;
        const { d, m, y } = this.processValue(newValue);

        if (this.currentValue !== newValue && oldValue !== newValue) {
            const newState = {
                dayValue: d,
                monthValue: m,
                yearValue: y,
            };

            if (!getErrorForDateValues(newState)) {
                this.setState(newState, this.validate);
            }
        }
    }

    getClassName = () => {
        const {
            className,
            error,
            disabled,
        } = this.props;

        const {
            isInvalid,
            isDayInputFocused,
            isMonthInputFocused,
            isYearInputFocused,
            showDatePicker,
        } = this.state;


        const classNames = [
            className,
            'date-input',
            styles.dateInput,
        ];

        if (isInvalid) {
            classNames.push('invalid');
            classNames.push(styles.invalid);
        }

        if (error) {
            classNames.push('error');
            classNames.push(styles.error);
        }

        const isFocused = isDayInputFocused
            || isMonthInputFocused
            || isYearInputFocused
            || showDatePicker;
        if (isFocused) {
            classNames.push('focused');
            classNames.push(styles.focused);
        }

        if (disabled) {
            classNames.push('disabled');
            classNames.push(styles.disabled);
        }

        return classNames.join(' ');
    }

    processValue = (value) => {
        if (value) {
            const dates = value.split('-');
            const y = dates[0];
            const m = dates[1];
            const d = dates[2];

            return { d, m, y };
        }

        return {
            d: undefined,
            m: undefined,
            y: undefined,
        };
    }

    validate = (callOnChange = true) => {
        const { onChange } = this.props;
        const value = DateInput.encodeDateValues(this.state);
        const isDateValid = !getErrorForDateValues(this.state);

        // DateInput value should be of format yyyy-MM-dd
        this.currentValue = value;
        if (callOnChange) {
            onChange(value);
        }
        this.setState({ isInvalid: !isDateValid });
    }

    handleDayInputFocus = () => { this.setState({ isDayInputFocused: true }); }
    handleDayInputBlur = () => { this.setState({ isDayInputFocused: false }); }
    handleMonthInputFocus = () => { this.setState({ isMonthInputFocused: true }); }
    handleMonthInputBlur = () => { this.setState({ isMonthInputFocused: false }); }
    handleYearInputFocus = () => { this.setState({ isYearInputFocused: true }); }
    handleYearInputBlur = () => { this.setState({ isYearInputFocused: false }); }

    handleDayChange = (e) => {
        this.setState(
            { dayValue: e.target.value && parseInt(e.target.value, 10) },
            this.validate,
        );
    }

    handleMonthChange = (e) => {
        this.setState(
            { monthValue: e.target.value && parseInt(e.target.value, 10) },
            this.validate,
        );
    }

    handleYearChange = (e) => {
        this.setState(
            { yearValue: e.target.value && parseInt(e.target.value, 10) },
            this.validate,
        );
    }

    handleClearButtonClick = () => {
        // FIXME: possibly redundant
        this.setState({
            dayValue: undefined,
            monthValue: undefined,
            yearValue: undefined,
        }, this.validate);
    }

    handleTodayButtonClick = () => {
        const today = new Date();

        // FIXME: possibly redundant
        this.setState({
            dayValue: today.getDate(),
            monthValue: today.getMonth() + 1,
            yearValue: today.getFullYear(),
        }, this.validate);
    }

    handleCalendarButtonClick = () => {
        if (this.container) {
            this.boundingClientRect = this.container.getBoundingClientRect();
        }
        this.setState({ showDatePicker: true });
    }

    handleDatePickerInvalidate = (datePickerContainer) => {
        const contentRect = datePickerContainer.getBoundingClientRect();
        let parentRect = this.boundingClientRect;
        if (this.container) {
            parentRect = this.container.getBoundingClientRect();
        }

        const { showHintAndError } = this.props;
        const offset = { ...defaultOffset };
        if (showHintAndError) {
            offset.top = 12;
        }

        const optionsContainerPosition = (
            calcFloatPositionInMainWindow({
                parentRect,
                contentRect,
                offset,
                limit: {
                    ...defaultLimit,
                    minW: parentRect.width,
                },
            })
        );

        return optionsContainerPosition;
    }

    handleDatePickerBlur = () => {
        this.setState({ showDatePicker: false });
    }

    handleDatePickerDatePick = (timestamp) => {
        const newDate = decodeDate(timestamp);
        const currentDate = DateInput.decodeDateValues(this.state);

        this.setState(
            { showDatePicker: false },
            () => {
                const eitherDateIsDefined = !!newDate || !!currentDate;
                const isNewDateUndefined = !newDate;
                const isCurrentDateUndefined = !currentDate;
                if (
                    eitherDateIsDefined && (
                        isNewDateUndefined ||
                        isCurrentDateUndefined ||
                        newDate.getTime() !== currentDate.getTime()
                    )
                ) {
                    this.setState({
                        dayValue: newDate.getDate(),
                        monthValue: newDate.getMonth() + 1,
                        yearValue: newDate.getFullYear(),
                    }, this.validate);
                }
            },
        );
    }

    renderDateUnit = ({
        unitClassName,
        placeholder,
        min = 1,
        max,
        onChange,
        value = '',
        onFocus,
        onBlur,
    }) => {
        const {
            disabled,
        } = this.props;

        const classNames = [
            unitClassName,
            'date-unit',
            styles.dateUnit,
        ];

        return (
            <input
                disabled={disabled}
                min={min}
                max={max}
                placeholder={placeholder}
                className={classNames.join(' ')}
                type="number"
                onChange={onChange}
                value={value}
                onFocus={onFocus}
                onBlur={onBlur}
            />
        );
    };

    renderDayUnit = () => {
        const DateUnit = this.renderDateUnit;
        const {
            yearValue,
            monthValue,
            dayValue,
        } = this.state;
        const maxDay = getNumDaysInMonthX(yearValue, monthValue);

        return (
            <DateUnit
                max={maxDay}
                placeholder="dd"
                unitClassName={styles.dayUnit}
                value={dayValue}
                onChange={this.handleDayChange}
                onFocus={this.handleDayInputFocus}
                onBlur={this.handleDayInputBlur}
            />
        );
    };

    renderMonthUnit = () => {
        const DateUnit = this.renderDateUnit;
        const maxMonth = 12;
        const { monthValue } = this.state;

        return (
            <DateUnit
                max={maxMonth}
                placeholder="mm"
                unitClassName={styles.monthUnit}
                value={monthValue}
                onChange={this.handleMonthChange}
                onFocus={this.handleMonthInputFocus}
                onBlur={this.handleMonthInputBlur}
            />
        );
    };

    renderYearUnit = () => {
        const DateUnit = this.renderDateUnit;
        const minYear = MIN_YEAR;
        const { yearValue } = this.state;

        return (
            <DateUnit
                placeholder="yyyy"
                unitClassName={styles.yearUnit}
                min={minYear}
                value={yearValue}
                onChange={this.handleYearChange}
                onFocus={this.handleYearInputFocus}
                onBlur={this.handleYearInputBlur}
            />
        );
    };

    renderActionButtons = () => {
        const { disabled } = this.props;

        if (disabled) {
            return null;
        }

        const classNames = [
            'action-buttons',
            styles.actionButtons,
        ];

        const clearButtonClassName = [
            'button',
            styles.button,
            'clear',
            styles.clear,
        ].join(' ');

        return (
            <div
                className={classNames.join(' ')}
            >
                <button
                    className={clearButtonClassName}
                    type="button"
                    onClick={this.handleClearButtonClick}
                    title="Clear date"
                    tabIndex="-1"
                >
                    <span className={iconNames.closeRound} />
                </button>
                <button
                    onClick={this.handleTodayButtonClick}
                    className={styles.button}
                    type="button"
                    title="Set date to today"
                    tabIndex="-1"
                >
                    <span className={iconNames.clock} />
                </button>
                <button
                    onClick={this.handleCalendarButtonClick}
                    className={styles.button}
                    type="button"
                    title="Open date picker"
                    tabIndex="-1"
                >
                    <span className={iconNames.calendar} />
                </button>
            </div>
        );
    }

    renderInput = () => {
        const classNames = [
            'input',
            styles.input,
        ];
        classNames.push('input');
        classNames.push(styles.input);

        const DayUnit = this.renderDayUnit;
        const MonthUnit = this.renderMonthUnit;
        const YearUnit = this.renderYearUnit;
        const ActionButtons = this.renderActionButtons;

        return (
            <div className={classNames.join(' ')} >
                <div className={styles.dateUnits}>
                    <DayUnit />
                    <MonthUnit />
                    <YearUnit />
                </div>
                <ActionButtons />
            </div>
        );
    }

    renderDatePicker = () => {
        const { showDatePicker } = this.state;

        if (!showDatePicker) {
            return null;
        }

        const date = DateInput.decodeDateValues(this.state);

        return (
            <FloatingContainer
                className={styles.datePickerContainer}
                parent={this.container}
                onBlur={this.handleDatePickerBlur}
                onInvalidate={this.handleDatePickerInvalidate}
            >
                <DatePicker
                    value={date && date.getTime()}
                    onChange={this.handleDatePickerDatePick}
                />
            </FloatingContainer>
        );
    }

    render() {
        const {
            showLabel,
            label,
            hint,
            error,
            showHintAndError,
            title,
        } = this.props;
        const className = this.getClassName();

        const InputElement = this.renderInput;
        const FloatingDatePicker = this.renderDatePicker;

        return (
            <div
                ref={(el) => { this.container = el; }}
                className={className}
                title={title}
            >
                <Label
                    className={styles.label}
                    show={showLabel}
                    text={label}
                />
                <InputElement />
                <HintAndError
                    show={showHintAndError}
                    hint={hint}
                    error={error}
                />
                <FloatingDatePicker />
            </div>
        );
    }
}

export default FaramElement('input')(DateInput);
