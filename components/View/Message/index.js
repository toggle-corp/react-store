import PropTypes from 'prop-types';
import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';

import styles from './styles.scss';

const propTypes = {
    children: PropTypes.node,
    className: PropTypes.string.isRequired,
    maxFontSize: PropTypes.number.isRequired,
    minFontSize: PropTypes.number.isRequired,
    maxPaddingSize: PropTypes.number.isRequired,
    minPaddingSize: PropTypes.number.isRequired,
    resizeFactor: PropTypes.number,
};

const defaultProps = {
    className: '',
    children: undefined,
    maxFontSize: 20,
    minFontSize: 8,
    maxPaddingSize: 16,
    minPaddingSize: 5,
    resizeFactor: 0.0001,
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
            0: {
                contentRect: {
                    width,
                    height,
                },
            },
        } = e;

        const {
            maxFontSize,
            minFontSize,
            maxPaddingSize,
            minPaddingSize,
            resizeFactor,
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
    }

    render() {
        const {
            className: classNameFromProps,
            children,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.message}
        `;

        return (
            <div
                ref={this.containerRef}
                className={className}
            >
                { this.state.show && children }
            </div>
        );
    }
}
