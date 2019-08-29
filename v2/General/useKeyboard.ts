import { useEffect, useCallback } from 'react';
import { modulo, isDefined } from '@togglecorp/fujs';

type Key = number | string;

enum Keys {
    Tab = 9,
    Esc = 27,
    Enter = 13,
    Down = 38,
    Up = 40,
}

const specialKeys = [Keys.Up, Keys.Down, Keys.Enter];

function getNewKey<T, Q extends Key>(
    oldKey: Key | undefined,
    increment: number,
    options: T[],
    keySelector: (option: T) => Q,
) {
    if (options.length <= 0) {
        return undefined;
    }

    const index = options.findIndex(o => keySelector(o) === oldKey);
    // NOTE: index should never to -1 to begin with

    let oldIndex = index;
    if (oldIndex === -1) {
        oldIndex = increment > 0 ? -1 : 0;
    }

    const newIndex = modulo(oldIndex + increment, options.length);

    return keySelector(options[newIndex]);
}

function useKeyboard<T, Q extends Key>(
    focusedKey: Key | undefined,
    keySelector: (option: T) => Q,
    options: T[],
    isOptionsShown: boolean,

    onFocusChange: (key: Key | undefined) => void,
    onHideOptions: () => void,
    onShowOptions: () => void,
    onOptionSelect: (key: Key) => void,
) {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            const {
                keyCode,
                stopPropagation,
                preventDefault,
            } = e;
            if (isOptionsShown && (keyCode === Keys.Tab || keyCode === Keys.Esc)) {
                // If tab or escape was pressed and dropdown is being shown,
                // hide the dropdown.
                onHideOptions();
            } else if (!isOptionsShown && specialKeys.includes(keyCode)) {
                // If any of the special keys was pressed but the dropdown is currently hidden,
                // show the dropdown.
                stopPropagation();
                preventDefault();
                onShowOptions();
            } else if (keyCode === Keys.Enter) {
                if (isDefined(focusedKey)) {
                    stopPropagation();
                    preventDefault();
                    onOptionSelect(focusedKey);
                }
            } else if (keyCode === Keys.Up) {
                e.stopPropagation();
                e.preventDefault();
                const newFocusedKey = getNewKey(focusedKey, 1, options, keySelector);
                onFocusChange(newFocusedKey);
            } else if (keyCode === Keys.Down) {
                e.stopPropagation();
                e.preventDefault();
                const newFocusedKey = getNewKey(focusedKey, -1, options, keySelector);
                onFocusChange(newFocusedKey);
            }
        },
        [
            focusedKey,
            keySelector,
            options,
            isOptionsShown,
            onFocusChange,
            onHideOptions,
            onShowOptions,
            onOptionSelect,
        ],
    );

    useEffect(
        () => {
            if (!isOptionsShown) {
                return;
            }

            const newFocusedKey = getNewKey(undefined, 1, options, keySelector);
            onFocusChange(newFocusedKey);
        },
        [isOptionsShown, options, keySelector],
    );

    return handleKeyDown;
}

export default useKeyboard;
