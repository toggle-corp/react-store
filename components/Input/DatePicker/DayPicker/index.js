import PropTypes from 'prop-types';
import React from 'react';

import Button from '../../../Action/Button';
import iconNames from '../../../../constants/iconNames';

import DaysHeader from './DaysHeader';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    onChange: PropTypes.func,
    onYearMonthChange: PropTypes.func,
    onMonthClick: PropTypes.func,
};

const defaultProps = {
    className: '',
    value: undefined,
    onChange: undefined,
    onYearMonthChange: undefined,
    onMonthClick: undefined,
};


export default class DayPicker extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    constructor(props) {
        super(props);
        this.createDays(props);
    }

    componentWillReceiveProps(nextProps) {
        if (
            this.props.year !== nextProps.year ||
            this.props.month !== nextProps.month ||
            this.props.value !== nextProps.value
        ) {
            this.createDays(nextProps);
        }
    }

    getDayClassName = (dayKey) => {
        const classNames = [styles.day];
        if (this.selectedId === dayKey) {
            classNames.push('selected');
            classNames.push(styles.selected);
        }
        return classNames.join(' ');
    }

    createDays({ year, month, value }) {
        const firstDate = new Date(year, month - 1, 1);
        const lastDate = new Date(year, month, 0);
        const selected = value && new Date(value);

        const numDays = (lastDate.getDate() - firstDate.getDate()) + 1;
        const firstDay = firstDate.getDay();
        const totalDays = numDays + firstDay;
        const lastDay = lastDate.getDay();

        this.selectedId = -1;
        if (selected && selected.getFullYear() === year && selected.getMonth() + 1 === month) {
            this.selectedId = (firstDay + selected.getDate());
        }

        const weeks = [];
        for (let i = 0; i < totalDays / 7; i += 1) {
            const days = [];
            if (i === 0) {
                for (let j = 0; j < firstDay; j += 1) {
                    days.push({ key: j, value: undefined });
                }
                for (let j = firstDay; j < 7; j += 1) {
                    days.push({ key: j + 1, value: (j - firstDay) + 1 });
                }
            } else if (i === parseInt(totalDays / 7, 10)) {
                const initial = (i * 7) + 1;
                for (let j = 0; j <= lastDay; j += 1) {
                    days.push({ key: initial + j, value: initial + (j - firstDay) });
                }
            } else {
                const initial = (i * 7) + 1;
                for (let j = 0; j < 7; j += 1) {
                    days.push({ key: initial + j, value: initial + (j - firstDay) });
                }
            }

            weeks.push({
                week: i,
                days,
            });
        }
        this.weeks = weeks;
    }

    handleDayChange = (value) => {
        if (!value) {
            return;
        }

        const { year, month, onChange } = this.props;
        const newValue = new Date(year, month - 1, value);

        if (onChange) {
            const oldTimestamp = value && new Date(value).getTime();
            const newTimestamp = newValue.getTime();
            onChange(newTimestamp, oldTimestamp !== newTimestamp);
        }
    }

    handlePrevious = () => {
        const { year, month, onYearMonthChange } = this.props;
        if (onYearMonthChange) {
            const date = new Date(year, month - 2, 1);
            if (date.getFullYear() >= 1990) {
                onYearMonthChange(date.getFullYear(), date.getMonth() + 1);
            }
        }
    }

    handleNext = () => {
        const { year, month, onYearMonthChange } = this.props;
        if (onYearMonthChange) {
            const date = new Date(year, month, 1);
            onYearMonthChange(date.getFullYear(), date.getMonth() + 1);
        }
    }

    renderDay = day => (
        <div
            key={day.key}
            className={this.getDayClassName(day.key)}
        >
            {
                day.value && (
                    <Button
                        onClick={() => this.handleDayChange(day.value)}
                        transparent
                    >
                        {day.value}
                    </Button>
                )
            }
        </div>
    )

    renderWeek = week => (
        <div
            key={week.week}
            className={styles.week}
        >
            { week.days.map(this.renderDay) }
        </div>
    )

    render() {
        const {
            className,
            month,
            year,
            onMonthClick,
        } = this.props;
        const monthName = DayPicker.monthNames[month - 1];

        const classNames = [
            className,
            'day-picker',
            styles.dayPicker,
        ];

        return (
            <div className={classNames.join(' ')}>
                <header className={styles.header}>
                    <Button
                        className={styles.left}
                        onClick={this.handlePrevious}
                        transparent
                        iconName={iconNames.chevronLeft}
                    />
                    <Button
                        className={styles.month}
                        onClick={onMonthClick}
                        transparent
                    >
                        { monthName }, { year}
                    </Button>
                    <Button
                        className={styles.right}
                        onClick={this.handleNext}
                        transparent
                        iconName={iconNames.chevronRight}
                    />
                    <DaysHeader className={styles.days} />
                </header>
                <div className={styles.weeks}>
                    { this.weeks.map(this.renderWeek) }
                </div>
            </div>
        );
    }
}
