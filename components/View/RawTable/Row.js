import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import Cell from './Cell';

import {
    isEqualAndTruthy,
} from '../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    areCellsHoverable: PropTypes.bool,

    className: PropTypes.string,

    dataModifier: PropTypes.func,

    headers: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string,
        }),
    ).isRequired,

    highlightCellKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),

    highlightColumnKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),

    highlighted: PropTypes.bool,

    hoverable: PropTypes.bool,

    onClick: PropTypes.func,

    rowData: PropTypes.shape({
        dummy: PropTypes.string,
    }).isRequired,

    uniqueKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
};

const defaultProps = {
    areCellsHoverable: false,
    className: '',
    dataModifier: undefined,
    highlightCellKey: undefined,
    highlightColumnKey: undefined,
    highlighted: false,
    hoverable: false,
    onClick: undefined,
};


@CSSModules(styles, { allowMultiple: true })
export default class Row extends React.PureComponent {
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
            hoverable,
            highlighted,
            className,
        } = props;

        // default className for global override
        classNames.push('row');
        classNames.push(styles.row);

        // className provided by parent (through styleName)
        classNames.push(className);

        if (hoverable) {
            classNames.push('hoverable');
            classNames.push(styles.hoverable);
        }

        if (highlighted) {
            classNames.push('highlighted');
            classNames.push(styles.highlighted);
        }

        return classNames.join(' ');
    }

    getCell = (header) => {
        const {
            areCellsHoverable,
            dataModifier,
            highlightCellKey,
            highlightColumnKey,
            rowData,
        } = this.props;

        let data = rowData[header.key];

        if (dataModifier) {
            data = dataModifier(rowData, header.key);
        }

        // Un-necessary cell re-render because of dataModifier
        return (
            <Cell
                key={header.key}
                uniqueKey={header.key}
                onClick={this.handleCellClick}
                hoverable={areCellsHoverable}
                highlighted={isEqualAndTruthy(header.key, highlightCellKey)}
                columnHighlighted={isEqualAndTruthy(header.key, highlightColumnKey)}
            >
                { data }
            </Cell>
        );
    }

    handleCellClick = (key, e) => {
        const {
            onClick,
            uniqueKey,
        } = this.props;

        if (onClick) {
            onClick(uniqueKey, key, e);
        }
    }

    render() {
        const {
            headers,
        } = this.props;

        return (
            <tr
                className={this.state.className}
            >
                {
                    headers.map(header => (
                        this.getCell(header)
                    ))
                }
            </tr>
        );
    }
}
