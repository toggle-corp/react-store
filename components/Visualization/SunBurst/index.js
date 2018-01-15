import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import { select, event } from 'd3-selection';
import { hierarchy, partition } from 'd3-hierarchy';
import { arc } from 'd3-shape';
import { interpolateArray } from 'd3-interpolate';
import { scaleLinear, schemeCategory20c, scaleSqrt, scaleOrdinal } from 'd3-scale';
import { transition } from 'd3-transition';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';
import Responsive from '../../General/Responsive';
import styles from './styles.scss';
import { getStandardFilename, getColorOnBgColor } from '../../../utils/common';
import { LoadingAnimation } from '../../View';

/**
 * boundingClientRect: the width and height of the container.
 * data: the hierarchical data to be visualized.
 * childrenAccessor: the accessor function to return array of data representing the children.
 * labelAccessor: returns the individual label from a unit data.
 * valueAccessor: return the value for the unit data.
 * colorScheme: array of hex color values.
 * showLabels: show labels on the diagram?
 * showTooltip: show the tooltip?
 * className: additional class name for styling.
 * margins: the margin object with properties for the four sides(clockwise from top).
 */
const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.shape({
        name: PropTypes.string,
    }).isRequired,
    childrenAccessor: PropTypes.func,
    labelAccessor: PropTypes.func.isRequired,
    valueAccessor: PropTypes.func.isRequired,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    showLabels: PropTypes.bool,
    showTooltip: PropTypes.bool,
    className: PropTypes.string,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
    loading: PropTypes.bool,
};

const defaultProps = {
    childrenAccessor: d => d.children,
    colorScheme: schemeCategory20c,
    showLabels: true,
    showTooltip: true,
    className: '',
    margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    loading: false,
};

/*
 * Sunburst is a multilevel pie chart used to represent proportion of values found at each level
 * in hierarchy.
 * */
@Responsive
@CSSModules(styles)
export default class SunBurst extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.renderChart();
    }

    componentDidUpdate() {
        this.renderChart();
    }

    save = () => {
        const svg = select(this.svg);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `${getStandardFilename('sunburst', 'graph')}.svg`);
    }

    renderChart = () => {
        const {
            boundingClientRect,
            data,
            childrenAccessor,
            labelAccessor,
            valueAccessor,
            colorScheme,
            showLabels,
            showTooltip,
            margins,
        } = this.props;

        if (!boundingClientRect.width) {
            return;
        }
        let { width, height } = boundingClientRect;
        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        width = width - left - right;
        height = height - top - bottom;
        const radius = Math.min(width, height) / 2;

        const x = scaleLinear()
            .range([0, 2 * Math.PI]);
        const y = scaleSqrt()
            .range([0, radius]);
        const color = scaleOrdinal()
            .range(colorScheme);

        const arch = arc()
            .startAngle(d => Math.max(0, Math.min(2 * Math.PI, x(d.x0))))
            .endAngle(d => Math.max(0, Math.min(2 * Math.PI, x(d.x1))))
            .innerRadius(d => Math.max(0, y(d.y0)))
            .outerRadius(d => Math.max(0, y(d.y1)));

        const el = select(this.svg);
        el.selectAll('*')
            .remove();

        select(this.container)
            .selectAll('.tooltip')
            .remove();

        const tooltip = select(this.container)
            .append('div')
            .attr('class', 'tooltip')
            .style('z-index', 10)
            .style('display', 'none');

        const group = el
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate( ${width / 2}, ${height / 2})`);

        function computeTextRotation(d) {
            const angle = ((x((d.x0 + d.x1) / 2) - (Math.PI / 2)) / Math.PI) * 180;
            return (angle > 90) ? 180 + angle : angle;
            // return (angle < 90 || angle > 180) ? angle + 90 : angle - 90; // rotation as rims
        }

        function placeTextLabel(t) {
            const st = arch.startAngle()(t);
            const ed = arch.endAngle()(t);
            const angle = Math.round(Math.abs(st - ed)).toFixed(2);
            const twoPI = Math.round(2 * Math.PI).toFixed(2);
            if (t.parent === null) return 'translate(0,0)';
            if (angle >= twoPI) {
                return `translate(${arch.centroid(t)})`;
            }
            return `translate(${arch.centroid(t)})rotate(${computeTextRotation(t)})`;
        }

        function mouseOverArc(d) {
            tooltip.html(`<span class="name">${labelAccessor(d.data)}</span><span class="value">${d.value}</span>`);
            return tooltip
                .transition()
                .style('display', 'inline-block');
        }

        function mouseMoveArc() {
            return tooltip
                .style('top', `${event.pageY - 30}px`)
                .style('left', `${event.pageX + 20}px`);
        }

        function mouseOutArc() {
            return tooltip
                .transition()
                .style('display', 'none');
        }
        const partitions = partition();

        const root = hierarchy(data, childrenAccessor)
            .sum(d => valueAccessor(d));

        const slices = group
            .selectAll('g')
            .data(partitions(root)
                .descendants())
            .enter()
            .append('g');

        function filterText(d, length) {
            const innerRadius = arch.innerRadius()(d);
            const outerRadius = arch.outerRadius()(d);
            const r = outerRadius - innerRadius;
            return (r <= length);
        }

        function handleClick(d) {
            slices
                .selectAll('text')
                .transition()
                .attr('opacity', 0);
            const tran = transition()
                .duration(750);
            slices
                .transition(tran)
                .tween('scale', () => {
                    const xd = interpolateArray(x.domain(), [d.x0, d.x1]);
                    const yd = interpolateArray(y.domain(), [d.y0, 1]);
                    const yr = interpolateArray(y.range(), [d.y0 ? 20 : 0, radius]);
                    return (t) => {
                        x.domain(xd(t));
                        y.domain(yd(t))
                            .range(yr(t));
                    };
                })
                .selectAll('path')
                .attrTween('d', t => () => arch(t))
                .on('end', function addLabels(e) {
                    if (e.x0 >= d.x0 && e.x1 <= d.x1) {
                        const labelText = select(this.parentNode)
                            .select('text');
                        labelText
                            .transition()
                            .duration(750)
                            .attr('opacity', 1)
                            .attr('transform', t => placeTextLabel(t))
                            .filter(function filtrate(t) {
                                const length = this.getComputedTextLength();
                                return filterText(t, length);
                            })
                            .attr('opacity', 0)
                            .attr('text-anchor', 'middle');
                    }
                });
        }

        const arcs = slices
            .append('path')
            .attr('class', 'arcs')
            .attr('d', arch)
            .style('stroke', 'white')
            .style('fill', d => color(labelAccessor(d.children ? d.data : d.parent.data)))
            .on('click', handleClick);

        if (showTooltip) {
            arcs
                .on('mouseover', mouseOverArc)
                .on('mousemove', mouseMoveArc)
                .on('mouseout', mouseOutArc);
        }

        if (showLabels) {
            const labels = slices
                .append('text')
                .attr('class', 'labels')
                .attr('transform', d => placeTextLabel(d))
                .attr('pointer-events', 'none')
                .attr('text-anchor', 'middle')
                .text(d => labelAccessor(d.data))
                .style('fill', (d) => {
                    const colorBg = color(labelAccessor(d.children ? d.data : d.parent.data));
                    return getColorOnBgColor(colorBg);
                });

            labels
                .filter(function filtrate(d) {
                    const length = this.getComputedTextLength();
                    return filterText(d, length);
                })
                .attr('opacity', 0);
        }
    }

    render() {
        const { loading } = this.props;

        return (
            <div
                className={`sunburst-container ${this.props.className}`}
                ref={(el) => { this.container = el; }}
            >
                { loading && <LoadingAnimation /> }
                <svg
                    className="sunburst"
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}
