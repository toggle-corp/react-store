import getRenderedSize from 'react-rendered-size';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypeData = PropTypes.arrayOf(
    PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
        PropTypes.object,
        PropTypes.array,
    ]),
);

const propTypes = {
    className: PropTypes.string,
    data: propTypeData,

    keyExtractor: PropTypes.func,
    modifier: PropTypes.func,

    renderer: PropTypes.func,
    rendererClassName: PropTypes.string,

    rendererParams: PropTypes.func,
};

const defaultProps = {
    className: '',
    data: [],
    modifier: undefined,
    keyExtractor: undefined,
    renderer: undefined,
    rendererClassName: undefined,
    rendererParams: undefined,
};

export default class DynamicallyVirtualizedListView extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            containerHeight: undefined,
            offset: 0,
        };

        this.itemHeights = {};
        this.itemHeight = 18;

        this.container = React.createRef();
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll, true);

        this.calculateContainerHeight();
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll, true);
    }

    calculateContainerHeight = () => {
        const { current: container } = this.container;
        if (container) {
            const containerBCR = container.getBoundingClientRect();

            if (containerBCR.height !== this.state.containerHeight) {
                this.setState({ containerHeight: containerBCR.height });
            }

            console.warn('container height', containerBCR);
        }
    }

    handleScroll = (e) => {
        if (!this.itemHeight) {
            return;
        }

        const { current: container } = this.container;
        const { offset } = this.state;

        if (e.target === container) {
            const newOffset = Math.floor(container.scrollTop / this.itemHeight);
            if (newOffset !== offset) {
                clearTimeout(this.timeout);

                this.timeout = setTimeout(() => {
                    this.setState({ offset: newOffset });
                }, 200);
            }
        }
    }

    updateItemHeight = () => {
        const { containerHeight } = this.state;
        const itemHeightList = Object.values(this.itemHeights);

        if (itemHeightList.length !== 0) {
            this.itemHeight = itemHeightList.reduce((t, h) => t + h) / itemHeightList.length;
        }

        this.itemsPerPage = Math.ceil(containerHeight / this.itemHeight);
    }

    renderItem = (datum, i) => {
        const {
            data,
            keyExtractor,
            modifier,
            renderer: Renderer,
            rendererClassName: rendererClassNameFromProps,
            rendererParams,
        } = this.props;

        const key = (keyExtractor && keyExtractor(datum, i)) || datum;

        if (modifier) {
            return modifier(key, datum, i, data);
        } else if (Renderer) {
            const extraProps = rendererParams
                ? rendererParams(key, datum, i, data)
                : undefined;
            const rendererClassName = `
                ${rendererClassNameFromProps}
                ${styles.item}
            `;

            return (
                <Renderer
                    className={rendererClassName}
                    key={key}
                    {...extraProps}
                />
            );
        }

        console.warn('Must provide either renderer or modifier');
        return null;
    }

    renderItems = () => {
        const { data } = this.props;

        const {
            containerHeight,
            offset,
        } = this.state;

        if (!containerHeight) {
            this.calculateContainerHeight();
            return null;
        }

        const bufferSpace = this.itemsPerPage;
        const items = [];

        const startIndex = Math.max(offset - bufferSpace, 0);
        let endIndex = Math.min(offset + this.itemsPerPage + bufferSpace, data.length);

        console.warn(offset, bufferSpace);
        console.warn(startIndex, endIndex, bufferSpace, containerHeight, this.itemHeight);

        items.push(
            <div
                className={styles.virtualDiv}
                key="virtualized-list-item-start-div"
                style={{
                    height: `${this.itemHeight * startIndex}px`,
                    backgroundSize: `100% ${this.itemHeight * 2}px`,
                }}
            />,
        );

        for (let i = startIndex; i < endIndex; i += 1) {
            const item = this.renderItem(data[i], i);

            if (!this.itemHeights[i]) {
                const itemSize = getRenderedSize(item);
                this.itemHeights[i] = itemSize.height;
                this.updateItemHeight();
                endIndex = Math.min(offset + this.itemsPerPage + bufferSpace, data.length);
            }

            items.push(item);
        }

        items.push(
            <div
                className={styles.virtualDiv}
                key="virtualized-list-item-end-div"
                style={{
                    height: `${this.itemHeight * (data.length - endIndex)}px`,
                    backgroundSize: `100% ${this.itemHeight * 2}px`,
                }}
            />,
        );

        return items;
    }

    render() {
        const {
            className: classNameFromProps,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.dynamicallyVirtualizedListView}
            dynaimcally-virtualized-list-view
        `;

        const Items = this.renderItems;

        return (
            <div
                ref={this.container}
                className={className}
            >
                <Items />
            </div>
        );
    }
}
