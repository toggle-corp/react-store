import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props {
    active: boolean;
    children?: React.ReactNode;
    className?: string;
    disabled: boolean;
    error: boolean;
    title?: string;
    rightComponent?: React.ReactNode;
    rightComponentClassName?: string;
}

function Label(props: Props) {
    const {
        active,
        children,
        className: classNameFromProps,
        disabled,
        error,
        title,
        rightComponent,
        rightComponentClassName,
        ...otherProps
    } = props;

    const className = _cs(
        classNameFromProps,
        'input-label',
        styles.inputLabel,
        !children && 'empty',
        !children && styles.empty,
        error && styles.error,
        error && 'error',
        active && styles.active,
        active && 'active',
        disabled && styles.disabled,
        disabled && 'disabled',
    );

    return (
        <div
            className={className}
            title={title}
            {...otherProps}
        >
            <div className={styles.left}>
                {children}
            </div>
            { rightComponent && (
                <div className={_cs(rightComponentClassName, styles.right)}>
                    { rightComponent }
                </div>
            )}
        </div>
    );
}

Label.defaultProps = {
    active: false,
    disabled: false,
    error: false,
};

export default Label;
