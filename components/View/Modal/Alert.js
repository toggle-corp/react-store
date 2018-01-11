import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
import {
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '../../View';

import {
    PrimaryButton,
} from '../../Action';

import Modal from './';

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

@CSSModules(styles, { allowMultiple: true })
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

    getContent = () => ([
        <ModalHeader
            key="header"
            title={this.props.title}
        />,
        <ModalBody
            key="body"
        >
            { this.props.children }
        </ModalBody>,
        <ModalFooter
            key="footer"
        >
            <PrimaryButton
                styleName="ok-button"
                className="ok-button"
                onClick={this.handleOkButtonClick}
            >
                Ok
            </PrimaryButton>
        </ModalFooter>,
    ])

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
        return (
            <Modal
                show={this.state.show}
                className={`${this.props.className} modal-wrapper`}
            >
                <div
                    className="alert-content"
                    styleName="alert-content"
                >
                    { this.getContent() }
                </div>
            </Modal>
        );
    }
}
