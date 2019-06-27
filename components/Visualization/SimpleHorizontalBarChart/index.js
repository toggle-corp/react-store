import React, { PureComponent } from 'react';
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

import Numeral from '../../View/Numeral';
import Tooltip from '../../View/Tooltip';
import Responsive from '../../General/Responsive';

import styles from './styles.scss';

const propTypes = {
    /**
     * Size of the parent element/component (passed by the Responsive hoc)
     */
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    /**
     * Array of data elements each having a label and value
     */
    data: PropTypes.arrayOf(PropTypes.object),
    /**
     * Select the value of element
     */
    valueSelector: PropTypes.func.isRequired,
    /**
     * Select the label of element
     */
    labelSelector: PropTypes.func.isRequired,
    /**
     * Padding between two bars as proportion to bar width
     */
    bandPadding: PropTypes.number,
    /**
     * Additional css classes passed from parent
     */
    className: PropTypes.string,
    /**
     * type of scaling used for bar length
     * one of ['exponent', 'log', 'linear']
     * see <a href="https://github.com/d3/d3-scale/blob/master/README.md">d3.scale</a>
     */
    scaleType: PropTypes.string,
    /**
     * if exponent scaleType, set the current exponent to specified value
     */
    exponent: PropTypes.number,
    /**
     * Margins for the chart
     */
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
    /**
     * Format how ticks are shown
     */
    tickFormat: PropTypes.func,
    /**
     * Number of ticks to be shown
     */
    noOfTicks: PropTypes.number,
    /**
     * if true, tick on axis are shown
     */
    showTicks: PropTypes.bool,
    /**
     * if true, grid lines are drawn
     */
    showGrids: PropTypes.bool,
    /**
     * if true, x-axis is hidden
     */
    hideXAxis: PropTypes.bool,
    /**
     * if true, y-axis is hidden
     */
    hideYAxis: PropTypes.bool,
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
    showTicks: true,
    showGrids: true,
    hideXAxis: false,
    hideYAxis: false,
};

const MIN_BAR_HEIGHT = 22;

/**
 * Represent categorical data with horizontal bars with values proportional to the
 * length of each bar.
 */
class SimpleHorizontalBarChart extends PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    getRenderData = memoize(
        (data, scaleX, scaleY, labelSelector, valueSelector, maxValue, margins) => {
            const { left } = margins;
            const bandwidth = scaleY.bandwidth();
            const step = scaleY.step();

            return (
                data.map((d) => {
                    const label = labelSelector(d);
                    const value = valueSelector(d);

                    return {
                        x: left,
                        y: scaleY(label),
                        height: bandwidth,
                        yOffset: step,
                        width: scaleX(value),
                        label,
                        value,
                        percent: parseFloat(value / maxValue).toFixed(2),
                    };
                })
            );
        },
    )

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

    getScaleY = memoize((data, top, height, labelSelector, bandPadding) => {
        const scale = scaleBand()
            .range([height, top])
            .domain(data.map(labelSelector))
            .padding(bandPadding);

        let barsHeight = height;
        const stepOffset = MIN_BAR_HEIGHT - scale.bandwidth();

        if (stepOffset > 0) {
            const newHeight = (scale.paddingOuter() * 2)
                + ((scale.step() + stepOffset) * data.length);
            scale.range([newHeight, top]);

            barsHeight = newHeight;
        }

        return {
            barsHeight,
            scaleY: scale,
        };
    })

    getScaleColor = memoize(colorScheme => scaleOrdinal().range(colorScheme))

    getAxisBottomData = memoize((scaleX, margins, noOfTicks, tickFormat) => {
        const { left = 0 } = margins;
        return scaleX.ticks(noOfTicks).map(v => ({
            value: tickFormat ? tickFormat(v) : v,
            x: scaleX(v) + left,
            y: 0,
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
            tickFormat,
            noOfTicks,
            showTicks,
            showGrids,
            hideXAxis,
            hideYAxis,
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
        const {
            barsHeight,
            scaleY,
        } = this.getScaleY(data, top, height, labelSelector, bandPadding);

        const renderData = this.getRenderData(
            data,
            scaleX,
            scaleY,
            labelSelector,
            valueSelector,
            maxValue,
            margins,
        );

        const axisBottomData = this.getAxisBottomData(
            scaleX,
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
        const heightXAxis = 30;

        return (
            <div
                className={className}
                style={{
                    width: containerWidth,
                    height: containerHeight,
                }}
            >
                <div
                    className={styles.overflowContainer}
                    style={{
                        marginTop: top,
                    }}
                >
                    <svg
                        className={svgClassName}
                        width={width}
                        height={barsHeight}
                    >
                        <g className={_cs(styles.grid, 'grid')}>
                            { showGrids
                                && axisBottomData.map(d => (
                                    <line
                                        key={`grid-${d.x}`}
                                        className={_cs(styles.yGrid, 'y-grid')}
                                        x1={d.x + 0.5}
                                        y1={top}
                                        x2={d.x + 0.5}
                                        y2={barsHeight}
                                    />
                                ))
                            }
                        </g>
                        <g className={_cs(styles.bars, 'bars')}>
                            { renderData.map(d => (
                                <React.Fragment key={d.y}>
                                    <Tooltip
                                        tooltip={`${d.label}: ${Numeral.renderText({
                                            value: d.value,
                                            precision: 0,
                                        })} (${d.percent}%)`}
                                    >
                                        <rect // eslint-disable-line
                                            className={_cs(styles.bar, 'bar')}
                                            x={d.x}
                                            y={d.y}
                                            width={d.width}
                                            height={d.height}
                                        />
                                    </Tooltip>
                                    <text
                                        className={_cs(styles.label, 'axis-label')}
                                        x={d.x}
                                        y={d.y}
                                        dy={(d.height / 2) + 4}
                                        dx={horizontalTextOffset}
                                    >
                                        { d.label }
                                        :
                                        {Numeral.renderText({
                                            value: d.value,
                                            precision: 0,
                                        })}
                                    </text>
                                </React.Fragment>
                            ))}
                        </g>
                        {!hideYAxis && (
                            <line
                                className={_cs(styles.yAxis, 'y-axis')}
                                x1={left + 0.5}
                                y1={top}
                                x2={left + 0.5}
                                y2={barsHeight}
                            />
                        )}
                    </svg>
                </div>
                {!hideXAxis && (
                    <div
                        className={styles.axesContainer}
                        style={{
                            height: heightXAxis,
                        }}
                    >
                        <svg
                            className={styles.axes}
                            width={width}
                            height={heightXAxis}
                        >
                            <g className={_cs(styles.xAxis, 'x-axis')}>
                                <line
                                    className={_cs(styles.line, 'x-axis-line')}
                                    x1={left}
                                    y1={0.5}
                                    x2={width}
                                    y2={0.5}
                                />
                                { showTicks
                                    && axisBottomData.map(d => (
                                        <g
                                            className={_cs(styles.tick, 'x-axis-tick')}
                                            key={`tick-${d.value}`}
                                            transform={`translate(${d.x}, ${d.y})`}
                                        >
                                            <line
                                                className={_cs(styles.dash, 'x-axis-tick-dash')}
                                                x1={0.5}
                                                y1={5}
                                                x2={0.5}
                                                y2={0}
                                            />
                                            <text
                                                className={_cs(styles.label, 'x-axis-tick-label')}
                                                y={6}
                                                x={0.5}
                                                dy="0.71em"
                                            >
                                                {Numeral.renderText({
                                                    value: d.value,
                                                    precision: 1,
                                                    normal: true,
                                                })}
                                            </text>
                                        </g>
                                    ))
                                }
                            </g>
                        </svg>
                    </div>
                ) }
            </div>
        );
    }
}
export default Responsive(SimpleHorizontalBarChart);
