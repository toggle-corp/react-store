import PropTypes from 'prop-types';
import React from 'react';
import { SortableContainer } from 'react-sortable-hoc';

import { NormalListView } from '../../List/ListView';

import ListItem from './ListItem';

const propTypes = {
    data: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
    emptyComponent: PropTypes.func,
    keyExtractor: PropTypes.func,
    faramElement: PropTypes.bool,
    itemClassName: PropTypes.string,
};

const defaultProps = {
    data: [],
    keyExtractor: undefined,
    className: '',
    emptyComponent: undefined,
    faramElement: false,
    itemClassName: '',
};

@SortableContainer
export default class ListViewSortableContainer extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    rendererParams = (key, datum, index) => {
        const {
            data, // eslint-disable-line no-unused-vars
            className, // eslint-disable-line no-unused-vars
            keyExtractor, // eslint-disable-line no-unused-vars
            emptyComponent, // eslint-disable-line no-unused-vars
            itemClassName,
            ...otherProps
        } = this.props;
        return {
            index, // injected for sortable hoc

            dataKey: key,
            dataIndex: index,
            data: datum,
            className: itemClassName,

            ...otherProps,
        };
    }

    render() {
        const {
            data,
            className,
            keyExtractor,
            emptyComponent,
            faramElement,
        } = this.props;

        return (
            <NormalListView
                className={className}
                emptyComponent={emptyComponent}
                data={data}
                keyExtractor={keyExtractor}
                renderer={ListItem}
                rendererParams={this.rendererParams}
                faramElement={faramElement}
            />
        );
    }
}
