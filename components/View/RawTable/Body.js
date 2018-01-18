import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import List from '../List';
import Row from './Row';

import {
    isEqualAndTruthy,
} from '../../../utils/common';

import styles from './styles.scss';

const propTypeKey = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
]);

const propTypes = {
    areCellsHoverable: PropTypes.bool,

    areRowsHoverable: PropTypes.bool,

    className: PropTypes.string,

    data: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number,
            ]),
        }),
    ).isRequired,

    dataModifier: PropTypes.func,

    expandRowId: propTypeKey,

    expandedRowModifier: PropTypes.func,

    headers: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string,
        }),
    ).isRequired,

    highlightCellKey: PropTypes.shape({
        columnKey: propTypeKey,
        rowKey: propTypeKey,
    }),

    highlightRowKey: propTypeKey,

    highlightColumnKey: propTypeKey,

    /**
     * keyExtractor is used to get a unique key associated with rowData
     */
    keyExtractor: PropTypes.func.isRequired,

    onClick: PropTypes.func,
};

const defaultProps = {
    areCellsHoverable: false,
    areRowsHoverable: false,
    className: '',
    dataModifier: undefined,
    highlightCellKey: {},
    highlightRowKey: undefined,
    highlightColumnKey: undefined,
    highlighted: false,
    hoverable: false,
    onClick: undefined,
    expandRowId: undefined,
    expandedRowModifier: undefined,
};


@CSSModules(styles, { allowMultiple: true })
export default class Body extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const className = this.getClassName(props);
        const styleName = this.getStyleName(props);

        this.state = {
            className,
            styleName,
        };
    }

    componentWillReceiveProps(nextProps) {
        const className = this.getClassName(nextProps);
        const styleName = this.getStyleName(nextProps);

        this.setState({
            className,
            styleName,
        });
    }

    getClassName = (props) => {
        const classNames = [];
        const {
            className,
        } = props;

        // default className for global override
        classNames.push('body');

        // className provided by parent (through styleName)
        classNames.push(className);

        return classNames.join(' ');
    }

    getStyleName = () => ('body')

    getRowKey = (rowData) => {
        const { keyExtractor } = this.props;
        const key = keyExtractor(rowData);
        return key;
    }

    getRow = (key, rowData) => {
        const {
            areCellsHoverable,
            areRowsHoverable,
            dataModifier,
            headers,
            highlightCellKey,
            highlightColumnKey,
            highlightRowKey,
            expandRowId,
            expandedRowModifier,
        } = this.props;

        let cellKey;
        if (highlightCellKey.rowKey === key) {
            cellKey = highlightCellKey.columnKey;
        }

        return ([
            <Row
                areCellsHoverable={areCellsHoverable}
                dataModifier={dataModifier}
                headers={headers}
                highlightCellKey={cellKey}
                highlightColumnKey={highlightColumnKey}
                highlighted={isEqualAndTruthy(key, highlightRowKey)}
                hoverable={areRowsHoverable}
                key={key}
                onClick={this.handleRowClick}
                rowData={rowData}
                uniqueKey={key}
            />,
            (expandRowId && expandRowId === key) ? (
                <tr
                    className={`${styles.row} expanded-row row`}
                    key={`${key}-expanded`}
                >
                    <td colSpan={headers.length} >
                        {expandedRowModifier &&
                            expandedRowModifier(rowData)
                        }
                    </td>
                </tr>
            ) : null,
        ]);
    }

    handleRowClick = (rowKey, cellKey, e) => {
        const { onClick } = this.props;
        if (onClick) {
            onClick(rowKey, cellKey, e);
        }
    }

    render() {
        const { data } = this.props;
        return (
            <tbody
                className={this.state.className}
                styleName={this.state.styleName}
            >
                <List
                    data={data}
                    keyExtractor={this.getRowKey}
                    modifier={this.getRow}
                />
            </tbody>
        );
    }
}
