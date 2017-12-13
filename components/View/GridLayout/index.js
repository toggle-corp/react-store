import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import GridItem from './GridItem';
import {
    checkCollision,
} from './utils';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    modifier: PropTypes.func.isRequired,
    items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    onLayoutChange: PropTypes.func,
    viewOnly: PropTypes.bool,
    snapX: PropTypes.number,
    snapY: PropTypes.number,
};

const defaultProps = {
    className: '',
    onLayoutChange: undefined,
    viewOnly: false,
    snapX: 24,
    snapY: 24,
};

@CSSModules(styles, { allowMultiple: true })
export default class GridLayout extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            items: this.validateItems(props.items),
            validLayout: undefined,
        };

        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.items.length !== this.state.items.length) {
            this.setState({
                items: this.validateItems(nextProps.items),
            });
        }
    }

    getStyleName = () => {
        const styleNames = [];
        styleNames.push('grid-layout');

        if (this.props.viewOnly) {
            styleNames.push('view-only');
        }

        return styleNames.join(' ');
    }

    getGridItem = (item) => {
        const {
            modifier,
            viewOnly,
        } = this.props;

        const key = item.key;
        const gridData = {
            key,
            layout: item.layout,
        };

        return (
            <GridItem
                key={key}
                title={item.title}
                data={gridData}
                onDragStart={this.handleItemDragStart}
                onResizeStart={this.handleItemResizeStart}
                onMouseDown={this.handleItemMouseDown}
                viewOnly={viewOnly}
            >
                { modifier(item) }
            </GridItem>
        );
    }

    snapX = val => (
        Math.round(val / this.props.snapX) * this.props.snapX
    )

    snapY = val => (
        Math.round(val / this.props.snapY) * this.props.snapY
    )

    snap = layout => ({
        left: this.snapX(layout.left),
        top: this.snapY(layout.top),
        width: this.snapX(layout.width),
        height: this.snapY(layout.height),
    })

    handleItemDragStart = (key, e) => {
        if (this.props.viewOnly) {
            return;
        }

        this.dragTargetKey = key;
        this.lastScreenX = e.screenX;
        this.lastScreenY = e.screenY;

        const newItems = [...this.state.items];
        const itemIndex = newItems.findIndex(
            d => d.key === key,
        );
        this.setState({
            validLayout: {
                ...newItems[itemIndex].layout,
            },
        });
    }

    handleItemResizeStart = (key, e) => {
        if (this.props.viewOnly) {
            return;
        }

        this.resizeTargetKey = key;
        this.lastScreenX = e.screenX;
        this.lastScreenY = e.screenY;

        const newItems = [...this.state.items];
        const itemIndex = newItems.findIndex(
            d => d.key === key,
        );
        this.setState({
            validLayout: {
                ...newItems[itemIndex].layout,
            },
        });
    }

    handleMouseMove = (e) => {
        if (this.props.viewOnly) {
            return;
        }

        if (this.dragTargetKey || this.resizeTargetKey) {
            const newItems = [...this.state.items];
            let validLayout = this.state.validLayout;

            const dx = e.screenX - this.lastScreenX;
            const dy = e.screenY - this.lastScreenY;

            if (this.dragTargetKey) {
                const itemIndex = newItems.findIndex(
                    d => d.key === this.dragTargetKey,
                );
                newItems[itemIndex].layout.left = Math.max(
                    0,
                    newItems[itemIndex].layout.left + dx,
                );
                newItems[itemIndex].layout.top = Math.max(
                    0,
                    newItems[itemIndex].layout.top + dy,
                );

                if (!checkCollision(newItems, itemIndex)) {
                    validLayout = this.snap({
                        ...newItems[itemIndex].layout,
                    });
                }
            }

            if (this.resizeTargetKey) {
                const itemIndex = newItems.findIndex(
                    d => d.key === this.resizeTargetKey,
                );
                newItems[itemIndex].layout.width += dx;
                newItems[itemIndex].layout.height += dy;

                if (!checkCollision(newItems, itemIndex)) {
                    validLayout = this.snap({
                        ...newItems[itemIndex].layout,
                    });
                }
            }

            this.setState({
                items: newItems,
                validLayout,
            });

            this.lastScreenX = e.screenX;
            this.lastScreenY = e.screenY;
        }
    }

    handleMouseUp = () => {
        if (this.props.viewOnly) {
            return;
        }

        if (this.dragTargetKey || this.resizeTargetKey) {
            const newItems = [...this.state.items];

            if (this.dragTargetKey) {
                const index = newItems.findIndex(
                    d => d.key === this.dragTargetKey,
                );
                newItems[index].layout = {
                    ...this.state.validLayout,
                };
            } else if (this.resizeTargetKey) {
                const index = newItems.findIndex(
                    d => d.key === this.resizeTargetKey,
                );
                newItems[index].layout = {
                    ...this.state.validLayout,
                };
            }

            if (this.props.onLayoutChange) {
                this.props.onLayoutChange(newItems);
            }

            this.setState({
                items: newItems,
                validLayout: undefined,
            });
        }

        this.dragTargetKey = undefined;
        this.resizeTargetKey = undefined;
    }

    validateItems = (items) => {
        const newItems = [...items];
        if (items.length > 1) {
            let maxHeight = Math.max(...newItems.map(
                item => item.layout.height + item.layout.top,
            ));

            for (let i = 0; i < newItems.length; i += 1) {
                newItems[i].layout = this.snap(newItems[i].layout);
            }

            for (let i = newItems.length - 1; i >= 1; i -= 1) {
                if (checkCollision(newItems, i)) {
                    newItems[i].layout.top = maxHeight;
                    maxHeight += newItems[i].layout.height;
                }
            }
        }

        if (this.props.onLayoutChange) {
            this.props.onLayoutChange(newItems);
        }
        return newItems;
    }

    render() {
        const {
            className,
            snapX,
            snapY,
        } = this.props;

        const {
            items,
            validLayout,
        } = this.state;

        const ghostLayout = validLayout && { ...validLayout };

        return (
            <div
                styleName={this.getStyleName()}
                className={className}
                style={{ backgroundSize: `${snapX}px ${snapY}px` }}
            >
                {
                    items.map(item => (
                        this.getGridItem(item)
                    ))
                }
                { validLayout && (
                    <div
                        styleName="ghost-item"
                        style={ghostLayout}
                    />
                )}
            </div>
        );
    }
}
