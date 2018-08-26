import PropTypes from 'prop-types';
import React from 'react';

import { FaramInputElement } from '../../General/FaramElements';
import SelectInput from '../SelectInput';

import Modal from '../../View/Modal';
import ModalHeader from '../../View/Modal/Header';
import ModalBody from '../../View/Modal/Body';
import ModalFooter from '../../View/Modal/Footer';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

class TimeFilter extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static defaultOptions = [
        { key: 'now', label: 'Now' },
        { key: 'last-hour', label: 'Last hour' },
        { key: 'custom-exact', label: 'Custom exact time' },
        { key: 'custom', label: 'Custom time range' },
    ];

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
            styles.timeFilter,
            'time-filter',
        ];

        return classNames.join(' ');
    }

    getOptions = () => TimeFilter.defaultOptions

    getSelectInputValue = () => undefined

    renderExactModal = () => {
        const { showExactModal } = this.props;
        return null;
    }

    renderRangeModal = () => {
        const { showRangeModal } = this.props;
        return null;
    }

    render() {
        const {
            value, // eslint-disable-line no-unused-vars
            onChange, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props;

        const className = this.getClassName();

        const options = this.getOptions();
        const selectInputValue = this.getSelectInputValue();

        const CustomExactModal = this.renderExactModal;
        const CustomRangeModal = this.renderRangeModal;

        return (
            <React.Fragment>
                <SelectInput
                    className={className}
                    onChange={this.handleChange}
                    options={options}
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
