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

// Inital assumption for the height of each item
const DEFAULT_ITEM_HEIGHT = 18;

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
        this.container = React.createRef();
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll, true);
        this.calculateContainerHeight();
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll, true);
    }

    getTotalHeight = (data) => {
        let totalHeight = 0;

        data.forEach((datum, i) => {
            totalHeight += this.itemHeights[i] || DEFAULT_ITEM_HEIGHT;
        });

        return totalHeight;
    }

    getOffset = (data) => {
        let { containerScrollTop } = this.state;
        let offset = 0;

        for (offset = 0; offset < data.length; offset += 1) {
            if (containerScrollTop > 0) {
                containerScrollTop -= this.itemHeights[offset] || DEFAULT_ITEM_HEIGHT;
            } else {
                break;
            }
        }

        return offset;
    };

    calculateContainerHeight = () => {
        const { current: container } = this.container;

        if (container) {
            const containerBCR = container.getBoundingClientRect();
            const { height: containerHeight } = containerBCR;
            const { containerHeight: containerHeightFromState } = this.state;

            if (containerHeight !== containerHeightFromState) {
                this.setState({ containerHeight: containerBCR.height });
            }

            this.itemsPerPage = Math.ceil(containerHeight / DEFAULT_ITEM_HEIGHT);
        }
    }

    handleScroll = (e) => {
        if (!this.state.containerHeight) {
            return;
        }

        if (this.ignoreScrollEvent) {
            this.ignoreScrollEvent = false;
            return;
        }

        const { current: container } = this.container;
        const { containerScrollTop } = this.state;

        if (e.target === container) {
            const { scrollTop: newContainerScrollTop } = container;
            if (containerScrollTop !== newContainerScrollTop) {
                clearTimeout(this.timeout);

                this.timeout = setTimeout(() => {
                    this.setState({ containerScrollTop: container.scrollTop });
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
        const { containerHeight } = this.state;

        if (!containerHeight) {
            this.calculateContainerHeight();
            return null;
        }

        if (data.length === 0) {
            return null;
        }

        this.ignoreScrollEvent = true;
        const offset = this.getOffset(data);

        const items = [];
        const numberOfBufferedItems = 10;
        const renderStartIndex = Math.max(offset - numberOfBufferedItems, 0);

        let topVirtualContainerHeight = 0;
        for (let i = 0; i < renderStartIndex; i += 1) {
            topVirtualContainerHeight += this.itemHeights[i] || DEFAULT_ITEM_HEIGHT;
        }

        items.push(
            <div
                className={styles.virtualDiv}
                key="virtualized-list-item-start-div"
                style={{ height: `${topVirtualContainerHeight}px` }}
            />,
        );

        let currentRenderHeight = 0;
        let renderHeightUptoFirst = 0;

        let i;
        // keep rendering untill the container is filled up to end
        for (i = renderStartIndex; currentRenderHeight < containerHeight; i += 1) {
            if (i >= data.length) {
                break;
            }

            if (i === offset) {
                renderHeightUptoFirst = currentRenderHeight;
            }

            const item = this.renderItem(data[i], i);

            const itemSize = getRenderedSize(item);
            this.itemHeights[i] = itemSize.height;

            currentRenderHeight += this.itemHeights[i];
            items.push(item);
        }

        const renderEndIndex = Math.min(i + numberOfBufferedItems, data.length);

        // render buffer space
        for (; i < renderEndIndex; i += 1) {
            const item = this.renderItem(data[i], i);

            const itemSize = getRenderedSize(item);
            this.itemHeights[i] = itemSize.height;

            items.push(item);
        }

        let bottomVirtualContainerHeight = 0;
        for (let j = i; j < data.length; j += 1) {
            bottomVirtualContainerHeight += this.itemHeights[i] || DEFAULT_ITEM_HEIGHT;
        }

        items.push(
            <div
                className={styles.virtualDiv}
                key="virtualized-list-item-end-div"
                style={{ height: `${bottomVirtualContainerHeight}px` }}
            />,
        );

        const { current: container } = this.container;
        container.scrollTop += renderHeightUptoFirst;

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
