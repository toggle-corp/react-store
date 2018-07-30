import PropTypes from 'prop-types';
import React from 'react';

import { scaleLinear, scaleBand } from 'd3-scale';
import { axisLeft, axisBottom } from 'd3-axis';
import { select } from 'd3-selection';
import { max, min } from 'd3-array';

import Responsive from '../../General/Responsive';
import Tooltip from '../Tooltip';

import styles from './styles.scss';

/*
  TODO:
  1. Axis label auto padding
  */
const propTypes = {
    /*
     * Padding between bars
     */
    barPadding: PropTypes.number,
    /*
     * Data
     * [{
     *    xKey: value,
     *    yKey: value,
     *  },...]
     */
    className: PropTypes.string,

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
    /*
     * Highlight which bar
     */
    highlightBarX: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    /*
     * Chart Margins
     */
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
    /*
     * if length is greater, than rotate X-axis label
     */
    maxNuOfRow: PropTypes.number,
    /*
     * key for for x-axis and y-axis in Data
     */
    updateFromProps: PropTypes.bool,
    xKey: PropTypes.string.isRequired,
    yKey: PropTypes.string.isRequired,
    xGrid: PropTypes.bool,
    yGrid: PropTypes.bool,
    boundingClientRect: PropTypes.object.isRequired, // eslint-disable-line
    xTickFormat: PropTypes.func,
    yTickFormat: PropTypes.func,
    tooltipRender: PropTypes.func.isRequired,
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


class BarChart extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { data } = props;

        this.state = {
            data,
        };

        this.scaleX = scaleBand()
            .padding(this.props.barPadding);
        this.scaleY = scaleLinear();
    }

    componentDidMount() {
        this.updateRender();
    }

    componentWillReceiveProps(nextProps) {
        // TODO: Is there better way ?
        // TODO: also use nexProps for updateFromProps
        const { data } = nextProps;
        if (this.props.updateFromProps) {
            this.setData(data);
        }
    }

    componentDidUpdate() {
        this.updateRender();
    }

    onMouseOver = (d) => {
        this.tooltip.setTooltip(this.props.tooltipRender(d));
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
        const { right, top, left, bottom } = this.props.margins;
        const { height, width } = this.props.boundingClientRect;

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
        const renderData = this.state.data;
        const { margins, xGrid, yGrid, xTickFormat, yTickFormat, yTicks, xKey, yKey } = this.props;
        const { top, bottom, left, right } = margins;
        const height = this.svgContainer.offsetHeight - top - bottom;
        const width = this.svgContainer.offsetWidth - right - left;
        const nuOfRow = renderData.length;

        this.scaleX.domain(renderData.map(d => d[this.props.xKey]));
        this.scaleY.domain([min([0, min(renderData, d => d[this.props.yKey])]),
            max([0, max(renderData, d => d[this.props.yKey])])]);
        this.scaleX.range([0, width]);
        this.scaleY.range([height, 0]);

        const svg = select(this.svg);
        svg.select('*').remove();

        if (renderData.length === 0) {
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

        if (nuOfRow > this.props.maxNuOfRow) {
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
            .data(renderData)
            .enter()
            .append('rect')
            .attr('class', d => (
                d[xKey] === this.props.highlightBarX ? 'bar bar-selected' : 'bar'
            ))
            .attr('x', d => this.scaleX(d[xKey]))
            .attr('y', d => (
                d[yKey] > 0 ? this.scaleY(d[yKey]) : this.scaleY(0)
            ))
            .attr('width', this.scaleX.bandwidth())
            .attr('height', d => (
                (d[yKey] > 0 ? this.scaleY(0) - this.scaleY(d[yKey]) :
                    this.scaleY(d[yKey]) - this.scaleY(0)) || 0.01
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
