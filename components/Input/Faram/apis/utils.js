import { removeKey } from '../../../../utils/common';


export const createBooleanFold = keyExtractor => (values, oldFoldValue, foldKey) => {
    const possibleValues = values.filter(v => v[foldKey]);

    // Try to find a selected value which was not already selected
    // in other words, a selected value which does not match oldFoldValue
    const foldValue = possibleValues.find(v => keyExtractor(v) !== oldFoldValue) ||
        possibleValues[0];

    return {
        foldValue: foldValue && keyExtractor(foldValue),
        newValue: values.map(v => removeKey(v, foldKey)),
    };
};

export const createBooleanUnfold = keyExtractor => (value, foldValue, foldKey) => ({
    ...value,
    [foldKey]: keyExtractor(value) === foldValue,
});
