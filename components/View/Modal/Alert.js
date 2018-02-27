import PropTypes from 'prop-types';
import React from 'react';

import PrimaryButton from '../../Action/Button/PrimaryButton';

import ModalHeader from './Header';
import ModalBody from './Body';
import ModalFooter from './Footer';

import Modal from './index';
import styles from './styles.scss';

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element,
    ]).isRequired,
    className: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string,
    show: PropTypes.bool.isRequired,
};

const defaultProps = {
    className: '',
    title: 'Alert',
};

export default class Alert extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            show: props.show,
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            show: nextProps.show,
        });
    }

    handleOkButtonClick = () => {
        this.setState({
            show: false,
        });
    }

    handleClose = () => {
        this.setState({
            show: false,
        });
        this.props.onClose();
    }

    render() {
        const {
            className,
            children,
            title,
        } = this.props;

        const { show } = this.state;

        if (!show) {
            return null;
        }

        return (
            <Modal className={`${className} alert ${styles.alert}`}>
                <ModalHeader title={title} />
                <ModalBody>
                    { children }
                </ModalBody>
                <ModalFooter>
                    <PrimaryButton
                        className={`ok-button ${styles['ok-button']}`}
                        onClick={this.handleOkButtonClick}
                        autoFocus
                    >
                        Ok
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }
}
