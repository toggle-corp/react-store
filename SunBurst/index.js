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
};

const defaultProps = {
    data: [],
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
            data,
            labelAccessor,
            valueAccessor,
            boundingClientRect,
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
            .range(schemeCategory20b);

        const arch = arc()
            .startAngle(d => Math.max(0, Math.min(2 * Math.PI, x(d.x0))))
            .endAngle(d => Math.max(0, Math.min(2 * Math.PI, x(d.x1))))
            .innerRadius(d => Math.max(0, y(d.y0)))
            .outerRadius(d => Math.max(0, y(d.y1)));

        const el = select(this.svg);
        el.selectAll('*')
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
        }

        function mouseOverArc(d) {
            tooltip.html(`<span class="name">${d.data.name}</span><span class="value">${d.value}</span>`);
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
                            .attr('transform', (t) => {
                                if (t.parent === null) return 'translate(0,0)';
                                return `translate(${arch.centroid(t)})rotate(${computeTextRotation(t)})`;
                            })
                            .filter(function filtrate(t) {
                                const length = this.getComputedTextLength();
                                return filterText(t, length);
                            })
                            .attr('opacity', 0)
                            .attr('text-anchor', 'middle');
                    }
                });
        }

        slices
            .append('path')
            .attr('d', arch)
            .style('stroke', 'white')
            .style('fill', d => color((d.children ? d : d.parent).data.name))
            .on('click', handleClick)
            .on('mouseover', mouseOverArc)
            .on('mousemove', mouseMoveArc)
            .on('mouseout', mouseOutArc);

        const labels = slices
            .append('text')
            .attr('transform', (d) => {
                if (d.parent === null) return 'translate(0,0)';
                return `translate(${arch.centroid(d)})rotate(${computeTextRotation(d)})`;
            })
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

    render() {
        return (
            <div
                ref={(el) => { this.container = el; }}
            >
                <svg
                    styleName="svg"
                    ref={(elem) => { this.svg = elem; }}
                />
            </div>
        );
    }
}
