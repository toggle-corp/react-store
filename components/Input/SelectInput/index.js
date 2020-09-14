import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import {
    caseInsensitiveSubmatch,
    compareStringSearch,
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

const propTypeKey = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
]);

const RawKeyInput = handleKeyboard(RawInput);
const emptyList = [];

// NOTE: labelSelector must return string
// NOTE: optionLabelSelector may return renderable node
const propTypes = {
    autoFocus: PropTypes.bool,
    disabled: PropTypes.bool,
    hideClearButton: PropTypes.bool,
    readOnly: PropTypes.bool,
    showHintAndError: PropTypes.bool,
    showLabel: PropTypes.bool,

    className: PropTypes.string,
    error: PropTypes.string,
    hint: PropTypes.string,
    label: PropTypes.string,
    optionsClassName: PropTypes.string,
    placeholder: PropTypes.string,
    title: PropTypes.string,

    options: PropTypes.arrayOf(PropTypes.object),
    value: propTypeKey,
    onChange: PropTypes.func.isRequired,

    keySelector: PropTypes.func,
    labelSelector: PropTypes.func,
    optionLabelSelector: PropTypes.func,

    renderEmpty: PropTypes.func,
    persistentHintAndError: PropTypes.bool,
};

const defaultProps = {
    autoFocus: undefined,
    className: '',
    disabled: false,
    error: undefined,
    hideClearButton: false,
    hint: undefined,
    keySelector: d => d.key,
    label: '',
    labelSelector: d => d.label,
    optionLabelSelector: undefined,
    options: emptyList,
    optionsClassName: '',
    placeholder: 'Select an option',
    readOnly: false,
    renderEmpty: undefined,
    showHintAndError: true,
    showLabel: true,
    title: undefined,
    value: undefined,
    persistentHintAndError: true,
};

export class NormalSelectInput extends React.PureComponent {
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

    filterOptions = memoize((
        options,
        labelSelector,
        value,
    ) => {
        const newOptions = options
            .filter(
                option => (
                    value === undefined || caseInsensitiveSubmatch(labelSelector(option), value)
                ),
            )
            .sort((a, b) => compareStringSearch(
                labelSelector(a),
                labelSelector(b),
                value,
            ));
        return newOptions;
    });

    findDefaultSearchValue = memoize((
        options,
        labelSelector,
        keySelector,
        value,
    ) => {
        const activeOption = options.find(
            d => keySelector(d) === value,
        );

        if (activeOption === undefined) {
            return '';
        }

        return labelSelector(activeOption);
    });


    // Helper

    handleShowOptionsPopup = () => {
        const { current: input } = this.inputRef;
        if (input) {
            input.select();
        }

        /*
        // NOTE: this may not be required
        const { current: container } = this.containerRef;
        if (container) {
            this.boundingClientRect = container.getBoundingClientRect();
        }
        */

        this.setState({
            showOptionsPopup: true,
            searchValue: undefined,
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

        /*
        // NOTE: this may not be required
        const { current: container } = this.containerRef;
        if (container) {
            this.boundingClientRect = container.getBoundingClientRect();
        }
        */

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

    handleOptionSelect = (optionKey) => {
        const {
            value,
            onChange,
        } = this.props;

        this.setState({
            showOptionsPopup: false,
            searchValue: undefined,
        });

        if (optionKey !== value) {
            onChange(optionKey);
        }
    }

    handleClearButtonClick = () => {
        const {
            onChange,
            value,
        } = this.props;

        if (value !== undefined) {
            onChange(undefined);
        }
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
            optionLabelSelector,
            optionsClassName,
            renderEmpty,
            showHintAndError,
            showLabel,
            title,
            value,
            disabled,
            readOnly,
            placeholder,
            autoFocus,
            hideClearButton,
            className: classNameFromProps,
            persistentHintAndError,
            options,
        } = this.props;

        const {
            showOptionsPopup,
            focusedKey,
            inputInFocus,
            searchValue,
        } = this.state;

        // NOTE: finalSearchValue shouldn't be undefined
        const finalSearchValue = searchValue === undefined
            ? this.findDefaultSearchValue(options, labelSelector, keySelector, value)
            : searchValue;

        const isFilled = finalSearchValue && finalSearchValue.length !== 0;
        const showClearButton = isFilled && !(hideClearButton || disabled || readOnly);

        const { current: container } = this.containerRef;

        const filteredOptions = this.filterOptions(
            options,
            labelSelector,
            // NOTE: Using value instead of finalSearchValue
            // this will display all options at first
            searchValue,
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
            hideClearButton && styles.hideClearButton,
            hideClearButton && 'hide-clear-button',
            isFilled && styles.filled,
            isFilled && 'filled',
        );

        const inputClassName = _cs(
            styles.inputAndActions,
            'input-and-actions',
        );

        const actionsClassName = `
            actions
            ${styles.actions}
        `;

        const dropdownButtonClassName = `
            dropdown-button
            ${styles.dropdownButton}
        `;

        const clearClassName = `
            clear-button
            ${styles.clearButton}
        `;

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
                <div className={inputClassName}>
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
                        placeholder={placeholder}
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
                    <div className={actionsClassName}>
                        { showClearButton && (
                            <DangerButton
                                tabIndex="-1"
                                iconName="close"
                                className={clearClassName}
                                onClick={this.handleClearButtonClick}
                                transparent
                            />
                        )}
                        <Button
                            tabIndex="-1"
                            iconName="arrowDropdown"
                            className={dropdownButtonClassName}
                            onClick={this.handleShowOptionsPopup}
                            disabled={disabled || readOnly}
                            transparent
                        />
                    </div>
                </div>
                <HintAndError
                    show={showHintAndError}
                    error={error}
                    hint={hint}
                    persistent={persistentHintAndError}
                />
                <Options
                    className={optionsClassName}
                    labelSelector={labelSelector}
                    onBlur={this.handleHideOptionsPopup}
                    onInvalidate={this.handleOptionsInvalidate}
                    onOptionClick={this.handleOptionSelect}
                    optionLabelSelector={optionLabelSelector}
                    parentContainer={container}
                    renderEmpty={renderEmpty}
                    value={value}

                    show={showOptionsPopup}
                    keySelector={keySelector}
                    data={filteredOptions}
                    onOptionFocus={this.handleFocusChange}
                    focusedKey={focusedKey}
                />
            </div>
        );
    }
}

export default FaramInputElement(NormalSelectInput);
