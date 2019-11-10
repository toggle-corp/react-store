import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    _cs,
    isTruthyString,
} from '@togglecorp/fujs';

import {
    calcFloatPositionInMainWindow,
    defaultLimit,
    defaultOffset,
} from '../../../utils/bounds';
import { OptionKey } from '../../types';

import Button from '../../Action/Button';
import useKeyboard from '../../General/useKeyboard';
import RawInput from '../RawInput';
import HintAndError from '../HintAndError';
import Label from '../Label';

import Options from './Options';
import styles from './styles.scss';

export interface SelectInputBaseProps<T, K extends OptionKey> {
    autoFocus?: boolean;
    className?: string;
    disabled: boolean;
    error?: string;
    hint?: string;
    keySelector: (datum: T) => K;
    label?: string;
    labelClassName?: string;
    labelRightComponent?: React.ReactNode;
    labelRightComponentClassName?: string;
    labelSelector: (datum: T) => string | number;
    onChange: (key: K | undefined) => void;
    onOptionClick: (key: K) => void;
    onOptionFocus: (key: K) => void;
    onSearchValueChange: (text: string | undefined) => void;
    onShowPopupChange: (value: boolean, initialSearchText?: string) => void;
    optionLabelSelector?: (datum: T) => React.ReactNode;
    options: T[];
    optionsClassName?: string;
    placeholder: string;
    readOnly: boolean;
    emptyComponent: React.ComponentType<unknown>;
    emptyWhenFilterComponent: React.ComponentType<unknown>;
    searchOptions: T[];
    searchOptionsPending: boolean;
    searchOptionsFiltered: boolean;
    searchValue?: string;
    showClearButton: boolean;
    showDropdownArrowButton: boolean;
    showHintAndError: boolean;
    showLabel: boolean;
    showPopup: boolean;
    title?: string;
    value?: K;
}
// eslint-disable-next-line max-len
function SelectInputBase<T, K extends OptionKey = string>(props: SelectInputBaseProps<T, K>) {
    const {
        autoFocus,
        className: classNameFromProps,
        disabled,
        error,
        hint,
        keySelector,
        label,
        labelClassName,
        labelRightComponent,
        labelRightComponentClassName,
        labelSelector,
        onChange,
        // onSearchValueChange,
        onShowPopupChange,
        optionLabelSelector,
        options,
        optionsClassName,
        placeholder,
        readOnly,
        emptyComponent,
        emptyWhenFilterComponent,
        searchOptions,
        searchOptionsPending,
        searchOptionsFiltered,
        searchValue,
        showClearButton: showClearButtonFromProps,
        showDropdownArrowButton,
        showHintAndError,
        showLabel,
        showPopup,
        title,
        value,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const boundingClientRect = useRef<ClientRect>();

    const [inputInFocus, setInputInFocus] = useState(false);
    const [focusedKey, setFocusKey] = useState();

    useEffect(
        () => {
            const { current: container } = containerRef;
            if (container) {
                boundingClientRect.current = container.getBoundingClientRect();
            }
        },
        [containerRef],
    );

    const handleShowOptionsPopup = useCallback(
        () => {
            const { current: input } = inputRef;
            if (input) {
                input.select();
            }

            // Only show if it is previously not shown else ignore
            if (!showPopup) {
                onShowPopupChange(true);
                // onSearchValueChange(undefined);
            }
        },
        [inputRef, showPopup, onShowPopupChange],
    );

    const handleToggleOptionsPopup = useCallback(
        () => {
            const { current: input } = inputRef;
            if (input) {
                input.select();
            }

            if (!showPopup) {
                onShowPopupChange(true);
                // onSearchValueChange(undefined);
            } else {
                onShowPopupChange(false);
            }
        },
        [inputRef, showPopup, onShowPopupChange],
    );

    const handleHideOptionsPopup = useCallback(
        () => {
            onShowPopupChange(false);
        },
        [onShowPopupChange],
    );

    const handleInputFocus = useCallback(
        () => {
            setInputInFocus(true);
        },
        [],
    );

    const handleInputBlur = useCallback(
        () => {
            setInputInFocus(false);
        },
        [],
    );

    const handleInputChange = useCallback(
        (e: React.FormEvent<HTMLInputElement>) => {
            const { value: val } = e.currentTarget;
            onShowPopupChange(true, val);
            // onSearchValueChange(val);
        },
        [onShowPopupChange],
    );

    const handleOptionsInvalidate = useCallback(
        (optionsContainer: HTMLDivElement) => {
            const contentRect = optionsContainer.getBoundingClientRect();

            const { current: container } = containerRef;
            const parentRect = container
                ? container.getBoundingClientRect()
                : boundingClientRect.current;

            const offset = { ...defaultOffset };

            const limit = { ...defaultLimit };
            if (parentRect) {
                limit.minW = parentRect.width;
                limit.maxW = parentRect.width;
            }

            const optionsContainerPosition = calcFloatPositionInMainWindow({
                parentRect,
                contentRect,
                offset,
                limit,
            });

            return optionsContainerPosition;
        },
        [containerRef, boundingClientRect],
    );

    const handleOptionSelect = useCallback(
        (optionKey: K) => {
            onShowPopupChange(false);
            if (optionKey !== value) {
                onChange(optionKey);
            }
        },
        [value, onChange, onShowPopupChange],
    );

    const handleClearButtonClick = useCallback(
        () => {
            if (value !== undefined) {
                onChange(undefined);
            }
        },
        [value, onChange],
    );

    const handleFocusChange = useCallback(
        (key: K | undefined) => {
            setFocusKey(key);
        },
        [],
    );

    const selectedValueLabel = useMemo(
        () => {
            const activeOption = options.find(
                d => keySelector(d) === value,
            );
            if (activeOption === undefined) {
                return '';
            }
            return String(labelSelector(activeOption));
        },
        [options, labelSelector, keySelector, value],
    );

    const inputText: string | undefined = !showPopup
        ? selectedValueLabel
        : searchValue;

    const isFilled = isTruthyString(inputText);

    const myPlaceholder = showPopup && isTruthyString(selectedValueLabel)
        ? selectedValueLabel
        : placeholder;

    const showClearButton = showClearButtonFromProps
        && !disabled
        && !readOnly
        && isFilled;

    const handleKeyDown = useKeyboard(
        focusedKey,
        value,
        keySelector,
        searchOptions,
        showPopup,

        handleFocusChange,
        handleHideOptionsPopup,
        handleShowOptionsPopup,
        handleOptionSelect,
    );

    const className = _cs(
        classNameFromProps,
        'select-input-base',
        styles.selectInputBase,
        showPopup && styles.showOptions,
        showPopup && 'show-options',
        disabled && styles.disabled,
        disabled && 'disabled',
        error && styles.error,
        error && 'error',
        inputInFocus && styles.inputInFocus,
        inputInFocus && 'input-in-focus',
        !showClearButton && styles.hideClearButton,
        !showClearButton && 'hide-clear-button',
        isFilled && styles.filled,
        isFilled && 'filled',
    );

    return (
        <div
            className={className}
            title={title}
        >
            { showLabel && (
                <Label
                    className={labelClassName}
                    active={inputInFocus || showPopup}
                    disabled={disabled}
                    error={!!error}
                    title={label}
                    rightComponent={labelRightComponent}
                    rightComponentClassName={labelRightComponentClassName}
                >
                    { label }
                </Label>
            )}
            <div
                ref={containerRef}
                className={_cs(styles.inputAndActions, 'input-and-actions')}
            >
                <RawInput
                    ref={inputRef}
                    className={styles.input}
                    type="text"
                    onBlur={handleInputBlur}
                    onFocus={handleInputFocus}
                    onClick={handleShowOptionsPopup}
                    onChange={handleInputChange}
                    value={inputText || ''}
                    autoFocus={autoFocus}
                    placeholder={myPlaceholder}
                    disabled={disabled || readOnly}

                    onKeyDown={handleKeyDown}
                />
                <div className={_cs('actions', styles.actions)}>
                    { showClearButton && (
                        <Button
                            buttonType="button-danger"
                            tabIndex={-1}
                            iconName="close"
                            className={_cs('clear-button', styles.clearButton)}
                            onClick={handleClearButtonClick}
                            transparent
                        />
                    )}
                </div>
                { showDropdownArrowButton && (
                    <Button
                        tabIndex={-1}
                        iconName={
                            showPopup ? 'arrowDropup' : 'arrowDropdown'
                        }
                        className={_cs('dropdown-button', styles.dropdownButton)}
                        onClick={handleToggleOptionsPopup}
                        disabled={disabled || readOnly}
                        transparent
                    />
                )}
            </div>
            { showHintAndError && (
                <HintAndError
                    error={error}
                    hint={hint}
                />
            )}
            { showPopup && (
                <Options
                    className={optionsClassName}
                    labelSelector={labelSelector}
                    onBlur={handleHideOptionsPopup}
                    onInvalidate={handleOptionsInvalidate}
                    onOptionClick={handleOptionSelect}
                    optionLabelSelector={optionLabelSelector}
                    parentRef={containerRef}
                    emptyComponent={emptyComponent}
                    emptyWhenFilterComponent={emptyWhenFilterComponent}
                    value={value}

                    keySelector={keySelector}
                    data={searchOptions}
                    onOptionFocus={handleFocusChange}
                    focusedKey={focusedKey}
                    filtered={searchOptionsFiltered}
                    pending={searchOptionsPending}
                />
            )}
        </div>
    );
}
SelectInputBase.defaultProps = {
    disabled: false,
    readOnly: false,
    showClearButton: true,
    showDropdownArrowButton: true,
    showHintAndError: true,
    showLabel: true,
};

export default SelectInputBase;
