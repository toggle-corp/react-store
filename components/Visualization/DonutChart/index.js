import React, {
    Fragment,
    PureComponent,
} from 'react';
import { PropTypes } from 'prop-types';
import { schemeAccent } from 'd3-scale-chromatic';
import { select, event } from 'd3-selection';
import { arc, pie } from 'd3-shape';
import { scaleOrdinal } from 'd3-scale';
import { interpolateNumber } from 'd3-interpolate';
import 'd3-transition'; // https://github.com/d3/d3-selection/issues/185
import SvgSaver from 'svgsaver';

import Responsive from '../../General/Responsive';
import Float from '../../View/Float';

import { getStandardFilename } from '../../../utils/common';
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
     * Data to be represented
     * Each data point must have a label and value field
     */
    data: PropTypes.arrayOf(PropTypes.object),
    /**
     * Handle save functionality
     */
    setSaveFunction: PropTypes.func,
    /**
     * Select the value of data point
     */
    valueSelector: PropTypes.func.isRequired,
    /**
     * Select the label of data point
     */
    labelSelector: PropTypes.func.isRequired,
    /**
     * Array of colors as hex color codes
     */
    colorSelector: PropTypes.func,
    /**
     * Modifier function to change label
     */
    labelModifier: PropTypes.func,
    /**
     * Ratio of the width of annulus to the outerRadius where outerRadius
     * is calculated based on the size of chart.
     */
    sideLengthRatio: PropTypes.number,
    /**
     * Array of colors as hex color codes
     */
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    /**
     * Additional css classes passed from parent
     */
    className: PropTypes.string,
    /**
     * If true hide the labels from chart
     */
    hideLabel: PropTypes.bool,
};

const defaultProps = {
    data: [],
    setSaveFunction: () => {},
    colorScheme: schemeAccent,
    colorSelector: undefined,
    className: '',
    sideLengthRatio: 0.4,
    labelModifier: undefined,
    hideLabel: false,
};

/**
 * Donut Chart is a variation of Pie Chart with an area of center cut out.
 * Donut Chart de-emphasizes the use of area and focuses more on representing
 * values as arcs length.
 * <a href="https://github.com/d3/d3-shape#pies">d3.pie</a>
 */
class DonutChart extends PureComponent {
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

    setContext = (data, width, height) => (
        select(this.svg)
            .datum(data)
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`)
    )

    midAngle = d => (d.startAngle + ((d.endAngle - d.startAngle) / 2));

    save = () => {
        const svg = select(this.svg);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `${getStandardFilename('donutchart', 'graph')}.svg`);
    }

    arch = (padRadius, innerRadius) => arc().padRadius(padRadius).innerRadius(innerRadius);

    textArch = (outerRadius, innerRadius) => arc()
        .outerRadius(outerRadius).innerRadius(innerRadius);

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
            .attr('height', '120%');

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
            colors,
            pies,
            arcs,
        } = options;

        const {
            valueSelector,
            colorSelector,
            labelSelector,
            labelModifier,
        } = this.props;

        element
            .selectAll('path')
            .data(pies)
            .enter()
            .append('path')
            .each((d) => {
                // eslint-disable-next-line no-param-reassign
                d.outerRadius = outerRadius - 4;
            })
            .attr('d', arcs)
            .style('fill', (d) => {
                if (colorSelector) {
                    return colorSelector(d.data);
                }
                return colors(labelSelector(d.data));
            })
            .attr('cursor', 'pointer')
            .attr('pointer-events', 'none')
            .on('mouseover', (d, i, nodes) => {
                this.arcTween(nodes[i], arcs, outerRadius, 0);
                select(nodes[i]).style('filter', 'url(#drop-shadow)');
            })
            .on('mousemove', (d) => {
                const label = labelSelector(d.data);
                const value = valueSelector(d.data);
                const textLabel = labelModifier ? labelModifier(label, value) : `${label} ${value}`;

                select(this.tooltip)
                    .html(`<span>${textLabel}</span>`)
                    .style('display', 'inline-block')
                    .style('top', () => {
                        const { height } = this.tooltip.getBoundingClientRect();
                        return `${event.pageY - height - (height / 2)}px`;
                    })
                    .style('right', () => {
                        const { width } = this.tooltip.getBoundingClientRect();
                        return `${document.body.clientWidth - event.pageX - (width / 2)}px`;
                    });
            })
            .on('mouseout', (d, i, nodes) => {
                this.arcTween(nodes[i], arcs, outerRadius - 4, 150);
                select(this.tooltip)
                    .style('display', 'none');
                select(nodes[i]).style('filter', 'none');
            });
    };

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
                pos[0] = radius * 0.95 * (this.midAngle(d) < Math.PI ? 1 : -1);
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
                pos[0] = radius * 0.95 * (this.midAngle(d) < Math.PI ? 1 : -1);
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

    drawChart = () => {
        const {
            boundingClientRect,
            valueSelector,
            data,
            sideLengthRatio,
            hideLabel,
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

        const radius = (Math.min(width, height) / 2) - 20;
        const outerRadius = radius * 0.92;
        const innerRadius = outerRadius - (outerRadius * sideLengthRatio);

        const colors = scaleOrdinal().range(colorScheme);
        const pies = pie()
            .sort(null)
            .value(valueSelector);

        const textArcs = this.textArch(outerRadius, outerRadius);
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
        };

        this.addDropShadow(select(this.svg));
        this.addPaths(slices, options);
        if (!hideLabel) {
            const labels = context.append('g').attr('class', 'labels');
            const lines = context.append('g').attr('class', 'lines');
            this.addLabels(labels, options);
            this.addLines(lines, options);
        }
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

        const svgClassName = [
            'donutchart',
            className,
        ].join(' ');

        return (
            <Fragment>
                <Float>
                    <div
                        ref={(el) => { this.tooltip = el; }}
                        className={styles.donutTooltip}
                    />
                </Float>
                <svg
                    style={{
                        width,
                        height,
                    }}
                    className={svgClassName}
                    ref={(elem) => { this.svg = elem; }}
                />
            </Fragment>
        );
    }
}

export default Responsive(DonutChart);
