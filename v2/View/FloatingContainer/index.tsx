import React, { useRef, useEffect, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import Float from '../Float';
// import Haze from '../Haze';

import useHaze from '../../General/useHaze';
import { Keys } from '../../types';

import styles from './styles.scss';

interface Props {
    className?: string;
    closeOnEscape: boolean;
    focusTrap: boolean;
    onBlur?: () => void;
    onClose?: (attributes: { escape: boolean }) => void;
    onInvalidate?: (e: HTMLDivElement) => object; // gets container
    onMouseDown?: (e: MouseEvent) => void; // gets mouse down event
    parent?: HTMLElement;
    showHaze: boolean;
    children?: React.ReactNode;
}

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
        parent,
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
            parent,
            containerRef.current,
        ],
    );

    const handleKeyPressed = useCallback(
        (event: KeyboardEvent) => {
            if (onClose && closeOnEscape && event.keyCode === Keys.Esc) {
                onClose({ escape: true });
            }
        },
        [
            closeOnEscape,
            onClose,
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
        [handleMouseDown],
    );

    let containerId;
    let className = _cs(
        classNameFromProps,
        styles.floatingContainer,
        'floating-container',
    );
    if (showHaze) {
        ([containerId, className] = useHaze());
    }

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
