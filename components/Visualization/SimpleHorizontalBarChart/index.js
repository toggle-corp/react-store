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
import { axisBottom } from 'd3-axis';
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
    tickFormat: PropTypes.func,
    noOfTicks: PropTypes.number,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    showTicks: PropTypes.bool,
    showGrids: PropTypes.bool,
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
    showGrids: true,
};

const translateX = (scale, d, height) => {
    const x = scale(d);
    return `translate(${x}, ${height})`;
};

class SimpleHorizontalBarChart extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getRenderData = memoize((data, scaleX, scaleY, labelSelector, valueSelector, margins) => {
        const { left } = margins;
        return data.map((d) => {
            const label = labelSelector(d);
            const value = valueSelector(d);

            return {
                x: left,
                y: scaleY(label),
                height: scaleY.bandwidth(),
                yOffset: scaleY.step(),
                width: scaleX(value),
                label,
                value,
            };
        });
    });

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
                scaleX = scaleLinear().clamp(true);
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

    getAxisBottomData = memoize((scaleX, height, margins, noOfTicks, tickFormat) => {
        const { left = 0 } = margins;
        return scaleX.ticks(noOfTicks).map(v => ({
            value: tickFormat ? tickFormat(v) : v,
            x: scaleX(v) + left,
            y: height,
        }));
    })

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
            showGrids,
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
            margins,
        );
        const axisBottomData = this.getAxisBottomData(
            scaleX,
            height,
            margins,
            noOfTicks,
            tickFormat,
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
                    <g className={_cs(styles.grid, 'grid')}>
                        { showGrids &&
                            axisBottomData.map((d, i) => (
                                <line
                                    key={`grid-${d.x}`}
                                    className={_cs(styles.yGrid, 'y-grid')}
                                    x1={d.x}
                                    y1={top}
                                    x2={d.x}
                                    y2={height}
                                />
                            ))
                        }
                    </g>
                    <g className={_cs(styles.bars, 'bars')}>
                        { renderData.map(d => (
                            <React.Fragment key={d.y}>
                                <Tooltip
                                    tooltip={`${d.label}: ${d.value}`}
                                >
                                    <rect // eslint-disable-line
                                        className={_cs(styles.bar, 'bar')}
                                        x={d.x}
                                        y={d.y}
                                        width={d.width}
                                        height={d.height}
                                    />
                                </Tooltip>
                                { d.height > minBarHeightToRenderText && (
                                    <text
                                        className={_cs(styles.label, 'label')}
                                        x={d.x}
                                        y={d.y}
                                        dy={(d.height / 2) + 5}
                                        dx={horizontalTextOffset}
                                    >
                                        { d.label }
                                    </text>
                                )}
                            </React.Fragment>
                        ))}
                    </g>
                    <g>
                        <line
                            className={_cs(styles.yAxis, 'y-axis')}
                            x1={left}
                            y1={top}
                            x2={left}
                            y2={height}
                        />
                        <g className={_cs(styles.xAxis, 'x-axis')}>
                            <line
                                className={_cs(styles.line, 'line')}
                                x1={left}
                                y1={height}
                                x2={width + left}
                                y2={height}
                            />
                            { showTicks &&
                                axisBottomData.map((d, i) => (
                                    <g
                                        className={_cs(styles.ticks, 'ticks')}
                                        key={`tick-${d.value}`}
                                        transform={`translate(${d.x}, ${d.y})`}
                                    >
                                        <line
                                            className={_cs(styles.line, 'line')}
                                            y1={5}
                                            y2={0}
                                        />
                                        <text
                                            className={_cs(styles.label, 'label')}
                                            y={6}
                                            x={0.5}
                                            dy="0.71em"
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
export default Responsive(SimpleHorizontalBarChart);
