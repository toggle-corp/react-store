import PropTypes from 'prop-types';
import React from 'react';

import SelectInput from '../SelectInput';
import DateInput from '../DateInput';
import PrimaryButton from '../../Action/Button/PrimaryButton';
import DangerButton from '../../Action/Button/DangerButton';
import FormattedDate from '../../View/FormattedDate';
import Modal from '../../View/Modal';
import ModalHeader from '../../View/Modal/Header';
import ModalBody from '../../View/Modal/Body';
import ModalFooter from '../../View/Modal/Footer';

import styles from './styles.scss';


const propTypes = {
    /**
     * for styling
     */
    className: PropTypes.string,

    onChange: PropTypes.func,

    /**
     * Placeholder for the input
     */
    placeholder: PropTypes.string,

    value: PropTypes.shape({
        type: PropTypes.string,
        startDate: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
        ]),
        endDate: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
        ]),
    }),
};

const defaultProps = {
    className: '',
    placeholder: 'Select an option',
    value: undefined,
    onChange: undefined,
};

export default class DateFilter extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static defaultOptions = [
        { key: 'today', label: 'Today' },
        { key: 'yesterday', label: 'Yesterday' },
        { key: 'current-week', label: 'This week' },
        { key: 'last-7-days', label: 'Last 7 days' },
        { key: 'current-month', label: 'This month' },
        { key: 'last-30-days', label: 'Last 30 days' },
        { key: 'custom', label: 'Custom range' },
    ];

    static getClassName = (className, value) => {
        const classNames = [
            ...className.split(' '),
            styles['select-input'],
        ];

        if (value && value.type === 'custom') {
            classNames.push(styles.monospace);
        }

        return classNames.join(' ');
    }

    static getRangeValues = (type, startDaet, endDaet) => {
        let startDate = startDaet;
        let endDate = endDaet;
        switch (type) {
            case 'today': {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                startDate = today.getTime();

                today.setDate(today.getDate() + 1);
                endDate = today.getTime();
                break;
            }
            case 'yesterday': {
                const yesterday = new Date();
                yesterday.setHours(0, 0, 0, 0);
                yesterday.setDate(yesterday.getDate() - 1);
                startDate = yesterday.getTime();

                yesterday.setDate(yesterday.getDate() + 1);
                endDate = yesterday.getTime();
                break;
            }
            case 'current-week': {
                const min = new Date();
                min.setHours(0, 0, 0, 0);
                min.setDate(min.getDate() - min.getDay());
                startDate = min.getTime();

                const max = min;
                max.setHours(0, 0, 0, 0);
                max.setDate(min.getDate() + 8);
                endDate = max.getTime();
                break;
            }
            case 'last-7-days': {
                const min = new Date();
                min.setHours(0, 0, 0, 0);
                min.setDate(min.getDate() - 7);
                startDate = min.getTime();

                const max = new Date();
                max.setHours(0, 0, 0, 0);
                max.setDate(max.getDate() + 1);
                endDate = max.getTime();
                break;
            }
            case 'current-month': {
                const min = new Date();
                min.setHours(0, 0, 0, 0);
                min.setDate(1);
                startDate = min.getTime();

                const max = new Date();
                max.setHours(0, 0, 0, 0);
                max.setDate(max.getDate() + 1);
                endDate = max.getTime();
                break;
            }
            case 'last-30-days': {
                const min = new Date();
                min.setHours(0, 0, 0, 0);
                min.setDate(min.getDate() - 30);
                startDate = min.getTime();

                const max = new Date();
                max.setHours(0, 0, 0, 0);
                max.setDate(max.getDate() + 1);
                endDate = max.getTime();
                break;
            }
            default:
                console.error(`Invalid type: ${type}`);
        }

        return {
            startDate,
            endDate,
        };
    }

    static dateToStr = date => FormattedDate.format(new Date(date), 'dd-MM-yyyy');

    constructor(props) {
        super(props);

        this.state = {
            modalShown: false,
            startDate: undefined,
            endDate: undefined,
        };

        const { value } = props;
        if (value && value.type === 'custom') {
            this.state = {
                ...this.state,
                startDate: value.startDate,
                endDate: value.endDate,
            };
        }
    }

    componentWillReceiveProps(nextProps) {
        if (
            (this.props.value !== nextProps.value) &&
            (nextProps.value && nextProps.value.type === 'custom')
        ) {
            this.setState({
                startDate: nextProps.value.startDate,
                endDate: nextProps.value.endDate,
            });
        }
    }

    setCustomDate = () => {
        const {
            startDate,
            endDate,
        } = this.state;

        if (this.props.onChange) {
            this.props.onChange({
                type: 'custom',
                startDate,
                endDate,
            });
        }

        this.closeModal();
    }

    handleChange = (valueType) => {
        const { onChange } = this.props;
        if (!onChange) {
            return;
        }

        if (!valueType) {
            onChange(valueType);
        } else if (valueType === 'custom-range') {
            this.setCustomDate();
        } else if (valueType === 'custom') {
            this.showModal();
        } else {
            const { startDate, endDate } = this.state;
            onChange({
                type: valueType,
                ...DateFilter.getRangeValues(valueType, startDate, endDate),
            });
        }
    }

    showModal = () => {
        this.setState({ modalShown: true });
    }

    closeModal = () => {
        this.setState({ modalShown: false });
    }

    handleStartDateChange = (startDate) => {
        this.setState({ startDate });
    }

    handleEndDateChange = (timestamp) => {
        const endDate = new Date(timestamp);
        endDate.setDate(endDate.getDate() + 1);
        this.setState({ endDate: endDate.getTime() });
    }

    render() {
        const {
            placeholder,
            className,
            value,
            onChange, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props;


        const {
            modalShown,
            startDate,
            endDate,
        } = this.state;

        // XXX: put options in state
        let options = DateFilter.defaultOptions;

        let endDateToDisplay;
        if (endDate) {
            endDateToDisplay = new Date(endDate);
            endDateToDisplay.setDate(endDateToDisplay.getDate() - 1);
            endDateToDisplay = endDateToDisplay.getTime();
        }

        if (startDate && endDate) {
            const startStr = DateFilter.dateToStr(startDate);
            const endStr = DateFilter.dateToStr(endDateToDisplay);
            const customLabel = `${startStr} to ${endStr}`;
            options = [
                ...options,
                { key: 'custom-range', label: customLabel },
            ];
        }

        const selectInputValue = value && (
            value.type === 'custom' ? 'custom-range' : value.type
        );
        return ([
            <SelectInput
                key="select-input"
                onChange={this.handleChange}
                options={options}
                placeholder={placeholder}
                className={DateFilter.getClassName(className, value)}
                value={selectInputValue}
                {...otherProps}
            />,
            modalShown && (
                <Modal
                    key="modal"
                    closeOnEscape
                    onClose={this.closeModal}
                    className={styles.modal}
                >
                    <ModalHeader title="Select date range" />
                    <ModalBody>
                        <DateInput
                            label="Start date"
                            onChange={this.handleStartDateChange}
                            value={startDate}
                        />
                        <DateInput
                            label="End date"
                            onChange={this.handleEndDateChange}
                            value={endDateToDisplay}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton
                            onClick={this.closeModal}
                            autoFocus
                        >
                            Close
                        </DangerButton>
                        <PrimaryButton
                            onClick={this.setCustomDate}
                        >
                            Apply
                        </PrimaryButton>
                    </ModalFooter>
                </Modal>
            ),
        ]);
    }
}
