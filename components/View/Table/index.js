import PropTypes from 'prop-types';
import React from 'react';

import {
    isTruthy,
    isFalsy,
    isListEqual,
} from '@togglecorp/fujs';
import RawTable from '../RawTable';
import TableHeader from '../TableHeader';

const propTypeKey = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
]);

/**
 * comparator: comparator function for sorting, recieves data rows(not column data)
 *
 * defaultSortOrder: the sort order which should be applied when clicked,
 *
 * key: unique key for each column, the key is also used to determine
 *      the data for rows in the body
 *
 * label: text label for the column
 *
 * modifier: returns a renderable object for the column, recieves whole row of data (not column)
 *
 * order: the order in which they appear relative to that of other header columns
 *
 * sortable: is element sortable?
 */
const TableHeaderPropTypes = PropTypes.arrayOf(
    PropTypes.shape({
        comparator: PropTypes.func,
        defaultSortOrder: PropTypes.string,
        key: PropTypes.string,
        label: PropTypes.string,
        labelModifier: PropTypes.func,
        modifier: PropTypes.func,
        order: PropTypes.number,
        sortable: PropTypes.bool,
    }),
);

const TableDataPropTypes = PropTypes.arrayOf(
    PropTypes.shape({
        key: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
        // Note: Shape is dynamic
    }).isRequired,
);

const propTypes = {
    className: PropTypes.string,

    /**
     * data for table rows
     *
     * NOTE: see { TableDataPropTypes } in Table/Body for more detail
     */
    data: TableDataPropTypes.isRequired,

    /**
     * An object with header key, order(ASC/DSC) for the default sort
     */
    defaultSort: PropTypes.shape({
        key: PropTypes.string.isRequired,
        order: PropTypes.string.isRequired,
    }),

    /**
     * headers is an array of the structure objects required for the header
     *
     * NOTE: see { TableHeaderPropTypes } in Table/Header for more detail
     */
    headers: TableHeaderPropTypes.isRequired,

    expandRowId: propTypeKey,

    expandedRowModifier: PropTypes.func,

    /**
     * A function that returns key from the row data
     */
    keySelector: PropTypes.func.isRequired,

    highlightCellKey: PropTypes.shape({
        columnKey: propTypeKey,
        rowKey: propTypeKey,
    }),

    highlightColumnKey: propTypeKey,

    highlightRowKey: propTypeKey,

    onBodyClick: PropTypes.func,

    onBodyHover: PropTypes.func,
    onBodyHoverOut: PropTypes.func,

    onDataSort: PropTypes.func,

    emptyComponent: PropTypes.func,
    pending: PropTypes.bool,
    rowClassNameSelector: PropTypes.func,
};

const defaultProps = {
    className: '',
    defaultSort: undefined,
    pending: false,

    highlightCellKey: {},
    highlightColumnKey: undefined,
    highlightRowKey: undefined,
    onBodyClick: undefined,
    onBodyHover: undefined,
    onBodyHoverOut: undefined,
    onDataSort: undefined,
    emptyComponent: undefined,
    expandRowId: undefined,
    expandedRowModifier: undefined,
    rowClassNameSelector: undefined,
};

export default class Table extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            headers,
            data,
            defaultSort,
        } = this.props;

        let activeSort = defaultSort;

        // Get activeSort if there is no defaultSort
        if (!activeSort) {
            activeSort = this.getActiveSort(headers);
        }

        const newHeaders = this.getStateHeaders(headers, activeSort);

        // initially sort the data
        const newData = this.getSortedData(headers, data, activeSort);

        this.state = {
            activeSort,
            headers: newHeaders,
            data: newData,
        };
    }

    // normal, next, new, state
    UNSAFE_componentWillReceiveProps(nextProps) {
        const {
            data: nextData,
            headers: nextHeaders,
            defaultSort: nextDefaultSort,
        } = nextProps;

        let {
            data: newData,
            headers: newHeaders,
        } = this.props;

        let { activeSort: newActiveSort } = this.state;

        const {
            data: stateData,
            headers: stateHeaders,
        } = this.state;

        // check if headers has changed
        const headersChanged = !isListEqual(nextHeaders, newHeaders);
        if (headersChanged) {
            newHeaders = nextHeaders;
        }

        // NOTE: should only be called when header has changed
        // Determine new active sort if there is no active sort
        // Priority: state > nextDefaultSort > first sortable header
        if (isFalsy(newActiveSort.key, [''])) {
            newActiveSort = nextDefaultSort || this.getActiveSort(newHeaders);
        }

        if (headersChanged) {
            newHeaders = this.getStateHeaders(newHeaders, newActiveSort);
        } else {
            newHeaders = stateHeaders;
        }

        const dataChanged = !isListEqual(nextData, newData);
        if (dataChanged || headersChanged) {
            newData = this.getSortedData(nextHeaders, nextData, newActiveSort);
        } else {
            newData = stateData;
        }

        this.setState({
            activeSort: newActiveSort,
            data: newData,
            headers: newHeaders,
        });
    }

    // eslint-disable-next-line react/sort-comp
    handleHeaderClick = (key) => {
        const { headers } = this.state;
        const { data } = this.props;

        const clickedHeader = headers.find(d => d.key === key);
        if (clickedHeader === undefined) {
            console.error(`Header with key '${key}' not found.`);
            return;
        }
        if (!clickedHeader.sortable) {
            console.warn(`Header with key '${key}' is not sortable.`);
            return;
        }

        let { activeSort: newActiveSort } = this.state;
        if (newActiveSort.key === key) {
            newActiveSort = {
                ...newActiveSort,
                order: newActiveSort.order === 'asc' ? 'dsc' : 'asc',
            };
        } else {
            newActiveSort = {
                key,
                order: clickedHeader.defaultSortOrder || 'asc',
            };
        }

        const newHeaders = this.getStateHeaders(headers, newActiveSort);

        const newData = this.getSortedData(newHeaders, data, newActiveSort);

        this.setState({
            activeSort: newActiveSort,
            data: newData,
            headers: newHeaders,
        });
    }

    getActiveSort = (newHeaders) => {
        const sortableHeaders = newHeaders.filter(d => d.sortable);

        let newActiveSort = {};
        if (sortableHeaders && sortableHeaders.length > 0) {
            newActiveSort = {
                key: sortableHeaders[0].key,
                order: sortableHeaders[0].defaultSortOrder || 'asc',
            };
        }
        return newActiveSort;
    };

    // add isActiveSort and currentSortOrder in headers
    getStateHeaders = (headers, activeSort) => headers.map((header) => {
        const isActiveSort = isTruthy(header.key) && header.key === activeSort.key;
        const currentSortOrder = (isTruthy(header.key) && header.key === activeSort.key) ? activeSort.order : '';

        if (header.isActiveSort === isActiveSort && header.currentSortOrder === currentSortOrder) {
            return header;
        }
        return {
            ...header,
            isActiveSort,
            currentSortOrder,
        };
    });

    getSortedData = (headers, data = [], activeSort) => {
        if (isFalsy(activeSort) || isFalsy(activeSort.key, [''])) {
            return data;
        }

        const activeHeader = headers.find(header => header.key === activeSort.key);
        if (activeHeader === undefined) {
            return data;
        }

        const sortByHeader = (a, b) => (
            (activeSort.order === 'dsc' ? -1 : 1) * activeHeader.comparator(a, b)
        );

        const newData = [...data].sort(sortByHeader);
        return newData;
    }

    dataModifier = (data, columnKey) => {
        const { headers } = this.state;
        const header = headers.find(d => d.key === columnKey);

        if (header.modifier) {
            return header.modifier(data);
        }

        return data[columnKey];
    }

    headerModifier = (header) => {
        const { activeSort } = this.state;
        const sortOrder = activeSort.key === header.key ? activeSort.order : '';
        const label = header.labelModifier ? header.labelModifier() : header.label;

        return (
            <TableHeader
                label={label}
                sortOrder={sortOrder}
                sortable={header.sortable}
            />
        );
    }

    render() {
        const {
            className,
            keySelector,
            highlightCellKey,
            highlightRowKey,
            highlightColumnKey,
            onBodyClick,
            onBodyHover,
            onBodyHoverOut,
            onDataSort,
            emptyComponent,
            expandRowId,
            expandedRowModifier,
            pending,
            rowClassNameSelector,
        } = this.props;

        const {
            data,
            headers,
        } = this.state;

        return (
            <RawTable
                className={className}
                data={data}
                dataModifier={this.dataModifier}
                headerModifier={this.headerModifier}
                headers={headers}
                keySelector={keySelector}
                onHeaderClick={this.handleHeaderClick}
                highlightCellKey={highlightCellKey}
                highlightRowKey={highlightRowKey}
                highlightColumnKey={highlightColumnKey}
                onBodyClick={onBodyClick}
                onBodyHover={onBodyHover}
                onBodyHoverOut={onBodyHoverOut}
                onDataSort={onDataSort}
                emptyComponent={emptyComponent}
                expandRowId={expandRowId}
                expandedRowModifier={expandedRowModifier}
                pending={pending}
                rowClassNameSelector={rowClassNameSelector}
            />
        );
    }
}
