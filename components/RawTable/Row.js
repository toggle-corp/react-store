import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import Cell from './Cell';

import {
    isEqualAndTruthy,
} from '../../utils/common';

import styles from './styles.scss';

const propTypes = {
    areCellsHoverable: PropTypes.bool,

    className: PropTypes.string,

    headers: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string,
        }),
    ).isRequired,

    highlightCellKey: PropTypes.bool,

    highlighted: PropTypes.bool,

    hoverable: PropTypes.bool,

    onClick: PropTypes.func,

    rowData: PropTypes.shape({
        dummy: PropTypes.string,
    }).isRequired,

    uniqueKey: PropTypes.string.isRequired,
};

const defaultProps = {
    areCellsHoverable: false,
    className: '',
    highlightCellKey: undefined,
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
        classNames.push('table-row');

        // className provided by parent (through styleName)
        classNames.push(className);

        if (hoverable) {
            classNames.push('hoverable');
        }

        if (highlighted) {
            classNames.push('highlighted');
        }
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
            areCellsHoverable,
            highlightCellKey,
            rowData,
        } = this.props;

        return (
            <tr className={this.state.className}>
                {
                    headers.map(header => (
                        <Cell
                            key={header.key}
                            uniqueKey={header.key}
                            onClick={this.handleCellClick}
                            hoverable={areCellsHoverable}
                            highlighted={isEqualAndTruthy(header.key, highlightCellKey)}
                        >
                            { rowData[header.key] }
                        </Cell>
                    ))
                }
            </tr>
        );
    }
}
