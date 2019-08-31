import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

function calculateDimensionCost(width: number, height: number, factor: number) {
    return width * Math.sqrt(height) * factor;
}

function calculateRelativeValue(
    minFontSize: number,
    maxFontSize: number,
    width: number,
    height: number,
    factor: number,
) {
    return Math.min(
        maxFontSize,
        minFontSize + ((maxFontSize - minFontSize) * calculateDimensionCost(width, height, factor)),
    );
}

interface Props {
    children: React.ReactNode;
    className?: string;
    maxFontSize: number;
    maxPaddingSize: number;
    minFontSize: number;
    minPaddingSize: number;
    resizeFactor: number;
}

interface State {
    show: boolean;
}

export default class Message extends React.PureComponent<Props, State> {
    public static defaultProps = {
        maxFontSize: 20,
        maxPaddingSize: 16,
        minFontSize: 8,
        minPaddingSize: 3,
        resizeFactor: 0.0001,
    };

    public constructor(props: Props) {
        super(props);

        this.state = { show: false };
        this.containerRef = React.createRef();
    }

    public componentDidMount() {
        const { current: container } = this.containerRef;
        this.timeout = window.setTimeout(() => {
            if (!container || !container.parentElement) {
                console.warn('Cannot observer resize as container is not defined');
                return;
            }
            this.resizeObserver = new ResizeObserver(this.handleResize);
            this.resizeObserver.observe(container.parentElement);
            this.setState({ show: true });
        }, 0);
    }

    public componentWillUnmount() {
        clearTimeout(this.timeout);

        const { current: container } = this.containerRef;
        if (!container || !container.parentElement) {
            console.warn('Cannot un-observer resize as container is not defined');
            return;
        }

        if (this.resizeObserver) {
            this.resizeObserver.unobserve(container.parentElement);
        }
    }

    private timeout?: number;

    private containerRef: React.RefObject<HTMLDivElement>;

    private resizeObserver?: ResizeObserver;

    private handleResize = (e: ResizeObserverEntry[]) => {
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

        if (container) {
            container.style.width = `${width}px`;
            container.style.height = `${height}px`;
            container.style.fontSize = `${fontSize}px`;
            container.style.padding = `${padding}px`;
        }
    }

    public render() {
        const {
            className: classNameFromProps,
            children,
        } = this.props;

        const className = _cs(
            classNameFromProps,
            styles.message,
        );

        const { show } = this.state;

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
