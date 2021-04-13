import React from 'react';
import PropTypes from 'prop-types';
import { select } from 'd3-selection';
// FIXME: idk if this has a side-effect
// import { range } from 'd3-array';
import {
    arc,
    pie,
    line,
    curveLinear,
} from 'd3-shape';
import {
    scaleLinear,
    scaleOrdinal,
} from 'd3-scale';

import Responsive from '../../General/Responsive';

import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    sectionPercents: PropTypes.arrayOf(PropTypes.number).isRequired,
    minAngle: PropTypes.number,
    maxAngle: PropTypes.number,
    minValue: PropTypes.number.isRequired,
    maxValue: PropTypes.number.isRequired,
    currentValue: PropTypes.number.isRequired,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    showLabels: PropTypes.bool,
    className: PropTypes.string,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    className: '',
    colorScheme: ['#3f51b5', '#00E396', '#FEB019', '#FF4560', '#43BCCD'],
    minAngle: -90,
    maxAngle: 90,
    showLabels: false,
    margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
    },
};

const degToRad = deg => deg * (Math.PI / 180);
const radToDeg = rad => rad * (180 / Math.PI);

class GaugeChart extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    drawChart = () => {
        const {
            boundingClientRect,
            margins,
            colorScheme,
            sectionPercents,
            minAngle,
            maxAngle,
            minValue,
            maxValue,
            currentValue,
            showLabels,
        } = this.props;

        const {
            width: containerWidth,
            height: containerHeight,
        } = boundingClientRect;

        const {
            top = 0,
            right = 0,
            bottom = 0,
            left = 0,
        } = margins;

        if (!boundingClientRect.width) return;

        const width = containerWidth - left - right;
        const height = containerHeight - top - bottom;

        if (width < 0 || height < 0) return;

        const radius = Math.min(width, height * 2) / 2;

        const deltaAngle = maxAngle - minAngle;

        const ringWidthPercent = 0.2;
        const insetPercent = 0.01;
        const labelInsetPercent = 0.009;
        const pointerWidthPercent = 0.1;

        const ringWidth = ringWidthPercent * radius;
        const ringInset = insetPercent * radius;

        const arcColors = scaleOrdinal().range(colorScheme);

        const group = select(this.svg)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        const scaleValue = scaleLinear()
            .range([0, 1])
            .clamp(true)
            .domain([minValue, maxValue]);

        const arch = arc()
            .innerRadius(radius - ringWidth - ringInset)
            .outerRadius(radius - ringInset);

        const pies = pie()
            .sort(null)
            .value(d => d)
            .startAngle(degToRad(minAngle))
            .endAngle(degToRad(maxAngle));

        const tickData = pies(sectionPercents);

        group
            .selectAll('.arc')
            .data(tickData)
            .enter()
            .append('g')
            .attr('class', `${styles.arc} arc`)
            .attr('transform', () => `translate( ${radius},${radius})`)
            .append('path')
            .attr('fill', (d, i) => arcColors(i))
            .attr('d', arch);

        const pointerWidth = pointerWidthPercent * radius;
        const pointerHeadLengthPercent = 1 - insetPercent - ringWidthPercent;
        const pointerHeadLength = Math.round(radius * pointerHeadLengthPercent);

        const lineData = [
            [pointerWidth / 2, 0],
            [0, -pointerHeadLength],
            [-(pointerWidth / 2), 0],
            [0, 0],
            [pointerWidth / 2, 0],
        ];
        const pointerLine = line().curve(curveLinear);

        group
            .selectAll('.pointer')
            .data([lineData])
            .enter()
            .append('g')
            .attr('class', `${styles.pointer} pointer`)
            .attr('transform', `translate( ${radius},${radius})`)
            .append('path')
            .attr('d', pointerLine)
            .attr('transform', `rotate(${minAngle})`);

        group
            .append('g')
            .append('circle')
            .attr('class', `${styles.pointerCircle} pointer-circle`)
            .attr('transform', `translate(${radius}, ${radius})`)
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', pointerWidth / 2);

        const ratio = scaleValue(currentValue);
        const newAngle = minAngle + (ratio * deltaAngle);

        group
            .select('.pointer')
            .select('path')
            .transition()
            .duration(1000)
            .attr('transform', `rotate(${newAngle})`);

        if (showLabels) {
            group
                .append('g')
                .selectAll('.label')
                .data(pies(sectionPercents))
                .enter()
                .append('g')
                .attr('class', `${styles.label} label`)
                .attr('transform', `translate(${radius}, ${radius})`)
                .append('text')
                .text(d => d.data)
                .attr('transform', (d) => {
                    const end = d.endAngle;
                    const start = d.startAngle;
                    const center = (radToDeg(end) + radToDeg(start)) / 2;

                    return `rotate (${center}) translate(0, ${(labelInsetPercent * radius) - radius})`;
                });
        }
    }

    redrawChart = () => {
        const svg = select(this.svg);
        svg.selectAll('*').remove();
        this.drawChart();
    }

    render() {
        const {
            className,
            boundingClientRect: {
                width,
                height,
            },
        } = this.props;

        const gaugeChartStyle = [
            'gauge-chart',
            styles.gaugeChart,
            className,
        ].join(' ');

        return (
            <svg
                ref={(element) => { this.svg = element; }}
                className={gaugeChartStyle}
                style={{
                    width,
                    height,
                }}
            />
        );
    }
}

export default Responsive(GaugeChart);
