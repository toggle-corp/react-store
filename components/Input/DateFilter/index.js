import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import { requiredCondition } from '../../General/Faram';
import { FaramInputElement } from '../../General/FaramElements';
import FormattedDate from '../../View/FormattedDate/FormattedDate';
import ApplyModal from '../../View/ApplyModal';

import { encodeDate, decodeDate } from '../../../utils/common';

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

const formatDate = date => FormattedDate.format(decodeDate(date), 'dd-MM-yyyy');

class DateFilter extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static defaultOptions = [
        { key: 'today', label: 'Today' },
        { key: 'yesterday', label: 'Yesterday' },
        { key: 'current-week', label: 'This week' },
        { key: 'last-7-days', label: 'Last 7 days' },
        { key: 'current-month', label: 'This month' },
        { key: 'last-30-days', label: 'Last 30 days' },
        { key: 'custom-exact', label: 'Exact date' },
        { key: 'custom-range', label: 'Date range' },
    ];

    static exactModalSchema = {
        fields: {
            date: [requiredCondition],
        },
    };

    static rangeModalSchema = {
        fields: {
            startDate: [requiredCondition],
            endDate: [requiredCondition],
        },
    };

    static calculateOptionsAndValue = memoize((value) => {
        const options = DateFilter.defaultOptions;
        const { startDate, endDate: actualEndDate } = value;

        if (!startDate || !actualEndDate) {
            return { options, value: undefined };
        }

        const endDateObj = decodeDate(actualEndDate);
        endDateObj.setDate(endDateObj.getDate() - 1);
        const endDate = encodeDate(endDateObj);

        if (startDate === endDate) {
            return {
                options: [
                    ...options,
                    { key: 'selected-exact', label: startDate },
                ],
                value: 'selected-exact',
            };
        }

        return {
            options: [
                ...options,
                { key: 'selected-range', label: `${formatDate(startDate)} - ${formatDate(endDate)}` },
            ],
            value: 'selected-range',
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
            case 'today': {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const startDate = encodeDate(today);
                const endDate = encodeDate(today);

                this.setNewDate({ startDate, endDate });
                break;
            }
            case 'yesterday': {
                const yesterday = new Date();
                yesterday.setHours(0, 0, 0, 0);
                yesterday.setDate(yesterday.getDate() - 1);
                const startDate = encodeDate(yesterday);
                const endDate = encodeDate(yesterday);

                this.setNewDate({ startDate, endDate });
                break;
            }
            case 'current-week': {
                const min = new Date();
                min.setHours(0, 0, 0, 0);
                min.setDate(min.getDate() - min.getDay());
                const startDate = encodeDate(min);

                const max = min;
                max.setHours(0, 0, 0, 0);
                max.setDate(min.getDate() + 7);
                const endDate = encodeDate(max);

                this.setNewDate({ startDate, endDate });
                break;
            }
            case 'last-7-days': {
                const min = new Date();
                min.setHours(0, 0, 0, 0);
                min.setDate(min.getDate() - 7);
                const startDate = encodeDate(min);

                const max = new Date();
                max.setHours(0, 0, 0, 0);
                const endDate = encodeDate(max);

                this.setNewDate({ startDate, endDate });
                break;
            }
            case 'current-month': {
                const min = new Date();
                min.setHours(0, 0, 0, 0);
                min.setDate(1);
                const startDate = encodeDate(min);

                const max = new Date();
                max.setHours(0, 0, 0, 0);
                max.setDate(max.getDate() + 1);
                const endDate = encodeDate(max);

                this.setNewDate({ startDate, endDate });
                break;
            }
            case 'last-30-days': {
                const min = new Date();
                min.setHours(0, 0, 0, 0);
                min.setDate(min.getDate() - 30);
                const startDate = encodeDate(min);

                const max = new Date();
                max.setHours(0, 0, 0, 0);
                max.setDate(max.getDate() + 1);
                const endDate = encodeDate(max);

                this.setNewDate({ startDate, endDate });
                break;
            }
            case 'custom-exact':
                this.setState({
                    showExactModal: true,
                });
                break;
            case 'custom-range':
                this.setState({
                    showRangeModal: true,
                });
                break;
            case undefined:
                this.setNewDate({});
                break;
            default:
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
