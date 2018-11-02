import PropTypes from 'prop-types';
import React, {
    PureComponent,
} from 'react';
import { select } from 'd3-selection';
import { utcFormat, utcParse } from 'd3-time-format';
import { scaleUtc } from 'd3-scale';
import { brushX, brushSelection } from 'd3-brush';
import { axisBottom } from 'd3-axis';
import { utcDay } from 'd3-time';

import Responsive from '../../General/Responsive';

import styles from './styles.scss';

const parseTime = utcParse('%H:%M');
const midnight = parseTime('00:00');
const nextday = utcDay.offset(midnight, 1);

const propTypes = {
    className: PropTypes.string,
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    startTime: PropTypes.instanceOf(Date),
    endTime: PropTypes.instanceOf(Date),
    onChange: PropTypes.func,
};

const defaultProps = {
    className: '',
    onChange: () => {},
    startTime: midnight,
    endTime: nextday,
};

class TimeRange extends PureComponent {
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
            startTime,
            endTime,
        } = this.props;

        if (!boundingClientRect.width) {
            return;
        }

        const margin = 20;
        let { width, height } = boundingClientRect;

        width -= (margin * 2);
        height -= (margin * 2);
        const svg = select(this.svg);

        this.x = scaleUtc()
            .range([0, width])
            .domain([midnight, nextday]);

        const brush = brushX()
            .extent([[0, 0], [width, height]])
            .on('brush', (d, i, nodes) => {
                this.brushed(nodes[i]);
            })
            .on('end', (d, i, nodes) => {
                this.brushFinished(nodes[i]);
            });

        const context = svg
            .attr('width', width + (margin * 2))
            .attr('height', height + (margin * 2))
            .attr('transform', `translate(${margin}, ${margin})`);

        context
            .append('g')
            .attr('transform', `translate(${0}, ${height})`)
            .call(axisBottom().scale(this.x).tickFormat(utcFormat('%I %p')));

        const group = context
            .append('g')
            .attr('class', styles.brush)
            .call(brush);

        group
            .select('.selection')
            .attr('class', `selection ${styles.selection}`);

        group
            .call(brush.move, [startTime, endTime].map(this.x));

        group
            .append('text')
            .attr('class', `leftTip ${styles.leftTip}`)
            .attr('x', 0)
            .attr('y', height + (margin * 2))
            .attr('text-anchor', 'middle');

        group
            .append('text')
            .attr('class', `rightTip ${styles.rightTip}`)
            .attr('x', width)
            .attr('y', height + (margin * 2))
            .attr('text-anchor', 'middle');
    }

    formatTimeRange = (range) => {
        const coeff = 1000 * 60 * 5;
        const formatTime = utcFormat('%H:%M %p');
        const formattedTime = range.map((dateTime) => {
            const time = Math.ceil(dateTime.getTime() / coeff) * coeff;
            return formatTime(time);
        });

        return formattedTime;
    }

    brushFinished = (nodes) => {
        const {
            onChange,
        } = this.props;

        const range = brushSelection(nodes)
            .map(this.x.invert);

        onChange(range);
    }

    brushed = (nodes) => {
        const range = brushSelection(nodes)
            .map(this.x.invert);

        const formattedRange = this.formatTimeRange(range);

        select(this.svg)
            .selectAll('text.leftTip')
            .attr('x', this.x(range[0]))
            .text(formattedRange[0]);
        select(this.svg)
            .selectAll('text.rightTip')
            .attr('x', this.x(range[1]))
            .text(formattedRange[1]);
    }

    redrawChart = () => {
        const svg = select(this.svg);
        svg.selectAll('*').remove();
        this.drawChart();
    }

    render() {
        const { className } = this.props;
        const dragStyle = [
            'drag',
            styles.drag,
            className,
        ].join(' ');

        return (
            <svg
                ref={(elem) => { this.svg = elem; }}
                className={dragStyle}
            />
        );
    }
}

export default Responsive(TimeRange);
