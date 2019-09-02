import React, { useCallback, useState, useRef } from 'react';
import { _cs } from '@togglecorp/fujs';

import useResizeObserver from '../../General/useResizeObserver';

import styles from './styles.scss';

function calculateDimensionCost(width: number, height: number, factor: number) {
    return width * Math.sqrt(height) * factor;
}

function calculateRelativeValue(
    minFontSize: number,
    maxFontSize: number,
    width: number,
    height: number,
    factor: number,
) {
    return Math.min(
        maxFontSize,
        minFontSize + ((maxFontSize - minFontSize) * calculateDimensionCost(width, height, factor)),
    );
}

interface Props {
    children: React.ReactNode;
    className?: string;
    maxFontSize: number;
    maxPaddingSize: number;
    minFontSize: number;
    minPaddingSize: number;
    resizeFactor: number;
}

interface State {
    show: boolean;
}

function Message(props: Props) {
    const {
        maxFontSize,
        maxPaddingSize,
        minFontSize,
        minPaddingSize,
        resizeFactor,
    } = props;

    const [isChildrenShown, setIsChildrenShown] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    const showChildren = useCallback(
        () => {
            setIsChildrenShown(true);
        },
        [],
    );

    const handleResize = useCallback(
        (e: ResizeObserverEntry[]) => {
            const {
                0: {
                    contentRect: {
                        width,
                        height,
                    },
                },
            } = e;

            const { current: container } = containerRef;

            const fontSize = calculateRelativeValue(
                minFontSize, maxFontSize, width, height, resizeFactor,
            );
            const padding = calculateRelativeValue(
                minPaddingSize, maxPaddingSize, width, height, resizeFactor,
            );

            if (container) {
                container.style.width = `${width}px`;
                container.style.height = `${height}px`;
                container.style.fontSize = `${fontSize}px`;
                container.style.padding = `${padding}px`;
            }
        },
        [
            maxFontSize,
            maxPaddingSize,
            minFontSize,
            minPaddingSize,
            resizeFactor,
            containerRef.current,
        ],
    );

    useResizeObserver(
        containerRef,
        showChildren,
        handleResize,
    );

    const {
        className: classNameFromProps,
        children,
    } = props;

    const className = _cs(
        classNameFromProps,
        styles.message,
    );

    return (
        <div
            ref={containerRef}
            className={className}
        >
            { isChildrenShown && children }
        </div>
    );
}
Message.defaultProps = {
    maxFontSize: 20,
    maxPaddingSize: 16,
    minFontSize: 8,
    minPaddingSize: 3,
    resizeFactor: 0.0001,
};

export default Message;
