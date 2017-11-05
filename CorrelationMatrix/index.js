import React from 'react';
import CSSModules from 'react-css-modules';
import { scaleLinear, scaleBand, scaleSequential } from 'd3-scale';
import { interpolateGnBu } from 'd3-scale-chromatic';
import { select } from 'd3-selection';
import { max, min, range } from 'd3-array';
import { axisRight } from 'd3-axis';
import { format } from 'd3-format';
import { PropTypes } from 'prop-types';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles)
export default class CorrelationMatrix extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            boundingClientRect: {},
            render: false,
        };
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);

        setTimeout(() => {
            this.setState({
                render: true,
                boundingClientRect: this.container.getBoundingClientRect(),
            });
        }, 0);
    }

    componentDidUpdate() {
        this.renderChart();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize = () => {
        this.setState({
            render: true,
            boundingClientRect: this.container.getBoundingClientRect(),
        });
    }

    renderChart() {
        let { width, height } = this.state.boundingClientRect;
        if (!this.state.render) {
            return;
        }
        const {
            top,
            right,
            bottom,
            left,
        } = {
            top: 50,
            right: 50,
            bottom: 100,
            left: 100,
        };

        const labelsData = ['mpg', 'cyl', 'disp', 'hp', 'drat', 'wt'];
        const data = [
            [1.000000, -0.852162, -0.847551, -0.776168, 0.681172, -0.867659],
            [-0.852162, 1.000000, 0.902033, 0.832447, -0.699938, 0.782496],
            [-0.847551, 0.902033, 1.000000, 0.790949, -0.710214, 0.887980],
            [-0.776168, 0.832447, 0.790949, 1.000000, -0.448759, 0.658748],
            [0.681172, -0.699938, -0.710214, -0.448759, 1.000000, -0.712441],
            [-0.867659, 0.782496, 0.887980, 0.658748, -0.712441, 1.000000],
        ];

        const noofrows = data.length;
        const noofcols = data[0].length;

        const parentWidth = width;
        width = (0.8 * parentWidth) - left - right;
        height = height - top - bottom;

        if (width < 0) width = 0;
        if (height < 0) height = 0;

        let widthLegend = parentWidth - width - left - right;
        if (widthLegend < 0) widthLegend = 0;

        const maxValue = max(data, layer => max(layer, d => d));
        const minValue = min(data, layer => min(layer, d => d));

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
            .range([0, width]);

        const y = scaleBand()
            .domain(range(noofrows))
            .range([0, height]);

        const values = scaleLinear()
            .domain([height, 0])
            .range([minValue, maxValue]);

        const colorMap = scaleSequential(interpolateGnBu)
            .domain([minValue, maxValue]);

        const row = group.selectAll('.row')
            .data(data)
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

        cell.append('text')
            .attr('dy', '.32em')
            .attr('x', x.bandwidth() / 2)
            .attr('y', y.bandwidth() / 2)
            .attr('text-anchor', 'middle')
            .style('visibility', 'hidden')
            .style('fill', d => (d >= maxValue / 2 ? 'white' : 'black'))
            .text(d => format('.2n')(d));

        row.selectAll('.cell')
            .data((d, i) => data[i])
            .style('fill', colorMap);

        const labels = group.append('g')
            .attr('class', 'labels');

        const columnLabels = labels
            .selectAll('.column-labels')
            .data(labelsData)
            .enter()
            .append('g')
            .attr('class', 'column-labels')
            .attr('transform', (d, i) => `translate( ${x(i)}, ${height})`);

        columnLabels
            .append('line')
            .style('stroke', 'black')
            .style('stroke-width', '1px')
            .attr('x1', x.bandwidth() / 2)
            .attr('x2', x.bandwidth() / 2)
            .attr('y1', 0)
            .attr('y2', 5);

        columnLabels
            .append('text')
            .attr('x', 0)
            .attr('y', x.bandwidth() / 2)
            .attr('dy', '.5em')
            .attr('text-anchor', 'end')
            .attr('transform', 'rotate(-60)')
            .text(d => d);

        const rowLabels = labels
            .selectAll('.row-labels')
            .data(labelsData)
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
            .attr('x', -8)
            .attr('y', y.bandwidth() / 2)
            .attr('dy', '.32em')
            .attr('text-anchor', 'end')
            .text(d => d);

        const legend = select(this.svg)
            .append('g')
            .attr('width', widthLegend)
            .attr('height', height + top + bottom)
            .attr('transform', `translate(${width + left + right}, 0)`);

        legend
            .selectAll('.bars')
            .data(range(height))
            .enter()
            .append('rect')
            .attr('class', '.bars')
            .attr('y', (d, i) => i)
            .attr('x', 0)
            .attr('width', (widthLegend / 2))
            .attr('height', 1)
            .style('fill', d => colorMap(values(d)))
            .attr('transform', `translate(0, ${top})`);

        const yticks = scaleLinear()
            .range([height, 0])
            .domain([minValue, maxValue]);

        const yAxis = axisRight(yticks);

        legend
            .append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${widthLegend / 2} , ${top})`)
            .call(yAxis);
    }

    render() {
        return (
            <div
                ref={(el) => { this.container = el; }}
                styleName="correlation-matrix"
                className={this.props.className}
            >
                <svg
                    styleName="svg-chart"
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}
