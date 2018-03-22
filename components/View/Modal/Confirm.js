import PropTypes from 'prop-types';
import React from 'react';

import Button from '../../Action/Button';
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
    title: 'Confirm',
};

export default class Confirm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            show: props.show,
        };
    }

    // XXX: show remove?
    componentWillReceiveProps(nextProps) {
        this.setState({
            show: nextProps.show,
        });
    }

    // XXX: is this used?
    getContent = () => ([
    ])

    handleOkButtonClick = () => {
        this.setState({
            show: false,
        });

        this.props.onClose(true);
    }

    handleCancelButtonClick = () => {
        this.setState({
            show: false,
        });

        this.props.onClose(false);
    }

    handleClose = () => {
        this.setState({
            show: false,
        });
        this.props.onClose(false);
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
            <Modal className={`${className} confirm ${styles.confirm}`}>
                <ModalHeader title={title} />
                <ModalBody>
                    { children }
                </ModalBody>
                <ModalFooter>
                    <Button
                        className={`cancelButton ${styles.cancelButton}`}
                        onClick={this.handleCancelButtonClick}
                        autoFocus
                    >
                        Cancel
                    </Button>
                    <PrimaryButton
                        className={`okButton ${styles.okButton}`}
                        onClick={this.handleOkButtonClick}
                    >
                        Ok
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }
}
