import PropTypes from 'prop-types';
import React from 'react';
import { FaramInputElement } from '@togglecorp/faram';

import DayPicker from './DayPicker';
import MonthPicker from './MonthPicker';
import YearPicker from './YearPicker';

import styles from './styles.scss';


const propTypes = {
    className: PropTypes.string,
    value: PropTypes.number,
    onChange: PropTypes.func,
};

const defaultProps = {
    className: '',
    value: undefined,
    onChange: undefined,
};


class DatePicker extends React.PureComponent {
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

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            styles.datePicker,
            'date-picker',
        ];

        return classNames.join(' ');
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

    renderPicker = () => {
        const {
            value,
            onChange,
        } = this.props;

        const {
            year,
            month,
            picker,
        } = this.state;


        switch (picker) {
            case 'day':
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
            case 'month':
                return (
                    <MonthPicker
                        year={year}
                        month={month}
                        value={value}
                        onYearClick={this.setYearPicker}
                        onYearMonthChange={this.handleYearMonthChange}
                    />
                );
            case 'year':
                return (
                    <YearPicker
                        year={year}
                        month={month}
                        value={value}
                        onYearMonthChange={this.handleYearMonthChange}
                    />
                );
            default:
                return null;
        }
    }

    render() {
        const className = this.getClassName();
        const Picker = this.renderPicker;

        return (
            <div className={className}>
                <Picker />
            </div>
        );
    }
}

export default FaramInputElement(DatePicker);
