import PropTypes from 'prop-types';
import React from 'react';

import { _cs } from '@togglecorp/fujs';

import Icon from '../../General/Icon';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    label: PropTypes.node,
    sortOrder: PropTypes.string,
    sortable: PropTypes.bool,
    disabled: PropTypes.bool,
};

const defaultProps = {
    className: '',
    label: '',
    sortOrder: undefined,
    sortable: false,
    disabled: false,
};

export default class TableHeader extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    render() {
        const {
            label,
            sortOrder,
            sortable,
            className,
            disabled,
        } = this.props;

        const divClassName = _cs(
            'table-header',
            className,
            styles.tableHeader,
            sortable && styles.sortable,
            sortable && sortOrder && styles.active,
            disabled && styles.disabled,
        );

        const iconClassName = _cs(
            styles.icon,
        );

        const iconName = (
            (sortOrder === 'asc' && 'sortAscending')
            || (sortOrder === 'dsc' && 'sortDescending')
            || 'sort'
        );

        return (
            <div className={divClassName}>
                { sortable && (
                    <Icon
                        name={iconName}
                        className={iconClassName}
                    />
                )}
                {label}
            </div>
        );
    }
}
