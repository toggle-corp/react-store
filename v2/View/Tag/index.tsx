import React, { ReactNode } from 'react';

import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props {
    className?: string;
    label: string;
    action?: ReactNode;
    actionClassName?: string;
    selected?: boolean;
    disabled?: boolean;
}

function Tag(props: Props) {
    const {
        className,
        label,
        action,
        disabled,
        actionClassName,
        selected,
    } = props;

    const style = _cs(
        className,
        styles.tag,
        disabled && styles.disabled,
        selected && styles.selected,
    );

    return (
        <div className={style}>
            <div>
                {label}
            </div>
            { action && (
                <div className={_cs(styles.action, actionClassName)}>
                    {action}
                </div>
            )}
        </div>
    );
}

export default Tag;
