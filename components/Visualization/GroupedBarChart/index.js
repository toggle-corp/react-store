import React, {
    PureComponent,
    Fragment,
} from 'react';
import ReactDOMServer from 'react-dom/server';
import { PropTypes } from 'prop-types';
import {
    select,
} from 'd3-selection';
import {
    scalePoint,
    scaleOrdinal,
    scaleLinear,
    scaleBand,
} from 'd3-scale';
import { line } from 'd3-shape';
import {
    axisLeft,
    axisBottom,
} from 'd3-axis';
import { schemeAccent } from 'd3-scale-chromatic';
import { max } from 'd3-array';

import Responsive from '../../General/Responsive';
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
     * The data to be visualized
     * values: Array of categorical data grouped together
     * columns: Array of category names
     * colors: map of columns to respective colors
     * Example data:
     * {
     *     values: [
     *         { state: 'Province 1', river: 10, hills: 20 },
     *         { state: 'Province 2', river: 1, hills: 3},
     *     ],
     *     columns: ['river', 'hills'],
     *     colors: { river: '#ff00ff', hills: '#0000ff' },
     * }
     */
    data: PropTypes.shape({
        values: PropTypes.array,
        columns: PropTypes.array,
        colors: PropTypes.object,
    }).isRequired,
    /**
     * Select a group for each data value.
     */
    groupSelector: PropTypes.func.isRequired,
    /**
     * Select a group for line data value
     */
    lineDataSelector: PropTypes.func,
    /**
     * Array of colors as hex color codes.
     * It is used if colors are not provided through data.
     */
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    /**
     * Additional css classes passed from parent
     */
    className: PropTypes.string,
    /**
     * Axis arguments for x-axis
     * See <a href="https://github.com/d3/d3-axis#axis_tickArguments">tickArguments</a>
     */
    xTickArguments: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    /**
     * Axis arguments for y-axis
     * See <a href="https://github.com/d3/d3-axis#axis_tickArguments">tickArguments</a>
     */
    yTickArguments: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    /**
     * Margins for the chart
     */
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
    tooltipRenderer: PropTypes.func,
};

const defaultProps = {
    className: '',
    colorScheme: schemeAccent,
    xTickArguments: [],
    yTickArguments: [null, 's'],
    lineDataSelector: undefined,
    margins: {
        top: 10,
        right: 0,
        bottom: 40,
        left: 40,
    },
    tooltipRenderer: undefined,
};

/**
 * GroupedBarChart is used to represent and compare different categories of two or more groups.
 * It helps to better visualize and interpret differences between categories across groups as they
 * are arranged side-by-side.
 */
class GroupedBarChart extends PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    mouseOverRect = (node) => {
        const {
            key,
            value,
        } = node;
        const { tooltipRenderer } = this.props;

        const content = tooltipRenderer ? ReactDOMServer.renderToString(tooltipRenderer(node))
            : `${key}: ${value}`;

        select(this.tooltip)
            .html(`<div>${content}</div>`)
            .style('display', 'inline-block');
    }

    mouseOverCircle = (node) => {
        const {
            tooltipRenderer,
            lineDataSelector,
            groupSelector,
        } = this.props;

        const content = tooltipRenderer ? ReactDOMServer.renderToString(tooltipRenderer(node))
            : `${groupSelector(node)}: ${lineDataSelector(node)}`;

        select(this.tooltip)
            .html(`<div/>${content}</div>`)
            .style('display', 'inline-block');
    }

    mouseMove = () => {
        const { height, width } = this.tooltip.getBoundingClientRect();
        select(this.tooltip)
            // eslint-disable-next-line no-restricted-globals
            .style('top', `${event.pageY - height - (height / 2)}px`)
            // eslint-disable-next-line no-restricted-globals
            .style('left', `${event.pageX - (width / 2)}px`);
    }

    mouseOutRect = () => {
        select(this.tooltip)
            .style('display', 'none');
    }

    redrawChart = () => {
        const svg = select(this.svg);
        svg.selectAll('*').remove();
        this.drawChart();
    }

    drawChart = () => {
        const {
            boundingClientRect,
            data,
            groupSelector,
            colorScheme,
            margins,
            xTickArguments,
            yTickArguments,
            lineDataSelector,
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

        const { values = [], columns = [], colors = undefined } = data;

        const defaultColor = scaleOrdinal()
            .range(colorScheme);

        const x0 = scaleBand()
            .domain(values.map(d => groupSelector(d)))
            .rangeRound([0, width])
            .paddingInner(0.1);

        const x1 = scaleBand()
            .domain(columns)
            .rangeRound([0, x0.bandwidth()])
            .padding(0.05);

        const y = scaleLinear()
            .domain([0, max(values, d => max(columns, key => d[key]))]).nice()
            .rangeRound([height, 0]);

        const group = select(this.svg)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        group
            .append('g')
            .selectAll('g')
            .data(values)
            .enter()
            .append('g')
            .attr('transform', d => `translate(${x0(groupSelector(d))}, 0)`)
            .selectAll('rect')
            .data(d => columns.map(key => ({ key, value: d[key] })))
            .enter()
            .append('rect')
            .attr('class', `bar ${styles.bar}`)
            .on('mouseover', d => this.mouseOverRect(d))
            .on('mousemove', this.mouseMove)
            .on('mouseout', this.mouseOutRect)
            .attr('x', d => x1(d.key))
            .attr('y', d => y(d.value))
            .attr('width', x1.bandwidth())
            .attr('height', d => y(0) - y(d.value))
            .attr('fill', d => (colors ? colors[d.key] : defaultColor(d.key)));

        group
            .append('g')
            .attr('class', `x-axis ${styles.xAxis}`)
            .attr('transform', `translate(0, ${height})`)
            .call(axisBottom(x0).tickSize(0).tickPadding(6).ticks(...xTickArguments));

        group
            .append('g')
            .attr('class', `y-axis ${styles.yAxis}`)
            .call(axisLeft(y).ticks(...yTickArguments));

        if (lineDataSelector) {
            const lineX = scalePoint()
                .domain(values.map(d => groupSelector(d)))
                .rangeRound([0, width])
                .padding(0.1);

            const lineY = scaleLinear()
                .domain([0, max(values, d => max(columns, key => d[key]))]).nice()
                .rangeRound([height, 0]);

            const spline = line()
                .x(d => lineX(groupSelector(d)))
                .y(d => lineY(lineDataSelector(d)));

            group
                .append('g')
                .append('path')
                .datum(values)
                .attr('class', `${styles.line} line`)
                .attr('fill', 'none')
                .attr('d', spline);

            group
                .append('g')
                .selectAll('.dot')
                .data(values)
                .enter()
                .append('circle')
                .attr('class', `${styles.dot} dot`)
                .on('mouseover', d => this.mouseOverCircle(d))
                .on('mousemove', this.mouseMove)
                .on('mouseout', this.mouseOutRect)
                .attr('cx', d => lineX(groupSelector(d)))
                .attr('cy', d => lineY(lineDataSelector(d)))
                .attr('r', 4);
        }
    }

    render() {
        const {
            className,
            boundingClientRect: {
                width,
                height,
            },
        } = this.props;
        const svgClassName = [
            'grouped-bar-chart',
            styles.groupedBarChart,
            className,
        ].join(' ');

        return (
            <Fragment>
                <svg
                    className={svgClassName}
                    ref={(elem) => { this.svg = elem; }}
                    style={{
                        width,
                        height,
                    }}
                />
                <Float>
                    <div
                        ref={(el) => { this.tooltip = el; }}
                        className={styles.tooltip}
                    />
                </Float>
            </Fragment>
        );
    }
}

export default Responsive(GroupedBarChart);
