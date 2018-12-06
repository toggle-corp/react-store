import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import { isArrayEqual } from '../../../utils/common';
import Message from '../Message';

import Body from './Body';
import Headers from './Headers';
import styles from './styles.scss';

const defaultEmptyComponent = () => {
    const classNames = [
        'empty',
        styles.empty,
    ];

    return (
        <Message className={classNames.join(' ')}>
            Nothing to show
        </Message>
    );
};

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

    highlightColumnKey: propTypeKey,

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

    highlightCellKey: {},
    highlightColumnKey: undefined,
    highlightRowKey: undefined,

    onDataSort: undefined,

    expandRowId: undefined,
    expandedRowModifier: undefined,

    emptyComponent: defaultEmptyComponent,
};

export default class RawTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getSortedHeaders = (headers = []) => (
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
            keySelector,
            onHeaderClick,
            onBodyClick,
            onBodyHover,
            onBodyHoverOut,
            highlightCellKey,
            highlightRowKey,
            highlightColumnKey,
            expandRowId,
            expandedRowModifier,
            emptyComponent: EmptyComponent,
            className,
        } = this.props;

        const tableClassName = this.getClassName(className);
        const emptyClassName = [
            'empty',
            styles.empty,
        ];

        return (
            <Fragment>
                {
                    data.length > 0 ? (
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
                                keySelector={keySelector}
                                onClick={onBodyClick}
                                onHover={onBodyHover}
                                onHoverOut={onBodyHoverOut}
                                highlightCellKey={highlightCellKey}
                                highlightRowKey={highlightRowKey}
                                highlightColumnKey={highlightColumnKey}
                                expandRowId={expandRowId}
                            />
                        </table>
                    ) : (
                        EmptyComponent && <EmptyComponent className={emptyClassName} />
                    )
                }
            </Fragment>
        );
    }
}
