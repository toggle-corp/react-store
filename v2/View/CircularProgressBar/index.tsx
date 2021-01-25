import React from 'react';
import { arc } from 'd3-shape';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props {
    width: number;
    arcWidth: number;
    value: number;
    src: string;
    imagePadding: number;
    className?: string;
}

function CircularProgressBar(props: Props) {
    const {
        width,
        arcWidth,
        value,
        src,
        imagePadding,
        className,
    } = props;
    const height = width;
    const arcOuterRadius = width / 2;
    const arcInnerRadius = (width / 2) - arcWidth;
    const innerCircleRadius = arcInnerRadius - imagePadding;
    const imageWidth = (innerCircleRadius - (imagePadding)) * 2 * Math.sqrt(0.5);

    const arcGenerator = arc()
        .innerRadius(arcInnerRadius)
        .outerRadius(arcOuterRadius)
        .startAngle(0)
        .cornerRadius(5);


    const progressArc = (v: number) => arcGenerator({ endAngle: 2 * Math.PI * v });

    return (
        <svg className={_cs(styles.progressBar, className)} height={height} width={width}>
            <g transform={`translate(${width / 2}, ${height / 2})`}>
                <path
                    className={styles.arcBackground}
                    d={progressArc(1)}
                />
            </g>
            <g transform={`translate(${width / 2}, ${height / 2})`}>
                <path
                    className={styles.arc}
                    d={progressArc(value / 100)}
                />
            </g>
            <g transform={`translate(${width / 2}, ${height / 2})`}>
                <circle
                    className={styles.circle}
                    r={innerCircleRadius}
                />
                <image
                    width={imageWidth}
                    height={imageWidth}
                    href={src}
                    x={-(imageWidth / 2)}
                    y={-(imageWidth / 2)}
                />
            </g>
        </svg>
    );
}

export default CircularProgressBar;
