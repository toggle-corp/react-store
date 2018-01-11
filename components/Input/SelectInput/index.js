import React from 'react';

import SingleSelectInput from './SingleSelectInput';
import MultiSelectInput from './MultiSelectInput';

const SelectInput = (p) => {
    const {
        multiple,
        ...props
    } = p;

    return multiple ? (
        <MultiSelectInput {...props} />
    ) : (
        <SingleSelectInput {...props} />
    );
};

export default SelectInput;
