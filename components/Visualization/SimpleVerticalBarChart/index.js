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

class SimpleVerticalBarChart extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getRenderData = memoize((data, height, scaleX, scaleY, labelSelector, valueSelector) => {
        const renderData = data.map((d) => {
            const label = labelSelector(d);
            const value = valueSelector(d);
            const barHeight = scaleY(value);

            return {
                x: scaleX(label),
                y: height - barHeight,
                height: barHeight,
                width: scaleX.bandwidth(),
                label,
                value,
            };
        });

        return renderData;
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
            <div className={className}>
                <svg
                    className={svgClassName}
                    width={containerWidth}
                    height={containerHeight}
                >
                    <g className={_cs(styles.bars, 'bars')}>
                        { renderData.map(d => (
                            <React.Fragment key={d.x}>
                                <rect
                                    className={_cs(styles.bar, 'bar')}
                                    x={d.x}
                                    y={d.y}
                                    width={d.width}
                                    height={d.height}
                                >
                                    <title>
                                        { d.label } {'\n'} {d.value }
                                    </title>
                                </rect>
                            </React.Fragment>
                        ))}
                    </g>
                    <line
                        className={_cs(styles.yAxis, 'y-axis')}
                        x1={0}
                        y1={height}
                        x2={width}
                        y2={height}
                    />
                </svg>
            </div>
        );
    }
}

export default Responsive(SimpleVerticalBarChart);
