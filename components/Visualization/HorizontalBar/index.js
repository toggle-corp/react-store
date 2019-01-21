import React, {
    PureComponent,
    Fragment,
} from 'react';
import { select } from 'd3-selection';
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
import { transition } from 'd3-transition';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';

import Responsive from '../../General/Responsive';
import {
    getStandardFilename,
    getColorOnBgColor,
} from '../../../utils/common';
import Float from '../../View/Float';

import styles from './styles.scss';

const dummy = transition;

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    setSaveFunction: PropTypes.func,
    data: PropTypes.arrayOf(PropTypes.object),
    valueSelector: PropTypes.func.isRequired,
    labelSelector: PropTypes.func.isRequired,
    bandPadding: PropTypes.number,
    colorSelector: PropTypes.func,
    valueLabelFormat: PropTypes.func,
    showGridLines: PropTypes.bool,
    showTooltip: PropTypes.bool,
    tooltipContent: PropTypes.func,
    tiltLabels: PropTypes.bool,
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

    getColor = (d) => {
        const {
            labelSelector,
            colorSelector,
        } = this.props;

        if (colorSelector) {
            return colorSelector(d);
        }
        return this.colors(labelSelector(d));
    }

    save = () => {
        const svg = select(this.svg);

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

    addGrid = (group) => {
        const { valueLabelFormat } = this.props;

        const xAxis = axisBottom(this.x)
            .tickSizeInner(-this.height)
            .tickSizeOuter(0)
            .tickPadding(10)
            .tickFormat(valueLabelFormat);

        const yAxis = axisLeft(this.y)
            .tickSizeInner(-this.width)
            .tickSizeOuter(0)
            .tickPadding(10);

        group
            .append('g')
            .attr('id', 'xaxis')
            .attr('class', styles.grid)
            .attr('transform', `translate(0, ${this.height})`)
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
        const svg = select(this.svg);
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

        const { width, height } = boundingClientRect;

        const {
            top = 0,
            right = 0,
            bottom = 0,
            left = 0,
        } = margins;

        this.width = width - left - right;
        this.height = height - top - bottom;

        if (this.width < 0) this.width = 0;
        if (this.height < 0) this.height = 0;

        this.group = select(this.svg)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        const maxValue = max(data, d => valueSelector(d));

        if (scaleType === 'log') {
            this.x = scaleLog()
                .range([0, this.width])
                .clamp(true)
                .domain([0.1, maxValue]);
        } else if (scaleType === 'linear') {
            this.x = scaleLinear()
                .range([0, this.width])
                .domain([0, maxValue]);
        } else if (scaleType === 'exponent') {
            this.x = scalePow()
                .exponent([exponent])
                .range([0, this.width])
                .clamp(true)
                .domain([0, maxValue]);
        }

        this.y = scaleBand()
            .rangeRound([this.height, 0])
            .domain(data.map(d => labelSelector(d)))
            .padding(bandPadding);

        this.colors = scaleOrdinal().range(colorScheme);

        this.addShadow(this.group);

        if (showGridLines) {
            this.addGrid(this.group);
        } else {
            this.group
                .append('g')
                .attr('id', 'xaxis')
                .attr('class', `x-axis ${styles.xAxis}`)
                .attr('transform', `translate(0, ${this.height})`)
                .call(axisBottom(this.x));

            this.group
                .append('g')
                .attr('id', 'yaxis')
                .attr('class', `y-axis ${styles.yAxis}`)
                .call(axisLeft(this.y));
        }

        if (tiltLabels) {
            this.group
                .select('#xaxis')
                .selectAll('text')
                .attr('transform', 'rotate(-45)')
                .style('text-anchor', 'end');
        }

        const groups = this.group
            .selectAll('.bar')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'bar');

        const bars = groups
            .append('rect')
            .attr('x', 0)
            .attr('y', d => this.y(labelSelector(d)))
            .attr('height', this.y.bandwidth())
            .style('fill', d => this.getColor(d))
            .on('mouseover', (d, i, nodes) => this.handleMouseOver(d, nodes[i]))
            .on('mousemove', this.handleMouseMove)
            .on('mouseout', (d, i, nodes) => this.handleMouseOut(nodes[i]));

        bars
            .transition()
            .duration(750)
            .attr('width', d => this.x(valueSelector(d)));

        this.group
            .selectAll('.x-axis')
            .selectAll('.tick line')
            .style('visibility', 'hidden');

        this.group
            .selectAll('.y-axis')
            .selectAll('.tick line')
            .style('visibility', 'hidden');

        groups
            .append('text')
            .attr('x', d => this.x(valueSelector(d)))
            .attr('y', d => this.y(labelSelector(d)) + (this.y.bandwidth() / 2))
            .attr('dy', '.35em')
            .attr('text-anchor', 'end')
            .style('fill', 'none')
            .transition()
            .delay(750)
            .text(d => (valueLabelFormat ? valueLabelFormat(valueSelector(d)) : valueSelector(d)))
            .on('end', (d, i, nodes) => {
                const barWidth = bars.nodes()[i].width.baseVal.value || 0;
                const textWidth = nodes[i].getComputedTextLength() || 0;
                const longText = textWidth > barWidth;
                const fillColor = longText ? '#000' : getColorOnBgColor(this.getColor(d));
                const newX = longText ? (barWidth + textWidth) : (barWidth);
                select(nodes[i])
                    .attr('x', newX)
                    .style('fill', fillColor);
            });

        if (scaleType === 'log') {
            this.group
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
        const { className } = this.props;
        const svgClassName = [
            'horizontal-bar',
            styles.horizontalBar,
            className,
        ].join(' ');

        const tooltipClassName = [
            'horizontal-bar-tooltip',
            styles.horizontalBarTooltip,
        ].join(' ');
        return (
            <Fragment>
                <svg
                    className={svgClassName}
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

export default Responsive(HorizontalBar);
