import PropTypes from 'prop-types';
import React from 'react';

import FloatingContainer from '../../View/FloatingContainer';
import DatePicker from '../DatePicker';
import { iconNames } from '../../../constants';

import {
    calcFloatingPositionInMainWindow,
    getNumDaysInMonthX,
    isDateValid,
    encodeDate,
    decodeDate,
} from '../../../utils/common';
import styles from './styles.scss';


const propTypes = {
    className: PropTypes.string,
    showLabel: PropTypes.bool,
    label: PropTypes.string,
    disabled: PropTypes.bool,
    hint: PropTypes.string,
    error: PropTypes.string,
    value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    onChange: PropTypes.func,
    showHintAndError: PropTypes.bool,
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
};

const MIN_YEAR = 1990;

export default class DateInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getDateFromValues = ({
        dayValue,
        monthValue,
        yearValue,
    }) => {
        if (!dayValue || !monthValue || !yearValue) {
            return undefined;
        }

        if (yearValue < MIN_YEAR) {
            return undefined;
        }

        if (monthValue < 1 || monthValue > 12) {
            return undefined;
        }

        const maxNumberOfDays = getNumDaysInMonthX(yearValue, monthValue);
        if (dayValue < 1 || dayValue > maxNumberOfDays) {
            return undefined;
        }

        const date = new Date(
            yearValue,
            monthValue - 1,
            dayValue,
        );

        if (isDateValid(date)) {
            return date;
        }

        return undefined;
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

    componentWillReceiveProps(nextProps) {
        const { value: newValue } = nextProps;
        const { value: oldValue } = this.props;

        if (newValue !== oldValue) {
            const { d, m, y } = this.processValue(newValue);
            this.setState(
                {
                    dayValue: d,
                    monthValue: m,
                    yearValue: y,
                },
                this.validate,
            );
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
        const { onChange } = this.props;

        if (value) {
            const date = decodeDate(value);
            if (isDateValid(date)) {
                const d = date.getDate();
                const m = date.getMonth();
                const y = date.getFullYear();

                return {
                    d,
                    m: m + 1,
                    y,
                };
            }
            // If date is invalid, send back undefined
            onChange(undefined);
        }

        return {
            d: undefined,
            m: undefined,
            y: undefined,
        };
    }

    validate = () => {
        const { onChange } = this.props;
        const date = DateInput.getDateFromValues(this.state);

        if (date) {
            // DateInput value should be of format yyyy-MM-dd
            const value = encodeDate(date);
            onChange(value);
            this.setState({ isInvalid: false });
        } else {
            this.setState({ isInvalid: true });
        }
    }

    handleDayInputFocus = () => { this.setState({ isDayInputFocused: true }); }
    handleDayInputBlur = () => { this.setState({ isDayInputFocused: false }); }
    handleMonthInputFocus = () => { this.setState({ isMonthInputFocused: true }); }
    handleMonthInputBlur = () => { this.setState({ isMonthInputFocused: false }); }
    handleYearInputFocus = () => { this.setState({ isYearInputFocused: true }); }
    handleYearInputBlur = () => { this.setState({ isYearInputFocused: false }); }

    handleDayChange = (e) => {
        this.setState(
            { dayValue: e.target.value },
            this.validate,
        );
    }

    handleMonthChange = (e) => {
        this.setState(
            { monthValue: e.target.value },
            this.validate,
        );
    }

    handleYearChange = (e) => {
        this.setState(
            { yearValue: e.target.value },
            this.validate,
        );
    }

    handleClearButtonClick = () => {
        const { onChange } = this.props;

        // FIXME: possibly redundant
        this.setState({
            dayValue: undefined,
            monthValue: undefined,
            yearValue: undefined,
        });

        onChange(undefined);
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
        const containerRect = datePickerContainer.getBoundingClientRect();
        let parentRect = this.boundingClientRect;
        if (this.container) {
            parentRect = this.container.getBoundingClientRect();
        }

        const offset = { top: 0, right: 0, bottom: 0, left: 0 };
        const { showHintAndError } = this.props;
        if (showHintAndError) {
            offset.top = 12;
        }

        const optionsContainerPosition = (
            calcFloatingPositionInMainWindow(parentRect, containerRect, offset)
        );
        return optionsContainerPosition;
    }

    handleDatePickerBlur = () => {
        this.setState({ showDatePicker: false });
    }

    handleDatePickerDatePick = (timestamp) => {
        const newDate = decodeDate(timestamp);

        const {
            dayValue,
            monthValue,
            yearValue,
        } = this.state;
        const currentDate = DateInput.getDateFromValues({
            dayValue,
            monthValue,
            yearValue,
        });

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

    renderLabel = () => {
        const {
            showLabel,
            label,
        } = this.props;

        if (!showLabel) {
            return null;
        }

        const classNames = [
            'label',
            styles.label,
        ];

        return (
            <div className={classNames.join(' ')}>
                { label }
            </div>
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
            styles[unitClassName],
            'date-unit',
            styles['date-unit'],
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
                unitClassName="day-unit"
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
                unitClassName="month-unit"
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
                unitClassName="year-unit"
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
            styles['action-buttons'],
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
                >
                    <span className={iconNames.closeRound} />
                </button>
                <button
                    onClick={this.handleTodayButtonClick}
                    className={styles.button}
                    type="button"
                >
                    <span className={iconNames.clock} />
                </button>
                <button
                    onClick={this.handleCalendarButtonClick}
                    className={styles.button}
                    type="button"
                >
                    <span className={iconNames.calendar} />
                </button>
            </div>
        );
    }

    renderInput = () => {
        const classNames = [];
        classNames.push('input');
        classNames.push(styles.input);

        const DayUnit = this.renderDayUnit;
        const MonthUnit = this.renderMonthUnit;
        const YearUnit = this.renderYearUnit;
        const ActionButtons = this.renderActionButtons;

        return (
            <div className={classNames.join(' ')} >
                <div className={styles['date-units']}>
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

        const date = DateInput.getDateFromValues(this.state);

        return (
            <FloatingContainer
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

    renderHintAndError = () => {
        const {
            showHintAndError,
            hint,
            error,
        } = this.props;

        if (!showHintAndError) {
            return null;
        }

        if (error) {
            const classNames = [
                'error',
                styles.error,
            ];

            return (
                <p className={classNames.join(' ')}>
                    {error}
                </p>
            );
        }

        if (hint) {
            const classNames = [
                'hint',
                styles.hint,
            ];
            return (
                <p className={classNames.join(' ')}>
                    {hint}
                </p>
            );
        }

        const classNames = [
            'empty',
            styles.empty,
        ];
        return (
            <p className={classNames.join(' ')}>
                -
            </p>
        );
    }

    render() {
        const className = this.getClassName();

        const Label = this.renderLabel;
        const Input = this.renderInput;
        const FloatingDatePicker = this.renderDatePicker;
        const HintAndError = this.renderHintAndError;

        return (
            <div
                ref={(el) => { this.container = el; }}
                className={className}
            >
                <Label />
                <Input />
                <HintAndError />
                <FloatingDatePicker />
            </div>
        );
    }
}
