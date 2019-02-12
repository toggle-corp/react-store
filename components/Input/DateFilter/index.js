import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import {
    formatDateToString,
    encodeDate,
    decodeDate,
} from '@togglecorp/fujs';

import { requiredCondition } from '../../General/Faram';
import { FaramInputElement } from '../../General/FaramElements';
import ApplyModal from '../../View/ApplyModal';


import SelectInput from '../SelectInput';
import DateInput from '../DateInput';

import styles from './styles.scss';

const noOp = () => {};

const propTypes = {
    className: PropTypes.string,
    value: PropTypes.shape({
        startDate: PropTypes.string,
        endDate: PropTypes.string,
    }),
    onChange: PropTypes.func,
};

const defaultProps = {
    className: '',
    value: {},
    onChange: noOp,
};

const presets = {
    today: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = encodeDate(today);
        const endDate = encodeDate(today);

        return { startDate, endDate };
    },
    yesterday: () => {
        const yesterday = new Date();
        yesterday.setHours(0, 0, 0, 0);
        yesterday.setDate(yesterday.getDate() - 1);
        const startDate = encodeDate(yesterday);
        const endDate = encodeDate(yesterday);

        return { startDate, endDate };
    },
    currentWeek: () => {
        const min = new Date();
        min.setHours(0, 0, 0, 0);
        min.setDate(min.getDate() - min.getDay());
        const startDate = encodeDate(min);

        const max = min;
        max.setHours(0, 0, 0, 0);
        max.setDate(min.getDate() + 7);
        const endDate = encodeDate(max);
        return { startDate, endDate };
    },
    lastSevenDays: () => {
        const min = new Date();
        min.setHours(0, 0, 0, 0);
        min.setDate(min.getDate() - 7);
        const startDate = encodeDate(min);

        const max = new Date();
        max.setHours(0, 0, 0, 0);
        const endDate = encodeDate(max);

        return { startDate, endDate };
    },
    currentMonth: () => {
        const min = new Date();
        min.setHours(0, 0, 0, 0);
        min.setDate(1);
        const startDate = encodeDate(min);

        const max = new Date();
        max.setHours(0, 0, 0, 0);
        max.setMonth(min.getMonth() + 1);
        max.setDate(0);
        const endDate = encodeDate(max);

        return { startDate, endDate };
    },
    lastThirtyDays: () => {
        const min = new Date();
        min.setHours(0, 0, 0, 0);
        min.setDate(min.getDate() - 30);
        const startDate = encodeDate(min);

        const max = new Date();
        max.setHours(0, 0, 0, 0);
        max.setDate(max.getDate() + 1);
        const endDate = encodeDate(max);

        return { startDate, endDate };
    },
};

class DateFilter extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static defaultOptions = [
        { key: 'today', label: 'Today' },
        { key: 'yesterday', label: 'Yesterday' },
        { key: 'currentWeek', label: 'This week' },
        { key: 'lastSevenDays', label: 'Last 7 days' },
        { key: 'currentMonth', label: 'This month' },
        { key: 'lastThirtyDays', label: 'Last 30 days' },
        { key: 'customExact', label: 'Select an exact date' },
        { key: 'customRange', label: 'Select a date range' },
    ];

    static exactModalSchema = {
        fields: {
            date: [requiredCondition],
        },
    };

    // FIXME: add startDate smaller than endDate condition
    static rangeModalSchema = {
        fields: {
            startDate: [requiredCondition],
            endDate: [requiredCondition],
        },
    };

    static formatDate = date => formatDateToString(decodeDate(date), 'dd-MM-yyyy');

    static calculateOptionsAndValue = memoize((value) => {
        const options = DateFilter.defaultOptions;
        const { startDate, endDate: actualEndDate } = value;

        if (!startDate || !actualEndDate) {
            return { options, value: undefined };
        }

        const endDateObj = decodeDate(actualEndDate);
        endDateObj.setDate(endDateObj.getDate() - 1);
        const endDate = encodeDate(endDateObj);

        const preset = Object.keys(presets).find((key) => {
            const test = presets[key]();
            return test.startDate === startDate && test.endDate === endDate;
        });

        if (preset) {
            return {
                options,
                value: preset,
            };
        }

        if (startDate === endDate) {
            return {
                options: [
                    ...options,
                    { key: 'selectedExact', label: startDate },
                ],
                value: 'selectedExact',
            };
        }

        return {
            options: [
                ...options,
                {
                    key: 'selectedRange',
                    label: `${DateFilter.formatDate(startDate)} - ${DateFilter.formatDate(endDate)}`,
                },
            ],
            value: 'selectedRange',
        };
    });

    constructor(props) {
        super(props);

        this.state = {
            showRangeModal: false,
            showExactModal: false,
        };
    }

    getClassName = () => {
        const { className } = this.props;
        const classNames = [
            className,
            'date-filter',
        ];

        return classNames.join(' ');
    }

    setNewDate = ({ startDate, endDate } = {}) => {
        if (!startDate || !endDate) {
            this.props.onChange(undefined);
            return;
        }

        const endDateObj = decodeDate(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        const actualEndDate = encodeDate(endDateObj);

        this.props.onChange({
            startDate,
            endDate: actualEndDate,
        });
    }

    handleSelectInputChange = (value) => {
        switch (value) {
            case 'customExact':
                this.setState({
                    showExactModal: true,
                });
                break;
            case 'customRange':
                this.setState({
                    showRangeModal: true,
                });
                break;
            default:
                this.setNewDate(value && presets[value]());
        }
    }

    closeRangeModal = () => {
        this.setState({
            showRangeModal: false,
        });
    }

    applyRangeDate = ({ startDate, endDate }) => {
        this.setState({
            showRangeModal: false,
        }, () => {
            this.setNewDate({
                startDate,
                endDate,
            });
        });
    }

    closeExactModal = () => {
        this.setState({
            showExactModal: false,
        });
    }

    applyExactDate = ({ date }) => {
        this.setState({
            showExactModal: false,
        }, () => {
            this.setNewDate({
                startDate: date,
                endDate: date,
            });
        });
    }

    renderExactModal = () => {
        const { showExactModal } = this.state;

        if (!showExactModal) {
            return null;
        }

        return (
            <ApplyModal
                className={styles.dateFilterModal}
                onClose={this.closeExactModal}
                onApply={this.applyExactDate}
                title="Select a date"
                schema={DateFilter.exactModalSchema}
            >
                <DateInput faramElementName="date" />
            </ApplyModal>
        );
    }

    renderRangeModal = () => {
        const { showRangeModal } = this.state;

        if (!showRangeModal) {
            return null;
        }

        return (
            <ApplyModal
                className={styles.dateFilterModal}
                onClose={this.closeRangeModal}
                onApply={this.applyRangeDate}
                title="Select a date range"
                schema={DateFilter.rangeModalSchema}
            >
                <DateInput faramElementName="startDate" />
                <DateInput faramElementName="endDate" />
            </ApplyModal>
        );
    }

    render() {
        const {
            value,
            onChange, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props;

        const className = this.getClassName();

        const {
            options: selectInputOptions,
            value: selectInputValue,
        } = DateFilter.calculateOptionsAndValue(value);

        const CustomExactModal = this.renderExactModal;
        const CustomRangeModal = this.renderRangeModal;

        return (
            <React.Fragment>
                <SelectInput
                    className={className}
                    onChange={this.handleSelectInputChange}
                    options={selectInputOptions}
                    value={selectInputValue}
                    {...otherProps}
                />
                <CustomExactModal />
                <CustomRangeModal />
            </React.Fragment>
        );
    }
}

export default FaramInputElement(DateFilter);
