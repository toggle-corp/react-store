import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from '../../Action/Button';
// NOTE: can we normal button here

import styles from './styles.scss';

interface Props {
    className?: string;
    imageClassName?: string;
    src: string;
    alt: string;
    zoomable: boolean;
    zoomFactor: number;
}

export default class Image extends React.PureComponent<Props> {
    static defaultProps = {
        zoomable: false,
        zoomFactor: 0.1,
    };

    constructor(props: Props) {
        super(props);

        this.containerRef = React.createRef();
        this.imageRef = React.createRef();
        this.actionButtonsRef = React.createRef();
    }

    private containerRef: React.RefObject<HTMLDivElement>;

    private imageRef: React.RefObject<HTMLImageElement>;

    private actionButtonsRef: React.RefObject<HTMLDivElement>;

    handlePlusButtonClick = () => {
        const { current: image } = this.imageRef;

        const { zoomFactor } = this.props;
        const increaseBy = 1 + zoomFactor;

        if (image) {
            image.style.width = `${image.offsetWidth * increaseBy}px`;
            image.style.height = `${image.offsetHeight * increaseBy}px`;
        }
    }

    handleMinusButtonClick = () => {
        const { current: image } = this.imageRef;

        const { zoomFactor } = this.props;
        const decreaseBy = 1 - zoomFactor;

        if (image) {
            image.style.width = `${image.offsetWidth * decreaseBy}px`;
            image.style.height = `${image.offsetHeight * decreaseBy}px`;
        }
    }

    handleImageDragStart = (e: React.DragEvent<HTMLImageElement>) => {
        e.preventDefault();
    }

    handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { current: actionButtons } = this.actionButtonsRef;
        if (actionButtons) {
            actionButtons.style.transform = `translate(${e.currentTarget.scrollLeft}px, ${e.currentTarget.scrollTop}px)`;
        }
    }

    render() {
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
