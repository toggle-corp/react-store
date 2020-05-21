import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

export function DefaultIcon(props) {
    const {
        color,
        title,
    } = props;

    const style = {
        backgroundColor: color,
    };

    return (
        <div
            style={style}
            title={title}
            className={styles.marker}
        />
    );
}
DefaultIcon.propTypes = {
    color: PropTypes.string,
    title: PropTypes.string,
};
DefaultIcon.defaultProps = {
    color: 'var(--color-text-disabled)',
    title: undefined,
};

function ListItem(props) {
    const {
        value,
        actions,
        icons,

        className,
        iconsClassName,
        labelClassName,
        actionsClassName,
    } = props;

    const finalIcons = icons === undefined
        ? <DefaultIcon />
        : icons;

    return (
        <div className={_cs(styles.listItem, className)}>
            {finalIcons && (
                <div className={_cs(styles.icons, iconsClassName)}>
                    {finalIcons}
                </div>
            )}
            <div className={_cs(styles.label, labelClassName)}>
                {value}
            </div>
            {actions && (
                <div className={_cs(styles.actions, actionsClassName)}>
                    {actions}
                </div>
            )}
        </div>
    );
}

ListItem.defaultProps = {
    className: undefined,
    iconsClassName: undefined,
    labelClassName: undefined,
    actionsClassName: undefined,

    value: undefined,
    icons: undefined,
    actions: undefined,
};

ListItem.propTypes = {
    className: PropTypes.string,
    iconsClassName: PropTypes.string,
    labelClassName: PropTypes.string,
    actionsClassName: PropTypes.string,

    value: PropTypes.node,
    icons: PropTypes.node,
    actions: PropTypes.node,
};

export default memo(ListItem);
