import PropTypes from 'prop-types';
import React from 'react';

import {
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '../../View';

import {
    Button,
    PrimaryButton,
} from '../../Action';

import Modal from './';
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

    componentWillReceiveProps(nextProps) {
        this.setState({
            show: nextProps.show,
        });
    }

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
                        className={`cancel-button ${styles['cancel-button']}`}
                        onClick={this.handleCancelButtonClick}
                    >
                        Cancel
                    </Button>
                    <PrimaryButton
                        className={`ok-button ${styles['ok-button']}`}
                        onClick={this.handleOkButtonClick}
                    >
                        Ok
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }
}
