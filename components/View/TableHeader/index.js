import PropTypes from 'prop-types';
import React from 'react';

import { iconNames } from '../../../constants';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    label: PropTypes.node,
    sortOrder: PropTypes.string,
    sortable: PropTypes.bool,
};

const defaultProps = {
    className: '',
    label: '',
    sortOrder: undefined,
    sortable: false,
};

export default class TableHeader extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = (sortOrder, sortable, className) => {
        const classNames = [];

        classNames.push(className);
        classNames.push(styles.tableHeader);

        if (sortable) {
            classNames.push(styles.sortable);
            if (sortOrder) {
                classNames.push(styles.active);
            }
        }
        return classNames.join(' ');
    }

    getIconClassName = (sortOrder, sortable) => {
        const classNames = [];
        classNames.push(styles.icon);

        if (sortable) {
            if (sortOrder === 'asc') {
                classNames.push(iconNames.sortAscending);
            } else if (sortOrder === 'dsc') {
                classNames.push(iconNames.sortDescending);
            }
            classNames.push(iconNames.sort);
        }
        return classNames.join(' ');
    }

    render() {
        const {
            label,
            sortOrder,
            sortable,
            className,
        } = this.props;

        const divClassName = this.getClassName(sortOrder, sortable, className);
        const iconClassName = this.getIconClassName(sortOrder, sortable);

        return (
            <div className={divClassName}>
                <span className={iconClassName} />
                {label}
            </div>
        );
    }
}
