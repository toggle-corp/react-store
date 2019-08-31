import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import FloatingContainer from '../../../View/FloatingContainer';
import List from '../../../View/List';

import { OptionKey } from '../../../types';

import Option from './Option';

import styles from './styles.scss';

interface Props<T, K extends OptionKey> {
    className?: string;
    data: T[];
    focusedKey?: K;
    keySelector: (datum: T) => K;
    labelSelector: (datum: T) => string | number;
    onBlur: () => void;
    onInvalidate: (e: HTMLDivElement) => object;
    onOptionClick: (key: K) => void;
    onOptionFocus: (key: K) => void;
    optionLabelSelector?: (datum: T) => React.ReactNode;
    parentRef: React.RefObject<HTMLElement>;
    renderEmpty: React.ComponentType<unknown>;
    value?: K;
}

function Options<T, K extends OptionKey>(props: Props<T, K>) {
    const {
        className: classNameFromProps,
        data,
        focusedKey,
        keySelector,
        labelSelector,
        onBlur,
        onInvalidate,
        onOptionClick,
        onOptionFocus,
        optionLabelSelector,
        parentRef,
        renderEmpty: EmptyComponent,
        value,
    } = props;

    const rendererParams = useCallback(
        (key: K, option: T) => {
            const label = optionLabelSelector
                ? optionLabelSelector(option)
                : labelSelector(option);

            const isActive = key === value;
            const isFocused = key === focusedKey;

            return {
                children: label,
                isActive,
                isFocused,
                onClick: onOptionClick,
                onFocus: onOptionFocus,
                optionKey: key,
            };
        },
        [
            focusedKey,
            labelSelector,
            onOptionClick,
            onOptionFocus,
            optionLabelSelector,
            value,
        ],
    );

    const className = _cs(
        classNameFromProps,
        styles.options,
        'options',
    );

    return (
        <FloatingContainer
            onBlur={onBlur}
            onInvalidate={onInvalidate}
            parentRef={parentRef}
            className={className}
        >
            <List
                data={data}
                keySelector={keySelector}
                rendererParams={rendererParams}
                renderer={Option}
            />
            {data.length <= 0 && (
                <div className={_cs(styles.empty, 'empty')}>
                    <EmptyComponent />
                </div>
            )}
        </FloatingContainer>
    );
}

Options.defaultProps = {
    data: [],
    renderEmpty: () => <span>No option available</span>,
};

export default Options;
