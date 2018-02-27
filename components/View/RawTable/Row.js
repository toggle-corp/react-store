import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { isEqualAndTruthy } from '../../../utils/common';
import List from '../List';

import Cell from './Cell';
import styles from './styles.scss';

const propTypeKey = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
]);

const propTypes = {
    areCellsHoverable: PropTypes.bool,

    className: PropTypes.string,

    dataModifier: PropTypes.func,

    headersOrder: PropTypes.arrayOf(PropTypes.string).isRequired,

    highlightCellKey: propTypeKey,
    highlightColumnKey: propTypeKey,
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

        // className provided by parent (through className)
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

    handleCellClick = (key, e) => {
        const {
            onClick,
            uniqueKey,
        } = this.props;

        if (onClick) {
            onClick(uniqueKey, key, e);
        }
    }

    keyExtractor = header => header;

    renderCell = (key) => {
        const {
            areCellsHoverable,
            dataModifier,
            highlightCellKey,
            highlightColumnKey,
            rowData,
        } = this.props;

        const data = dataModifier
            ? dataModifier(rowData, key) // FIXME: can be optimized
            : rowData[key];

        return (
            <Cell
                key={key}
                uniqueKey={key}
                onClick={this.handleCellClick}
                hoverable={areCellsHoverable}
                highlighted={isEqualAndTruthy(key, highlightCellKey)}
                columnHighlighted={isEqualAndTruthy(key, highlightColumnKey)}
            >
                { data }
            </Cell>
        );
    }

    render() {
        const { headersOrder } = this.props;
        const className = this.getClassName(this.props);

        return (
            <tr className={className}>
                <List
                    data={headersOrder}
                    keyExtractor={this.keyExtractor}
                    modifier={this.renderCell}
                />
            </tr>
        );
    }
}
