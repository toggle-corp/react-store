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

    dataModifier: PropTypes.func,

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

    onClick: PropTypes.func,
};

const defaultProps = {
    areCellsHoverable: false,
    areRowsHoverable: false,
    className: '',
    dataModifier: undefined,
    highlightCellKey: {},
    highlightRowKey: undefined,
    highlighted: false,
    hoverable: false,
    onClick: undefined,
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

    getRow = (rowData) => {
        const {
            areCellsHoverable,
            areRowsHoverable,
            dataModifier,
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
                dataModifier={dataModifier}
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

    handleRowClick = (rowKey, cellKey, e) => {
        const { onClick } = this.props;

        if (onClick) {
            onClick(rowKey, cellKey, e);
        }
    }

    render() {
        console.log('Rendering Body');

        const {
            data,
        } = this.props;

        return (
            <tbody
                className={this.state.className}
                styleName={this.state.styleName}
            >
                {
                    data.map(rowData => (
                        this.getRow(rowData)
                    ))
                }
            </tbody>
        );
    }
}
