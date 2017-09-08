import React from 'react';
import CSSModules from 'react-css-modules';
import { scaleLinear } from 'd3-scale';
import { line, curveLinear, area } from 'd3-shape';
import { select } from 'd3-selection';
import { max } from 'd3-array';
import styles from './styles.scss';
import SegmentButton from '../SegmentButton';


class TimeSeries extends React.PureComponent {
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
            top: 10,
            right: 10,
            bottom: 10,
            left: 10,
        };

        this.scaleX = scaleLinear();
        this.scaleY = scaleLinear();

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
            this.renderTimeSeries();
        }, 0);
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
        this.renderTimeSeries();
    }

    onSegmentButtonClick = (val) => {
        const selectedTimeInterval = val;
        this.setState({ ...this.state, selectedTimeInterval });
    }

    renderTimeSeries() {
        const renderData = this.state.data[this.state.selectedTimeInterval];
        const { top, left } = this.margins;

        this.scaleX.domain([0, max(renderData, d => d.x)]);
        this.scaleY.domain([0, max(renderData, d => d.y)]);

        const svg = select(this.svg);

        const ar = area()
            .x(d => this.scaleX(d.x))
            .y0(this.scaleY(0))
            .y1(d => this.scaleY(d.y));

        svg.select('*').remove();
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
    }
    render() {
        const { selectedTimeInterval, segmentButton } = this.state;

        return (
            <div
                ref={(div) => { this.root = div; }}
                styleName="time-series"
            >
                <header>
                    <h3>Time series</h3>
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

export default CSSModules(TimeSeries, styles, { allowMultiple: true });
