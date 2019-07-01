import React from 'react';
import {
    scaleLinear,
    scaleBand,
    scaleSequential,
} from 'd3-scale';
import { interpolateGnBu } from 'd3-scale-chromatic';
import { select } from 'd3-selection';
import { max, min, range } from 'd3-array';
import { axisRight } from 'd3-axis';
import { format } from 'd3-format';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import {
    getColorOnBgColor,
    getHexFromRgb,
    isValidHexColor,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';

import Responsive from '../../General/Responsive';
import { getStandardFilename } from '../../../utils/common';

const propTypes = {
    /**
     * Size of the parent element/component (passed by the Responsive hoc)
     */
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    /**
     * Data to be represented
     * labels: labels are variables
     * values: a square matrix with same variables show in rows and
     * columns with each cell representing correlation between two variables
     */
    data: PropTypes.shape({
        labels: PropTypes.arrayOf(PropTypes.string),
        values: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    }).isRequired,
    /**
     * Handle save functionality
     */
    setSaveFunction: PropTypes.func,
    /**
     * Array of colors as hex color codes
     */
    colorScheme: PropTypes.func,
    /**
     * Show labels on the diagram or not
     */
    showLabels: PropTypes.bool,
    /**
     * Tilt labels or not
     */
    tiltLabels: PropTypes.bool,
    /**
     * Additional css classes passed from parent
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
    setSaveFunction: () => {},
    colorScheme: interpolateGnBu,
    showLabels: true,
    tiltLabels: false,
    className: '',
    margins: {
        top: 50,
        right: 0,
        bottom: 10,
        left: 100,
    },
};

/**
 * CorrelationMatrix visualizes the correlation
 * coefficients of multiple variables as colors in a grid
 */
class CorrelationMatrix extends React.PureComponent {
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
            left,
        } = margins;

        return select(this.svg)
            .append('g')
            .attr('transform', `translate(${left},${top})`);
    }

    save = () => {
        const svg = select(this.svg);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `${getStandardFilename('correlationmatrix', 'graph')}.svg`);
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
            colorScheme,
            margins,
        } = this.props;

        if (!boundingClientRect.width) {
            return;
        }

        if (!data || data.length === 0 || doesObjectHaveNoData(data)) {
            return;
        }
        let { width, height } = boundingClientRect;

        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        const labelsData = data.labels;
        const valuesData = data.values;

        width = width - left - right;
        height = height - top - bottom;

        if (width < 0) width = 0;
        if (height < 0) height = 0;

        const matrixWidth = (0.8 * width);
        const legendWidth = width - matrixWidth;
        const maxValue = max(valuesData, layer => max(layer, d => d));
        const minValue = min(valuesData, layer => min(layer, d => d));
        const noofrows = valuesData.length;
        const noofcols = valuesData[0].length;

        const x = scaleBand()
            .domain(range(noofcols))
            .range([0, matrixWidth]);

        const y = scaleBand()
            .domain(range(noofrows))
            .range([0, height]);

        const colors = scaleSequential(colorScheme)
            .domain([Math.floor(minValue), Math.ceil(maxValue)]);

        const group = this.setContext(width, height, margins);
        const labels = group.append('g').attr('class', 'labels');
        const legend = select(this.svg)
            .append('g')
            .attr('transform', `translate(${matrixWidth + left + right}, ${top})`);

        this.addCells(group, valuesData, x, y, colors);
        this.addLabels(labels, labelsData, x, y);
        this.addLegend(legend, height, legendWidth, colors, minValue, maxValue);
    }


    handleMouseOver = (node) => {
        select(node)
            .transition()
            .select('text')
            .style('visibility', 'visible');
    }

    handleMouseOut = (node) => {
        select(node)
            .transition()
            .select('text')
            .style('visibility', 'hidden');
    }


    addCells = (group, data, x, y, colors) => {
        const row = group
            .selectAll('.row')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'row')
            .attr('transform', (d, i) => `translate(0, ${y(i)})`);

        const cell = row
            .selectAll('.cell')
            .data(d => d)
            .enter()
            .append('g')
            .attr('class', 'cell')
            .attr('transform', (d, i) => `translate(${x(i)}, 0)`)
            .style('cursor', 'pointer')
            .on('mouseover', (d, i, nodes) => this.handleMouseOver(nodes[i]))
            .on('mouseout', (d, i, nodes) => this.handleMouseOut(nodes[i]));

        cell
            .append('rect')
            .attr('width', x.bandwidth())
            .attr('height', y.bandwidth())
            .attr('stroke', 'white')
            .attr('stroke-width', 1);

        row
            .selectAll('.cell')
            .data((d, i) => data[i])
            .style('fill', colors);
        const { showLabels } = this.props;
        if (showLabels) {
            this.addText(cell, x, y, colors);
        }
    }

    addText = (group, x, y, colors) => {
        group
            .append('text')
            .attr('dy', '.35em')
            .attr('x', x.bandwidth() / 2)
            .attr('y', y.bandwidth() / 2)
            .attr('text-anchor', 'middle')
            .style('visibility', 'hidden')
            .text(d => format('.2n')(d))
            .style('fill', (d) => {
                const color = colors(d);
                const colorBg = isValidHexColor(color) ? color : getHexFromRgb(color);
                return getColorOnBgColor(colorBg);
            });
    }

    addLabels = (group, labels, x, y) => {
        const { tiltLabels } = this.props;

        const columnLabels = group
            .selectAll('.column-labels')
            .data(labels)
            .enter()
            .append('g')
            .attr('class', 'column-labels')
            .attr('transform', (d, i) => `translate(${x(i)}, 0)`);

        columnLabels
            .append('text')
            .attr('font-size', '.8em')
            .attr('class', 'labels')
            .attr('transform', `translate(${x.bandwidth() / 2}, -5)`)
            .attr('text-anchor', 'middle')
            .text(d => d);

        const rowLabels = group
            .selectAll('.row-labels')
            .data(labels)
            .enter()
            .append('g')
            .attr('class', 'row-labels')
            .attr('transform', (d, i) => `translate(0, ${y(i)})`);

        rowLabels
            .append('text')
            .attr('font-size', '.8em')
            .attr('x', -8)
            .attr('y', y.bandwidth() / 2)
            .attr('dy', '.32em')
            .attr('text-anchor', 'end')
            .text(d => d);

        if (tiltLabels) {
            columnLabels
                .selectAll('text')
                .attr('text-anchor', 'start')
                .attr('transform', `translate(${x.bandwidth() / 2}, -5) rotate(-45)`);
        }
    }

    addLegend = (group, height, width, colors, minValue, maxValue) => {
        const rectWidth = width / 4 || 0;

        const values = scaleLinear()
            .domain([height, 0])
            .range([minValue, maxValue]);

        const legend = group
            .append('g')
            .attr('transform', `translate(${rectWidth}, 0)`);

        legend
            .selectAll('rect')
            .data(range(height))
            .enter()
            .append('rect')
            .attr('y', (d, i) => i)
            .attr('x', 0)
            .attr('width', rectWidth)
            .attr('height', 1)
            .style('fill', d => colors(values(d)));

        const yticks = scaleLinear()
            .range([height, 0])
            .domain([minValue, maxValue]);

        const yAxis = axisRight(yticks);

        legend
            .append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${rectWidth}, 0)`)
            .call(yAxis);
    }

    render() {
        const {
            className,
            boundingClientRect: {
                width,
                height,
            },
        } = this.props;

        const correlationMatrixStyle = [
            'correlation-matrix',
            className,
        ].join(' ');

        return (
            <svg
                className={correlationMatrixStyle}
                ref={(elem) => { this.svg = elem; }}
                style={{
                    width,
                    height,
                }}
            />
        );
    }
}

export default Responsive(CorrelationMatrix);
