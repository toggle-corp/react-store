import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import connectWithStyles from '../../../utils/styles/connectWithStyles';

import styles from './styles.scss';

interface Props {
    className?: string;
    currentStyles: {
        fontSizeSuperLarge: string;
        fontSizeLarge: string;
        fontSizeSmallAlt: string;
    };
    size: 'small' | 'medium' | 'large';
}

const sizeClassNameMap: {
    [key in Props['size']]: string;
} = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
};

function Spinner(props: Props) {
    const {
        className,
        currentStyles,
        size,
    } = props;

    const {
        spinnerSize,
        centerX,
        centerY,
        radius,
        strokeWidth,
    } = useMemo(
        () => {
            const sizeMapping: {
                [key in Props['size']]: string;
            } = {
                small: currentStyles.fontSizeSmallAlt,
                medium: currentStyles.fontSizeLarge,
                large: currentStyles.fontSizeSuperLarge,
            };

            const strokeMapping: {
                [key in Props['size']]: number;
            } = {
                small: 1,
                medium: 2,
                large: 3,
            };

            const spinnerStrokeWidth = strokeMapping[size];

            const spinnerSizeFromStyles = sizeMapping[size];


            const mySpinnerSize = spinnerSizeFromStyles
                .substring(0, spinnerSizeFromStyles.length - 2);
            const halfSpinnerSize = Math.floor(parseFloat(mySpinnerSize) / 2);

            return {
                spinnerSize: mySpinnerSize,
                centerX: halfSpinnerSize,
                centerY: halfSpinnerSize,
                radius: halfSpinnerSize - spinnerStrokeWidth,
                strokeWidth: spinnerStrokeWidth,
            };
        },
        [size, currentStyles],
    );

    return (
        <div className={_cs(className, styles.spinner, sizeClassNameMap[size])}>
            <svg
                className={styles.svg}
                style={{
                    width: spinnerSize,
                    height: spinnerSize,
                }}
            >
                <circle
                    className={styles.path}
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
            </svg>
        </div>
    );
}

Spinner.defaultProps = {
    size: 'medium',
};

export default connectWithStyles(Spinner);
