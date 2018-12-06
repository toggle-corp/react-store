import React, {
    Fragment,
    PureComponent,
} from 'react';
import { PropTypes } from 'prop-types';
import { schemeAccent } from 'd3-scale-chromatic';
import { select, event } from 'd3-selection';
import { arc, pie } from 'd3-shape';
import "d3-transition"
import { scaleOrdinal } from 'd3-scale';
import { interpolateNumber } from 'd3-interpolate';
import SvgSaver from 'svgsaver';

import Responsive from '../../General/Responsive';
import Float from '../../View/Float';

import { getStandardFilename } from '../../../utils/common';
import styles from './styles.scss';

/**
 * boundingClientRect: the width and height of the container.
 * data: the data to use to plot pie chart.
 * valueSelector: return the value for the unit data.
 * labelSelector: returns the individual label from a unit data.
 * colorScheme: array of hex color values.
 * className: additional class name for styling.
 */
const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
    setSaveFunction: PropTypes.func,
    valueSelector: PropTypes.func.isRequired,
    labelSelector: PropTypes.func.isRequired,
    labelModifier: PropTypes.func,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    className: PropTypes.string,
};

const defaultProps = {
    data: [],
    setSaveFunction: () => {},
    colorScheme: schemeAccent,
    className: '',
    labelModifier: undefined,
};

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
            .style('fill', d => colors(labelSelector(d.data)))
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
                    .style('top', `${event.pageY - 30}px`)
                    .style('right', `${document.body.clientWidth - event.pageX}px`);
            })
            .on('mouseout', (d, i, nodes) => {
                this.arcTween(nodes[i], arcs, outerRadius - 4, 150);
                select(this.tooltip)
                    .style('display', 'none');
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
            valueSelector,
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
        const outerRadius = radius * 0.92;
        const innerRadius = outerRadius - (outerRadius / 3);

        const colors = scaleOrdinal().range(this.props.colorScheme);
        const pies = pie()
            .sort(null)
            .value(valueSelector);

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
                    className={svgClassName}
                    ref={(elem) => { this.svg = elem; }}
                />
            </Fragment>
        );
    }
}

export default Responsive(DonutChart);
