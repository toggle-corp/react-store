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
    Button,
    PrimaryButton,
} from '../../Action';

import FloatingContainer from '../FloatingContainer';

const propTypes = {
    /**
     * child elements
     */
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element,
    ]).isRequired,

    /**
     * required for style override
     */
    className: PropTypes.string,

    /**
     * Should modal close on escape?
     */
    closeOnEscape: PropTypes.bool,

    /**
     * Should modal close on outside click?
     */
    closeOnBlur: PropTypes.bool,

    /**
     * A callback when the modal is closed
     */
    onClose: PropTypes.func.isRequired,

    title: PropTypes.string,

    /**
     * show modal ?
     */
    show: PropTypes.bool.isRequired,
};

const defaultProps = {
    className: '',
    closeOnEscape: false,
    closeOnBlur: false,
    title: 'Confirm',
};

@CSSModules(styles, { allowMultiple: true })
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
            <Button
                styleName="cancel-button"
                className="cancel-button"
                onClick={this.handleCancelButtonClick}
            >
               Cancel
            </Button>
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
        this.props.onClose();
    }

    render() {
        return (
            <FloatingContainer
                show={this.state.show}
                onClose={this.handleClose}
                containerId="modal-container"
                closeOnEscape={this.props.closeOnEscape}
                closeOnBlur={this.props.closeOnBlur}
                className={`${this.props.className} modal-wrapper`}
            >
                <div
                    className="confirm-content"
                    styleName="confirm-content"
                >
                    { this.getContent() }
                </div>
            </FloatingContainer>
        );
    }
}
