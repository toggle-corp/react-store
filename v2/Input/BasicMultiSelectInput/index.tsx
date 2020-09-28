import React, {
    useState,
    useCallback,
    useLayoutEffect,
} from 'react';
import {
    isTruthyString,
} from '@togglecorp/fujs';

import { OptionKey } from '../../types';

import MultiSelectInputBase, { MultiSelectInputBaseProps } from '../MultiSelectInputBase';
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

type injectedProps = 'searchValue'
| 'showPopup'
| 'setShowPopup'
| 'searchOptionsFiltered'
| 'onShowPopupChange';

type Props<T, K extends OptionKey> = Omit<MultiSelectInputBaseProps<T, K>, injectedProps> & {
    onSearchValueChange: (value: string | undefined) => void;
    onOptionsChange: (options: T[]) => void;
    minSearchValueLength: number;
    emptyComponent: React.ComponentType<unknown>;
    emptyWhenFilterComponent: React.ComponentType<unknown>;
};

function BasicMultiSelectInput<T = DefaultItem, K extends OptionKey = string>(props: Props<T, K>) {
    const {
        onSearchValueChange,
        onOptionsChange,
        onChange,
        minSearchValueLength,
        searchOptions: searchOptionsFromProps,
        emptyComponent = EmptyComponent,
        emptyWhenFilterComponent = FilterEmptyComponent,
        ...otherProps
    } = props;

    const {
        options,
        keySelector,
    } = otherProps;

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
        (newValue: K[]) => {
            const optionKeys = options.map(keySelector);

            // FIXME: optimize
            const keysNotInOptions = newValue.filter(
                item => !optionKeys.includes(item),
            );
            if (keysNotInOptions.length > 0) {
                // FIXME: optimize
                const option = searchOptions.filter(o => keysNotInOptions.includes(keySelector(o)));

                if (option.length > 0) {
                    onOptionsChange([
                        ...options,
                        ...option,
                    ]);
                }
            }

            onChange(newValue);
        },
        [options, searchOptions, keySelector, onChange, onOptionsChange],
    );

    return (
        <MultiSelectInputBase
            searchOptionsFiltered={isSearchValueDefined}
            searchValue={searchValue}
            onSearchValueChange={interceptedSetSearchValue}

            emptyComponent={emptyComponent}
            emptyWhenFilterComponent={emptyWhenFilterComponent}

            showPopup={showPopup}
            onShowPopupChange={setShowPopup}

            onChange={interceptedOnChange}
            searchOptions={searchOptions}

            {...otherProps}
        />
    );
}
BasicMultiSelectInput.defaultProps = {
    keySelector: (item: DefaultItem) => item.key,
    labelSelector: (item: DefaultItem) => item.label,
    options: [],
    minSearchValueLength: 0,
    placeholder: 'Select options',
};

export default BasicMultiSelectInput;
