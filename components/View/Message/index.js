import PropTypes from 'prop-types';
import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';

import styles from './styles.scss';

const propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    maxFontSize: PropTypes.number,
    minFontSize: PropTypes.number,
    maxPaddingSize: PropTypes.number,
    minPaddingSize: PropTypes.number,
    resizeFactor: PropTypes.number,
    onSizeCategorization: PropTypes.func,
};

const defaultProps = {
    className: '',
    children: undefined,
    maxFontSize: 20,
    minFontSize: 8,
    maxPaddingSize: 16,
    minPaddingSize: 1,
    resizeFactor: 0.0001,
    onSizeCategorization: undefined,
};

const sizeCategoryMap = {
    1: 'small',
    2: 'medium',
    3: 'large',
};

const calculateDimensionCost = (width, height, factor) => (
    width * Math.sqrt(height) * factor
);

const calculateRelativeValue = (minFontSize, maxFontSize, width, height, factor) => (
    Math.min(
        maxFontSize,
        minFontSize + ((maxFontSize - minFontSize) * calculateDimensionCost(width, height, factor)),
    )
);

export default class Message extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = { show: false };
        this.containerRef = React.createRef();
    }

    componentDidMount() {
        const { current: container } = this.containerRef;

        this.timeout = setTimeout(() => {
            this.resizeObserver = new ResizeObserver(this.handleResize);
            this.resizeObserver.observe(container.parentNode);
            this.setState({ show: true });
        }, 0);
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
        if (this.resizeObserver) {
            const { current: container } = this.containerRef;
            this.resizeObserver.unobserve(container.parentNode);
        }
    }

    handleResize = (e) => {
        const {
            0: { target },
        } = e;

        const {
            width,
            height,
        } = target.getBoundingClientRect();

        const {
            maxFontSize,
            minFontSize,
            maxPaddingSize,
            minPaddingSize,
            resizeFactor,
            onSizeCategorization,
        } = this.props;

        const { current: container } = this.containerRef;

        const fontSize = calculateRelativeValue(
            minFontSize, maxFontSize, width, height, resizeFactor,
        );
        const padding = calculateRelativeValue(
            minPaddingSize, maxPaddingSize, width, height, resizeFactor,
        );

        container.style.width = `${width}px`;
        container.style.height = `${height}px`;
        container.style.fontSize = `${fontSize}px`;
        container.style.padding = `${padding}px`;

        if (onSizeCategorization) {
            // small / medium / large
            const sizeCategory = sizeCategoryMap[calculateRelativeValue(
                1, 3, width, height, resizeFactor,
            )];

            onSizeCategorization(sizeCategory);
        }
    }

    render() {
        const {
            className: classNameFromProps,
            children,
        } = this.props;

        const { show } = this.state;

        const className = `
            ${classNameFromProps}
            ${styles.message}
        `;

        return (
            <div
                ref={this.containerRef}
                className={className}
            >
                { show && children }
            </div>
        );
    }
}
