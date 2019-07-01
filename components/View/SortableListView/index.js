import PropTypes from 'prop-types';
import React from 'react';
import { arrayMove } from 'react-sortable-hoc';
import { FaramSortableListElement } from '@togglecorp/faram';

import ListView from './ListView';

const propTypes = {
    data: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func,
    showDragHandle: PropTypes.bool,
};

const defaultProps = {
    data: [],
    onChange: undefined,
    showDragHandle: true,
};

export class NormalSortableListView extends React.Component {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    handleSortEnd = ({ oldIndex, newIndex }) => {
        const {
            data,
            onChange,
        } = this.props;

        if (onChange) {
            const newData = arrayMove(data, oldIndex, newIndex);
            onChange(newData);
        }
    };

    render() {
        const {
            showDragHandle,
            onChange, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            ...otherProps
        } = this.props;

        return (
            <ListView
                useDragHandle={showDragHandle}
                onSortEnd={this.handleSortEnd}
                lockAxis="y"
                lockToContainerEdges

                showDragHandle={showDragHandle}
                {...otherProps}
            />
        );
    }
}

export default FaramSortableListElement(NormalSortableListView);
