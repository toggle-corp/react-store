import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import DatePicker from '../DatePicker';
import DateUnit from './DateUnit';
import {
    FloatingContainer,
    FormattedDate,
} from '../../View';
import styles from './styles.scss';

import {
    getNumDaysInMonth,
    isFalsy,
    isFalsyOrEmptyOrZero,
    isTruthy,
    calcFloatingPositionInMainWindow,
} from '../../../utils/common';

import { iconNames } from '../../../constants';


const propTypes = {
    /**
     * required for style override
     */
    className: PropTypes.string,

    /**
     * If disabled, action is blocked
     */
    disabled: PropTypes.bool,

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
    initialValue: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),

    /**
     * Input label
     */
    label: PropTypes.string,

    /**
     * Event triggered when input value changes
     */
    onChange: PropTypes.func,

    /**
     * Is a required element for form
     */
    required: PropTypes.bool,

    showLabel: PropTypes.bool,

    showHintAndError: PropTypes.bool,

    value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
};

const defaultProps = {
    className: '',
    disabled: false,
    error: '',
    format: 'd/m/y',
    hint: '',
    initialValue: undefined,
    label: '',
    onChange: undefined,
    required: false,
    showLabel: true,
    showHintAndError: true,
    value: undefined,
};


@CSSModules(styles, { allowMultiple: true })
export default class DateInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            datePickerVisible: false,
            ...this.decodeTimestamp(this.props.value || this.props.initialValue),
        };

        this.boundingClientRect = {};
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.value !== nextProps.value) {
            const newState = this.decodeTimestamp(nextProps.value);
            if (newState.date !== this.state.date) {
                this.setState(newState);
            }
        }
    }

    // Set date to today
    setToday = () => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        this.setValue(date);
    }

    // Set value by timestamp
    setValue = (timestamp) => {
        this.setState(this.decodeTimestamp(timestamp), () => {
            this.triggerChange();
        });
    }

    // Public method used by Form
    getValue = () => {
        if (this.state.date) {
            return FormattedDate.format(this.state.date, 'yyyy-MM-dd');
        }
        return undefined;
    }

    getStyleName() {
        const styleNames = [];

        const {
            disabled,
            error,
            required,
        } = this.props;

        const {
            focused,
            datePickerVisible,
        } = this.state;

        styleNames.push('date-input-wrapper');

        if (disabled) {
            styleNames.push('disabled');
        }

        if (focused) {
            styleNames.push('focused');
        }

        if (datePickerVisible) {
            styleNames.push('date-picker-shown');
        }

        if (error) {
            styleNames.push('error');
        }

        if (required) {
            styleNames.push('required');
        }

        return styleNames.join(' ');
    }

    // Public method used by Form
    isFocused = () => this.state.focused;

    // Check if the state has all date input filled
    isFilled = (stateOverride = undefined) => {
        const state = stateOverride || this.state;
        return !isFalsyOrEmptyOrZero(state.day) &&
            !isFalsyOrEmptyOrZero(state.month) &&
            !isFalsyOrEmptyOrZero(state.year) &&
            state.year >= 1000;
    }

    clear = () => {
        this.setValue(undefined);
    }

    // Decode a timestamp and return an object
    // containing:
    // day, month, year and actual date object
    decodeTimestamp = (timestamp) => {
        if (isFalsy(timestamp)) {
            return {
                date: undefined,
                day: undefined,
                month: undefined,
                year: undefined,
            };
        }

        const date = new Date(timestamp);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        return { date, day, month, year };
    }

    // Handle event fired whenever one of the date inputs change
    // Key can be day, month or year
    handleChangeValue = (key, val) => {
        const newState = { ...this.state };
        newState[key] = val;

        if (!this.isFilled(newState)) {
            newState.date = undefined;
            this.setState(newState);
            return;
        }

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
        date.setFullYear(newState.year);

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
        this.setState(newState, () => {
            this.triggerChange();
        });
    }

    // Handle close event of date picker floating container
    handleDatePickerClosed = () => {
        // Hide date picker and unfocus the input
        this.setState({
            focused: false,
            datePickerVisible: false,
        });
    }

    // Handle pick event of date picker
    handleDatePick = (timestamp) => {
        this.setValue(timestamp);
    }

    // Handle dynamic style override of date picker
    // floating container
    handleDynamicStyleOverride = (pickerContainer) => {
        const pickerRect = pickerContainer.getBoundingClientRect();
        const cr = (this.container && this.container.getBoundingClientRect())
            || this.boundingClientRect;

        const pageOffset = window.innerHeight;
        const containerOffset = cr.top + pickerRect.height + cr.height;

        const newStyle = {
            left: `${cr.right - 250}px`,
            top: `${((cr.top + window.scrollY) + cr.height) - 16}px`,
            width: '250px',
        };

        if (pageOffset < containerOffset) {
            newStyle.top = `${(cr.top + window.scrollY) - pickerRect.height}px`;
        }

        return newStyle;
    }

    // Handle focus event of date unit inputs
    handleUnitFocus = () => {
        this.setState({ focused: true });
    }

    // Handle blur event of date unit inputs
    handleUnitBlur = () => {
        this.setState({ focused: false });
    }

    triggerChange = () => {
        if (this.props.onChange) {
            this.props.onChange(this.getValue());
        }
    }

    handleDatePickerInvalidate = (datePickerContainer) => {
        const containerRect = datePickerContainer.getBoundingClientRect();
        let parentRect = this.boundingClientRect;
        if (this.container) {
            parentRect = this.container.getBoundingClientRect();
        }

        const optionsContainerPosition = (
            calcFloatingPositionInMainWindow(parentRect, containerRect)
        );
        return optionsContainerPosition;
    }

    handleDatePickerBlur = () => {
        this.setState({
            datePickerVisible: false,
        });
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

    // Toggle date picker
    toggleDatePicker = () => {
        this.boundingClientRect = this.container.getBoundingClientRect();
        this.setState({
            datePickerVisible: !this.state.datePickerVisible,
        });
    }

    // Render date unit inputs according to format provided
    renderDateUnits() {
        const matches = this.parseFormat();

        // Map for properties to use in date unit
        const map = {
            d: {
                unit: this.dayUnit,
                unitKey: 'dayUnit',
                placeholder: 'dd',
                max: getNumDaysInMonth(this.state.date),
                length: 2,
                key: 'day',
                value: this.state.day,
            },
            m: {
                unit: this.monthUnit,
                unitKey: 'monthUnit',
                placeholder: 'mm',
                max: 12,
                length: 2,
                key: 'month',
                value: this.state.month,
            },
            y: {
                unit: this.yearUnit,
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
                                disabled={this.props.disabled}

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
                                    this[map[match].unitKey] = unit;
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
            styleName={`separator ${this.props.disabled ? 'disabled' : ''}`}
        >
            {symbol}
        </span>
    );

    render() {
        const {
            className,
            disabled,
            error,
            hint,
            label,
            showLabel,
            showHintAndError,
        } = this.props;

        const isToday =
            (this.state.date && this.state.date.toDateString()) === (new Date()).toDateString();
        const styleName = this.getStyleName();
        const showDatePicker = this.state.datePickerVisible && !this.state.disabled;

        return (
            <div
                className={`${className} ${styleName}`}
                styleName={styleName}
                ref={(el) => { this.container = el; }}
            >
                {showLabel && (
                    <label
                        htmlFor={this.inputId}
                        styleName="label"
                    >
                        {label}
                    </label>
                )}
                <div
                    className="date-input"
                    styleName="date-input"
                >
                    { this.renderDateUnits() }

                    <div styleName="actions">
                        <button
                            className="clear-button"
                            disabled={disabled}
                            onClick={this.clear}
                            styleName={!this.isFilled() && 'hidden'}
                            tabIndex="-1"
                            type="button"
                        >
                            <span className={iconNames.closeRound} />
                        </button>
                        <button
                            className="today-button"
                            disabled={disabled}
                            onClick={this.setToday}
                            styleName={isToday && 'active'}
                            tabIndex="-1"
                            type="button"
                        >
                            <span className={iconNames.clock} />
                        </button>
                        <button
                            className="show-picker-button"
                            disabled={disabled}
                            onClick={this.toggleDatePicker}
                            tabIndex="-1"
                            type="button"
                        >
                            <span className={iconNames.calendar} />
                        </button>
                    </div>
                </div>

                {
                    showHintAndError && [
                        !error && hint && (
                            <p
                                key="hint"
                                className="hint"
                                styleName="hint"
                            >
                                {hint}
                            </p>
                        ),
                        error && !hint && (
                            <p
                                key="error"
                                styleName="error"
                                className="error"
                            >
                                {error}
                            </p>
                        ),
                        !error && !hint && (
                            <p
                                key="empty"
                                styleName="empty"
                                className="error empty"
                            >
                                -
                            </p>
                        ),
                    ]
                }
                {
                    showDatePicker && (
                        <FloatingContainer
                            parent={this.container}
                            onBlur={this.handleDatePickerBlur}
                            onInvalidate={this.handleDatePickerInvalidate}
                        >
                            <DatePicker
                                date={this.state.date && this.state.date.getTime()}
                                onDatePick={this.handleDatePick}
                            />
                        </FloatingContainer>
                    )
                }
            </div>
        );
    }
}
