import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { SortableHandle } from 'react-sortable-hoc';

import Icon from '../../../../../General/Icon';
import styles from './styles.scss';

const propTypes = {
    data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    dataIndex: PropTypes.number.isRequired,
    dataKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,

    className: PropTypes.string,

    dragIcon: PropTypes.string,
    dragHandleModifier: PropTypes.func,
};

const defaultProps = {
    dragIcon: 'hamburger',
    dragHandleModifier: undefined,
    className: undefined,
};

@SortableHandle
export default class ItemDrag extends React.Component {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    render() {
        const {
            dataKey,
            data,
            dataIndex,

            dragHandleModifier,
            dragIcon,

            className: classNameFromProps,
        } = this.props;

        if (dragHandleModifier) {
            return dragHandleModifier(dataKey, data, dataIndex);
        }

        const className = _cs(classNameFromProps, styles.dragHandle, 'drag-handle');
        return (
            <Icon
                className={className}
                name={dragIcon}
            />
        );
    }
}
