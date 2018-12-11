import PropTypes from 'prop-types';
import React from 'react';

import { isEqualAndTruthy } from '../../../../utils/common';

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

    headersOrder: PropTypes.arrayOf(PropTypes.string).isRequired,

    highlightCellKey: PropTypes.shape({
        columnKey: propTypeKey,
        rowKey: propTypeKey,
    }),

    highlightRowKey: propTypeKey,

    highlightColumnKey: propTypeKey,

    /**
     * keySelector is used to get a unique key associated with rowData
     */
    keySelector: PropTypes.func.isRequired,

    onClick: PropTypes.func,

    onHover: PropTypes.func,
    onHoverOut: PropTypes.func,
};

const defaultProps = {
    areCellsHoverable: false,
    areRowsHoverable: false,
    className: '',
    dataModifier: undefined,
    highlightCellKey: {},
    highlightRowKey: undefined,
    highlightColumnKey: undefined,
    onClick: undefined,
    onHover: undefined,
    onHoverOut: undefined,
    expandRowId: undefined,
    expandedRowModifier: undefined,
};

export default class Body extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = (className) => {
        const classNames = [];

        // default className for global override
        classNames.push('tc-table-body');
        // classNames.push(styles.body);

        // className provided by parent (through className)
        classNames.push(className);

        return classNames.join(' ');
    }

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
            highlightColumnKey,
            highlightRowKey,
            expandRowId,
            expandedRowModifier,
            headersOrder,
            onHoverOut,
        } = this.props;

        let cellKey;
        if (highlightCellKey.rowKey === key) {
            cellKey = highlightCellKey.columnKey;
        }

        const myRow = (
            <Row
                key={key}
                uniqueKey={key}
                areCellsHoverable={areCellsHoverable}
                dataModifier={dataModifier}
                headersOrder={headersOrder}
                highlightCellKey={cellKey}
                highlightColumnKey={highlightColumnKey}
                highlighted={isEqualAndTruthy(key, highlightRowKey)}
                hoverable={areRowsHoverable}
                onClick={this.handleRowClick}
                onHover={this.handleRowHover}
                onHoverOut={onHoverOut}
                rowData={rowData}
            />
        );

        // FIXME: returning an array of components will unmount those components
        // on any change
        if (expandRowId && expandRowId === key) {
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
        const { data } = this.props;

        const className = this.getClassName(this.props.className);

        return (
            <tbody className={className}>
                <List
                    data={data}
                    keySelector={this.getRowKey}
                    modifier={this.renderRow}
                />
            </tbody>
        );
    }
}
