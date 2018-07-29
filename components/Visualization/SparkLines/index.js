import React, {
    PureComponent,
} from 'react';
import {
    select,
    mouse,
} from 'd3-selection';
import {
    extent,
    bisector,
} from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { PropTypes } from 'prop-types';
import {
    line,
    area,
} from 'd3-shape';
import SvgSaver from 'svgsaver';
import Responsive from '../../General/Responsive';

import { getStandardFilename } from '../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
    xValueAccessor: PropTypes.func.isRequired,
    xValueModifier: PropTypes.func,
    yValueAccessor: PropTypes.func.isRequired,
    yValueModifier: PropTypes.func,
    onHover: PropTypes.func,
    fill: PropTypes.bool,
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
    fill: true,
    onHover: () => {},
    xValueModifier: d => d,
    yValueModifier: d => d,
    className: '',
    margins: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
    },
};

class SparkLines extends PureComponent {
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

    handleMouseMove = (element, focus) => {
        const {
            data,
            onHover,
        } = this.props;
        const {
            scaleX,
            scaleY,
            xValue,
            yValue,
            bisectXValue,
        } = this;
        const x0 = scaleX.invert(mouse(element)[0]);
        const i = bisectXValue(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        const d = x0 - xValue(d0) > xValue(d1) - x0 ? d1 : d0;
        onHover(d);
        focus
            .attr('transform', `translate(${scaleX(xValue(d))}, ${scaleY(yValue(d))})`);
    }

    drawChart = () => {
        const {
            data,
            boundingClientRect,
            margins,
            fill,
            xValueAccessor,
            xValueModifier,
            yValueAccessor,
            yValueModifier,
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
            .attr('class', styles.sparkLine)
            .attr('transform', `translate(${left}, ${top})`);


        this.xValue = d => xValueModifier(xValueAccessor(d));
        this.yValue = d => yValueModifier(yValueAccessor(d));

        this.bisectXValue = bisector(this.xValue).left;

        this.scaleX = scaleLinear()
            .range([0, width])
            .domain(extent(data.map(d => this.xValue(d))));

        this.scaleY = scaleLinear()
            .range([height, 0])
            .domain(extent(data.map(d => this.yValue(d))));

        const areas = area()
            .x(d => this.scaleX(this.xValue(d)))
            .y0(height)
            .y1(d => this.scaleY(this.yValue(d)));

        const lines = line()
            .x(d => this.scaleX(this.xValue(d)))
            .y(d => this.scaleY(this.yValue(d)));

        if (fill) {
            group.append('path')
                .attr('class', styles.area)
                .datum(data)
                .attr('d', areas);
        }

        group
            .append('path')
            .attr('class', styles.path)
            .datum(data)
            .attr('d', lines)
            .style('fill', 'none');

        const focus = group
            .append('g')
            .attr('class', styles.focus)
            .style('display', 'none');

        focus
            .append('circle')
            .attr('r', 5);

        group
            .append('rect')
            .attr('class', 'overlay')
            .style('fill', 'none')
            .style('pointer-events', 'all')
            .attr('width', width + left + right)
            .attr('height', height + top + bottom)
            .attr('transform', `translate(${left}, ${top})`)
            .on('mouseover', () => focus.style('display', null))
            .on('mouseout', () => focus.style('display', 'none'))
            .on('mousemove', (d, i, nodes) => this.handleMouseMove(nodes[0], focus));
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

export default Responsive(SparkLines);
