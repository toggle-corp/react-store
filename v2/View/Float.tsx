import React, { useCallback, useEffect, useLayoutEffect } from 'react';
import FocusTrap from 'react-focus-trap';

import Portal from './Portal';

interface Props {
    children: React.ReactNode;
    focusTrap: boolean;
    onInvalidate?: () => void;
}

/*
# Todo
- Can be merged with FloatingContainer
*/

/* Portal with invalidation and focus trap */
function Float(props: Props) {
    const {
        children,
        focusTrap,
        onInvalidate,
    } = props;

    const handleInvalidate = useCallback(
        () => {
            if (onInvalidate) {
                onInvalidate();
            }
        },
        [onInvalidate],
    );

    useLayoutEffect(
        handleInvalidate,
        [],
    );

    useEffect(
        () => {
            window.addEventListener('resize', handleInvalidate);
            return () => {
                window.removeEventListener('resize', handleInvalidate);
            };
        },
        [handleInvalidate],
    );

    useEffect(
        () => {
            window.addEventListener('scroll', handleInvalidate);
            return () => {
                window.removeEventListener('scroll', handleInvalidate);
            };
        },
        [handleInvalidate],
    );

    if (focusTrap) {
        return (
            <Portal>
                <FocusTrap>
                    { children }
                </FocusTrap>
            </Portal>
        );
    }

    return (
        <Portal>
            { children }
        </Portal>
    );
}
Float.defaultProps = {
    focusTrap: false,
};

export default Float;
