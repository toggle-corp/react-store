import React from 'react';
import {
    isDefined,
    _cs,
} from '@togglecorp/fujs';

import styles from './styles.scss';

interface CellProps {
    cellKey?: number;
    onClick?: (value: number) => void;
    selected?: boolean;
    today?: boolean;
    children?: React.ReactNode;
    className?: string;

    disabled?: boolean;
    readOnly?: boolean;
}

const Cell = (props: CellProps) => {
    const {
        children,
        className,

        today,
        selected,
        onClick,

        cellKey,

        disabled,
        readOnly,
    } = props;

    // TODO: use useCallback
    const handleClick = () => {
        // NOTE: div cannot be disabled
        if (isDefined(onClick) && isDefined(cellKey) && !disabled && !readOnly) {
            onClick(cellKey);
        }
    };

    return (
        <div
            className={_cs(
                className,
                styles.cell,
                today && styles.today,
                selected && styles.selected,
            )}
            role="button"
            onClick={handleClick}
            onKeyDown={handleClick}
            tabIndex={-1}
        >
            {children}
        </div>
    );
};

export default Cell;
