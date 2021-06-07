import React, {
    useState,
    useCallback,
    useLayoutEffect,
} from 'react';
import {
    isTruthyString,
} from '@togglecorp/fujs';

import { OptionKey } from '../../types';

import SelectInputBase, { SelectInputBaseProps } from '../SelectInputBase';
import Message from '../../View/Message';

const emptyArray: unknown[] = [];

function EmptyComponent() {
    return (
        <Message>
            Start typing to search for relevant options
        </Message>
    );
}

function FilterEmptyComponent() {
    return (
        <Message>
            No option available for current search term
        </Message>
    );
}

interface DefaultItem {
    key: string;
    label: string;
}

const defaultOptions: unknown[] = [];

type injectedProps = 'searchValue'
| 'showPopup'
| 'setShowPopup'
| 'searchOptionsFiltered'
| 'onShowPopupChange';

type Props<T, K extends OptionKey> = Omit<SelectInputBaseProps<T, K>, injectedProps> & {
    onSearchValueChange: (value: string | undefined) => void;
    onOptionsChange: (options: T[]) => void;
    minSearchValueLength: number;
    emptyComponent?: React.ComponentType<unknown>;
    emptyWhenFilterComponent?: React.ComponentType<unknown>;
};

function BasicSelectInput<T = DefaultItem, K extends OptionKey = string>(props: Props<T, K>) {
    const {
        onSearchValueChange,
        onOptionsChange,
        onChange,
        minSearchValueLength = 0,
        searchOptions: searchOptionsFromProps,
        emptyComponent = EmptyComponent,
        emptyWhenFilterComponent = FilterEmptyComponent,
        placeholder = 'Select an option',
        options = defaultOptions as T[],
        keySelector,
        ...otherProps
    } = props;

    const [searchValue, setSearchValue] = useState<string | undefined>(undefined);
    const [showPopup, setShowPopup] = useState(false);

    const isSearchValueDefined = isTruthyString(searchValue);

    // FIXME: this is a quick fix until react-rest-request is fixed
    const searchOptions = isSearchValueDefined
        ? searchOptionsFromProps
        : emptyArray as T[];

    const interceptedSetSearchValue = useCallback(
        (value: string | undefined) => {
            setSearchValue(value);
            onSearchValueChange(
                value === undefined || value.length <= minSearchValueLength
                    ? undefined
                    : value,
            );
        },
        [onSearchValueChange, minSearchValueLength],
    );

    useLayoutEffect(
        () => {
            if (showPopup) {
                interceptedSetSearchValue(undefined);
            }
        },
        [showPopup, interceptedSetSearchValue],
    );

    const interceptedOnChange = useCallback(
        (newValue: K | undefined) => {
            const optionIndex = options.findIndex(o => keySelector(o) === newValue);
            if (optionIndex === -1) {
                const option = searchOptions.find(o => keySelector(o) === newValue);
                if (option !== undefined) {
                    onOptionsChange([
                        ...options,
                        option,
                    ]);
                }
            }

            onChange(newValue);
        },
        [options, searchOptions, keySelector, onChange, onOptionsChange],
    );

    return (
        <SelectInputBase
            searchOptionsFiltered={isSearchValueDefined}
            searchValue={searchValue}
            onSearchValueChange={interceptedSetSearchValue}

            emptyComponent={emptyComponent}
            emptyWhenFilterComponent={emptyWhenFilterComponent}

            showPopup={showPopup}
            onShowPopupChange={setShowPopup}

            onChange={interceptedOnChange}
            searchOptions={searchOptions}

            placeholder={placeholder}
            options={options}
            keySelector={keySelector}
            {...otherProps}
        />
    );
}

export default BasicSelectInput;
