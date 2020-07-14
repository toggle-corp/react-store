import { useEffect, useCallback } from 'react';
import { modulo, isDefined } from '@togglecorp/fujs';

import { Keys, OptionKey } from '../types';

/*
# Feature
- Handles setting value of focusedKey exclusively

# Breaking change
- Add prop selectedKey to set it as focusedKey if focusedKey is not defined
*/

const specialKeys = [Keys.Up, Keys.Down, Keys.Enter];

function getOptionIndex<T, Q extends OptionKey>(
    key: Q | undefined,
    options: T[],
    keySelector: (option: T) => Q,
) {
    return options.findIndex(o => keySelector(o) === key);
}

function getNewKey<T, Q extends OptionKey>(
    oldKey: Q | undefined,
    increment: number,
    options: T[],
    keySelector: (option: T) => Q,
) {
    if (options.length <= 0) {
        return undefined;
    }

    const index = getOptionIndex(oldKey, options, keySelector);
    // NOTE: index should never be -1 to begin with

    let oldIndex = index;
    if (oldIndex === -1) {
        oldIndex = increment > 0 ? -1 : 0;
    }

    const newIndex = modulo(oldIndex + increment, options.length);

    return keySelector(options[newIndex]);
}

function useKeyboard<T, Q extends OptionKey>(
    focusedKey: Q | undefined,
    selectedKey: Q | undefined,
    keySelector: (option: T) => Q,
    options: T[],
    isOptionsShown: boolean,

    onFocusChange: (key: Q | ((key: Q | undefined) => Q | undefined) | undefined) => void,
    onHideOptions: () => void,
    onShowOptions: () => void,
    onOptionSelect: (key: Q) => void,
) {
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            // NOTE: De-structuring e here will create access error
            const { keyCode } = e;
            if (isOptionsShown && (keyCode === Keys.Tab || keyCode === Keys.Esc)) {
                // If tab or escape was pressed and dropdown is being shown,
                // hide the dropdown.
                onHideOptions();
            } else if (!isOptionsShown && specialKeys.includes(keyCode)) {
                // If any of the special keys was pressed but the dropdown is currently hidden,
                // show the dropdown.
                e.stopPropagation();
                e.preventDefault();
                onShowOptions();
            } else if (keyCode === Keys.Enter) {
                if (isDefined(focusedKey)) {
                    e.stopPropagation();
                    e.preventDefault();
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
            isOptionsShown,
            keySelector,
            onFocusChange,
            onHideOptions,
            onOptionSelect,
            onShowOptions,
            options,
        ],
    );

    // while opening
    useEffect(
        () => {
            if (!isOptionsShown && focusedKey !== undefined) {
                onFocusChange(undefined);
            }
        },
        [focusedKey, isOptionsShown, onFocusChange],
    );

    // while closing
    useEffect(
        () => {
            if (!isOptionsShown) {
                return;
            }

            if (
                selectedKey !== undefined
                && getOptionIndex(selectedKey, options, keySelector) !== -1
            ) {
                onFocusChange(selectedKey);
            } else {
                onFocusChange((oldKey) => {
                    // NOTE: this just check if the key exists or not
                    const newFocusedKey = getNewKey(oldKey, 0, options, keySelector);
                    return newFocusedKey;
                });
            }
        },
        [isOptionsShown, options, keySelector, onFocusChange, selectedKey],
    );

    return handleKeyDown;
}

export default useKeyboard;
