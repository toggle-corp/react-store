import camelToKebab from '@togglecorp/fujs';

import defaultColors from './default/colors';
import defaultDimens from './default/dimens';

export const setStyleProperties = (properties) => {
    const propertyList = Object.keys(properties);

    propertyList.forEach((property) => {
        document.documentElement.styles.setProperty(
            `--${camelToKebab}`,
            properties[property],
        );
    });
};

export const initializeStyles = ({
    colors = defaultColors,
    dimens = defaultDimens,
}) => {
    setStyleProperties(colors);
    setStyleProperties(dimens);
};
