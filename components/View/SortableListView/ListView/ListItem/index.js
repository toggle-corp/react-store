import PropTypes from 'prop-types';
import React from 'react';
import { SortableElement } from 'react-sortable-hoc';
import { _cs } from '@togglecorp/fujs';

import ItemDrag from './ItemDrag';
import styles from './styles.scss';

const propTypes = {
    data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    dataIndex: PropTypes.number.isRequired,
    dataKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,

    showDragHandle: PropTypes.bool,
    dragIconPosition: PropTypes.string,
    className: PropTypes.string,

    renderer: PropTypes.func.isRequired,
    rendererParams: PropTypes.func,
    rendererClassName: PropTypes.string,

    dragHandleClassName: PropTypes.string,
};

const defaultProps = {
    showDragHandle: true,
    dragIconPosition: 'left',
    className: '',
    rendererClassName: '',
    rendererParams: undefined,

    dragHandleClassName: '',
};

@SortableElement
export default class ListItem extends React.Component {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    render() {
        const {
            data,
            dataKey,
            dataIndex,

            showDragHandle,
            dragIconPosition,
            rendererClassName,
            renderer: Renderer,
            rendererParams,

            className: classNameFromProps,
            dragHandleClassName,
            ...otherProps
        } = this.props;

        const dragHandleChild = (
            <ItemDrag
                dataKey={dataKey}
                data={data}
                dataIndex={dataIndex}
                className={dragHandleClassName}

                {...otherProps}
            />
        );

        const className = _cs(styles.sortableItem, classNameFromProps, 'sortable-item');

        // FIXME: fourth argument to rendererParams is not available
        const extraProps = rendererParams ? rendererParams(dataKey, data, dataIndex) : undefined;

        return (
            <div className={className}>
                {showDragHandle && dragIconPosition === 'left' && dragHandleChild }
                <Renderer
                    className={rendererClassName}
                    key={dataKey}
                    {...extraProps}
                />
                {showDragHandle && dragIconPosition === 'right' && dragHandleChild }
            </div>
        );
    }
}
