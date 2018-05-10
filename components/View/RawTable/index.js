import PropTypes from 'prop-types';
import React from 'react';

import { isArrayEqual } from '../../../utils/common';

import Body from './Body';
import Headers from './Headers';
import styles from './styles.scss';

const propTypeKey = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
]);

const propTypes = {
    className: PropTypes.string,

    headers: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string,
        label: PropTypes.string,
    })).isRequired,

    data: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
    })).isRequired,

    dataModifier: PropTypes.func,

    headerModifier: PropTypes.func,

    expandRowId: propTypeKey,

    expandedRowModifier: PropTypes.func,

    /**
     * keyExtractor is used to get a unique key associated with rowData
     */
    keyExtractor: PropTypes.func.isRequired,

    onBodyClick: PropTypes.func,

    onHeaderClick: PropTypes.func,

    highlightCellKey: PropTypes.shape({
        columnKey: propTypeKey,
        rowKey: propTypeKey,
    }),

    highlightColumnKey: propTypeKey,

    highlightRowKey: propTypeKey,

    onDataSort: PropTypes.func,
};

const defaultProps = {
    className: '',
    onBodyClick: undefined,
    onHeaderClick: undefined,
    dataModifier: undefined,
    headerModifier: undefined,

    highlightCellKey: {},
    highlightColumnKey: undefined,
    highlightRowKey: undefined,

    onDataSort: undefined,

    expandRowId: undefined,
    expandedRowModifier: undefined,
};

export default class RawTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getSortedHeaders = headers => (
        [...headers].sort((a, b) => (a.order - b.order))
    )

    static headerKeyExtractor = header => header.key;

    constructor(props) {
        super(props);

        const headers = RawTable.getSortedHeaders(this.props.headers);
        const headersOrder = headers.map(RawTable.headerKeyExtractor);
        this.state = {
            headersOrder,
            headers,
        };
    }

    componentWillReceiveProps(nextProps) {
        // FIXME: why is data mutated here @frozenhelium?
        if (!isArrayEqual(this.props.data, nextProps.data)) {
            if (this.props.onDataSort) {
                this.props.onDataSort(nextProps.data);
            }
        }
        if (this.props.headers !== nextProps.headers) {
            const newHeaders = RawTable.getSortedHeaders(nextProps.headers);
            const newHeadersOrder = newHeaders.map(RawTable.headerKeyExtractor);

            this.setState({ headers: newHeaders });
            if (!isArrayEqual(newHeadersOrder, this.state.headersOrder)) {
                this.setState({ headersOrder: newHeadersOrder });
            }
        }
    }

    getClassName = (className) => {
        const classNames = [];

        // default className for global override
        classNames.push('raw-table');
        classNames.push(styles.rawTable);

        // className provided by parent (through className)
        classNames.push(className);

        return classNames.join(' ');
    }

    render() {
        const {
            data,
            dataModifier,
            headerModifier,
            keyExtractor,
            onHeaderClick,
            onBodyClick,
            highlightCellKey,
            highlightRowKey,
            highlightColumnKey,
            expandRowId,
            expandedRowModifier,
            className,
        } = this.props;

        const tableClassName = this.getClassName(className);
        return (
            <table className={tableClassName}>
                <Headers
                    headers={this.state.headers}
                    headerModifier={headerModifier}
                    onClick={onHeaderClick}
                />
                <Body
                    data={data}
                    dataModifier={dataModifier}
                    expandedRowModifier={expandedRowModifier}
                    headersOrder={this.state.headersOrder}
                    keyExtractor={keyExtractor}
                    onClick={onBodyClick}
                    highlightCellKey={highlightCellKey}
                    highlightRowKey={highlightRowKey}
                    highlightColumnKey={highlightColumnKey}
                    expandRowId={expandRowId}
                />
            </table>
        );
    }
}
