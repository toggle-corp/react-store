import React, {
    PureComponent,
    Fragment,
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
import Float from '../../View/Float';
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
    yValueAccessor: PropTypes.func.isRequired,
    xLabelModifier: PropTypes.func,
    yLabelModifier: PropTypes.func,
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
    xLabelModifier: d => d,
    yLabelModifier: d => d,
    className: '',
    margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
};

const circleRadius = 5;

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
            xLabelModifier,
            yLabelModifier,
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
        const d1 = data[i] || d0;
        const d = x0 - xValue(d0) > xValue(d1) - x0 ? d1 : d0;
        onHover(d);
        focus
            .select('.circle')
            .attr('transform', `translate(${scaleX(xValue(d))}, ${scaleY(yValue(d))})`);

        focus
            .select('.crosshair')
            .attr('transform', `translate(${scaleX(xValue(d))}, ${0})`);

        const { top, left } = focus.node().getBoundingClientRect();
        const xLabel = xLabelModifier(xValue(d));
        const yLabel = yLabelModifier(yValue(d));

        select(this.tooltip)
            .html(`<span class=${styles.yvalue}>${yLabel}</span>
                   <span class=${styles.xvalue}>${xLabel}</span>`)
            .style('top', () => {
                const { height } = this.tooltip.getBoundingClientRect();
                return `${top - height - circleRadius}px`;
            })
            .style('left', () => {
                const { width } = this.tooltip.getBoundingClientRect();
                return `${left - (width / 2)}px`;
            })
            .transition()
            .style('display', 'inline-block');
    }

    drawChart = () => {
        const {
            data,
            boundingClientRect,
            margins,
            fill,
            xValueAccessor,
            yValueAccessor,
        } = this.props;

        if (!boundingClientRect.width || !data || data.length === 0) {
            return;
        }

        const { width, height } = boundingClientRect;

        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        const marginForCircle = 2 * circleRadius;

        this.width = width - left - right - marginForCircle;
        this.height = height - top - bottom - marginForCircle;

        const group = select(this.svg)
            .attr('width', this.width + left + right + marginForCircle)
            .attr('height', this.height + top + bottom + marginForCircle)
            .append('g')
            .attr('class', styles.sparkLine)
            .attr('transform', `translate(${left + circleRadius}, ${top + circleRadius})`);


        this.xValue = d => xValueAccessor(d);
        this.yValue = d => yValueAccessor(d);

        this.bisectXValue = bisector(this.xValue).left;

        this.scaleX = scaleLinear()
            .range([0, this.width])
            .domain(extent(data.map(d => this.xValue(d))));

        this.scaleY = scaleLinear()
            .range([this.height, 0])
            .domain(extent(data.map(d => this.yValue(d))));

        const areas = area()
            .x(d => this.scaleX(this.xValue(d)))
            .y0(this.height)
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
            .append('line')
            .attr('class', `crosshair ${styles.line}`)
            .attr('y1', 0)
            .attr('y2', this.height);

        focus
            .append('circle')
            .attr('class', 'circle')
            .attr('r', circleRadius);

        group
            .append('rect')
            .attr('class', 'overlay')
            .style('fill', 'none')
            .style('pointer-events', 'all')
            .attr('width', this.width + left + right)
            .attr('height', this.height + top + bottom)
            .attr('transform', `translate(${left}, ${top})`)
            .on('mouseover', () => focus.style('display', null))
            .on('mouseout', () => {
                focus.style('display', 'none');
                select(this.tooltip)
                    .transition()
                    .style('display', 'none');
            })
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
            <Fragment>
                <svg
                    ref={(element) => { this.svg = element; }}
                    className={sparkLinesStyle}
                />
                <Float>
                    <div
                        ref={(elem) => { this.tooltip = elem; }}
                        className={styles.tooltip}
                    />
                </Float>
            </Fragment>
        );
    }
}

export default Responsive(SparkLines);
