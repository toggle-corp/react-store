import React, { PureComponent } from 'react';
import { select } from 'd3-selection';
import { hierarchy, partition } from 'd3-hierarchy';
import { arc } from 'd3-shape';
import { interpolateArray } from 'd3-interpolate';
import { scaleLinear, schemeCategory20b, scaleSqrt, scaleOrdinal } from 'd3-scale';
import { transition } from 'd3-transition';

export default class SunBurst extends PureComponent {
    componentDidMount() {
        this.renderChart();
    }

    componentDidUpdate() {
        return false;
    }

    renderChart() {
        const width = 600;
        const height = 600;
        const radius = Math.min(width, height) / 2;

        const x = scaleLinear()
            .range([0, 2 * Math.PI]);
        const y = scaleSqrt()
            .range([0, radius]);
        const color = scaleOrdinal()
            .range(schemeCategory20b);

        const el = select(this.svg);

        const group = el.attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate( ${width / 2}, ${height / 2})`);

        const nodeData = {
            name: 'TOPICS',
            children: [{
                name: 'Topic A',
                children: [{
                    name: 'Sub A1',
                    size: 4,
                }, {
                    name: 'Sub A2',
                    size: 4,
                }],
            }, {
                name: 'Topic B',
                children: [{
                    name: 'Sub B1',
                    size: 3,
                }, {
                    name: 'Sub B2',
                    size: 3,
                }, {
                    name: 'Sub B3',
                    size: 3,
                }],
            }, {
                name: 'Topic C',
                children: [{
                    name: 'Sub A1',
                    size: 4,
                }, {
                    name: 'Sub A2',
                    size: 4,
                }],
            }],
        };

        const arch = arc()
            .startAngle(d => Math.max(0, Math.min(2 * Math.PI, x(d.x0))))
            .endAngle(d => Math.max(0, Math.min(2 * Math.PI, x(d.x1))))
            .innerRadius(d => Math.max(0, y(d.y0)))
            .outerRadius(d => Math.max(0, y(d.y1)));

        const partitions = partition();

        function handleClick(d) {
            const tran = transition()
                .duration(750);

            group.transition(tran)
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
                .attrTween('d', t => () => arch(t));
        }

        function drawSunburst(data) {
            const root = hierarchy(data)
                .sum(d => d.size);

            const slices = group
                .selectAll('g')
                .data(partitions(root)
                    .descendants())
                .enter()
                .append('g');

            slices.append('path')
                .attr('d', arch)
                .style('stroke', '#fff')
                .style('fill', d => color((d.children ? d : d.parent)
                    .data.name))
                .on('click', handleClick)
                .append('title')
                .text(d => `${d.data.name}\n${d.value}`);
        }

        drawSunburst(nodeData);
    }

    render() {
        return (
            <div>
                <svg ref={(elem) => { this.svg = elem; }} />
            </div>
        );
    }
}
