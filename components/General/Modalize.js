import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

const propTypes = {
    disabled: PropTypes.bool,
    modal: PropTypes.element.isRequired,
};

const defaultProps = {
    disabled: false,
};

const modalize = (WrappedButtonComponent) => {
    const ModalComponent = class extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        constructor(props) {
            super(props);

            this.state = { showModal: false };
        }

        handleModalOpen = () => {
            this.setState({ showModal: true });
        }

        handleModalClose = () => {
            this.setState({ showModal: false });
        }

        render() {
            const {
                disabled,
                modal,
                ...otherProps
            } = this.props;
            const { showModal } = this.state;

            return (
                <Fragment>
                    <WrappedButtonComponent
                        disabled={disabled || showModal}
                        onClick={this.handleModalOpen}
                        {...otherProps}
                    />
                    { showModal &&
                        React.cloneElement(modal, { closeModal: this.handleModalClose })
                    }
                </Fragment>
            );
        }
    };

    return ModalComponent;
};
export default modalize;
