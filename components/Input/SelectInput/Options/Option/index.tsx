import React, { useRef, useEffect, useCallback, memo } from 'react';
import { _cs } from '@togglecorp/fujs';
import styles from './styles.scss';

type Key = string | number;

interface Props {
    className?: string;
    optionKey: Key;
    onClick: (key: Key) => void;
    onFocus: (key: Key) => void;

    isActive: boolean;
    isFocused: boolean;

    children?: React.ReactElement;
}

const Option = (props: Props) => {
    const divRef = useRef<HTMLButtonElement>(null);
    const focusedByMouse = useRef(false);

    const {
        className: classNameFromProps,
        optionKey,
        isActive,
        isFocused,
        children,
        onClick,
        onFocus,
    } = props;

    useEffect(
        () => {
            if (isFocused && !focusedByMouse && divRef.current) {
                divRef.current.scrollIntoView({
                    block: 'nearest',
                });
            }
        },
        [isFocused, focusedByMouse, divRef.current],
    );

    const handleClick = useCallback(
        () => {
            onClick(optionKey);
        },
        [onClick, optionKey],
    );

    const handleMouseMove = useCallback(
        () => {
            focusedByMouse.current = true;
            onFocus(optionKey);
        },
        [onFocus, optionKey],
    );

    const handleMouseLeave = useCallback(
        () => {
            focusedByMouse.current = false;
        },
        [],
    );

    const className = _cs(
        classNameFromProps,
        styles.option,
        'option',
        isActive && styles.active,
        isActive && 'active',
        isFocused && styles.focused,
        isFocused && 'focused',
    );

    return (
        <button
            ref={divRef}
            className={className}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            type="button"
        >
            { children }
        </button>
    );
};
Option.defaultProps = {
    isActive: false,
    isFocused: false,
};

export default memo(Option);
