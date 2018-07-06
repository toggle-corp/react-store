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
    rendererClassName: '',
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
        };

        this.itemHeights = {};
        this.containerRef = React.createRef();
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll, true);
        const { changed, containerHeight } = this.calculateContainerHeight();
        if (changed) {
            // eslint-disable-next-line react/no-did-mount-set-state
            this.setState({ containerHeight });
        }
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll, true);
    }

    /*
    getTotalHeight = (data) => {
        let totalHeight = 0;

        data.forEach((datum, i) => {
            totalHeight += this.itemHeights[i] || DEFAULT_ITEM_HEIGHT;
        });

        return totalHeight;
    }
    */

    getOffset = (dataLength) => {
        let { containerScrollTop } = this.state;

        let offset;
        for (offset = 0; offset < dataLength; offset += 1) {
            if (containerScrollTop > 0) {
                containerScrollTop -= this.itemHeights[offset] || DEFAULT_ITEM_HEIGHT;
            } else {
                break;
            }
        }
        return offset;
    };

    calculateContainerHeight = () => {
        const { current: container } = this.containerRef;

        if (container) {
            const containerBCR = container.getBoundingClientRect();
            const { height: containerHeight } = containerBCR;
            const { containerHeight: containerHeightFromState } = this.state;

            if (containerHeight !== containerHeightFromState) {
                return { changed: true, containerHeight: containerBCR.height };
            }
        }
        return { changed: false };
    }

    handleScroll = (e) => {
        if (!this.state.containerHeight) {
            return;
        }

        if (this.ignoreScrollEvent) {
            this.ignoreScrollEvent = false;
            return;
        }

        const { current: container } = this.containerRef;
        if (e.target !== container) {
            return;
        }

        const { scrollTop: newContainerScrollTop } = container;
        const { containerScrollTop } = this.state;
        if (containerScrollTop === newContainerScrollTop) {
            return;
        }

        clearTimeout(this.timeout);

        this.timeout = setTimeout(
            () => { this.setState({ containerScrollTop: container.scrollTop }); },
            200,
        );
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

        if (!containerHeight || data.length === 0) {
            return null;
        }
        const { current: container } = this.containerRef;
        // console.warn('Pre-render', container.scrollTop);

        this.ignoreScrollEvent = true;

        const offset = this.getOffset(data.length);

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
        for (
            i = renderStartIndex;
            currentRenderHeight < containerHeight && i < data.length;
            i += 1
        ) {
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

        // console.warn('Pre-calculation', container.scrollTop);
        container.scrollTop = topVirtualContainerHeight + renderHeightUptoFirst;
        // console.warn('Post-calculation', container.scrollTop);

        return items;
    }

    render() {
        const {
            className: classNameFromProps,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.dynamicallyVirtualizedListView}
            dynamically-virtualized-list-view
        `;

        const Items = this.renderItems;

        return (
            <div
                ref={this.containerRef}
                className={className}
            >
                <Items />
            </div>
        );
    }
}
