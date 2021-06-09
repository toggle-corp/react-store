import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

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
    disabled: PropTypes.bool.isRequired,
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

    handleClick = (e) => {
        const {
            onClick,
            uniqueKey,
            disabled,
        } = this.props;

        if (disabled) {
            return;
        }

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
            disabled,
        } = this.props;

        const thClassName = _cs(
            'header',
            styles.header,
            className,
            hoverable && 'hoverable',
            highlighted && 'highlighted',
            columnHighlighted && 'column-highlighted',
            uniqueKey,
            disabled && styles.disabled,
        );

        const props = {
            hoverable,
            highlighted,
            uniqueKey,
            disabled,
        };

        return (
            <th
                className={thClassName}
                role="gridcell"
                onClick={this.handleClick}
            >
                { React.cloneElement(children, props)}
            </th>
        );
    }
}
