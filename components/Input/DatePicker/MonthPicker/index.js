import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

const propTypes = {
    year: PropTypes.number.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    onYearMonthChange: PropTypes.func,
    onYearClick: PropTypes.func,
};

const defaultProps = {
    value: undefined,
    onYearMonthChange: undefined,
    onYearClick: undefined,
};


export default class MonthPicker extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    getMonthClassName = (monthIndex) => {
        const { year, value } = this.props;
        const classNames = [styles.month];

        const selected = value && new Date(value);
        if (selected && monthIndex === selected.getMonth() && year === selected.getFullYear()) {
            classNames.push(styles.selected);
        }
        return classNames.join(' ');
    }

    handleMonthChange = (monthIndex) => {
        const { year, onYearMonthChange } = this.props;
        if (onYearMonthChange) {
            onYearMonthChange(year, monthIndex + 1, 'day');
        }
    }

    render() {
        const {
            year,
            onYearClick,
        } = this.props;

        return (
            <div className={styles['month-picker']}>
                <div className={styles.header}>
                    <button onClick={onYearClick}>
                        { year }
                    </button>
                </div>

                <div className={styles.months}>
                    {MonthPicker.monthNames.map((monthName, monthIndex) => (
                        <button
                            key={monthName}
                            className={this.getMonthClassName(monthIndex)}
                            onClick={() => this.handleMonthChange(monthIndex)}
                        >
                            { monthName }
                        </button>
                    ))}
                </div>
            </div>
        );
    }
}
