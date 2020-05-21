import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

export function DefaultIcon(props) {
    const {
        color,
    } = props;

    const style = {
        backgroundColor: color,
    };

    return (
        <div
            style={style}
            className={styles.marker}
        />
    );
}
DefaultIcon.propTypes = {
    color: PropTypes.string,
};
DefaultIcon.defaultProps = {
    color: 'var(--color-text-disabled)',
};

function ListItem(props) {
    const {
        value,

        className,
        actions,
        icons,
    } = props;

    const finalIcons = icons === undefined
        ? <DefaultIcon />
        : icons;

    return (
        <div className={_cs(styles.listItem, className)}>
            {finalIcons && (
                <div className={styles.icons}>
                    {finalIcons}
                </div>
            )}
            <div className={styles.label}>
                {value}
            </div>
            {actions && (
                <div className={styles.actions}>
                    {actions}
                </div>
            )}
        </div>
    );
}

ListItem.defaultProps = {
    className: undefined,
    value: undefined,

    icons: undefined,
    actions: undefined,
};

ListItem.propTypes = {
    className: PropTypes.string,
    value: PropTypes.node,

    icons: PropTypes.node,
    actions: PropTypes.node,
};

export default memo(ListItem);
