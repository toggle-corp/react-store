import PropTypes from 'prop-types';
import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';

import styles from './styles.scss';

const propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    maxFontSize: PropTypes.number,
    minFontSize: PropTypes.number,
    resizeFactor: PropTypes.number,
};

const defaultProps = {
    className: '',
    children: undefined,
    maxFontSize: 18,
    minFontSize: 10,
    resizeFactor: 0.006,
};

export default class Message extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.containerRef = React.createRef();
    }

    componentDidMount() {
        const { current: container } = this.containerRef;

        this.resizeObserver = new ResizeObserver((e) => {
            const {
                maxFontSize,
                minFontSize,
                resizeFactor,
            } = this.props;

            const {
                width,
                height,
            } = e[0].contentRect;

            container.style.width = `${width}px`;
            container.style.height = `${height}px`;

            const fontSize = Math.min(
                maxFontSize,
                Math.max(
                    minFontSize,
                    Math.round(width * Math.sqrt(height) * resizeFactor),
                ),
            );

            container.style.fontSize = `${fontSize}px`;
        });

        this.resizeObserver.observe(container.parentNode);
    }

    componentWillUnmount() {
        const { current: container } = this.containerRef;
        this.resizeObserver.unobserve(container.parentNode);
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
                { children }
            </div>
        );
    }
}
