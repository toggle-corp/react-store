import { camelToKebab } from '@togglecorp/fujs';

import defaultColors from './default/colors';
import defaultDimens from './default/dimens';

const emptyObject = {};
export const currentStyle = {};

const pendingStyleUpdateValues = {};
let styleUpdateTimeout;

const createStyleUpdateEvent = () => {
    const pendingStyleUpdateValueList = Object.keys(pendingStyleUpdateValues);
    if (pendingStyleUpdateValueList.length > 0) {
        const updateEvent = new CustomEvent('styleupdate', {
            currentStyle,
            updatedStyles: pendingStyleUpdateValues,
        });

        document.dispatchEvent(updateEvent);
    }
};

const updateCurrentStyle = (key, value) => {
    pendingStyleUpdateValues[key] = value;
    if (styleUpdateTimeout) {
        clearTimeout(styleUpdateTimeout);
    }

    styleUpdateTimeout = setTimeout(createStyleUpdateEvent, 0);
};

const setStyleProperty = (key, value) => {
    const prevValue = currentStyle[key];
    if (prevValue !== value) {
        document.documentElement.style.setProperty(
            `--${camelToKebab(key)}`,
            value,
        );

        updateCurrentStyle(key, value);
        currentStyle[key] = value;
    }
};

export const setStyleProperties = (properties) => {
    const propertyList = Object.keys(properties);

    propertyList.forEach((propertyKey) => {
        setStyleProperty(propertyKey, properties[propertyKey]);
    });
};

export const initializeStyles = (extraStyleProperties = emptyObject) => {
    setStyleProperties(defaultColors);
    setStyleProperties(defaultDimens);
    setStyleProperties(extraStyleProperties);
};
