import React from 'react';
import PropTypes from 'prop-types';
import ListItem from '../../View/ListItem';
import DangerButton from '../../Action/Button/DangerButton';
import iconNames from '../../../constants/iconNames';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    onDismiss: PropTypes.func.isRequired,
    itemKey: PropTypes.string,
    disabled: PropTypes.bool,
};

const defaultProps = {
    className: '',
    itemKey: undefined,
    disabled: false,
};

export default class DismissableListItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

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
            onDismiss, // eslint-disable-line no-unused-vars
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
                <DangerButton
                    disabled={disabled}
                    className={styles.dismissButton}
                    onClick={this.handleDismissButtonClick}
                    transparent
                    iconName={iconNames.close}
                    smallVerticalPadding
                    smallHorizontalPadding
                />
            </div>
        );
    }
}
