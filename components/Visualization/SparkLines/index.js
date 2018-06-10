import React, {
    PureComponent,
} from 'react';
import { select } from 'd3-selection';
import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { PropTypes } from 'prop-types';
import { line, area } from 'd3-shape';
import SvgSaver from 'svgsaver';
import Responsive from '../../General/Responsive';
import BoundError from '../../General/BoundError';

import { getStandardFilename } from '../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.number.isRequired,
        label: PropTypes.number.isRequired,
    })),
    valueAccessor: PropTypes.func.isRequired,
    fill: PropTypes.bool,
    lineColor: PropTypes.string,
    className: PropTypes.string,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    data: [],
    lineColor: '#40FEA1',
    fill: false,
    className: '',
    margins: {
        top: 4,
        right: 4,
        bottom: 4,
        left: 4,
    },
};


@BoundError()
@Responsive
export default class SparkLines extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    save = () => {
        const svg = select(this.svg);
        const svgsaver = new SvgSaver();
        svgsaver.asSvg(svg.node(), `${getStandardFilename('sparklines', 'graph')}.svg`);
    }

    addAreaGradients = () => {
        const { lineColor } = this.props;

        const areaGradient = select(this.svg)
            .append('defs')
            .append('linearGradient')
            .attr('id', 'areaGradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        areaGradient
            .append('stop')
            .attr('offset', '0%')
            .attr('stop-color', lineColor)
            .attr('stop-opacity', 1);
        areaGradient
            .append('stop')
            .attr('offset', '80%')
            .attr('stop-color', lineColor)
            .attr('stop-opacity', 0.1);
    }

    drawChart = () => {
        const {
            data,
            boundingClientRect,
            lineColor,
            margins,
            fill,
            valueAccessor,
        } = this.props;

        if (!boundingClientRect.width || !data || data.length === 0) {
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

        const group = select(this.svg)
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        const scaleX = scaleLinear()
            .range([0, width])
            .domain([0, data.length - 1]);
        const scaleY = scaleLinear()
            .range([height, 0])
            .domain(extent(data.map(d => valueAccessor(d))));
        const areas = area()
            .x((d, i) => scaleX(i))
            .y0(height)
            .y1(d => scaleY(valueAccessor(d)));

        const lines = line()
            .x((d, i) => scaleX(i))
            .y(d => scaleY(valueAccessor(d)));

        if (fill) {
            this.addAreaGradients();

            group
                .attr('class', 'spark-lines')
                .append('path')
                .datum(data)
                .style('fill', 'url(#areaGradient)')
                .attr('d', areas);
        }


        group
            .append('path')
            .datum(data)
            .attr('d', lines)
            .style('stroke', lineColor)
            .style('fill', 'none')
            .style('stroke-width', 2);
    }

    redrawChart = () => {
        const svg = select(this.svg);
        svg.selectAll('*').remove();
        this.drawChart();
    }

    render() {
        const {
            className,
        } = this.props;

        const sparkLinesStyle = [
            'spark-lines',
            styles.sparkLines,
            className,
        ].join(' ');

        return (
            <svg
                ref={(element) => { this.svg = element; }}
                className={sparkLinesStyle}
            />
        );
    }
}
