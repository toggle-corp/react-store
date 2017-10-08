import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import DatePicker from '../DatePicker';
import DateUnit from './DateUnit';
import styles from './styles.scss';

import { getNumDaysInMonth, isTruthy } from '../../utils/common';


const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};


@CSSModules(styles, { allowMultiple: true })
export default class DateInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            dayUnit: undefined,
            monthUnit: undefined,
            yearUnit: undefined,

            day: null,
            month: null,
            year: null,

            date: null,
        };
    }

    setValue = (timestamp) => {
        const date = new Date(timestamp);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        this.setState({ date, day, month, year });
    }

    changeValue = (key, val) => {
        const newState = { ...this.state };
        newState[key] = val;

        let date;
        if (!this.state.date) {
            date = new Date();
        } else {
            date = new Date(this.state.date.getTime());
        }

        date.setDate(1);
        date.setMonth(newState.month - 1);
        date.setYear(newState.year);

        if (newState.day) {
            const max = getNumDaysInMonth(date);
            if (newState.day > max) {
                newState.day = max;
            }
            date.setDate(newState.day);
        }

        newState.date = date;

        this.setState(newState);
    }

    handleDatePick = (timestamp) => {
        this.setValue(timestamp);
        this.setState({ focused: true });
    }

    handleUnitFocus = () => {
        this.setState({ focused: true });
    }

    handleUnitBlur = () => {
        this.setState({ focused: false });
    }

    render() {
        const {
            className,
        } = this.props;

        return (
            <div styleName="date-input-wrapper" className={className}>
                <div styleName={`date-input ${this.state.focused ? 'focus' : ''}`}>
                    <DateUnit
                        length={2}
                        max={getNumDaysInMonth(this.state.date)}
                        nextUnit={this.state.monthUnit}
                        onChange={(value) => { this.changeValue('day', value); }}
                        onFocus={this.handleUnitFocus}
                        onBlur={this.handleUnitBlur}
                        placeholder="dd"
                        ref={(unit) => { this.setState({ dayUnit: unit }); }}
                        value={isTruthy(this.state.day) ? String(this.state.day) : null}
                    />
                    <span styleName="separator">-</span>
                    <DateUnit
                        length={2}
                        max={12}
                        nextUnit={this.state.yearUnit}
                        onChange={(value) => { this.changeValue('month', value); }}
                        onFocus={this.handleUnitFocus}
                        onBlur={this.handleUnitBlur}
                        placeholder="mm"
                        ref={(unit) => { this.setState({ monthUnit: unit }); }}
                        value={isTruthy(this.state.month) ? String(this.state.month) : null}
                    />
                    <span styleName="separator">-</span>
                    <DateUnit
                        length={4}
                        onChange={(value) => { this.changeValue('year', value); }}
                        onFocus={this.handleUnitFocus}
                        onBlur={this.handleUnitBlur}
                        placeholder="yyyy"
                        ref={(unit) => { this.setState({ yearUnit: unit }); }}
                        value={isTruthy(this.state.year) ? String(this.state.year) : null}
                    />
                </div>
                <DatePicker
                    date={this.state.date && this.state.date.getTime()}
                    onDatePick={this.handleDatePick}
                />
            </div>
        );
    }
}
