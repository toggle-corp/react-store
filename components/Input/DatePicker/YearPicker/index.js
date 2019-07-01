import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import Button from '../../../Action/Button';

const propTypes = {
    className: PropTypes.string,
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    value: PropTypes.number,
    onYearMonthChange: PropTypes.func,
};

const defaultProps = {
    className: '',
    value: undefined,
    onYearMonthChange: undefined,
};


const YEARS_PER_PAGE = 12;

export default class YearPicker extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            startYear: Math.round(this.props.year / YEARS_PER_PAGE) * YEARS_PER_PAGE,
        };
    }

    getYearClassName = (year) => {
        const { value } = this.props;
        const classNames = [styles.year];

        const selected = value ? new Date(value).getFullYear() : -1;
        if (selected === year) {
            classNames.push(styles.selected);
        }
        return classNames.join(' ');
    }

    handleYearChange = (year) => {
        const { month, onYearMonthChange } = this.props;
        if (year >= 1990 && onYearMonthChange) {
            onYearMonthChange(year, month, 'month');
        }
    }

    handlePrevious = () => {
        this.setState({ startYear: this.state.startYear - YEARS_PER_PAGE });
    }

    handleNext = () => {
        this.setState({ startYear: this.state.startYear + YEARS_PER_PAGE });
    }

    render() {
        const { startYear } = this.state;
        const { className } = this.props;

        const years = [];
        for (let i = 0; i < YEARS_PER_PAGE; i += 1) {
            years.push(startYear + i);
        }
        const endYear = (startYear + YEARS_PER_PAGE) - 1;

        return (
            <div className={`${className} ${styles.yearPicker}`}>
                <header className={styles.header}>
                    <Button
                        className={styles.left}
                        onClick={this.handlePrevious}
                        transparent
                        iconName="chevronLeft"
                    />
                    <Button
                        className={styles.title}
                        transparent
                    >
                        { startYear }
                        -
                        { endYear }
                    </Button>
                    <Button
                        className={styles.right}
                        onClick={this.handleNext}
                        transparent
                        iconName="chevronRight"
                    />
                </header>
                <div className={styles.years}>
                    {years.map(year => (
                        <Button
                            key={year}
                            className={this.getYearClassName(year)}
                            onClick={() => this.handleYearChange(year)}
                            transparent
                        >
                            { year }
                        </Button>
                    ))}
                </div>
            </div>
        );
    }
}
