import React, { Fragment, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { _cs, randomString } from '@togglecorp/fujs';

const controlledWrapperPropTypes = {
    disabled: PropTypes.bool,
    modal: PropTypes.element.isRequired,
    className: PropTypes.string,
    onClose: PropTypes.func,
    showModal: PropTypes.bool,
    onModalVisibilityChange: PropTypes.func,
};

const controlledWrapperDefaultProps = {
    showModal: false,
    disabled: false,
    className: '',
    onClose: undefined,
    onModalVisibilityChange: undefined,
};

export const controlledModalize = (WrappedButtonComponent) => {
    const ModalComponent = (props) => {
        const {
            disabled,
            modal,
            className: classNameFromProps,
            onClose,
            showModal,
            onModalVisibilityChange,
            ...otherProps
        } = props;

        const [wrappedButtonClassName] = useState(() => randomString(16));
        const [wrappedButtonBCR, setWrappedButtonBCR] = useState(undefined);

        const handleWrappedButtonBCRChange = useCallback(() => {
            const wrappedButton = document.getElementsByClassName(wrappedButtonClassName)[0];

            if (wrappedButton) {
                const newWrappedButtonBCR = wrappedButton.getBoundingClientRect();
                setWrappedButtonBCR(newWrappedButtonBCR);
            }
        }, [setWrappedButtonBCR, wrappedButtonClassName]);

        useEffect(() => {
            handleWrappedButtonBCRChange();
        }, [handleWrappedButtonBCRChange]);

        const handleResize = useCallback(() => {
            if (!showModal) {
                return;
            }
            handleWrappedButtonBCRChange();
        }, [handleWrappedButtonBCRChange, showModal]);

        const handleScroll = useCallback(() => {
            if (!showModal) {
                return;
            }
            handleWrappedButtonBCRChange();
        }, [handleWrappedButtonBCRChange, showModal]);

        useEffect(() => {
            window.addEventListener('scroll', handleScroll, true);
            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('scroll', handleScroll, true);
                window.removeEventListener('resize', handleResize);
            };
        }, [handleScroll, handleResize]);

        const handleWrappedButtonClick = useCallback(() => {
            handleWrappedButtonBCRChange();

            if (onModalVisibilityChange) {
                onModalVisibilityChange(true);
            }
        }, [handleWrappedButtonBCRChange, onModalVisibilityChange]);

        const handleModalClose = useCallback((...args) => {
            if (onModalVisibilityChange) {
                onModalVisibilityChange(false);
            }
            if (onClose) {
                onClose(...args);
            }
        }, [onClose, onModalVisibilityChange]);

        const className = _cs(
            classNameFromProps,
            wrappedButtonClassName,
        );

        return (
            <Fragment>
                <WrappedButtonComponent
                    disabled={disabled || showModal}
                    onClick={handleWrappedButtonClick}
                    className={className}
                    {...otherProps}
                />
                { showModal && React.cloneElement(
                    modal,
                    {
                        closeModal: handleModalClose,
                        parentBCR: wrappedButtonBCR,
                    },
                )}
            </Fragment>
        );
    };

    ModalComponent.propTypes = controlledWrapperPropTypes;
    ModalComponent.defaultProps = controlledWrapperDefaultProps;

    return ModalComponent;
};

const propTypes = {
    initialShowModal: PropTypes.bool,
};

const defaultProps = {
    initialShowModal: false,
};

const modalize = (WrappedButtonComponent) => {
    const ControlledWrappedComponent = controlledModalize(WrappedButtonComponent);

    const ModalComponent = (props) => {
        const {
            initialShowModal,
            ...otherProps
        } = props;
        const [showModal, setShowModal] = useState(initialShowModal);

        return (
            <ControlledWrappedComponent
                showModal={showModal}
                onModalVisibilityChange={setShowModal}
                {...otherProps}
            />
        );
    };

    ModalComponent.propTypes = propTypes;
    ModalComponent.defaultProps = defaultProps;

    return ModalComponent;
};

export default modalize;
