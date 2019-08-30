import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { FaramActionElement } from '@togglecorp/faram';

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

type ButtonType = 'button-default' | 'button-accent' | 'button-primary' | 'button-danger' | 'button-success' | 'button-warning';
type RawButtonType = 'button' | 'submit' | 'reset';

export interface Props<T> extends Omit<React.HTMLProps<HTMLButtonElement>, 'onClick' | 'ref'> {
    buttonType?: ButtonType;
    changeDelay?: number;
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

/**
 * Basic button component
 */
export default class Button<T> extends React.PureComponent<Props<T>> {
    public static defaultProps = {
        buttonType: 'button-default' as ButtonType,
        changeDelay: 0,
        disabled: false,
        pending: false,
        smallHorizontalPadding: false,
        smallVerticalPadding: false,
        transparent: false,
        type: 'button' as RawButtonType,
    };

    public componentWillUnmount() {
        if (this.changeTimeout) {
            window.clearTimeout(this.changeTimeout);
        }
    }

    private changeTimeout?: number;

    private handleClick = (e: React.MouseEvent) => {
        window.clearTimeout(this.changeTimeout);
        const {
            onClick,
            onClickParams,
            changeDelay,
        } = this.props;

        this.changeTimeout = window.setTimeout(
            () => {
                onClick({
                    event: e,
                    params: onClickParams,
                });
            },
            changeDelay,
        );
    }

    public render() {
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
            changeDelay, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            onClick, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            onClickParams, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            ...otherProps
        } = this.props;

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
                onClick={this.handleClick}
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
}


export const FaramButton = FaramActionElement(Button);
