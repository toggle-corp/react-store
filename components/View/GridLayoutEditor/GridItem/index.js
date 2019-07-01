import PropTypes from 'prop-types';
import React from 'react';

import {
    addClassName,
    removeClassName,
} from '../../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    dragItemClassName: PropTypes.string.isRequired,

    itemKey: PropTypes.string.isRequired,
    datum: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    layoutSelector: PropTypes.func.isRequired,
    minSizeSelector: PropTypes.func.isRequired,

    layoutValidator: PropTypes.func.isRequired,
    onLayoutChange: PropTypes.func.isRequired,

    headerModifier: PropTypes.func.isRequired,
    contentModifier: PropTypes.func.isRequired,

    getParentScrollInfo: PropTypes.func.isRequired,
    scrollParentContainer: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const areLayoutsEqual = (l1, l2) => (
    l1.left === l2.left
    && l1.top === l2.top
    && l1.width === l2.width
    && l1.height === l2.height
);


const SCROLL_DISTANCE = 16;
const SCROLL_INTERVAL = 30;

export default class GridItem extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            datum,
            layoutSelector,
            minSizeSelector,
        } = props;

        const layout = layoutSelector(datum);
        this.state = {
            layout,
        };

        this.containerRef = React.createRef();
        this.isMouseDown = false;
        this.isResizing = false;
        this.lastValidLayout = layout;
        this.minSize = minSizeSelector(datum);
        this.scrollInterval = undefined;
    }

    componentWillMount() {
        window.addEventListener('mouseup', this.handleMouseUp);
    }

    componentDidMount() {
        const { dragItemClassName } = this.props;
        const { current: container } = this.containerRef;

        const dragItem = container.getElementsByClassName(dragItemClassName)[0];

        if (dragItem) {
            this.dragItem = dragItem;
            dragItem.addEventListener('mousedown', this.handleMouseDown);
            dragItem.addEventListener('mouseup', this.handleMouseUp);
            dragItem.style.cursor = 'move';
        }
    }

    componentWillReceiveProps(nextProps) {
        const {
            layoutSelector: oldLayoutSelector,
            datum: oldDatum,
        } = this.props;

        const {
            layoutSelector: newLayoutSelector,
            datum: newDatum,
            minSizeSelector,
        } = nextProps;

        if (oldLayoutSelector !== newLayoutSelector || oldDatum !== newDatum) {
            const newLayout = newLayoutSelector(newDatum);
            this.setState({ layout: newLayout });
            this.lastValidLayout = newLayout;
            this.minSize = minSizeSelector(newDatum);
        }
    }

    componentWillUnmount() {
        clearInterval(this.scrollInterval);
        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('mousemove', this.handleMouseMove);

        if (this.dragItem) {
            this.dragItem.removeEventListener('mousedown', this.handleMouseDown);
            this.dragItem.removeEventListener('mouseup', this.handleMouseUp);
        }
    }

    testLayoutValidity = (newLayout) => {
        const {
            itemKey,
            layoutValidator,
        } = this.props;

        const { current: container } = this.containerRef;

        const {
            isLayoutValid,
            newPossibleLayout,
        } = layoutValidator(itemKey, newLayout, this.isResizing);

        if (isLayoutValid) {
            this.isLayoutValid = true;
            this.lastValidLayout = newLayout;
            removeClassName(container, styles.invalid);
            return;
        }

        if (newPossibleLayout) {
            const {
                isLayoutValid: isNewLayoutValid,
            } = layoutValidator(itemKey, newPossibleLayout, this.isResizing);

            if (isNewLayoutValid) {
                this.lastValidLayout = newPossibleLayout;
            }
        }

        this.isLayoutValid = false;
        addClassName(container, styles.invalid);
    }

    handleMouseDown = (e) => {
        this.lastScreenX = e.clientX;
        this.lastScreenY = e.clientY;

        const scroll = this.props.getParentScrollInfo();
        const { layout } = this.state;
        this.initialDx = (scroll.left + e.clientX) - layout.left;
        this.initialDy = (scroll.top + e.clientY) - layout.top;

        const { current: container } = this.containerRef;
        addClassName(container, styles.moving);

        window.addEventListener('mousemove', this.handleMouseMove);
        this.isMouseDown = true;
        this.isMoving = true;
    }

    handleMouseUp = (e) => {
        this.lastScreenX = e.clientX;
        this.lastScreenY = e.clientY;
        clearInterval(this.scrollInterval);

        if (!this.isMouseDown) {
            return;
        }

        this.isMouseDown = false;

        const { current: container } = this.containerRef;
        removeClassName(container, styles.moving);
        removeClassName(container, styles.resizing);

        window.removeEventListener('mousemove', this.handleMouseMove);

        const {
            onLayoutChange,
            itemKey,
        } = this.props;

        if (this.isLayoutValid) {
            const { layout } = this.state;
            onLayoutChange(itemKey, layout);
        } else {
            onLayoutChange(itemKey, this.lastValidLayout);
            this.isLayoutValid = true;
            removeClassName(container, styles.invalid);
        }

        this.isResizing = false;
        this.isMoving = false;
    }

    handleMouseMove = (e) => {
        const dx = e.clientX - this.lastScreenX;
        const dy = e.clientY - this.lastScreenY;
        this.lastScreenX = e.clientX;
        this.lastScreenY = e.clientY;

        // sx and sy represents by how much
        // the layout exceeds the current scroll area.
        const { sx, sy, scroll } = this.calcBoundsExcess();

        // We need to update position/size
        // either if sx/sy is zero or if mouse movement
        // is in opposite direction of sx/sy.

        // If it's in the same direction (sx * dx > 0), we let
        // the scrollLayout function to handle the layout update.
        const updateX = (sx * dx <= 0 && dx);
        const updateY = (sy * dy <= 0 && dy);

        // New width/height or left/top.
        // We take the initial distance of mouse from the layout
        // and maintain that relative distance.
        const newX = (scroll.left + e.clientX) - this.initialDx;
        const newY = (scroll.top + e.clientY) - this.initialDy;

        const { layout } = this.state;
        const newLayout = { ...layout };

        // Resize or move as required
        if (this.isResizing) {
            if (updateX && newX >= this.minSize.width) {
                newLayout.width = newX;
            }
            if (updateY && newY >= this.minSize.height) {
                newLayout.height = newY;
            }
        } else {
            if (updateX) {
                newLayout.left = newX;
            }
            if (updateY) {
                newLayout.top = newY;
            }
        }

        // If a new layout was calculated, update it.
        if (!areLayoutsEqual(layout, newLayout)) {
            this.setState({ layout: newLayout });
            this.testLayoutValidity(newLayout);
        }

        // Finally, we start the scrollLayout logic to happen at certain
        // intervals. This is becasue: if the mouseMove and mouseUp events
        // both are not called after this point,
        // then the mouse has probably moved outside the container and is stationary
        // which means we need to continuously scroll the container, updating the layout's
        // position/size at the same time.
        clearInterval(this.scrollInterval);
        this.scrollInterval = setInterval(this.scrollLayout, SCROLL_INTERVAL);
    }

    handleResizeHandleMouseDown = (e) => {
        e.stopPropagation();

        this.lastScreenX = e.clientX;
        this.lastScreenY = e.clientY;

        const scroll = this.props.getParentScrollInfo();
        const { layout } = this.state;
        this.initialDx = (scroll.left + e.clientX) - layout.width;
        this.initialDy = (scroll.top + e.clientY) - layout.height;

        const { current: container } = this.containerRef;
        addClassName(container, styles.resizing);

        window.addEventListener('mousemove', this.handleMouseMove);

        this.isResizing = true;
        this.isMouseDown = true;
    }

    calcBoundsExcess = () => {
        // Calculate if current layout exceeds the bounds
        // of current scroll area of parent container.
        // If so, return the scroll distance in that direction.
        // We use fake and static SCROLL_DISTANCE instead of actual
        // bounds to keep constant velocity while scrolling.

        const scroll = this.props.getParentScrollInfo();
        const { layout } = this.state;

        const {
            left,
            top,
            width,
            height,
        } = layout;

        const {
            left: scrollLeft,
            top: scrollTop,
            width: scrollWidth,
            height: scrollHeight,
        } = scroll;

        const right = left + width;
        const bottom = top + height;
        const scrollRight = scrollLeft + scrollWidth;
        const scrollBottom = scrollTop + scrollHeight;

        let sx = 0;
        if (right > scrollRight) {
            sx = SCROLL_DISTANCE;
        } else if (this.isResizing && right < scrollLeft) {
            sx = -SCROLL_DISTANCE;
        } else if (!this.isResizing && left < scrollLeft && scrollLeft > 0) {
            sx = -SCROLL_DISTANCE;
        }

        let sy = 0;
        if (bottom > scrollBottom) {
            sy = SCROLL_DISTANCE;
        } else if (this.isResizing && bottom < scrollTop) {
            sy = -SCROLL_DISTANCE;
        } else if (!this.isResizing && top < scrollTop && scrollTop > 0) {
            sy = -SCROLL_DISTANCE;
        }

        return { sx, sy, scroll };
    }

    scrollLayout = () => {
        // Update layout position/size and scroll the parent
        // container based on how much the layout has exceeded
        // the bounds of container.

        const { sx, sy } = this.calcBoundsExcess();
        if (!sx && !sy) {
            return;
        }

        const layout = { ...this.state.layout };
        if (this.isResizing) {
            if (layout.width + sx >= this.minSize.width) {
                layout.width += sx;
            }
            if (layout.height + sy >= this.minSize.height) {
                layout.height += sy;
            }
        } else {
            layout.left += sx;
            layout.top += sy;
        }
        this.setState({ layout });
        this.testLayoutValidity(layout);
        this.props.scrollParentContainer(sx, sy);
    }

    renderHeader = () => {
        const {
            datum,
            headerModifier,
        } = this.props;

        return headerModifier(datum);
    }

    renderContent = () => {
        const {
            datum,
            contentModifier,
        } = this.props;

        return contentModifier(datum);
    }

    renderResizeHandle = () => {
        const className = [
            styles.resizeHandle,
            'resize-handle',
        ].join(' ');

        return (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <span
                className={className}
                onMouseDown={this.handleResizeHandleMouseDown}
                onMouseUp={this.handleMouseUp}
            />
        );
    }

    renderGhostItem = () => {
        const {
            width,
            height,
            left,
            top,
        } = this.lastValidLayout;

        const style = {
            width,
            height,
            minWidth: this.minSize.width,
            minHeight: this.minSize.height,
            transform: `translate(${left}px, ${top}px)`,
        };

        return (
            <div
                style={style}
                className={styles.ghostItem}
            >
                <div className={styles.inner} />
            </div>
        );
    }

    render() {
        const { className: classNameFromProps } = this.props;
        const { layout } = this.state;

        const className = `
            ${classNameFromProps}
            grid-item
            ${styles.gridItem}
        `;

        const Header = this.renderHeader;
        const Content = this.renderContent;
        const ResizeHandle = this.renderResizeHandle;
        const GhostItem = this.renderGhostItem;

        const style = {
            width: layout.width,
            height: layout.height,
            minWidth: this.minSize.width,
            minHeight: this.minSize.height,
            transform: `translate(${layout.left}px, ${layout.top}px)`,
        };

        return (
            <React.Fragment>
                {
                    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                    <div
                        className={className}
                        ref={this.containerRef}
                        style={style}
                        // onMouseDown={this.handleMouseDown}
                        // onMouseUp={this.handleMouseUp}
                    >
                        <Header />
                        <Content />
                        <ResizeHandle />
                    </div>
                }
                <GhostItem />
            </React.Fragment>
        );
    }
}
