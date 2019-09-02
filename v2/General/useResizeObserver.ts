import { useEffect, useRef } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

function useResizeObserver(
    containerRef: React.RefObject<HTMLElement>,
    onObserve: () => void,
    onResize: (e: ResizeObserverEntry[]) => void,
) {
    const resizeObserver = useRef<ResizeObserver>();

    useEffect(
        () => {
            const { current: containerToObserve } = containerRef;
            if (!containerToObserve || !containerToObserve.parentElement) {
                console.warn('Cannot observer resize as container is not defined');
            } else {
                resizeObserver.current = new ResizeObserver(onResize);
                resizeObserver.current.observe(containerToObserve.parentElement);
                onObserve();
            }

            return () => {
                const { current: containerToUnobserve } = containerRef;

                if (!containerToUnobserve || !containerToUnobserve.parentElement) {
                    console.warn('Cannot un-observer resize as container is not defined');
                    return;
                }

                if (resizeObserver.current) {
                    resizeObserver.current.unobserve(containerToUnobserve.parentElement);
                }
            };
        },
        [
            onObserve,
            onResize,
            containerRef.current,
        ],
    );
}

export default useResizeObserver;
