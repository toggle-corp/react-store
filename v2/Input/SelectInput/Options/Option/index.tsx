import React, { useRef, useEffect, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import { OptionKey } from '../../../../types';


import styles from './styles.scss';

interface Props<K extends OptionKey> {
    children?: React.ReactNode;
    className?: string;
    isActive: boolean;
    isFocused: boolean;
    onClick: (key: K) => void;
    onFocus: (key: K) => void;
    optionKey: K;
    scrollOffset?: number;
}

function Option<K extends OptionKey>(props: Props<K>) {
    const divRef = useRef<HTMLButtonElement>(null);
    const focusedByMouse = useRef(false);

    const {
        children,
        className: classNameFromProps,
        isActive,
        isFocused,
        onClick,
        onFocus,
        optionKey,
    } = props;

    useEffect(
        () => {
            if (isFocused && !focusedByMouse.current && divRef.current) {
                divRef.current.scrollIntoView({
                    // behavior: 'smooth',
                    block: 'center',
                });
            }
        },
        [
            divRef.current,
            focusedByMouse,
            isFocused,
        ],
    );

    const handleClick = useCallback(
        () => {
            onClick(optionKey);
        },
        [
            onClick,
            optionKey,
        ],
    );

    const handleMouseMove = useCallback(
        () => {
            focusedByMouse.current = true;
            onFocus(optionKey);
        },
        [
            onFocus,
            optionKey,
        ],
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
}
Option.defaultProps = {
    isActive: false,
    isFocused: false,
};

// TODO: memo breaks typings
// export default memo(Option);
export default Option;
