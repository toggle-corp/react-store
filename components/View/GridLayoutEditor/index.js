import PropTypes from 'prop-types';
import React from 'react';
import { listToMap } from '@togglecorp/fujs';

import List from '../List';
import GridItem from './GridItem';
import { getLayoutBounds } from '../../../utils/grid-layout';

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

const resolveIntersect = (l1, l2, forResize) => {
    const dx1 = (l1.left + l1.width) - l2.left;
    const dx2 = (l2.left + l2.width) - l1.left;
    const dx = (dx1 < dx2) ? -dx1 : dx2;

    const dy1 = (l1.top + l1.height) - l2.top;
    const dy2 = (l2.top + l2.height) - l1.top;
    const dy = (dy1 < dy2) ? -dy1 : dy2;

    if (Math.abs(dx) < Math.abs(dy)) {
        return {
            width: forResize ? l1.width + dx : l1.width,
            height: l1.height,
            left: forResize ? l1.left : l1.left + dx,
            top: l1.top,
        };
    }

    return {
        width: l1.width,
        height: forResize ? l1.height + dy : l1.height,
        left: l1.left,
        top: forResize ? l1.top : l1.top + dy,
    };
};

export default class GridLayoutEditor extends React.Component {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            data,
            keySelector,
            layoutSelector,
        } = props;

        this.containerRef = React.createRef();

        this.bounds = getLayoutBounds(data, layoutSelector);
        this.layouts = getLayouts(data, keySelector, layoutSelector);
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
                        this.handleLayoutChange(itemKey, newItemLayout);
                    }
                }
            }
        }
    }

    componentWillUnmount() {
        clearTimeout(this.scrollTimeout);
    }

    fixItemLayout = (key) => {
        const { gridSize } = this.props;
        const compareLayouts = (k1, k2) => {
            const l1 = this.layouts[k1];
            const l2 = this.layouts[k2];

            return (
                (l1.top + l1.height) - (l2.top + l2.height)
                || (l1.left + l1.width) - (l2.left + l2.width)
            );
        };

        const layoutKeyList = Object.keys(this.layouts)
            .filter(d => d !== key)
            .sort(compareLayouts);

        const newLayout = { ...this.layouts[key] };

        for (let i = 0; i < layoutKeyList.length; i += 1) {
            const currentLayout = this.layouts[layoutKeyList[i]];
            if (doesIntersect(
                reduceLayout(currentLayout, gridSize),
                reduceLayout(newLayout, gridSize),
            )) {
                newLayout.top = currentLayout.top + currentLayout.height;
            }
        }

        return newLayout;
    }

    handleItemLayoutValidation = (key, newLayout, forResize) => {
        const { gridSize } = this.props;
        const layoutKeyList = Object.keys(this.layouts).filter(d => d !== key);

        if (newLayout.left < 0 || newLayout.top < 0) {
            return false;
        }

        let isLayoutValid = true;
        let newPossibleLayout;
        for (let i = 0; i < layoutKeyList.length; i += 1) {
            const otherLayout = this.layouts[layoutKeyList[i]];
            if (doesIntersect(
                reduceLayout(newLayout, gridSize),
                reduceLayout(otherLayout, gridSize),
            )) {
                isLayoutValid = false;
                newPossibleLayout = resolveIntersect(
                    snapLayout(newLayout, gridSize),
                    snapLayout(otherLayout, gridSize),
                    forResize,
                );
                break;
            }
        }

        return { isLayoutValid, newPossibleLayout };
    }

    handleLayoutChange = (key, layout) => {
        const {
            onLayoutChange,
            gridSize,
        } = this.props;

        onLayoutChange(key, snapLayout(layout, gridSize));
    }

    calcScrollInfo = () => ({
        left: this.containerRef.current.scrollLeft,
        top: this.containerRef.current.scrollTop,
        width: this.containerRef.current.offsetWidth,
        height: this.containerRef.current.offsetHeight,
    })

    scrollContainer = (dx, dy) => {
        const container = this.containerRef.current;
        container.scrollLeft += dx;
        container.scrollTop += dy;

        // In case we have scrolled beyond the size of the container,
        // update the size of the container.
        const child = container.firstChild;
        const width = Math.max(
            parseInt(child.style.width, 10),
            container.scrollLeft + container.offsetWidth,
        );
        const height = Math.max(
            parseInt(child.style.height, 10),
            container.scrollTop + container.offsetHeight,
        );

        child.style.width = `${width}px`;
        child.style.height = `${height}px`;
        this.bounds.width = width;
        this.bounds.height = height;
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
            datum,
            itemKey: key,
            dragItemClassName,

            // Selectors
            layoutSelector,
            minSizeSelector,

            // Modifiers
            headerModifier,
            contentModifier,

            // Layout handling methods
            layoutValidator: this.handleItemLayoutValidation,
            onLayoutChange: this.handleLayoutChange,
            onMove: this.handleItemMove,

            // Scroll related methods
            getParentScrollInfo: this.calcScrollInfo,
            scrollParentContainer: this.scrollContainer,
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
                        keySelector={keySelector}
                        renderer={GridItem}
                        rendererClassName={itemClassName}
                        rendererParams={this.renderParams}
                    />
                </div>
            </div>
        );
    }
}
