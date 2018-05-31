import React from 'react';

import { iconNames } from '../../../constants';

import {
    caseInsensitiveSubmatch,
    getRatingForContentInString,
} from '../../../utils/common';

import {
    calcFloatPositionInMainWindow,
    defaultOffset,
    defaultLimit,
} from '../../../utils/bounds';

export const getClassName = (styles, base, state, p) => {
    const {
        disabled,
        error,
        clearable,
        className,
        value,
    } = p;

    const {
        showOptions,
    } = state;

    const classNames = [className, base, styles[base]];

    if (disabled) {
        classNames.push('disabled');
        classNames.push(styles.disabled);
    }

    if (error) {
        classNames.push('error');
        classNames.push(styles.error);
    }

    if (clearable) {
        classNames.push('clearable');
        classNames.push(styles.clearable);
    }

    if (showOptions) {
        classNames.push('options-shown');
        classNames.push(styles.optionsShown);
    }

    if (value && value.length !== 0) {
        classNames.push('filled');
        classNames.push(styles.filled);
    }

    return classNames.join(' ');
};

// FIXME: this may not be used
export const isOptionActive = (key, values) => values.indexOf(key) !== -1;

export const getOptionClassName = (styles, isActive, isMultiSelect) => {
    const classNames = ['option', styles.option];

    if (isActive) {
        classNames.push('active');
        classNames.push(styles.active);
    }

    if (isMultiSelect) {
        classNames.push('multi');
        classNames.push(styles.multi);
    }

    return classNames.join(' ');
};

export const filterAndSortOptions = (options, value, labelSelector) => {
    const newOptions = options.filter(option =>
        caseInsensitiveSubmatch(labelSelector(option), value),
    );

    newOptions.sort((a, b) => (
        getRatingForContentInString(value, labelSelector(a))
        - getRatingForContentInString(value, labelSelector(b))
    ));

    return newOptions;
};

export const handleInputValueChange = (parent, value) => {
    const {
        options,
        labelSelector,
    } = parent.props;


    const displayOptions = filterAndSortOptions(options, value, labelSelector);

    parent.setState({
        displayOptions,
        inputValue: value,
        showOptions: true,
    });
};

export const handleInputClick = (parent) => {
    if (parent.container) {
        // eslint-disable-next-line no-param-reassign
        parent.boundingClientRect = parent.container.getBoundingClientRect();
    }

    if (parent.input) {
        parent.input.select();
    }

    parent.setState({
        displayOptions: parent.props.options,
        showOptions: true,
    });
};

export const getOptionsContainerPosition = (parent, optionsContainer) => {
    const contentRect = optionsContainer.getBoundingClientRect();
    let parentRect = parent.boundingClientRect;
    if (parent.container) {
        parentRect = parent.container.getBoundingClientRect();
    }

    const offset = { ...defaultOffset };
    if (parent.props.showHintAndError) {
        offset.top = 12;
    }

    const optionsContainerPosition = (
        calcFloatPositionInMainWindow({
            parentRect,
            contentRect,
            offset,
            limit: {
                ...defaultLimit,
                minW: parentRect.width,
                maxW: parentRect.width,
            },
        })
    );

    return optionsContainerPosition;
};

export const renderLabel = p => (
    p.showLabel ? (
        <div className={`label ${p.styles.label}`}>
            { p.label }
        </div>
    ) : null
);

export const renderClearButton = p => (
    p.show ? (
        <button
            className={`clear-button ${p.styles.clearButton}`}
            onClick={p.parent.handleClearButtonClick}
            title="Clear selected option(s)"
            disabled={p.parent.props.disabled}
            type="button"
            tabIndex="-1"
        >
            <span className={iconNames.close} />
        </button>
    ) : null
);

export const renderHintAndError = (p) => {
    const {
        showHintAndError,
        error,
        hint,
        styles,
    } = p;

    if (!showHintAndError) {
        return null;
    }

    let content;
    if (error) {
        content = <p className={`error ${styles.error}`}>{error}</p>;
    } else if (hint) {
        content = <p className={`hint ${styles.hint}`}>{hint}</p>;
    } else {
        content = <p key="empty" className={`empty ${styles.empty}`}>-</p>;
    }

    return content;
};

