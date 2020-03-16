import React, { useRef, useEffect } from 'react';
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

    scrollIntoView?: boolean;
}

const Cell = (props: CellProps) => {
    const {
        children,
        className: classNameFromProps,

        today,
        selected,
        onClick,

        cellKey,

        disabled,
        readOnly,

        scrollIntoView,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);

    // TODO: use useCallback
    const handleClick = () => {
        // NOTE: div cannot be disabled
        if (isDefined(onClick) && isDefined(cellKey) && !disabled && !readOnly) {
            onClick(cellKey);
        }
    };

    const className = _cs(
        classNameFromProps,
        styles.cell,
        today && styles.today,
        selected && styles.selected,
        onClick && styles.clickable,
    );

    useEffect(
        () => {
            if (
                scrollIntoView
                && containerRef.current
                && containerRef.current.scrollIntoViewIfNeeded
            ) {
                containerRef.current.scrollIntoViewIfNeeded(true);
            }
        },
        [scrollIntoView],
    );

    if (!onClick) {
        return (
            <div
                ref={containerRef}
                className={className}
            >
                {children}
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={className}
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
