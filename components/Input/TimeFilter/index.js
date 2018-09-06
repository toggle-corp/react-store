import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import { requiredCondition } from '../../General/Faram';
import { FaramInputElement } from '../../General/FaramElements';
import ApplyModal from '../../View/ApplyModal';

import SelectInput from '../SelectInput';
import TimeInput from '../TimeInput';

import styles from './styles.scss';

const noOp = () => {};

const propTypes = {
    className: PropTypes.string,
    value: PropTypes.shape({
        startTime: PropTypes.string,
        endTime: PropTypes.string,
    }),
    onChange: PropTypes.func,
};

const defaultProps = {
    className: '',
    value: {},
    onChange: noOp,
};

class TimeFilter extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static defaultOptions = [
        { key: 'customExact', label: 'Select an exact time' },
        { key: 'customRange', label: 'Select a time range' },
    ];

    static exactModalSchema = {
        fields: {
            time: [requiredCondition],
        },
    };

    static rangeModalSchema = {
        fields: {
            startTime: [requiredCondition],
            endTime: [requiredCondition],
        },
    };

    static calculateOptionsAndValue = memoize((value) => {
        const options = TimeFilter.defaultOptions;
        const { startTime, endTime } = value;

        if (!startTime || !endTime) {
            return { options, value: undefined };
        }

        if (startTime === endTime) {
            return {
                options: [
                    ...options,
                    { key: 'selectedExact', label: startTime },
                ],
                value: 'selectedExact',
            };
        }

        return {
            options: [
                ...options,
                { key: 'selectedRange', label: `${startTime} - ${endTime}` },
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
            'time-filter',
        ];

        return classNames.join(' ');
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
            case undefined:
                this.props.onChange(undefined);
                break;
            default:
        }
    }

    closeRangeModal = () => {
        this.setState({
            showRangeModal: false,
        });
    }

    applyRangeTime = ({ startTime, endTime }) => {
        this.setState({
            showRangeModal: false,
        }, () => {
            this.props.onChange({
                startTime,
                endTime,
            });
        });
    }

    closeExactModal = () => {
        this.setState({
            showExactModal: false,
        });
    }

    applyExactTime = ({ time }) => {
        this.setState({
            showExactModal: false,
        }, () => {
            this.props.onChange({
                startTime: time,
                endTime: time,
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
                className={styles.timeFilterModal}
                onClose={this.closeExactModal}
                onApply={this.applyExactTime}
                title="Select a time"
                schema={TimeFilter.exactModalSchema}
            >
                <TimeInput faramElementName="time" />
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
                className={styles.timeFilterModal}
                onClose={this.closeRangeModal}
                onApply={this.applyRangeTime}
                title="Select a time range"
                schema={TimeFilter.rangeModalSchema}
            >
                <TimeInput faramElementName="startTime" />
                <TimeInput faramElementName="endTime" />
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
        } = TimeFilter.calculateOptionsAndValue(value);

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

export default FaramInputElement(TimeFilter);
