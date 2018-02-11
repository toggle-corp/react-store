import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import DaysHeader from './DaysHeader';
import styles from './styles.scss';

const propTypes = {
    date: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    onDatePick: PropTypes.func,
};

const defaultProps = {
    date: undefined,
    onDatePick: undefined,
};


@CSSModules(styles, { allowMultiple: true })
export default class DatePicker extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    constructor(props) {
        super(props);

        this.today = new Date();

        this.state = {
            selected: this.props.date && new Date(this.props.date),
            current: (props.date && new Date(props.date)) || this.today,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.date !== (this.state.selected && this.state.selected.getTime())) {
            this.setState({
                selected: nextProps.date && new Date(nextProps.date),
                current: (nextProps.date && new Date(nextProps.date)) || this.state.current,
            });
        }
    }

    previous = () => {
        const current = this.state.current;
        current.setMonth(current.getMonth() - 1);
        this.setState({ current: new Date(current.getTime()) });
    }

    next = () => {
        const current = this.state.current;
        current.setMonth(current.getMonth() + 1);
        this.setState({ current: new Date(current.getTime()) });
    }

    selectDateInCurrentMonth = (date) => {
        if (date) {
            const selected = new Date(this.state.current.getTime());
            selected.setDate(date);
            this.setState({ selected });

            if (this.props.onDatePick) {
                this.props.onDatePick(selected.getTime());
            }
        }
    }

    renderMonthTitle() {
        const currentMonth = this.state.current.getMonth();
        const monthName = DatePicker.monthNames[currentMonth];

        return (
            <div styleName="month-title">
                {monthName}
            </div>
        );
    }

    renderWeeks() {
        const selected = this.state.selected;
        const today = this.today;
        const current = this.state.current;

        const year = current.getFullYear();
        const month = current.getMonth();

        const firstDate = new Date(year, month, 1);
        const lastDate = new Date(year, month + 1, 0);

        const numDays = (lastDate.getDate() - firstDate.getDate()) + 1;
        const firstDay = firstDate.getDay();
        const totalDays = numDays + firstDay;
        const lastDay = lastDate.getDay();

        let selectedId = -1;
        if (selected && selected.getFullYear() === year && selected.getMonth() === month) {
            selectedId = (firstDay + selected.getDate());
        }

        let todayId = -1;
        if (today.getFullYear() === year && today.getMonth() === month) {
            todayId = (firstDay + this.today.getDate());
        }

        const weeks = [];
        for (let i = 0; i < totalDays / 7; i += 1) {
            const days = [];
            if (i === 0) {
                for (let j = 0; j < firstDay; j += 1) {
                    days.push({ key: j, value: '' });
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

        return (
            <div
                className="weeks"
                styleName="weeks"
            >
                {
                    weeks.map(week => (
                        <div
                            className="week"
                            key={week.week}
                            styleName="week"
                        >
                            {
                                week.days.map(day => (
                                    <div
                                        className={`
                                            day
                                            ${selectedId === day.key ? 'selected' : ''}
                                            ${todayId === day.key ? 'today' : ''}
                                        `}
                                        key={day.key}
                                        styleName={`
                                            day
                                            ${selectedId === day.key ? 'selected' : ''}
                                            ${todayId === day.key ? 'today' : ''}
                                        `}
                                    >
                                        <button
                                            className="day-button"
                                            onClick={() => this.selectDateInCurrentMonth(day.value)}
                                            type="button"
                                        >
                                            {day.value}
                                        </button>
                                    </div>
                                ))
                            }
                        </div>
                    ))
                }
            </div>
        );
    }

    render() {
        return (
            <div
                className="date-picker-wrapper"
                styleName="date-picker-wrapper"
            >
                <div
                    className="date-picker-header"
                    styleName="date-picker-header"
                >
                    <button
                        className="previous-button"
                        onClick={this.previous}
                        type="button"
                    >
                        &lt;
                    </button>
                    { this.renderMonthTitle() }
                    <button
                        className="next-button"
                        onClick={this.next}
                        type="button"
                    >
                        &gt;
                    </button>
                </div>
                <DaysHeader
                    styleName="days-header"
                />
                { this.renderWeeks() }
            </div>
        );
    }
}
