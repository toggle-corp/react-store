import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import DangerButton from '../../Action/Button/DangerButton';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    value: PropTypes.string,
    singleLine: PropTypes.bool,
    onRemoveButtonClick: PropTypes.func,
    itemKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    disabled: PropTypes.bool,
};

const defaultProps = {
    className: undefined,
    value: '',
    disabled: false,
    singleLine: false,
    onRemoveButtonClick: () => {},
};

export default class RemovableListItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleRemoveButtonClick = (e) => {
        const {
            onRemoveButtonClick,
            itemKey,
        } = this.props;

        if (onRemoveButtonClick) {
            onRemoveButtonClick(itemKey, e);
        }
    }

    render() {
        const {
            className,
            value,
            singleLine,
            disabled,
        } = this.props;

        return (
            <div className={_cs(
                className,
                styles.removableListItem,
                'removable-list-item',
                singleLine && styles.singleLine,
                singleLine && 'removable-list-item-single-line',
            )}
            >
                <div
                    className={styles.label}
                    title={value}
                >
                    { value }
                </div>
                <DangerButton
                    className={styles.removeButton}
                    iconName="close"
                    onClick={this.handleRemoveButtonClick}
                    smallHorizontalPadding
                    smallVerticalPadding
                    transparent
                    disabled={disabled}
                />
            </div>
        );
    }
}
