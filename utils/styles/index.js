import { camelToKebab } from '@togglecorp/fujs';

import defaultColors from './default/colors';
import defaultDimens from './default/dimens';

const emptyObject = {};
export const currentStyle = {};

export const setStyleProperties = (properties) => {
    const propertyList = Object.keys(properties);

    propertyList.forEach((propertyKey) => {
        document.documentElement.style.setProperty(
            `--${camelToKebab(propertyKey)}`,
            properties[propertyKey],
        );
    });
};

export const initializeStyles = ({
    colors = defaultColors,
    dimens = defaultDimens,
} = emptyObject) => {
    setStyleProperties(colors);
    setStyleProperties(dimens);

    currentStyle.colors = { ...colors };
    currentStyle.dimens = { ...dimens };
};
