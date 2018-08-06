import PropTypes from 'prop-types';
import React from 'react';

import List from '../List';
import GridItem from './GridItem';
import { getLayoutBounds } from '../../../utils/grid-layout';
import { listToMap } from '../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    itemClassName: PropTypes.string,
    dragItemClassName: PropTypes.string.isRequired,
    className: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.object),
    layoutSelector: PropTypes.func.isRequired,
    itemMinSizeSelector: PropTypes.func.isRequired,
    keySelector: PropTypes.func.isRequired,
    itemHeaderModifier: PropTypes.func.isRequired,
    itemContentModifier: PropTypes.func.isRequired,
    onLayoutChange: PropTypes.func.isRequired,
    gridSize: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
};

const defaultProps = {
    itemClassName: '',
    className: '',
    data: [],
};

const areLayoutsEqual = (l1, l2) => (
    l1.left === l2.left
    && l1.top === l2.top
    && l1.width === l2.width
    && l1.height === l2.height
);

const reduceLayout = (layout, gridSize) => ({
    left: Math.round(layout.left / gridSize.width),
    top: Math.round(layout.top / gridSize.height),
    width: Math.round(layout.width / gridSize.width),
    height: Math.round(layout.height / gridSize.height),
});

const snapLayout = (layout, gridSize) => {
    const reducedLayout = reduceLayout(layout, gridSize);

    return {
        left: reducedLayout.left * gridSize.width,
        top: reducedLayout.top * gridSize.height,
        width: reducedLayout.width * gridSize.width,
        height: reducedLayout.height * gridSize.height,
    };
};

const getLayouts = (data, keySelector, layoutSelector) => {
    const layouts = {};

    data.forEach((datum) => {
        const key = keySelector(datum);
        const layout = layoutSelector(datum);

        layouts[key] = layout;
    });

    return layouts;
};

const doesIntersect = (l1, l2) => (
    l1.left < l2.left + l2.width
    && l1.left + l1.width > l2.left
    && l1.top < l2.top + l2.height
    && l1.height + l1.top > l2.top
);

const SCROLL_THRESHOLD = 20;
const SCROLL_TIMEOUT_DURATION = 200;

export default class GridLayoutEditor extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            data,
            keySelector,
            layoutSelector,
        } = props;

        this.bounds = {};
        this.layouts = getLayouts(data, keySelector, layoutSelector);
        this.containerRef = React.createRef();
    }

    componentWillMount() {
        const {
            data,
            layoutSelector,
        } = this.props;
        this.bounds = getLayoutBounds(data, layoutSelector);
    }

    componentWillReceiveProps(nextProps) {
        const {
            layoutSelector: newLayoutSelector,
            data: newData,
            keySelector: newKeySelector,
        } = nextProps;

        const {
            layoutSelector: oldLayoutSelector,
            data: oldData,
            keySelector: oldKeySelector,
        } = this.props;

        if (
            newKeySelector !== oldKeySelector
            || newLayoutSelector !== oldLayoutSelector
            || newData !== oldData
        ) {
            this.bounds = getLayoutBounds(newData, newLayoutSelector);
            this.layouts = getLayouts(newData, newKeySelector, newLayoutSelector);

            if (newData.length > oldData.length) {
                const oldDataMap = listToMap(oldData, oldKeySelector);
                const newItems = newData.filter(d => oldDataMap[newKeySelector(d)] === undefined);

                if (newItems.length > 0) {
                    const item = newItems[0];
                    const itemKey = newKeySelector(item);
                    const newItemLayout = this.fixItemLayout(itemKey);
                    const layoutChanged = !areLayoutsEqual(newItemLayout, this.layouts[itemKey]);

                    if (layoutChanged) {
                        clearTimeout(this.scrollTimeout);
                        this.scrollTimeout = setTimeout(
                            () => {
                                const { current: container } = this.containerRef;
                                container.scrollTop = (newItemLayout.top + newItemLayout.height);
                                // container.scrollLeft = newItemLayout.left;
                            },
                            SCROLL_TIMEOUT_DURATION,
                        );

                        this.handleLayoutChange(itemKey, newItemLayout);
                    }
                }
            }
        }
    }

    componentWillUnmount() {
        clearTimeout(this.scrollTimeout);
    }

    scrollContainer = (dx, dy) => {
        const { current: container } = this.containerRef;

        const scrollDy = dy < 0 && container.scrollTop + dy < 0 ? container.scrollTop : dy;
        const scrollDx = dx < 0 && container.scrollLeft + dx < 0 ? container.scrollLeft : dx;

        container.scrollTop += scrollDy;
        container.scrollLeft += scrollDx;

        return {
            dx: scrollDx,
            dy: scrollDy,
        };
    }

    fixItemLayout = (key) => {
        const { gridSize } = this.props;
        const compareLayouts = (k1, k2) => {
            const l1 = this.layouts[k1];
            const l2 = this.layouts[k2];

            return ((l1.top + l1.height) - (l2.top + l2.height)
                || (l1.left + l1.width) - (l2.left + l2.width));
        };

        const layoutKeyList = Object.keys(this.layouts)
            .filter(d => d !== key)
            .sort(compareLayouts);

        const newLayout = { ...this.layouts[key] };

        for (let i = 0; i < layoutKeyList.length; i += 1) {
            const currentLayout = this.layouts[layoutKeyList[i]];
            const intersects = doesIntersect(
                reduceLayout(currentLayout, gridSize),
                reduceLayout(newLayout, gridSize),
            );
            if (intersects) {
                newLayout.top = currentLayout.top + currentLayout.height;
            }
        }

        return newLayout;
    }

    itemLayoutValidation = (key, newLayout) => {
        const { gridSize } = this.props;
        const layoutKeyList = Object.keys(this.layouts)
            .filter(d => d !== key);

        if (newLayout.left < 0 || newLayout.top < 0) {
            return false;
        }

        let isLayoutValid = true;
        for (let i = 0; i < layoutKeyList.length; i += 1) {
            const currentLayout = this.layouts[layoutKeyList[i]];
            const intersects = doesIntersect(
                reduceLayout(currentLayout, gridSize),
                reduceLayout(newLayout, gridSize),
            );
            if (intersects) {
                isLayoutValid = false;
                break;
            }
        }

        return isLayoutValid;
    }

    handleLayoutChange = (key, layout) => {
        const {
            onLayoutChange,
            gridSize,
        } = this.props;

        onLayoutChange(key, snapLayout(layout, gridSize));
    }

    containerScrollTester = (e, dx, dy) => {
        const { current: container } = this.containerRef;
        const bcr = container.getBoundingClientRect();

        let horizontal = 0;
        let vertical = 0;

        if (bcr.width + bcr.left < e.screenX + SCROLL_THRESHOLD && dx > 0) {
            horizontal = 1;
        } else if (bcr.left + SCROLL_THRESHOLD > e.clientY && bcr.left < e.clientY && dx < 0) {
            horizontal = -1;
        }

        if (bcr.height + bcr.top < e.screenY + SCROLL_THRESHOLD && dy > 0) {
            vertical = 1;
        } else if (bcr.top + SCROLL_THRESHOLD > e.clientY && bcr.top < e.clientY && dy < 0) {
            vertical = -1;
        }

        return { horizontal, vertical };
    }

    renderParams = (key, datum) => {
        const {
            layoutSelector,
            itemHeaderModifier: headerModifier,
            itemContentModifier: contentModifier,
            itemMinSizeSelector: minSizeSelector,
            dragItemClassName,
        } = this.props;

        return {
            layoutSelector,
            minSizeSelector,
            headerModifier,
            contentModifier,
            datum,
            layoutValidator: this.itemLayoutValidation,
            parentContainerScrollTester: this.containerScrollTester,

            onLayoutChange: this.handleLayoutChange,
            dragItemClassName,
            onMove: this.handleItemMove,
            parentContainerScrollFunction: this.scrollContainer,
            $itemKey: key,
        };
    }

    render() {
        const {
            className: classNameFromProps,
            keySelector,
            itemClassName,
            data,
            gridSize,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.gridLayoutEditor}
            'grid-layout-editor'
        `;

        const superContainerStyle = {
            backgroundSize: `${gridSize.width}px ${gridSize.height}px`,
        };

        const {
            width,
            height,
        } = this.bounds;

        const containerStyle = {
            width: `${width}px`,
            height: `${height}px`,
        };

        return (
            <div
                ref={this.containerRef}
                className={className}
                style={superContainerStyle}
            >
                <div
                    className={styles.container}
                    style={containerStyle}
                >
                    <List
                        data={data}
                        keyExtractor={keySelector}
                        renderer={GridItem}
                        rendererClassName={itemClassName}
                        rendererParams={this.renderParams}
                    />
                </div>
            </div>
        );
    }
}
