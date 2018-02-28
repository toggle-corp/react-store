import PropTypes from 'prop-types';
import React from 'react';

import update from '../../../utils/immutable-update';

import List from '../List';

import GridItem from './GridItem';
import { checkCollision } from './utils';
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
    snapX: 16,
    snapY: 16,
};

export default class GridLayout extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static itemKeyExtractor = item => item.key;

    constructor(props) {
        super(props);

        this.state = {
            items: props.items,
            validLayout: undefined,
        };
    }

    componentWillMount() {
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
    }

    componentWillReceiveProps(nextProps) {
        // XXX; check if changed
        this.setState({ items: nextProps.items });
    }

    componentWillUnmount() {
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
    }

    getClassName = () => {
        const {
            className,
            viewOnly,
        } = this.props;

        const classNames = [
            className,
            styles['grid-layout'],
        ];

        if (viewOnly) {
            classNames.push(styles['view-only']);
        }

        return classNames.join(' ');
    }

    getBounds = () => {
        const { items } = this.state;
        let maxW = 0;
        let maxH = 0;

        items.forEach((i) => {
            const l = i.layout;
            const w = l.left + l.width;
            const h = l.top + l.height;
            if (w > maxW) {
                maxW = w;
            }

            if (h > maxH) {
                maxH = h;
            }
        });

        return {
            width: maxW,
            height: maxH,
        };
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
    constrainSize = (layout, minSize) => (
        minSize ? ({
            ...layout,
            width: this.snapX(Math.max(minSize.width, layout.width)),
            height: this.snapY(Math.max(minSize.height, layout.height)),
        }) : layout
    )

    handleItemDragStart = (key, e) => {
        if (this.props.viewOnly) {
            return;
        }

        this.dragTargetKey = key;
        this.lastScreenX = e.screenX;
        this.lastScreenY = e.screenY;

        const item = this.state.items.find(d => d.key === key);
        const { layout } = item;
        this.setState({ validLayout: layout });
    }

    handleItemResizeStart = (key, e) => {
        if (this.props.viewOnly) {
            return;
        }

        this.resizeTargetKey = key;
        this.lastScreenX = e.screenX;
        this.lastScreenY = e.screenY;

        const item = this.state.items.find(d => d.key === key);
        const { layout } = item;
        this.setState({ validLayout: layout });
    }

    handleMouseMove = (e) => {
        if (this.props.viewOnly) {
            return;
        }
        if (!this.dragTargetKey && !this.resizeTargetKey) {
            return;
        }

        const dx = e.screenX - this.lastScreenX;
        const dy = e.screenY - this.lastScreenY;

        let newItems = this.state.items;
        let { validLayout } = this.state;

        if (this.dragTargetKey) {
            const itemIndex = newItems.findIndex(
                d => d.key === this.dragTargetKey,
            );
            const settings = {
                [itemIndex]: {
                    layout: {
                        left: { $apply: v => Math.max(0, v + dx) },
                        top: { $apply: v => Math.max(0, v + dy) },
                    },
                },
            };
            newItems = update(newItems, settings);


            if (!checkCollision(newItems, itemIndex)) {
                validLayout = this.snap({
                    ...newItems[itemIndex].layout,
                });
            }
        } else if (this.resizeTargetKey) {
            const itemIndex = newItems.findIndex(
                d => d.key === this.resizeTargetKey,
            );
            const settings = {
                [itemIndex]: {
                    layout: {
                        width: { $apply: v => v + dx },
                        height: { $apply: v => v + dy },
                    },
                },
            };
            newItems = update(newItems, settings);

            if (!checkCollision(newItems, itemIndex)) {
                validLayout = this.constrainSize(
                    this.snap({
                        ...newItems[itemIndex].layout,
                    }),
                    newItems[itemIndex].minSize,
                );
            }
        }

        this.setState({ validLayout, items: newItems });

        this.lastScreenX = e.screenX;
        this.lastScreenY = e.screenY;
    }

    handleMouseUp = () => {
        if (this.props.viewOnly) {
            return;
        }
        if (!this.dragTargetKey && !this.resizeTargetKey) {
            return;
        }

        let newItems = this.state.items;

        if (this.dragTargetKey) {
            const index = newItems.findIndex(
                d => d.key === this.dragTargetKey,
            );
            const settings = {
                [index]: {
                    layout: { $set: this.state.validLayout },
                },
            };
            newItems = update(newItems, settings);
            this.dragTargetKey = undefined;
        } else if (this.resizeTargetKey) {
            const index = newItems.findIndex(
                d => d.key === this.resizeTargetKey,
            );
            const settings = {
                [index]: {
                    layout: { $set: this.state.validLayout },
                },
            };
            newItems = update(newItems, settings);
            this.resizeTargetKey = undefined;
        }

        this.setState({ validLayout: undefined, items: newItems });

        if (this.props.onLayoutChange) {
            this.props.onLayoutChange(newItems);
        }
    }

    renderGridItem = (key, item) => {
        const {
            modifier,
            viewOnly,
        } = this.props;

        return (
            <GridItem
                key={key}
                data={item}
                modifier={modifier}
                className="grid-item"
                onDragStart={this.handleItemDragStart}
                onResizeStart={this.handleItemResizeStart}
                onMouseDown={this.handleItemMouseDown}
                viewOnly={viewOnly}
            />
        );
    }

    renderGhostItem = (p) => {
        const { layout } = p;

        if (!layout) {
            return null;
        }

        return (
            <div
                className={styles['ghost-item']}
                style={{
                    width: layout.width,
                    height: layout.height,
                    transform: `translate(${layout.left}px, ${layout.top}px)`,
                }}
            />
        );
    }

    render() {
        const {
            snapX,
            snapY,
        } = this.props;

        const {
            items,
        } = this.state;

        // XXX: maybe make validLayout copy
        const { validLayout } = this.state;
        const className = this.getClassName();
        const GhostItem = this.renderGhostItem;

        const bounds = this.getBounds();
        const style = {
            ...bounds,
            backgroundSize: `${snapX}px ${snapY}px`,
        };

        return (
            <div
                className={className}
                style={style}
            >
                <List
                    data={items}
                    keyExtractor={GridLayout.itemKeyExtractor}
                    modifier={this.renderGridItem}
                />
                <GhostItem
                    layout={validLayout}
                />
            </div>
        );
    }
}
