import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

import Header, {
    TableHeaderPropTypes,
} from './Header';

import Body, {
    TableDataPropTypes,
} from './Body';

import {
    isFalsy,
} from '../../utils/common';


const ASC = 'asc';
const DSC = 'dsc';

const propTypes = {
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

    /**
     * hide table headers?
     */
    hideHeaders: PropTypes.bool,

    /**
     * A function that returns key from the row data
     */
    keyExtractor: PropTypes.func,

    /**
     * A function that return a renderable for when table is empty
     */
    emptyRenderer: PropTypes.func,
};

const defaultProps = {

    hideHeaders: false,

    headers: {
        comparator: (a, b) => a - b,
        sortable: false,
    },

    defaultSort: undefined,

    keyExtractor: undefined,

    emptyRenderer: () => (<p>Nothing here</p>),
};

@CSSModules(styles, { allowMultiple: true })
export default class Table extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getSortedData = (headers, data, headerMeta) => {
        if (isFalsy(headerMeta)) {
            return data;
        }

        const activeHeader = headers.find(header => header.key === headerMeta.activeKey);

        const sortByHeader = (a, b) => (
            (headerMeta.sortOrder === DSC ? -1 : 1) * activeHeader.comparator(a, b)
        );

        const newData = [...data].sort(sortByHeader);

        return newData;
    }

    constructor(props) {
        super(props);
        this.state = {};

        const { data, headers, defaultSort } = this.props;
        // NOTE: order and number of columns cannot change after initialization
        // Sort headers according to order (horizontalSort)
        this.headers = [...headers].sort((a, b) => a.order - b.order);

        let activeSort = defaultSort;
        if (!activeSort) {
            const sortableHeaders = headers.filter(a => a.sortable);
            if (sortableHeaders.length > 0) {
                activeSort = { key: sortableHeaders[0].key, order: ASC };
            }
        }

        if (activeSort) {
            const headerMeta = { activeKey: activeSort.key, sortOrder: activeSort.order };
            this.state.headerMeta = headerMeta;

            this.state.data = Table.getSortedData(headers, data, headerMeta);
        } else {
            this.state.data = data;
        }
    }

    componentWillReceiveProps(nextProps) {
        const { headers, data } = nextProps;
        const { headerMeta } = this.state;

        const newData = Table.getSortedData(headers, data, headerMeta);
        this.setState({ data: newData });
    }

    onHeaderClick = (key) => {
        const { headers, data } = this.props;
        const { headerMeta } = this.state;

        const activeHeader = headers.find(header => header.key === key) || { sortable: false };

        if (!activeHeader.sortable) {
            return;
        }

        let sortOrder;
        if (headerMeta.activeKey === key) {
            sortOrder = headerMeta.sortOrder === ASC ? DSC : ASC;
        } else {
            sortOrder = ASC;
        }

        const newHeaderMeta = {
            activeKey: key,
            sortOrder,
        };

        const newData = Table.getSortedData(headers, data, newHeaderMeta);

        this.setState({
            headerMeta: newHeaderMeta,
            data: newData,
        });
    }

    render() {
        const { keyExtractor, hideHeaders, emptyRenderer } = this.props;
        const headers = this.headers;
        const { headerMeta, data } = this.state;

        return (
            <table styleName="table">
                {
                    !hideHeaders &&
                    <Header
                        headers={headers}
                        headerMeta={headerMeta}
                        onClick={this.onHeaderClick}
                    />
                }
                {
                    data.length > 0
                        ? <Body
                            headers={headers}
                            keyExtractor={keyExtractor}
                            data={data}
                            emptyRenderer={emptyRenderer}
                        />
                        : <tbody>
                            <tr>
                                <td colSpan={headers.length} styleName="empty-data">
                                    {emptyRenderer()}
                                </td>
                            </tr>
                        </tbody>
                }
            </table>
        );
    }
}
