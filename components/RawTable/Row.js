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

    dataModifier: PropTypes.func,

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
    dataModifier: undefined,
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
            hoverable,
            highlighted,
            className,
        } = props;

        // default className for global override
        classNames.push('row');

        // className provided by parent (through styleName)
        classNames.push(className);

        if (hoverable) {
            classNames.push('hoverable');
        }

        if (highlighted) {
            classNames.push('highlighted');
        }

        return classNames.join(' ');
    }

    getStyleName = (props) => {
        const styleNames = [];
        const {
            hoverable,
            highlighted,
        } = props;

        // default className for global override
        styleNames.push('row');

        if (hoverable) {
            styleNames.push('hoverable');
        }

        if (highlighted) {
            styleNames.push('highlighted');
        }

        return styleNames.join(' ');
    }

    getCell = (header) => {
        const {
            areCellsHoverable,
            dataModifier,
            highlightCellKey,
            rowData,
        } = this.props;

        let data = rowData[header.key];

        if (dataModifier) {
            data = dataModifier(rowData, header.key);
        }

        return (
            <Cell
                key={header.key}
                uniqueKey={header.key}
                onClick={this.handleCellClick}
                hoverable={areCellsHoverable}
                highlighted={isEqualAndTruthy(header.key, highlightCellKey)}
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
        console.log('Rendering Row');

        const {
            headers,
        } = this.props;

        return (
            <tr
                className={this.state.className}
                styleName={this.state.styleName}
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
