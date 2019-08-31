import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from '../../Action/Button';

import styles from './styles.scss';

interface Props {
    alt: string;
    className?: string;
    imageClassName?: string;
    src: string;
    zoomFactor: number;
    zoomable: boolean;
}

export default class Image extends React.PureComponent<Props> {
    public static defaultProps = {
        zoomFactor: 0.1,
        zoomable: false,
    };

    public constructor(props: Props) {
        super(props);

        this.containerRef = React.createRef();
        this.imageRef = React.createRef();
        this.actionButtonsRef = React.createRef();
    }

    private containerRef: React.RefObject<HTMLDivElement>;

    private imageRef: React.RefObject<HTMLImageElement>;

    private actionButtonsRef: React.RefObject<HTMLDivElement>;

    private handlePlusButtonClick = () => {
        const { current: image } = this.imageRef;

        const { zoomFactor } = this.props;
        const increaseBy = 1 + zoomFactor;

        if (image) {
            image.style.width = `${image.offsetWidth * increaseBy}px`;
            image.style.height = `${image.offsetHeight * increaseBy}px`;
        }
    }

    private handleMinusButtonClick = () => {
        const { current: image } = this.imageRef;

        const { zoomFactor } = this.props;
        const decreaseBy = 1 - zoomFactor;

        if (image) {
            image.style.width = `${image.offsetWidth * decreaseBy}px`;
            image.style.height = `${image.offsetHeight * decreaseBy}px`;
        }
    }

    private handleImageDragStart = (e: React.DragEvent<HTMLImageElement>) => {
        e.preventDefault();
    }

    private handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { current: actionButtons } = this.actionButtonsRef;
        if (actionButtons) {
            actionButtons.style.transform = `translate(${e.currentTarget.scrollLeft}px, ${e.currentTarget.scrollTop}px)`;
        }
    }

    public render() {
        const {
            className: classNameFromProps,
            src,
            alt,
            zoomable,
            imageClassName,
        } = this.props;

        return (
            <div
                className={_cs(classNameFromProps, styles.imageContainer)}
                ref={this.containerRef}
                onScroll={this.handleScroll}
            >
                <img
                    ref={this.imageRef}
                    className={_cs(styles.image, imageClassName)}
                    alt={alt}
                    src={src}
                    onDragStart={this.handleImageDragStart}
                />
                { zoomable && (
                    <div
                        className={styles.actionButtons}
                        ref={this.actionButtonsRef}
                    >
                        <Button
                            title="Zoom in"
                            className={styles.action}
                            iconName="plusOutline"
                            onClick={this.handlePlusButtonClick}
                            tabIndex={-1}
                            transparent
                            smallVerticalPadding
                            smallHorizontalPadding
                        />
                        <Button
                            title="Zoom out"
                            className={styles.action}
                            iconName="minusOutline"
                            onClick={this.handleMinusButtonClick}
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
}
