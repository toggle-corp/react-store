import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import Button from '../../../Action/Button';
import iconNames from '../../../../constants/iconNames';

const propTypes = {
    className: PropTypes.string,
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    onYearMonthChange: PropTypes.func,
    onYearClick: PropTypes.func,
};

const defaultProps = {
    className: '',
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

    handlePrevYearClick = () => {
        const { year, month, onYearMonthChange } = this.props;
        if (year > 1990 && onYearMonthChange) {
            onYearMonthChange(year - 1, month);
        }
    }

    handleNextYearClick = () => {
        const { year, month, onYearMonthChange } = this.props;
        if (onYearMonthChange) {
            onYearMonthChange(year + 1, month);
        }
    }

    handleMonthChange = (monthIndex) => {
        const { year, onYearMonthChange } = this.props;
        if (onYearMonthChange) {
            onYearMonthChange(year, monthIndex + 1, 'day');
        }
    }

    render() {
        const {
            className,
            year,
            onYearClick,
        } = this.props;

        return (
            <div className={`${className} ${styles['month-picker']}`}>
                <header className={styles.header}>
                    <Button
                        className={styles.left}
                        onClick={this.handlePrevYearClick}
                        type="button"
                        transparent
                        iconName={iconNames.chevronLeft}
                    />
                    <Button
                        className={styles.year}
                        onClick={onYearClick}
                        type="button"
                        transparent
                    >
                        { year }
                    </Button>
                    <Button
                        className={styles.right}
                        onClick={this.handleNextYearClick}
                        type="button"
                        transparent
                        iconName={iconNames.chevronRight}
                    />
                </header>

                <div className={styles.months}>
                    {MonthPicker.monthNames.map((monthName, monthIndex) => (
                        <Button
                            key={monthName}
                            className={this.getMonthClassName(monthIndex)}
                            onClick={() => this.handleMonthChange(monthIndex)}
                            type="button"
                            transparent
                        >
                            { monthName }
                        </Button>
                    ))}
                </div>
            </div>
        );
    }
}
