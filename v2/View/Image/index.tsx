import React, { useRef, useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from '../../Action/Button';
import Modal from '../../../components/View/Modal';
import ModalBody from '../../../components/View/Modal/Body';
import ModalHeader from '../../../components/View/Modal/Header';

import styles from './styles.scss';

interface Props {
    alt: string;
    className?: string;
    imageClassName?: string;
    src: string;
    zoomFactor: number;
    zoomable: boolean;
    expandable: boolean;
}

interface ImageInModalProps extends Props {
    closeModal?: () => void;
}

function ImageInModal(props: ImageInModalProps) {
    const {
        closeModal,
    } = props;

    return (
        <Modal
            className={styles.modal}
            closeOnEscape
            closeOnOutsideClick
            onClose={closeModal}
        >
            <ModalHeader
                rightComponent={(
                    <Button
                        onClick={closeModal}
                        buttonType="button-danger"
                        iconName="close"
                        transparent
                    />
                )}
            />
            <ModalBody
                className={styles.modalBody}
            >
                <Image
                    {...props}
                    className={styles.image}
                    expandable={false}
                />
            </ModalBody>
        </Modal>
    );
}

/*
# Feature
- Add zoomFactor prop to control amount to zoom
*/

function Image(props: Props) {
    const {
        alt,
        className: classNameFromProps,
        imageClassName,
        src,
        zoomFactor,
        zoomable,
        expandable,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const actionButtonsRef = useRef<HTMLDivElement>(null);
    const [showImageModal, setShowImageModal] = useState(false);

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

    const handleImageClick = useCallback(() => {
        setShowImageModal(true);
    }, []);

    const handleImageClose = useCallback(() => {
        setShowImageModal(false);
    }, []);

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
                title="Click to expand"
                onClick={handleImageClick}
                role="presentation"
                onDragStart={handleImageDragStart}
            />
            <div
                className={styles.actionButtons}
                ref={actionButtonsRef}
            >
                { zoomable && (
                    <>
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
                    </>
                )}
                {(expandable && showImageModal) && (
                    <ImageInModal
                        {...props}
                        expandable={false}
                        closeModal={handleImageClose}
                    />
                )}
            </div>
        </div>
    );
}

Image.defaultProps = {
    zoomFactor: 0.1,
    zoomable: false,
    expandable: false,
};

export default Image;
