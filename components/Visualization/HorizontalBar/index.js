import React from 'react';
import CSSModules from 'react-css-modules';
import { select } from 'd3-selection';
import { scaleLinear, scaleBand } from 'd3-scale';
import { axisLeft, axisBottom } from 'd3-axis';
import { max } from 'd3-array';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import Responsive from '../../General/Responsive';
import styles from './styles.scss';
import { getStandardFilename, getColorOnBgColor } from '../../../utils/common';


/**
 * boundingClientRect: the width and height of the container.
 * data: the categorical data having values.
 * labelAccessor: returns the individual label from a unit data.
 * valueAccessor: return the value for the unit data.
 * barColor: the color for bars.
 * showGridLines: if true the gridlines are drawn.
 * className: additional class name for styling.
 * margins: the margin object with properties for the four sides(clockwise from top).
 */
const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
    valueAccessor: PropTypes.func.isRequired,
    labelAccessor: PropTypes.func.isRequired,
    barColor: PropTypes.string,
    showGridLines: PropTypes.bool,
    className: PropTypes.string,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    data: [],
    showGridLines: true,
    barColor: '#1693A5',
    className: '',
    margins: {
        top: 50,
        right: 50,
        bottom: 100,
        left: 100,
    },
};
/**
 * A horizontal bar graph shows categorical data with rectangular bars with length proportional
 * to values they represent.
 */
@Responsive
@CSSModules(styles)
export default class HorizontalBar extends React.PureComponent {
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

    addLines = (func, scale, length) => func(scale)
        .tickSize(-length)
        .tickPadding(10)
        .tickFormat('')

    addGrid = (svg, xscale, yscale, height, width) => {
        svg
            .append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(0, ${height})`)
            .call(this.addLines(axisBottom, xscale, height));

        svg
            .append('g')
            .attr('class', 'grid')
            .call(this.addLines(axisLeft, yscale, width));
    }

    renderChart() {
        const {
            data,
            boundingClientRect,
            valueAccessor,
            labelAccessor,
            barColor,
            showGridLines,
            margins,
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

        const svg = select(this.svg);
        svg.select('*').remove();

        const group = svg
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        const x = scaleLinear()
            .range([0, width])
            .domain([0, max(data, d => valueAccessor(d))]);

        const y = scaleBand()
            .rangeRound([height, 0])
            .domain(data.map(d => labelAccessor(d)))
            .padding(0.2);

        const xAxis = axisBottom(x);
        const yAxis = axisLeft(y);

        const textColor = getColorOnBgColor(barColor);

        group
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis);

        group
            .append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        this.addShadow(group);

        function handleMouseOver() {
            select(this)
                .style('filter', 'url(#drop-shadow)');
        }

        function handleMouseOut() {
            select(this)
                .style('filter', 'none');
        }

        if (showGridLines) {
            this.addGrid(group, x, y, height, width);
        }

        const groups = group
            .selectAll('.bar')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'bar');

        const bars = groups
            .append('rect')
            .style('cursor', 'pointer')
            .attr('x', 0)
            .attr('y', d => y(labelAccessor(d)))
            .attr('height', y.bandwidth())
            .attr('fill', barColor)
            .on('mouseover', handleMouseOver)
            .on('mouseout', handleMouseOut);

        bars
            .transition()
            .duration(750)
            .attr('width', d => x(valueAccessor(d)));

        groups
            .append('text')
            .attr('x', d => x(valueAccessor(d)) - 3)
            .attr('y', d => y(labelAccessor(d)) + (y.bandwidth() / 2))
            .attr('dy', '.35em')
            .attr('text-anchor', 'end')
            .text(d => valueAccessor(d))
            .style('fill', textColor);
    }

    render() {
        return (
            <div
                className={`horizontalbar-container ${this.props.className}`}
                ref={(el) => { this.container = el; }}
            >
                <svg
                    className="horizontalbar"
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}
