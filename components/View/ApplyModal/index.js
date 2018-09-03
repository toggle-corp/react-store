import PropTypes from 'prop-types';
import React from 'react';

import WrapWithFaram from '../../General/WrapWithFaram';

import PrimaryButton from '../../Action/Button/PrimaryButton';
import DangerButton from '../../Action/Button/DangerButton';

import Modal from '../../View/Modal';
import ModalHeader from '../../View/Modal/Header';
import ModalBody from '../../View/Modal/Body';
import ModalFooter from '../../View/Modal/Footer';

const noOp = () => undefined;

const propTypes = {
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    onClose: PropTypes.func,
    onApply: PropTypes.func,
};

const defaultProps = {
    className: '',
    onClose: noOp,
    onApply: noOp,
};


export default class ApplyModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const { className } = this.props;
        const classNames = [
            className,
            'apply-modal',
        ];

        return classNames.join(' ');
    }

    render() {
        const className = this.getClassName();
        const {
            onClose,
            onApply,

            title,
            children,
        } = this.props;

        return (
            <Modal
                className={className}
                closeOnEscape
                onClose={onClose}
            >
                <ModalHeader title={title} />
                <ModalBody>
                    {children}
                </ModalBody>
                <ModalFooter>
                    <DangerButton
                        onClick={onClose}
                        autoFocus
                    >
                        Close
                    </DangerButton>
                    <PrimaryButton onClick={onApply}>
                        Apply
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }
}


export const ApplyModalFaram = WrapWithFaram({
    submitAction: 'onApply',
    submitCallback: 'onApply',
})(ApplyModal);
