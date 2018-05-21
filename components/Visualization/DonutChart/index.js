import React, {
    PureComponent,
} from 'react';
import { PropTypes } from 'prop-types';
import { schemeAccent } from 'd3-scale-chromatic';
import { select } from 'd3-selection';
import { arc, pie } from 'd3-shape';
import { scaleOrdinal } from 'd3-scale';
import { interpolateNumber } from 'd3-interpolate';
import SvgSaver from 'svgsaver';

import Responsive from '../../General/Responsive';
import BoundError from '../../General/BoundError';

import { getStandardFilename, getColorOnBgColor } from '../../../utils/common';
import styles from './styles.scss';

/**
 * boundingClientRect: the width and height of the container.
 * data: the data to use to plot pie chart.
 * valueAccessor: return the value for the unit data.
 * labelAccessor: returns the individual label from a unit data.
 * colorScheme: array of hex color values.
 * className: additional class name for styling.
 */
const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
    valueAccessor: PropTypes.func.isRequired,
    labelAccessor: PropTypes.func.isRequired,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    className: PropTypes.string,
};

const defaultProps = {
    data: [],
    colorScheme: schemeAccent,
    className: '',
    loading: false,
};


@BoundError()
@Responsive
export default class DonutChart extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    setContext = (data, width, height) => (
        select(this.svg)
            .datum(data)
            .append('g')
            .attr('width', width)
            .attr('height', height)
            .attr('transform', `translate(${width / 2}, ${height / 2})`)
    )

    save = () => {
        const svg = select(this.svg);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `${getStandardFilename('donutchart', 'graph')}.svg`);
    }


    arch = (padRadius, innerRadius) =>
        arc().padRadius(padRadius).innerRadius(innerRadius);


    textArch = (outerRadius, innerRadius) =>
        arc().outerRadius(outerRadius).innerRadius(innerRadius);

    arcTween = (element, arcs, newRadius, delay) => (
        select(element)
            .transition()
            .duration(delay)
            .attrTween('d', (d) => {
                const i = interpolateNumber(d.outerRadius, newRadius);
                return function tween(t) {
                    // eslint-disable-next-line no-param-reassign
                    d.outerRadius = i(t);
                    return arcs(d);
                };
            })
    );

    addTransition = (element, arcs, period) => {
        element
            .selectAll('path')
            .transition()
            .duration((d, i) => i * period)
            .attrTween('d', (d) => {
                const i = interpolateNumber(d.startAngle + 0.1, d.endAngle);
                return function tween(t) {
                    // eslint-disable-next-line no-param-reassign
                    d.endAngle = i(t);
                    return arcs(d);
                };
            })
            .transition()
            .attr('pointer-events', '');
    };

    addDropShadow = (svg) => {
        const defs = svg.append('defs');

        const filter = defs
            .append('filter')
            .attr('id', 'drop-shadow')
            .attr('height', '130%');

        filter
            .append('feGaussianBlur')
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', 2)
            .attr('result', 'blur');

        filter
            .append('feOffset')
            .attr('in', 'blur')
            .attr('result', 'offsetBlur');

        filter
            .append('feFlood')
            .attr('flood-color', '#F8F8F8')
            .attr('flood-opacity', 1)
            .attr('result', 'colorBlur');

        filter
            .append('feComposite')
            .attr('in', 'colorBlur')
            .attr('in2', 'offsetBlur')
            .attr('operator', 'in');

        const feMerge = filter.append('feMerge');
        feMerge
            .append('feMergeNode')
            .attr('in', 'offsetBlur');
        feMerge
            .append('feMergeNode')
            .attr('in', 'SourceGraphic');
    };

    addPaths = (element, options) => {
        const {
            outerRadius,
            innerRadius,
            colors,
            pies,
            arcs,
            valueAccessor,
            labelAccessor,
        } = options;

        element
            .selectAll('path')
            .data(pies)
            .enter()
            .append('path')
            .each((d) => {
                // eslint-disable-next-line no-param-reassign
                d.outerRadius = outerRadius - 10;
            })
            .attr('d', arcs)
            .style('fill', d => colors(labelAccessor(d.data)))
            .attr('cursor', 'pointer')
            .attr('pointer-events', 'none')
            .on('mouseenter', (node) => {
                const label = labelAccessor(node.data);
                const value = valueAccessor(node.data);
                const nodeColor = colors(label);

                element
                    .append('circle')
                    .attr('class', 'tooltip-circle')
                    .attr('r', innerRadius - 10)
                    .style('fill', nodeColor);

                element
                    .append('text')
                    .attr('class', 'tooltip-circle')
                    .style('text-anchor', 'middle')
                    .text(`${label} ${value}`)
                    .style('fill', getColorOnBgColor(nodeColor))
                    .style('font-size', '2em');
            })
            .on('mouseover', (d, i, nodes) => {
                this.arcTween(nodes[i], arcs, outerRadius, 0);
                select(nodes[i]).style('filter', 'url(#drop-shadow)');
            })
            .on('mouseout', (d, i, nodes) => {
                element
                    .selectAll('.tooltip-circle')
                    .remove();
                this.arcTween(nodes[i], arcs, outerRadius - 10, 150);
                select(nodes[i]).style('filter', 'none');
            });
    };

    redrawChart = () => {
        const context = select(this.svg);
        context.selectAll('*').remove();
        this.drawChart();
    }

    drawChart = () => {
        const {
            boundingClientRect,
            labelAccessor,
            valueAccessor,
            data,
        } = this.props;

        if (!boundingClientRect.width || !data || data.length === 0) {
            return;
        }

        if (!boundingClientRect.width) {
            return;
        }

        const { width, height } = boundingClientRect;

        const context = this.setContext(data, width, height);
        const slices = context.append('g').attr('class', 'slices');

        const radius = Math.min(width, height) / 2;
        const outerRadius = radius * 0.8;
        const innerRadius = outerRadius - (outerRadius / 3);

        const colors = scaleOrdinal().range(this.props.colorScheme);
        const pies = pie()
            .sort(null)
            .value(valueAccessor);

        const textArcs = this.textArch(outerRadius, innerRadius);
        const arcs = this.arch(outerRadius, innerRadius);
        const period = 200;

        const options = {
            radius,
            outerRadius,
            innerRadius,
            colors,
            pies,
            arcs,
            textArcs,
            period,
            labelAccessor,
            valueAccessor,
        };

        this.addDropShadow(select(this.svg));
        this.addPaths(slices, options);
        this.addTransition(slices, arcs, period);
    }

    render() {
        const {
            className,
        } = this.props;

        const svgClassName = [
            'donutchart',
            styles.donutchart,
            className,
        ].join(' ');

        return (
            <svg
                className={svgClassName}
                ref={(elem) => { this.svg = elem; }}
            />
        );
    }
}
