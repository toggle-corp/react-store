import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import { select, event } from 'd3-selection';
import { hierarchy, partition } from 'd3-hierarchy';
import { arc } from 'd3-shape';
import { interpolateArray } from 'd3-interpolate';
import { scaleLinear, schemeCategory20b, scaleSqrt, scaleOrdinal } from 'd3-scale';
import { transition } from 'd3-transition';
import { PropTypes } from 'prop-types';
import Responsive from '../Responsive';
import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.shape({
        name: PropTypes.string,
    }),
    labelAccessor: PropTypes.func.isRequired,
    valueAccessor: PropTypes.func.isRequired,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    showLabels: PropTypes.bool,
    showTooltip: PropTypes.bool,

};

const defaultProps = {
    data: [],
    colorScheme: schemeCategory20b,
    showLabels: true,
    showTooltip: true,
};

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

    renderChart() {
        const {
            boundingClientRect,
            data,
            labelAccessor,
            valueAccessor,
            colorScheme,
            showLabels,
            showTooltip,
        } = this.props;

        if (!boundingClientRect.width) {
            return;
        }
        const { width, height } = boundingClientRect;
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
            .style('position', 'absolute')
            .style('z-index', 10);

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

        const root = hierarchy(data)
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
                .text(d => labelAccessor(d.data));

            labels
                .filter(function filtrate(d) {
                    const length = this.getComputedTextLength();
                    return filterText(d, length);
                })
                .attr('opacity', 0);
        }
    }

    render() {
        return (
            <div
                className="sunburst-container"
                ref={(el) => { this.container = el; }}
            >
                <svg
                    className="sunburst"
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}
