import PropTypes from 'prop-types';
import React from 'react';
import { SortableHandle } from 'react-sortable-hoc';

import { iconNames } from '../../../../../../constants';
import styles from './styles.scss';

const propTypes = {
    data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    dataIndex: PropTypes.number.isRequired,
    dataKey: PropTypes.string.isRequired,

    className: PropTypes.string.isRequired,

    dragIcon: PropTypes.string,
    dragHandleModifier: PropTypes.func,
};

const defaultProps = {
    dragIcon: iconNames.hamburger,
    dragHandleModifier: undefined,
    className: '',
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
        const className = `${classNameFromProps} ${dragIcon} ${styles.dragHandle} drag-handle`;
        return (<span className={className} />);
    }
}
