import PropTypes from 'prop-types';
import React from 'react';

import { iconNames } from '../../../constants';

import styles from './styles.scss';

const propTypes = {
    showLabel: PropTypes.bool,
    label: PropTypes.string,
    disabled: PropTypes.bool,
    value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    onChange: PropTypes.func,
};
const defaultProps = {
    showLabel: true,
    label: 'Hello world',
    disabled: false,
    value: undefined,
    onChange: undefined,
};

const MIN_YEAR = 1990;

const isDateValid = (date) => {
    if (Object.prototype.toString.call(date) === '[object Date]') {
        // it is a date
        if (isNaN(date.getTime())) {
            return false;
        }

        return true;
    }

    return false;
};

export default class DateInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { value } = this.props;
        const { d, m, y } = this.processValue(value);

        this.state = {
            showDatePicker: false,
            dayValue: d,
            monthValue: m,
            yearValue: y,
        };
    }

    componentWillReceiveProps(nextProps) {
        const { value: newValue } = nextProps;
        const { value: oldValue } = this.props;

        if (newValue !== oldValue) {
            const { d, m, y } = this.processValue(newValue);
            this.setState({
                dayValue: d,
                monthValue: m,
                yearValue: y,
            });
        }
    }

    getClassName = () => {
        const classNames = [];

        const { isInvalid } = this.state;

        classNames.push('date-input');
        classNames.push(styles['date-input']);

        if (isInvalid) {
            classNames.push('invalid');
            classNames.push(styles.invalid);
        }

        return classNames.join(' ');
    }

    processValue = (value) => {
        if (value) {
            // TODO: handle for invalid date
            const date = new Date(value);
            const d = date.getDate();
            const m = date.getMonth();
            const y = date.getFullYear();

            return {
                d,
                m: m + 1,
                y,
            };
        }

        return {
            d: undefined,
            m: undefined,
            y: undefined,
        };
    }

    validate = () => {
        const {
            dayValue,
            monthValue,
            yearValue,
        } = this.state;

        const { onChange } = this.props;

        if (!dayValue || !monthValue || !yearValue) {
            this.setState({ isInvalid: true });
            return;
        }

        if (yearValue < MIN_YEAR) {
            this.setState({ isInvalid: true });
            return;
        }

        if (monthValue < 1 || monthValue > 12) {
            this.setState({ isInvalid: true });
            return;
        }

        if (dayValue < 1 || dayValue > 31) {
            this.setState({ isInvalid: true });
            return;
        }

        const date = new Date(
            yearValue,
            monthValue - 1,
            dayValue,
        );

        if (isDateValid(date)) {
            onChange(date.toISOString());
            this.setState({ isInvalid: false });
        } else {
            this.setState({ isInvalid: true });
        }
    }

    handleDayChange = (e) => {
        this.setState(
            { dayValue: e.target.value },
            () => this.validate(),
        );
    }

    handleMonthChange = (e) => {
        this.setState(
            { monthValue: e.target.value },
            () => this.validate(),
        );
    }

    handleYearChange = (e) => {
        this.setState(
            { yearValue: e.target.value },
            () => this.validate(),
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
            <div
                className={classNames.join(' ')}
            >
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
            />
        );
    };

    renderDayUnit = () => {
        const DateUnit = this.renderDateUnit;
        const maxDay = 32;
        const { dayValue } = this.state;

        return (
            <DateUnit
                max={maxDay}
                placeholder="dd"
                unitClassName="day-unit"
                value={dayValue}
                onChange={this.handleDayChange}
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
            />
        );
    };

    renderInput = () => {
        const classNames = [];
        classNames.push('input');
        classNames.push(styles.input);

        const DayUnit = this.renderDayUnit;
        const MonthUnit = this.renderMonthUnit;
        const YearUnit = this.renderYearUnit;

        const {
            value,
        } = this.props;

        return (
            <div
                className={classNames.join(' ')}
            >
                <DayUnit />
                <MonthUnit />
                <YearUnit />
            </div>
        );
    }

    renderDatePicker = () => (
        null
    )

    render() {
        const className = this.getClassName();

        const Label = this.renderLabel;
        const Input = this.renderInput;
        const DatePicker = this.renderDatePicker;

        return (
            <div
                className={className}
            >
                <Label />
                <Input />
                <DatePicker />
            </div>
        );
    }
}
