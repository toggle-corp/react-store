import React from 'react';
import PropTypes from 'prop-types';

import { _cs } from '@togglecorp/fujs';

import ScalableVectorGraphics from '../../View/ScalableVectorGraphics';
import iconNames from '../../../constants/iconNames';

import styles from './styles.scss';

const iconMapping = {};
export function addIcon(type, name, value) {
    iconMapping[name] = { name, value, type };
}

// Add default icons
Object.keys(iconNames).forEach((key) => {
    addIcon('font', key, iconNames[key]);
});

const Icon = ({
    className,
    name,
}) => {
    const icon = iconMapping[name];
    if (!icon) {
        return null;
    }

    switch (icon.type) {
        case 'font':
            return (
                <span className={_cs(className, icon.value)} />
            );
        case 'svg':
            return (
                <ScalableVectorGraphics
                    className={_cs(className, styles.svg)}
                    src={icon.value}
                />
            );
        default:
            console.warn('TODO: add other icon types');
            return <span>ICO</span>;
    }
};

Icon.propTypes = {
    className: PropTypes.string,
    name: PropTypes.string,
};
Icon.defaultProps = {
    className: undefined,
    name: undefined,
};

export default Icon;
