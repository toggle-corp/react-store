import PropTypes from 'prop-types';
import React from 'react';

import Button from '../../Action/Button';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    src: PropTypes.string,
    alt: PropTypes.string,
    zoomable: PropTypes.bool,
};

const defaultProps = {
    className: '',
    src: '',
    alt: '',
    zoomable: false,
};

const ActionButton = p => (
    <Button
        {...p}
        tabIndex="-1"
        transparent
        smallVerticalPadding
        smallHorizontalPadding
    />
);

export default class Image extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.containerRef = React.createRef();
        this.imageRef = React.createRef();
        this.actionButtonsRef = React.createRef();
    }

    handlePlusButtonClick = () => {
        const { current: image } = this.imageRef;

        image.style.width = `${image.offsetWidth * 1.1}px`;
        image.style.height = `${image.offsetHeight * 1.1}px`;
    }

    handleMinusButtonClick = () => {
        const { current: image } = this.imageRef;

        image.style.width = `${image.offsetWidth * 0.9}px`;
        image.style.height = `${image.offsetHeight * 0.9}px`;
    }

    handleImageDragStart = (e) => {
        e.preventDefault();
    }

    handleScroll = (e) => {
        const { current: actionButtons } = this.actionButtonsRef;
        actionButtons.style.transform = `translate(${e.target.scrollLeft}px, ${e.target.scrollTop}px)`;
    }

    render() {
        const {
            className: classNameFromProps,
            src,
            alt,
            zoomable,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.imageContainer}
        `;

        return (
            <div
                className={className}
                ref={this.containerRef}
                onScroll={this.handleScroll}
            >
                <img
                    ref={this.imageRef}
                    className={styles.image}
                    alt={alt}
                    src={src}
                    onDragStart={this.handleImageDragStart}
                />
                { zoomable && (
                    <div
                        className={styles.actionButtons}
                        ref={this.actionButtonsRef}
                    >
                        <ActionButton
                            title="Zoom in"
                            className={styles.action}
                            iconName="plusOutline"
                            onClick={this.handlePlusButtonClick}
                        />
                        <ActionButton
                            title="Zoom out"
                            className={styles.action}
                            iconName="minusOutline"
                            onClick={this.handleMinusButtonClick}
                        />
                    </div>
                )}
            </div>
        );
    }
}
