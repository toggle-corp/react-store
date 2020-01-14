import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { _cs, randomString } from '@togglecorp/fujs';

const propTypes = {
    disabled: PropTypes.bool,
    modal: PropTypes.element.isRequired,
    className: PropTypes.string,
    initialShowModal: PropTypes.bool,
    onClose: PropTypes.func,
};

const defaultProps = {
    disabled: false,
    className: '',
    initialShowModal: false,
    onClose: undefined,
};

const modalize = (WrappedButtonComponent) => {
    const ModalComponent = class extends React.PureComponent {
        static propTypes = propTypes;

        static defaultProps = defaultProps;

        constructor(props) {
            super(props);

            this.state = {
                showModal: props.initialShowModal,
                wrappedButtonBCR: undefined,
            };

            this.wrappedButtonRef = React.createRef();
            this.wrappedButtonClassName = randomString(16);
            this.setBCRTimeout = undefined;
            // this.wrappedButtonBCR = undefined;
        }

        componentDidMount() {
            this.setWrappedButtonBCR();
            window.addEventListener('resize', this.handleResize);
            window.addEventListener('scroll', this.handleScroll, true);
        }

        componentWillUnmount() {
            window.removeEventListener('resize', this.handleResize);
            window.removeEventListener('scroll', this.handleScroll, true);
        }

        setWrappedButtonBCR = () => {
            const wrappedButton = document.getElementsByClassName(this.wrappedButtonClassName)[0];

            if (wrappedButton) {
                const wrappedButtonBCR = wrappedButton.getBoundingClientRect();
                this.setState({ wrappedButtonBCR });
            }
        }

        handleResize = () => {
            const { showModal } = this.state;
            if (!showModal) {
                return;
            }
            this.setWrappedButtonBCR();
        }

        handleScroll = () => {
            const { showModal } = this.state;
            if (!showModal) {
                return;
            }
            this.setWrappedButtonBCR();
        }

        handleWrappedButtonClick = () => {
            this.setWrappedButtonBCR();
            this.setState({ showModal: true });
        }

        handleModalClose = (...args) => {
            this.setState({ showModal: false });
            const { onClose } = this.props;
            if (onClose) {
                onClose(...args);
            }
        }

        render() {
            const {
                disabled,
                modal,
                className: classNameFromProps,
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                initialShowModal,
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                onClose,
                ...otherProps
            } = this.props;

            const {
                showModal,
                wrappedButtonBCR,
            } = this.state;

            const className = _cs(
                classNameFromProps,
                this.wrappedButtonClassName,
            );

            return (
                <Fragment>
                    <WrappedButtonComponent
                        disabled={disabled || showModal}
                        onClick={this.handleWrappedButtonClick}
                        className={className}
                        {...otherProps}
                    />
                    { showModal && React.cloneElement(
                        modal,
                        {
                            closeModal: this.handleModalClose,
                            parentBCR: wrappedButtonBCR,
                        },
                    )}
                </Fragment>
            );
        }
    };

    return ModalComponent;
};
export default modalize;
