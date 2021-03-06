import React, {
    useMemo,
    useState,
} from 'react';
import {
    isFalsyString,
    isTruthyString,
    caseInsensitiveSubmatch,
    compareStringSearch,
} from '@togglecorp/fujs';

import { OptionKey } from '../../types';

import SelectInputBase, { SelectInputBaseProps } from '../SelectInputBase';

interface DefaultItem {
    key: string;
    label: string;
}

/*
# Feature
- Auto-scroll to selected item on popup open
- Add maxDisplayOptions to limit visible options
- Clicking on dropdown button will toggle popup visibility
- Can hide/un-hide dropdown button using prop showDropdownArrowButton
- Support string or number as key
- Create BasicSelectInput to pull data from server

# Breaking Change
- Remove prop focusedKey

# Todo
- Support list grouping
- Use ListView instead of List
- Show values that are invalid (tally with current options)
*/

function filterAndSearch<T>(
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

type injectedProps = 'searchValue'
    | 'onSearchValueChange'
    | 'searchOptions'
    | 'searchOptionsFiltered'
    | 'showPopup'
    | 'setShowPopup'
    | 'onShowPopupChange';

const defaultOptions: unknown[] = [];

type Props<T, K extends OptionKey> = Omit<SelectInputBaseProps<T, K>, injectedProps> & {
    maxDisplayOptions?: number;
};

function SelectInput<T = DefaultItem, K extends OptionKey = string>(props: Props<T, K>) {
    const {
        maxDisplayOptions,
        placeholder,
        options = defaultOptions as T[],
        labelSelector,
        ...otherProps
    } = props;

    const [searchValue, setSearchValue] = useState<string | undefined>(undefined);
    const [showPopup, setShowPopup] = useState(false);

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

    const defaultPlaceholder = maxDisplayOptions === undefined || !showPopup
        ? 'Select an option'
        : 'Search for an option';

    return (
        <SelectInputBase
            searchOptionsFiltered={isTruthyString(searchValue)}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            searchOptions={searchOptions}

            showPopup={showPopup}
            onShowPopupChange={setShowPopup}

            placeholder={placeholder || defaultPlaceholder}
            options={options}
            labelSelector={labelSelector}
            {...otherProps}
        />
    );
}

export default SelectInput;
