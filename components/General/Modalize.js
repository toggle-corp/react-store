import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import {
    _cs,
    randomString,
} from '../../utils/common';

const propTypes = {
    disabled: PropTypes.bool,
    modal: PropTypes.element.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    disabled: false,
    className: '',
};

const modalize = (WrappedButtonComponent) => {
    const ModalComponent = class extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        constructor(props) {
            super(props);

            this.state = { showModal: false };

            this.wrappedButtonRef = React.createRef();
            this.wrappedButtonClassName = randomString();
            this.wrappedButtonBCR = undefined;
        }

        componentDidMount() {
            this.setWrappedButtonBCR();
        }

        componentDidUpdate() {
            this.setWrappedButtonBCR();
        }

        setWrappedButtonBCR = () => {
            const wrappedButton = document.getElementsByClassName(this.wrappedButtonClassName)[0];

            if (wrappedButton) {
                this.wrappedButtonBCR = wrappedButton.getBoundingClientRect();
            }
        }

        handleWrappedButtonClick = () => {
            this.setWrappedButtonBCR();
            this.setState({ showModal: true });
        }

        handleModalClose = () => {
            this.setState({ showModal: false });
        }

        render() {
            const {
                disabled,
                modal,
                className: classNameFromProps,
                ...otherProps
            } = this.props;

            const { showModal } = this.state;
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
                            parentBCR: this.wrappedButtonBCR,
                        },
                    )}
                </Fragment>
            );
        }
    };

    return ModalComponent;
};
export default modalize;
