import React, {
    PureComponent,
} from 'react';
import memoize from 'memoize-one';
import { PropTypes } from 'prop-types';
import { schemeSet3 } from 'd3-scale-chromatic';
import { select } from 'd3-selection';
import { arc, pie } from 'd3-shape';
import { scaleOrdinal } from 'd3-scale';
import { interpolateNumber } from 'd3-interpolate';
import { transition } from 'd3-transition';

import Responsive from '../../General/Responsive';

import styles from './styles.scss';

// eslint-disable-next-line no-unused-vars
const dummy = transition;

const propTypes = {
    /**
     * Size of the parent element/component (passed by the Responsive hoc)
     */
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    /**
     * Handle save functionality
     */
    setSaveFunction: PropTypes.func,
    /**
     * Array of elements to be visualized.
     * Each data element consist of a label an value.
     */
    data: PropTypes.arrayOf(PropTypes.object),
    /**
     * Select value of data element
     */
    valueSelector: PropTypes.func.isRequired,
    /**
     * Select the label of data element
     */
    labelSelector: PropTypes.func.isRequired,
    /**
     * Array of colors as hex color codes
     */
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    /**
     * Additional css classes passed from parent
     */
    className: PropTypes.string,
};

const defaultProps = {
    data: [],
    setSaveFunction: () => {},
    colorScheme: schemeSet3,
    className: '',
};

/**
 * PieChart is used to represent categorical data by dividing a circle into
 * proportional segments. Each arc represents a proportion of each category.
 */
class PieChart extends PureComponent {
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

    getStyleForContainer = memoize((width, height) => ({
        width,
        height,
    }));

    setContext = (data, width, height) => (
        select(this.svg)
            .datum(data)
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`)
    )

    midAngle = d => (d.startAngle + ((d.endAngle - d.startAngle) / 2));

    addPaths = (element, options) => {
        const { labelSelector } = this.props;
        const {
            outerRadius,
            colors,
            pies,
            arcs,
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
            .style('fill', d => colors(labelSelector(d.data)))
            .attr('pointer-events', 'none')
            .attr('cursor', 'pointer')
            .on('mouseover', (d, i, nodes) => {
                this.arcTween(nodes[i], arcs, outerRadius, 0);
                select(nodes[i]).style('filter', 'url(#drop-shadow)');
            })
            .on('mouseout', (d, i, nodes) => {
                this.arcTween(nodes[i], arcs, outerRadius - 10, 150);
                select(nodes[i]).style('filter', 'none');
            });
    }

    addLabels = (element, options) => {
        const { labelSelector } = this.props;
        const {
            radius,
            pies,
            textArcs,
            period,
        } = options;

        element
            .selectAll('text')
            .data(pies)
            .enter()
            .append('text')
            .attr('dy', '.35em')
            .html(d => (`<tspan>${labelSelector(d.data)}</tspan>`))
            .attr('transform', (d) => {
                const pos = textArcs.centroid(d);
                pos[0] = radius * 0.8 * (this.midAngle(d) < Math.PI ? 1 : -1);
                return `translate(${pos})`;
            })
            .style('visibility', 'hidden')
            .transition()
            .delay((d, i) => i * period)
            .style('visibility', 'visible')
            .style('text-anchor', d => (this.midAngle(d) < Math.PI ? 'start' : 'end'))
            .style('user-select', 'none');
    }

    addLines = (element, options) => {
        const { labelSelector } = this.props;
        const {
            radius,
            outerRadius,
            colors,
            pies,
            arcs,
            textArcs,
            period,
        } = options;

        element
            .selectAll('polyline')
            .data(pies)
            .enter()
            .append('polyline')
            .each((d) => {
                // eslint-disable-next-line no-param-reassign
                d.outerRadius = outerRadius - 10;
            })
            .transition()
            .delay((d, i) => i * period)
            .attr('points', (d) => {
                const pos = textArcs.centroid(d);
                pos[0] = radius * 0.8 * (this.midAngle(d) < Math.PI ? 1 : -1);
                return [arcs.centroid(d), textArcs.centroid(d), pos];
            })
            .style('fill', 'none')
            .style('stroke-width', `${2}px`)
            .style('stroke', d => colors(labelSelector(d.data)));
    }

    redrawChart = () => {
        const context = select(this.svg);
        context.selectAll('*').remove();
        this.drawChart();
    }

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
    }


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
    )

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
    }

    drawChart = () => {
        const {
            boundingClientRect,
            data,
            valueSelector,
            colorScheme,
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
        const labels = context.append('g').attr('class', 'labels');
        const lines = context.append('g').attr('class', 'lines');

        const radius = Math.min(width, height) / 2;
        const outerRadius = radius * 0.8;

        const colors = scaleOrdinal()
            .range(colorScheme);
        const pies = pie()
            .sort(null)
            .value(valueSelector);

        const textArcs = arc()
            .outerRadius(outerRadius)
            .innerRadius(outerRadius);
        const arcs = arc()
            .padRadius(outerRadius)
            .innerRadius(0);

        const period = 200;

        const options = {
            radius,
            outerRadius,
            colors,
            pies,
            arcs,
            textArcs,
            period,
        };
        this.addDropShadow(select(this.svg));
        this.addPaths(slices, options);
        this.addLabels(labels, options);
        this.addLines(lines, options);
        this.addTransition(slices, arcs, period);
    }

    render() {
        const {
            className,
            boundingClientRect: {
                width,
                height,
            },
        } = this.props;

        const styleForContainer = this.getStyleForContainer(width, height);

        const svgClassName = [
            'piechart',
            styles.piechart,
            className,
        ].join(' ');

        return (
            <svg
                className={svgClassName}
                style={styleForContainer}
                ref={(elem) => { this.svg = elem; }}
            />
        );
    }
}

export default Responsive(PieChart);
