import PropTypes from 'prop-types';
import React from 'react';

import Button from '../../../Action/Button';
import DangerButton from '../../../Action/Button/DangerButton';

import ModalHeader from '../Header';
import ModalBody from '../Body';
import ModalFooter from '../Footer';

import Modal from '../../Modal';
import styles from './styles.scss';

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.string,
        PropTypes.element,
    ]).isRequired,
    className: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    closeOnEscape: PropTypes.bool,
    closeOnOutsideClick: PropTypes.bool,
    hideCancel: PropTypes.bool,
    title: PropTypes.string,
    show: PropTypes.bool.isRequired,
    disabled: PropTypes.bool,
    autoFocus: PropTypes.bool,
};

const defaultProps = {
    className: '',
    title: 'Confirm',
    closeOnEscape: true,
    closeOnOutsideClick: true,
    hideCancel: false,
    disabled: false,
    autoFocus: true,
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
            hideCancel,
            closeOnEscape,
            closeOnOutsideClick,
            disabled,
            autoFocus,
        } = this.props;

        if (!show) {
            return null;
        }

        return (
            <Modal
                className={`${className} confirm ${styles.confirm}`}
                closeOnEscape={closeOnEscape}
                closeOnOutsideClick={closeOnOutsideClick}
                onClose={this.handleClose}
            >
                <ModalHeader title={title} />
                <ModalBody>
                    { children }
                </ModalBody>
                <ModalFooter>
                    {!hideCancel &&
                        <Button
                            className={`cancel-button ${styles.cancelButton}`}
                            onClick={this.handleCancelButtonClick}
                            autoFocus={autoFocus}
                        >
                            Cancel
                        </Button>
                    }
                    <DangerButton
                        className={`ok-button ${styles.okButton}`}
                        onClick={this.handleOkButtonClick}
                        disabled={disabled}
                    >
                        Ok
                    </DangerButton>
                </ModalFooter>
            </Modal>
        );
    }
}
