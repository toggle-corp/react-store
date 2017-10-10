import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import DataRow from './DataRow';
import styles from './styles.scss';
import { TableHeaderPropTypes } from '../Table/Header';

export const TableDataPropTypes = PropTypes.arrayOf(
    PropTypes.shape({
        key: PropTypes.string,
        // Note: Shape is dynamic
    }).isRequired,
);

const propTypes = {
    data: TableDataPropTypes.isRequired,
    headers: TableHeaderPropTypes.isRequired,

    /**
     * Object of { columnKey, rowKey } for cell to highlight
     */
    highlightCellKey: PropTypes.shape({
        rowKey: PropTypes.string,
        rowColumn: PropTypes.string,
    }).isRequired,

    /**
     * Key for column to highlight
     */
    highlightColumnKey: PropTypes.string,

    /**
     * Key for row to highlight
     */
    highlightRowKey: PropTypes.string,

    /**
     * Is cell hoverable ?
     */
    hoverableCell: PropTypes.bool.isRequired,

    /**
     * Is row hoverable ?
     */
    hoverableRow: PropTypes.bool.isRequired,

    /**
     * keyExtractor is used to get a unique key associated with rowData
     */
    keyExtractor: PropTypes.func.isRequired,
};

const defaultProps = {
    highlightColumnKey: undefined,
    highlightRowKey: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class Body extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            highlightColumnKey,
            highlightRowKey,
            highlightCellKey,
            hoverableCell,
            hoverableRow,
        } = this.props;
        console.log(
            highlightColumnKey,
            highlightRowKey,
            highlightCellKey,
            hoverableCell,
            hoverableRow,
        );
    }

    getDataRow = (rowData) => {
        const {
            headers,
            keyExtractor,
            highlightRowKey,
            highlightColumnKey,
            hoverableCell,
            hoverableRow,
        } = this.props;

        const key = keyExtractor(rowData);
        const styleNames = [];

        if (highlightRowKey === key) {
            styleNames.push('highlight');
        }

        if (hoverableRow) {
            styleNames.push('hoverable');
        }

        const styleName = styleNames.join(' ');

        return (
            <DataRow
                styleName={styleName}
                headers={headers}
                key={key}
                rowData={rowData}
                highlightColumnKey={highlightColumnKey}
                hoverableCell={hoverableCell}
            />
        );
    }

    render() {
        const {
            data,
        } = this.props;

        return (
            <tbody>
                {
                    data.map(rowData => (
                        this.getDataRow(rowData)
                    ))
                }
            </tbody>
        );
    }
}
