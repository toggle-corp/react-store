import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(
            PropTypes.node,
        ),
    ]),

    className: PropTypes.string,

    highlighted: PropTypes.bool,

    columnHighlighted: PropTypes.bool,

    hoverable: PropTypes.bool,

    onClick: PropTypes.func,

    uniqueKey: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
    highlighted: false,
    columnHighlighted: false,
    hoverable: false,
    onClick: undefined,
    children: '-',
};

export default class Cell extends React.PureComponent {
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
            columnHighlighted,
        } = props;

        classNames.push('cell');
        classNames.push(styles.cell);

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

        if (columnHighlighted) {
            classNames.push('column-highlighted');
            classNames.push(styles['column-highlighted']);
        }

        return classNames.join(' ');
    }

    handleClick = (e) => {
        const {
            onClick,
            uniqueKey,
        } = this.props;

        if (onClick) {
            onClick(uniqueKey, e);
        }
    }

    render() {
        return (
            <td
                className={this.state.className}
                role="gridcell"
                onClick={this.handleClick}
            >
                { this.props.children }
            </td>
        );
    }
}
