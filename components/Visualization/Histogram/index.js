import React, {
    PureComponent,
    Fragment,
} from 'react';
import { select, event } from 'd3-selection';
import { format } from 'd3-format';
import {
    extent,
    max,
    min,
    histogram,
} from 'd3-array';
import { scaleLinear } from 'd3-scale';
import {
    axisBottom,
    axisLeft,
} from 'd3-axis';
import { color } from 'd3-color';

import PropTypes from 'prop-types';

import styles from './styles.scss';

import Responsive from '../../General/Responsive';
import Float from '../../View/Float';

const propTypes = {
    data: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    colorRange: PropTypes.arrayOf(PropTypes.string),
    showAxis: PropTypes.bool,
    tooltipContent: PropTypes.func,
    tickFormat: PropTypes.func,
    showTooltip: PropTypes.bool,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),

};

const defaultProps = {
    colorRange: [color('rgba(90, 198, 198, 1)').brighter(), color('rgba(90, 198, 198, 1)').darker()],
    showAxis: true,
    tickFormat: format('0.2f'),
    tooltipContent: undefined,
    showTooltip: true,
    margins: {
        top: 10,
        right: 20,
        bottom: 30,
        left: 30,
    },
};

class Histogram extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    onMouseOver = (d) => {
        const {
            showTooltip,
            tooltipContent,
        } = this.props;

        if (showTooltip) {
            const defaultContent = `
            <span>
              ${d.length}
            </span>
            `;

            const content = tooltipContent ? tooltipContent(d) : defaultContent;

            this.tooltip.innerHTML = content;
            this.tooltip.style.display = 'block';
        }
    }

    onMouseMove = () => {
        const { style } = this.tooltip;

        const { width, height } = this.tooltip.getBoundingClientRect();

        const { pageX: xpos, pageY: ypos } = event;

        style.top = `${ypos - height - 10}px`;
        style.left = `${(xpos - (width / 2))}px`;
    }

    onMouseOut = () => {
        this.tooltip.style.display = 'none';
    }

    drawChart = () => {
        const {
            data,
            colorRange,
            boundingClientRect,
            margins,
            showAxis,
            tickFormat,
        } = this.props;

        if (!boundingClientRect.width || !data || data.length === 0) {
            return;
        }

        const { width: fullWidth, height: fullHeight } = boundingClientRect;
        const {
            left = 0,
            top = 0,
            right = 0,
            bottom = 0,
        } = margins;

        const width = fullWidth - left - right;
        const height = fullHeight - top - bottom;

        if (width < 0 || height < 0) {
            return;
        }

        const x = scaleLinear()
            .domain(extent(data)).nice()
            .rangeRound([0, width]);

        const bins = histogram()
            .domain(x.domain())
            .thresholds(x.ticks(40))(data);

        const y = scaleLinear()
            .domain([0, max(bins, d => d.length)]).nice()
            .range([height, 0]);

        const yMax = max(bins, d => d.length);
        const yMin = min(bins, d => d.length);

        const colorScale = scaleLinear()
            .domain([yMin, yMax])
            .range(colorRange);

        const group = select(this.svg)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        group
            .selectAll('.bar')
            .data(bins)
            .enter()
            .append('g')
            .attr('class', `bar ${styles.bar}`)
            .append('rect')
            .attr('x', d => x(d.x0) + 1)
            .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
            .attr('y', d => y(d.length))
            .attr('height', d => y(0) - y(d.length))
            .attr('fill', d => colorScale(d.length))
            .on('mouseover', this.onMouseOver)
            .on('mousemove', this.onMouseMove)
            .on('mouseout', this.onMouseOut);

        if (showAxis) {
            group
                .append('g')
                .attr('class', `xaxis ${styles.xaxis}`)
                .attr('transform', `translate(0, ${height})`)
                .call(axisBottom(x).tickFormat(tickFormat));

            group
                .append('g')
                .attr('class', `yaxis ${styles.yaxis}`)
                .call(axisLeft(y));
        }
    };

    redrawChart = () => {
        const svg = select(this.svg);
        svg.selectAll('*').remove();
        this.drawChart();
    };

    render() {
        const { className: classNameFromProps } = this.props;

        const className = [
            'histogram',
            styles.histogram,
            classNameFromProps,
        ].join(' ');

        const tooltipClassName = [
            'tooltip',
            styles.tooltip,
        ].join(' ');

        return (
            <Fragment>
                <svg
                    className={className}
                    ref={(elem) => { this.svg = elem; }}
                />
                <Float>
                    <div
                        ref={(el) => { this.tooltip = el; }}
                        className={tooltipClassName}
                    />
                </Float>
            </Fragment>
        );
    }
}

export default Responsive(Histogram);
