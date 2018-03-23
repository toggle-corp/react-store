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

    getClassName = (props) => {
        const classNames = [];
        const {
            hoverable,
            highlighted,
            className,
            columnHighlighted,
            uniqueKey,
        } = props;

        classNames.push(uniqueKey);
        classNames.push('cell');

        classNames.push(styles.cell);

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

        if (columnHighlighted) {
            classNames.push('column-highlighted');
            classNames.push(styles.columnHighlighted);
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
        const className = this.getClassName(this.props);

        return (
            <td
                className={className}
                role="gridcell"
                onClick={this.handleClick}
            >
                { this.props.children }
            </td>
        );
    }
}
