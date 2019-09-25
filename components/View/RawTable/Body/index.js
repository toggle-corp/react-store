import PropTypes from 'prop-types';
import React from 'react';

import {
    isFalsy,
    isTruthy,
    _cs,
} from '@togglecorp/fujs';

import List from '../../List';

import Row from './Row';
import ExpandedRow from './ExpandedRow';

const propTypeKey = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
]);

const propTypes = {
    areCellsHoverable: PropTypes.bool,

    areRowsHoverable: PropTypes.bool,

    className: PropTypes.string,

    data: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
    })).isRequired,

    dataModifier: PropTypes.func,

    expandRowId: propTypeKey,

    expandedRowModifier: PropTypes.func,

    headersOrder: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
    ).isRequired,

    highlightCellKey: PropTypes.shape({
        columnKey: propTypeKey,
        rowKey: propTypeKey,
    }),

    highlightRowKey: propTypeKey,

    // eslint-disable-next-line react/forbid-prop-types
    highlightColumnKeys: PropTypes.object,

    /**
     * keySelector is used to get a unique key associated with rowData
     */
    keySelector: PropTypes.func.isRequired,

    onClick: PropTypes.func,

    onHover: PropTypes.func,
    onHoverOut: PropTypes.func,
    rowClassNameSelector: PropTypes.func,
};

const defaultProps = {
    areCellsHoverable: false,
    areRowsHoverable: false,
    className: '',
    dataModifier: undefined,
    highlightCellKey: {},
    highlightRowKey: undefined,
    highlightColumnKeys: undefined,
    onClick: undefined,
    onHover: undefined,
    onHoverOut: undefined,
    expandRowId: undefined,
    expandedRowModifier: undefined,
    rowClassNameSelector: undefined,
};

export default class Body extends React.Component {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    getRowKey = (rowData) => {
        const { keySelector } = this.props;
        return keySelector(rowData);
    }

    handleRowClick = (rowKey, cellKey, e) => {
        const { onClick } = this.props;
        if (onClick) {
            onClick(rowKey, cellKey, e);
        }
    }

    handleRowHover = (rowKey, cellKey, e) => {
        const { onHover } = this.props;
        if (onHover) {
            onHover(rowKey, cellKey, e);
        }
    }

    renderRow = (key, rowData) => {
        const {
            areCellsHoverable,
            areRowsHoverable,
            dataModifier,
            highlightCellKey,
            highlightColumnKeys,
            highlightRowKey,
            expandRowId,
            expandedRowModifier,
            headersOrder,
            onHoverOut,
            rowClassNameSelector,
        } = this.props;

        let cellKey;
        if (highlightCellKey.rowKey === key) {
            cellKey = highlightCellKey.columnKey;
        }

        let className = '';
        if (rowClassNameSelector) {
            className = rowClassNameSelector(rowData);
        }

        const myRow = (
            <Row
                className={className}
                key={key}
                uniqueKey={key}
                areCellsHoverable={areCellsHoverable}
                dataModifier={dataModifier}
                headersOrder={headersOrder}
                highlightCellKey={cellKey}
                highlightColumnKeys={highlightColumnKeys}
                highlighted={isTruthy(key) && key === highlightRowKey}
                hoverable={areRowsHoverable}
                onClick={this.handleRowClick}
                onHover={this.handleRowHover}
                onHoverOut={onHoverOut}
                rowData={rowData}
            />
        );

        // FIXME: returning an array of components will unmount those components
        // on any change
        if (!isFalsy(expandRowId, ['']) && expandRowId === key) {
            return ([
                myRow,
                <ExpandedRow
                    key={`${key}-expanded`}
                    colSpan={headersOrder.length}
                    rowData={rowData}
                    expandedRowModifier={expandedRowModifier}
                />,
            ]);
        }
        return myRow;
    }

    render() {
        const {
            data,
            className,
        } = this.props;

        return (
            <tbody className={_cs(className, 'body')}>
                <List
                    data={data}
                    keySelector={this.getRowKey}
                    modifier={this.renderRow}
                />
            </tbody>
        );
    }
}
