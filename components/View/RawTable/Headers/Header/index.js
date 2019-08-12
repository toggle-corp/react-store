import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(PropTypes.node),
    ]).isRequired,
    className: PropTypes.string,
    highlighted: PropTypes.bool,
    hoverable: PropTypes.bool,
    onClick: PropTypes.func,
    uniqueKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    columnHighlighted: PropTypes.bool,
};

const defaultProps = {
    columnHighlighted: false,
    className: '',
    highlighted: false,
    hoverable: false,
    onClick: undefined,
};

export default class Header extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    getClassName = (className, highlighted, columnHighlighted, hoverable, uniqueKey) => {
        const classNames = [];

        // default className for global override
        classNames.push('header');
        classNames.push(styles.header);

        // className provided by parent (through className)
        classNames.push(className);

        if (hoverable) {
            classNames.push('hoverable');
            // classNames.push(styles.hoverable);
        }

        if (highlighted) {
            classNames.push('highlighted');
            // classNames.push(styles.highlighted);
        }

        if (columnHighlighted) {
            classNames.push('column-highlighted');
            classNames.push(styles.columnHighlighted);
        }

        if (uniqueKey) {
            classNames.push(uniqueKey);
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
        const {
            className,
            highlighted,
            hoverable,
            uniqueKey,
            children,
            columnHighlighted,
        } = this.props;

        const thClassName = this.getClassName(
            className, highlighted, columnHighlighted, hoverable, uniqueKey,
        );

        return (
            <th
                className={thClassName}
                role="gridcell"
                onClick={this.handleClick}
            >
                { children }
            </th>
        );
    }
}
