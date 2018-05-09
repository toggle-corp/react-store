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
    uniqueKey: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
    highlighted: false,
    hoverable: false,
    onClick: undefined,
};

export default class Header extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = (className, highlighted, hoverable, uniqueKey) => {
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
        } = this.props;

        const thClassName = this.getClassName(className, highlighted, hoverable, uniqueKey);

        return (
            <th
                className={thClassName}
                role="gridcell"
                onClick={this.handleClick}
            >
                { this.props.children }
            </th>
        );
    }
}
