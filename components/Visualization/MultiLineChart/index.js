import React from 'react';
import PropTypes from 'prop-types';

import { select } from 'd3-selection';
import {
    scaleOrdinal,
    scaleLinear,
    scaleTime,
} from 'd3-scale';
import {
    line,
} from 'd3-shape';
import {
    axisBottom,
    axisLeft,
} from 'd3-axis';
import {
    extent,
    max,
} from 'd3-array';
import { schemeAccent } from 'd3-scale-chromatic';


import Responsive from '../../General/Responsive';
import Float from '../../View/Float';

import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.shape({
        series: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            color: PropTypes.string,
            values: PropTypes.arrayOf(PropTypes.number),
        })),
        dates: PropTypes.array,
    }).isRequired,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    tickArguments: PropTypes.array,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};
const defaultProps = {
    colorScheme: schemeAccent,
    tickArguments: null,
    margins: {
        top: 20,
        right: 20,
        bottom: 40,
        left: 40,
    },
};

class MultiLineChart extends React.PureComponent {
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
            data,
            margins,
            colorScheme,
            tickArguments,
            boundingClientRect,
        } = this.props;

        if (!boundingClientRect.width || !data || data.length === 0) {
            return;
        }

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

        const width = containerWidth - left - right;
        const height = containerHeight - top - bottom;

        const { series, dates } = data;

        const colors = scaleOrdinal()
            .range(colorScheme);

        const x = scaleTime()
            .domain(extent(dates.map(date => new Date(date)))).nice()
            .range([0, width]);

        const y = scaleLinear()
            .domain([0, max(series, d => max(d.values))]).nice()
            .range([height, 0]);

        const lines = line()
            .x((d, i) => x(dates[i]))
            .y(d => y(d));

        const group = select(this.svg)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        const axisLayer = group
            .append('g');

        const seriesLayer = group
            .append('g')
            .selectAll('.series')
            .data(series)
            .enter()
            .append('g')
            .attr('class', 'series')
            .attr('fill', d => (d.color ? d.color : colors(d.name)));

        seriesLayer
            .append('path')
            .attr('d', d => lines(d.values))
            .attr('fill', 'none')
            .attr('mix-blend-mode', 'multiply')
            .attr('stroke', d => (d.color ? d.color : colors(d.name)))
            .attr('stroke-width', 2)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round');

        seriesLayer
            .selectAll('circle')
            .data(d => d.values)
            .enter()
            .append('circle')
            .attr('r', 5)
            .attr('cx', (d, i) => x(dates[i]))
            .attr('cy', d => y(d));

        axisLayer
            .append('g')
            .attr('class', `${styles.grid}`)
            .call(axisLeft(y).tickSize(-width).tickFormat(''));

        axisLayer
            .append('g')
            .attr('class', `${styles.xAxis}`)
            .attr('transform', `translate(0, ${height})`)
            .call(axisBottom(x).tickArguments(tickArguments));

        axisLayer
            .append('g')
            .attr('class', `${styles.yAxis}`)
            .call(axisLeft(y));
    }

    redrawChart = () => {
        const svg = select(this.svg);
        svg.selectAll('*').remove();
        this.drawChart();
    }

    render() {
        const {
            className: classNameFromProps,
            boundingClientRect: {
                width,
                height,
            },
        } = this.props;

        const className = [
            styles.multiline,
            classNameFromProps,
        ].join(' ');

        return (
            <>
                <svg
                    className={className}
                    ref={(elem) => { this.svg = elem; }}
                    style={{
                        width,
                        height,
                    }}
                />
                <Float>
                    <div
                        ref={(el) => { this.tooltip = el; }}
                        className={styles.tooltip}
                    />
                </Float>
            </>
        );
    }
}

export default Responsive(MultiLineChart);
