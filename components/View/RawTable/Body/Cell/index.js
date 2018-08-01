import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(PropTypes.node),
    ]),
    className: PropTypes.string,
    highlighted: PropTypes.bool,
    columnHighlighted: PropTypes.bool,
    hoverable: PropTypes.bool,
    onClick: PropTypes.func,
    onHover: PropTypes.func,
    onHoverOut: PropTypes.func,
    uniqueKey: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
    highlighted: false,
    columnHighlighted: false,
    hoverable: false,
    onClick: undefined,
    onHover: undefined,
    onHoverOut: undefined,
    children: '-',
};

export default class Cell extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = (hoverable, highlighted, className, columnHighlighted, uniqueKey) => {
        const classNames = [];

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

    handleHover = (e) => {
        const {
            onHover,
            uniqueKey,
        } = this.props;

        if (onHover) {
            onHover(uniqueKey, e);
        }
    }

    render() {
        const {
            hoverable,
            highlighted,
            className,
            columnHighlighted,
            uniqueKey,
            onHoverOut,
        } = this.props;

        const tdClassName = this.getClassName(
            hoverable,
            highlighted,
            className,
            columnHighlighted,
            uniqueKey,
        );

        return (
            <td
                className={tdClassName}
                role="gridcell"
                onClick={this.handleClick}
                onFocus={() => {}}
                onBlur={() => {}}
                onMouseOver={this.handleHover}
                onMouseOut={onHoverOut}
            >
                { this.props.children }
            </td>
        );
    }
}
