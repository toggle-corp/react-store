import PropTypes from 'prop-types';
import React from 'react';

import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { extent } from 'd3-array';
import {
    line as d3Line,
    curveCardinal,
} from 'd3-shape';

import Responsive from '../../General/Responsive';
import Tooltip from '../Tooltip';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    /*
     * Data: [
           {
                value: value
                label: label, // tooltip text/node
           },..
        ]
     */
    data: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.number.isRequired,
        label: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.node,
        ]),
    })).isRequired,
    /*
     * Chart Margins
     */
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
    circleRadius: PropTypes.number,
    boundingClientRect: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    className: 'spark-lines',
    circleRadius: 3,
    margins: {
        top: 1,
        right: 1,
        bottom: 1,
        left: 1,
    },
};

@Responsive
export default class SparkLine extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.scaleX = scaleLinear();
        this.scaleY = scaleLinear();
    }

    componentDidMount() {
        this.updateRender();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps !== this.props) {
            this.updateRender();
        }
    }

    componentDidUpdate() {
        this.updateRender();
    }

    onMouseOver = (label) => {
        this.tooltipDiv.setTooltip(label);
        this.tooltipDiv.show();
    }

    onMouseMove = () => {
        this.tooltipDiv.move();
    }

    onMouseOut = () => {
        this.tooltipDiv.hide();
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

        this.renderSparkLines();
    }

    renderSparkLines() {
        const { data, circleRadius } = this.props;

        this.scaleX.domain([0, data.length - 1]);
        this.scaleY.domain(extent(data.map(d => d.value)));

        const svg = select(this.svg);

        svg.select('*').remove();

        const root = svg.append('g');

        const line = d3Line()
            .x((d, index) => this.scaleX(index))
            .y(d => this.scaleY(d.value))
            .curve(curveCardinal);

        root.append('path')
            .attr('d', line(data));

        root.append('g').selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', (d, index) => this.scaleX(index))
            .attr('cy', d => this.scaleY(d.value))
            .attr('r', circleRadius)
            .on('mouseenter', d => this.onMouseOver(d.label))
            .on('mousemove', this.onMouseMove)
            .on('mouseleave', this.onMouseOut);
    }

    render() {
        const { className } = this.props;

        return (
            <div
                className={className}
                className={styles['spark-lines']}
            >
                <svg
                    ref={(svg) => { this.svg = svg; }}
                />
                <Tooltip ref={(div) => { this.tooltipDiv = div; }} />
            </div>
        );
    }
}
