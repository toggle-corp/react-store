import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { modulo } from '@togglecorp/fujs';

const propTypes = {
    focusedKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    // eslint-disable-next-line react/forbid-prop-types
    options: PropTypes.array,
    keySelector: PropTypes.func.isRequired,
    isOptionsShown: PropTypes.bool,

    onFocusChange: PropTypes.func.isRequired,
    onHideOptions: PropTypes.func.isRequired,
    onShowOptions: PropTypes.func.isRequired,
    onOptionSelect: PropTypes.func.isRequired,
};

const defaultProps = {
    focusedKey: undefined,
    options: [],
    isOptionsShown: false,
};

const TAB = 9;
const ESC = 27;
const ENTER = 13;
const DOWN = 38;
const UP = 40;
const specialKeys = [UP, DOWN, ENTER];

const getNewKey = (oldKey, increment, options, keySelector) => {
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
};

export default (WrappedComponent) => {
    const ListenerComponent = class extends React.PureComponent {
        static propTypes = propTypes;

        static defaultProps = defaultProps;

        UNSAFE_componentWillReceiveProps(nextProps) {
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

        handleInputKeyDown = (e) => {
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
                if (focusedKey) {
                    e.stopPropagation();
                    e.preventDefault();
                    onOptionSelect(focusedKey);
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

        render() {
            const {
                focusedKey, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
                options, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
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

            return (
                <WrappedComponent
                    onKeyDown={this.handleInputKeyDown}
                    {...otherProps}
                />
            );
        }
    };

    return hoistNonReactStatics(ListenerComponent, WrappedComponent);
};
