import React, {
    PureComponent,
    Fragment,
} from 'react';
import { select, event } from 'd3-selection';
import {
    extent,
    max,
    min,
    histogram,
    thresholdSturges,
} from 'd3-array';
import { scaleLinear } from 'd3-scale';
import {
    axisBottom,
    axisLeft,
} from 'd3-axis';
import { color } from 'd3-color';

import PropTypes from 'prop-types';

import styles from './styles.scss';

import Numeral from '../../View/Numeral';
import Responsive from '../../General/Responsive';
import Float from '../../View/Float';

const emptyObject = {};

const propTypes = {
    /**
     * Array of numeric values to be represented as histogram
     */
    data: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    /**
     * Size of the parent element/component (passed by the Responsive hoc)
     */
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    /**
     * Array of two colors to map height of histogram
     */
    colorRange: PropTypes.arrayOf(PropTypes.object),
    /**
     * if showAxis is true, axis is shown
     */
    showAxis: PropTypes.bool,
    /**
     * if showGrids is true, grids are shown
     */
    showGrids: PropTypes.bool,
    /**
     * modify the values to be shown in tooltip when hovered over histogram
     */
    tooltipContent: PropTypes.func,
    /**
     * Format the tick value shown in axis
     * see <a href="https://github.com/d3/d3-scale/blob/master/README.md#tickFormat">tickFormat</a>
     */
    tickFormat: PropTypes.func,
    /**
     * show tooltip if true
     */
    showTooltip: PropTypes.bool,
    /**
     * Thresholds function to use for binning
     */
    thresholds: PropTypes.func,
    /**
     * Additional classes
     */
    className: PropTypes.string,
    /**
     * Margins for the chart
     */
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),

};

const defaultProps = {
    // TODO: use global styling variables
    colorRange: [
        color('rgba(90, 198, 198, 1)').brighter(),
        color('rgba(90, 198, 198, 1)').darker(),
    ],
    showAxis: true,
    showGrids: true,
    thresholds: thresholdSturges,
    className: '',
    tickFormat: d => (
        Numeral.renderText({
            value: d,
            precision: 1,
            normal: true,
        })
    ),
    tooltipContent: undefined,
    showTooltip: true,

    // TODO: use global styling variables
    margins: {
        top: 10,
        right: 20,
        bottom: 30,
        left: 30,
    },
};

/**
 * Histogram shows the underlying frequency distribution of continuous data.
 * The area of bar indicates the frequency of occurrences of each bin. However
 * here the width of each bin is constant so height can represent the frequency.
 */
class Histogram extends PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    onMouseOver = (d) => {
        const {
            showTooltip,
            tooltipContent,
        } = this.props;

        if (showTooltip) {
            const defaultContent = `
                <span>
                    ${Numeral.renderText({ value: d.length, precision: 0 })}
                </span>
            `;

            const content = tooltipContent ? tooltipContent(d) : defaultContent;

            this.tooltip.innerHTML = content;
            this.tooltip.style.display = 'block';
        }
    }

    onMouseMove = () => {
        const { style } = this.tooltip;

        const { width, height } = this.tooltip.getBoundingClientRect();

        const { pageX: xpos, pageY: ypos } = event;

        style.top = `${ypos - height - 10}px`;
        style.left = `${(xpos - (width / 2))}px`;
    }

    onMouseOut = () => {
        this.tooltip.style.display = 'none';
    }

    drawChart = () => {
        const {
            data,
            colorRange,
            boundingClientRect,
            margins,
            showAxis,
            showGrids,
            tickFormat,
            thresholds,
        } = this.props;

        if (!boundingClientRect.width || !data || data.length === 0) {
            return;
        }

        const {
            width: fullWidth,
            height: fullHeight,
        } = boundingClientRect;

        const {
            left = 0,
            top = 0,
            right = 0,
            bottom = 0,
        } = margins;

        const width = fullWidth - left - right;
        const height = fullHeight - top - bottom;

        if (width < 0 || height < 0) {
            return;
        }

        const dataExtent = extent(data);

        const x = scaleLinear()
            .domain(dataExtent).nice()
            .range([0, width]);

        const bins = histogram()
            .domain(x.domain())
            .thresholds(thresholds)(data);

        const y = scaleLinear()
            .domain([0, max(bins, d => d.length)]).nice()
            .range([height, 0]);

        const yMax = max(bins, d => d.length);
        const yMin = min(bins, d => d.length);

        const colorScale = scaleLinear()
            .domain([yMin, yMax])
            .range(colorRange);

        const group = select(this.svg)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        group
            .selectAll('.bar')
            .data(bins)
            .enter()
            .append('g')
            .attr('class', `bar ${styles.bar}`)
            .append('rect')
            .attr('x', (d) => {
                if ((x(d.x1) - x(d.x0)) <= 0) {
                    return 0;
                }
                return x(d.x0) + 1;
            })
            .attr('width', (d) => {
                if ((x(d.x1) - x(d.x0)) <= 0) {
                    return width;
                }
                return Math.max(0, x(d.x1) - x(d.x0) - 1);
            })
            .attr('y', d => y(d.length))
            .attr('height', d => y(0) - y(d.length))
            .attr('fill', d => colorScale(d.length))
            .on('mouseover', this.onMouseOver)
            .on('mousemove', this.onMouseMove)
            .on('mouseout', this.onMouseOut);

        if (showAxis) {
            group
                .append('g')
                .attr('class', `xaxis ${styles.xaxis}`)
                .attr('transform', `translate(0, ${height})`)
                .call(
                    axisBottom(x)
                        .tickFormat(tickFormat),
                );

            group
                .append('g')
                .attr('class', `yaxis ${styles.yaxis}`)
                .call(
                    axisLeft(y)
                        .tickFormat(tickFormat),
                );
        }

        if (showGrids) {
            group
                .append('g')
                .attr('class', `yaxis-grids ${styles.yaxisGrids}`)
                .call(
                    axisLeft(y)
                        .tickSizeInner(-width),
                );
        }
    };

    redrawChart = () => {
        const svg = select(this.svg);
        svg.selectAll('*').remove();
        this.drawChart();
    };

    render() {
        const {
            className: classNameFromProps,
            boundingClientRect: {
                width,
                height,
            } = emptyObject,
        } = this.props;

        const className = [
            'histogram',
            styles.histogram,
            classNameFromProps,
        ].join(' ');

        const tooltipClassName = [
            'tooltip',
            styles.tooltip,
        ].join(' ');

        return (
            <Fragment>
                <svg
                    className={className}
                    style={{
                        width,
                        height,
                    }}
                    ref={(elem) => { this.svg = elem; }}
                />
                <Float>
                    <div
                        ref={(el) => { this.tooltip = el; }}
                        className={tooltipClassName}
                    />
                </Float>
            </Fragment>
        );
    }
}

export default Responsive(Histogram);
