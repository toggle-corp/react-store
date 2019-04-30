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
import { _cs } from '@togglecorp/fujs';

import Tooltip from '../../View/Tooltip';
import Responsive from '../../General/Responsive';

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
    noOfTicks: PropTypes.number,
    showTicks: PropTypes.bool,
};

const defaultProps = {
    data: [],
    bandPadding: 0.2,
    className: '',
    scaleType: 'linear',
    exponent: 1,
    noOfTicks: 5,
    tickFormat: undefined,
    margins: {
        top: 16,
        right: 16,
        bottom: 16,
        left: 16,
    },
    colorScheme: schemeSet3,
    showTicks: true,
};

class SimpleVerticalBarChart extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getRenderData = memoize((
        data, height, scaleX, scaleY, labelSelector, valueSelector, margins) => {
        const { left, top, bottom } = margins;
        const renderData = data.map((d) => {
            const label = labelSelector(d);
            const value = valueSelector(d);
            const barHeight = scaleY(value);

            return {
                x: scaleX(label) + left,
                y: (height + top) - barHeight,
                height: barHeight,
                width: scaleX.bandwidth(),
                label,
                value,
            };
        });

        return renderData;
    })

    getAxisLeftData = memoize((scaleY, height, margins, noOfTicks, tickFormat) => {
        const { left, top } = margins;
        return scaleY.ticks(noOfTicks).map(v => ({
            value: tickFormat ? tickFormat(v) : v,
            x: left,
            y: (height + top) - scaleY(v),
        }));
    })

    getMaxValue = memoize((data, valueSelector) => max(data, valueSelector))

    getScaleY = memoize((scaleType, height, maxValue, exponent) => {
        let scaleY;

        switch (scaleType) {
            case 'log':
                scaleY = scaleLog();
                scaleY.clamp(true);
                break;
            case 'exponent':
                scaleY = scalePow();
                scaleY.exponent([exponent]);
                scaleY.clamp(true);
                break;
            case 'linear':
            default:
                scaleY = scaleLinear();
        }

        scaleY.range([0, height]);
        scaleY.domain([0, maxValue]);

        return scaleY;
    })

    getScaleX = memoize((data, width, labelSelector, bandPadding) => (
        scaleBand()
            .range([width, 0])
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
            tickFormat,
            noOfTicks,
            showTicks,
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

        if (height <= 0) {
            return null;
        }

        const maxValue = this.getMaxValue(data, valueSelector);
        const scaleY = this.getScaleY(scaleType, height, maxValue, exponent);
        const scaleX = this.getScaleX(data, width, labelSelector, bandPadding);
        // const scaleColor = this.getScaleColor(colorScheme);
        const renderData = this.getRenderData(
            data,
            height,
            scaleX,
            scaleY,
            labelSelector,
            valueSelector,
            margins,
        );

        const axisLeftData = this.getAxisLeftData(
            scaleY,
            height,
            margins,
            noOfTicks,
            tickFormat,
        );

        const className = _cs(
            'vertical-bar-chart',
            styles.verticalBarChart,
            classNameFromProps,
        );

        const svgClassName = _cs(
            'svg',
            styles.svg,
        );

        const horizontalTextOffset = 6;
        const minBarWidthToRenderText = 16;

        return (
            <div
                className={className}
                width={containerWidth}
                height={containerHeight}
            >
                <svg
                    className={svgClassName}
                    width={width + left + right}
                    height={height + top + bottom}
                >
                    <g className={_cs(styles.bars, 'bars')}>
                        {renderData.map(d => (
                            <React.Fragment key={d.x}>
                                <Tooltip
                                    tooltip={`${d.label}: ${d.value}`}
                                >
                                    <rect
                                        className={_cs(styles.bar, 'bar')}
                                        x={d.x}
                                        y={d.y}
                                        width={d.width}
                                        height={d.height}
                                    />
                                </Tooltip>
                            </React.Fragment>
                        ))}
                    </g>
                    <g>
                        <line
                            className={_cs(styles.xAxis, 'x-axis')}
                            x1={left}
                            y1={height + top}
                            x2={width + left}
                            y2={height + top}
                        />
                        <g className={_cs(styles.yAxis, 'y-axis')}>
                            <line
                                className={_cs(styles.line, 'line')}
                                x1={left}
                                y1={top}
                                x2={left}
                                y2={height + top}
                            />
                            { showTicks &&
                                axisLeftData.map((d, i) => (
                                    <g
                                        className={_cs(styles.ticks, 'ticks')}
                                        key={`tick-${d.value}`}
                                        transform={`translate(${d.x}, ${d.y})`}
                                    >
                                        <line
                                            className={_cs(styles.line, 'line')}
                                            x1={0}
                                            x2={-5}
                                        />
                                        <text
                                            className={_cs(styles.label, 'label')}
                                            y={0.5}
                                            x={-6}
                                            dy="0.32em"
                                        >
                                            {d.value}
                                        </text>
                                    </g>
                                ))
                            }
                        </g>
                    </g>
                </svg>
            </div>
        );
    }
}

export default Responsive(SimpleVerticalBarChart);
