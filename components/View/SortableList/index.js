import PropTypes from 'prop-types';
import React from 'react';
import {
    SortableContainer,
    SortableElement,
    SortableHandle,
    arrayMove,
} from 'react-sortable-hoc';

import { iconNames } from '../../../constants';
import ListView from '../List/ListView';

import styles from './styles.scss';

const propTypeData = PropTypes.arrayOf(
    PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
        PropTypes.shape({
            dummy: PropTypes.string,
        }),
        PropTypes.array,
    ]),
);

const propTypes = {
    className: PropTypes.string,
    /* data to be iterated and shown as list */
    data: propTypeData,
    /* Component to show when data is empty */
    emptyComponent: PropTypes.func,

    dragIcon: PropTypes.string,

    dragIconPosition: PropTypes.string,

    dragHandleModifier: PropTypes.func,

    onChange: PropTypes.func,

    modifier: PropTypes.func.isRequired,

    keySelector: PropTypes.func,

    useDragHandle: PropTypes.bool,

    sortableItemClass: PropTypes.string,
};

const defaultProps = {
    className: '',
    data: [],
    dragIcon: iconNames.hamburger,
    dragIconPosition: 'left',
    onChange: undefined,
    useDragHandle: true,
    sortableItemClass: '',
    keySelector: undefined,
    dragHandleModifier: undefined,
    emptyComponent: undefined,
};

export default class SortableList extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    onSortEnd = ({ oldIndex, newIndex }) => {
        const newData = arrayMove(this.props.data, oldIndex, newIndex);

        if (this.props.onChange) {
            this.props.onChange(newData);
        }
    };

    getSortableItems = (key, data, index) => (
        <this.SortableItem
            key={key}
            index={index}
            value={{ key, data, index }}
        />
    )

    SortableItem = SortableElement(({ value: { data, key, index } }) => (
        <div
            className={`${styles.sortableItem} ${this.props.sortableItemClass} sortable-item`}
        >
            {this.props.useDragHandle && (
                this.props.dragIconPosition === 'left' &&
                <this.DragHandle dataKey={key} data={data} dataIndex={index} />
            )}
            {this.props.modifier(key, data, index)}
            {this.props.useDragHandle && (
                this.props.dragIconPosition === 'right' &&
                <this.DragHandle dataKey={key} data={data} dataIndex={index} />
            )}
        </div>
    ))

    List = SortableContainer(({ items }) => (
        <ListView
            className={this.props.className}
            data={items}
            keySelector={this.props.keySelector}
            modifier={this.getSortableItems}
            emptyComponent={this.props.emptyComponent}
        />
    ))

    DragHandle = SortableHandle(({ dataKey, data, dataIndex }) => {
        if (this.props.dragHandleModifier) {
            return (this.props.dragHandleModifier(dataKey, data, dataIndex));
        }
        return (
            <span className={`${this.props.dragIcon} ${styles.dragHandle} drag-handle`} />
        );
    });

    render() {
        const {
            data,
            useDragHandle,
            ...otherProps
        } = this.props;

        const { List } = this;

        return (
            <List
                items={data}
                onSortEnd={this.onSortEnd}
                lockAxis="y"
                lockToContainerEdges
                useDragHandle={useDragHandle}
                {...otherProps}
            />
        );
    }
}
