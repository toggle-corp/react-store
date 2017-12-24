import React from 'react';
import CSSModules from 'react-css-modules';
import { scaleLinear, scaleBand, scaleSequential } from 'd3-scale';
import { interpolateGnBu } from 'd3-scale-chromatic';
import { select } from 'd3-selection';
import { max, min, range } from 'd3-array';
import { axisRight } from 'd3-axis';
import { format } from 'd3-format';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import Responsive from '../../General/Responsive';
import styles from './styles.scss';
import { getStandardFilename, getColorOnBgColor, getHexFromRgb } from '../../../utils/common';

/**
 * boundingClientRect: the width and height of the container.
 * data: the correlation data.
 * colorScheme: the color interpolation function.
 * showLabels: show labels on the diagram?
 * showTooltip: show the tooltip?
 * className: additional class name for styling.
 * margins: the margin object with properties for the four sides(clockwise from top).
 */
const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.shape({
        labels: PropTypes.arrayOf(PropTypes.string),
        values: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    }).isRequired,
    colorScheme: PropTypes.func,
    showLabels: PropTypes.bool,
    className: PropTypes.string,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    colorScheme: interpolateGnBu,
    showLabels: true,
    className: '',
    margins: {
        top: 100,
        right: 0,
        bottom: 0,
        left: 100,
    },
};

/*
 * CorrelationMatrix visualizes the correlation coefficients of multiple variables as colors
 * in the grid.
 * */
@Responsive
@CSSModules(styles)
export default class CorrelationMatrix extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.renderChart();
    }

    componentDidUpdate() {
        this.renderChart();
    }

    save = () => {
        const svg = select(this.svg);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), getStandardFilename('correlationmatrix', 'svg', new Date()));
    }
    renderChart() {
        const {
            boundingClientRect,
            data,
            colorScheme,
            showLabels,
            margins,
        } = this.props;

        if (!boundingClientRect.width) {
            return;
        }
        let { width, height } = boundingClientRect;

        const dataLabels = data.labels;
        const dataValues = data.values;

        const {
            top,
            right,
            bottom,
            left,

        } = margins;

        const noofrows = dataValues.length;
        const noofcols = dataValues[0].length;

        width = width - left - right;
        height = height - top - bottom;

        if (width < 0) width = 0;
        if (height < 0) height = 0;
        const matrixWidth = (0.8 * width);
        const widthLegend = width - matrixWidth;
        const legendRectWidth = widthLegend / 4 || 0;

        const maxValue = max(dataValues, layer => max(layer, d => d));
        const minValue = min(dataValues, layer => min(layer, d => d));

        const svg = select(this.svg);
        svg.selectAll('*')
            .remove();

        const group = svg
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        const x = scaleBand()
            .domain(range(noofcols))
            .range([0, matrixWidth]);

        const y = scaleBand()
            .domain(range(noofrows))
            .range([0, height]);

        const values = scaleLinear()
            .domain([height, 0])
            .range([minValue, maxValue]);

        const colorMap = scaleSequential(colorScheme)
            .domain([minValue, maxValue]);

        const row = group.selectAll('.row')
            .data(dataValues)
            .enter()
            .append('g')
            .attr('class', 'row')
            .attr('transform', (d, i) => `translate(0, ${y(i)})`);

        function handleMouseOver() {
            select(this)
                .transition()
                .select('text')
                .style('visibility', 'visible');
        }

        function handleMouseOut() {
            select(this)
                .transition()
                .select('text')
                .style('visibility', 'hidden');
        }

        const cell = row.selectAll('.cell')
            .data(d => d)
            .enter()
            .append('g')
            .attr('class', 'cell')
            .attr('transform', (d, i) => `translate(${x(i)}, 0)`)
            .on('mouseover', handleMouseOver)
            .on('mouseout', handleMouseOut);

        cell.append('rect')
            .attr('width', x.bandwidth())
            .attr('height', y.bandwidth())
            .style('stroke-width', 0);

        row.selectAll('.cell')
            .data((d, i) => dataValues[i])
            .style('fill', colorMap);

        if (showLabels) {
            cell.append('text')
                .attr('dy', '.32em')
                .attr('x', x.bandwidth() / 2)
                .attr('y', y.bandwidth() / 2)
                .attr('text-anchor', 'middle')
                .style('visibility', 'hidden')
                .style('fill', d => (d >= maxValue / 2 ? 'white' : 'black'))
                .text(d => format('.2n')(d))
                .style('fill', (d) => {
                    const colorBg = getHexFromRgb(colorMap(d));
                    return getColorOnBgColor(colorBg);
                });
        }

        const labels = group.append('g')
            .attr('class', 'labels');

        const columnLabels = labels
            .selectAll('.column-labels')
            .data(dataLabels)
            .enter()
            .append('g')
            .attr('class', 'column-labels')
            .attr('transform', (d, i) => `translate( ${x(i)}, 0)`);

        columnLabels
            .append('line')
            .style('stroke', 'black')
            .style('stroke-width', '1px')
            .attr('x1', x.bandwidth() / 2)
            .attr('x2', x.bandwidth() / 2)
            .attr('y1', 0)
            .attr('y2', -5);

        columnLabels
            .append('text')
            .attr('font-size', '.8em')
            .attr('class', 'labels')
            .attr('text-anchor', 'start')
            .attr('transform', `translate(${(x.bandwidth() / 2)}, -5)rotate(-60)`)
            .text(d => d);

        const rowLabels = labels
            .selectAll('.row-labels')
            .data(dataLabels)
            .enter()
            .append('g')
            .attr('class', 'row-labels')
            .attr('transform', (d, i) => `translate(0, ${y(i)})`);

        rowLabels
            .append('line')
            .style('stroke', 'black')
            .style('stroke-width', '1px')
            .attr('x1', 0)
            .attr('x2', -5)
            .attr('y1', y.bandwidth() / 2)
            .attr('y2', y.bandwidth() / 2);

        rowLabels
            .append('text')
            .attr('font-size', '.8em')
            .attr('x', -8)
            .attr('y', y.bandwidth() / 2)
            .attr('dy', '.32em')
            .attr('text-anchor', 'end')
            .text(d => d);

        const legend = select(this.svg)
            .append('g')
            .attr('transform', `translate(${matrixWidth + left + right + legendRectWidth}, ${top})`);

        legend
            .selectAll('rect')
            .data(range(height))
            .enter()
            .append('rect')
            .attr('y', (d, i) => i)
            .attr('x', 0)
            .attr('width', legendRectWidth)
            .attr('height', 1)
            .style('fill', d => colorMap(values(d)));

        const yticks = scaleLinear()
            .range([height, 0])
            .domain([minValue, maxValue]);

        const yAxis = axisRight(yticks);

        legend
            .append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${legendRectWidth} , 0)`)
            .call(yAxis);
    }

    render() {
        return (
            <div
                className={`correlationmatrix-container ${this.props.className}`}
                ref={(el) => { this.container = el; }}
            >
                <svg
                    className="correlation-matrix"
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}
