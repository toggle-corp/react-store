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
    keyExtractor: PropTypes.func.isRequired,
    onLayoutChange: PropTypes.func,
};

const defaultProps = {
    className: '',
    onLayoutChange: undefined,
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
        if (nextProps.items !== this.state.items) {
            this.setState({
                items: this.validateItems(nextProps.items),
            });
        }
    }

    getGridItem = (item) => {
        const {
            modifier,
            keyExtractor,
        } = this.props;

        const key = keyExtractor(item);
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
            >
                { modifier(item) }
            </GridItem>
        );
    }

    handleItemDragStart = (key, e) => {
        this.dragTargetKey = key;
        this.lastScreenX = e.screenX;
        this.lastScreenY = e.screenY;

        const newItems = [...this.state.items];
        const itemIndex = newItems.findIndex(
            d => this.props.keyExtractor(d) === key,
        );
        this.setState({
            validLayout: {
                ...newItems[itemIndex].layout,
            },
        });
    }

    handleItemResizeStart = (key, e) => {
        this.resizeTargetKey = key;
        this.lastScreenX = e.screenX;
        this.lastScreenY = e.screenY;

        const newItems = [...this.state.items];
        const itemIndex = newItems.findIndex(
            d => this.props.keyExtractor(d) === key,
        );
        this.setState({
            validLayout: {
                ...newItems[itemIndex].layout,
            },
        });
    }

    handleMouseMove = (e) => {
        if (this.dragTargetKey || this.resizeTargetKey) {
            const newItems = [...this.state.items];
            let validLayout = this.state.validLayout;

            const dx = e.screenX - this.lastScreenX;
            const dy = e.screenY - this.lastScreenY;

            if (this.dragTargetKey) {
                const itemIndex = newItems.findIndex(
                    d => this.props.keyExtractor(d) === this.dragTargetKey,
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
                    validLayout = {
                        ...newItems[itemIndex].layout,
                    };
                }
            }

            if (this.resizeTargetKey) {
                const itemIndex = newItems.findIndex(
                    d => this.props.keyExtractor(d) === this.resizeTargetKey,
                );
                newItems[itemIndex].layout.width += dx;
                newItems[itemIndex].layout.height += dy;

                if (!checkCollision(newItems, itemIndex)) {
                    validLayout = {
                        ...newItems[itemIndex].layout,
                    };
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
        if (this.dragTargetKey || this.resizeTargetKey) {
            const newItems = [...this.state.items];

            if (this.dragTargetKey) {
                const itemIndex = newItems.findIndex(
                    d => this.props.keyExtractor(d) === this.dragTargetKey,
                );
                newItems[itemIndex].layout = {
                    ...this.state.validLayout,
                };
            } else if (this.resizeTargetKey) {
                const itemIndex = newItems.findIndex(
                    d => this.props.keyExtractor(d) === this.resizeTargetKey,
                );
                newItems[itemIndex].layout = {
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

            for (let i = items.length - 1; i >= 1; i -= 1) {
                if (checkCollision(items, i)) {
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
        } = this.props;

        const {
            items,
            validLayout,
        } = this.state;

        const ghostLayout = validLayout && { ...validLayout };

        return (
            <div
                styleName="grid-layout"
                className={className}
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
