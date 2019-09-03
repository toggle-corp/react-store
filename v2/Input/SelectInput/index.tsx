import React, {
    useMemo,
    useState,
} from 'react';
import {
    isFalsyString,
    caseInsensitiveSubmatch,
    compareStringSearch,
} from '@togglecorp/fujs';

import { OptionKey } from '../../types';

import RawSelectInput, { RawSelectInputProps } from '../RawSelectInput';

interface DefaultItem {
    key: string;
    label: string;
}

interface State<K> {
    searchValue?: string;
}

/*
# Feature
- Auto-scroll to selected item on popup open
- Add maxDisplayOptions to limit visible options
- Clicking on dropdown button will toggle popup visibility
- Can hide/un-hide dropdown button using prop showDropdownArrowButton
- Support string or number as key
- Create RawSelectInput to pull data from server

# Breaking Change
- Remove prop focusedKey

# Todo
- Support list grouping
- Use ListView instead of List
- Show values that are invalid (tally with current options)
*/

type injectedProps = 'searchValue' | 'onSearchChange' | 'searchOptions';
type Props<T, K extends OptionKey> = Omit<RawSelectInputProps<T, K>, injectedProps> & {
    maxDisplayOptions?: number;
};

function filterAndSearch<T, K>(
    options: T[],
    labelSelector: (datum: T) => string | number,
    searchValue: string,
) {
    return options
        .filter(option => caseInsensitiveSubmatch(labelSelector(option), searchValue))
        .sort((a, b) => compareStringSearch(
            String(labelSelector(a)),
            String(labelSelector(b)),
            String(searchValue),
        ));
}

function SelectInput<T = DefaultItem, K extends OptionKey = string>(props: Props<T, K>) {
    const {
        maxDisplayOptions,
        labelSelector,
        options,
        placeholder,
        ...otherProps
    } = props;

    const [searchValue, setSearchValue] = useState<string | undefined>(undefined);

    const searchOptions = useMemo(
        () => {
            if (maxDisplayOptions === undefined) {
                if (isFalsyString(searchValue)) {
                    return options;
                }
                return filterAndSearch(options, labelSelector, searchValue);
            }

            if (isFalsyString(searchValue)) {
                return [];
            }

            return filterAndSearch(options, labelSelector, searchValue)
                .slice(0, maxDisplayOptions);
        },
        [options, labelSelector, maxDisplayOptions, searchValue],
    );

    const defaultPlaceholder = maxDisplayOptions === undefined
        ? 'Select an option'
        : 'Search for an option';

    return (
        <RawSelectInput
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            placeholder={placeholder || defaultPlaceholder}
            searchOptions={searchOptions}
            options={options}
            labelSelector={labelSelector}
            {...otherProps}
        />
    );
}
SelectInput.defaultProps = {
    keySelector: (item: DefaultItem) => item.key,
    labelSelector: (item: DefaultItem) => item.label,
    options: [],
};

export default SelectInput;
