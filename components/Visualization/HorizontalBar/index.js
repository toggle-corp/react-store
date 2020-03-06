import React, {
    PureComponent,
    Fragment,
} from 'react';
import { select, event } from 'd3-selection';
import { schemeSet3 } from 'd3-scale-chromatic';
import {
    scaleOrdinal,
    scaleLinear,
    scaleBand,
    scalePow,
    scaleLog,
} from 'd3-scale';
import {
    axisLeft,
    axisBottom,
} from 'd3-axis';
import { max } from 'd3-array';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import { _cs, getColorOnBgColor } from '@togglecorp/fujs';

import Responsive from '../../General/Responsive';
import { getStandardFilename } from '../../../utils/common';
import Float from '../../View/Float';

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
     * Handle save functionality
     */
    setSaveFunction: PropTypes.func,
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
     * Padding between two bars
     */
    bandPadding: PropTypes.number,
    /**
     * Select a color for each bar
     */
    colorSelector: PropTypes.func,
    /**
     * Format a value label displayed on top of bar
     */
    valueLabelFormat: PropTypes.func,
    /**
     * if true, show gridlines
     */
    showGridLines: PropTypes.bool,
    /**
     * if true, show tooltip
     */
    showTooltip: PropTypes.bool,
    /**
     * Modify the contents of tooltip
     */
    tooltipContent: PropTypes.func,
    /**
     * if true, tilt the labels on axis of chart
     */
    tiltLabels: PropTypes.bool,
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
     * Array of colors as hex color codes
     */
    colorScheme: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    data: [],
    setSaveFunction: () => {},
    valueLabelFormat: undefined,
    bandPadding: 0.2,
    colorSelector: undefined,
    showGridLines: false,
    showTooltip: false,
    tooltipContent: undefined,
    className: '',
    tiltLabels: false,
    scaleType: 'linear',
    exponent: 1,
    margins: {
        top: 24,
        right: 24,
        bottom: 24,
        left: 72,
    },
    colorScheme: schemeSet3,
};

/**
 * Represent categorical data with horizontal bars with values proportional to the
 * length of each bar.
 */
class HorizontalBar extends PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        if (props.setSaveFunction) {
            props.setSaveFunction(this.save);
        }
    }

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    getColor = (d, colors) => {
        const {
            labelSelector,
            colorSelector,
        } = this.props;

        if (colorSelector) {
            return colorSelector(d);
        }
        return colors(labelSelector(d));
    }

    save = () => {
        const svg = select(this.svgRef);

        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `${getStandardFilename('horizontalbar', 'graph')}.svg`);
    }

    powerOfTen = d => d / (10 ** Math.ceil(Math.log(d) / (Math.LN10))) === 1

    addShadow = (svg) => {
        const defs = svg.append('defs');

        const filter = defs
            .append('filter')
            .attr('id', 'drop-shadow')
            .attr('height', '130%');

        filter
            .append('feGaussianBlur')
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', 3)
            .attr('result', 'ambientBlur');

        filter
            .append('feGaussianBlur')
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', 2)
            .attr('result', 'castBlur');

        filter
            .append('feOffset')
            .attr('in', 'castBlur')
            .attr('dx', 3)
            .attr('dy', 4)
            .attr('result', 'offsetBlur');

        filter
            .append('feComposite')
            .attr('in', 'ambientBlur')
            .attr('in2', 'offsetBlur')
            .attr('result', 'compositeShadow');

        filter
            .append('feComponentTransfer')
            .append('feFuncA')
            .attr('type', 'linear')
            .attr('slope', 0.25);

        const feMerge = filter.append('feMerge');
        feMerge
            .append('feMergeNode');
        feMerge
            .append('feMergeNode')
            .attr('in', 'SourceGraphic');
    }

    addGrid = (group, x, y) => {
        const {
            valueLabelFormat,
            boundingClientRect: {
                width: containerWidth,
                height: containerHeight,
            },
            margins: {
                left,
                top,
                right,
                bottom,
            },
        } = this.props;

        const width = containerWidth - left - right;
        const height = containerHeight - top - bottom;

        const xAxis = axisBottom(x)
            .tickSizeInner(-height)
            .tickSizeOuter(0)
            .tickPadding(10)
            .tickFormat(valueLabelFormat);

        const yAxis = axisLeft(y)
            .tickSizeInner(-width)
            .tickSizeOuter(0)
            .tickPadding(10);

        group
            .append('g')
            .attr('id', 'xaxis')
            .attr('class', styles.grid)
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis);

        group
            .append('g')
            .attr('id', 'yaxis')
            .attr('class', styles.grid)
            .call(yAxis);
    }

    handleMouseOver = (d, node) => {
        const {
            showTooltip,
            tooltipContent,
            labelSelector,
            valueSelector,
            valueLabelFormat,
        } = this.props;


        select(node)
            .style('filter', 'url(#drop-shadow)');

        let defaultTooltipContent = '';
        const value = valueLabelFormat ? valueLabelFormat(valueSelector(d)) : valueSelector(d);
        const label = labelSelector(d);
        if (showTooltip) {
            defaultTooltipContent = `
            <span class="${styles.label}">
                 ${label || ''}
            </span>
            <span class="${styles.value}">
                 ${value || ''}
            </span>`;
            const content = tooltipContent ? tooltipContent(d) : defaultTooltipContent;

            this.tooltip.innerHTML = content;
            const { style } = this.tooltip;
            style.display = 'block';
        }
    }

    handleMouseMove = () => {
        const { style } = this.tooltip;
        const { width, height } = this.tooltip.getBoundingClientRect();
        // eslint-disable-next-line no-restricted-globals
        const x = event.pageX;

        // eslint-disable-next-line no-restricted-globals
        const y = event.pageY;

        const posX = x - (width / 2);
        const posY = y - (height + 10);

        style.top = `${posY}px`;
        style.left = `${posX}px`;
    }

    handleMouseOut = (node) => {
        const { style } = this.tooltip;
        style.display = 'none';
        select(node)
            .style('filter', 'none');
    }

    redrawChart = () => {
        const svg = select(this.svgRef);
        svg.selectAll('*').remove();
        this.drawChart();
    }

    drawChart = () => {
        const {
            data,
            boundingClientRect,
            valueSelector,
            bandPadding,
            scaleType,
            exponent,
            valueLabelFormat,
            colorScheme,
            labelSelector,
            showGridLines,
            margins,
            tiltLabels,
        } = this.props;

        if (!boundingClientRect.width || !data || data.length === 0) {
            return;
        }

        const {
            width: containerWidth,
            height: containerHeight,
        } = boundingClientRect;

        const {
            top = 0,
            right = 0,
            bottom = 0,
            left = 0,
        } = margins;

        const width = containerWidth - left - right;
        const height = containerHeight - top - bottom;


        if (width < 0) return;
        if (height < 0) return;

        const group = select(this.svgRef)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        const maxValue = max(data, d => valueSelector(d));

        let x = scaleLinear()
            .range([0, width])
            .domain([0, maxValue]);

        if (scaleType === 'log') {
            x = scaleLog()
                .range([0, width])
                .clamp(true)
                .domain([0.1, maxValue]);
        } else if (scaleType === 'exponent') {
            x = scalePow()
                .exponent([exponent])
                .range([0, width])
                .clamp(true)
                .domain([0, maxValue]);
        }

        const y = scaleBand()
            .rangeRound([height, 0])
            .domain(data.map(d => labelSelector(d)))
            .padding(bandPadding);

        const colors = scaleOrdinal().range(colorScheme);

        this.addShadow(group);

        if (showGridLines) {
            this.addGrid(group, x, y);
        } else {
            const xAxis = axisBottom(x)
                .tickSizeInner(-height)
                .tickSizeOuter(0)
                .tickPadding(10)
                .tickFormat(valueLabelFormat);

            const yAxis = axisLeft(y)
                .tickSizeInner(-width)
                .tickSizeOuter(0)
                .tickPadding(10);

            group
                .append('g')
                .attr('id', 'xaxis')
                .attr('class', `x-axis ${styles.xAxis}`)
                .attr('transform', `translate(0, ${height})`)
                .call(xAxis);
            group
                .append('g')
                .attr('id', 'yaxis')
                .attr('class', `y-axis ${styles.yAxis}`)
                .call(yAxis);
        }

        if (tiltLabels) {
            group
                .select('#xaxis')
                .selectAll('text')
                .attr('transform', 'rotate(-45)')
                .style('text-anchor', 'end');
        }

        const groups = group
            .selectAll('.bar')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'bar');

        const bars = groups
            .append('rect')
            .attr('x', 0)
            .attr('y', d => y(labelSelector(d)))
            .attr('height', y.bandwidth())
            .style('fill', d => this.getColor(d, colors))
            .style('cursor', 'pointer')
            .on('mouseover', (d, i, nodes) => this.handleMouseOver(d, nodes[i]))
            .on('mousemove', this.handleMouseMove)
            .on('mouseout', (d, i, nodes) => this.handleMouseOut(nodes[i]));

        bars
            .transition()
            .duration(750)
            .attr('width', d => x(valueSelector(d)));

        group
            .selectAll('.x-axis')
            .selectAll('.tick line')
            .style('visibility', 'hidden');

        group
            .selectAll('.y-axis')
            .selectAll('.tick line')
            .style('visibility', 'hidden');

        groups
            .append('text')
            .attr('x', d => x(valueSelector(d)))
            .attr('y', d => y(labelSelector(d)) + (y.bandwidth() / 2))
            .attr('dy', '.35em')
            .attr('text-anchor', 'end')
            .style('fill', 'none')
            .style('padding', '0 10px')
            .transition()
            .delay(750)
            .text(d => (valueLabelFormat ? valueLabelFormat(valueSelector(d)) : valueSelector(d)))
            .on('end', (d, i, nodes) => {
                const barWidth = bars.nodes()[i].width.baseVal.value || 0;
                const textWidth = nodes[i].getComputedTextLength() || 0;
                const longText = textWidth > barWidth;
                const fillColor = longText ? '#000' : getColorOnBgColor(this.getColor(d, colors));
                const newX = longText ? (barWidth + textWidth) : (barWidth);
                select(nodes[i])
                    .attr('x', newX)
                    .style('fill', fillColor);
            });

        if (scaleType === 'log') {
            group
                .select('#xaxis')
                .selectAll('.tick text')
                .text(null)
                .filter(this.powerOfTen)
                .text(10)
                .append('tspan')
                .attr('dy', '-.7em')
                .text(d => Math.round(Math.log(d) / Math.LN10));
        }
    }

    render() {
        const {
            className: classNameFromProps,
            svgStyle,
        } = this.props;

        const className = _cs(
            'horizontal-bar-chart',
            styles.horizontalBar,
            classNameFromProps,
        );

        const tooltipClassName = _cs(
            'tooltip',
            styles.tooltip,
        );

        return (
            <Fragment>
                <svg
                    className={className}
                    ref={(elem) => { this.svgRef = elem; }}
                    style={svgStyle}
                />
                <Float>
                    <div
                        className={tooltipClassName}
                        ref={(elem) => { this.tooltip = elem; }}
                    />
                </Float>
            </Fragment>
        );
    }
}

export default Responsive(HorizontalBar);
