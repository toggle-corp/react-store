import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import Confirm from '../../View/Modal/Confirm';
import TextInput from '../../Input/TextInput';
import { isFalsy } from '../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    skipConfirmation: PropTypes.bool,
    challengeValue: PropTypes.string,
    challengeLabel: PropTypes.string,
    challengePlaceholder: PropTypes.string,
    confirmationMessage: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node,
    ]).isRequired,
    confirmationTitle: PropTypes.string,
};

const defaultProps = {
    onClick: () => {},
    disabled: false,
    confirmationTitle: undefined,
    challengeValue: undefined,
    challengeLabel: '',
    challengePlaceholder: '',
    skipConfirmation: false,
};

const ConfirmOnClick = (WrappedComponent) => {
    const ConfirmComponent = class extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        constructor(props) {
            super(props);

            this.state = {
                showConfirm: false,
                challengeTextInputValue: '',
            };
        }

        handleModalOpen = () => {
            const {
                skipConfirmation,
                onClick,
            } = this.props;
            if (skipConfirmation) {
                onClick();
            } else {
                this.setState({ showConfirm: true });
            }
        }

        handleModalClose = (confirm) => {
            // Only call `onClick` after setting the state,
            // in order to prevent error which can occur if
            // this component is unmounted by `onClick` event handler.
            this.setState(
                {
                    showConfirm: false,
                    challengeTextInputValue: '',
                },
                () => {
                    if (confirm) {
                        this.props.onClick();
                    }
                },
            );
        }

        handleChallengeInputChange = (value) => {
            this.setState({
                challengeTextInputValue: value,
            });
        }

        hasChallenge = () => !isFalsy(this.props.challengeValue)

        render() {
            const {
                disabled,
                onClick, // eslint-disable-line no-unused-vars
                confirmationMessage,
                confirmationTitle,
                challengeValue, // eslint-disable-line no-unused-vars
                skipConfirmation, // eslint-disable-line no-unused-vars
                challengeLabel,
                challengePlaceholder,
                ...otherProps
            } = this.props;
            const {
                showConfirm,
                challengeTextInputValue,
            } = this.state;

            const hasChallenge = this.hasChallenge();
            const isConfirmationMessageNode = React.isValidElement(confirmationMessage);
            const challengeSuccess = challengeTextInputValue === challengeValue;
            const confirmDisabled = hasChallenge && !challengeSuccess;

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
                            disabled={confirmDisabled}
                            onClose={this.handleModalClose}
                            title={confirmationTitle}
                            autoFocus={!hasChallenge}
                        >
                            <div className={styles.confirmContent} >
                                {
                                    isConfirmationMessageNode
                                        ? confirmationMessage
                                        : (
                                            <p>
                                                {confirmationMessage}
                                            </p>
                                        )
                                }
                                {
                                    hasChallenge &&
                                    <div className={styles.challengeForm} >
                                        <span>{challengeLabel}</span>
                                        <TextInput
                                            className={styles.challengeText}
                                            value={challengeTextInputValue}
                                            placeholder={challengePlaceholder}
                                            onChange={this.handleChallengeInputChange}
                                            autoFocus
                                        />
                                    </div>
                                }
                            </div>
                        </Confirm>
                    }
                </Fragment>
            );
        }
    };

    return ConfirmComponent;
};
export default ConfirmOnClick;
