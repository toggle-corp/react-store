import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';

import { _cs } from '@togglecorp/fujs';

import ListItem, { DefaultIcon } from '../../View/ListItem';
import DangerButton from '../Button/DangerButton';
import WarningButton from '../Button/WarningButton';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    itemKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,

    onEdit: PropTypes.func,
    onDismiss: PropTypes.func,
    color: PropTypes.string,
    value: PropTypes.string,
};

const defaultProps = {
    className: '',
    itemKey: undefined,
    disabled: false,
    readOnly: false,
    onEdit: undefined,
    onDismiss: undefined,
    color: undefined,
    value: undefined,
};

function DismissableListItem(props) {
    const {
        disabled,
        readOnly,
        className,
        value,

        color,
        itemKey,
        onDismiss,
        onEdit,
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
            icons={(
                <DefaultIcon
                    color={color}
                />
            )}
            actions={
                !readOnly && (
                    <>
                        {onEdit && (
                            <WarningButton
                                disabled={disabled}
                                className={styles.editButton}
                                onClick={handleEditButtonClick}
                                transparent
                                iconName="edit"
                                smallVerticalPadding
                                smallHorizontalPadding
                            />
                        )}
                        {onDismiss && (
                            <DangerButton
                                disabled={disabled}
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
