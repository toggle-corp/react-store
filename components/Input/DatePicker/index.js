import PropTypes from 'prop-types';
import React from 'react';

import DayPicker from './DayPicker';
import MonthPicker from './MonthPicker';
import YearPicker from './YearPicker';

const propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    onChange: PropTypes.func,
};

const defaultProps = {
    value: undefined,
    onChange: undefined,
};


export default class DatePicker extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const initialDate = props.value ? new Date(props.value) : new Date();
        this.state = {
            year: initialDate.getFullYear(),
            month: initialDate.getMonth() + 1,

            picker: 'day',
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.props.value && nextProps.value) {
            const date = new Date(nextProps.value);
            this.setState({
                year: date.getFullYear(),
                month: date.getMonth() + 1,
            });
        }
    }

    setMonthPicker = () => {
        this.setState({ picker: 'month' });
    }

    setYearPicker = () => {
        this.setState({ picker: 'year' });
    }

    handleYearMonthChange = (year, month, picker = undefined) => {
        this.setState({
            year,
            month,
            picker: picker || this.state.picker,
        });
    }

    render() {
        const {
            value,
            onChange,
        } = this.props;

        const {
            year,
            month,
            picker,
        } = this.state;

        if (picker === 'day') {
            return (
                <DayPicker
                    year={year}
                    month={month}
                    value={value}
                    onChange={onChange}
                    onMonthClick={this.setMonthPicker}
                    onYearMonthChange={this.handleYearMonthChange}
                />
            );
        } else if (picker === 'month') {
            return (
                <MonthPicker
                    year={year}
                    month={month}
                    value={value}
                    onYearClick={this.setYearPicker}
                    onYearMonthChange={this.handleYearMonthChange}
                />
            );
        } else if (picker === 'year') {
            return (
                <YearPicker
                    year={year}
                    month={month}
                    value={value}
                    onYearMonthChange={this.handleYearMonthChange}
                />
            );
        }

        return null;
    }
}
