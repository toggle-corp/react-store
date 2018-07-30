import PropTypes from 'prop-types';
import React from 'react';

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
            keySelector,
        } = nextProps;

        const {
            layoutSelector: oldLayoutSelector,
            data: oldData,
        } = this.props;

        if (
            newLayoutSelector !== oldLayoutSelector
            || newData !== oldData
        ) {
            this.bounds = getLayoutBounds(newData, newLayoutSelector);
            this.layouts = getLayouts(newData, keySelector, newLayoutSelector);
        }
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

    handleItemLayoutValidation = (key, newLayout) => {
        const { gridSize } = this.props;
        const layoutKeyList = Object.keys(this.layouts).filter(d => d !== key);

        if (newLayout.left < 0 || newLayout.top < 0) {
            return false;
        }

        let isLayoutValid = true;
        for (let i = 0; i < layoutKeyList.length; i += 1) {
            if (doesIntersect(
                reduceLayout(this.layouts[layoutKeyList[i]], gridSize),
                reduceLayout(newLayout, gridSize),
            )) {
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

    handleContainerScrollTest = (e, dx, dy) => {
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
            layoutValidator: this.handleItemLayoutValidation,
            parentContainerScrollTester: this.handleContainerScrollTest,
            onLayoutChange: this.handleLayoutChange,
            dragItemClassName,
            onMove: this.handleItemMove,
            parentContainerScrollFunction: this.scrollContainer,
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
