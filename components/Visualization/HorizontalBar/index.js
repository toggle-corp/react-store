import React, {
    PureComponent,
} from 'react';
import { select } from 'd3-selection';
import { schemeSet3 } from 'd3-scale-chromatic';
import { scaleOrdinal, scaleLinear, scaleBand } from 'd3-scale';
import { axisLeft, axisBottom } from 'd3-axis';
import { max } from 'd3-array';
import { transition } from 'd3-transition';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import Responsive from '../../General/Responsive';

import styles from './styles.scss';

import { getStandardFilename, getColorOnBgColor } from '../../../utils/common';

const dummy = transition;

/**
 * boundingClientRect: the width and height of the container.
 * data: the categorical data having values.
 * labelSelector: returns the individual label from a unit data.
 * valueSelector: return the value for the unit data.
 * showGridLines: if true the gridlines are drawn.
 * className: additional class name for styling.
 * margins: the margin object with properties for the four sides(clockwise from top).
 */
const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    setSaveFunction: PropTypes.func,
    data: PropTypes.arrayOf(PropTypes.object),
    valueSelector: PropTypes.func.isRequired,
    labelSelector: PropTypes.func.isRequired,
    valueLabelSelector: PropTypes.func,
    showGridLines: PropTypes.bool,
    tiltLabels: PropTypes.bool,
    className: PropTypes.string,
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
    valueLabelSelector: undefined,
    showGridLines: true,
    className: '',
    tiltLabels: false,
    margins: {
        top: 24,
        right: 24,
        bottom: 24,
        left: 72,
    },
    colorScheme: schemeSet3,
};

/**
 * A horizontal bar graph shows categorical data with rectangular bars with length proportional
 * to values they represent.
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

    setContext = (width, height, margins) => {
        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        return select(this.svg)
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);
    }

    save = () => {
        const svg = select(this.svg);

        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `${getStandardFilename('horizontalbar', 'graph')}.svg`);
    }

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

    addLines = (func, scale, length, format) => func(scale)
        .tickSize(-length)
        .tickPadding(10)
        .tickFormat(format)

    addGrid = (svg, xscale, yscale, height, width, tickFormat) => {
        svg
            .append('g')
            .attr('id', 'xaxis')
            .attr('class', styles.grid)
            .attr('transform', `translate(0, ${height})`)
            .call(this.addLines(axisBottom, xscale, height, tickFormat));

        svg
            .append('g')
            .attr('id', 'yaxis')
            .attr('class', styles.grid)
            .call(this.addLines(axisLeft, yscale, width));
    }

    handleMouseOver = (node) => {
        select(node)
            .style('filter', 'url(#drop-shadow)');
    }

    handleMouseOut = (node) => {
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
            valueLabelSelector,
            colorScheme,
            labelSelector,
            showGridLines,
            margins,
            tiltLabels,
        } = this.props;

        if (!boundingClientRect.width || !data || data.length === 0) {
            return;
        }

        let { width, height } = boundingClientRect;
        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        width = width - left - right;
        height = height - top - bottom;

        if (width < 0) width = 0;
        if (height < 0) height = 0;

        const group = this.setContext(width, height, margins);

        const x = scaleLinear()
            .range([0, width])
            .domain([0, max(data, d => valueSelector(d))]);
        const y = scaleBand()
            .rangeRound([height, 0])
            .domain(data.map(d => labelSelector(d)))
            .padding(0.2);


        this.addShadow(group);

        if (showGridLines) {
            this.addGrid(group, x, y, height, width, valueLabelSelector);
        } else {
            const xAxis = axisBottom(x);
            const yAxis = axisLeft(y);

            group
                .append('g')
                .attr('id', 'xaxis')
                .attr('class', styles.xAxis)
                .attr('transform', `translate(0, ${height})`)
                .call(xAxis);

            group
                .append('g')
                .attr('id', 'yaxis')
                .attr('class', styles.yAxis)
                .call(yAxis);
        }

        if (tiltLabels) {
            group
                .select('#xaxis')
                .selectAll('text')
                .attr('y', 0)
                .attr('x', 9)
                .attr('dy', '0.35em')
                .attr('transform', 'rotate(-45)')
                .style('text-anchor', 'end');
        }

        const groups = group
            .selectAll('.bar')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'bar');

        const colors = scaleOrdinal()
            .range(colorScheme);

        const bars = groups
            .append('rect')
            .style('cursor', 'pointer')
            .attr('x', 0)
            .attr('y', d => y(labelSelector(d)))
            .attr('height', y.bandwidth())
            .attr('fill', d => colors(labelSelector(d)))
            .on('mouseover', (d, i, nodes) => this.handleMouseOver(nodes[i]))
            .on('mouseout', (d, i, nodes) => this.handleMouseOut(nodes[i]));

        bars
            .transition()
            .duration(750)
            .attr('width', d => x(valueSelector(d)));

        groups
            .append('text')
            .attr('x', d => x(valueSelector(d)) - 3)
            .attr('y', d => y(labelSelector(d)) + (y.bandwidth() / 2))
            .attr('dy', '.35em')
            .attr('text-anchor', 'end')
            .style('fill', 'none')
            .transition()
            .delay(750)
            .text(d => (
                valueLabelSelector ? valueLabelSelector(valueSelector(d)) : valueSelector(d)))
            .style('fill', d => getColorOnBgColor(colors(labelSelector(d))))
            .style('visibility', 'hidden')
            .on('end', (d, i, nodes) => {
                const barWidth = bars.nodes()[i].width.baseVal.value || 0;
                const textWidth = nodes[i].getComputedTextLength() || 0;
                const visibility = textWidth > barWidth ? 'hidden' : 'visible';
                select(nodes[i])
                    .style('visibility', visibility);
            });
    }

    render() {
        const { className } = this.props;
        const svgClassName = [
            'horizontal-bar',
            styles.horizontalBar,
            className,
        ].join(' ');
        return (
            <svg
                className={svgClassName}
                ref={(elem) => { this.svg = elem; }}
            />
        );
    }
}

export default Responsive(HorizontalBar);
