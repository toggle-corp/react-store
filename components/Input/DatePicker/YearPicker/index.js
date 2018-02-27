import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

const propTypes = {
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    onYearMonthChange: PropTypes.func,
};

const defaultProps = {
    value: undefined,
    onYearMonthChange: undefined,
};


export default class YearPicker extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            startYear: Math.round(this.props.year / 9) * 9,
        };
    }

    getYearClassName = (year) => {
        const { value } = this.props;
        const classNames = [styles.year];

        const selected = value ? new Date(value).getYear() : -1;
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
        this.setState({ startYear: this.state.startYear - 9 });
    }

    handleNext = () => {
        this.setState({ startYear: this.state.startYear + 9 });
    }

    render() {
        const { startYear } = this.state;

        const years = [];
        for (let i = 0; i < 9; i += 1) {
            years.push(startYear + i);
        }

        return (
            <div className={styles['year-picker']}>
                <button onClick={this.handlePrevious}>
                    &lt;
                </button>
                <div className={styles.years}>
                    {years.map(year => (
                        <button
                            key={year}
                            className={this.getYearClassName(year)}
                            onClick={() => this.handleYearChange(year)}
                        >
                            { year }
                        </button>
                    ))}
                </div>
                <button onClick={this.handleNext}>
                    &gt;
                </button>
            </div>
        );
    }
}
