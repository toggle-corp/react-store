import React, {
    Fragment,
    PureComponent,
} from 'react';
import {
    select,
    event,
} from 'd3-selection';
import {
    scaleLinear,
    scaleOrdinal,
    scaleBand,
} from 'd3-scale';
import { schemePaired } from 'd3-scale-chromatic';
import { keys } from 'd3-collection';
import {
    stack,
    stackOffsetDiverging,
} from 'd3-shape';
import {
    min, max,
} from 'd3-array';
import {
    axisBottom,
    axisLeft,
} from 'd3-axis';
import { PropTypes } from 'prop-types';
import SvgSaver from 'svgsaver';

import Responsive from '../../General/Responsive';
import Float from '../../View/Float';
import { getStandardFilename } from '../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    /**
     * Size of the parent element/component (passed by the Responsive hoc)
     */
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    /**
     * The data to be visualized
     * Array of categorical data grouped together
     * Example data:
     * [{ state: 'Province 1', river: 10, hills: 20 }, { state: 'Province 2', river: 1, hills: 3}]
     */
    data: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
        }),
    ).isRequired,
    /**
     * Handle save functionality
     */
    setSaveFunction: PropTypes.func,
    /**
     * Name of the group identifier key
     */
    labelName: PropTypes.string.isRequired,
    /**
     * Select the identifier for group
     */
    labelSelector: PropTypes.func.isRequired,
    /**
     * Additional css classes passed from parent
     */
    className: PropTypes.string,
    /**
     * Array of colors as hex color codes.
     * It is used if colors are not provided through data.
     */
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    /**
     * Margins for the chart
     */
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    setSaveFunction: () => {},
    className: '',
    colorScheme: schemePaired,
    margins: {
        top: 10,
        right: 0,
        bottom: 40,
        left: 40,
    },
};

/**
 * StackedBarChart groups multiple variables on top of each other across multiple
 * groups.It helps to visualize the relationship among members of
 * the group and compare the values across multiple groups.
 */
class StackedBarChart extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        if (props.setSaveFunction) {
            props.setSaveFunction(this.save);
        }
    }

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    save = () => {
        const svgsaver = new SvgSaver();
        const svg = select(this.svg);
        svgsaver(svg.node(), `${getStandardFilename('stacked-bar-chart', 'graph')}.svg`);
    }

    init = () => {
        const {
            boundingClientRect,
            margins,
            data,
            colorScheme,
            labelName,
            labelSelector,
        } = this.props;

        const {
            width,
            height,
        } = boundingClientRect;

        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        this.width = width - right - left;
        this.height = height - top - bottom;
        this.group = select(this.svg)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        this.dimensions = keys(data[0]).filter(d => d !== labelName);
        this.labels = data.map(d => labelSelector(d));

        this.series = stack()
            .keys(this.dimensions)
            .offset(stackOffsetDiverging)(data);

        this.x = scaleBand()
            .domain(this.labels)
            .rangeRound([0, width])
            .padding(0.1);

        const stackMin = row => min(row, d => d[0]);
        const stackMax = row => max(row, d => d[1]);
        this.y = scaleLinear()
            .domain([min(this.series, stackMin), max(this.series, stackMax)])
            .rangeRound([height - bottom, top])
            .nice();

        this.colors = scaleOrdinal(colorScheme);
    }

    mouseOverRect = (node) => {
        select(this.tooltip)
            .html(`<span>${node[1] - node[0]}</span>`)
            .transition()
            .duration(50)
            .style('display', 'inline-block');
    }

    mouseMove = () => {
        select(this.tooltip)
            .style('top', `${event.pageY - 30}px`)
            .style('left', `${event.pageX + 20}px`);
    }

    mouseOutRect = () => {
        select(this.tooltip)
            .transition()
            .duration(50)
            .style('display', 'none');
    }

    drawChart = () => {
        const {
            boundingClientRect,
            data,
            labelSelector,
        } = this.props;

        if (!boundingClientRect.width || !data || data.length === 0) {
            return;
        }

        this.init();

        const {
            group,
            series,
            x,
            y,
            colors,
            mouseOverRect,
            mouseMove,
            mouseOutRect,
            width,
        } = this;

        group
            .append('g')
            .selectAll('g')
            .data(series)
            .enter()
            .append('g')
            .attr('fill', d => colors(d.key))
            .selectAll('rect')
            .data(d => d)
            .enter()
            .append('rect')
            .on('mouseover', mouseOverRect)
            .on('mousemove', mouseMove)
            .on('mouseout', mouseOutRect)
            .attr('width', x.bandwidth)
            .attr('x', d => x(labelSelector(d.data)))
            .attr('y', d => y(d[1]))
            .attr('height', d => y(d[0]) - y(d[1]))
            .attr('cursor', 'pointer');

        group
            .append('g')
            .attr('class', styles.xAxis)
            .attr('transform', `translate(0, ${y(0)})`)
            .call(axisBottom(x).tickSize(0).tickPadding(6));

        group
            .append('g')
            .attr('class', styles.yAxis)
            .call(axisLeft(y).tickSize(0).tickPadding(6));

        const legend = group
            .append('g')
            .attr('text-anchor', 'end')
            .selectAll('g')
            .data(this.dimensions)
            .enter()
            .append('g')
            .attr('transform', (d, i) => `translate(0, ${i * 20})`);

        legend
            .append('rect')
            .attr('x', width - 19)
            .attr('width', 19)
            .attr('height', 19)
            .attr('fill', d => colors(d));

        legend
            .append('text')
            .attr('x', width - 24)
            .attr('y', 10)
            .attr('dy', '0.32em')
            .text(d => d);
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

        const svgClassName = [
            'stacked-bar-chart',
            styles.barchart,
            className,
        ].join(' ');

        return (
            <Fragment>
                <svg
                    ref={(element) => { this.svg = element; }}
                    className={svgClassName}
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
            </Fragment>
        );
    }
}

export default Responsive(StackedBarChart);
