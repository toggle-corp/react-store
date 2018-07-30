import React from 'react';
import PropTypes from 'prop-types';

import { scaleLinear } from 'd3-scale';
import {
    area,
    line as d3Line,
    // curveMonotoneX,
} from 'd3-shape';
import { axisLeft, axisBottom } from 'd3-axis';
import { select, mouse } from 'd3-selection';
import { extent, bisector } from 'd3-array';

import Responsive from '../../General/Responsive';
import Tooltip from '../Tooltip';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.shape({})),
    /*
     * Chart Margins
     */
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
    xKey: PropTypes.string.isRequired,
    yKey: PropTypes.string.isRequired,
    xTickFormat: PropTypes.func,
    yTickFormat: PropTypes.func,
    xTicks: PropTypes.number,
    yTicks: PropTypes.number,
    tooltipRender: PropTypes.func.isRequired,
    boundingClientRect: PropTypes.object.isRequired, // eslint-disable-line
    showArea: PropTypes.bool,
};

const defaultProps = {
    className: 'time-series',
    data: [],
    margins: {
        top: 10,
        right: 10,
        bottom: 30,
        left: 30,
    },
    xTickFormat: d => d,
    yTickFormat: d => d,
    xTicks: undefined,
    yTicks: undefined,
    showArea: false,
};

class TimeSeries extends React.PureComponent {
    static defaultProps = defaultProps;
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.scaleX = scaleLinear();
        this.scaleY = scaleLinear();
        this.bisector = bisector(d => d[props.xKey]).left;
    }

    componentDidMount() {
        this.updateRender();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.updateRender();
        }
    }

    componentDidUpdate() {
        this.updateRender();
    }

    onMouseEnter = (overLayLine, overLayCircle) => {
        this.tooltip.show();
        overLayCircle
            .style('opacity', 1);
        overLayLine
            .style('opacity', 1);
    }

    onMouseLeave = (overLayLine, overLayCircle) => {
        this.tooltip.hide();
        overLayCircle
            .style('opacity', 0);
        overLayLine
            .style('opacity', 0);
    }

    onMouseMove = (overLay, overLayLine, overLayCircle) => {
        const { data, xKey, yKey, tooltipRender } = this.props;
        const x0 = this.scaleX.invert(mouse(overLay.node())[0]);
        const i = this.bisector(data, x0);
        const d0 = data[i - 1];
        const d1 = data[i];
        let d;

        if (d0 && d1) {
            d = x0 - d0[xKey] > d1[xKey] - x0 ? d1 : d0;
        } else {
            d = d0 || d1;
        }

        if (!d) {
            this.onMouseLeave(overLayLine, overLayCircle);
            return;
        }

        const { x, y } = overLay.node().getBoundingClientRect();
        const xPoint = this.scaleX(d[xKey] || 0);
        const yPoint = this.scaleY(d[yKey] || 0);

        this.tooltip.setTooltip(tooltipRender(d));
        this.tooltip.move({
            x: xPoint + x,
            y: y + yPoint,
            orentation: 'right',
            padding: 10,
            duration: 30,
        });

        overLayCircle
            .transition()
            .duration(30)
            .attr('cx', xPoint || 0)
            .attr('cy', yPoint || 0);
        overLayLine
            .transition()
            .duration(30)
            .attr('x', xPoint || 0);
    }

    getXTickValues = ([min, max]) => {
        const { xTicks = this.scaleX.ticks().length } = this.props;
        const interval = Math.floor((max - min) / xTicks);
        const values = [max];
        for (let i = min; i < max; i += interval) {
            values.push(i);
        }
        return values;
    }

    setTooltip = (tooltip) => { this.tooltip = tooltip; }

    updateRender() {
        const { right, top, left, bottom } = this.props.margins;
        const { height, width } = this.props.boundingClientRect;

        if (!width) {
            return;
        }

        const svgHeight = height - bottom - top;
        const svgWidth = width - right - left;

        this.scaleX.range([0, svgWidth]);
        this.scaleY.range([svgHeight, 0]);

        this.renderBarChart(svgHeight, svgWidth);
    }

    renderBarChart(height, width) {
        const {
            data, xKey, yKey, yTicks, margins, xTickFormat, yTickFormat, showArea,
        } = this.props;
        const { top, left } = margins;

        this.scaleX.domain(extent(data.map(d => d[xKey])));
        this.scaleY.domain(extent(data.map(d => d[yKey])));

        const svg = select(this.svg);
        svg.select('*').remove();

        if (data.length === 0) {
            return;
        }

        const xTickValues = this.getXTickValues(this.scaleX.domain());

        const xAxis = axisBottom(this.scaleX)
            .tickSizeInner(-height)
            // .tickSizeOuter(0)
            .tickFormat(xTickFormat)
            // .ticks(5)
            .tickValues(xTickValues);

        const yAxis = axisLeft(this.scaleY)
            .tickSizeInner(-width)
            .tickSizeOuter(0)
            .tickFormat(yTickFormat);

        if (yTicks) { yAxis.ticks(yTicks); }

        const line = d3Line()
            // .curve(curveMonotoneX)
            .x(d => this.scaleX(d[xKey] || 0))
            .y(d => this.scaleY(d[yKey] || 0));

        const root = svg.append('g')
            .attr('transform', `translate(${left},${top})`);

        root.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis);

        root.append('g')
            .attr('class', 'axis axis--y')
            .call(yAxis);

        if (showArea) {
            const lineArea = area()
                // .curve(curveMonotoneX)
                .x(d => this.scaleX(d[xKey] || 0))
                .y1(d => this.scaleY(d[yKey] || 0))
                .y0(height);

            root.append('g')
                .attr('class', 'time-area')
                .append('path')
                .data([data])
                .attr('d', lineArea);
        }

        root.append('g')
            .attr('class', 'time-path')
            .append('path')
            .data([data])
            .attr('d', line);

        const overLayLine = root.append('rect')
            .attr('class', 'overlay-line')
            .attr('width', 0.1)
            .attr('x', 0)
            .attr('height', height)
            .style('opacity', 0);

        const overLayCircle = root.append('circle')
            .attr('class', 'overlay-circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 3)
            .style('opacity', 0);

        const overLay = root.append('rect')
            .attr('class', 'overlay')
            .attr('width', width)
            .attr('height', height)
            .on('mouseenter', () =>
                this.onMouseEnter(overLayLine, overLayCircle))
            .on('mouseleave', () =>
                this.onMouseLeave(overLayLine, overLayCircle))
            .on('mousemove', () =>
                this.onMouseMove(overLay, overLayLine, overLayCircle));
    }

    render() {
        const { className } = this.props;

        return (
            <div className={`${className} ${styles.timeSeries}`} >
                <svg ref={(svg) => { this.svg = svg; }} />
                <Tooltip setTooltipApi={this.setTooltip} />
            </div>
        );
    }
}

export default Responsive(TimeSeries);
