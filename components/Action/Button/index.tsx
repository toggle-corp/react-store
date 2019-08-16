import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { FaramActionElement } from '@togglecorp/faram';

import Icon from '../../General/Icon';

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
    className?: string;
    children?: React.ReactNode;
    iconName?: string;
    onClickParams?: T;

    type?: RawButtonType;
    pending?: boolean;
    buttonType?: ButtonType;
    transparent: boolean;
    smallHorizontalPadding?: boolean;
    smallVerticalPadding?: boolean;
    // NOTE: these props represent the Clickable interface
    disabled?: boolean;
    onClick: (value: { event: React.MouseEvent; params?: T }) => void;
    changeDelay?: number;
}

/**
 * Basic button component
 */
export class NormalButton<T> extends React.PureComponent<Props<T>> {
    static defaultProps = {
        buttonType: 'button-default' as ButtonType,
        type: 'button' as RawButtonType,
        disabled: false,
        pending: false,
        smallHorizontalPadding: false,
        smallVerticalPadding: false,
        transparent: false,
        changeDelay: 0,
    };

    componentWillUnmount() {
        if (this.changeTimeout) {
            window.clearTimeout(this.changeTimeout);
        }
    }

    private changeTimeout?: number;

    handleClick = (e: React.MouseEvent) => {
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

    render() {
        const {
            type,
            iconName,
            children,
            disabled,
            pending,
            buttonType,
            className: classNameFromProps,
            smallHorizontalPadding,
            smallVerticalPadding,
            transparent,
            onClick, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            onClickParams, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            changeDelay, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
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

export default FaramActionElement(NormalButton);
