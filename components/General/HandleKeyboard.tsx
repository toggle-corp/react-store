import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { modulo, isDefined } from '@togglecorp/fujs';

type Key = number | string;

const TAB = 9;
const ESC = 27;
const ENTER = 13;
const DOWN = 38;
const UP = 40;
const specialKeys = [UP, DOWN, ENTER];

/*
export type SetDifference<A, B> = A extends B ? never : A;
export type SetComplement<A, A1 extends A> = SetDifference<A, A1>;
export type Subtract<T extends T1, T1 extends object> = Pick<T, SetComplement<keyof T, keyof T1>>;
*/

interface HandleKeyboardProps<T, Q> {
    focusedKey?: Key;

    options: T[];
    keySelector: (option: T) => Q;
    isOptionsShown: boolean;

    onFocusChange: (key: Key | undefined) => void;
    onHideOptions: () => void;
    onShowOptions: () => void;
    onOptionSelect: (key: Key) => void;
}

interface InjectedProps {
    onKeyDown: (e: KeyboardEvent) => void;
}

// eslint-disable-next-line max-len
function handleKeyboard<T, Q extends Key, P extends InjectedProps>(WrappedComponent: React.ComponentType<P>) {
    function getNewKey(
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

    type Props = P & HandleKeyboardProps<T, Q>;

    const ListenerComponent = class extends React.PureComponent<Props> {
        public static defaultProps = {
            options: [],
            isOptionsShown: false,
        };

        public componentWillReceiveProps(nextProps: Props) {
            const {
                isOptionsShown: oldIsOptionsShown,
                options: oldOptions,
                keySelector: oldKeySelector,
            } = this.props;
            const {
                isOptionsShown: newIsOptionsShown,
                options: newOptions,
                keySelector: newKeySelector,
            } = nextProps;

            if (
                (!oldIsOptionsShown && newIsOptionsShown)
                || (oldKeySelector !== newKeySelector)
                || (oldOptions !== newOptions)
            ) {
                const newFocusedKey = getNewKey(
                    undefined,
                    1,
                    newOptions,
                    newKeySelector,
                );
                nextProps.onFocusChange(newFocusedKey);
            }
        }

        private handleInputKeyDown = (e: KeyboardEvent) => {
            const {
                focusedKey,
                options,
                keySelector,
                isOptionsShown,

                onHideOptions,
                onShowOptions,
                onOptionSelect,
                onFocusChange,
            } = this.props;
            const { keyCode } = e;

            if (isOptionsShown && (keyCode === TAB || keyCode === ESC)) {
                // If tab or escape was pressed and dropdown is being shown,
                // hide the dropdown.
                onHideOptions();
            } else if (!isOptionsShown && specialKeys.includes(keyCode)) {
                // If any of the special keys was pressed but the dropdown is currently hidden,
                // show the dropdown.
                e.stopPropagation();
                e.preventDefault();
                onShowOptions();
            } else if (keyCode === ENTER) {
                if (isDefined(focusedKey)) {
                    e.stopPropagation();
                    e.preventDefault();
                    // FIXME: the type for focusedKey is Key & undefined here
                    onOptionSelect(focusedKey as Key);
                }
            } else if (keyCode === UP) {
                e.stopPropagation();
                e.preventDefault();
                const newFocusedKey = getNewKey(focusedKey, 1, options, keySelector);
                onFocusChange(newFocusedKey);
            } else if (keyCode === DOWN) {
                e.stopPropagation();
                e.preventDefault();
                const newFocusedKey = getNewKey(focusedKey, -1, options, keySelector);
                onFocusChange(newFocusedKey);
            }
        }

        public render() {
            const {
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                focusedKey,
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                options,
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                keySelector,
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                isOptionsShown,
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                onFocusChange,
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                onHideOptions,
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                onShowOptions,
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                onOptionSelect,

                ...otherProps
            } = this.props;

            const props = {
                ...otherProps as P,
                onKeyDown: this.handleInputKeyDown,
            };

            return (
                <WrappedComponent
                    {...props}
                />
            );
        }
    };

    return hoistNonReactStatics(ListenerComponent, WrappedComponent);
}

export default handleKeyboard;
