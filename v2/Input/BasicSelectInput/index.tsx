import React, {
    useState,
    useCallback,
} from 'react';
import {
    isTruthyString,
} from '@togglecorp/fujs';

import { OptionKey } from '../../types';

import SelectInputBase, { SelectInputBaseProps } from '../SelectInputBase';
import Message from '../../View/Message';

const emptyArray: unknown[] = [];

const EmptyComponent = () => (
    <Message>
        Start typing to search for relevant options
    </Message>
);

const FilterEmptyComponent = () => (
    <Message>
        No option available for current search term
    </Message>
);

interface DefaultItem {
    key: string;
    label: string;
}

type injectedProps = 'searchValue' | 'showPopup' | 'setShowPopup';
type Props<T, K extends OptionKey> = Omit<SelectInputBaseProps<T, K>, injectedProps> & {
    onSearchValueChange: (value: string | undefined) => void;
    onOptionsChange: (options: T[]) => void;
    minSearchValueLength: number;
};

function BasicSelectInput<T = DefaultItem, K extends OptionKey = string>(props: Props<T, K>) {
    const {
        onSearchValueChange,
        onOptionsChange,
        onChange,
        minSearchValueLength,
        searchOptions: searchOptionsFromProps,
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

            if (value === undefined || value.length <= minSearchValueLength) {
                onSearchValueChange(undefined);
            } else {
                onSearchValueChange(value);
            }
        },
        [onSearchValueChange, minSearchValueLength],
    );

    const interceptedSetShowPopup = useCallback(
        (value: boolean) => {
            setShowPopup(value);
            if (value) {
                onSearchValueChange(undefined);
            }
        },
        [onSearchValueChange],
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

            emptyComponent={EmptyComponent}
            emptyWhenFilterComponent={FilterEmptyComponent}

            showPopup={showPopup}
            onShowPopupChange={interceptedSetShowPopup}

            onChange={interceptedOnChange}
            searchOptions={searchOptions}

            {...otherProps}
        />
    );
}
BasicSelectInput.defaultProps = {
    keySelector: (item: DefaultItem) => item.key,
    labelSelector: (item: DefaultItem) => item.label,
    options: [],
    minSearchValueLength: 0,
    placeholder: 'Select an option',
};

export default BasicSelectInput;
