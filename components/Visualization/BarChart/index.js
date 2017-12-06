import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { scaleLinear, scaleBand } from 'd3-scale';
import { axisLeft, axisBottom } from 'd3-axis';
import { select } from 'd3-selection';
import { max, min } from 'd3-array';

import { Responsive } from '../../General';

import styles from './styles.scss';

/*
  TODO:
  1. Axis label auto padding
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
    xGrid: PropTypes.bool,
    yGrid: PropTypes.bool,
    boundingClientRect: PropTypes.object.isRequired, // eslint-disable-line
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
    xGrid: true,
    yGrid: true,
};

@Responsive
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
        const { right, top, left, bottom } = this.props.margins;
        const { height, width } = this.props.boundingClientRect;

        if (!width) {
            return;
        }

        const svgHeight = height - bottom;
        const svgWidth = width - right;

        this.scaleX.range([left, svgWidth]);
        this.scaleY.range([svgHeight, top]);

        this.renderBarChart();
    }

    renderBarChart() {
        const renderData = this.state.data;
        const { margins, xGrid, yGrid } = this.props;
        const { top, bottom, left, right } = margins;
        const height = this.svgContainer.offsetHeight - top - bottom;
        const width = this.svgContainer.offsetWidth - right - left;
        const nuOfRow = renderData.length;

        this.scaleX.domain(renderData.map(d => d[this.props.xKey]));
        this.scaleY.domain([min([0, min(renderData, d => d[this.props.yKey])]),
            max([0, max(renderData, d => d[this.props.yKey])])]);
        this.scaleX.range([0, width]);
        this.scaleY.range([height, 0]);

        // const maxScaleY = this.scaleY.domain().map();
        console.warn(this.scaleY.domain());

        const svg = select(this.svg);
        svg.select('*').remove();

        const xAxis = axisBottom(this.scaleX);
        if (xGrid) {
            xAxis.tickSizeInner(-height)
                .tickSizeOuter(0);
        }

        const yAxis = axisLeft(this.scaleY);
        if (yGrid) {
            yAxis.tickSizeInner(-width)
                .tickSizeOuter(0);
        }

        const root = svg.append('g')
            .attr('transform', `translate(${left},${top})`);

        const xAxisSvg = root.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis);

        root.append('g')
            .attr('class', 'axis')
            .call(yAxis);

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
                <div
                    styleName="content"
                    className="content"
                    ref={(div) => { this.svgContainer = div; }}
                >
                    <svg
                        className="svg"
                        ref={(svg) => { this.svg = svg; }}
                    />
                </div>
            </div>
        );
    }
}
