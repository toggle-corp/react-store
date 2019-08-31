import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    _cs,
    caseInsensitiveSubmatch,
    compareStringSearch,
    isDefined,
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

interface DefaultItem {
    key: string;
    label: string;
}

interface State<K> {
    inputInFocus?: boolean;
    focusedKey?: K;
    showOptionsPopup: boolean;
    searchValue?: string;
}

interface Props<T, K extends OptionKey> {
    autoFocus?: boolean;
    className?: string;
    disabled: boolean;
    error?: string;
    focusedKey?: K;
    hint?: string;
    keySelector: (datum: T) => K;
    label?: string;
    labelSelector: (datum: T) => string | number;
    onChange: (key: K | undefined) => void;
    onOptionClick: (key: K) => void;
    onOptionFocus: (key: K) => void;
    optionLabelSelector?: (datum: T) => React.ReactNode;
    options: T[];
    optionsClassName?: string;
    placeholder?: string;
    readOnly: boolean;
    renderEmpty: React.ComponentType<unknown>;
    showClearButton: boolean;
    showDropdownArrowButton: boolean;
    showHintAndError: boolean;
    showLabel: boolean;
    title?: string;
    value?: K;
}
function SelectInput<T = DefaultItem, K extends OptionKey = string>(props: Props<T, K>) {
    const {
        autoFocus,
        className: classNameFromProps,
        disabled,
        error,
        hint,
        keySelector,
        label,
        labelSelector,
        onChange,
        optionLabelSelector,
        options,
        optionsClassName,
        placeholder,
        readOnly,
        renderEmpty,
        showClearButton: showClearButtonFromProps,
        showDropdownArrowButton,
        showHintAndError,
        showLabel,
        title,
        value,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const boundingClientRect = useRef<ClientRect>();

    const [inputInFocus, setInputInFocus] = useState(false);
    const [focusedKey, setFocusKey] = useState();
    const [showOptionsPopup, setShowOptionsPopup] = useState(false);
    const [searchValue, setSearchValue] = useState<string | undefined>(undefined);

    useEffect(
        () => {
            const { current: container } = containerRef;
            if (container) {
                boundingClientRect.current = container.getBoundingClientRect();
            }
        },
        [],
    );

    const handleShowOptionsPopup = useCallback(
        () => {
            const { current: input } = inputRef;
            if (input) {
                input.select();
            }

            setShowOptionsPopup(true);
            setSearchValue(undefined);
            setFocusKey(value);
        },
        [inputRef, value],
    );

    const handleHideOptionsPopup = useCallback(
        () => {
            setShowOptionsPopup(false);
        },
        [],
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
            setShowOptionsPopup(true);
            setSearchValue(val);
        },
        [],
    );

    const handleOptionsInvalidate = useCallback(
        (optionsContainer: HTMLDivElement) => {
            const contentRect = optionsContainer.getBoundingClientRect();

            const { current: container } = containerRef;
            const parentRect = container
                ? container.getBoundingClientRect()
                : boundingClientRect.current;

            const offset = { ...defaultOffset };
            // FIXME: this information should not be hard-coded
            if (showHintAndError) {
                offset.top = 12;
            }

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
        [containerRef, boundingClientRect.current, showHintAndError],
    );

    const handleOptionSelect = useCallback(
        (optionKey: K) => {
            setShowOptionsPopup(false);
            if (optionKey !== value) {
                onChange(optionKey);
            }
        },
        [value, onChange],
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

    const filteredOptions = useMemo(
        () => {
            if (searchValue === undefined) {
                return options;
            }
            const newOptions = options
                .filter(option => caseInsensitiveSubmatch(labelSelector(option), searchValue))
                .sort((a, b) => compareStringSearch(
                    String(labelSelector(a)),
                    String(labelSelector(b)),
                    String(searchValue),
                ));
            return newOptions;
        },
        [options, labelSelector, searchValue],
    );

    const defaultSearchValue = useMemo(
        () => {
            const activeOption = options.find(
                d => keySelector(d) === value,
            );

            return activeOption !== undefined
                ? String(labelSelector(activeOption))
                : '';
        },
        [options, labelSelector, keySelector, value],
    );

    const finalSearchValue: string | undefined = !showOptionsPopup
        ? defaultSearchValue
        : searchValue;

    const isFilled = isDefined(finalSearchValue) && String(finalSearchValue).length !== 0;

    const showClearButton = showClearButtonFromProps && !disabled && !readOnly && isFilled;

    const handleKeyDown = useKeyboard(
        focusedKey,
        value,
        keySelector,
        filteredOptions,
        showOptionsPopup,
        handleFocusChange,
        handleHideOptionsPopup,
        handleShowOptionsPopup,
        handleOptionSelect,
    );

    const className = _cs(
        classNameFromProps,
        'select-input',
        styles.selectInput,
        showOptionsPopup && styles.showOptions,
        showOptionsPopup && 'show-options',
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
            ref={containerRef}
            title={title}
        >
            { showLabel && (
                <Label
                    text={label}
                    error={!!error}
                    disabled={disabled}
                    active={inputInFocus || showOptionsPopup}
                />
            )}
            <div className={_cs(styles.inputAndActions, 'input-and-actions')}>
                <RawInput
                    className={styles.input}
                    type="text"
                    elementRef={inputRef}
                    onBlur={handleInputBlur}
                    onFocus={handleInputFocus}
                    onClick={handleShowOptionsPopup}
                    onChange={handleInputChange}
                    value={finalSearchValue || ''}
                    autoFocus={autoFocus}
                    placeholder={placeholder}
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
                    { showDropdownArrowButton && (
                        <Button
                            tabIndex={-1}
                            iconName="arrowDropdown"
                            className={_cs('dropdown-button', styles.dropdownButton)}
                            onClick={handleShowOptionsPopup}
                            disabled={disabled || readOnly}
                            transparent
                        />
                    )}
                </div>
            </div>
            { showHintAndError && (
                <HintAndError
                    error={error}
                    hint={hint}
                />
            )}
            { showOptionsPopup && (
                <Options
                    className={optionsClassName}
                    labelSelector={labelSelector}
                    onBlur={handleHideOptionsPopup}
                    onInvalidate={handleOptionsInvalidate}
                    onOptionClick={handleOptionSelect}
                    optionLabelSelector={optionLabelSelector}
                    parentContainer={containerRef.current}
                    renderEmpty={renderEmpty}
                    value={value}

                    keySelector={keySelector}
                    data={filteredOptions}
                    onOptionFocus={handleFocusChange}
                    focusedKey={focusedKey}
                />
            )}
        </div>
    );
}
SelectInput.defaultProps = {
    disabled: false,
    keySelector: (item: DefaultItem) => item.key,
    labelSelector: (item: DefaultItem) => item.label,
    options: [],
    placeholder: 'Select an option',
    readOnly: false,
    showClearButton: true,
    showDropdownArrowButton: true,
    showHintAndError: true,
    showLabel: true,
};

export default SelectInput;
