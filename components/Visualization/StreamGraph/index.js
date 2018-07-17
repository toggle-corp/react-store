import React, {
    Fragment,
    PureComponent,
} from 'react';
import SvgSaver from 'svgsaver';
import { PropTypes } from 'prop-types';
import { schemeSet1 } from 'd3-scale-chromatic';
import {
    select,
    event,
    mouse,
} from 'd3-selection';
import {
    scaleLinear,
    scaleOrdinal,
} from 'd3-scale';
import {
    area,
    stack,
    stackOffsetWiggle,
    stackOrderInsideOut,
    curveBasis,
} from 'd3-shape';
import { keys } from 'd3-collection';
import {
    extent,
    min,
    max,
} from 'd3-array';
import { areaLabel } from 'd3-area-label';
import { axisBottom } from 'd3-axis';

import Responsive from '../../General/Responsive';
import Float from '../../View/Float';

import {
    getStandardFilename,
    getColorOnBgColor,
} from '../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
        }),
    ).isRequired,
    setSaveFunction: PropTypes.func,
    className: PropTypes.string,
    labelAccessor: PropTypes.func.isRequired,
    labelName: PropTypes.string.isRequired,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    setSaveFunction: () => {},
    className: '',
    colorScheme: schemeSet1,
    margins: {
        top: 10,
        right: 10,
        bottom: 50,
        left: 50,
    },
};

class StreamGraph extends PureComponent {
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

    onMouseOver = (d, i) => {
        const {
            group,
        } = this;

        group
            .selectAll('.layer')
            .transition()
            .duration(250)
            .attr('opacity', (e, j) => (j === i ? 1 : 0.6))
            .attr('storke-width', '0px');

        group
            .select('.mouse-line')
            .style('opacity', '1');
    }

    onMouseMove = (d, i, nodes) => {
        const {
            x,
            labels,
            tooltip,
            group,
            height,
        } = this;

        const {
            data,
            labelAccessor,
        } = this.props;

        const mouseXpos = mouse(nodes[i])[0];
        const xValue = Math.floor(x.invert(mouseXpos));

        const labelData = data.filter(row => labelAccessor(row) === xValue)[0] || [];
        let out = `<span>${xValue}</span>`;
        labels.forEach((label) => {
            const value = labelData[label] || 0;
            out += `<span class=${styles.label}>${label}: ${value}</span>`;
        });

        group
            .select('.mouse-line')
            .attr('d', `M${mouseXpos},${height} ${mouseXpos},${0}`);

        tooltip
            .html(out)
            .style('display', 'block')
            .style('top', `${event.pageY - 30}px`)
            .style('left', `${event.pageX + 20}px`);

        select(nodes[i])
            .classed('hover', true);
    }

    onMouseOut = (d, i, nodes) => {
        const {
            group,
            tooltip,
        } = this;

        group
            .selectAll('.layer')
            .transition()
            .duration(250)
            .attr('opacity', 1);

        group
            .select('.mouse-line')
            .style('opacity', 0);

        tooltip
            .style('display', 'none');

        select(nodes[i])
            .classed('hover', 'false');
    }

    save = () => {
        const svgsaver = new SvgSaver();
        const svg = select(this.svg);
        svgsaver.asSvg(svg.node(), `${getStandardFilename('stream-graph', 'graph')}.svg`);
    }

    init = () => {
        const {
            boundingClientRect,
            margins,
            data,
            labelName,
            labelAccessor,
            colorScheme,
        } = this.props;

        const {
            width,
            height,
        } = boundingClientRect;

        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        this.width = width - left - right;
        this.height = height - top - bottom;

        this.group = select(this.svg)
            .attr('width', this.width + left + right)
            .attr('height', this.height + top + bottom)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        this.labels = keys(data[0]).filter(d => d !== labelName);
        const values = data.map(d => labelAccessor(d));

        this.series = stack()
            .keys(this.labels)
            .order(stackOrderInsideOut)
            .offset(stackOffsetWiggle)(data);

        this.x = scaleLinear()
            .domain(extent(values))
            .range([0, this.width]);

        const stackMin = row => min(row, d => d[0]);
        const stackMax = row => max(row, d => d[1]);

        this.y = scaleLinear()
            .domain([min(this.series, stackMin), max(this.series, stackMax)])
            .range([this.height, 0])
            .nice();

        this.colors = scaleOrdinal()
            .domain(this.labels)
            .range(colorScheme);

        this.size = area()
            .x(d => this.x(labelAccessor(d.data)))
            .y0(d => this.y(d[0]))
            .y1(d => this.y(d[1]))
            .curve(curveBasis);

        this.tooltip = select(this.tip);
    }

    drawChart = () => {
        const {
            boundingClientRect,
            data,
        } = this.props;

        if (!boundingClientRect.width || !data || data.length === 0) {
            return;
        }

        this.init();
        const {
            group,
            size,
            colors,
            series,
            x,
            onMouseOver,
            onMouseMove,
            onMouseOut,
        } = this;

        group
            .selectAll('.layer')
            .data(series)
            .enter()
            .append('path')
            .attr('d', size)
            .attr('class', 'layer')
            .style('fill', d => colors(d.key))
            .attr('stroke', t => colors(t.key))
            .attr('stroke-width', '2px');

        group
            .selectAll('.area-label')
            .data(series)
            .enter()
            .append('text')
            .attr('class', 'area-label')
            .text(d => d.key)
            .style('fill', d => getColorOnBgColor(colors(d.key)))
            .style('fill-opacity', 0.7)
            .style('pointer-events', 'none')
            .attr('transform', areaLabel(size));

        group
            .append('g')
            .attr('class', styles.xAxis)
            .attr('transform', `translate(0, ${this.height})`)
            .call(axisBottom(x).tickSize(0).tickPadding(6));

        group
            .selectAll('.layer')
            .attr('opacity', 1)
            .style('cursor', 'pointer')
            .on('mouseover', onMouseOver)
            .on('mousemove', onMouseMove)
            .on('mouseout', onMouseOut);

        group
            .append('g')
            .append('path')
            .attr('class', 'mouse-line')
            .attr('pointer-events', 'none')
            .style('stroke', '#d3d3d3')
            .style('stroke-width', '1px')
            .style('opacity', '0');
    }

    redrawChart = () => {
        const svg = select(this.svg);
        svg.selectAll('*').remove();
        this.drawChart();
    }
    render() {
        const {
            className,
        } = this.props;

        const svgClassName = [
            'stream-graph',
            styles.streamGraph,
            className,
        ].join(' ');

        const tooltipClassName = [
            'stream-graph-tooltip',
            styles.streamGraphTooltip,
        ].join(' ');

        return (
            <Fragment>
                <svg
                    ref={(el) => { this.svg = el; }}
                    className={svgClassName}
                />
                <Float>
                    <div
                        ref={(el) => { this.tip = el; }}
                        className={tooltipClassName}
                    />
                </Float>
            </Fragment>
        );
    }
}

export default Responsive(StreamGraph);
