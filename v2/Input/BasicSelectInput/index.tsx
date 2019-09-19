import React, {
    useState,
    useCallback,
} from 'react';

import { OptionKey } from '../../types';

import SelectInputBase, { SelectInputBaseProps } from '../SelectInputBase';

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
        placeholder,
        ...otherProps
    } = props;

    const {
        options,
        keySelector,
        searchOptions,
    } = otherProps;

    const [searchValue, setSearchValue] = useState<string | undefined>(undefined);
    const [showPopup, setShowPopup] = useState(false);

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

    const defaultPlaceholder = !showPopup
        ? 'Select an option'
        : 'Search for an option';

    return (
        <SelectInputBase
            searchValue={searchValue}
            onSearchValueChange={interceptedSetSearchValue}

            showPopup={showPopup}
            onShowPopupChange={interceptedSetShowPopup}

            onChange={interceptedOnChange}

            placeholder={placeholder || defaultPlaceholder}
            {...otherProps}
        />
    );
}
BasicSelectInput.defaultProps = {
    keySelector: (item: DefaultItem) => item.key,
    labelSelector: (item: DefaultItem) => item.label,
    options: [],
    minSearchValueLength: 1,
};

export default BasicSelectInput;
