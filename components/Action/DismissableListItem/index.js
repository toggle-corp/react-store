import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';

import { _cs } from '@togglecorp/fujs';

import ListItem, { DefaultIcon } from '../../View/ListItem';
import DangerButton from '../Button/DangerButton';
import WarningButton from '../Button/WarningButton';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    labelClassName: PropTypes.string,
    iconsClassName: PropTypes.string,
    actionsClassName: PropTypes.string,
    itemKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    actions: PropTypes.node,

    onEdit: PropTypes.func,
    onDismiss: PropTypes.func,
    color: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]),
};

const defaultProps = {
    className: '',
    labelClassName: undefined,
    iconsClassName: undefined,
    actionsClassName: undefined,

    itemKey: undefined,
    disabled: false,
    readOnly: false,
    onEdit: undefined,
    onDismiss: undefined,
    color: undefined,
    value: undefined,
    actions: undefined,
};

function DismissableListItem(props) {
    const {
        disabled,
        readOnly,
        className,
        labelClassName,
        iconsClassName,
        actionsClassName,
        value,

        color,
        itemKey,
        onDismiss,
        onEdit,

        actions,
    } = props;

    const handleEditButtonClick = useCallback(
        () => {
            if (onEdit) {
                onEdit(itemKey);
            }
        },
        [onEdit, itemKey],
    );

    const handleDismissButtonClick = useCallback(
        () => {
            onDismiss(itemKey);
        },
        [onDismiss, itemKey],
    );

    return (
        <ListItem
            className={_cs(className, styles.dismissableListItem)}
            labelClassName={labelClassName}
            iconsClassName={iconsClassName}
            actionsClassName={actionsClassName}
            icons={(
                <DefaultIcon
                    color={color}
                />
            )}
            actions={
                !readOnly && (
                    <>
                        {actions}
                        {onEdit && !disabled && (
                            <WarningButton
                                className={styles.editButton}
                                onClick={handleEditButtonClick}
                                transparent
                                iconName="edit"
                                smallVerticalPadding
                                smallHorizontalPadding
                            />
                        )}
                        {onDismiss && !disabled && (
                            <DangerButton
                                className={styles.dismissButton}
                                onClick={handleDismissButtonClick}
                                transparent
                                iconName="close"
                                smallVerticalPadding
                                smallHorizontalPadding
                            />
                        )}
                    </>
                )
            }
            value={value}
        />
    );
}
DismissableListItem.defaultProps = defaultProps;
DismissableListItem.propTypes = propTypes;

export default memo(DismissableListItem);
