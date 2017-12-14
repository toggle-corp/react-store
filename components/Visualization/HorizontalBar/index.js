import React from 'react';
import CSSModules from 'react-css-modules';
import { select } from 'd3-selection';
import { scaleLinear, scaleBand } from 'd3-scale';
import { axisLeft, axisBottom } from 'd3-axis';
import { max } from 'd3-array';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import Responsive from '../Responsive';
import styles from './styles.scss';

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
        svgsaver.asSvg(svg.node(), `horizontalbar-${Date.now()}.svg`);
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

        if (!boundingClientRect.width) {
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

        const xx = scaleLinear()
            .range([0, width]);
        const yy = scaleLinear()
            .range([height, 0]);

        const xAxis = axisBottom(x);
        const yAxis = axisLeft(y);

        group
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis);

        group
            .append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        function addXgrid() {
            return axisBottom(xx)
                .ticks(data.length)
                .tickSize(-height)
                .tickFormat('');
        }

        function addYgrid() {
            return axisLeft(yy)
                .ticks(data.length)
                .tickSize(-width)
                .tickFormat('');
        }

        function addGrid() {
            group
                .append('g')
                .attr('class', 'grid')
                .attr('transform', `translate(0, ${height})`)
                .call(addXgrid());

            group
                .append('g')
                .attr('class', 'grid')
                .call(addYgrid());
        }

        if (showGridLines) {
            addGrid();
        }

        group
            .selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', 0)
            .attr('y', d => y(labelAccessor(d)))
            .attr('height', y.bandwidth())
            .attr('width', d => x(valueAccessor(d)))
            .attr('fill', barColor);
        console.log(barColor);
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
