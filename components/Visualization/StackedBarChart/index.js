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
import Message from '../../View/Message';

import {
    getStandardFilename,
} from '../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
        }),
    ).isRequired,
    setSaveFunction: PropTypes.func,
    labelName: PropTypes.string.isRequired,
    labelSelector: PropTypes.func.isRequired,
    colorSelector: PropTypes.func,
    className: PropTypes.string,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
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
    colorSelector: undefined,
    margins: {
        top: 10,
        right: 0,
        bottom: 40,
        left: 40,
    },
};

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
        svgsaver.asSvg(svg.node(), `${getStandardFilename('stacked-bar-chart', 'graph')}.svg`);
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

        this.total = data.reduce((acc, curr) => {
            const subtotal = Object.entries(curr)
                .map(([key, value]) => ((key !== labelName) ? value : 0))
                .reduce((a, c) => a + c, 0);
            return acc + subtotal;
        }, 0);

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
            .rangeRound([0, this.width])
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
        const value = node[1] - node[0];
        const percent = Number.isFinite(this.total) ? (value / this.total) * 100 : 0;
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

    drawChart = () => {
        const {
            boundingClientRect,
            data,
            labelSelector,
            colorSelector,
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
        } = this;

        group
            .append('g')
            .selectAll('g')
            .data(series)
            .enter()
            .append('g')
            .attr('fill', d => (colorSelector ? colorSelector(d.key) : colors(d.key)))
            .selectAll('rect')
            .data(d => d)
            .enter()
            .append('rect')
            .attr('cursor', 'pointer')
            .on('mouseover', mouseOverRect)
            .on('mousemove', mouseMove)
            .on('mouseout', mouseOutRect)
            .attr('width', x.bandwidth)
            .attr('x', d => x(labelSelector(d.data)))
            .attr('y', d => y(d[1]))
            .attr('height', d => y(d[0]) - y(d[1]));

        group
            .append('g')
            .attr('class', styles.xAxis)
            .attr('transform', `translate(0, ${y(0)})`)
            .call(axisBottom(x).tickSize(0).tickPadding(6));

        group
            .append('g')
            .attr('class', styles.yAxis)
            .call(axisLeft(y).tickSize(0).tickPadding(6).ticks(5));
    }

    redrawChart = () => {
        const svg = select(this.svg);
        svg.selectAll('*').remove();
        this.drawChart();
    }

    render() {
        const {
            className,
            data,
        } = this.props;

        const svgClassName = [
            'stacked-bar-chart',
            styles.barchart,
            className,
        ].join(' ');

        return (
            <Fragment>
                {data.length === 0 ? (
                    <div className={styles.messageContainer}>
                        <Message>
                            Data not available
                        </Message>
                    </div>
                ) : (
                    <Fragment>
                        <svg
                            ref={(element) => { this.svg = element; }}
                            className={svgClassName}
                        />
                        <Float>
                            <div
                                ref={(el) => { this.tooltip = el; }}
                                className={styles.tooltip}
                            />
                        </Float>
                    </Fragment>
                )}
            </Fragment>
        );
    }
}

export default Responsive(StackedBarChart);
