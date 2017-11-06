import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { scaleLinear, scaleBand } from 'd3-scale';
import { axisLeft, axisBottom } from 'd3-axis';
import { select } from 'd3-selection';
import { max, min } from 'd3-array';

import styles from './styles.scss';

/*
  TODO:
  1. GridLine support (both x-axis and y-axis)
  2. Axis label auto padding
  */
const propTypes = {
    /*
     * Padding between bars
     */
    barPadding: PropTypes.number,
    /*
     * Data
     * [{
     *    xKey: value,
     *    yKey: value,
     *  },...]
     */
    className: PropTypes.string,

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
    /*
     * Highlight which bar
     */
    highlightBarX: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    /*
     * Chart Margins
     */
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
    /*
     * if length is greater, than rotate X-axis label
     */
    maxNuOfRow: PropTypes.number,
    /*
     * key for for x-axis and y-axis in Data
     */
    updateFromProps: PropTypes.bool,
    xKey: PropTypes.string.isRequired,
    yKey: PropTypes.string.isRequired,
};

const defaultProps = {
    barPadding: 0.01,
    className: '',
    highlightBarX: null,
    margins: {
        top: 10,
        right: 10,
        bottom: 30,
        left: 30,
    },
    maxNuOfRow: 30,
    updateFromProps: true,
};

@CSSModules(styles)
export default class BarChart extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { data } = props;

        this.state = {
            data,
        };

        this.scaleX = scaleBand().padding(this.props.barPadding);
        this.scaleY = scaleLinear();
    }

    componentDidMount() {
        this.updateRender();
    }

    componentWillReceiveProps(nextProps) {
        // TODO: Is there better way ?
        // TODO: also use nexProps for updateFromProps
        const { data } = nextProps;
        if (this.props.updateFromProps) {
            this.setData(data);
        }
    }

    componentDidUpdate() {
        this.updateRender();
    }

    setData = (newData) => {
        // TODO: Is there better way ?
        // Added to support sorted data from table
        this.setState({
            data: newData,
        });
    }

    updateRender() {
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
        const renderData = this.state.data;
        const { top, bottom, left, right } = this.props.margins;
        const height = this.svgContainer.offsetHeight - top - bottom;
        const width = this.svgContainer.offsetWidth - right - left;
        const nuOfRow = renderData.length;

        this.scaleX.domain(renderData.map(d => d[this.props.xKey]));
        this.scaleY.domain([min([0, min(renderData, d => d[this.props.yKey])]),
            max([0, max(renderData, d => d[this.props.yKey])])]);
        this.scaleX.range([0, width]);
        this.scaleY.range([height, 0]);


        const svg = select(this.svg);
        svg.select('*').remove();

        const xAxis = axisBottom(this.scaleX);
        const yAxis = axisLeft(this.scaleY);
        const root = svg.append('g')
            .attr('transform', `translate(${left},${top})`);

        const xAxisSvg = root.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis);

        if (nuOfRow > this.props.maxNuOfRow) {
            xAxisSvg.selectAll('text')
                .attr('y', 0)
                .attr('x', 9)
                .attr('dy', '.35em')
                .attr('transform', 'rotate(90)')
                .style('text-anchor', 'start')
                .style('font-size', '9px');
        }

        root.append('g')
            .attr('class', 'axis')
            .call(yAxis);

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
                (d[this.props.yKey] > 0 ? this.scaleY(0) - this.scaleY(d[this.props.yKey]) :
                    this.scaleY(d[this.props.yKey]) - this.scaleY(0)) || 0
            ));
    }

    render() {
        const { className } = this.props;
        return (
            <div
                className={className}
                styleName="bar-chart"
                ref={(div) => { this.root = div; }}
            >
                <div styleName="content" ref={(div) => { this.svgContainer = div; }}>
                    <svg ref={(svg) => { this.svg = svg; }} />
                </div>
            </div>
        );
    }
}
