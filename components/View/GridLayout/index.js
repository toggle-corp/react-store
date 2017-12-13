import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import GridItem from './GridItem';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    modifier: PropTypes.func.isRequired,
    items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    keyExtractor: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class GridLayout extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            items: props.items,
        };

        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
    }

    getGridItem = (item) => {
        const {
            modifier,
            keyExtractor,
        } = this.props;

        const key = keyExtractor(item);
        const gridData = {
            key,
            position: item.position,
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
    }

    handleItemResizeStart = (key, e) => {
        this.resizeTargetKey = key;
        this.lastScreenX = e.screenX;
        this.lastScreenY = e.screenY;
    }

    handleMouseMove = (e) => {
        if (this.dragTargetKey || this.resizeTargetKey) {
            const newItems = [...this.state.items];

            const dx = e.screenX - this.lastScreenX;
            const dy = e.screenY - this.lastScreenY;

            if (this.dragTargetKey) {
                const itemIndex = newItems.findIndex(
                    d => this.props.keyExtractor(d) === this.dragTargetKey,
                );
                newItems[itemIndex].position.left += dx;
                newItems[itemIndex].position.top += dy;
            }

            if (this.resizeTargetKey) {
                const itemIndex = newItems.findIndex(
                    d => this.props.keyExtractor(d) === this.resizeTargetKey,
                );
                newItems[itemIndex].position.width += dx;
                newItems[itemIndex].position.height += dy;
            }

            this.setState({
                items: newItems,
            });

            this.lastScreenX = e.screenX;
            this.lastScreenY = e.screenY;
        }
    }

    handleMouseUp = () => {
        this.dragTargetKey = undefined;
        this.resizeTargetKey = undefined;
    }

    render() {
        const {
            className,
        } = this.props;

        const {
            items,
        } = this.state;

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
            </div>
        );
    }
}
