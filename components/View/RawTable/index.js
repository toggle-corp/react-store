import PropTypes from 'prop-types';
import React from 'react';
import { isListEqual, _cs } from '@togglecorp/fujs';

import LoadingAnimation from '../LoadingAnimation';
import Message from '../Message';

import Body from './Body';
import Headers from './Headers';
import styles from './styles.scss';

const DefaultEmptyComponent = ({ className, isFiltered }) => (
    <Message className={className}>
        {
            isFiltered
                ? 'There are no items that match your filtering criteria.'
                : 'There are no items.'
        }
    </Message>
);
DefaultEmptyComponent.propTypes = {
    className: PropTypes.string,
    isFiltered: PropTypes.bool,
};
DefaultEmptyComponent.defaultProps = {
    className: undefined,
    isFiltered: false,
};

const propTypeKey = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
]);

const propTypes = {
    className: PropTypes.string,

    pending: PropTypes.bool,
    isFiltered: PropTypes.bool,

    headers: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
        label: PropTypes.node,
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
     * keySelector is used to get a unique key associated with rowData
     */
    keySelector: PropTypes.func.isRequired,

    onBodyClick: PropTypes.func,

    onBodyHover: PropTypes.func,
    onBodyHoverOut: PropTypes.func,

    onHeaderClick: PropTypes.func,

    highlightCellKey: PropTypes.shape({
        columnKey: propTypeKey,
        rowKey: propTypeKey,
    }),

    // eslint-disable-next-line react/forbid-prop-types
    highlightColumnKeys: PropTypes.object,

    highlightRowKey: propTypeKey,

    onDataSort: PropTypes.func,

    emptyComponent: PropTypes.func,
};

const defaultProps = {
    className: '',
    onBodyClick: undefined,
    onBodyHover: undefined,
    onBodyHoverOut: undefined,
    onHeaderClick: undefined,
    dataModifier: undefined,
    headerModifier: undefined,

    pending: false,
    isFiltered: false,

    highlightCellKey: {},
    highlightColumnKeys: undefined,
    highlightRowKey: undefined,

    onDataSort: undefined,

    expandRowId: undefined,
    expandedRowModifier: undefined,

    emptyComponent: DefaultEmptyComponent,
};

export default class RawTable extends React.Component {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    static getSortedHeaders = (headers = []) => (
        [...headers].sort((a, b) => (a.order - b.order))
    )

    static headerKeyExtractor = header => header.key;

    constructor(props) {
        super(props);
        const {
            headers: headersFromProps,
        } = this.props;

        const headers = RawTable.getSortedHeaders(headersFromProps);
        const headersOrder = headers.map(RawTable.headerKeyExtractor);
        this.state = {
            headersOrder,
            headers,
        };
    }

    componentWillReceiveProps(nextProps) {
        const {
            data: oldData,
            headers: oldHeaders,
            onDataSort,
        } = this.props;

        const {
            headers,
            data,
        } = nextProps;

        const { headersOrder } = this.state;

        // FIXME: why is data mutated here @frozenhelium?
        if (!isListEqual(oldData, data)) {
            if (onDataSort) {
                onDataSort(data);
            }
        }
        if (oldHeaders !== headers) {
            const newHeaders = RawTable.getSortedHeaders(headers);
            const newHeadersOrder = newHeaders.map(RawTable.headerKeyExtractor);

            this.setState({ headers: newHeaders });
            if (!isListEqual(newHeadersOrder, headersOrder)) {
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
            keySelector,
            onHeaderClick,
            onBodyClick,
            onBodyHover,
            onBodyHoverOut,
            highlightCellKey,
            highlightRowKey,
            highlightColumnKeys,
            expandRowId,
            expandedRowModifier,
            emptyComponent: EmptyComponent,
            className,
            pending,
            isFiltered,
        } = this.props;

        const {
            headers,
            headersOrder,
        } = this.state;

        return (
            <div className={_cs(styles.tableContainer, className, 'raw-table')}>
                <div className={_cs(styles.scrollWrapper, 'raw-table-scroll-wrapper')}>
                    <table className={_cs(styles.table, 'table')}>
                        <Headers
                            headers={headers}
                            headerModifier={headerModifier}
                            onClick={onHeaderClick}
                            highlightColumnKeys={highlightColumnKeys}
                            disabled={data.length <= 0 || pending}
                        />
                        { data.length > 0 && (
                            <Body
                                data={data}
                                dataModifier={dataModifier}
                                expandedRowModifier={expandedRowModifier}
                                headersOrder={headersOrder}
                                keySelector={keySelector}
                                onClick={onBodyClick}
                                onHover={onBodyHover}
                                onHoverOut={onBodyHoverOut}
                                highlightCellKey={highlightCellKey}
                                highlightRowKey={highlightRowKey}
                                highlightColumnKeys={highlightColumnKeys}
                                expandRowId={expandRowId}
                            />
                        )}
                    </table>
                    { data.length <= 0 && !pending && (
                        <div className={styles.emptyContainer}>
                            <EmptyComponent
                                className={_cs('empty', styles.empty)}
                                isFiltered={isFiltered}
                            />
                        </div>
                    )}
                </div>
                { pending && (
                    <LoadingAnimation
                        message="Fetching data..."
                    />
                )}
            </div>
        );
    }
}
