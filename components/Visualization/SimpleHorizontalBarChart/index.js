import React, { PureComponent } from 'react';
import { schemeSet3 } from 'd3-scale-chromatic';
import {
    scaleOrdinal,
    scaleLinear,
    scaleBand,
    scalePow,
    scaleLog,
} from 'd3-scale';
import { max } from 'd3-array';
import { PropTypes } from 'prop-types';
import memoize from 'memoize-one';

import Responsive from '../../General/Responsive';
import { _cs } from '../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
    valueSelector: PropTypes.func.isRequired,
    labelSelector: PropTypes.func.isRequired,
    bandPadding: PropTypes.number,
    // colorSelector: PropTypes.func,
    className: PropTypes.string,
    scaleType: PropTypes.string,
    exponent: PropTypes.number,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
    colorScheme: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    data: [],
    bandPadding: 0.2,
    className: '',
    scaleType: 'linear',
    exponent: 1,
    margins: {
        top: 16,
        right: 16,
        bottom: 16,
        left: 16,
    },
    colorScheme: schemeSet3,
};

class SimpleHorizontalBarChart extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getRenderData = memoize((data, scaleX, scaleY, labelSelector, valueSelector) => (
        data.map((d) => {
            const label = labelSelector(d);
            const value = valueSelector(d);

            return {
                x: 0,
                y: scaleY(label),
                height: scaleY.bandwidth(),
                yOffset: scaleY.step(),
                width: scaleX(value),
                label,
                value,
            };
        })
    ))

    getMaxValue = memoize((data, valueSelector) => max(data, valueSelector))

    getScaleX = memoize((scaleType, width, maxValue, exponent) => {
        let scaleX;

        switch (scaleType) {
            case 'log':
                scaleX = scaleLog();
                scaleX.clamp(true);
                break;
            case 'exponent':
                scaleX = scalePow();
                scaleX.exponent([exponent]);
                scaleX.clamp(true);
                break;
            case 'linear':
            default:
                scaleX = scaleLinear();
        }

        scaleX.range([0, width]);
        scaleX.domain([0, maxValue]);

        return scaleX;
    })

    getScaleY = memoize((data, height, labelSelector, bandPadding) => (
        scaleBand()
            .range([height, 0])
            .domain(data.map(labelSelector))
            .padding(bandPadding)
    ))

    getScaleColor = memoize(colorScheme => scaleOrdinal().range(colorScheme))

    render() {
        const {
            className: classNameFromProps,
            data,
            boundingClientRect,
            valueSelector,
            labelSelector,
            margins,
            exponent,
            scaleType,
            bandPadding,
            colorScheme,
        } = this.props;

        const {
            width: containerWidth,
            height: containerHeight,
        } = boundingClientRect;

        const isContainerInvalid = !containerWidth;
        const isDataInvalid = !data || data.length === 0;

        if (isContainerInvalid || isDataInvalid) {
            return null;
        }

        const {
            top = 0,
            right = 0,
            bottom = 0,
            left = 0,
        } = margins;

        const width = containerWidth - left - right;
        const height = containerHeight - top - bottom;

        const maxValue = this.getMaxValue(data, valueSelector);
        const scaleX = this.getScaleX(scaleType, width, maxValue, exponent);
        const scaleY = this.getScaleY(data, height, labelSelector, bandPadding);
        const scaleColor = this.getScaleColor(colorScheme);
        const renderData = this.getRenderData(
            data,
            scaleX,
            scaleY,
            labelSelector,
            valueSelector,
        );

        const className = _cs(
            'horizontal-bar-chart',
            styles.horizontalBarChart,
            classNameFromProps,
        );

        const svgClassName = _cs(
            'svg',
            styles.svg,
        );

        const horizontalTextOffset = 6;
        const minBarHeightToRenderText = 16;

        return (
            <div className={className}>
                <svg
                    className={svgClassName}
                    width={containerWidth}
                    height={containerHeight}
                >
                    <g className={_cs(styles.bars, 'bars')}>
                        { renderData.map(d => (
                            <React.Fragment key={d.y}>
                                <rect // eslint-disable-line
                                    className={_cs(styles.bar, 'bar')}
                                    x={d.x}
                                    y={d.y}
                                    width={d.width}
                                    height={d.height}
                                >
                                    <title>
                                        { d.label } - {d.value }
                                    </title>
                                </rect>
                                { d.height > minBarHeightToRenderText && (
                                    <text
                                        className={_cs(styles.label, 'label')}
                                        x={d.x}
                                        y={d.y}
                                        dy={d.height / 2}
                                        dx={horizontalTextOffset}
                                    >
                                        {d.value } : { d.label }
                                    </text>
                                )}
                            </React.Fragment>
                        ))}
                    </g>
                    <line
                        className={_cs(styles.xAxis, 'x-axis')}
                        x1={0}
                        y1={0}
                        x2={0}
                        y2={containerHeight}
                    />
                </svg>
            </div>
        );
    }
}

export default Responsive(SimpleHorizontalBarChart);
