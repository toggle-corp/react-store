import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import Row from './Row';

import {
    isEqualAndTruthy,
} from '../../utils/common';

import styles from './styles.scss';

const propTypes = {
    areCellsHoverable: PropTypes.bool,

    areRowsHoverable: PropTypes.bool,

    className: PropTypes.string,

    data: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string,
        }),
    ).isRequired,

    headers: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string,
        }),
    ).isRequired,

    highlightCellKey: PropTypes.shape({
        columnKey: PropTypes.string,
        rowKey: PropTypes.string,
    }),

    highlightRowKey: PropTypes.string,

    /**
     * keyExtractor is used to get a unique key associated with rowData
     */
    keyExtractor: PropTypes.func.isRequired,
};

const defaultProps = {
    areCellsHoverable: false,
    areRowsHoverable: false,
    className: '',
    highlightCellKey: {},
    highlightRowKey: undefined,
    highlighted: false,
    hoverable: false,
};


@CSSModules(styles, { allowMultiple: true })
export default class Body extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const className = this.getClassName(props);

        this.state = {
            className,
        };
    }

    componentWillReceiveProps(nextProps) {
        const className = this.getClassName(nextProps);

        this.setState({
            className,
        });
    }

    getClassName = (props) => {
        const classNames = [];
        const {
            className,
        } = props;

        // default className for global override
        classNames.push('table-body');

        // className provided by parent (through styleName)
        classNames.push(className);
    }

    getRow = (rowData) => {
        const {
            areCellsHoverable,
            areRowsHoverable,
            headers,
            highlightCellKey,
            highlightRowKey,
            keyExtractor,
        } = this.props;

        const key = keyExtractor(rowData);

        let cellKey;
        if (highlightCellKey.rowKey === key) {
            cellKey = highlightCellKey.columnKey;
        }

        return (
            <Row
                areCellsHoverable={areCellsHoverable}
                headers={headers}
                highlighted={isEqualAndTruthy(key, highlightRowKey)}
                highlightCellKey={cellKey}
                hoverable={areRowsHoverable}
                key={key}
                onClick={this.handleRowClick}
                rowData={rowData}
                uniqueKey={key}
            />
        );
    }

    handleRowClick = (rowKey, cellKey) => {
        console.log(rowKey, cellKey);
    }

    render() {
        const {
            data,
        } = this.props;

        return (
            <tbody className={this.state.className}>
                {
                    data.map(rowData => (
                        this.getRow(rowData)
                    ))
                }
            </tbody>
        );
    }
}
