import React, { useRef, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from '../../Action/Button';

import styles from './styles.scss';

/*
# Feature
- Add zoomFactor prop to control amount to zoom
*/

interface Props {
    alt: string;
    className?: string;
    imageClassName?: string;
    src: string;
    zoomFactor: number;
    zoomable: boolean;
}

function Image(props: Props) {
    const {
        alt,
        className: classNameFromProps,
        imageClassName,
        src,
        zoomFactor,
        zoomable,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const actionButtonsRef = useRef<HTMLDivElement>(null);

    const handlePlusButtonClick = useCallback(
        () => {
            const { current: image } = imageRef;

            const increaseBy = 1 + zoomFactor;

            if (image) {
                image.style.width = `${image.offsetWidth * increaseBy}px`;
                image.style.height = `${image.offsetHeight * increaseBy}px`;
            }
        },
        [zoomFactor, imageRef],
    );

    const handleMinusButtonClick = useCallback(
        () => {
            const { current: image } = imageRef;

            const increaseBy = 1 - zoomFactor;

            if (image) {
                image.style.width = `${image.offsetWidth * increaseBy}px`;
                image.style.height = `${image.offsetHeight * increaseBy}px`;
            }
        },
        [zoomFactor, imageRef],
    );


    const handleImageDragStart = useCallback(
        (e: React.DragEvent<HTMLImageElement>) => {
            e.preventDefault();
        },
        [],
    );

    const handleScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            const { current: actionButtons } = actionButtonsRef;
            if (actionButtons) {
                actionButtons.style.transform = `translate(${e.currentTarget.scrollLeft}px, ${e.currentTarget.scrollTop}px)`;
            }
        },
        [actionButtonsRef],
    );

    return (
        <div
            className={_cs(classNameFromProps, styles.imageContainer)}
            ref={containerRef}
            onScroll={handleScroll}
        >
            <img
                ref={imageRef}
                className={_cs(styles.image, imageClassName)}
                alt={alt}
                src={src}
                onDragStart={handleImageDragStart}
            />
            { zoomable && (
                <div
                    className={styles.actionButtons}
                    ref={actionButtonsRef}
                >
                    <Button
                        title="Zoom in"
                        className={styles.action}
                        iconName="plusOutline"
                        onClick={handlePlusButtonClick}
                        tabIndex={-1}
                        transparent
                        smallVerticalPadding
                        smallHorizontalPadding
                    />
                    <Button
                        title="Zoom out"
                        className={styles.action}
                        iconName="minusOutline"
                        onClick={handleMinusButtonClick}
                        tabIndex={-1}
                        transparent
                        smallVerticalPadding
                        smallHorizontalPadding
                    />
                </div>
            )}
        </div>
    );
}
Image.defaultProps = {
    zoomFactor: 0.1,
    zoomable: false,
};

export default Image;
