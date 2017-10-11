import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import DatePicker from '../DatePicker';
import DateUnit from './DateUnit';
import FloatingContainer from '../FloatingContainer';
import styles from './styles.scss';

import {
    getNumDaysInMonth,
    isFalsy,
    leftPad,
    isTruthy,
    randomString,
} from '../../utils/common';


const propTypes = {
    /**
     * required for style override
     */
    className: PropTypes.string,

    /**
     * String to show in case of error
     */
    error: PropTypes.string,

    /**
     * Format of date input
     * E.g.: 'd-m-y', 'y-m-d', 'm/d/y'
     * Case insensitive
     * Must contain one of y, m, d and no more
     * Must have single separator, which can be any character
     */
    format: PropTypes.string,

    /**
     * Hint text
     */
    hint: PropTypes.string,

    /**
     * Initial timestamp value for the input
     */
    initialValue: PropTypes.number,

    /**
     * Input label
     */
    label: PropTypes.string,

    /**
     * Is a required element for form
     */
    required: PropTypes.bool,
};

const defaultProps = {
    className: '',
    error: '',
    format: 'd/m/y',
    hint: '',
    initialValue: '',
    label: '',
    required: false,
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

            showDatePicker: false,
            pickerContainerStyle: {},

            ...this.decodeTimestamp(this.props.initialValue),
        };

        this.boundingClientRect = {};
        this.inputId = randomString();
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll);
    }

    getDimension = () => {
        // Calculate the left, top and width dimensions,
        // used for date picker floating container.

        const cr = this.container.getBoundingClientRect();
        this.boundingClientRect = cr;

        return {
            pickerContainerStyle: {
                left: `${cr.right - 250}px`,
                top: `${(cr.top + window.scrollY) + cr.height}px`,
                width: '250px',
            },
        };
    }

    // Set date to today
    setToday = () => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        this.setValue(date);
    }

    // Set value by timestamp
    setValue = (timestamp) => {
        this.setState(this.decodeTimestamp(timestamp));
    }

    // Public method used by Form
    value = () => this.state.date.getTime();

    // Public method used by Form
    isFocused = () => this.state.focused;

    clear = () => {
        this.setValue(null);
    }

    // Decode a timestamp and return an object
    // containing:
    // day, month, year and actual date object
    decodeTimestamp = (timestamp) => {
        if (isFalsy(timestamp)) {
            return {
                date: null,
                day: null,
                month: null,
                year: null,
            };
        }

        const date = new Date(timestamp);
        const day = leftPad(date.getDate(), 2);
        const month = leftPad(date.getMonth() + 1, 2);
        const year = leftPad(date.getFullYear(), 4);

        return { date, day, month, year };
    }

    // Handle event fired whenever one of the date inputs change
    // Key can be day, month or year
    handleChangeValue = (key, val) => {
        const newState = { ...this.state };
        newState[key] = val;

        let date;

        // Start with current date
        // Or a new one if there is no current date
        if (!this.state.date) {
            date = new Date();
        } else {
            date = new Date(this.state.date.getTime());
        }

        // Then set first day of current month and year
        date.setDate(1);
        date.setMonth(newState.month - 1);
        date.setYear(newState.year);

        // For day we want to limit it to number of days
        // in current month.

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

    // Handle close event of date picker floating container
    handleDatePickerClosed = () => {
        // Hide date picker and unfocus the input
        this.setState({
            focused: false,
            showDatePicker: false,
        });
    }

    // Handle pick event of date picker
    handleDatePick = (timestamp) => {
        this.setValue(timestamp);
        this.setState({ focused: true });
    }

    // Handle dynamic style override of date picker
    // floating container
    handleDynamicStyleOverride = (pickerContainer) => {
        const pickerRect = pickerContainer.getBoundingClientRect();
        const cr = this.boundingClientRect;

        const pageOffset = window.innerHeight;
        const containerOffset = cr.top + pickerRect.height + cr.height;

        const newStyle = {
        };

        if (pageOffset < containerOffset) {
            newStyle.top = `${(cr.top + window.scrollY) - pickerRect.height}px`;
        }

        return newStyle;
    }

    handleScroll = () => {
        if (this.state.showOptions) {
            const newState = this.getDimension();
            this.setState(newState);
        }
    }

    handleResize = () => {
        const newState = this.getDimension();
        this.setState(newState);
    };

    // Handle focus event of date unit inputs
    handleUnitFocus = () => {
        this.setState({ focused: true });
    }

    // Handle blur event of date unit inputs
    handleUnitBlur = () => {
        this.setState({ focused: false });
    }

    // Parse format and generate an object of information
    parseFormat() {
        const { format } = this.props;

        const regex = /^(d|m|y)(.)(d|m|y)(.)(d|m|y)$/i;
        const matches = format.match(regex);

        if (!matches) {
            const error = `Invalid format given to DateInput: ${format}`;
            throw error;
        }

        return matches.slice(1, 6);
    }

    // Show date picker
    showDatePicker = () => {
        this.setState({
            showDatePicker: true,
            ...this.getDimension(),
        });
    }

    // Render date unit inputs according to format provided
    renderDateUnits() {
        const matches = this.parseFormat();

        // Map for properties to use in date unit
        const map = {
            d: {
                unit: this.state.dayUnit,
                unitKey: 'dayUnit',
                placeholder: 'dd',
                max: getNumDaysInMonth(this.state.date),
                length: 2,
                key: 'day',
                value: this.state.day,
            },
            m: {
                unit: this.state.monthUnit,
                unitKey: 'monthUnit',
                placeholder: 'mm',
                max: 12,
                length: 2,
                key: 'month',
                value: this.state.month,
            },
            y: {
                unit: this.state.yearUnit,
                unitKey: 'yearUnit',
                placeholder: 'yyyy',
                length: 4,
                key: 'year',
                value: this.state.year,
            },
        };

        return (
            <div styleName="inputs">
                {
                    matches.map((match, i) => (
                        (['d', 'm', 'y'].indexOf(match) !== -1 && (
                            <DateUnit
                                key={match}
                                length={map[match].length}
                                max={map[match].max}
                                nextUnit={map[matches[i + 2]] && map[matches[i + 2]].unit}

                                onChange={(value) => {
                                    this.handleChangeValue(map[match].key, value);
                                }}
                                onFocus={this.handleUnitFocus}
                                onBlur={this.handleUnitBlur}

                                placeholder={map[match].placeholder}
                                ref={(unit) => {
                                    const state = {};
                                    state[map[match].unitKey] = unit;
                                    this.setState(state);
                                }}
                                styleName={map[match].key}
                                value={isTruthy(map[match].value) ? String(map[match].value) : null}
                            />
                        )) ||
                        this.renderSeparator(match, i)
                    ))
                }
            </div>
        );
    }

    renderSeparator = (symbol, index) => (
        <span
            key={`${symbol}-${index}`}
            styleName="separator"
        >
            {symbol}
        </span>
    );

    render() {
        const {
            className,

            error,
            hint,
            label,
            required,
        } = this.props;

        const isToday =
            (this.state.date && this.state.date.toDateString()) === (new Date()).toDateString();

        return (
            <div
                styleName="date-input-wrapper"
                className={className}
                ref={(el) => { this.container = el; }}
            >
                <div
                    styleName={`
                        date-input
                        ${this.state.focused || this.state.showDatePicker ? 'focused' : ''}
                        ${error ? 'invalid' : ''}
                        ${required ? 'required' : ''}
                    `}
                >
                    {label && (
                        <label
                            htmlFor={this.inputId}
                            styleName="label"
                        >
                            {label}
                        </label>
                    )}

                    { this.renderDateUnits() }

                    <div styleName="actions">
                        <button
                            className="clear-button"
                            onClick={this.clear}
                            styleName={isFalsy(this.state.date) && 'hidden'}
                            tabIndex="0"
                        >
                            <span className="ion-close-round" />
                        </button>
                        <button
                            className="today-button"
                            onClick={this.setToday}
                            styleName={isToday && 'active'}
                            tabIndex="0"
                        >
                            <span className="ion-android-time" />
                        </button>
                        <button
                            className="show-picker-button"
                            onClick={this.showDatePicker}
                            tabIndex="0"
                        >
                            <span className="ion-ios-calendar-outline" />
                        </button>
                    </div>
                </div>

                {
                    !error && hint &&
                    <p styleName="hint">
                        {hint}
                    </p>
                }
                {
                    error && !hint &&
                    <p styleName="error">
                        {error}
                    </p>
                }
                {
                    !error && !hint &&
                    <p styleName="empty">
                        -
                    </p>
                }

                <FloatingContainer
                    ref={(el) => { this.pickerContainer = el; }}
                    show={this.state.showDatePicker}
                    onClose={this.handleDatePickerClosed}
                    containerId="datepicker-container"
                    styleOverride={this.state.pickerContainerStyle}
                    onDynamicStyleOverride={this.handleDynamicStyleOverride}
                    closeOnBlur
                >
                    <DatePicker
                        date={this.state.date && this.state.date.getTime()}
                        onDatePick={this.handleDatePick}
                    />
                </FloatingContainer>
            </div>
        );
    }
}
