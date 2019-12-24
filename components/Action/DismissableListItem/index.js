import React from 'react';
import PropTypes from 'prop-types';
import ListItem from '../../View/ListItem';
import DangerButton from '../Button/DangerButton';
import WarningButton from '../Button/WarningButton';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    onDismiss: PropTypes.func,
    onEdit: PropTypes.func,
    itemKey: PropTypes.string,
    disabled: PropTypes.bool,
};

const defaultProps = {
    className: '',
    itemKey: undefined,
    disabled: false,
    onEdit: undefined,
    onDismiss: undefined,
};

export default class DismissableListItem extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    handleEditButtonClick = () => {
        const {
            onEdit,
            itemKey,
        } = this.props;

        if (onEdit) {
            onEdit(itemKey);
        }
    }

    handleDismissButtonClick = () => {
        const {
            onDismiss,
            itemKey,
        } = this.props;

        onDismiss(itemKey);
    }

    render() {
        const {
            className: classNameFromProps,
            onDismiss,
            onEdit,
            disabled,

            ...otherProps
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.dismissableListItem}
        `;

        return (
            <div className={className}>
                <ListItem
                    className={styles.listItem}
                    {...otherProps}
                />
                <div className={styles.actions}>
                    { onEdit && (
                        <WarningButton
                            disabled={disabled}
                            className={styles.editButton}
                            onClick={this.handleEditButtonClick}
                            transparent
                            iconName="edit"
                            smallVerticalPadding
                            smallHorizontalPadding
                        />
                    )}
                    { onDismiss && (
                        <DangerButton
                            disabled={disabled}
                            className={styles.dismissButton}
                            onClick={this.handleDismissButtonClick}
                            transparent
                            iconName="close"
                            smallVerticalPadding
                            smallHorizontalPadding
                        />
                    )}
                </div>
            </div>
        );
    }
}
