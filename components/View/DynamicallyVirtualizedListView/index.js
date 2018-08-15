import ReactDOMServer from 'react-dom/server';
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

// el = React element
// container = DOM element
const getRenderedBoundingClientRect = (el, container) => {
    const template = document.createElement('template');
    template.innerHTML = ReactDOMServer.renderToStaticMarkup(el);
    const domEl = template.content.firstChild;
    container.appendChild(domEl);
    const bcr = domEl.getBoundingClientRect();
    container.removeChild(domEl);
    return bcr;
};

// eslint-disable-next-line
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

        this.ignoreScrollEvent = true;

        const items = [];

        let topVirtualContainerHeight = 0;
        let renderStartIndex = 0;

        for (let i = 0; i < data.length; i += 1) {
            topVirtualContainerHeight += this.itemHeights[i] || DEFAULT_ITEM_HEIGHT;
            if (topVirtualContainerHeight > container.scrollTop) {
                topVirtualContainerHeight -= this.itemHeights[i] || DEFAULT_ITEM_HEIGHT;
                renderStartIndex = i;
                break;
            }
        }

        items.push(
            <div
                className={styles.virtualDiv}
                key="virtualized-list-item-start-div"
                style={{ height: `${topVirtualContainerHeight}px` }}
            />,
        );


        let currentRenderHeight = topVirtualContainerHeight - container.scrollTop;
        let lastRenderIndex;

        // keep rendering untill the container is filled up to end
        for (
            let i = renderStartIndex;
            currentRenderHeight < containerHeight && i < data.length;
            i += 1
        ) {
            const item = this.renderItem(data[i], i);
            const itemBCR = getRenderedBoundingClientRect(item, container);
            this.itemHeights[i] = itemBCR.height;

            currentRenderHeight += this.itemHeights[i] || DEFAULT_ITEM_HEIGHT;
            items.push(item);
            lastRenderIndex = i;
        }

        let bottomVirtualContainerHeight = 0;
        for (let j = lastRenderIndex + 1; j < data.length; j += 1) {
            bottomVirtualContainerHeight += this.itemHeights[j] || DEFAULT_ITEM_HEIGHT;
        }

        items.push(
            <div
                className={styles.virtualDiv}
                key="virtualized-list-item-end-div"
                style={{ height: `${bottomVirtualContainerHeight}px` }}
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
