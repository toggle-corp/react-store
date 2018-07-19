import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import Confirm from '../View/Modal/Confirm';

const propTypes = {
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    confirmationMessage: PropTypes.string.isRequired,
    confirmationTitle: PropTypes.string,
};

const defaultProps = {
    onClick: () => {},
    disabled: false,
    confirmationTitle: undefined,
};

const ConfirmOnClick = (WrappedComponent) => {
    const ConfirmComponent = class extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        constructor(props) {
            super(props);

            this.state = {
                showConfirm: false,
            };
        }

        handleModalOpen = () => {
            this.setState({ showConfirm: true });
        }

        handleModalClose = (confirm) => {
            if (confirm) {
                this.props.onClick();
            }
            this.setState({ showConfirm: false });
        }

        render() {
            const {
                disabled,
                onClick, // eslint-disable-line no-unused-vars
                confirmationMessage,
                confirmationTitle,
                ...otherProps
            } = this.props;
            const { showConfirm } = this.state;

            return (
                <Fragment>
                    <WrappedComponent
                        disabled={disabled || showConfirm}
                        onClick={this.handleModalOpen}
                        {...otherProps}
                    />
                    { showConfirm &&
                        <Confirm
                            show
                            onClose={this.handleModalClose}
                            title={confirmationTitle}
                        >
                            <p>
                                {confirmationMessage}
                            </p>
                        </Confirm>
                    }
                </Fragment>
            );
        }
    };

    return ConfirmComponent;
};
export default ConfirmOnClick;
