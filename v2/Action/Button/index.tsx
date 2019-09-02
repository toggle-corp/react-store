import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import Icon from '../../../components/General/Icon';

/*
eslint css-modules/no-unused-class: [
    1,
    {
        markAsUsed: [
            'button-default', 'button-accent', 'button-primary', 'button-danger',
            'button-warning', 'button-success'
        ],
        camelCase: true
    }
]
*/
import styles from './styles.scss';

/*
# Breaking Change
- Removed PrimaryButton, DangerButton, SuccessButton, WarningButton, AccentButton components
- Removed changeDelay prop
- onClickParams doesn't resolve functions by default

# Todo
- Remove smallHorizontalPadding and smallVerticalPadding
- Introduce small, medium and large buttons
*/


type ButtonType = 'button-default' | 'button-accent' | 'button-primary' | 'button-danger' | 'button-success' | 'button-warning';
type RawButtonType = 'button' | 'submit' | 'reset';

export interface Props<T> extends Omit<React.HTMLProps<HTMLButtonElement>, 'onClick' | 'ref'> {
    buttonType?: ButtonType;
    children?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    iconName?: string;
    onClick: (value: { event: React.MouseEvent; params?: T }) => void;
    onClickParams?: T;
    pending?: boolean;
    smallHorizontalPadding?: boolean;
    smallVerticalPadding?: boolean;
    transparent: boolean;
    type?: RawButtonType;
}

function Button<T>(props: Props<T>) {
    const {
        buttonType,
        children,
        className: classNameFromProps,
        disabled,
        iconName,
        pending,
        smallHorizontalPadding,
        smallVerticalPadding,
        transparent,
        type,
        onClick,
        onClickParams,
        ...otherProps
    } = props;

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            onClick({
                event: e,
                params: onClickParams,
            });
        },
        [
            onClick,
            onClickParams,
        ],
    );

    const buttonClassName = _cs(
        classNameFromProps,
        'button',
        styles.button,
        buttonType,
        buttonType && styles[buttonType],
        iconName && !!children && 'with-icon-and-children',
        iconName && !!children && styles.withIconAndChildren,
        smallHorizontalPadding && 'small-horizontal-padding',
        smallHorizontalPadding && styles.smallHorizontalPadding,
        smallVerticalPadding && 'small-vertical-padding',
        smallVerticalPadding && styles.smallVerticalPadding,
        transparent && 'transparent',
        transparent && styles.transparent,
    );

    const iconClassName = _cs(
        'icon',
        styles.icon,
        pending && styles.pendingIcon,
    );

    return (
        // eslint-disable-next-line react/button-has-type
        <button
            className={buttonClassName}
            disabled={disabled || pending}
            onClick={handleClick}
            type={type}
            {...otherProps}
        >
            <Icon
                name={pending ? 'spinner' : iconName}
                className={iconClassName}
            />
            { children }
        </button>
    );
}
Button.defaultProps = {
    buttonType: 'button-default' as ButtonType,
    disabled: false,
    pending: false,
    smallHorizontalPadding: false,
    smallVerticalPadding: false,
    transparent: false,
    type: 'button',
};

export default Button;
