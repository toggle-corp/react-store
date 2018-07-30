import PropTypes from 'prop-types';
import React from 'react';

import {
    addClassName,
    removeClassName,
} from '../../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    datum: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    layoutSelector: PropTypes.func.isRequired,
    minSizeSelector: PropTypes.func.isRequired,
    layoutValidator: PropTypes.func.isRequired,
    headerModifier: PropTypes.func.isRequired,
    contentModifier: PropTypes.func.isRequired,
    $itemKey: PropTypes.string.isRequired,
    onLayoutChange: PropTypes.func.isRequired,
    dragItemClassName: PropTypes.string.isRequired,
    parentContainerScrollTester: PropTypes.func.isRequired,
    parentContainerScrollFunction: PropTypes.func.isRequired,
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
        clearTimeout(this.scrollTimeout);

        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('mousemove', this.handleMouseMove);

        if (this.dragItem) {
            this.dragItem.removeEventListener('mousedown', this.handleMouseDown);
            this.dragItem.removeEventListener('mouseup', this.handleMouseUp);
        }
    }

    testLayoutValidity = (newLayout) => {
        const {
            $itemKey,
            layoutValidator: isLayoutValid,
        } = this.props;

        const { current: container } = this.containerRef;
        if (isLayoutValid($itemKey, newLayout)) {
            this.isLayoutValid = true;
            this.lastValidLayout = newLayout;
            removeClassName(container, styles.invalid);
        } else {
            this.isLayoutValid = false;
            addClassName(container, styles.invalid);
        }
    }

    scrollParentContainer = (dx, dy) => {
        const { parentContainerScrollFunction: scrollParentContainer } = this.props;
        const { layout } = this.state;

        const scroll = scrollParentContainer(dx, dy);
        const newLayout = { ...layout };

        if (this.isResizing) {
            newLayout.width += scroll.dx;
            newLayout.height += scroll.dy;
        } else {
            newLayout.left += scroll.dx;
            newLayout.top += scroll.dy;
        }


        this.setState({ layout: newLayout });
        this.testLayoutValidity(newLayout);

        if (this.keepScrollingParentContainer) {
            this.scrollTimeout = setTimeout(() => this.scrollParentContainer(dx, dy), 100);
        }
    }

    handleMouseDown = (e) => {
        this.lastScreenX = e.clientX;
        this.lastScreenY = e.clientY;

        const { current: container } = this.containerRef;
        addClassName(container, styles.moving);

        window.addEventListener('mousemove', this.handleMouseMove);
        this.isMouseDown = true;
        this.isMoving = true;
    }

    handleMouseUp = (e) => {
        this.lastScreenX = e.clientX;
        this.lastScreenY = e.clientY;
        this.keepScrollingParentContainer = false;

        if (!this.isMouseDown) {
            return;
        }

        this.isMouseDown = false;

        const { current: container } = this.containerRef;
        removeClassName(container, styles.moving);
        removeClassName(container, styles.resizing);

        window.removeEventListener('mousemove', this.handleMouseMove);

        if (this.isLayoutValid) {
            const {
                onLayoutChange,
                $itemKey,
            } = this.props;

            const { layout } = this.state;

            onLayoutChange($itemKey, layout);
        } else {
            this.setState({ layout: this.lastValidLayout });

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

        const { layout } = this.state;

        const newLayout = { ...layout };

        if (this.isResizing) {
            if (newLayout.width + dx >= this.minSize.width) {
                newLayout.width += dx;
            }
            if (newLayout.height + dy >= this.minSize.height) {
                newLayout.height += dy;
            }
        } else {
            newLayout.left += dx;
            newLayout.top += dy;
        }

        if (!areLayoutsEqual(layout, newLayout)) {
            this.setState({ layout: newLayout });
            this.testLayoutValidity(newLayout);

            const {
                parentContainerScrollTester: testParentContainerScroll,
            } = this.props;

            const scroll = testParentContainerScroll(e, dx, dy);

            const scrollDx = scroll.horizontal ? dx : 0;
            const scrollDy = scroll.vertical ? dy : 0;

            if (scroll.horizontal || scroll.vertical) {
                this.keepScrollingParentContainer = true;
                this.scrollParentContainer(scrollDx, scrollDy);
            } else {
                this.keepScrollingParentContainer = false;
            }
        }
    }

    handleResizeHandleMouseDown = (e) => {
        e.stopPropagation();

        this.lastScreenX = e.clientX;
        this.lastScreenY = e.clientY;

        const { current: container } = this.containerRef;
        addClassName(container, styles.resizing);

        window.addEventListener('mousemove', this.handleMouseMove);

        this.isResizing = true;
        this.isMouseDown = true;
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
