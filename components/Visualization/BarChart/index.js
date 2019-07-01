import PropTypes from 'prop-types';
import React from 'react';

import { scaleLinear, scaleBand } from 'd3-scale';
import { axisLeft, axisBottom } from 'd3-axis';
import { select } from 'd3-selection';
import { max, min } from 'd3-array';

import Responsive from '../../General/Responsive';
import Tooltip from '../Tooltip';

import styles from './styles.scss';

const propTypes = {
    /**
     * Padding between bars
     */
    barPadding: PropTypes.number,
    /**
     * Data
     * [{
     *    xKey: value,
     *    yKey: value,
     *  },...]
     */
    className: PropTypes.string,
    /**
     * The data to be visualized
     */
    data: PropTypes.arrayOf(PropTypes.shape({
        x: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
        y: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
    })).isRequired,
    /**
     * Highlight which bar
     */
    highlightBarX: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    /**
     * Chart Margins
     */
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
    /**
     * if length is greater, than rotate X-axis label
     */
    maxNuOfRow: PropTypes.number,
    /**
     * key for for x-axis and y-axis in Data
     */
    updateFromProps: PropTypes.bool,
    /**
     * key for x-axis data
     */
    xKey: PropTypes.string.isRequired,
    /**
     * key for y-axis data
     */
    yKey: PropTypes.string.isRequired,
    /**
     * Show x grid lines
     */
    xGrid: PropTypes.bool,
    /**
     * Show y grid lines
     */
    yGrid: PropTypes.bool,
    /**
     * Size of the parent element/component (passed by the Responsive hoc)
     */
    boundingClientRect: PropTypes.object.isRequired, // eslint-disable-line
    /**
     * Tick format for x-axis
     */
    xTickFormat: PropTypes.func,
    /**
     * Tick format for y-axis
     */
    yTickFormat: PropTypes.func,
    /**
     * Renderer for tooltip
     */
    tooltipRender: PropTypes.func.isRequired,
    /**
     * No of y ticks
     */
    yTicks: PropTypes.number,
};

const defaultProps = {
    barPadding: 0.01,
    className: '',
    highlightBarX: null,
    margins: {
        top: 10,
        right: 10,
        bottom: 30,
        left: 30,
    },
    maxNuOfRow: 30,
    updateFromProps: true,
    xGrid: true,
    yGrid: true,
    xTickFormat: d => d,
    yTickFormat: d => d,
    yTicks: undefined,
};

/**
 * Represent categorical data with bars with values proportional to the
 * length of each bar.
 */
class BarChart extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            data,
            barPadding,
        } = props;

        this.state = { data };

        this.scaleX = scaleBand()
            .padding(barPadding);
        this.scaleY = scaleLinear();
    }

    componentDidMount() {
        this.updateRender();
    }

    componentWillReceiveProps(nextProps) {
        // TODO: Is there better way ?
        // TODO: also use nexProps for updateFromProps
        const { data } = nextProps;
        const { updateFromProps } = this.props;

        if (updateFromProps) {
            this.setData(data);
        }
    }

    componentDidUpdate() {
        this.updateRender();
    }

    onMouseOver = (d) => {
        const { tooltipRender } = this.props;

        this.tooltip.setTooltip(tooltipRender(d));
        this.tooltip.show();
    }

    onMouseMove = (d) => {
        const { xKey, yKey } = this.props;
        const { x, y } = this.barChart.node().getBoundingClientRect();

        const xPoint = this.scaleX(d[xKey]) + (this.scaleX.bandwidth() * 0.5);
        const yPoint = d[yKey] > 0 ? this.scaleY(d[yKey]) : this.scaleY(0);

        this.tooltip.move({
            x: xPoint + x,
            y: y + yPoint,
            orentation: 'top',
            paddint: 10,
            duration: 30,
        });
    }

    onMouseOut = () => {
        this.tooltip.hide();
    }

    setData = (newData) => {
        // TODO: Is there better way ?
        // Added to support sorted data from table
        this.setState({
            data: newData,
        });
    }

    setTooltip = (tooltip) => { this.tooltip = tooltip; }

    updateRender() {
        const {
            margins: {
                right,
                top,
                left,
                bottom,
            },
            boundingClientRect: {
                height,
                width,
            },
        } = this.props;

        if (!width) {
            return;
        }

        const svgHeight = height - bottom;
        const svgWidth = width - right;

        this.scaleX.range([left, svgWidth]);
        this.scaleY.range([svgHeight, top]);

        this.renderBarChart();
    }

    renderBarChart() {
        const { data } = this.state;
        const {
            margins,
            xGrid,
            yGrid,
            yTicks,
            xKey,
            yKey,
            xTickFormat,
            yTickFormat,
            maxNuOfRow,
            highlightBarX,
        } = this.props;

        const { top, bottom, left, right } = margins;
        const height = this.svgContainer.offsetHeight - top - bottom;
        const width = this.svgContainer.offsetWidth - right - left;
        const nuOfRow = data.length;

        this.scaleX.domain(data.map(d => d[xKey]));
        this.scaleY.domain([min([0, min(data, d => d[yKey])]),
            max([0, max(data, d => d[yKey])])]);
        this.scaleX.range([0, width]);
        this.scaleY.range([height, 0]);

        const svg = select(this.svg);
        svg.select('*').remove();

        if (data.length === 0) {
            return;
        }

        const xAxis = axisBottom(this.scaleX)
            .tickFormat(xTickFormat)
            .tickSizeInner(xGrid ? -height : 0)
            .tickSizeOuter(0);

        const yAxis = axisLeft(this.scaleY)
            .tickFormat(yTickFormat)
            .tickSizeInner(yGrid ? -width : 0)
            .tickSizeOuter(0);

        if (yTicks) {
            yAxis.ticks(yTicks);
        }

        const root = svg.append('g')
            .attr('transform', `translate(${left},${top})`);

        const xAxisSvg = root.append('g')
            .attr('class', `axis axis--x ${xGrid ? 'show' : 'hide'}`)
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis);

        root.append('g')
            .attr('class', `axis ${yGrid ? 'show' : 'hide'}`)
            .call(yAxis);

        if (nuOfRow > maxNuOfRow) {
            xAxisSvg.selectAll('text')
                .attr('y', 0)
                .attr('x', 9)
                .attr('dy', '.35em')
                .attr('transform', 'rotate(90)')
                .style('text-anchor', 'start')
                .style('font-size', '9px');
        }

        this.barChart = root.append('g');

        this.barChart
            .selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', d => (
                d[xKey] === highlightBarX ? 'bar bar-selected' : 'bar'
            ))
            .attr('x', d => this.scaleX(d[xKey]))
            .attr('y', d => (
                d[yKey] > 0 ? this.scaleY(d[yKey]) : this.scaleY(0)
            ))
            .attr('width', this.scaleX.bandwidth())
            .attr('height', d => (
                (d[yKey] > 0 ? this.scaleY(0) - this.scaleY(d[yKey])
                    : this.scaleY(d[yKey]) - this.scaleY(0)) || 0.01
            ))
            .on('mouseenter', this.onMouseOver)
            .on('mousemove', this.onMouseMove)
            .on('mouseleave', this.onMouseOut);
    }

    render() {
        const { className } = this.props;
        return (
            <div
                ref={(div) => { this.root = div; }}
                className={`${className} ${styles.barChart}`}
            >
                <div
                    ref={(div) => { this.svgContainer = div; }}
                    className={`content ${styles.content}`}
                >
                    <svg
                        ref={(svg) => { this.svg = svg; }}
                        className="svg"
                    />
                    <Tooltip setTooltipApi={this.setTooltip} />
                </div>
            </div>
        );
    }
}

export default Responsive(BarChart);
