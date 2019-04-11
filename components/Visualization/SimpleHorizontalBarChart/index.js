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
import {
    _cs,
    addSeparator,
} from '@togglecorp/fujs';

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

const MIN_BAR_HEIGHT = 16;

class SimpleHorizontalBarChart extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getRenderData = memoize((data, scaleX, scaleY, labelSelector, valueSelector, maxValue) => {
        const bandwidth = scaleY.bandwidth();
        const step = scaleY.step();

        return (
            data.map((d, i) => {
                const label = labelSelector(d);
                const value = valueSelector(d);

                return {
                    x: 0,
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
    })

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

    getScaleY = memoize((data, height, labelSelector, bandPadding) => {
        const scale = scaleBand()
            .range([height, 0])
            .domain(data.map(labelSelector))
            .padding(bandPadding);

        const stepOffset = MIN_BAR_HEIGHT - scale.bandwidth();
        if (stepOffset > 0) {
            const newHeight = (scale.paddingOuter() * 2)
                + ((scale.step() + stepOffset) * data.length);
            scale.range([newHeight, 0]);

            this.svgHeight = newHeight;
        }

        return scale;
    })

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
        this.svgHeight = height;

        const maxValue = this.getMaxValue(data, valueSelector);
        const scaleX = this.getScaleX(scaleType, width, maxValue, exponent);
        const scaleY = this.getScaleY(data, height, labelSelector, bandPadding);

        // const scaleColor = this.getScaleColor(colorScheme);

        const renderData = this.getRenderData(
            data,
            scaleX,
            scaleY,
            labelSelector,
            valueSelector,
            maxValue,
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
        // const minBarHeightToRenderText = 16;

        return (
            <div
                className={className}
                width={containerWidth}
                height={containerHeight}
            >
                <svg
                    className={svgClassName}
                    width={width}
                    height={this.svgHeight}
                >
                    <g className={_cs(styles.bars, 'bars')}>
                        { renderData.map(d => (
                            <React.Fragment key={d.y}>
                                <Tooltip
                                    tooltip={`${d.label}: ${addSeparator(d.value, ',')} (${d.percent}%)`}
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
                                    className={_cs(styles.label, 'label')}
                                    x={d.x}
                                    y={d.y}
                                    dy={(d.height / 2) + 4}
                                    dx={horizontalTextOffset}
                                >
                                    { d.label }: {addSeparator(d.value, ',')}
                                </text>
                                {/* d.height > minBarHeightToRenderText && (
                                    <text
                                        className={_cs(styles.label, 'label')}
                                        x={d.x}
                                        y={d.y}
                                        dy={(d.height / 2) + 5}
                                        dx={horizontalTextOffset}
                                    >
                                        { d.label }
                                    </text>
                                ) */}
                            </React.Fragment>
                        ))}
                    </g>
                    <line
                        className={_cs(styles.xAxis, 'x-axis')}
                        x1={0}
                        y1={0}
                        x2={0}
                        y2={this.svgHeight}
                    />
                </svg>
            </div>
        );
    }
}

export default Responsive(SimpleHorizontalBarChart);
