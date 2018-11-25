import PropTypes from 'prop-types';
import React from 'react';

import Button from '../../../Action/Button';
import PrimaryButton from '../../../Action/Button/PrimaryButton';

import ModalHeader from '../Header';
import ModalBody from '../Body';
import ModalFooter from '../Footer';

import Modal from '../../Modal';
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
    title: 'Confirm',
};

export default class Confirm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleOkButtonClick = () => {
        this.props.onClose(true);
    }

    handleCancelButtonClick = () => {
        this.props.onClose(false);
    }

    handleClose = () => {
        this.props.onClose(false);
    }

    render() {
        const {
            className,
            children,
            title,
            show,
        } = this.props;

        if (!show) {
            return null;
        }

        return (
            <Modal
                className={`${className} confirm ${styles.confirm}`}
                closeOnEscape
                closeOnOutsideClick
                onClose={this.handleClose}
            >
                <ModalHeader title={title} />
                <ModalBody>
                    { children }
                </ModalBody>
                <ModalFooter>
                    <Button
                        className={`cancel-button ${styles.cancelButton}`}
                        onClick={this.handleCancelButtonClick}
                        autoFocus
                    >
                        Cancel
                    </Button>
                    <PrimaryButton
                        className={`ok-button ${styles.okButton}`}
                        onClick={this.handleOkButtonClick}
                    >
                        Ok
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }
}
