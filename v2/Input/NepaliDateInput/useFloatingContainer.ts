import React, { useCallback, useRef, useEffect } from 'react';

import {
    calcFloatPositionInMainWindow,
    defaultLimit,
    defaultOffset,
} from '../../../utils/bounds';

const useFloatingContainer = (): [
    React.RefObject<HTMLDivElement>,
    (container: HTMLDivElement) => { top: string; left: string; width: string },
] => {
    const containerRef = useRef<HTMLDivElement>(null);

    const boundingClientRect = useRef<ClientRect>();

    useEffect(
        () => {
            const { current: container } = containerRef;
            if (container) {
                boundingClientRect.current = container.getBoundingClientRect();
            }
        },
        [containerRef],
    );

    const handleOptionsInvalidate = useCallback(
        (optionsContainer: HTMLDivElement) => {
            const contentRect = optionsContainer.getBoundingClientRect();

            const { current: container } = containerRef;
            const parentRect = container
                ? container.getBoundingClientRect()
                : boundingClientRect.current;

            const offset = { ...defaultOffset };

            const limit = { ...defaultLimit };
            if (parentRect) {
                limit.minW = 240;
                limit.maxW = 240;
            }

            const optionsContainerPosition = calcFloatPositionInMainWindow({
                parentRect,
                contentRect,
                offset,
                limit,
            });

            return optionsContainerPosition;
        },
        [containerRef, boundingClientRect],
    );

    return [containerRef, handleOptionsInvalidate];
};

export default useFloatingContainer;
