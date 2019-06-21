import React from 'react';
import PropTypes from 'prop-types';

import { _cs } from '@togglecorp/fujs';

import ScalableVectorGraphics from '../../View/ScalableVectorGraphics';
import iconNames from '../../../constants/iconNames';
import imagePaths from '../../../constants/imagePaths';

import styles from './styles.scss';

const iconMapping = {};
export function addIcon(type, name, value) {
    iconMapping[name] = { name, value, type };
}

// Add default icons
Object.keys(iconNames).forEach((key) => {
    addIcon('font', key, iconNames[key]);
});

// Add default images
Object.keys(imagePaths).forEach((key) => {
    addIcon('image', key, imagePaths[key]);
});

const propTypes = {
    className: PropTypes.string,
    name: PropTypes.string,
};

const defaultProps = {
    className: undefined,
    name: undefined,
};


export default class Icon extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            dummy: false,
        };
    }


    componentDidCatch() {
        // shamelessly ignored the error and initiated the re-render
        const { dummy } = this.state;
        this.setState({ dummy: !dummy });
    }

    render() {
        const {
            className,
            name,
            ...otherProps
        } = this.props;

        const icon = iconMapping[name];
        if (!icon) {
            return null;
        }

        switch (icon.type) {
            case 'font':
                return (
                    <span
                        {...otherProps}
                        className={_cs(className, icon.value)}
                    />
                );
            case 'svg':
                return (
                    <ScalableVectorGraphics
                        {...otherProps}
                        className={_cs(className, styles.svg)}
                        src={icon.value}
                    />
                );
            case 'image':
                return (
                    <img
                        alt={icon.altText}
                        {...otherProps}
                        className={_cs(className, styles.image)}
                        src={icon.value}
                    />
                );
            default:
                console.warn('TODO: add other icon types');
                return <span>ICO</span>;
        }
    }
}
