import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import {
    listToMap,
    caseInsensitiveSubmatch,
    compareStringSearch,
    isDefined,
    _cs,
} from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';

import Button from '../../Action/Button';
import DangerButton from '../../Action/Button/DangerButton';
import handleKeyboard from '../../General/HandleKeyboard';
import HintAndError from '../HintAndError';
import Label from '../Label';
import RawInput from '../RawInput';

import {
    calcFloatPositionInMainWindow,
    defaultOffset,
    defaultLimit,
} from '../../../utils/bounds';

import Options from './Options';
import styles from './styles.scss';

const RawKeyInput = handleKeyboard(RawInput);
const emptyList = [];

const typeToSearch = () => 'Type to search';
const noMatchingResults = () => 'No matching results';
const noOptionsAvailable = () => 'No options available';

// NOTE: labelSelector must return string
// NOTE: optionLabelSelector may return renderable node
export const propTypes = {
    autoFocus: PropTypes.bool,
    disabled: PropTypes.bool,
    hideClearButton: PropTypes.bool,
    hideSelectAllButton: PropTypes.bool,
    readOnly: PropTypes.bool,
    showHintAndError: PropTypes.bool,
    showLabel: PropTypes.bool,

    className: PropTypes.string,
    error: PropTypes.string,
    hint: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    optionsClassName: PropTypes.string,
    placeholder: PropTypes.string,
    title: PropTypes.string,

    options: PropTypes.arrayOf(PropTypes.object),
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.array,
    onChange: PropTypes.func.isRequired,

    keySelector: PropTypes.func,
    labelSelector: PropTypes.func,
    optionLabelSelector: PropTypes.func,

    renderEmpty: PropTypes.func,
    maxDisplayOptions: PropTypes.number,
};

export const defaultProps = {
    autoFocus: undefined,
    className: '',
    disabled: false,
    error: undefined,
    hideClearButton: false,
    hideSelectAllButton: false,
    hint: undefined,
    keySelector: d => d.key,
    label: '',
    labelSelector: d => d.label,
    optionLabelSelector: undefined,
    options: emptyList,
    optionsClassName: '',
    placeholder: 'Select option(s)',
    readOnly: false,
    renderEmpty: undefined,
    showHintAndError: true,
    showLabel: true,
    title: undefined,
    value: emptyList,
    maxDisplayOptions: 100,
};

const asIs = d => d;
const justTrue = () => true;
const emptyFilteredOptions = [];

class SearchMultiSelectInput extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            // FIXME: this may break
            inputInFocus: props.autoFocus,
            focusedKey: undefined,

            showOptionsPopup: false,
            searchValue: undefined,
        };

        this.containerRef = React.createRef();
        this.inputRef = React.createRef();
    }

    componentDidMount() {
        const { current: container } = this.containerRef;
        if (container) {
            this.boundingClientRect = container.getBoundingClientRect();
        }
    }

    getFilteredOptions = memoize((
        options,
        labelSelector,
        keySelector,
        searchValue,
        maxDisplayOptions,
    ) => {
        const newOptions = options
            .filter(
                option => (
                    searchValue === undefined
                    || caseInsensitiveSubmatch(labelSelector(option), searchValue)
                ),
            )
            .sort((a, b) => compareStringSearch(
                labelSelector(a),
                labelSelector(b),
                searchValue,
            ))
            .slice(0, maxDisplayOptions);
        return newOptions;
    })

    getFilteredOptionsWhileEmptySearch = memoize((
        options,
        searchValue,
        inputValue,
        keySelector,
        showOptionsPopup,
    ) => {
        if (!showOptionsPopup) {
            return emptyFilteredOptions;
        }

        const valueMap = listToMap(inputValue, asIs, justTrue);
        return options.filter(d => valueMap[keySelector(d)]);
    })

    findPlaceholderValue = memoize((
        options,
        labelSelector,
        keySelector,
        value = [],
    ) => {
        const optionsMap = listToMap(
            options,
            keySelector,
            element => element,
        );
        const selectedOptions = value
            .map(k => optionsMap[k])
            .filter(isDefined)
            .map(v => labelSelector(v));
        return selectedOptions.join(', ');
    })

    // Helper

    handleShowOptionsPopup = () => {
        const { current: input } = this.inputRef;
        if (input) {
            input.select();
        }

        // NOTE: this may not be required
        const { current: container } = this.containerRef;
        if (container) {
            this.boundingClientRect = container.getBoundingClientRect();
        }

        this.setState({
            showOptionsPopup: true,
        });
    }

    handleHideOptionsPopup = () => {
        this.setState({
            showOptionsPopup: false,
            searchValue: undefined,
        });
    }

    // Input

    handleInputFocus = () => {
        this.setState({ inputInFocus: true });
    }

    handleInputBlur = () => {
        this.setState({ inputInFocus: false });
    }

    handleInputChange = (e) => {
        const { value } = e.target;

        // NOTE: this may not be required
        const { current: container } = this.containerRef;
        if (container) {
            this.boundingClientRect = container.getBoundingClientRect();
        }

        this.setState({
            showOptionsPopup: true,
            searchValue: value,
        });
    }

    // Options

    handleOptionsInvalidate = (optionsContainer) => {
        const contentRect = optionsContainer.getBoundingClientRect();
        let parentRect = this.boundingClientRect;
        const { current: container } = this.containerRef;

        if (container) {
            parentRect = container.getBoundingClientRect();
        }

        const { showHintAndError } = this.props;

        const offset = { ...defaultOffset };
        if (showHintAndError) {
            offset.top = 12;
        }

        const limit = {
            ...defaultLimit,
            minW: parentRect.width,
            maxW: parentRect.width,
        };

        const optionsContainerPosition = (
            calcFloatPositionInMainWindow({
                parentRect,
                contentRect,
                offset,
                limit,
            })
        );

        return optionsContainerPosition;
    };

    handleOptionSelect = (key) => {
        const {
            value,
            onChange,
        } = this.props;

        const newValue = [...value];
        const optionIndex = newValue.findIndex(d => d === key);
        if (optionIndex === -1) {
            newValue.push(key);
        } else {
            newValue.splice(optionIndex, 1);
        }

        // No need to close modal or reset sort
        // No need to check if same option was clicked
        onChange(newValue);
    }

    handleClearButtonClick = () => {
        const { onChange } = this.props;
        onChange(emptyList);
    }

    handleSelectAllButtonClick = () => {
        const {
            options,
            keySelector,
            onChange,
        } = this.props;

        const newValue = options.map(d => keySelector(d));
        onChange(newValue);
    }

    handleFocusChange = (focusedKey) => {
        this.setState({ focusedKey });
    }

    render() {
        const {
            error,
            hint,
            keySelector,
            label,
            labelSelector,
            optionsClassName,
            renderEmpty: renderEmptyFromProps,
            showHintAndError,
            showLabel,
            title,
            value,
            disabled,
            className: classNameFromProps,
            options,
            hideClearButton,
            hideSelectAllButton,
            readOnly,
            autoFocus,
            placeholder,
            optionLabelSelector,
            maxDisplayOptions,
        } = this.props;

        const {
            showOptionsPopup,
            focusedKey,
            inputInFocus,
            searchValue,
        } = this.state;


        let renderEmpty = renderEmptyFromProps;

        if (!renderEmptyFromProps) {
            renderEmpty = !searchValue ? typeToSearch : noMatchingResults;
        }

        if (!renderEmptyFromProps && options.length === 0) {
            renderEmpty = noOptionsAvailable;
        }

        const isFilled = value.length !== 0;
        const isAllFilled = value.length === options.length;

        const showClearButton = isFilled && !(hideClearButton || disabled || readOnly);
        const showSelectAllButton = !isAllFilled && !(hideSelectAllButton || disabled || readOnly);

        const { current: container } = this.containerRef;

        const inputTitle = this.findPlaceholderValue(options, labelSelector, keySelector, value);
        const finalPlaceholder = (
            inputTitle
            || placeholder
        );

        const finalSearchValue = searchValue || '';

        let filteredOptions = emptyFilteredOptions;
        if (!searchValue || searchValue.length === 0) {
            filteredOptions = this.getFilteredOptionsWhileEmptySearch(
                options,
                searchValue,
                value,
                keySelector,
                showOptionsPopup,
            );
        } else {
            filteredOptions = this.getFilteredOptions(
                options,
                labelSelector,
                keySelector,
                searchValue,
                maxDisplayOptions,
            );
        }


        const className = _cs(
            classNameFromProps,
            'multi-select-input',
            styles.multiSelectInput,
            showOptionsPopup && styles.showOptions,
            showOptionsPopup && 'show-options',
            disabled && 'disabled',
            disabled && styles.disabled,
            inputInFocus && styles.inputInFocus,
            inputInFocus && 'input-in-focus',
            error && styles.error,
            error && 'error',
            hideClearButton && styles.hideClearButton,
            hideClearButton && 'hide-clear-button',
            hideSelectAllButton && styles.hideSelectAllButton,
            hideSelectAllButton && 'hide-select-all-button',
            value.length !== 0 && styles.filled,
            value.length !== 0 && 'filled',
            value.length === options.length && styles.completelyFilled,
            value.length === options.length && 'completely-filled',
        );

        return (
            <div
                className={className}
                ref={this.containerRef}
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
                <div className={_cs('input-and-actions', styles.inputAndActions)}>
                    <RawKeyInput
                        className={styles.input}
                        type="text"
                        elementRef={this.inputRef}
                        onBlur={this.handleInputBlur}
                        onFocus={this.handleInputFocus}
                        onClick={this.handleShowOptionsPopup}
                        onChange={this.handleInputChange}
                        value={finalSearchValue}
                        autoFocus={autoFocus}
                        title={inputTitle}
                        placeholder={finalPlaceholder}
                        disabled={disabled || readOnly}

                        focusedKey={focusedKey}
                        options={filteredOptions}
                        keySelector={keySelector}
                        isOptionsShown={showOptionsPopup}
                        onFocusChange={this.handleFocusChange}
                        onHideOptions={this.handleHideOptionsPopup}
                        onShowOptions={this.handleShowOptionsPopup}
                        onOptionSelect={this.handleOptionSelect}
                    />
                    <div className={_cs('actions', styles.actions)}>
                        { showSelectAllButton && (
                            <Button
                                transparent
                                tabIndex="-1"
                                className={_cs('select-all-button', styles.selectAllButton)}
                                onClick={this.handleSelectAllButtonClick}
                                title="Select all options"
                                disabled={disabled || readOnly}
                                type="button"
                                iconName="checkAll"
                            />
                        )}
                        { showClearButton && (
                            <DangerButton
                                transparent
                                tabIndex="-1"
                                className={_cs('clear-button', styles.clearButton)}
                                onClick={this.handleClearButtonClick}
                                title="Clear selected option(s)"
                                disabled={disabled || readOnly}
                                iconName="close"
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
                <Options
                    activeKeys={value}
                    data={filteredOptions}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    optionLabelSelector={optionLabelSelector}
                    onBlur={this.handleHideOptionsPopup}
                    onInvalidate={this.handleOptionsInvalidate}
                    onOptionClick={this.handleOptionSelect}
                    onOptionFocus={this.handleFocusChange}
                    className={optionsClassName}
                    parentContainer={container}
                    renderEmpty={renderEmpty}
                    show={showOptionsPopup}
                    focusedKey={focusedKey}
                />
            </div>
        );
    }
}

export default FaramInputElement(SearchMultiSelectInput);
