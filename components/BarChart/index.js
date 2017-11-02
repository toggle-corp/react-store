import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { scaleLinear, scaleBand } from 'd3-scale';
import { axisLeft, axisBottom } from 'd3-axis';
import { select } from 'd3-selection';
import { max, min } from 'd3-array';

import styles from './styles.scss';


const propTypes = {
    /*
     * Chart Data for x-axis and y-axis
     */
    xKey: PropTypes.string.isRequired,
    yKey: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
        x: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
        y: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
    })).isRequired,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
    barPadding: PropTypes.number,
    highlightBarX: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
};

const defaultProps = {
    margins: {
        top: 10,
        right: 10,
        bottom: 30,
        left: 30,
    },
    barPadding: 0.01,
    highlightBarX: null,
};

@CSSModules(styles)
export default class BarChart extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
        };

        this.scaleX = scaleBand().padding(this.props.barPadding);
        this.scaleY = scaleLinear();
    }

    componentDidMount() {
        const { top, right, bottom, left } = this.props.margins;

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
        const { top, right, bottom, left } = this.props.margins;

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

    renderTimeSeries() {
        const renderData = this.props.data;
        const { top, bottom, left, right } = this.props.margins;
        const height = this.svgContainer.offsetHeight - top - bottom;
        const width = this.svgContainer.offsetWidth - right - left;

        this.scaleX.domain(renderData.map(d => d[this.props.xKey]));
        this.scaleY.domain([min([0, min(renderData, d => d[this.props.yKey])]),
            max([0, max(renderData, d => d[this.props.yKey])])]);
        this.scaleX.range([0, width]);
        this.scaleY.range([height, 0]);
        console.log(this.scaleY.domain());


        const svg = select(this.svg);
        svg.select('*').remove();

        const xAxis = axisBottom(this.scaleX);
        const yAxis = axisLeft(this.scaleY);
        const root = svg.append('g')
            .attr('transform', `translate(${left},${top})`);

        root.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis);

        root.append('g')
            .attr('class', 'axis')
            .call(yAxis);

        console.log(this.props.highlightBarX);
        root.append('g')
            .selectAll('.bar')
            .data(renderData)
            .enter()
            .append('rect')
            .attr('class', d => (
                d[this.props.xKey] === this.props.highlightBarX ? 'bar bar-selected' : 'bar'
            ))
            .attr('x', d => this.scaleX(d[this.props.xKey]))
            .attr('y', d => (
                d[this.props.yKey] > 0 ? this.scaleY(d[this.props.yKey]) : this.scaleY(0)
            ))
            .attr('width', this.scaleX.bandwidth())
            .attr('height', d => (
                d[this.props.yKey] > 0 ? this.scaleY(0) - this.scaleY(d[this.props.yKey]) :
                    this.scaleY(d[this.props.yKey]) - this.scaleY(0)
            ));
    }

    render() {
        return (
            <div
                ref={(div) => { this.root = div; }}
                styleName="bar-chart"
            >
                <div styleName="content" ref={(div) => { this.svgContainer = div; }}>
                    <svg ref={(svg) => { this.svg = svg; }} />
                </div>
            </div>
        );
    }
}
