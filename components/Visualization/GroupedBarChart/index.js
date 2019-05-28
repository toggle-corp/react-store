import React, {
    PureComponent,
    Fragment,
} from 'react';
import { PropTypes } from 'prop-types';
import {
    select,
} from 'd3-selection';
import {
    scaleOrdinal,
    scaleLinear,
    scaleBand,
} from 'd3-scale';
import {
    axisLeft,
    axisBottom,
} from 'd3-axis';
import { schemeAccent } from 'd3-scale-chromatic';
import { max } from 'd3-array';

import Responsive from '../../General/Responsive';
import Float from '../../View/Float';

import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.shape({
        values: PropTypes.array,
        columns: PropTypes.array,
        colors: PropTypes.object,
    }).isRequired,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    className: PropTypes.string,
    xTickArguments: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    yTickArguments: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
    groupSelector: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    colorScheme: schemeAccent,
    xTickArguments: [],
    yTickArguments: [null, 's'],
    margins: {
        top: 10,
        right: 0,
        bottom: 40,
        left: 40,
    },
};

class GroupedBarChart extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    mouseOverRect = (node, total) => {
        const { value } = node;
        const percent = isFinite(total) ? (value / total) * 100 : 0;
        select(this.tooltip)
            .html(`<span>${value} (${percent.toFixed(1)}%)</span>`)
            .style('display', 'inline-block');
    }

    mouseMove = () => {
        const { height, width } = this.tooltip.getBoundingClientRect();
        select(this.tooltip)
            .style('top', `${event.pageY - height - (height / 2)}px`)
            .style('left', `${event.pageX - (width / 2)}px`);
    }

    mouseOutRect = () => {
        select(this.tooltip)
            .style('display', 'none');
    }

    redrawChart = () => {
        const svg = select(this.svg);
        svg.selectAll('*').remove();
        this.drawChart();
    }

    drawChart = () => {
        const {
            boundingClientRect,
            data,
            groupSelector,
            colorScheme,
            margins,
            xTickArguments,
            yTickArguments,
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

        const { values = [], columns = [], colors = undefined } = data;

        const total = values.map((value) => {
            const subtotal = columns
                .map(column => value[column])
                .reduce((acc, curr) => acc + curr, 0);
            return subtotal;
        }).reduce((tot, current) => tot + current, 0);

        const defaultColor = scaleOrdinal()
            .range(colorScheme);

        const x0 = scaleBand()
            .domain(values.map(d => groupSelector(d)))
            .rangeRound([0, width])
            .paddingInner(0.1);

        const x1 = scaleBand()
            .domain(columns)
            .rangeRound([0, x0.bandwidth()])
            .padding(0.05);

        const y = scaleLinear()
            .domain([0, max(values, d => max(columns, key => d[key]))]).nice()
            .rangeRound([height, 0]);

        const group = select(this.svg)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);


        group
            .append('g')
            .selectAll('g')
            .data(values)
            .enter()
            .append('g')
            .attr('transform', d => `translate(${x0(groupSelector(d))}, 0)`)
            .selectAll('rect')
            .data(d => columns.map(key => ({ key, value: d[key] })))
            .enter()
            .append('rect')
            .attr('class', `bar ${styles.bar}`)
            .on('mouseover', d => this.mouseOverRect(d, total))
            .on('mousemove', this.mouseMove)
            .on('mouseout', this.mouseOutRect)
            .attr('x', d => x1(d.key))
            .attr('y', d => y(d.value))
            .attr('width', x1.bandwidth())
            .attr('height', d => y(0) - y(d.value))
            .attr('fill', d => (colors ? colors[d.key] : defaultColor(d.key)));

        group
            .append('g')
            .attr('class', `x-axis ${styles.xAxis}`)
            .attr('transform', `translate(0, ${height})`)
            .call(axisBottom(x0).tickSize(0).tickPadding(6).ticks(...xTickArguments));

        group
            .append('g')
            .attr('class', `y-axis ${styles.yAxis}`)
            .call(axisLeft(y).ticks(...yTickArguments));
    }

    render() {
        const { className } = this.props;
        const svgClassName = [
            'grouped-bar-chart',
            styles.groupedBarChart,
            className,
        ].join(' ');

        return (
            <Fragment>
                <svg
                    className={svgClassName}
                    ref={(elem) => { this.svg = elem; }}
                />
                <Float>
                    <div
                        ref={(el) => { this.tooltip = el; }}
                        className={styles.tooltip}
                    />
                </Float>
            </Fragment>
        );
    }
}

export default Responsive(GroupedBarChart);
