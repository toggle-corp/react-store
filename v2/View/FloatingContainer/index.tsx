import React, { useRef, useEffect, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import Float from '../Float';
// import Haze from '../Haze';

import useHaze from '../../General/useHaze';
import { Keys } from '../../types';

import styles from './styles.scss';

/*
# Breaking Change
- Change prop parent to parentRef

# Todo
- Merge with Float
- onBlur and onClose should be merged into same function
*/

interface Props {
    className?: string;
    closeOnEscape: boolean;
    focusTrap: boolean;
    onBlur?: () => void;
    onClose?: (attributes: { escape: boolean }) => void;
    onInvalidate?: (e: HTMLDivElement) => Record<string, unknown>; // gets container
    onMouseDown?: (e: MouseEvent) => void; // gets mouse down event
    parentRef: React.RefObject<HTMLElement>;
    showHaze: boolean;
    children?: React.ReactNode;
}

/* Float with haze, close on outside click, and close on escape */
function FloatingContainer(props: Props) {
    const {
        children,
        className: classNameFromProps,
        closeOnEscape,
        focusTrap,
        onBlur,
        onClose,
        onInvalidate,
        onMouseDown,
        parentRef,
        showHaze,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);

    const handleContainerInvalidate = useCallback(
        () => {
            const { current: container } = containerRef;
            if (container && onInvalidate) {
                const containerStyles = onInvalidate(container);
                if (containerStyles) {
                    Object.assign(container.style, containerStyles);
                } else {
                    console.error('FloatingContainer.onInvalidate should return style');
                }
            }
        },
        [
            containerRef,
            onInvalidate,
        ],
    );

    const handleMouseDown = useCallback(
        (e: MouseEvent) => {
            const { current: container } = containerRef;
            const { current: parent } = parentRef;

            const isTargetOrContainsTarget = container && (
                container === e.target || container.contains(e.target as HTMLElement)
            );

            const isTargetParentOrContainedInParent = parent && (
                parent === e.target || parent.contains(e.target as HTMLElement)
            );

            const clickedInside = isTargetOrContainsTarget || isTargetParentOrContainedInParent;

            if (!clickedInside) {
                if (onBlur) {
                    onBlur();
                }
            } else if (onMouseDown) {
                onMouseDown(e);
            }
        },
        [
            onBlur,
            onMouseDown,
            parentRef,
            containerRef,
        ],
    );

    const handleKeyPressed = useCallback(
        (event: KeyboardEvent) => {
            const { current: container } = containerRef;
            const isLastModal = container && container.dataset.lastModal === 'true';
            if (isLastModal && onClose && closeOnEscape && event.keyCode === Keys.Esc) {
                onClose({ escape: true });
            }
        },
        [
            closeOnEscape,
            onClose,
            containerRef,
        ],
    );

    useEffect(
        () => {
            window.addEventListener('mousedown', handleMouseDown);
            return () => {
                window.removeEventListener('mousedown', handleMouseDown);
            };
        },
        [handleMouseDown],
    );

    useEffect(
        () => {
            document.addEventListener('keydown', handleKeyPressed);
            return () => {
                document.removeEventListener('keydown', handleKeyPressed);
            };
        },
        [handleKeyPressed],
    );

    const myClassName = _cs(
        classNameFromProps,
        styles.floatingContainer,
        'floating-container',
    );

    const [containerId, className] = useHaze(myClassName, showHaze);

    return (
        <Float
            onInvalidate={handleContainerInvalidate}
            focusTrap={focusTrap}
        >
            <div
                id={containerId}
                className={className}
                ref={containerRef}
            >
                { children }
            </div>
        </Float>
    );
}
FloatingContainer.defaultProps = {
    closeOnEscape: false,
    focusTrap: false,
    showHaze: false,
};
export default FloatingContainer;
