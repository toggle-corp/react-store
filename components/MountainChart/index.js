import React from 'react';
import CSSModules from 'react-css-modules';
import { scaleLinear } from 'd3-scale';
import { line, curveLinear, area } from 'd3-shape';
import { select, mouse } from 'd3-selection';
import { max, bisector } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';

import styles from './styles.scss';
import SegmentButton from '../SegmentButton';

class MountainChart extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            selectedTimeInterval: '_1d',
            segmentButton: {
                name: 'time-series-intervals',
                data: [
                    { label: '1d', value: '_1d' },
                    { label: '1m', value: '_1m' },
                    { label: '1y', value: '_1y' },
                    { label: '5y', value: '_5y' },
                ],
            },
            data: {
                _1d: [
                    { x: 0, y: 0 },
                    { x: 2, y: 2.5 },
                    { x: 3, y: 5 },
                    { x: 7, y: 2.7 },
                    { x: 8, y: 9 },
                ],
                _1m: [
                    { x: 0, y: 0 },
                    { x: 3, y: 2.5 },
                    { x: 4, y: 5 },
                    { x: 7, y: 2.7 },
                    { x: 8, y: 9 },
                ],
                _1y: [
                    { x: 0, y: 0 },
                    { x: 1, y: 2.5 },
                    { x: 3, y: 5 },
                    { x: 4, y: 2.7 },
                    { x: 8, y: 9 },
                ],
                _5y: [
                    { x: 0, y: 0 },
                    { x: 2, y: 2.5 },
                    { x: 3, y: 5 },
                    { x: 6, y: 2.7 },
                    { x: 19, y: 9 },
                ],
            },
        };

        this.margins = {
            top: 16,
            right: 16,
            bottom: 48,
            left: 56,
        };

        this.scaleX = scaleLinear();
        this.scaleY = scaleLinear();
        this.bisectX = bisector(d => d.x).left;

        this.line = line()
            .curve(curveLinear)
            .x(d => this.scaleX(d.x))
            .y(d => this.scaleY(d.y));
    }

    componentDidMount() {
        const { top, right, bottom, left } = this.margins;
        setTimeout(() => {
            this.scaleX.range([
                0,
                this.svgContainer.offsetWidth - left - right,
            ]);
            this.scaleY.range([
                this.svgContainer.offsetHeight - top - bottom,
                0,
            ]);
            this.height = this.svgContainer.offsetHeight - top - bottom;
            this.width = this.svgContainer.offsetWidth - left - right;
            this.renderMountainChart();
        }, 100);
    }

    componentDidUpdate() {
        const { top, right, bottom, left } = this.margins;
        this.scaleX.range([
            0,
            this.svgContainer.offsetWidth - left - right,
        ]);
        this.scaleY.range([
            this.svgContainer.offsetHeight - top - bottom,
            0,
        ]);
        this.height = this.svgContainer.offsetHeight - top - bottom;
        this.width = this.svgContainer.offsetWidth - left - right;
        this.renderMountainChart();
    }

    onSegmentButtonClick = (val) => {
        const selectedTimeInterval = val;
        this.setState({ ...this.state, selectedTimeInterval });
    }

    addTooltip() {
        const svg = select(this.svg);
        const { top, left } = this.margins;

        // Append tooltip to svg
        const focus = svg.append('g')
            .attr('class', 'focus')
            .style('display', 'none');

        focus.append('path')
            .attr('class', 'mouse-line')
            .style('stroke', 'red')
            .style('stroke-width', '2px')
            .attr('transform', `translate(${left}, ${top})`);

        // Append circle to tooltip
        focus.append('circle')
            .attr('r', 7.5);

        // Append text to tooltip
        focus.append('text')
            .attr('class', 'tooltip')
            .style('text-anchor', 'start')
            .style('stroke', 'steelblue')
            .style('fill', 'red')
            .attr('dy', '.35em');


        // Append rect over other (Append at last)
        // TODO: Add style to scss
        const overlay = svg.append('rect')
            .attr('transform', `translate(${left}, ${top})`)
            .attr('class', 'overlay')
            .attr('width', this.width)
            .attr('height', this.height)
            .on('mouseover', () => { focus.style('display', null); })
            .on('mouseout', () => { focus.style('display', 'none'); })
            .on('mousemove', () => {
                const xpos = mouse(overlay.node())[0];
                const data = this.state.data[this.state.selectedTimeInterval];
                const x0 = this.scaleX.invert(xpos);
                const i = this.bisectX(data, x0, 1, data.length - 1);
                const d0 = data[i - 1];
                const d1 = data[i];
                const d = x0 - d0.x > d1.x - x0 ? d1 : d0;

                focus.select('.mouse-line')
                    .attr('d', () => {
                        let w = `M${xpos},${this.height}`;
                        w += ` ${xpos}, 0`;
                        return w;
                    });

                focus.select('circle')
                    .attr('transform', `translate(${this.scaleX(d.x) + left}, ${top})`)
                    .attr('cy', this.scaleY(d.y));

                focus.select('text')
                    .attr('x', xpos + left)
                    .attr('y', this.scaleY(d.y))
                    .text(() => (d.y));
            });
    }

    renderMountainChart() {
        const renderData = this.state.data[this.state.selectedTimeInterval];
        const { top, left } = this.margins;

        this.scaleX.domain([0, max(renderData, d => d.x)]);
        this.scaleY.domain([0, max(renderData, d => d.y)]);

        const svg = select(this.svg);

        const ar = area()
            .x(d => this.scaleX(d.x))
            .y0(this.scaleY(0))
            .y1(d => this.scaleY(d.y));

        svg.selectAll('*').remove();

        svg.append('g')
            .attr('transform', `translate(${left}, ${this.height + top})`)
            .call(axisBottom(this.scaleX));
        svg.append('g')
            .attr('transform', `translate(${left}, ${top})`)
            .call(axisLeft(this.scaleY));

        const container = svg.append('g')
            .attr('transform', `translate(${left}, ${top})`)
            .data([renderData]);

        container.append('path')
            .attr('fill', 'lightblue')
            .attr('d', ar);

        container.append('path')
            .attr('stroke', 'blue')
            .attr('stroke-width', '2')
            .attr('fill', 'none')
            .attr('d', this.line);

        this.addTooltip();
    }

    render() {
        const { selectedTimeInterval, segmentButton } = this.state;

        return (
            <div
                ref={(div) => { this.root = div; }}
                styleName="time-series"
            >
                <header>
                    <h3>Mountain Chart</h3>
                    <SegmentButton
                        data={segmentButton.data}
                        name={segmentButton.name}
                        onPress={this.onSegmentButtonClick}
                        selected={selectedTimeInterval}
                    />
                </header>
                <div styleName="content" ref={(div) => { this.svgContainer = div; }}>
                    <svg ref={(svg) => { this.svg = svg; }} />
                </div>
            </div>
        );
    }
}

export default CSSModules(MountainChart, styles, { allowMultiple: true });
