import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import ListItem from '../../View/ListItem';
import DangerButton from '../Button/DangerButton';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    listItemClassName: PropTypes.string,
    onDismiss: PropTypes.func.isRequired,
    itemKey: PropTypes.string,
    disabled: PropTypes.bool,
    // NOTE: Supports type normal and consize
    type: PropTypes.string,
};

const defaultProps = {
    className: undefined,
    listItemClassName: undefined,
    itemKey: undefined,
    disabled: false,
    type: 'normal',
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
            onDismiss, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            disabled,
            listItemClassName,
            type,

            ...otherProps
        } = this.props;

        return (
            <div
                className={_cs(
                    classNameFromProps,
                    styles.dismissableListItem,
                    type === 'consize' && styles.consize,
                )}
            >
                <ListItem
                    className={_cs(styles.listItem, listItemClassName)}
                    {...otherProps}
                />
                <DangerButton
                    disabled={disabled}
                    className={styles.dismissButton}
                    onClick={this.handleDismissButtonClick}
                    transparent
                    iconName="close"
                    smallVerticalPadding
                    smallHorizontalPadding
                />
            </div>
        );
    }
}
